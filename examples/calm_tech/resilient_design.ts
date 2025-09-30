/**
 * Resilient Design System for Calm Technology
 *
 * This module implements graceful degradation patterns that ensure technology
 * continues to function even when systems fail or connectivity is lost.
 * Demonstrates Principle VI: Technology should work even when it fails.
 *
 * Key Features:
 * - Graceful degradation strategies
 * - Fallback mode management
 * - System recovery mechanisms
 * - Calm failure handling
 * - Progressive enhancement patterns
 */

import { MultiAgentCoordinator } from '../../src/core/coordination/MultiAgentCoordinator';
import { EventSystem } from '../../src/core/events/EventSystem';
import { AttentionState, AmbientFeedbackType } from './calm_tech_workflow';
import { AmbientNotificationEngine, SensoryConfig, NotificationUrgency } from './ambient_notifications';
import * as fs from 'fs-extra';
import * as path from 'path';

// System Health Levels
export enum SystemHealth {
  OPTIMAL = 'optimal',        // Full functionality
  DEGRADED = 'degraded',      // Reduced functionality but operational
  CRITICAL = 'critical',      // Minimal functionality
  FAILURE = 'failure',        // Core functions only
  RECOVERY = 'recovery'       // Attempting to restore functionality
}

// Degradation Triggers
export enum DegradationTrigger {
  CONNECTIVITY_LOSS = 'connectivity_loss',
  RESOURCE_EXHAUSTION = 'resource_exhaustion',
  COMPONENT_FAILURE = 'component_failure',
  EXTERNAL_DEPENDENCY = 'external_dependency',
  PERFORMANCE_DEGRADATION = 'performance_degradation',
  SECURITY_INCIDENT = 'security_incident'
}

// Recovery Strategies
export enum RecoveryStrategy {
  AUTOMATIC_RETRY = 'automatic_retry',
  CIRCUIT_BREAKER = 'circuit_breaker',
  FAILOVER = 'failover',
  GRACEFUL_SHUTDOWN = 'graceful_shutdown',
  MANUAL_INTERVENTION = 'manual_intervention'
}

// Fallback Modes for different system components
export interface FallbackMode {
  id: string;
  name: string;
  description: string;
  triggers: DegradationTrigger[];
  degradationLevel: SystemHealth;
  functionality: {
    retained: string[];      // What still works
    disabled: string[];      // What's turned off
    modified: string[];      // What's changed
  };
  userExperience: {
    visual: string[];
    interaction: string[];
    performance: string[];
  };
  recovery: {
    strategy: RecoveryStrategy;
    estimatedTime: number;   // minutes
    successRate: number;     // 0-1
  };
}

/**
 * Resilient System Manager: Core system for graceful degradation and recovery
 */
export class ResilientSystemManager {
  private currentHealth: SystemHealth = SystemHealth.OPTIMAL;
  private activeFallbacks: Map<string, FallbackMode> = new Map();
  private degradationHistory: any[] = [];
  private recoveryAttempts: Map<string, any> = new Map();
  private systemMetrics: Map<string, number> = new Map();

  constructor(
    private coordinator: MultiAgentCoordinator,
    private notificationEngine?: AmbientNotificationEngine
  ) {
    this.initializeFallbackModes();
    this.initializeSystemMetrics();
  }

