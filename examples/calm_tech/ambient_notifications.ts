/**
 * Ambient Notification System for Calm Technology
 *
 * This module implements sophisticated ambient notification patterns that respect
 * human attention and cognitive load while maintaining peripheral awareness.
 *
 * Key Features:
 * - Multi-modal ambient feedback (visual, auditory, tactile, spatial)
 * - Context-aware notification adaptation
 * - Peripheral attention respect
 * - Cognitive load optimization
 * - Privacy-preserving information display
 */

import { MultiAgentCoordinator } from '../../src/core/coordination/MultiAgentCoordinator';
import { EventSystem } from '../../src/core/events/EventSystem';
import { AttentionState, NotificationUrgency, AmbientFeedbackType } from './calm_tech_workflow';
import * as fs from 'fs-extra';
import * as path from 'path';

// Ambient Display Zones for spatial organization
export enum AmbientZone {
  CENTER = 'center',           // High attention area - critical info only
  PERIPHERAL_EDGE = 'peripheral_edge', // Noticeable but not demanding
  BACKGROUND = 'background',    // Subtle, subconscious awareness
  ENVIRONMENTAL = 'environmental' // Physical environment integration
}

// Notification Persistence Levels
export enum PersistenceLevel {
  EPHEMERAL = 'ephemeral',     // Disappears quickly, minimal trace
  PERSISTENT = 'persistent',   // Remains until acknowledged
  CONTEXTUAL = 'contextual',   // Visible only in relevant contexts
  ADAPTIVE = 'adaptive'        // Changes based on attention state
}

// Sensory Channel Configuration
export interface SensoryConfig {
  visual: {
    enabled: boolean;
    opacity: number;        // 0-1, subtle to prominent
    size: 'minimal' | 'small' | 'medium' | 'large';
    animation: 'none' | 'fade' | 'pulse' | 'breathe' | 'drift';
    colorScheme: 'neutral' | 'warm' | 'cool' | 'contextual';
  };
  auditory: {
    enabled: boolean;
    volume: number;         // 0-1, whisper to noticeable
    tone: 'natural' | 'synthetic' | 'musical';
    duration: number;       // milliseconds
    fadeInOut: boolean;
  };
  tactile: {
    enabled: boolean;
    intensity: number;      // 0-1, gentle to noticeable
    pattern: 'single' | 'double' | 'pulse' | 'wave' | 'continuous';
    duration: number;       // milliseconds
  };
  spatial: {
    enabled: boolean;
    position: AmbientZone;
    movement: 'static' | 'subtle' | 'orbital' | 'flow';
    proximity: 'distant' | 'near' | 'intimate';
  };
}

// Context-Aware Notification Rules
export interface NotificationRule {
  id: string;
  name: string;
  conditions: {
    attentionStates: AttentionState[];
    timeOfDay?: { start: string; end: string };
    dayOfWeek?: number[];
    location?: string[];
    activity?: string[];
    cognitiveLoad?: { min: number; max: number };
  };
  actions: {
    urgency: NotificationUrgency;
    sensoryConfig: Partial<SensoryConfig>;
    persistence: PersistenceLevel;
    adaptation: {
      enabled: boolean;
      strategies: string[];
    };
  };
}

/**
 * Ambient Notification Engine: Core system for calm, peripheral-aware notifications
 */
export class AmbientNotificationEngine {
  private activeNotifications: Map<string, AmbientNotification> = new Map();
  private notificationRules: Map<string, NotificationRule> = new Map();
  private sensoryBuffer: Map<AmbientFeedbackType, any[]> = new Map();
  private contextTracker: Map<string, any> = new Map();

  constructor(private coordinator: MultiAgentCoordinator) {
    this.initializeDefaultRules();
    this.initializeSensoryBuffer();
  }

