/**
 * Calm Technology Workflow Implementation
 *
 * This example demonstrates comprehensive application of Calm Technology principles
 * to multi-agent system design, focusing on attention-aware, human-centric interfaces.
 *
 * Calm Technology Principles Demonstrated:
 * I. Technology should require the smallest possible amount of attention
 * II. Technology should inform and create calm
 * III. Technology should make use of the periphery
 * IV. Technology should amplify the best of technology and the best of humanity
 * V. Technology can communicate, but doesn't need to speak
 * VI. Technology should work even when it fails
 * VII. The right amount of technology is the minimum needed to solve the problem
 * VIII. Leverage familiar behaviors to introduce new ones
 */

import { OpenAIClient } from '../../src/core/multiagent/OpenAIClient';
import { LLMMessage } from '../../src/core/multiagent/LLMClientInterface';
import { WorkflowEngine, ILogger } from '../../src/core/units/workflow/WorkflowEngine';
import { EventSystem } from '../../src/core/events/EventSystem';
import { MultiAgentCoordinator } from '../../src/core/coordination/MultiAgentCoordinator';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as dotenv from 'dotenv';
import * as crypto from 'crypto';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Verify API key loading
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error('OPENAI_API_KEY not found in environment variables');
  process.exit(1);
} else {
  const maskedKey = `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`;
  console.log(`OPENAI_API_KEY loaded: ${maskedKey}`);
}

// Define Calm Technology Principles for reference in prompts and logic
export const CALM_TECH_PRINCIPLES = [
  "I. Technology should require the smallest possible amount of attention",
  "II. Technology should inform and create calm",
  "III. Technology should make use of the periphery",
  "IV. Technology should amplify the best of technology and the best of humanity",
  "V. Technology can communicate, but doesn't need to speak",
  "VI. Technology should work even when it fails",
  "VII. The right amount of technology is the minimum needed to solve the problem",
  "VIII. Leverage familiar behaviors to introduce new ones"
] as const;

// Create run-specific output folder
const timestamp = new Date().toISOString().replace(/:/g, '-');
const runId = `calm-tech-workflow-${timestamp}`;
const outputDir: string = path.join(__dirname, '../../output', runId);

// Attention States for peripheral awareness
export enum AttentionState {
  FOCUSED = 'focused',
  PERIPHERAL = 'peripheral',
  UNAVAILABLE = 'unavailable',
  DISTRACTED = 'distracted'
}

// Notification Urgency Levels
export enum NotificationUrgency {
  CRITICAL = 'critical',    // Requires immediate attention
  IMPORTANT = 'important',  // Should be noticed soon
  NORMAL = 'normal',        // Can be noticed peripherally
  LOW = 'low'              // Background information only
}

// Ambient Feedback Types
export enum AmbientFeedbackType {
  VISUAL = 'visual',        // Subtle color changes, progress indicators
  TACTILE = 'tactile',      // Gentle vibrations, temperature changes
  AUDITORY = 'auditory',    // Soft tones, natural sounds
  SPATIAL = 'spatial'       // Physical positioning, movement
}

/**
 * Attention-Aware Agent: Monitors user attention state and adapts behavior accordingly
 * Demonstrates Principle I: Minimal attention requirement
 */
export class AttentionAwareAgent {
  private attentionState: AttentionState = AttentionState.PERIPHERAL;
  private userContext: Map<string, any> = new Map();

  constructor(private coordinator: MultiAgentCoordinator) {}

  async assessAttentionState(): Promise<AttentionState> {
    // Simulate attention state detection through various signals
    const currentHour = new Date().getHours();
    const isWorkHours = currentHour >= 9 && currentHour <= 17;
    const isWeekend = new Date().getDay() >= 6;

    // Use contextual clues to infer attention state
    if (!isWorkHours || isWeekend) {
      this.attentionState = AttentionState.PERIPHERAL;
    } else if (this.userContext.get('activeTask') === 'deep-work') {
      this.attentionState = AttentionState.FOCUSED;
    } else {
      this.attentionState = AttentionState.PERIPHERAL;
    }

    return this.attentionState;
  }

  async adaptToAttentionState(): Promise<void> {
    const state = await this.assessAttentionState();

    switch (state) {
      case AttentionState.FOCUSED:
        await this.minimizeInterruptions();
        break;
      case AttentionState.PERIPHERAL:
        await this.enableAmbientAwareness();
        break;
      case AttentionState.DISTRACTED:
        await this.reduceCognitiveLoad();
        break;
      case AttentionState.UNAVAILABLE:
        await this.deferNonCriticalTasks();
        break;
    }
  }