  private initializeFallbackModes(): void {
    // Connectivity fallback modes
    const connectivityFallbacks: FallbackMode[] = [
      {
        id: 'offline_queue',
        name: 'Offline Queue Mode',
        description: 'Queues actions for when connectivity returns',
        triggers: [DegradationTrigger.CONNECTIVITY_LOSS],
        degradationLevel: SystemHealth.DEGRADED,
        functionality: {
          retained: ['local_storage', 'offline_actions', 'cached_data'],
          disabled: ['real_time_sync', 'cloud_backup', 'remote_collaboration'],
          modified: ['delayed_notifications', 'local_only_features']
        },
        userExperience: {
          visual: ['offline_indicator', 'queue_status', 'cached_content'],
          interaction: ['deferred_actions', 'local_operations', 'manual_sync'],
          performance: ['reduced_speed', 'local_processing', 'background_sync']
        },
        recovery: {
          strategy: RecoveryStrategy.AUTOMATIC_RETRY,
          estimatedTime: 5,
          successRate: 0.9
        }
      },
      {
        id: 'cached_local',
        name: 'Cached Local Mode',
        description: 'Uses cached data for essential functionality',
        triggers: [DegradationTrigger.EXTERNAL_DEPENDENCY],
        degradationLevel: SystemHealth.CRITICAL,
        functionality: {
          retained: ['cached_content', 'local_computation', 'basic_features'],
          disabled: ['external_apis', 'real_time_data', 'cloud_features'],
          modified: ['stale_data_warnings', 'limited_functionality']
        },
        userExperience: {
          visual: ['cache_status', 'stale_data_indicators', 'limited_mode_banner'],
          interaction: ['cached_responses', 'local_actions', 'sync_prompts'],
          performance: ['slower_responses', 'reduced_accuracy', 'local_processing']
        },
        recovery: {
          strategy: RecoveryStrategy.CIRCUIT_BREAKER,
          estimatedTime: 10,
          successRate: 0.8
        }
      }
    ];

    // Processing fallback modes
    const processingFallbacks: FallbackMode[] = [
      {
        id: 'sequential_processing',
        name: 'Sequential Processing Mode',
        description: 'Processes tasks sequentially instead of parallel',
        triggers: [DegradationTrigger.RESOURCE_EXHAUSTION],
        degradationLevel: SystemHealth.DEGRADED,
        functionality: {
          retained: ['all_core_features', 'basic_processing', 'essential_tasks'],
          disabled: ['parallel_processing', 'batch_operations', 'heavy_computation'],
          modified: ['slower_performance', 'queue_management', 'priority_handling']
        },
        userExperience: {
          visual: ['progress_indicators', 'queue_status', 'processing_speed_indicator'],
          interaction: ['normal_ui', 'task_queuing', 'priority_controls'],
          performance: ['slower_execution', 'maintained_accuracy', 'resource_conservation']
        },
        recovery: {
          strategy: RecoveryStrategy.AUTOMATIC_RETRY,
          estimatedTime: 2,
          successRate: 0.95
        }
      },
      {
        id: 'essential_only',
        name: 'Essential Functions Only',
        description: 'Only critical features remain active',
        triggers: [DegradationTrigger.COMPONENT_FAILURE],
        degradationLevel: SystemHealth.CRITICAL,
        functionality: {
          retained: ['core_features', 'critical_data', 'essential_ui'],
          disabled: ['advanced_features', 'non_essential_ui', 'background_tasks'],
          modified: ['simplified_interface', 'reduced_options', 'essential_only']
        },
        userExperience: {
          visual: ['minimal_interface', 'essential_elements_only', 'clear_priority_indicators'],
          interaction: ['limited_options', 'essential_actions', 'clear_guidance'],
          performance: ['fast_essential', 'no_background', 'focused_functionality']
        },
        recovery: {
          strategy: RecoveryStrategy.FAILOVER,
          estimatedTime: 15,
          successRate: 0.7
        }
      }
    ];

    // Interface fallback modes
    const interfaceFallbacks: FallbackMode[] = [
      {
        id: 'basic_interactive',
        name: 'Basic Interactive Mode',
        description: 'Simplified interface with core functionality',
        triggers: [DegradationTrigger.PERFORMANCE_DEGRADATION],
        degradationLevel: SystemHealth.DEGRADED,
        functionality: {
          retained: ['core_ui_elements', 'essential_interactions', 'basic_navigation'],
          disabled: ['animations', 'advanced_visuals', 'non_essential_features'],
          modified: ['simplified_layout', 'basic_styling', 'essential_content']
        },
        userExperience: {
          visual: ['simple_layout', 'basic_colors', 'clear_hierarchy'],
          interaction: ['standard_inputs', 'basic_responses', 'clear_feedback'],
          performance: ['fast_loading', 'smooth_interaction', 'reliable_responses']
        },
        recovery: {
          strategy: RecoveryStrategy.AUTOMATIC_RETRY,
          estimatedTime: 1,
          successRate: 0.98
        }
      },
      {
        id: 'ambient_indicators',
        name: 'Ambient Indicators Only',
        description: 'Information through peripheral, ambient means only',
        triggers: [DegradationTrigger.SECURITY_INCIDENT],
        degradationLevel: SystemHealth.CRITICAL,
        functionality: {
          retained: ['ambient_feedback', 'status_indicators', 'essential_alerts'],
          disabled: ['interactive_elements', 'detailed_information', 'advanced_features'],
          modified: ['visual_cues_only', 'minimal_text', 'icon_based']
        },
        userExperience: {
          visual: ['icon_indicators', 'color_coding', 'progress_bars'],
          interaction: ['passive_awareness', 'minimal_interaction', 'status_only'],
          performance: ['ultra_fast', 'low_resource', 'always_available']
        },
        recovery: {
          strategy: RecoveryStrategy.MANUAL_INTERVENTION,
          estimatedTime: 30,
          successRate: 0.6
        }
      }
    ];

    // Register all fallback modes
    [...connectivityFallbacks, ...processingFallbacks, ...interfaceFallbacks].forEach(mode => {
      this.activeFallbacks.set(mode.id, mode);
    });
  }

