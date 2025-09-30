/**
 * Peripheral Awareness System for Calm Technology
 *
 * This module implements sophisticated peripheral awareness mechanisms that allow
 * technology to operate in the user's peripheral attention while maintaining
 * situational awareness and context-appropriate responses.
 *
 * Key Features:
 * - Dynamic interface adaptation based on attention state
 * - Peripheral information display strategies
 * - Context-aware interface morphing
 * - Attention state transition management
 * - Privacy-preserving peripheral interactions
 */

import { MultiAgentCoordinator } from '../../src/core/coordination/MultiAgentCoordinator';
import { EventSystem } from '../../src/core/events/EventSystem';
import { AttentionState, AmbientFeedbackType } from './calm_tech_workflow';
import { AmbientNotificationEngine, SensoryConfig, NotificationUrgency } from './ambient_notifications';
import * as fs from 'fs-extra';
import * as path from 'path';

// Interface Adaptation Levels
export enum AdaptationLevel {
  MINIMAL = 'minimal',     // Subtle changes only
  MODERATE = 'moderate',   // Noticeable but non-disruptive changes
  SIGNIFICANT = 'significant', // Major layout/functional changes
  RADICAL = 'radical'      // Complete interface transformation
}

// Peripheral Display Strategies
export enum PeripheralStrategy {
  GLANCEABLE = 'glanceable',     // Quick visual scanning
  AMBIENT = 'ambient',           // Subtle background awareness
  CONTEXTUAL = 'contextual',     // Information appears in relevant contexts
  PREDICTIVE = 'predictive',     // Information appears before needed
  MINIMAL = 'minimal'            // Bare minimum information
}

// Interface Zones for spatial organization
export enum InterfaceZone {
  PRIMARY = 'primary',           // Main focus area
  SECONDARY = 'secondary',       // Supporting information
  PERIPHERAL = 'peripheral',     // Background awareness
  EDGE = 'edge',                 // Boundary information
  ENVIRONMENTAL = 'environmental' // Physical environment integration
}

// Attention Transition Types
export enum TransitionType {
  FOCUS_TO_PERIPHERAL = 'focus_to_peripheral',
  PERIPHERAL_TO_FOCUS = 'peripheral_to_focus',
  DISTRACTED_TO_PERIPHERAL = 'distracted_to_peripheral',
  UNAVAILABLE_TO_PERIPHERAL = 'unavailable_to_peripheral',
  GRADUAL_FOCUS_DECLINE = 'gradual_focus_decline',
  SUDDEN_ATTENTION_SHIFT = 'sudden_attention_shift'
}

/**
 * Peripheral Awareness Manager: Core system for attention-aware interface adaptation
 */
export class PeripheralAwarenessManager {
  private currentAttentionState: AttentionState = AttentionState.PERIPHERAL;
  private adaptationHistory: any[] = [];
  private interfaceState: Map<string, any> = new Map();
  private attentionTransitions: Map<string, any> = new Map();
  private contextMemory: Map<string, any> = new Map();

  constructor(
    private coordinator: MultiAgentCoordinator,
    private notificationEngine?: AmbientNotificationEngine
  ) {
    this.initializeInterfaceState();
  }

  private initializeInterfaceState(): void {
    // Initialize default interface states for different attention levels
    this.interfaceState.set('focused', {
      zone: InterfaceZone.PRIMARY,
      strategy: PeripheralStrategy.GLANCEABLE,
      adaptationLevel: AdaptationLevel.MINIMAL,
      elements: ['essential_only', 'high_contrast', 'minimal_animations']
    });

    this.interfaceState.set('peripheral', {
      zone: InterfaceZone.PERIPHERAL,
      strategy: PeripheralStrategy.AMBIENT,
      adaptationLevel: AdaptationLevel.MODERATE,
      elements: ['reduced_information', 'soft_colors', 'subtle_animations']
    });

    this.interfaceState.set('distracted', {
      zone: InterfaceZone.EDGE,
      strategy: PeripheralStrategy.MINIMAL,
      adaptationLevel: AdaptationLevel.SIGNIFICANT,
      elements: ['critical_only', 'high_priority_colors', 'no_animations']
    });

    this.interfaceState.set('unavailable', {
      zone: InterfaceZone.ENVIRONMENTAL,
      strategy: PeripheralStrategy.CONTEXTUAL,
      adaptationLevel: AdaptationLevel.RADICAL,
      elements: ['deferred_notifications', 'minimal_visual', 'ambient_only']
    });
  }

