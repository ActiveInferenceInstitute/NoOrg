/**
 * Calm Technology Agent
 *
 * A specialized agent designed specifically for calm technology applications,
 * integrating attention-aware interfaces, ambient communication, and resilient
 * system design within the NoOrg Multi-Agent Framework.
 *
 * This agent demonstrates how AI systems can be designed to respect human
 * attention, maintain peripheral awareness, and provide graceful degradation
 * while enhancing rather than competing with human capabilities.
 */
import { AbstractAgent, AbstractAgentOptions } from './AbstractAgent';
export interface CalmTechnologyAgentConfig extends AbstractAgentOptions {
    attentionThresholds?: {
        focused: {
            minLoad: number;
            maxTransitions: number;
        };
        peripheral: {
            minLoad: number;
            maxTransitions: number;
        };
        distracted: {
            minLoad: number;
            maxTransitions: number;
        };
        unavailable: {
            minLoad: number;
            maxTransitions: number;
        };
    };
    ambientChannels?: {
        visual: boolean;
        auditory: boolean;
        tactile: boolean;
        spatial: boolean;
    };
    resilienceConfig?: {
        autoRecovery: boolean;
        fallbackModes: string[];
        healthCheckInterval: number;
    };
    adaptationStrategies?: string[];
    monitoringConfig?: {
        attentionTracking: boolean;
        cognitiveLoadAssessment: boolean;
        userSatisfactionMetrics: boolean;
        systemPerformanceMetrics: boolean;
    };
}
export declare enum AttentionState {
    FOCUSED = "focused",
    PERIPHERAL = "peripheral",
    DISTRACTED = "distracted",
    UNAVAILABLE = "unavailable"
}
export declare enum NotificationUrgency {
    CRITICAL = "critical",
    IMPORTANT = "important",
    NORMAL = "normal",
    LOW = "low"
}
export declare enum AmbientFeedbackType {
    VISUAL = "visual",
    AUDITORY = "auditory",
    TACTILE = "tactile",
    SPATIAL = "spatial"
}
export interface AttentionAssessment {
    currentState: AttentionState;
    cognitiveLoad: number;
    contextFactors: Map<string, any>;
    adaptationNeeded: boolean;
    recommendations: string[];
    confidence: number;
    timestamp: number;
}
export interface AmbientNotification {
    id: string;
    content: string;
    urgency: NotificationUrgency;
    channels: AmbientFeedbackType[];
    persistence: 'ephemeral' | 'persistent' | 'contextual' | 'adaptive';
    context: Map<string, any>;
    createdAt: number;
    expiresAt?: number;
}
export interface SystemResilienceState {
    health: 'optimal' | 'degraded' | 'critical' | 'failure' | 'recovery';
    activeFallbacks: string[];
    recoveryAttempts: number;
    lastFailure?: string;
    metrics: Map<string, number>;
}
/**
 * Calm Technology Agent
 * Specialized agent for attention-aware, human-centric system design
 */
export declare class CalmTechnologyAgent extends AbstractAgent {
    private attentionAssessments;
    private activeNotifications;
    private resilienceState;
    private adaptationHistory;
    private userContext;
    private config;
    constructor(options: CalmTechnologyAgentConfig);
    initialize(): Promise<boolean>;
    private setupEventListeners;
    private initializeMonitoring;
    executeTask(taskDetails: any, context?: any): Promise<any>;
    /**
     * Assess current attention state and provide recommendations
     */
    assessAttentionState(context?: any): Promise<AttentionAssessment>;
    private gatherContextFactors;
    private calculateCognitiveLoad;
    private determineAttentionState;
    private generateAdaptationRecommendations;
    private calculateAssessmentConfidence;
    /**
     * Send ambient notification through appropriate channels
     */
    sendAmbientNotification(content: string, urgency?: NotificationUrgency, channels?: AmbientFeedbackType[], context?: any): Promise<string>;
    private filterAvailableChannels;
    private determinePersistence;
    private calculateExpirationTime;
    private adaptNotificationForAttention;
    private renderAmbientNotification;
    private renderChannelNotification;
    private renderVisualNotification;
    private renderAuditoryNotification;
    private renderTactileNotification;
    private renderSpatialNotification;
    private getOpacityForUrgency;
    private getColorForUrgency;
    private getPositionForUrgency;
    private getAnimationForUrgency;
    private getVolumeForUrgency;
    private getToneForUrgency;
    private getDurationForUrgency;
    private getIntensityForUrgency;
    private getPatternForUrgency;
    private getTactileDurationForUrgency;
    private getSpatialPositionForUrgency;
    private getProximityForUrgency;
    private getMovementForUrgency;
    private handleAttentionStateChange;
    private handleAmbientNotificationRequest;
    private handleSystemDegradation;
    private adaptActiveNotificationsForNewState;
    private applyFallbackModes;
    private monitorAttentionState;
    private assessSystemCognitiveLoad;
    private performHealthCheck;
    adaptInterfaceForContext(context: any, strategy?: string): Promise<void>;
    private selectAdaptationStrategy;
    private morphInterfaceForContext;
    private adaptNotificationsForContext;
    private balanceCognitiveLoad;
    private positionElementsContextually;
    handleSystemFailureGracefully(failureType: string, severity: string): Promise<void>;
    private selectFallbackModes;
    optimizeCognitiveLoad(context: any): Promise<void>;
    private applyCognitiveOptimizations;
    private enhanceEfficiency;
    analyzeUserBehaviorPatterns(timeframe?: string): Promise<any>;
    private analyzeAttentionTransitions;
    private analyzeAdaptationEffectiveness;
    private analyzeNotificationPatterns;
    private analyzeContextCorrelations;
    private generateBehaviorRecommendations;
    generateCalmTechnologyRecommendations(context: any): Promise<any>;
    private generateAttentionRecommendations;
    private generateInterfaceRecommendations;
    private generateNotificationRecommendations;
    private generateResilienceRecommendations;
    private generateImplementationRecommendations;
    shutdown(): Promise<boolean>;
    getAttentionAssessments(): Map<string, AttentionAssessment>;
    getActiveNotifications(): Map<string, AmbientNotification>;
    getResilienceState(): SystemResilienceState;
    getAdaptationHistory(): any[];
    getAgentInfo(): {
        id: string;
        name: string;
        type: string;
        description: string;
        capabilities: string[];
        status: "error" | "available" | "busy" | "offline" | "initializing";
        metadata: {
            attentionThresholds: {
                focused: {
                    minLoad: number;
                    maxTransitions: number;
                };
                peripheral: {
                    minLoad: number;
                    maxTransitions: number;
                };
                distracted: {
                    minLoad: number;
                    maxTransitions: number;
                };
                unavailable: {
                    minLoad: number;
                    maxTransitions: number;
                };
            };
            ambientChannels: {
                visual: boolean;
                auditory: boolean;
                tactile: boolean;
                spatial: boolean;
            };
            resilienceConfig: {
                autoRecovery: boolean;
                fallbackModes: string[];
                healthCheckInterval: number;
            };
            adaptationStrategies: string[];
            monitoringConfig: {
                attentionTracking: boolean;
                cognitiveLoadAssessment: boolean;
                userSatisfactionMetrics: boolean;
                systemPerformanceMetrics: boolean;
            };
            attentionAssessments: number;
            activeNotifications: number;
            adaptationHistory: number;
            resilienceState: "critical" | "optimal" | "degraded" | "failure" | "recovery";
        };
        preferredModel: string;
        lastActive: number;
        createdAt: number;
    };
}
//# sourceMappingURL=CalmTechnologyAgent.d.ts.map