  private initializeSystemMetrics(): void {
    // Initialize baseline system metrics
    this.systemMetrics.set('connectivity', 1.0);      // 0-1, 1 = full connectivity
    this.systemMetrics.set('processing', 1.0);        // 0-1, 1 = full processing capacity
    this.systemMetrics.set('memory', 1.0);           // 0-1, 1 = ample memory
    this.systemMetrics.set('interface', 1.0);        // 0-1, 1 = full UI responsiveness
    this.systemMetrics.set('external_deps', 1.0);    // 0-1, 1 = all external services available
  }

  /**
   * Handle system degradation gracefully
   */
  async handleDegradation(
    trigger: DegradationTrigger,
    severity: 'minor' | 'major' | 'critical',
    affectedComponent?: string
  ): Promise<void> {
    console.log(`🔧 Handling ${severity} degradation: ${trigger} (${affectedComponent || 'general'})`);

    // Update system health
    this.updateSystemHealth(trigger, severity);

    // Find appropriate fallback modes
    const applicableFallbacks = this.findApplicableFallbacks(trigger, severity);

    // Apply fallback modes in order of priority
    for (const fallback of applicableFallbacks) {
      await this.applyFallbackMode(fallback, trigger, severity);
    }

    // Record degradation event
    this.degradationHistory.push({
      trigger,
      severity,
      affectedComponent,
      fallbackModes: applicableFallbacks.map(f => f.id),
      timestamp: new Date().toISOString(),
      systemHealth: this.currentHealth
    });

    // Notify user through calm, ambient means
    if (this.notificationEngine) {
      await this.sendDegradationNotification(trigger, severity, applicableFallbacks);
    }

    // Publish system event
    await this.coordinator.publishEvent('system:degraded', {
      trigger,
      severity,
      affectedComponent,
      fallbackModes: applicableFallbacks.map(f => f.id),
      currentHealth: this.currentHealth,
      timestamp: new Date().toISOString()
    });
  }

  private updateSystemHealth(trigger: DegradationTrigger, severity: string): void {
    // Map severity to health impact
    const healthImpact = {
      'minor': 0.1,
      'major': 0.3,
      'critical': 0.5
    };

    const impact = healthImpact[severity as keyof typeof healthImpact] || 0.1;

    // Update relevant metrics based on trigger
    switch (trigger) {
      case DegradationTrigger.CONNECTIVITY_LOSS:
        this.systemMetrics.set('connectivity', Math.max(0, this.systemMetrics.get('connectivity')! - impact));
        break;
      case DegradationTrigger.RESOURCE_EXHAUSTION:
      case DegradationTrigger.COMPONENT_FAILURE:
        this.systemMetrics.set('processing', Math.max(0, this.systemMetrics.get('processing')! - impact));
        break;
      case DegradationTrigger.EXTERNAL_DEPENDENCY:
        this.systemMetrics.set('external_deps', Math.max(0, this.systemMetrics.get('external_deps')! - impact));
        break;
      case DegradationTrigger.PERFORMANCE_DEGRADATION:
        this.systemMetrics.set('interface', Math.max(0, this.systemMetrics.get('interface')! - impact));
        break;
    }

    // Determine overall system health
    const avgHealth = Array.from(this.systemMetrics.values()).reduce((sum, val) => sum + val, 0) / this.systemMetrics.size;

    if (avgHealth >= 0.8) {
      this.currentHealth = SystemHealth.OPTIMAL;
    } else if (avgHealth >= 0.6) {
      this.currentHealth = SystemHealth.DEGRADED;
    } else if (avgHealth >= 0.4) {
      this.currentHealth = SystemHealth.CRITICAL;
    } else {
      this.currentHealth = SystemHealth.FAILURE;
    }
  }