  /**
   * Update attention state and trigger appropriate adaptations
   */
  async updateAttentionState(
    newState: AttentionState,
    context?: {
      activity?: string;
      urgency?: string;
      duration?: number;
      trigger?: string;
    }
  ): Promise<void> {
    const previousState = this.currentAttentionState;
    this.currentAttentionState = newState;

    // Record the transition for analysis
    const transitionId = `transition_${Date.now()}`;
    this.attentionTransitions.set(transitionId, {
      from: previousState,
      to: newState,
      context,
      timestamp: new Date().toISOString(),
      duration: context?.duration || 0
    });

    console.log(`👁️ Attention state transition: ${previousState} → ${newState}`);

    // Apply interface adaptations
    await this.applyAttentionAdaptations(newState, previousState, context);

    // Notify other systems of the change
    await this.coordinator.publishEvent('attention:state:changed', {
      previousState,
      newState,
      context,
      transitionId,
      timestamp: new Date().toISOString()
    });
  }

  private async applyAttentionAdaptations(
    newState: AttentionState,
    previousState: AttentionState,
    context?: any
  ): Promise<void> {
    const interfaceConfig = this.interfaceState.get(newState) || this.interfaceState.get('peripheral');

    // Determine adaptation strategy based on transition
    const transitionType = this.determineTransitionType(previousState, newState);
    const adaptationLevel = this.calculateAdaptationLevel(transitionType, context);

    // Apply zone-based adaptations
    await this.adaptInterfaceZone(interfaceConfig.zone, adaptationLevel);

    // Apply strategy-based adaptations
    await this.adaptPeripheralStrategy(interfaceConfig.strategy, context);

    // Apply element-level adaptations
    await this.adaptInterfaceElements(interfaceConfig.elements, adaptationLevel);

    // Record adaptation
    this.adaptationHistory.push({
      state: newState,
      transitionType,
      adaptationLevel,
      interfaceConfig,
      context,
      timestamp: new Date().toISOString()
    });
  }

  private determineTransitionType(from: AttentionState, to: AttentionState): TransitionType {
    if (from === AttentionState.FOCUSED && to === AttentionState.PERIPHERAL) {
      return TransitionType.FOCUS_TO_PERIPHERAL;
    } else if (from === AttentionState.PERIPHERAL && to === AttentionState.FOCUSED) {
      return TransitionType.PERIPHERAL_TO_FOCUS;
    } else if (from === AttentionState.DISTRACTED && to === AttentionState.PERIPHERAL) {
      return TransitionType.DISTRACTED_TO_PERIPHERAL;
    } else if (from === AttentionState.UNAVAILABLE && to === AttentionState.PERIPHERAL) {
      return TransitionType.UNAVAILABLE_TO_PERIPHERAL;
    } else if (to === AttentionState.FOCUSED && from !== AttentionState.FOCUSED) {
      return TransitionType.SUDDEN_ATTENTION_SHIFT;
    } else {
      return TransitionType.GRADUAL_FOCUS_DECLINE;
    }
  }