  private initializeDefaultRules(): void {
    // Rule 1: Critical system alerts - always get attention
    this.notificationRules.set('critical_system', {
      id: 'critical_system',
      name: 'Critical System Alerts',
      conditions: {
        attentionStates: [AttentionState.FOCUSED, AttentionState.PERIPHERAL, AttentionState.DISTRACTED]
      },
      actions: {
        urgency: NotificationUrgency.CRITICAL,
        sensoryConfig: {
          visual: { enabled: true, opacity: 0.9, size: 'medium', animation: 'pulse', colorScheme: 'warm' },
          auditory: { enabled: true, volume: 0.6, tone: 'natural', duration: 2000, fadeInOut: true },
          tactile: { enabled: true, intensity: 0.7, pattern: 'pulse', duration: 1500 }
        },
        persistence: PersistenceLevel.PERSISTENT,
        adaptation: { enabled: true, strategies: ['escalate', 'repeat'] }
      }
    });

    // Rule 2: Meeting reminders - respectful of focus time
    this.notificationRules.set('meeting_reminders', {
      id: 'meeting_reminders',
      name: 'Meeting Reminders',
      conditions: {
        attentionStates: [AttentionState.PERIPHERAL, AttentionState.DISTRACTED],
        timeOfDay: { start: '09:00', end: '18:00' },
        activity: ['working', 'planning']
      },
      actions: {
        urgency: NotificationUrgency.IMPORTANT,
        sensoryConfig: {
          visual: { enabled: true, opacity: 0.6, size: 'small', animation: 'fade', colorScheme: 'neutral' },
          spatial: { enabled: true, position: AmbientZone.PERIPHERAL_EDGE, movement: 'static' }
        },
        persistence: PersistenceLevel.CONTEXTUAL,
        adaptation: { enabled: true, strategies: ['defer', 'ambient_only'] }
      }
    });

    // Rule 3: Background status updates - pure ambient awareness
    this.notificationRules.set('background_status', {
      id: 'background_status',
      name: 'Background Status Updates',
      conditions: {
        attentionStates: [AttentionState.PERIPHERAL],
        cognitiveLoad: { min: 0, max: 0.5 }
      },
      actions: {
        urgency: NotificationUrgency.LOW,
        sensoryConfig: {
          visual: { enabled: true, opacity: 0.3, size: 'minimal', animation: 'breathe', colorScheme: 'cool' },
          spatial: { enabled: true, position: AmbientZone.BACKGROUND, movement: 'subtle' }
        },
        persistence: PersistenceLevel.EPHEMERAL,
        adaptation: { enabled: true, strategies: ['fade_away', 'minimize'] }
      }
    });

    // Rule 4: Wellness nudges - gentle health reminders
    this.notificationRules.set('wellness_nudges', {
      id: 'wellness_nudges',
      name: 'Wellness Nudges',
      conditions: {
        attentionStates: [AttentionState.PERIPHERAL],
        timeOfDay: { start: '14:00', end: '16:00' }, // Post-lunch slump
        activity: ['sedentary', 'focused_work']
      },
      actions: {
        urgency: NotificationUrgency.LOW,
        sensoryConfig: {
          tactile: { enabled: true, intensity: 0.3, pattern: 'wave', duration: 3000 },
          visual: { enabled: true, opacity: 0.4, size: 'small', animation: 'drift', colorScheme: 'warm' }
        },
        persistence: PersistenceLevel.ADAPTIVE,
        adaptation: { enabled: true, strategies: ['postpone', 'contextualize'] }
      }
    });
  }

  private initializeSensoryBuffer(): void {
    // Initialize buffers for each sensory channel
    Object.values(AmbientFeedbackType).forEach(type => {
      this.sensoryBuffer.set(type, []);
    });
  }