  private findApplicableFallbacks(trigger: DegradationTrigger, severity: string): FallbackMode[] {
    const applicableModes: FallbackMode[] = [];

    for (const mode of this.activeFallbacks.values()) {
      if (mode.triggers.includes(trigger)) {
        // Filter by severity appropriateness
        const isAppropriate = this.isFallbackAppropriateForSeverity(mode, severity);
        if (isAppropriate) {
          applicableModes.push(mode);
        }
      }
    }

    // Sort by degradation level (least degraded first for graceful degradation)
    return applicableModes.sort((a, b) => {
      const levelOrder = { [SystemHealth.OPTIMAL]: 0, [SystemHealth.DEGRADED]: 1, [SystemHealth.CRITICAL]: 2, [SystemHealth.FAILURE]: 3 };
      return levelOrder[a.degradationLevel] - levelOrder[b.degradationLevel];
    });
  }

  private isFallbackAppropriateForSeverity(mode: FallbackMode, severity: string): boolean {
    switch (severity) {
      case 'minor':
        return mode.degradationLevel === SystemHealth.DEGRADED || mode.degradationLevel === SystemHealth.OPTIMAL;
      case 'major':
        return mode.degradationLevel === SystemHealth.DEGRADED || mode.degradationLevel === SystemHealth.CRITICAL;
      case 'critical':
        return true; // All modes appropriate for critical failures
      default:
        return true;
    }
  }

  private async applyFallbackMode(
    mode: FallbackMode,
    trigger: DegradationTrigger,
    severity: string
  ): Promise<void> {
    console.log(`🔄 Applying fallback mode: ${mode.name} (${mode.id})`);

    // Apply functionality changes
    await this.applyFunctionalityChanges(mode);

    // Apply user experience changes
    await this.applyUserExperienceChanges(mode);

    // Set up recovery strategy
    await this.setupRecoveryStrategy(mode, trigger);

    console.log(`✅ Fallback mode applied: ${mode.name}`);
  }

  private async applyFunctionalityChanges(mode: FallbackMode): Promise<void> {
    const { retained, disabled, modified } = mode.functionality;

    console.log(`  → Retained: ${retained.join(', ')}`);
    console.log(`  → Disabled: ${disabled.join(', ')}`);
    console.log(`  → Modified: ${modified.join(', ')}`);

    // Publish functionality change events
    await this.coordinator.publishEvent('functionality:changed', {
      fallbackMode: mode.id,
      retained,
      disabled,
      modified,
      timestamp: new Date().toISOString()
    });
  }

  private async applyUserExperienceChanges(mode: FallbackMode): Promise<void> {
    const { visual, interaction, performance } = mode.userExperience;

    console.log(`  → Visual: ${visual.join(', ')}`);
    console.log(`  → Interaction: ${interaction.join(', ')}`);
    console.log(`  → Performance: ${performance.join(', ')}`);

    // Publish UX change events
    await this.coordinator.publishEvent('ux:adapted', {
      fallbackMode: mode.id,
      visual,
      interaction,
      performance,
      timestamp: new Date().toISOString()
    });
  }