  private calculateAdaptationLevel(transitionType: TransitionType, context?: any): AdaptationLevel {
    // Base adaptation level on transition type
    const baseLevels = {
      [TransitionType.FOCUS_TO_PERIPHERAL]: AdaptationLevel.MODERATE,
      [TransitionType.PERIPHERAL_TO_FOCUS]: AdaptationLevel.MINIMAL,
      [TransitionType.DISTRACTED_TO_PERIPHERAL]: AdaptationLevel.SIGNIFICANT,
      [TransitionType.UNAVAILABLE_TO_PERIPHERAL]: AdaptationLevel.RADICAL,
      [TransitionType.GRADUAL_FOCUS_DECLINE]: AdaptationLevel.MODERATE,
      [TransitionType.SUDDEN_ATTENTION_SHIFT]: AdaptationLevel.MINIMAL
    };

    let level = baseLevels[transitionType];

    // Adjust based on context
    if (context?.urgency === 'high') {
      level = this.escalateAdaptationLevel(level);
    } else if (context?.urgency === 'low') {
      level = this.deescalateAdaptationLevel(level);
    }

    return level;
  }

  private escalateAdaptationLevel(level: AdaptationLevel): AdaptationLevel {
    const escalation = {
      [AdaptationLevel.MINIMAL]: AdaptationLevel.MODERATE,
      [AdaptationLevel.MODERATE]: AdaptationLevel.SIGNIFICANT,
      [AdaptationLevel.SIGNIFICANT]: AdaptationLevel.RADICAL,
      [AdaptationLevel.RADICAL]: AdaptationLevel.RADICAL
    };
    return escalation[level];
  }

  private deescalateAdaptationLevel(level: AdaptationLevel): AdaptationLevel {
    const deescalation = {
      [AdaptationLevel.RADICAL]: AdaptationLevel.SIGNIFICANT,
      [AdaptationLevel.SIGNIFICANT]: AdaptationLevel.MODERATE,
      [AdaptationLevel.MODERATE]: AdaptationLevel.MINIMAL,
      [AdaptationLevel.MINIMAL]: AdaptationLevel.MINIMAL
    };
    return deescalation[level];
  }

  private async adaptInterfaceZone(zone: InterfaceZone, level: AdaptationLevel): Promise<void> {
    console.log(`📐 Adapting to zone: ${zone} (${level} level)`);

    const adaptations = {
      [InterfaceZone.PRIMARY]: {
        [AdaptationLevel.MINIMAL]: ['enhance_contrast', 'highlight_essentials'],
        [AdaptationLevel.MODERATE]: ['increase_spacing', 'simplify_layout'],
        [AdaptationLevel.SIGNIFICANT]: ['focus_mode', 'single_task_view'],
        [AdaptationLevel.RADICAL]: ['zen_mode', 'distraction_free']
      },
      [InterfaceZone.SECONDARY]: {
        [AdaptationLevel.MINIMAL]: ['soften_colors', 'reduce_brightness'],
        [AdaptationLevel.MODERATE]: ['minimize_details', 'group_information'],
        [AdaptationLevel.SIGNIFICANT]: ['hide_non_essential', 'show_only_status'],
        [AdaptationLevel.RADICAL]: ['ambient_only', 'icon_only']
      },
      [InterfaceZone.PERIPHERAL]: {
        [AdaptationLevel.MINIMAL]: ['edge_glow', 'subtle_indicators'],
        [AdaptationLevel.MODERATE]: ['breathing_animation', 'color_coding'],
        [AdaptationLevel.SIGNIFICANT]: ['progress_bars', 'status_dots'],
        [AdaptationLevel.RADICAL]: ['minimal_badges', 'shape_indicators']
      },
      [InterfaceZone.EDGE]: {
        [AdaptationLevel.MINIMAL]: ['corner_notifications', 'edge_badges'],
        [AdaptationLevel.MODERATE]: ['slide_in_panels', 'edge_tooltips'],
        [AdaptationLevel.SIGNIFICANT]: ['expandable_edges', 'context_menus'],
        [AdaptationLevel.RADICAL]: ['full_edge_integration', 'wrap_around']
      },
      [InterfaceZone.ENVIRONMENTAL]: {
        [AdaptationLevel.MINIMAL]: ['room_lighting', 'ambient_sounds'],
        [AdaptationLevel.MODERATE]: ['smart_lighting', 'contextual_audio'],
        [AdaptationLevel.SIGNIFICANT]: ['environmental_displays', 'spatial_audio'],
        [AdaptationLevel.RADICAL]: ['immersive_environment', 'full_sensory_integration']
      }
    };

    const zoneAdaptations = adaptations[zone]?.[level] || [];
    for (const adaptation of zoneAdaptations) {
      await this.applyZoneAdaptation(zone, adaptation);
    }
  }