  /**
   * Send an ambient notification with full context awareness
   */
  async sendAmbientNotification(
    content: string,
    urgency: NotificationUrgency = NotificationUrgency.NORMAL,
    context: {
      userAttention?: AttentionState;
      currentActivity?: string;
      timeOfDay?: string;
      location?: string;
      cognitiveLoad?: number;
    } = {}
  ): Promise<string> {
    const notificationId = `ambient_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Determine applicable rule or use defaults
    const applicableRule = this.findApplicableRule(context);
    const sensoryConfig = applicableRule ?
      await this.adaptSensoryConfig(applicableRule.actions.sensoryConfig, context) :
      this.getDefaultSensoryConfig(urgency);

    // Create the notification object
    const notification = new AmbientNotification(
      notificationId,
      content,
      urgency,
      sensoryConfig,
      applicableRule?.actions.persistence || PersistenceLevel.EPHEMERAL,
      context
    );

    // Apply context-aware adaptations
    await this.applyContextualAdaptations(notification, context);

    // Render through appropriate sensory channels
    await this.renderNotification(notification);

    // Track the notification
    this.activeNotifications.set(notificationId, notification);

    console.log(`🌊 Ambient notification created: ${content} (${urgency}) in zone ${sensoryConfig.spatial.position}`);

    return notificationId;
  }

  private findApplicableRule(context: any): NotificationRule | null {
    for (const rule of this.notificationRules.values()) {
      if (this.ruleMatchesContext(rule, context)) {
        return rule;
      }
    }
    return null;
  }

  private ruleMatchesContext(rule: NotificationRule, context: any): boolean {
    const conditions = rule.conditions;

    // Check attention state
    if (conditions.attentionStates && context.userAttention) {
      if (!conditions.attentionStates.includes(context.userAttention)) {
        return false;
      }
    }

    // Check time of day
    if (conditions.timeOfDay && context.timeOfDay) {
      const currentTime = context.timeOfDay;
      if (currentTime < conditions.timeOfDay.start || currentTime > conditions.timeOfDay.end) {
        return false;
      }
    }

    // Check cognitive load range
    if (conditions.cognitiveLoad && context.cognitiveLoad !== undefined) {
      const load = context.cognitiveLoad;
      if (load < conditions.cognitiveLoad.min || load > conditions.cognitiveLoad.max) {
        return false;
      }
    }

    return true;
  }

  private async adaptSensoryConfig(baseConfig: Partial<SensoryConfig>, context: any): Promise<SensoryConfig> {
    const config: SensoryConfig = this.getDefaultSensoryConfig(NotificationUrgency.NORMAL);

    // Merge with base configuration
    Object.assign(config, baseConfig);

    // Apply context-specific adaptations
    if (context.userAttention === AttentionState.FOCUSED) {
      // Reduce intensity for focused users
      config.visual.opacity *= 0.7;
      config.auditory.volume *= 0.6;
      config.tactile.intensity *= 0.8;
    } else if (context.userAttention === AttentionState.DISTRACTED) {
      // Simplify for distracted users
      config.visual.animation = 'fade';
      config.auditory.duration *= 0.8;
    }

    // Adapt based on cognitive load
    if (context.cognitiveLoad && context.cognitiveLoad > 0.7) {
      // High cognitive load - be more subtle
      config.visual.size = 'minimal';
      config.auditory.enabled = false;
      config.tactile.pattern = 'single';
    }

    return config;
  }

  private getDefaultSensoryConfig(urgency: NotificationUrgency): SensoryConfig {
    const baseOpacity = urgency === NotificationUrgency.CRITICAL ? 0.8 :
                       urgency === NotificationUrgency.IMPORTANT ? 0.6 :
                       urgency === NotificationUrgency.NORMAL ? 0.4 : 0.2;

    return {
      visual: {
        enabled: true,
        opacity: baseOpacity,
        size: urgency === NotificationUrgency.CRITICAL ? 'medium' : 'small',
        animation: urgency === NotificationUrgency.CRITICAL ? 'pulse' : 'fade',
        colorScheme: urgency === NotificationUrgency.CRITICAL ? 'warm' : 'neutral'
      },
      auditory: {
        enabled: urgency !== NotificationUrgency.LOW,
        volume: baseOpacity * 0.5,
        tone: 'natural',
        duration: 1500,
        fadeInOut: true
      },
      tactile: {
        enabled: urgency === NotificationUrgency.CRITICAL || urgency === NotificationUrgency.IMPORTANT,
        intensity: baseOpacity * 0.6,
        pattern: 'single',
        duration: 1000
      },
      spatial: {
        enabled: true,
        position: urgency === NotificationUrgency.CRITICAL ? AmbientZone.CENTER :
                 urgency === NotificationUrgency.IMPORTANT ? AmbientZone.PERIPHERAL_EDGE :
                 AmbientZone.BACKGROUND,
        movement: 'static',
        proximity: 'near'
      }
    };
  }

  private async applyContextualAdaptations(notification: AmbientNotification, context: any): Promise<void> {
    // Adapt based on time of day
    if (context.timeOfDay) {
      const hour = parseInt(context.timeOfDay.split(':')[0]);
      if (hour >= 22 || hour <= 7) {
        // Night time - be extra gentle
        notification.sensoryConfig.visual.opacity *= 0.6;
        notification.sensoryConfig.auditory.volume *= 0.5;
        notification.sensoryConfig.visual.colorScheme = 'warm';
      }
    }

    // Adapt based on location
    if (context.location === 'meeting' || context.location === 'presentation') {
      // Professional setting - minimize auditory and tactile
      notification.sensoryConfig.auditory.enabled = false;
      notification.sensoryConfig.tactile.enabled = false;
      notification.sensoryConfig.visual.animation = 'fade';
    }

    // Adapt based on activity
    if (context.currentActivity === 'deep_work' || context.currentActivity === 'creative') {
      // Creative/productive work - use only visual ambient cues
      notification.sensoryConfig.auditory.enabled = false;
      notification.sensoryConfig.tactile.enabled = false;
      notification.sensoryConfig.visual.position = AmbientZone.BACKGROUND;
    }
  }

  private async renderNotification(notification: AmbientNotification): Promise<void> {
    const config = notification.sensoryConfig;

    // Render visual component
    if (config.visual.enabled) {
      await this.renderVisualAmbient(notification.id, notification.content, config.visual);
    }

    // Render auditory component
    if (config.auditory.enabled) {
      await this.renderAuditoryAmbient(notification.id, config.auditory);
    }

    // Render tactile component
    if (config.tactile.enabled) {
      await this.renderTactileAmbient(notification.id, config.tactile);
    }

    // Render spatial component
    if (config.spatial.enabled) {
      await this.renderSpatialAmbient(notification.id, config.spatial);
    }
  }

  private async renderVisualAmbient(id: string, content: string, config: SensoryConfig['visual']): Promise<void> {
    // Create ambient visual element
    const element = {
      id,
      content,
      opacity: config.opacity,
      size: config.size,
      animation: config.animation,
      colorScheme: config.colorScheme,
      timestamp: Date.now()
    };

    // Add to visual buffer for coordinated rendering
    const visualBuffer = this.sensoryBuffer.get(AmbientFeedbackType.VISUAL) || [];
    visualBuffer.push(element);

    // Keep buffer size manageable
    if (visualBuffer.length > 10) {
      visualBuffer.shift();
    }

    this.sensoryBuffer.set(AmbientFeedbackType.VISUAL, visualBuffer);

    console.log(`🎨 Visual ambient: ${content} (${config.opacity} opacity, ${config.animation} animation)`);

    // Publish event for external visual systems
    await this.coordinator.publishEvent('ambient:visual:rendered', {
      notificationId: id,
      content,
      config,
      timestamp: new Date().toISOString()
    });
  }

  private async renderAuditoryAmbient(id: string, config: SensoryConfig['auditory']): Promise<void> {
    const soundProfile = {
      id,
      tone: config.tone,
      volume: config.volume,
      duration: config.duration,
      fadeInOut: config.fadeInOut,
      timestamp: Date.now()
    };

    const auditoryBuffer = this.sensoryBuffer.get(AmbientFeedbackType.AUDITORY) || [];
    auditoryBuffer.push(soundProfile);

    if (auditoryBuffer.length > 5) {
      auditoryBuffer.shift();
    }

    this.sensoryBuffer.set(AmbientFeedbackType.AUDITORY, auditoryBuffer);

    console.log(`🔊 Auditory ambient: ${config.tone} tone (${config.volume} volume, ${config.duration}ms)`);

    await this.coordinator.publishEvent('ambient:auditory:rendered', {
      notificationId: id,
      soundProfile,
      timestamp: new Date().toISOString()
    });
  }

  private async renderTactileAmbient(id: string, config: SensoryConfig['tactile']): Promise<void> {
    const tactileProfile = {
      id,
      intensity: config.intensity,
      pattern: config.pattern,
      duration: config.duration,
      timestamp: Date.now()
    };

    const tactileBuffer = this.sensoryBuffer.get(AmbientFeedbackType.TACTILE) || [];
    tactileBuffer.push(tactileProfile);

    if (tactileBuffer.length > 3) {
      tactileBuffer.shift();
    }

    this.sensoryBuffer.set(AmbientFeedbackType.TACTILE, tactileBuffer);

    console.log(`📳 Tactile ambient: ${config.pattern} pattern (${config.intensity} intensity)`);

    await this.coordinator.publishEvent('ambient:tactile:rendered', {
      notificationId: id,
      tactileProfile,
      timestamp: new Date().toISOString()
    });
  }

  private async renderSpatialAmbient(id: string, config: SensoryConfig['spatial']): Promise<void> {
    const spatialProfile = {
      id,
      position: config.position,
      movement: config.movement,
      proximity: config.proximity,
      timestamp: Date.now()
    };

    console.log(`📐 Spatial ambient: ${config.position} zone (${config.movement} movement)`);

    await this.coordinator.publishEvent('ambient:spatial:rendered', {
      notificationId: id,
      spatialProfile,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Update user context for adaptive notifications
   */
  async updateContext(key: string, value: any): Promise<void> {
    this.contextTracker.set(key, value);

    // Re-evaluate active notifications based on new context
    await this.reevaluateActiveNotifications();
  }

  private async reevaluateActiveNotifications(): Promise<void> {
    const context = Object.fromEntries(this.contextTracker);

    for (const [id, notification] of this.activeNotifications) {
      if (notification.persistence === PersistenceLevel.ADAPTIVE) {
        // Adapt notification based on current context
        const adaptedConfig = await this.adaptSensoryConfig(notification.sensoryConfig, context);
        notification.sensoryConfig = adaptedConfig;

        // Re-render if still active
        await this.renderNotification(notification);
      }
    }
  }

  /**
   * Clean up expired notifications
   */
  async cleanupExpiredNotifications(): Promise<void> {
    const now = Date.now();
    const toRemove: string[] = [];

    for (const [id, notification] of this.activeNotifications) {
      const age = now - notification.createdAt.getTime();

      // Determine expiration based on persistence level and urgency
      let expirationTime = 5000; // 5 seconds default

      switch (notification.persistence) {
        case PersistenceLevel.EPHEMERAL:
          expirationTime = 3000;
          break;
        case PersistenceLevel.PERSISTENT:
          expirationTime = 30000;
          break;
        case PersistenceLevel.CONTEXTUAL:
          expirationTime = 15000;
          break;
        case PersistenceLevel.ADAPTIVE:
          expirationTime = notification.urgency === NotificationUrgency.CRITICAL ? 10000 : 7000;
          break;
      }

      if (age > expirationTime) {
        toRemove.push(id);
      }
    }

    // Remove expired notifications
    for (const id of toRemove) {
      this.activeNotifications.delete(id);
      console.log(`🧹 Cleaned up expired notification: ${id}`);
    }

    // Clean up sensory buffers
    for (const [type, buffer] of this.sensoryBuffer) {
      const filteredBuffer = buffer.filter(item => {
        const age = now - item.timestamp;
        return age < 10000; // Keep items for 10 seconds max
      });
      this.sensoryBuffer.set(type, filteredBuffer);
    }
  }

  /**
   * Get current system state for monitoring
   */
  getSystemState(): any {
    return {
      activeNotifications: this.activeNotifications.size,
      sensoryBuffers: Object.fromEntries(
        Array.from(this.sensoryBuffer.entries()).map(([type, buffer]) => [type, buffer.length])
      ),
      context: Object.fromEntries(this.contextTracker),
      rules: this.notificationRules.size,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Individual Ambient Notification Object
 */
export class AmbientNotification {
  public createdAt: Date;
  public lastUpdated: Date;
  public isActive: boolean = true;

  constructor(
    public id: string,
    public content: string,
    public urgency: NotificationUrgency,
    public sensoryConfig: SensoryConfig,
    public persistence: PersistenceLevel,
    public context: any
  ) {
    this.createdAt = new Date();
    this.lastUpdated = new Date();
  }

  updateContent(newContent: string): void {
    this.content = newContent;
    this.lastUpdated = new Date();
  }

  updateSensoryConfig(newConfig: Partial<SensoryConfig>): void {
    Object.assign(this.sensoryConfig, newConfig);
    this.lastUpdated = new Date();
  }

  markInactive(): void {
    this.isActive = false;
    this.lastUpdated = new Date();
  }
}

/**
 * Ambient Notification Demonstrator
 */
export async function demonstrateAmbientNotifications(): Promise<void> {
  console.log('🌊 Ambient Notification System Demonstration');
  console.log('='.repeat(50));

  const coordinator = new MultiAgentCoordinator();
  const engine = new AmbientNotificationEngine(coordinator);

  try {
    // Simulate different user contexts and notification scenarios
    const scenarios = [
      {
        name: 'Work Focus Time',
        context: {
          userAttention: AttentionState.FOCUSED,
          currentActivity: 'deep_work',
          timeOfDay: '14:30',
          cognitiveLoad: 0.8
        },
        notifications: [
          { content: 'Meeting in 15 minutes', urgency: NotificationUrgency.IMPORTANT },
          { content: 'Code compilation completed', urgency: NotificationUrgency.LOW }
        ]
      },
      {
        name: 'Peripheral Awareness',
        context: {
          userAttention: AttentionState.PERIPHERAL,
          currentActivity: 'planning',
          timeOfDay: '10:00',
          cognitiveLoad: 0.3
        },
        notifications: [
          { content: 'Team sync at 11:00', urgency: NotificationUrgency.NORMAL },
          { content: 'Weekly report ready', urgency: NotificationUrgency.LOW }
        ]
      },
      {
        name: 'Evening Wind Down',
        context: {
          userAttention: AttentionState.PERIPHERAL,
          currentActivity: 'reading',
          timeOfDay: '20:30',
          cognitiveLoad: 0.2
        },
        notifications: [
          { content: 'Tomorrow\'s weather looks good', urgency: NotificationUrgency.LOW }
        ]
      }
    ];

    for (const scenario of scenarios) {
      console.log(`\n📋 Scenario: ${scenario.name}`);
      console.log('-'.repeat(30));

      // Update context
      for (const [key, value] of Object.entries(scenario.context)) {
        await engine.updateContext(key, value);
      }

      // Send notifications
      for (const notification of scenario.notifications) {
        await engine.sendAmbientNotification(
          notification.content,
          notification.urgency,
          scenario.context
        );
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      // Show system state
      const state = engine.getSystemState();
      console.log(`Active notifications: ${state.activeNotifications}`);

      // Cleanup
      await engine.cleanupExpiredNotifications();
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n✅ Ambient notification demonstration completed!');

  } catch (error) {
    console.error('❌ Ambient notification demonstration failed:', error);
    throw error;
  }
}

// Export for use in other modules
export { AmbientNotificationEngine, NotificationRule, SensoryConfig };

// Run demonstration if called directly
if (require.main === module) {
  demonstrateAmbientNotifications()
    .then(() => {
      console.log('\n🎉 Ambient notification demo completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Ambient notification demo failed:', error);
      process.exit(1);
    });
}