  private async setupRecoveryStrategy(mode: FallbackMode, trigger: DegradationTrigger): Promise<void> {
    const { strategy, estimatedTime, successRate } = mode.recovery;

    console.log(`  → Recovery: ${strategy} (${estimatedTime}min, ${(successRate * 100).toFixed(1)}% success)`);

    // Set up automatic recovery based on strategy
    switch (strategy) {
      case RecoveryStrategy.AUTOMATIC_RETRY:
        await this.scheduleAutomaticRetry(trigger, estimatedTime);
        break;
      case RecoveryStrategy.CIRCUIT_BREAKER:
        await this.setupCircuitBreaker(trigger);
        break;
      case RecoveryStrategy.FAILOVER:
        await this.setupFailover(trigger);
        break;
    }
  }

  private async scheduleAutomaticRetry(trigger: DegradationTrigger, delayMinutes: number): Promise<void> {
    const retryId = `retry_${trigger}_${Date.now()}`;

    setTimeout(async () => {
      await this.attemptRecovery(trigger, retryId);
    }, delayMinutes * 60 * 1000);

    this.recoveryAttempts.set(retryId, {
      trigger,
      strategy: RecoveryStrategy.AUTOMATIC_RETRY,
      scheduledTime: new Date(Date.now() + delayMinutes * 60 * 1000).toISOString(),
      status: 'scheduled'
    });

    console.log(`⏰ Scheduled automatic retry for ${trigger} in ${delayMinutes} minutes`);
  }

  private async setupCircuitBreaker(trigger: DegradationTrigger): Promise<void> {
    const circuitId = `circuit_${trigger}_${Date.now()}`;

    // Implement circuit breaker pattern
    this.recoveryAttempts.set(circuitId, {
      trigger,
      strategy: RecoveryStrategy.CIRCUIT_BREAKER,
      status: 'open', // Start open (failing)
      failureCount: 0,
      lastFailure: new Date().toISOString(),
      nextRetry: new Date(Date.now() + 5 * 60 * 1000).toISOString() // Retry in 5 minutes
    });

    console.log(`🔌 Circuit breaker opened for ${trigger}`);
  }

  private async setupFailover(trigger: DegradationTrigger): Promise<void> {
    const failoverId = `failover_${trigger}_${Date.now()}`;

    // Implement failover logic
    this.recoveryAttempts.set(failoverId, {
      trigger,
      strategy: RecoveryStrategy.FAILOVER,
      status: 'active',
      primarySystem: 'degraded',
      backupSystem: 'standby',
      switchTime: new Date().toISOString()
    });

    console.log(`🔄 Failover activated for ${trigger}`);
  }

  private async sendDegradationNotification(
    trigger: DegradationTrigger,
    severity: string,
    fallbacks: FallbackMode[]
  ): Promise<void> {
    if (!this.notificationEngine) return;

    const urgency = severity === 'critical' ? NotificationUrgency.CRITICAL :
                   severity === 'major' ? NotificationUrgency.IMPORTANT :
                   NotificationUrgency.NORMAL;

    const message = `System ${severity} degradation: ${trigger}. Applied ${fallbacks.length} fallback mode(s).`;

    await this.notificationEngine.sendAmbientNotification(
      message,
      urgency,
      {
        userAttention: AttentionState.PERIPHERAL,
        currentActivity: 'system_monitoring'
      }
    );
  }

  /**
   * Attempt system recovery
   */
  async attemptRecovery(trigger: DegradationTrigger, attemptId?: string): Promise<boolean> {
    console.log(`🔄 Attempting recovery from ${trigger} degradation`);

    const attempt = attemptId ? this.recoveryAttempts.get(attemptId) : null;

    // Simulate recovery process with realistic success rates
    const baseSuccessRate = 0.7;
    const recoverySuccess = Math.random() < baseSuccessRate;

    if (recoverySuccess) {
      await this.handleSuccessfulRecovery(trigger, attemptId);
    } else {
      await this.handleFailedRecovery(trigger, attemptId);
    }

    return recoverySuccess;
  }