  private async applyZoneAdaptation(zone: InterfaceZone, adaptation: string): Promise<void> {
    console.log(`  → Applying ${adaptation} to ${zone} zone`);

    await this.coordinator.publishEvent('interface:zone:adapted', {
      zone,
      adaptation,
      timestamp: new Date().toISOString()
    });
  }

  private async adaptPeripheralStrategy(strategy: PeripheralStrategy, context?: any): Promise<void> {
    console.log(`🎯 Adapting peripheral strategy: ${strategy}`);

    const strategies = {
      [PeripheralStrategy.GLANCEABLE]: {
        elements: ['at_a_glance_info', 'quick_scan_layout', 'essential_metrics'],
        timing: 'immediate',
        interaction: 'low_effort'
      },
      [PeripheralStrategy.AMBIENT]: {
        elements: ['background_awareness', 'subtle_changes', 'non_disruptive'],
        timing: 'continuous',
        interaction: 'passive'
      },
      [PeripheralStrategy.CONTEXTUAL]: {
        elements: ['context_dependent', 'relevant_timing', 'situational_display'],
        timing: 'opportunistic',
        interaction: 'contextual'
      },
      [PeripheralStrategy.PREDICTIVE]: {
        elements: ['anticipatory_info', 'proactive_suggestions', 'future_context'],
        timing: 'predictive',
        interaction: 'preemptive'
      },
      [PeripheralStrategy.MINIMAL]: {
        elements: ['bare_essentials', 'critical_only', 'ultra_subtle'],
        timing: 'sparse',
        interaction: 'minimal'
      }
    };

    const strategyConfig = strategies[strategy];
    if (strategyConfig) {
      await this.applyStrategyElements(strategyConfig.elements, context);
    }
  }

  private async applyStrategyElements(elements: string[], context?: any): Promise<void> {
    for (const element of elements) {
      console.log(`  → Applying strategy element: ${element}`);
      await this.coordinator.publishEvent('interface:strategy:element', {
        element,
        context,
        timestamp: new Date().toISOString()
      });
    }
  }

  private async adaptInterfaceElements(elements: string[], level: AdaptationLevel): Promise<void> {
    console.log(`🧩 Adapting interface elements: ${elements.join(', ')} (${level})`);

    for (const element of elements) {
      await this.applyElementAdaptation(element, level);
    }
  }