  private async minimizeInterruptions(): Promise<void> {
    // Only surface critical information
    console.log('🔕 Minimizing interruptions for focused work');
    await this.coordinator.publishEvent('attention:interruptions:minimized', {
      reason: 'User in focused state',
      timestamp: new Date().toISOString()
    });
  }

  private async enableAmbientAwareness(): Promise<void> {
    // Enable peripheral notifications and ambient feedback
    console.log('👁️ Enabling ambient awareness for peripheral attention');
    await this.coordinator.publishEvent('attention:ambient:enabled', {
      feedbackTypes: [AmbientFeedbackType.VISUAL, AmbientFeedbackType.AUDITORY],
      timestamp: new Date().toISOString()
    });
  }

  private async reduceCognitiveLoad(): Promise<void> {
    // Simplify interfaces and reduce information density
    console.log('🧠 Reducing cognitive load for distracted state');
    await this.coordinator.publishEvent('attention:load:reduced', {
      simplifications: ['reduced_notifications', 'larger_text', 'fewer_options'],
      timestamp: new Date().toISOString()
    });
  }

  private async deferNonCriticalTasks(): Promise<void> {
    // Queue non-essential communications for later
    console.log('⏰ Deferring non-critical tasks for later');
    await this.coordinator.publishEvent('attention:tasks:deferred', {
      deferredCount: 3,
      reason: 'User unavailable',
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Ambient Notification System: Communicates without demanding attention
 * Demonstrates Principles II, III, V: Inform and create calm, use periphery, communicate without speaking
 */
export class AmbientNotificationSystem {
  private activeNotifications: Map<string, any> = new Map();

  constructor(private coordinator: MultiAgentCoordinator) {}

  async sendAmbientNotification(
    message: string,
    urgency: NotificationUrgency,
    feedbackTypes: AmbientFeedbackType[] = [AmbientFeedbackType.VISUAL]
  ): Promise<void> {
    const notificationId = crypto.randomUUID();

    // Adapt notification based on urgency and available feedback types
    const ambientMessage = await this.adaptMessageForAmbientDisplay(message, urgency);

    // Use peripheral feedback mechanisms
    for (const feedbackType of feedbackTypes) {
      await this.renderAmbientFeedback(notificationId, ambientMessage, feedbackType, urgency);
    }

    this.activeNotifications.set(notificationId, {
      message: ambientMessage,
      urgency,
      feedbackTypes,
      timestamp: new Date().toISOString()
    });

    console.log(`🌊 Ambient notification sent: ${ambientMessage} (${urgency})`);
  }

  private async adaptMessageForAmbientDisplay(message: string, urgency: NotificationUrgency): Promise<string> {
    // Simplify message based on urgency and display constraints
    switch (urgency) {
      case NotificationUrgency.CRITICAL:
        return message.length > 20 ? message.substring(0, 20) + '...' : message;
      case NotificationUrgency.IMPORTANT:
        return message.length > 15 ? message.substring(0, 15) + '...' : message;
      case NotificationUrgency.NORMAL:
        return message.length > 10 ? message.substring(0, 10) + '...' : message;
      case NotificationUrgency.LOW:
        return '●'; // Just a subtle indicator
      default:
        return message;
    }
  }

  private async renderAmbientFeedback(
    id: string,
    message: string,
    type: AmbientFeedbackType,
    urgency: NotificationUrgency
  ): Promise<void> {
    // Simulate different ambient feedback mechanisms
    switch (type) {
      case AmbientFeedbackType.VISUAL:
        await this.renderVisualFeedback(message, urgency);
        break;
      case AmbientFeedbackType.AUDITORY:
        await this.renderAuditoryFeedback(urgency);
        break;
      case AmbientFeedbackType.TACTILE:
        await this.renderTactileFeedback(urgency);
        break;
      case AmbientFeedbackType.SPATIAL:
        await this.renderSpatialFeedback(urgency);
        break;
    }
  }

  private async renderVisualFeedback(message: string, urgency: NotificationUrgency): Promise<void> {
    // Use subtle visual cues: color, opacity, position
    const colors = {
      [NotificationUrgency.CRITICAL]: '#ff4444',
      [NotificationUrgency.IMPORTANT]: '#ff8800',
      [NotificationUrgency.NORMAL]: '#4444ff',
      [NotificationUrgency.LOW]: '#888888'
    };

    console.log(`🎨 Visual feedback: ${message} (${colors[urgency]})`);
    await this.coordinator.publishEvent('ambient:visual:rendered', {
      message,
      color: colors[urgency],
      urgency
    });
  }

  private async renderAuditoryFeedback(urgency: NotificationUrgency): Promise<void> {
    // Use natural, non-intrusive sounds
    const sounds = {
      [NotificationUrgency.CRITICAL]: 'urgent_chime',
      [NotificationUrgency.IMPORTANT]: 'soft_tone',
      [NotificationUrgency.NORMAL]: 'subtle_click',
      [NotificationUrgency.LOW]: 'gentle_breeze'
    };

    console.log(`🔊 Auditory feedback: ${sounds[urgency]}`);
    await this.coordinator.publishEvent('ambient:auditory:rendered', {
      sound: sounds[urgency],
      urgency
    });
  }

  private async renderTactileFeedback(urgency: NotificationUrgency): Promise<void> {
    // Use gentle vibrations or temperature changes
    const patterns = {
      [NotificationUrgency.CRITICAL]: 'pulse_strong',
      [NotificationUrgency.IMPORTANT]: 'pulse_medium',
      [NotificationUrgency.NORMAL]: 'pulse_light',
      [NotificationUrgency.LOW]: 'constant_gentle'
    };

    console.log(`📳 Tactile feedback: ${patterns[urgency]}`);
    await this.coordinator.publishEvent('ambient:tactile:rendered', {
      pattern: patterns[urgency],
      urgency
    });
  }

  private async renderSpatialFeedback(urgency: NotificationUrgency): Promise<void> {
    // Use physical positioning or movement
    const positions = {
      [NotificationUrgency.CRITICAL]: 'center_stage',
      [NotificationUrgency.IMPORTANT]: 'edge_noticeable',
      [NotificationUrgency.NORMAL]: 'peripheral_edge',
      [NotificationUrgency.LOW]: 'background'
    };

    console.log(`📐 Spatial feedback: ${positions[urgency]}`);
    await this.coordinator.publishEvent('ambient:spatial:rendered', {
      position: positions[urgency],
      urgency
    });
  }
}

/**
 * Resilient Calm System: Maintains functionality even during failures
 * Demonstrates Principle VI: Technology should work even when it fails
 */
export class ResilientCalmSystem {
  private fallbackModes: Map<string, any> = new Map();
  private degradationLevel: number = 0; // 0 = full functionality, 3 = minimal

  constructor(private coordinator: MultiAgentCoordinator) {
    this.initializeFallbackModes();
  }

  private initializeFallbackModes(): void {
    this.fallbackModes.set('connectivity', {
      full: 'real_time_sync',
      partial: 'cached_local',
      minimal: 'offline_queue'
    });

    this.fallbackModes.set('processing', {
      full: 'parallel_processing',
      partial: 'sequential_processing',
      minimal: 'essential_only'
    });

    this.fallbackModes.set('interface', {
      full: 'rich_interactive',
      partial: 'basic_interactive',
      minimal: 'ambient_indicators'
    });
  }

  async handleFailure(failureType: string, severity: 'minor' | 'major' | 'critical'): Promise<void> {
    console.log(`🔧 Handling ${severity} failure: ${failureType}`);

    // Gracefully degrade functionality
    this.degradationLevel = severity === 'minor' ? 1 : severity === 'major' ? 2 : 3;

    // Switch to appropriate fallback mode
    const fallbackMode = this.getFallbackMode(failureType);
    await this.activateFallbackMode(failureType, fallbackMode);

    // Notify user through calm, ambient means
    await this.coordinator.publishEvent('system:degraded', {
      failureType,
      severity,
      degradationLevel: this.degradationLevel,
      fallbackMode,
      timestamp: new Date().toISOString()
    });
  }

  private getFallbackMode(failureType: string): string {
    const modes = this.fallbackModes.get(failureType);
    if (!modes) return 'minimal';

    switch (this.degradationLevel) {
      case 0: return modes.full;
      case 1: return modes.partial;
      case 2: return modes.partial;
      case 3: return modes.minimal;
      default: return modes.minimal;
    }
  }

  private async activateFallbackMode(failureType: string, mode: string): Promise<void> {
    console.log(`🔄 Activating fallback mode: ${mode} for ${failureType}`);

    // Implement specific fallback behaviors
    switch (failureType) {
      case 'connectivity':
        await this.handleConnectivityFallback(mode);
        break;
      case 'processing':
        await this.handleProcessingFallback(mode);
        break;
      case 'interface':
        await this.handleInterfaceFallback(mode);
        break;
    }
  }

  private async handleConnectivityFallback(mode: string): Promise<void> {
    switch (mode) {
      case 'real_time_sync':
        console.log('📡 Real-time connectivity restored');
        break;
      case 'cached_local':
        console.log('💾 Using cached data for offline functionality');
        break;
      case 'offline_queue':
        console.log('📋 Queueing actions for when connectivity returns');
        break;
    }
  }

  private async handleProcessingFallback(mode: string): Promise<void> {
    switch (mode) {
      case 'parallel_processing':
        console.log('⚡ Parallel processing restored');
        break;
      case 'sequential_processing':
        console.log('🔄 Sequential processing - reduced speed but functional');
        break;
      case 'essential_only':
        console.log('🎯 Essential functions only - core functionality maintained');
        break;
    }
  }

  private async handleInterfaceFallback(mode: string): Promise<void> {
    switch (mode) {
      case 'rich_interactive':
        console.log('🎨 Rich interactive interface restored');
        break;
      case 'basic_interactive':
        console.log('📝 Basic interactive interface - core features available');
        break;
      case 'ambient_indicators':
        console.log('🌊 Ambient indicators only - information through periphery');
        break;
    }
  }

  async attemptRecovery(failureType: string): Promise<boolean> {
    console.log(`🔄 Attempting recovery from ${failureType} failure`);

    // Simulate recovery process
    const recoverySuccess = Math.random() > 0.3; // 70% success rate

    if (recoverySuccess) {
      this.degradationLevel = Math.max(0, this.degradationLevel - 1);
      console.log(`✅ Recovery successful, degradation level: ${this.degradationLevel}`);

      await this.coordinator.publishEvent('system:recovered', {
        failureType,
        degradationLevel: this.degradationLevel,
        timestamp: new Date().toISOString()
      });
    } else {
      console.log(`❌ Recovery failed, maintaining current fallback mode`);
    }

    return recoverySuccess;
  }
}

/**
 * Cognitive Load Assessment Agent: Measures and optimizes attention demands
 * Demonstrates Principle VII: Right amount of technology
 */
export class CognitiveLoadAssessor {
  private loadMetrics: Map<string, number> = new Map();
  private optimizationHistory: any[] = [];

  constructor(private coordinator: MultiAgentCoordinator) {}

  async assessCognitiveLoad(context: string): Promise<number> {
    // Simulate cognitive load assessment based on various factors
    let loadScore = 0;

    // Factor in: information density, task complexity, time pressure, distractions
    const factors = {
      informationDensity: Math.random() * 0.3,
      taskComplexity: Math.random() * 0.25,
      timePressure: Math.random() * 0.2,
      distractions: Math.random() * 0.15,
      interfaceComplexity: Math.random() * 0.1
    };

    // Calculate weighted load score (0-1, where 1 is maximum load)
    loadScore = Object.values(factors).reduce((sum, factor) => sum + factor, 0);

    this.loadMetrics.set(context, loadScore);

    console.log(`🧠 Cognitive load assessed for ${context}: ${(loadScore * 100).toFixed(1)}%`);

    return loadScore;
  }

  async optimizeForLoad(context: string): Promise<void> {
    const currentLoad = this.loadMetrics.get(context) || 0;

    if (currentLoad > 0.7) {
      await this.reduceLoad(context);
    } else if (currentLoad < 0.3) {
      await this.enhanceEfficiency(context);
    } else {
      await this.maintainOptimalLoad(context);
    }
  }

  private async reduceLoad(context: string): Promise<void> {
    console.log(`⚖️ Reducing cognitive load for ${context}`);

    const optimizations = [
      'Simplified interface elements',
      'Reduced information density',
      'Increased automation',
      'Clearer visual hierarchy',
      'Fewer simultaneous options'
    ];

    const appliedOptimizations = optimizations.slice(0, Math.floor(Math.random() * 3) + 2);

    this.optimizationHistory.push({
      context,
      action: 'reduce',
      optimizations: appliedOptimizations,
      timestamp: new Date().toISOString()
    });

    await this.coordinator.publishEvent('cognitive:load:reduced', {
      context,
      optimizations: appliedOptimizations,
      timestamp: new Date().toISOString()
    });
  }

  private async enhanceEfficiency(context: string): Promise<void> {
    console.log(`🚀 Enhancing efficiency for ${context} (low load detected)`);

    const enhancements = [
      'Predictive suggestions',
      'Keyboard shortcuts',
      'Batch operations',
      'Smart defaults',
      'Contextual help'
    ];

    const appliedEnhancements = enhancements.slice(0, Math.floor(Math.random() * 2) + 1);

    this.optimizationHistory.push({
      context,
      action: 'enhance',
      enhancements: appliedEnhancements,
      timestamp: new Date().toISOString()
    });

    await this.coordinator.publishEvent('cognitive:efficiency:enhanced', {
      context,
      enhancements: appliedEnhancements,
      timestamp: new Date().toISOString()
    });
  }

  private async maintainOptimalLoad(context: string): Promise<void> {
    console.log(`✅ Maintaining optimal load for ${context}`);

    await this.coordinator.publishEvent('cognitive:load:optimal', {
      context,
      message: 'Load is within optimal range',
      timestamp: new Date().toISOString()
    });
  }

  getOptimizationHistory(): any[] {
    return this.optimizationHistory;
  }

  getLoadMetrics(): Map<string, number> {
    return this.loadMetrics;
  }
}

/**
 * Main Calm Technology Workflow
 * Orchestrates all calm technology agents and demonstrates the 8 principles
 */
export async function runCalmTechWorkflow(): Promise<void> {
  console.log('🚀 Starting Calm Technology Workflow Demonstration');
  console.log('='.repeat(60));

  // Initialize core systems
  const coordinator = new MultiAgentCoordinator();
  const attentionAgent = new AttentionAwareAgent(coordinator);
  const notificationSystem = new AmbientNotificationSystem(coordinator);
  const resilientSystem = new ResilientCalmSystem(coordinator);
  const loadAssessor = new CognitiveLoadAssessor(coordinator);

  try {
    // Ensure output directory exists
    await fs.ensureDir(outputDir);

    // Phase 1: Demonstrate Principle I - Minimal Attention
    console.log('\n📱 Phase 1: Minimal Attention Requirement');
    console.log('-'.repeat(40));

    await attentionAgent.assessAttentionState();
    await attentionAgent.adaptToAttentionState();

    // Phase 2: Demonstrate Principles II, III, V - Ambient Communication
    console.log('\n🌊 Phase 2: Ambient Communication System');
    console.log('-'.repeat(40));

    await notificationSystem.sendAmbientNotification(
      'Your meeting starts in 15 minutes',
      NotificationUrgency.NORMAL,
      [AmbientFeedbackType.VISUAL, AmbientFeedbackType.AUDITORY]
    );

    await notificationSystem.sendAmbientNotification(
      'System backup completed successfully',
      NotificationUrgency.LOW,
      [AmbientFeedbackType.VISUAL]
    );

    // Phase 3: Demonstrate Principle VI - Resilient Design
    console.log('\n🔧 Phase 3: Resilient System Design');
    console.log('-'.repeat(40));

    await resilientSystem.handleFailure('connectivity', 'major');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate time for recovery attempt
    await resilientSystem.attemptRecovery('connectivity');

    // Phase 4: Demonstrate Principle VII - Cognitive Load Optimization
    console.log('\n🧠 Phase 4: Cognitive Load Assessment');
    console.log('-'.repeat(40));

    await loadAssessor.assessCognitiveLoad('dashboard_view');
    await loadAssessor.assessCognitiveLoad('settings_panel');
    await loadAssessor.assessCognitiveLoad('notification_center');

    await loadAssessor.optimizeForLoad('dashboard_view');
    await loadAssessor.optimizeForLoad('settings_panel');

    // Phase 5: Demonstrate Principle VIII - Familiar Behaviors
    console.log('\n🔄 Phase 5: Familiar Behavior Patterns');
    console.log('-'.repeat(40));

    // Simulate familiar interactions that introduce calm technology concepts
    const familiarActions = [
      'Drag to organize (like files on desktop)',
      'Gentle fade-in animations (like page turns)',
      'Color-coded priorities (like traffic lights)',
      'Progressive disclosure (like nested menus)'
    ];

    for (const action of familiarActions) {
      console.log(`✓ ${action}`);
      await notificationSystem.sendAmbientNotification(
        `Applied: ${action}`,
        NotificationUrgency.LOW,
        [AmbientFeedbackType.VISUAL]
      );
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Phase 6: Demonstrate Principle IV - Amplifying Human-Technology Partnership
    console.log('\n🤝 Phase 6: Human-Technology Partnership');
    console.log('-'.repeat(40));

    // Show how technology enhances human capabilities without replacing them
    const partnerships = [
      'AI suggestions enhance creativity, don\'t replace it',
      'Automated reminders free mental space for important work',
      'Visual indicators provide awareness without demanding attention',
      'Smart defaults reduce decisions, don\'t eliminate choice'
    ];

    for (const partnership of partnerships) {
      console.log(`✓ ${partnership}`);
      await notificationSystem.sendAmbientNotification(
        partnership,
        NotificationUrgency.NORMAL,
        [AmbientFeedbackType.VISUAL, AmbientFeedbackType.AUDITORY]
      );
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    // Generate comprehensive report
    console.log('\n📊 Generating Calm Technology Report...');
    await generateCalmTechReport({
      attentionAgent,
      notificationSystem,
      resilientSystem,
      loadAssessor,
      principles: CALM_TECH_PRINCIPLES,
      outputDir
    });

    console.log('\n✅ Calm Technology Workflow completed successfully!');
    console.log(`📁 Report saved to: ${outputDir}`);

  } catch (error) {
    console.error('❌ Calm Technology Workflow failed:', error);
    throw error;
  }
}

/**
 * Generate comprehensive report of the calm technology demonstration
 */
async function generateCalmTechReport(data: {
  attentionAgent: AttentionAwareAgent;
  notificationSystem: AmbientNotificationSystem;
  resilientSystem: ResilientCalmSystem;
  loadAssessor: CognitiveLoadAssessor;
  principles: readonly string[];
  outputDir: string;
}): Promise<void> {
  const report = {
    metadata: {
      runId,
      timestamp: new Date().toISOString(),
      principles: data.principles
    },
    attentionAssessment: {
      currentState: await data.attentionAgent.assessAttentionState(),
      adaptations: 'Successfully adapted to attention state'
    },
    ambientNotifications: {
      activeCount: data.notificationSystem['activeNotifications'].size,
      types: ['visual', 'auditory', 'tactile', 'spatial']
    },
    resilience: {
      degradationLevel: data.resilientSystem['degradationLevel'],
      fallbackModes: Array.from(data.resilientSystem['fallbackModes'].keys())
    },
    cognitiveLoad: {
      metrics: Object.fromEntries(data.loadAssessor.getLoadMetrics()),
      history: data.loadAssessor.getOptimizationHistory()
    },
    conclusions: {
      principlesDemonstrated: data.principles.length,
      systemsIntegrated: 4,
      overallSuccess: true
    }
  };

  const reportPath = path.join(data.outputDir, 'calm-tech-report.json');
  await fs.writeJson(reportPath, report, { spaces: 2 });

  // Also generate a human-readable summary
  const summaryPath = path.join(data.outputDir, 'calm-tech-summary.md');
  const summary = `# Calm Technology Workflow Report

## Overview
This report summarizes the comprehensive demonstration of Calm Technology principles in a multi-agent system.

## Principles Demonstrated
${data.principles.map((principle, index) => `${index + 1}. ${principle}`).join('\n')}

## Key Results
- **Attention States**: Successfully adapted to different attention requirements
- **Ambient Notifications**: ${data.notificationSystem['activeNotifications'].size} active notifications using peripheral feedback
- **System Resilience**: Maintained functionality at degradation level ${data.resilientSystem['degradationLevel']}
- **Cognitive Optimization**: Applied ${data.loadAssessor.getOptimizationHistory().length} optimizations across contexts

## Cognitive Load Metrics
${Object.entries(data.loadAssessor.getLoadMetrics())
  .map(([context, load]) => `- ${context}: ${(load * 100).toFixed(1)}%`)
  .join('\n')}

## Conclusion
The Calm Technology workflow successfully demonstrated all 8 core principles while maintaining system functionality and user experience quality.

*Report generated: ${new Date().toISOString()}*
`;

  await fs.writeFile(summaryPath, summary);

  console.log(`📄 Report generated: ${reportPath}`);
  console.log(`📄 Summary generated: ${summaryPath}`);
}

// Export for use in other modules
export {
  AttentionAwareAgent,
  AmbientNotificationSystem,
  ResilientCalmSystem,
  CognitiveLoadAssessor,
  CALM_TECH_PRINCIPLES,
  AttentionState,
  NotificationUrgency,
  AmbientFeedbackType
};

// Run if called directly
if (require.main === module) {
  runCalmTechWorkflow()
    .then(() => {
      console.log('\n🎉 Calm Technology demonstration completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Calm Technology demonstration failed:', error);
      process.exit(1);
    });
}