  private async handleSuccessfulRecovery(trigger: DegradationTrigger, attemptId?: string): Promise<void> {
    console.log(`✅ Recovery successful for ${trigger}`);

    // Restore system metrics
    this.restoreSystemMetrics(trigger);

    // Update recovery attempt status
    if (attemptId) {
      const attempt = this.recoveryAttempts.get(attemptId);
      if (attempt) {
        attempt.status = 'successful';
        attempt.recoveryTime = new Date().toISOString();
      }
    }

    // Notify of successful recovery
    if (this.notificationEngine) {
      await this.notificationEngine.sendAmbientNotification(
        `System recovery completed for ${trigger}`,
        NotificationUrgency.LOW,
        { userAttention: AttentionState.PERIPHERAL }
      );
    }

    await this.coordinator.publishEvent('system:recovered', {
      trigger,
      attemptId,
      recoveryTime: new Date().toISOString(),
      newHealth: this.currentHealth,
      timestamp: new Date().toISOString()
    });
  }

  private async handleFailedRecovery(trigger: DegradationTrigger, attemptId?: string): Promise<void> {
    console.log(`❌ Recovery failed for ${trigger}`);

    // Update attempt status
    if (attemptId) {
      const attempt = this.recoveryAttempts.get(attemptId);
      if (attempt) {
        attempt.status = 'failed';
        attempt.failureCount = (attempt.failureCount || 0) + 1;
        attempt.lastFailure = new Date().toISOString();

        // Schedule next retry if using circuit breaker
        if (attempt.strategy === RecoveryStrategy.CIRCUIT_BREAKER) {
          const nextRetryDelay = Math.min(5 * Math.pow(2, attempt.failureCount), 30); // Exponential backoff, max 30 min
          attempt.nextRetry = new Date(Date.now() + nextRetryDelay * 60 * 1000).toISOString();
        }
      }
    }

    await this.coordinator.publishEvent('system:recovery:failed', {
      trigger,
      attemptId,
      failureCount: attempt?.failureCount || 1,
      nextRetry: attempt?.nextRetry,
      timestamp: new Date().toISOString()
    });
  }

  private restoreSystemMetrics(trigger: DegradationTrigger): void {
    // Restore metrics based on trigger type
    switch (trigger) {
      case DegradationTrigger.CONNECTIVITY_LOSS:
        this.systemMetrics.set('connectivity', 1.0);
        break;
      case DegradationTrigger.RESOURCE_EXHAUSTION:
      case DegradationTrigger.COMPONENT_FAILURE:
        this.systemMetrics.set('processing', 1.0);
        break;
      case DegradationTrigger.EXTERNAL_DEPENDENCY:
        this.systemMetrics.set('external_deps', 1.0);
        break;
      case DegradationTrigger.PERFORMANCE_DEGRADATION:
        this.systemMetrics.set('interface', 1.0);
        break;
    }

    // Recalculate overall health
    const avgHealth = Array.from(this.systemMetrics.values()).reduce((sum, val) => sum + val, 0) / this.systemMetrics.size;

    if (avgHealth >= 0.8) {
      this.currentHealth = SystemHealth.OPTIMAL;
    } else if (avgHealth >= 0.6) {
      this.currentHealth = SystemHealth.DEGRADED;
    } else if (avgHealth >= 0.4) {
      this.currentHealth = SystemHealth.CRITICAL;
    } else {
      this.currentHealth = SystemHealth.FAILURE;
    }
  }