  private async applyElementAdaptation(element: string, level: AdaptationLevel): Promise<void> {
    const adaptations = {
      'essential_only': {
        [AdaptationLevel.MINIMAL]: 'show_critical_info',
        [AdaptationLevel.MODERATE]: 'highlight_important',
        [AdaptationLevel.SIGNIFICANT]: 'hide_secondary',
        [AdaptationLevel.RADICAL]: 'minimal_viables'
      },
      'high_contrast': {
        [AdaptationLevel.MINIMAL]: 'increase_contrast_slightly',
        [AdaptationLevel.MODERATE]: 'high_contrast_mode',
        [AdaptationLevel.SIGNIFICANT]: 'maximum_contrast',
        [AdaptationLevel.RADICAL]: 'monochrome_high_contrast'
      },
      'minimal_animations': {
        [AdaptationLevel.MINIMAL]: 'reduce_motion',
        [AdaptationLevel.MODERATE]: 'essential_animations_only',
        [AdaptationLevel.SIGNIFICANT]: 'static_interface',
        [AdaptationLevel.RADICAL]: 'instant_transitions'
      },
      'soft_colors': {
        [AdaptationLevel.MINIMAL]: 'pastel_tones',
        [AdaptationLevel.MODERATE]: 'muted_colors',
        [AdaptationLevel.SIGNIFICANT]: 'grayscale',
        [AdaptationLevel.RADICAL]: 'minimal_color_palette'
      }
    };

    const adaptation = adaptations[element]?.[level] || element;
    console.log(`  → Element ${element}: ${adaptation}`);

    await this.coordinator.publishEvent('interface:element:adapted', {
      element,
      adaptation,
      level,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Handle gradual attention changes over time
   */
  async handleAttentionDrift(
    currentActivity: string,
    duration: number,
    environmentalFactors?: any
  ): Promise<void> {
    console.log(`🌊 Handling attention drift: ${currentActivity} (${duration}min)`);

    // Analyze patterns to predict attention state changes
    const driftPattern = await this.analyzeAttentionPattern(currentActivity, duration);

    if (driftPattern.likelyTransition) {
      console.log(`📈 Predicted transition: ${driftPattern.likelyTransition.to}`);

      // Prepare interface for the predicted state
      await this.prepareForPredictedState(driftPattern.likelyTransition.to, driftPattern.confidence);

      // Send ambient notification about the upcoming change
      if (this.notificationEngine && driftPattern.confidence > 0.7) {
        await this.notificationEngine.sendAmbientNotification(
          `Adapting interface for ${driftPattern.likelyTransition.to} attention`,
          NotificationUrgency.LOW,
          { userAttention: driftPattern.likelyTransition.to }
        );
      }
    }
  }

  private async analyzeAttentionPattern(activity: string, duration: number): Promise<any> {
    // Simple pattern analysis based on activity and duration
    const patterns = {
      'deep_work': { threshold: 45, transition: AttentionState.FOCUSED },
      'meeting': { threshold: 30, transition: AttentionState.PERIPHERAL },
      'creative': { threshold: 60, transition: AttentionState.FOCUSED },
      'administrative': { threshold: 20, transition: AttentionState.DISTRACTED },
      'research': { threshold: 90, transition: AttentionState.FOCUSED }
    };

    const pattern = patterns[activity as keyof typeof patterns];
    if (!pattern) {
      return { likelyTransition: null, confidence: 0 };
    }

    const confidence = Math.min(duration / pattern.threshold, 1.0);

    return {
      likelyTransition: confidence > 0.6 ? { to: pattern.transition } : null,
      confidence,
      activity,
      duration
    };
  }

  private async prepareForPredictedState(predictedState: AttentionState, confidence: number): Promise<void> {
    console.log(`🔮 Preparing for predicted state: ${predictedState} (${(confidence * 100).toFixed(1)}% confidence)`);

    // Pre-adapt interface elements
    const interfaceConfig = this.interfaceState.get(predictedState) || this.interfaceState.get('peripheral');

    await this.coordinator.publishEvent('interface:prediction:prepared', {
      predictedState,
      confidence,
      interfaceConfig,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Get current peripheral awareness state
   */
  getCurrentState(): any {
    return {
      attentionState: this.currentAttentionState,
      interfaceState: Object.fromEntries(this.interfaceState),
      adaptationHistory: this.adaptationHistory.slice(-10), // Last 10 adaptations
      transitions: Array.from(this.attentionTransitions.values()).slice(-5), // Last 5 transitions
      contextMemory: Object.fromEntries(this.contextMemory),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Analyze attention patterns for optimization
   */
  async analyzeAttentionPatterns(): Promise<any> {
    const transitions = Array.from(this.attentionTransitions.values());
    const adaptations = this.adaptationHistory;

    // Analyze transition frequencies
    const stateCounts = transitions.reduce((acc, t) => {
      acc[t.to] = (acc[t.to] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Analyze adaptation effectiveness
    const adaptationEffectiveness = adaptations.reduce((acc, a) => {
      if (!acc[a.adaptationLevel]) acc[a.adaptationLevel] = { total: 0, successful: 0 };
      acc[a.adaptationLevel].total++;
      // Simple success metric based on whether adaptation was applied without issues
      acc[a.adaptationLevel].successful++;
      return acc;
    }, {} as Record<string, any>);

    return {
      transitionPatterns: stateCounts,
      adaptationEffectiveness,
      totalTransitions: transitions.length,
      totalAdaptations: adaptations.length,
      analysisTimestamp: new Date().toISOString()
    };
  }
}

/**
 * Context-Aware Interface Adapter: Handles dynamic interface morphing
 */
export class ContextAwareInterfaceAdapter {
  private interfaceProfiles: Map<string, any> = new Map();
  private morphingHistory: any[] = [];

  constructor(private awarenessManager: PeripheralAwarenessManager) {
    this.initializeInterfaceProfiles();
  }

  private initializeInterfaceProfiles(): void {
    // Define interface profiles for different contexts
    this.interfaceProfiles.set('work_desktop', {
      layout: 'grid',
      density: 'medium',
      interactions: ['click', 'drag', 'keyboard'],
      visualStyle: 'professional',
      informationLevel: 'comprehensive'
    });

    this.interfaceProfiles.set('mobile_quick', {
      layout: 'stack',
      density: 'low',
      interactions: ['tap', 'swipe', 'voice'],
      visualStyle: 'minimal',
      informationLevel: 'essential'
    });

    this.interfaceProfiles.set('ambient_display', {
      layout: 'peripheral',
      density: 'minimal',
      interactions: ['glance', 'proximity'],
      visualStyle: 'subtle',
      informationLevel: 'awareness'
    });

    this.interfaceProfiles.set('meeting_room', {
      layout: 'presenter',
      density: 'focused',
      interactions: ['remote', 'voice', 'gesture'],
      visualStyle: 'clean',
      informationLevel: 'relevant'
    });
  }

  async adaptToContext(context: {
    location?: string;
    device?: string;
    activity?: string;
    socialSetting?: string;
    timeOfDay?: string;
  }): Promise<void> {
    console.log(`🔄 Adapting interface to context:`, context);

    // Determine appropriate profile
    const profile = this.selectInterfaceProfile(context);

    // Apply profile adaptations
    await this.applyInterfaceProfile(profile, context);

    // Record morphing
    this.morphingHistory.push({
      context,
      profile: profile.name,
      adaptations: profile.adaptations,
      timestamp: new Date().toISOString()
    });
  }

  private selectInterfaceProfile(context: any): any {
    // Simple rule-based profile selection
    if (context.device === 'mobile' && context.activity === 'quick_task') {
      return { name: 'mobile_quick', ...this.interfaceProfiles.get('mobile_quick') };
    } else if (context.location === 'meeting' || context.socialSetting === 'group') {
      return { name: 'meeting_room', ...this.interfaceProfiles.get('meeting_room') };
    } else if (context.activity === 'ambient_monitoring') {
      return { name: 'ambient_display', ...this.interfaceProfiles.get('ambient_display') };
    } else {
      return { name: 'work_desktop', ...this.interfaceProfiles.get('work_desktop') };
    }
  }

  private async applyInterfaceProfile(profile: any, context: any): Promise<void> {
    const adaptations = [];

    // Apply layout changes
    if (profile.layout !== 'current') {
      adaptations.push(`layout_${profile.layout}`);
      await this.coordinator.publishEvent('interface:layout:changed', {
        from: 'current',
        to: profile.layout,
        profile: profile.name
      });
    }

    // Apply density changes
    if (profile.density !== 'current') {
      adaptations.push(`density_${profile.density}`);
      await this.coordinator.publishEvent('interface:density:changed', {
        from: 'current',
        to: profile.density,
        profile: profile.name
      });
    }

    // Apply interaction model changes
    if (profile.interactions) {
      adaptations.push(`interactions_${profile.interactions.join('_')}`);
      await this.coordinator.publishEvent('interface:interactions:changed', {
        interactions: profile.interactions,
        profile: profile.name
      });
    }

    profile.adaptations = adaptations;
    console.log(`✅ Applied profile: ${profile.name} with ${adaptations.length} adaptations`);
  }

  getMorphingHistory(): any[] {
    return this.morphingHistory;
  }
}

/**
 * Peripheral Awareness Demonstrator
 */
export async function demonstratePeripheralAwareness(): Promise<void> {
  console.log('👁️ Peripheral Awareness System Demonstration');
  console.log('='.repeat(55));

  const coordinator = new MultiAgentCoordinator();
  const awarenessManager = new PeripheralAwarenessManager(coordinator);
  const interfaceAdapter = new ContextAwareInterfaceAdapter(awarenessManager);

  try {
    // Simulate a day in the life with different attention states and contexts
    const scenarios = [
      {
        name: 'Morning Deep Work',
        state: AttentionState.FOCUSED,
        context: {
          activity: 'deep_work',
          duration: 90,
          urgency: 'normal'
        },
        interfaceContext: {
          location: 'office',
          device: 'desktop',
          activity: 'focused_coding',
          timeOfDay: '09:00'
        }
      },
      {
        name: 'Team Standup',
        state: AttentionState.PERIPHERAL,
        context: {
          activity: 'meeting',
          duration: 15,
          urgency: 'high'
        },
        interfaceContext: {
          location: 'meeting_room',
          device: 'laptop',
          socialSetting: 'group',
          timeOfDay: '10:00'
        }
      },
      {
        name: 'Afternoon Administrative Work',
        state: AttentionState.DISTRACTED,
        context: {
          activity: 'administrative',
          duration: 30,
          urgency: 'normal'
        },
        interfaceContext: {
          location: 'office',
          device: 'desktop',
          activity: 'email_processing',
          timeOfDay: '14:00'
        }
      },
      {
        name: 'Evening Wind Down',
        state: AttentionState.PERIPHERAL,
        context: {
          activity: 'reading',
          duration: 60,
          urgency: 'low'
        },
        interfaceContext: {
          location: 'home',
          device: 'tablet',
          activity: 'ambient_monitoring',
          timeOfDay: '20:00'
        }
      }
    ];

    for (const scenario of scenarios) {
      console.log(`\n📋 Scenario: ${scenario.name}`);
      console.log('-'.repeat(35));

      // Update attention state
      await awarenessManager.updateAttentionState(scenario.state, scenario.context);

      // Adapt interface to context
      await interfaceAdapter.adaptToContext(scenario.interfaceContext);

      // Simulate attention drift
      await awarenessManager.handleAttentionDrift(
        scenario.context.activity,
        scenario.context.duration
      );

      // Show current state
      const state = awarenessManager.getCurrentState();
      console.log(`Current state: ${state.attentionState}`);
      console.log(`Interface zone: ${state.interfaceState[scenario.state]?.zone}`);

      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Analyze patterns
    console.log('\n📊 Analyzing Attention Patterns...');
    const patterns = await awarenessManager.analyzeAttentionPatterns();
    console.log(`Total transitions: ${patterns.totalTransitions}`);
    console.log(`Total adaptations: ${patterns.totalAdaptations}`);

    console.log('\n✅ Peripheral awareness demonstration completed!');

  } catch (error) {
    console.error('❌ Peripheral awareness demonstration failed:', error);
    throw error;
  }
}

// Export for use in other modules
export { PeripheralAwarenessManager, ContextAwareInterfaceAdapter };

// Run demonstration if called directly
if (require.main === module) {
  demonstratePeripheralAwareness()
    .then(() => {
      console.log('\n🎉 Peripheral awareness demo completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Peripheral awareness demo failed:', error);
      process.exit(1);
    });
}