  /**
   * Get current system resilience state
   */
  getResilienceState(): any {
    return {
      currentHealth: this.currentHealth,
      systemMetrics: Object.fromEntries(this.systemMetrics),
      activeFallbacks: Array.from(this.activeFallbacks.keys()),
      degradationHistory: this.degradationHistory.slice(-5),
      recoveryAttempts: Object.fromEntries(this.recoveryAttempts),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Analyze resilience patterns for optimization
   */
  async analyzeResiliencePatterns(): Promise<any> {
    const history = this.degradationHistory;
    const attempts = Array.from(this.recoveryAttempts.values());

    // Analyze degradation patterns
    const triggerCounts = history.reduce((acc, event) => {
      acc[event.trigger] = (acc[event.trigger] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Analyze recovery effectiveness
    const recoveryStats = attempts.reduce((acc, attempt) => {
      if (!acc[attempt.strategy]) {
        acc[attempt.strategy] = { total: 0, successful: 0 };
      }
      acc[attempt.strategy].total++;
      if (attempt.status === 'successful') {
        acc[attempt.strategy].successful++;
      }
      return acc;
    }, {} as Record<string, any>);

    // Calculate mean time to recovery
    const successfulAttempts = attempts.filter(a => a.status === 'successful');
    const meanRecoveryTime = successfulAttempts.length > 0 ?
      successfulAttempts.reduce((sum, a) => {
        if (a.recoveryTime && a.scheduledTime) {
          return sum + (new Date(a.recoveryTime).getTime() - new Date(a.scheduledTime).getTime());
        }
        return sum;
      }, 0) / successfulAttempts.length / (1000 * 60) : 0; // Convert to minutes

    return {
      degradationPatterns: triggerCounts,
      recoveryEffectiveness: recoveryStats,
      meanRecoveryTime,
      totalDegradations: history.length,
      totalRecoveryAttempts: attempts.length,
      analysisTimestamp: new Date().toISOString()
    };
  }
}

/**
 * Calm Failure Handler: Ensures failures are handled gracefully without alarming users
 */
export class CalmFailureHandler {
  private failurePatterns: Map<string, any> = new Map();
  private userTolerance: Map<string, number> = new Map();

  constructor(
    private resilientManager: ResilientSystemManager,
    private notificationEngine?: AmbientNotificationEngine
  ) {
    this.initializeFailurePatterns();
  }

  private initializeFailurePatterns(): void {
    // Define how different types of failures should be presented to users
    this.failurePatterns.set('connectivity_loss', {
      userMessage: 'Working offline - actions will sync when connection returns',
      visualStyle: 'subtle_indicator',
      persistence: 'until_resolved',
      escalation: 'none'
    });

    this.failurePatterns.set('resource_exhaustion', {
      userMessage: 'System optimizing performance - some features may be slower',
      visualStyle: 'progress_indicator',
      persistence: 'temporary',
      escalation: 'low'
    });

    this.failurePatterns.set('component_failure', {
      userMessage: 'Essential features still available - advanced options temporarily limited',
      visualStyle: 'status_indicator',
      persistence: 'until_resolved',
      escalation: 'medium'
    });

    this.failurePatterns.set('external_dependency', {
      userMessage: 'Using cached information - data may not be current',
      visualStyle: 'cache_indicator',
      persistence: 'until_resolved',
      escalation: 'low'
    });
  }

  async handleFailureCalmly(
    trigger: DegradationTrigger,
    severity: string,
    context?: any
  ): Promise<void> {
    console.log(`😌 Handling failure calmly: ${trigger} (${severity})`);

    const pattern = this.failurePatterns.get(trigger);
    if (!pattern) {
      console.log(`No calm pattern defined for ${trigger}`);
      return;
    }

    // Check user tolerance for this type of failure
    const tolerance = this.getUserTolerance(trigger);
    const shouldNotify = this.shouldNotifyUser(trigger, severity, tolerance);

    if (shouldNotify && this.notificationEngine) {
      await this.sendCalmFailureNotification(pattern, severity, context);
    }

    // Update tolerance based on user response (simulated)
    this.updateUserTolerance(trigger, severity);
  }

  private getUserTolerance(trigger: DegradationTrigger): number {
    return this.userTolerance.get(trigger) || 0.5; // Default moderate tolerance
  }

  private shouldNotifyUser(trigger: DegradationTrigger, severity: string, tolerance: number): boolean {
    // Higher tolerance means less likely to notify for minor issues
    const severityThreshold = {
      'minor': tolerance + 0.2,
      'major': tolerance + 0.5,
      'critical': 1.0 // Always notify for critical issues
    };

    return Math.random() < (severityThreshold[severity as keyof typeof severityThreshold] || 0.8);
  }

  private async sendCalmFailureNotification(pattern: any, severity: string, context?: any): Promise<void> {
    if (!this.notificationEngine) return;

    const urgency = severity === 'critical' ? NotificationUrgency.IMPORTANT :
                   severity === 'major' ? NotificationUrgency.NORMAL :
                   NotificationUrgency.LOW;

    await this.notificationEngine.sendAmbientNotification(
      pattern.userMessage,
      urgency,
      {
        userAttention: AttentionState.PERIPHERAL,
        currentActivity: context?.activity || 'general'
      }
    );
  }

  private updateUserTolerance(trigger: DegradationTrigger, severity: string): void {
    const currentTolerance = this.getUserTolerance(trigger);

    // Slightly increase tolerance over time (users get used to certain failures)
    const adjustment = severity === 'minor' ? 0.05 : severity === 'major' ? 0.02 : 0.01;
    const newTolerance = Math.min(1.0, currentTolerance + adjustment);

    this.userTolerance.set(trigger, newTolerance);
  }
}

/**
 * Resilient Design Demonstrator
 */
export async function demonstrateResilientDesign(): Promise<void> {
  console.log('🔧 Resilient Design System Demonstration');
  console.log('='.repeat(50));

  const coordinator = new MultiAgentCoordinator();
  const resilientManager = new ResilientSystemManager(coordinator);
  const failureHandler = new CalmFailureHandler(resilientManager);

  try {
    // Simulate various failure scenarios and recovery patterns
    const scenarios = [
      {
        name: 'Network Interruption',
        trigger: DegradationTrigger.CONNECTIVITY_LOSS,
        severity: 'major' as const,
        duration: 10 // minutes
      },
      {
        name: 'Resource Exhaustion',
        trigger: DegradationTrigger.RESOURCE_EXHAUSTION,
        severity: 'minor' as const,
        duration: 5
      },
      {
        name: 'External Service Outage',
        trigger: DegradationTrigger.EXTERNAL_DEPENDENCY,
        severity: 'critical' as const,
        duration: 15
      },
      {
        name: 'Component Failure',
        trigger: DegradationTrigger.COMPONENT_FAILURE,
        severity: 'major' as const,
        duration: 8
      }
    ];

    for (const scenario of scenarios) {
      console.log(`\n📋 Scenario: ${scenario.name}`);
      console.log('-'.repeat(35));

      // Handle degradation gracefully
      await resilientManager.handleDegradation(scenario.trigger, scenario.severity);

      // Handle failure calmly
      await failureHandler.handleFailureCalmly(scenario.trigger, scenario.severity.toString());

      // Show current resilience state
      const state = resilientManager.getResilienceState();
      console.log(`System health: ${state.currentHealth}`);
      console.log(`Active fallbacks: ${state.activeFallbacks.length}`);

      // Simulate time passing and attempt recovery
      console.log(`⏰ Simulating ${scenario.duration} minutes...`);
      await new Promise(resolve => setTimeout(resolve, scenario.duration * 100));

      // Attempt recovery
      const recoverySuccess = await resilientManager.attemptRecovery(scenario.trigger);
      console.log(`Recovery ${recoverySuccess ? 'successful' : 'failed'}`);

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Analyze resilience patterns
    console.log('\n📊 Analyzing Resilience Patterns...');
    const patterns = await resilientManager.analyzeResiliencePatterns();
    console.log(`Total degradations handled: ${patterns.totalDegradations}`);
    console.log(`Mean recovery time: ${patterns.meanRecoveryTime.toFixed(1)} minutes`);

    // Show recovery effectiveness by strategy
    Object.entries(patterns.recoveryEffectiveness).forEach(([strategy, stats]) => {
      const successRate = (stats.successful / stats.total * 100).toFixed(1);
      console.log(`${strategy}: ${successRate}% success rate (${stats.total} attempts)`);
    });

    console.log('\n✅ Resilient design demonstration completed!');

  } catch (error) {
    console.error('❌ Resilient design demonstration failed:', error);
    throw error;
  }
}

// Export for use in other modules
export { ResilientSystemManager, CalmFailureHandler };

// Run demonstration if called directly
if (require.main === module) {
  demonstrateResilientDesign()
    .then(() => {
      console.log('\n🎉 Resilient design demo completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Resilient design demo failed:', error);
      process.exit(1);
    });
}
