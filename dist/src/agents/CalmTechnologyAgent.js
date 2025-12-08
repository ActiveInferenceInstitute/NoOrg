"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalmTechnologyAgent = exports.AmbientFeedbackType = exports.NotificationUrgency = exports.AttentionState = void 0;
const AbstractAgent_1 = require("./AbstractAgent");
var AttentionState;
(function (AttentionState) {
    AttentionState["FOCUSED"] = "focused";
    AttentionState["PERIPHERAL"] = "peripheral";
    AttentionState["DISTRACTED"] = "distracted";
    AttentionState["UNAVAILABLE"] = "unavailable";
})(AttentionState || (exports.AttentionState = AttentionState = {}));
var NotificationUrgency;
(function (NotificationUrgency) {
    NotificationUrgency["CRITICAL"] = "critical";
    NotificationUrgency["IMPORTANT"] = "important";
    NotificationUrgency["NORMAL"] = "normal";
    NotificationUrgency["LOW"] = "low";
})(NotificationUrgency || (exports.NotificationUrgency = NotificationUrgency = {}));
var AmbientFeedbackType;
(function (AmbientFeedbackType) {
    AmbientFeedbackType["VISUAL"] = "visual";
    AmbientFeedbackType["AUDITORY"] = "auditory";
    AmbientFeedbackType["TACTILE"] = "tactile";
    AmbientFeedbackType["SPATIAL"] = "spatial";
})(AmbientFeedbackType || (exports.AmbientFeedbackType = AmbientFeedbackType = {}));
/**
 * Calm Technology Agent
 * Specialized agent for attention-aware, human-centric system design
 */
class CalmTechnologyAgent extends AbstractAgent_1.AbstractAgent {
    constructor(options) {
        super(options);
        Object.defineProperty(this, "attentionAssessments", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "activeNotifications", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "resilienceState", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "adaptationHistory", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "userContext", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        // Agent-specific configuration
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.config = options;
        // Initialize resilience state
        this.resilienceState = {
            health: 'optimal',
            activeFallbacks: [],
            recoveryAttempts: 0,
            metrics: new Map([
                ['attention_responsiveness', 1.0],
                ['ambient_effectiveness', 1.0],
                ['system_stability', 1.0],
                ['user_satisfaction', 1.0]
            ])
        };
        // Set up default configuration if not provided
        if (!this.config.attentionThresholds) {
            this.config.attentionThresholds = {
                focused: { minLoad: 0.7, maxTransitions: 2 },
                peripheral: { minLoad: 0.3, maxTransitions: 5 },
                distracted: { minLoad: 0.5, maxTransitions: 8 },
                unavailable: { minLoad: 0.8, maxTransitions: 1 }
            };
        }
        if (!this.config.ambientChannels) {
            this.config.ambientChannels = {
                visual: true,
                auditory: true,
                tactile: true,
                spatial: true
            };
        }
        if (!this.config.resilienceConfig) {
            this.config.resilienceConfig = {
                autoRecovery: true,
                fallbackModes: ['offline_queue', 'cached_local', 'essential_only'],
                healthCheckInterval: 30000 // 30 seconds
            };
        }
        if (!this.config.adaptationStrategies) {
            this.config.adaptationStrategies = [
                'interface_morphing',
                'notification_adaptation',
                'cognitive_load_balancing',
                'context_aware_positioning'
            ];
        }
    }
    async initialize() {
        try {
            console.log(`🤖 Initializing Calm Technology Agent: ${this.name}`);
            // Initialize agent capabilities
            this.capabilities = [
                'attention_assessment',
                'ambient_communication',
                'interface_adaptation',
                'cognitive_load_optimization',
                'resilience_management',
                'context_awareness',
                'user_behavior_analysis'
            ];
            // Register event listeners for calm technology events
            await this.setupEventListeners();
            // Initialize monitoring systems
            await this.initializeMonitoring();
            // Set agent status
            this.updateStatus('available');
            console.log(`✅ Calm Technology Agent initialized successfully`);
            return true;
        }
        catch (error) {
            console.error(`❌ Failed to initialize Calm Technology Agent:`, error);
            this.updateStatus('error');
            return false;
        }
    }
    async setupEventListeners() {
        // Listen for attention state changes
        this.eventSystem?.on('attention:state:changed', async (event) => {
            await this.handleAttentionStateChange(event);
        });
        // Listen for ambient notification requests
        this.eventSystem?.on('ambient:notification:request', async (event) => {
            await this.handleAmbientNotificationRequest(event);
        });
        // Listen for system degradation events
        this.eventSystem?.on('system:degraded', async (event) => {
            await this.handleSystemDegradation(event);
        });
        // Listen for cognitive load assessment requests
        this.eventSystem?.on('cognitive:load:assess', async (event) => {
            await this.assessCognitiveLoad(event.context);
        });
    }
    async initializeMonitoring() {
        if (this.config.monitoringConfig?.attentionTracking) {
            // Set up periodic attention state monitoring
            setInterval(async () => {
                await this.monitorAttentionState();
            }, 5000); // Every 5 seconds
        }
        if (this.config.monitoringConfig?.cognitiveLoadAssessment) {
            // Set up periodic cognitive load assessment
            setInterval(async () => {
                await this.assessSystemCognitiveLoad();
            }, 10000); // Every 10 seconds
        }
        if (this.config.resilienceConfig?.autoRecovery) {
            // Set up system health monitoring
            setInterval(async () => {
                await this.performHealthCheck();
            }, this.config.resilienceConfig.healthCheckInterval);
        }
    }
    async executeTask(taskDetails, context) {
        try {
            this.updateStatus('busy');
            const { action, parameters = {} } = taskDetails;
            switch (action) {
                case 'assess_attention':
                    return await this.assessAttentionState(parameters.context);
                case 'send_ambient_notification':
                    return await this.sendAmbientNotification(parameters.content, parameters.urgency, parameters.channels, parameters.context);
                case 'adapt_interface':
                    return await this.adaptInterfaceForContext(parameters.context, parameters.adaptationStrategy);
                case 'handle_system_failure':
                    return await this.handleSystemFailureGracefully(parameters.failureType, parameters.severity);
                case 'optimize_cognitive_load':
                    return await this.optimizeCognitiveLoad(parameters.context);
                case 'analyze_user_behavior':
                    return await this.analyzeUserBehaviorPatterns(parameters.timeframe);
                case 'generate_calm_recommendations':
                    return await this.generateCalmTechnologyRecommendations(parameters.context);
                default:
                    throw new Error(`Unknown calm technology action: ${action}`);
            }
        }
        catch (error) {
            console.error(`❌ Calm Technology Agent task failed:`, error);
            throw error;
        }
        finally {
            this.updateStatus('available');
        }
    }
    /**
     * Assess current attention state and provide recommendations
     */
    async assessAttentionState(context) {
        console.log(`🧠 Assessing attention state for context:`, context);
        // Gather contextual information
        const contextFactors = await this.gatherContextFactors(context);
        // Calculate cognitive load
        const cognitiveLoad = await this.calculateCognitiveLoad(contextFactors);
        // Determine attention state
        const currentState = this.determineAttentionState(cognitiveLoad, contextFactors);
        // Generate adaptation recommendations
        const recommendations = await this.generateAdaptationRecommendations(currentState, cognitiveLoad, contextFactors);
        // Create assessment
        const assessment = {
            currentState,
            cognitiveLoad,
            contextFactors,
            adaptationNeeded: recommendations.length > 0,
            recommendations,
            confidence: await this.calculateAssessmentConfidence(contextFactors),
            timestamp: Date.now()
        };
        // Store assessment for historical analysis
        this.attentionAssessments.set(`assessment_${Date.now()}`, assessment);
        // Publish assessment event
        await this.eventSystem?.publish('attention:assessment:completed', {
            assessment,
            agentId: this.id,
            timestamp: new Date().toISOString()
        });
        return assessment;
    }
    async gatherContextFactors(context) {
        const factors = new Map();
        // Time-based factors
        const now = new Date();
        factors.set('timeOfDay', now.getHours());
        factors.set('dayOfWeek', now.getDay());
        factors.set('isWeekend', now.getDay() >= 6);
        // Activity-based factors
        if (context?.currentActivity) {
            factors.set('currentActivity', context.currentActivity);
        }
        // Environmental factors
        if (context?.location) {
            factors.set('location', context.location);
        }
        // Device factors
        if (context?.deviceType) {
            factors.set('deviceType', context.deviceType);
        }
        // User preference factors
        if (context?.userPreferences) {
            factors.set('userPreferences', context.userPreferences);
        }
        return factors;
    }
    async calculateCognitiveLoad(contextFactors) {
        let load = 0;
        // Base load from time of day
        const hour = contextFactors.get('timeOfDay') || new Date().getHours();
        if (hour >= 9 && hour <= 17) {
            load += 0.3; // Work hours typically higher load
        }
        else if (hour >= 22 || hour <= 7) {
            load += 0.1; // Night/early morning lower load
        }
        else {
            load += 0.2; // Transition periods moderate load
        }
        // Activity-based load
        const activity = contextFactors.get('currentActivity');
        const activityLoad = {
            'deep_work': 0.8,
            'meeting': 0.6,
            'creative': 0.7,
            'administrative': 0.4,
            'research': 0.5,
            'planning': 0.3,
            'break': 0.1
        };
        load += activityLoad[activity] || 0.3;
        // Environmental load
        const location = contextFactors.get('location');
        const locationLoad = {
            'office': 0.2,
            'meeting_room': 0.3,
            'home': 0.1,
            'public': 0.4,
            'mobile': 0.5
        };
        load += locationLoad[location] || 0.2;
        // Device load
        const deviceType = contextFactors.get('deviceType');
        const deviceLoad = {
            'desktop': 0.1,
            'laptop': 0.2,
            'tablet': 0.3,
            'mobile': 0.4,
            'wearable': 0.1
        };
        load += deviceLoad[deviceType] || 0.2;
        // Clamp to 0-1 range
        return Math.max(0, Math.min(1, load));
    }
    determineAttentionState(cognitiveLoad, contextFactors) {
        // Determine state based on cognitive load and context
        if (cognitiveLoad >= this.config.attentionThresholds.focused.minLoad) {
            return AttentionState.FOCUSED;
        }
        else if (cognitiveLoad >= this.config.attentionThresholds.peripheral.minLoad) {
            return AttentionState.PERIPHERAL;
        }
        else if (cognitiveLoad >= this.config.attentionThresholds.distracted.minLoad) {
            return AttentionState.DISTRACTED;
        }
        else {
            return AttentionState.UNAVAILABLE;
        }
    }
    async generateAdaptationRecommendations(state, load, factors) {
        const recommendations = [];
        // State-specific recommendations
        switch (state) {
            case AttentionState.FOCUSED:
                recommendations.push('minimize_interruptions', 'reduce_notification_frequency', 'simplify_interface_elements', 'defer_non_critical_tasks');
                break;
            case AttentionState.PERIPHERAL:
                recommendations.push('enable_ambient_awareness', 'use_subtle_visual_cues', 'moderate_notification_volume', 'maintain_context_awareness');
                break;
            case AttentionState.DISTRACTED:
                recommendations.push('reduce_cognitive_load', 'simplify_information_density', 'increase_visual_hierarchy', 'limit_concurrent_tasks');
                break;
            case AttentionState.UNAVAILABLE:
                recommendations.push('defer_all_notifications', 'queue_non_critical_tasks', 'minimal_interface_mode', 'ambient_status_indicators');
                break;
        }
        // Context-specific recommendations
        const activity = factors.get('currentActivity');
        if (activity === 'deep_work' || activity === 'creative') {
            recommendations.push('protect_focus_time', 'minimize_external_interruptions');
        }
        if (activity === 'meeting' || activity === 'presentation') {
            recommendations.push('professional_mode', 'reduced_ambient_feedback');
        }
        return recommendations.filter((rec, index, arr) => arr.indexOf(rec) === index); // Remove duplicates
    }
    async calculateAssessmentConfidence(contextFactors) {
        // Calculate confidence based on available context information
        let confidence = 0.5; // Base confidence
        // More context factors increase confidence
        confidence += Math.min(0.3, contextFactors.size * 0.05);
        // Time-based context increases confidence
        if (contextFactors.has('timeOfDay'))
            confidence += 0.1;
        if (contextFactors.has('currentActivity'))
            confidence += 0.2;
        // Environmental context increases confidence
        if (contextFactors.has('location'))
            confidence += 0.1;
        if (contextFactors.has('deviceType'))
            confidence += 0.1;
        return Math.min(1.0, confidence);
    }
    /**
     * Send ambient notification through appropriate channels
     */
    async sendAmbientNotification(content, urgency = NotificationUrgency.NORMAL, channels = [AmbientFeedbackType.VISUAL], context) {
        const notificationId = `ambient_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        // Create ambient notification
        const notification = {
            id: notificationId,
            content,
            urgency,
            channels: this.filterAvailableChannels(channels),
            persistence: this.determinePersistence(urgency, context),
            context: context ? new Map(Object.entries(context)) : new Map(),
            createdAt: Date.now(),
            expiresAt: this.calculateExpirationTime(urgency, context)
        };
        // Adapt notification for current attention state
        await this.adaptNotificationForAttention(notification);
        // Send through appropriate channels
        await this.renderAmbientNotification(notification);
        // Store notification
        this.activeNotifications.set(notificationId, notification);
        // Publish notification event
        await this.eventSystem?.publish('ambient:notification:sent', {
            notificationId,
            content,
            urgency,
            channels: notification.channels,
            timestamp: new Date().toISOString()
        });
        return notificationId;
    }
    filterAvailableChannels(requestedChannels) {
        return requestedChannels.filter(channel => this.config.ambientChannels[channel]);
    }
    determinePersistence(urgency, context) {
        switch (urgency) {
            case NotificationUrgency.CRITICAL:
                return 'persistent';
            case NotificationUrgency.IMPORTANT:
                return 'contextual';
            case NotificationUrgency.NORMAL:
                return 'contextual';
            case NotificationUrgency.LOW:
                return 'ephemeral';
            default:
                return 'contextual';
        }
    }
    calculateExpirationTime(urgency, context) {
        const baseTimes = {
            [NotificationUrgency.CRITICAL]: 300000, // 5 minutes
            [NotificationUrgency.IMPORTANT]: 120000, // 2 minutes
            [NotificationUrgency.NORMAL]: 60000, // 1 minute
            [NotificationUrgency.LOW]: 30000 // 30 seconds
        };
        return Date.now() + (baseTimes[urgency] || 60000);
    }
    async adaptNotificationForAttention(notification) {
        // Get current attention state
        const currentAssessment = await this.assessAttentionState();
        const attentionState = currentAssessment.currentState;
        // Adapt based on attention state
        switch (attentionState) {
            case AttentionState.FOCUSED:
                // Minimize notification intensity for focused users
                if (notification.urgency !== NotificationUrgency.CRITICAL) {
                    notification.channels = [AmbientFeedbackType.VISUAL]; // Visual only
                }
                break;
            case AttentionState.PERIPHERAL:
                // Standard ambient notification
                break;
            case AttentionState.DISTRACTED:
                // Simplify notification for distracted users
                notification.content = notification.content.length > 20 ?
                    notification.content.substring(0, 20) + '...' : notification.content;
                break;
            case AttentionState.UNAVAILABLE:
                // Queue notification for later
                notification.expiresAt = Date.now() + 300000; // 5 minutes later
                break;
        }
    }
    async renderAmbientNotification(notification) {
        for (const channel of notification.channels) {
            await this.renderChannelNotification(notification, channel);
        }
    }
    async renderChannelNotification(notification, channel) {
        switch (channel) {
            case AmbientFeedbackType.VISUAL:
                await this.renderVisualNotification(notification);
                break;
            case AmbientFeedbackType.AUDITORY:
                await this.renderAuditoryNotification(notification);
                break;
            case AmbientFeedbackType.TACTILE:
                await this.renderTactileNotification(notification);
                break;
            case AmbientFeedbackType.SPATIAL:
                await this.renderSpatialNotification(notification);
                break;
        }
    }
    async renderVisualNotification(notification) {
        const visualConfig = {
            content: notification.content,
            urgency: notification.urgency,
            opacity: this.getOpacityForUrgency(notification.urgency),
            color: this.getColorForUrgency(notification.urgency),
            position: this.getPositionForUrgency(notification.urgency),
            animation: this.getAnimationForUrgency(notification.urgency)
        };
        console.log(`🎨 Visual ambient notification: ${notification.content} (${visualConfig.opacity} opacity)`);
        await this.eventSystem?.publish('ambient:visual:rendered', {
            notificationId: notification.id,
            visualConfig,
            timestamp: new Date().toISOString()
        });
    }
    async renderAuditoryNotification(notification) {
        const auditoryConfig = {
            content: notification.content,
            urgency: notification.urgency,
            volume: this.getVolumeForUrgency(notification.urgency),
            tone: this.getToneForUrgency(notification.urgency),
            duration: this.getDurationForUrgency(notification.urgency)
        };
        console.log(`🔊 Auditory ambient notification: ${notification.content} (${auditoryConfig.volume} volume)`);
        await this.eventSystem?.publish('ambient:auditory:rendered', {
            notificationId: notification.id,
            auditoryConfig,
            timestamp: new Date().toISOString()
        });
    }
    async renderTactileNotification(notification) {
        const tactileConfig = {
            urgency: notification.urgency,
            intensity: this.getIntensityForUrgency(notification.urgency),
            pattern: this.getPatternForUrgency(notification.urgency),
            duration: this.getTactileDurationForUrgency(notification.urgency)
        };
        console.log(`📳 Tactile ambient notification: ${tactileConfig.pattern} pattern (${tactileConfig.intensity} intensity)`);
        await this.eventSystem?.publish('ambient:tactile:rendered', {
            notificationId: notification.id,
            tactileConfig,
            timestamp: new Date().toISOString()
        });
    }
    async renderSpatialNotification(notification) {
        const spatialConfig = {
            urgency: notification.urgency,
            position: this.getSpatialPositionForUrgency(notification.urgency),
            proximity: this.getProximityForUrgency(notification.urgency),
            movement: this.getMovementForUrgency(notification.urgency)
        };
        console.log(`📐 Spatial ambient notification: ${notification.content} (${spatialConfig.position} position)`);
        await this.eventSystem?.publish('ambient:spatial:rendered', {
            notificationId: notification.id,
            spatialConfig,
            timestamp: new Date().toISOString()
        });
    }
    getOpacityForUrgency(urgency) {
        const opacities = {
            [NotificationUrgency.CRITICAL]: 0.9,
            [NotificationUrgency.IMPORTANT]: 0.7,
            [NotificationUrgency.NORMAL]: 0.5,
            [NotificationUrgency.LOW]: 0.3
        };
        return opacities[urgency] || 0.5;
    }
    getColorForUrgency(urgency) {
        const colors = {
            [NotificationUrgency.CRITICAL]: '#ff4444',
            [NotificationUrgency.IMPORTANT]: '#ff8800',
            [NotificationUrgency.NORMAL]: '#4444ff',
            [NotificationUrgency.LOW]: '#888888'
        };
        return colors[urgency] || '#4444ff';
    }
    getPositionForUrgency(urgency) {
        const positions = {
            [NotificationUrgency.CRITICAL]: 'center',
            [NotificationUrgency.IMPORTANT]: 'peripheral_edge',
            [NotificationUrgency.NORMAL]: 'background',
            [NotificationUrgency.LOW]: 'environmental'
        };
        return positions[urgency] || 'background';
    }
    getAnimationForUrgency(urgency) {
        const animations = {
            [NotificationUrgency.CRITICAL]: 'pulse',
            [NotificationUrgency.IMPORTANT]: 'fade',
            [NotificationUrgency.NORMAL]: 'breathe',
            [NotificationUrgency.LOW]: 'drift'
        };
        return animations[urgency] || 'fade';
    }
    getVolumeForUrgency(urgency) {
        const volumes = {
            [NotificationUrgency.CRITICAL]: 0.6,
            [NotificationUrgency.IMPORTANT]: 0.4,
            [NotificationUrgency.NORMAL]: 0.2,
            [NotificationUrgency.LOW]: 0.1
        };
        return volumes[urgency] || 0.3;
    }
    getToneForUrgency(urgency) {
        const tones = {
            [NotificationUrgency.CRITICAL]: 'urgent_chime',
            [NotificationUrgency.IMPORTANT]: 'soft_tone',
            [NotificationUrgency.NORMAL]: 'subtle_click',
            [NotificationUrgency.LOW]: 'gentle_breeze'
        };
        return tones[urgency] || 'soft_tone';
    }
    getDurationForUrgency(urgency) {
        const durations = {
            [NotificationUrgency.CRITICAL]: 2000,
            [NotificationUrgency.IMPORTANT]: 1500,
            [NotificationUrgency.NORMAL]: 1000,
            [NotificationUrgency.LOW]: 500
        };
        return durations[urgency] || 1000;
    }
    getIntensityForUrgency(urgency) {
        const intensities = {
            [NotificationUrgency.CRITICAL]: 0.8,
            [NotificationUrgency.IMPORTANT]: 0.6,
            [NotificationUrgency.NORMAL]: 0.4,
            [NotificationUrgency.LOW]: 0.2
        };
        return intensities[urgency] || 0.4;
    }
    getPatternForUrgency(urgency) {
        const patterns = {
            [NotificationUrgency.CRITICAL]: 'pulse_strong',
            [NotificationUrgency.IMPORTANT]: 'pulse_medium',
            [NotificationUrgency.NORMAL]: 'pulse_light',
            [NotificationUrgency.LOW]: 'continuous_gentle'
        };
        return patterns[urgency] || 'pulse_light';
    }
    getTactileDurationForUrgency(urgency) {
        const durations = {
            [NotificationUrgency.CRITICAL]: 1500,
            [NotificationUrgency.IMPORTANT]: 1000,
            [NotificationUrgency.NORMAL]: 750,
            [NotificationUrgency.LOW]: 500
        };
        return durations[urgency] || 750;
    }
    getSpatialPositionForUrgency(urgency) {
        const positions = {
            [NotificationUrgency.CRITICAL]: 'center_stage',
            [NotificationUrgency.IMPORTANT]: 'edge_noticeable',
            [NotificationUrgency.NORMAL]: 'peripheral_edge',
            [NotificationUrgency.LOW]: 'background'
        };
        return positions[urgency] || 'peripheral_edge';
    }
    getProximityForUrgency(urgency) {
        const proximities = {
            [NotificationUrgency.CRITICAL]: 'intimate',
            [NotificationUrgency.IMPORTANT]: 'near',
            [NotificationUrgency.NORMAL]: 'distant',
            [NotificationUrgency.LOW]: 'environmental'
        };
        return proximities[urgency] || 'distant';
    }
    getMovementForUrgency(urgency) {
        const movements = {
            [NotificationUrgency.CRITICAL]: 'static',
            [NotificationUrgency.IMPORTANT]: 'subtle',
            [NotificationUrgency.NORMAL]: 'orbital',
            [NotificationUrgency.LOW]: 'flow'
        };
        return movements[urgency] || 'subtle';
    }
    // Event handlers for calm technology events
    async handleAttentionStateChange(event) {
        console.log(`👁️ Attention state change detected:`, event);
        // Update user context
        this.userContext.set('attentionState', event.newState);
        this.userContext.set('lastAttentionChange', new Date().toISOString());
        // Adapt active notifications
        await this.adaptActiveNotificationsForNewState(event.newState);
        // Record adaptation
        this.adaptationHistory.push({
            type: 'attention_state_change',
            from: event.previousState,
            to: event.newState,
            timestamp: new Date().toISOString(),
            adaptations: this.config.adaptationStrategies
        });
    }
    async handleAmbientNotificationRequest(event) {
        console.log(`🌊 Ambient notification request:`, event);
        await this.sendAmbientNotification(event.content, event.urgency || NotificationUrgency.NORMAL, event.channels || [AmbientFeedbackType.VISUAL], event.context);
    }
    async handleSystemDegradation(event) {
        console.log(`🔧 System degradation detected:`, event);
        // Update resilience state
        this.resilienceState.health = event.severity === 'critical' ? 'critical' :
            event.severity === 'major' ? 'degraded' : 'optimal';
        // Apply fallback modes
        await this.applyFallbackModes(event.fallbackModes);
        // Update metrics
        this.resilienceState.metrics.set('system_stability', event.severity === 'critical' ? 0.3 :
            event.severity === 'major' ? 0.6 : 1.0);
    }
    async adaptActiveNotificationsForNewState(newState) {
        for (const [id, notification] of this.activeNotifications) {
            if (notification.persistence === 'adaptive') {
                // Re-adapt notification for new attention state
                await this.adaptNotificationForAttention(notification);
                // Re-render if still active
                if (notification.expiresAt && notification.expiresAt > Date.now()) {
                    await this.renderAmbientNotification(notification);
                }
            }
        }
    }
    async applyFallbackModes(fallbackModes) {
        this.resilienceState.activeFallbacks = fallbackModes;
        for (const mode of fallbackModes) {
            console.log(`🔄 Applying fallback mode: ${mode}`);
            // Implement fallback mode logic here
        }
    }
    // Additional calm technology methods
    async monitorAttentionState() {
        const assessment = await this.assessAttentionState();
        // Check for significant changes
        const lastAssessment = Array.from(this.attentionAssessments.values()).pop();
        if (lastAssessment && lastAssessment.currentState !== assessment.currentState) {
            console.log(`📈 Attention state changed: ${lastAssessment.currentState} → ${assessment.currentState}`);
            // Publish attention state change event
            await this.eventSystem?.publish('attention:state:changed', {
                previousState: lastAssessment.currentState,
                newState: assessment.currentState,
                cognitiveLoad: assessment.cognitiveLoad,
                confidence: assessment.confidence,
                timestamp: new Date().toISOString()
            });
        }
    }
    async assessSystemCognitiveLoad() {
        const activeNotifications = this.activeNotifications.size;
        const recentAdaptations = this.adaptationHistory.length;
        // Calculate system cognitive load based on activity
        const systemLoad = Math.min(1.0, (activeNotifications * 0.1) + (recentAdaptations * 0.05));
        // Update resilience metrics
        this.resilienceState.metrics.set('cognitive_load', systemLoad);
        console.log(`🧠 System cognitive load: ${(systemLoad * 100).toFixed(1)}%`);
    }
    async performHealthCheck() {
        // Assess system health across multiple dimensions
        const attentionResponsiveness = this.resilienceState.metrics.get('attention_responsiveness') || 1.0;
        const ambientEffectiveness = this.resilienceState.metrics.get('ambient_effectiveness') || 1.0;
        const systemStability = this.resilienceState.metrics.get('system_stability') || 1.0;
        const userSatisfaction = this.resilienceState.metrics.get('user_satisfaction') || 1.0;
        const overallHealth = (attentionResponsiveness + ambientEffectiveness +
            systemStability + userSatisfaction) / 4;
        // Update health status
        if (overallHealth >= 0.8) {
            this.resilienceState.health = 'optimal';
        }
        else if (overallHealth >= 0.6) {
            this.resilienceState.health = 'degraded';
        }
        else if (overallHealth >= 0.4) {
            this.resilienceState.health = 'critical';
        }
        else {
            this.resilienceState.health = 'failure';
        }
        console.log(`🏥 System health check: ${this.resilienceState.health} (${(overallHealth * 100).toFixed(1)}%)`);
        // Publish health status
        await this.eventSystem?.publish('system:health:checked', {
            health: this.resilienceState.health,
            overallScore: overallHealth,
            metrics: Object.fromEntries(this.resilienceState.metrics),
            timestamp: new Date().toISOString()
        });
    }
    async adaptInterfaceForContext(context, strategy) {
        console.log(`🔄 Adapting interface for context:`, context);
        // Determine adaptation strategy
        const adaptationStrategy = strategy || this.selectAdaptationStrategy(context);
        // Apply strategy
        switch (adaptationStrategy) {
            case 'interface_morphing':
                await this.morphInterfaceForContext(context);
                break;
            case 'notification_adaptation':
                await this.adaptNotificationsForContext(context);
                break;
            case 'cognitive_load_balancing':
                await this.balanceCognitiveLoad(context);
                break;
            case 'context_aware_positioning':
                await this.positionElementsContextually(context);
                break;
        }
        // Record adaptation
        this.adaptationHistory.push({
            type: 'interface_adaptation',
            strategy: adaptationStrategy,
            context,
            timestamp: new Date().toISOString()
        });
    }
    selectAdaptationStrategy(context) {
        // Select strategy based on context
        if (context.currentActivity === 'deep_work' || context.currentActivity === 'creative') {
            return 'interface_morphing';
        }
        else if (context.location === 'meeting' || context.socialSetting === 'group') {
            return 'notification_adaptation';
        }
        else if (context.deviceType === 'mobile' || context.deviceType === 'wearable') {
            return 'context_aware_positioning';
        }
        else {
            return 'cognitive_load_balancing';
        }
    }
    async morphInterfaceForContext(context) {
        console.log(`🎨 Morphing interface for context: ${context.currentActivity}`);
        await this.eventSystem?.publish('interface:morphing', {
            context,
            adaptations: ['simplified_layout', 'reduced_animations', 'focus_mode'],
            timestamp: new Date().toISOString()
        });
    }
    async adaptNotificationsForContext(context) {
        console.log(`📢 Adapting notifications for context: ${context.location}`);
        await this.eventSystem?.publish('notifications:adapted', {
            context,
            adaptations: ['reduced_volume', 'professional_mode', 'deferred_non_critical'],
            timestamp: new Date().toISOString()
        });
    }
    async balanceCognitiveLoad(context) {
        console.log(`⚖️ Balancing cognitive load for context: ${context.currentActivity}`);
        await this.eventSystem?.publish('cognitive:load:balanced', {
            context,
            optimizations: ['reduced_information_density', 'increased_spacing', 'clearer_hierarchy'],
            timestamp: new Date().toISOString()
        });
    }
    async positionElementsContextually(context) {
        console.log(`📐 Positioning elements for context: ${context.deviceType}`);
        await this.eventSystem?.publish('elements:positioned', {
            context,
            positioning: ['edge_awareness', 'thumb_reach_optimization', 'contextual_grouping'],
            timestamp: new Date().toISOString()
        });
    }
    async handleSystemFailureGracefully(failureType, severity) {
        console.log(`😌 Handling system failure gracefully: ${failureType} (${severity})`);
        // Update resilience state
        this.resilienceState.health = severity === 'critical' ? 'critical' : 'degraded';
        this.resilienceState.lastFailure = failureType;
        // Apply appropriate fallback modes
        const fallbackModes = this.selectFallbackModes(failureType, severity);
        await this.applyFallbackModes(fallbackModes);
        // Send calm failure notification
        await this.sendAmbientNotification(`System ${severity} issue: ${failureType}. Operating in safe mode.`, severity === 'critical' ? NotificationUrgency.IMPORTANT : NotificationUrgency.NORMAL, [AmbientFeedbackType.VISUAL], { failureType, severity });
        // Publish failure handling event
        await this.eventSystem?.publish('system:failure:handled', {
            failureType,
            severity,
            fallbackModes,
            calmHandling: true,
            timestamp: new Date().toISOString()
        });
    }
    selectFallbackModes(failureType, severity) {
        const modeMapping = {
            'connectivity_loss': ['offline_queue', 'cached_local'],
            'resource_exhaustion': ['essential_only', 'sequential_processing'],
            'component_failure': ['basic_interactive', 'ambient_indicators'],
            'external_dependency': ['cached_local', 'offline_queue']
        };
        const baseModes = modeMapping[failureType] || ['essential_only'];
        // Add more modes for critical failures
        if (severity === 'critical') {
            return [...baseModes, 'minimal_interface', 'deferred_notifications'];
        }
        return baseModes;
    }
    async optimizeCognitiveLoad(context) {
        console.log(`🚀 Optimizing cognitive load for context:`, context);
        // Assess current cognitive load
        const assessment = await this.assessAttentionState(context);
        if (assessment.cognitiveLoad > 0.7) {
            // High cognitive load - apply optimizations
            await this.applyCognitiveOptimizations(context, assessment);
        }
        else if (assessment.cognitiveLoad < 0.3) {
            // Low cognitive load - enhance efficiency
            await this.enhanceEfficiency(context, assessment);
        }
        // Record optimization
        this.adaptationHistory.push({
            type: 'cognitive_optimization',
            context,
            assessment,
            timestamp: new Date().toISOString()
        });
    }
    async applyCognitiveOptimizations(context, assessment) {
        const optimizations = [
            'reduced_information_density',
            'simplified_visual_hierarchy',
            'deferred_non_critical_notifications',
            'increased_element_spacing',
            'reduced_animation_complexity'
        ];
        console.log(`⚖️ Applying ${optimizations.length} cognitive optimizations`);
        await this.eventSystem?.publish('cognitive:optimizations:applied', {
            context,
            assessment,
            optimizations,
            timestamp: new Date().toISOString()
        });
    }
    async enhanceEfficiency(context, assessment) {
        const enhancements = [
            'predictive_suggestions',
            'keyboard_shortcuts',
            'batch_operations',
            'smart_defaults',
            'contextual_help'
        ];
        console.log(`🚀 Applying ${enhancements.length} efficiency enhancements`);
        await this.eventSystem?.publish('efficiency:enhancements:applied', {
            context,
            assessment,
            enhancements,
            timestamp: new Date().toISOString()
        });
    }
    async analyzeUserBehaviorPatterns(timeframe = '24h') {
        console.log(`📊 Analyzing user behavior patterns for timeframe: ${timeframe}`);
        // Gather behavior data
        const attentionTransitions = Array.from(this.attentionAssessments.values());
        const adaptationEvents = this.adaptationHistory;
        const notificationPatterns = Array.from(this.activeNotifications.values());
        // Analyze patterns
        const analysis = {
            attentionPatterns: this.analyzeAttentionTransitions(attentionTransitions),
            adaptationEffectiveness: this.analyzeAdaptationEffectiveness(adaptationEvents),
            notificationPreferences: this.analyzeNotificationPatterns(notificationPatterns),
            contextCorrelations: this.analyzeContextCorrelations(),
            recommendations: await this.generateBehaviorRecommendations(analysis)
        };
        console.log(`✅ Behavior analysis completed with ${Object.keys(analysis).length} insights`);
        return analysis;
    }
    analyzeAttentionTransitions(transitions) {
        const stateCounts = transitions.reduce((acc, t) => {
            acc[t.currentState] = (acc[t.currentState] || 0) + 1;
            return acc;
        }, {});
        const totalTransitions = transitions.length;
        const distribution = Object.fromEntries(Object.entries(stateCounts).map(([state, count]) => [
            state,
            totalTransitions > 0 ? (count / totalTransitions * 100).toFixed(1) + '%' : '0%'
        ]));
        return {
            totalTransitions,
            stateDistribution: distribution,
            dominantState: Object.entries(stateCounts).reduce((a, b) => stateCounts[a[0]] > stateCounts[b[0]] ? a : b)[0]
        };
    }
    analyzeAdaptationEffectiveness(adaptations) {
        const strategyCounts = adaptations.reduce((acc, a) => {
            acc[a.strategy] = (acc[a.strategy] || 0) + 1;
            return acc;
        }, {});
        return {
            totalAdaptations: adaptations.length,
            strategyDistribution: strategyCounts,
            mostUsedStrategy: Object.entries(strategyCounts).reduce((a, b) => strategyCounts[a[0]] > strategyCounts[b[0]] ? a : b)[0]
        };
    }
    analyzeNotificationPatterns(notifications) {
        const urgencyCounts = notifications.reduce((acc, n) => {
            acc[n.urgency] = (acc[n.urgency] || 0) + 1;
            return acc;
        }, {});
        const channelUsage = notifications.reduce((acc, n) => {
            n.channels.forEach(channel => {
                acc[channel] = (acc[channel] || 0) + 1;
            });
            return acc;
        }, {});
        return {
            totalNotifications: notifications.length,
            urgencyDistribution: urgencyCounts,
            channelUsage,
            averageChannelsPerNotification: notifications.reduce((sum, n) => sum + n.channels.length, 0) / notifications.length || 0
        };
    }
    analyzeContextCorrelations() {
        // Analyze correlations between context factors and attention states
        return {
            activityCorrelations: {},
            locationCorrelations: {},
            timeCorrelations: {},
            deviceCorrelations: {}
        };
    }
    async generateBehaviorRecommendations(analysis) {
        const recommendations = [];
        // Based on attention patterns
        if (analysis.attentionPatterns.dominantState === AttentionState.FOCUSED) {
            recommendations.push('User frequently in focused state - minimize interruptions');
        }
        else if (analysis.attentionPatterns.dominantState === AttentionState.DISTRACTED) {
            recommendations.push('User frequently distracted - reduce cognitive load');
        }
        // Based on adaptation effectiveness
        if (analysis.adaptationEffectiveness.mostUsedStrategy === 'interface_morphing') {
            recommendations.push('Interface morphing is effective - continue this strategy');
        }
        // Based on notification patterns
        if (analysis.notificationPreferences.averageChannelsPerNotification > 2) {
            recommendations.push('Multiple channels per notification - consider reducing for calmer experience');
        }
        return recommendations;
    }
    async generateCalmTechnologyRecommendations(context) {
        console.log(`🎯 Generating calm technology recommendations for context:`, context);
        const recommendations = {
            attentionOptimization: await this.generateAttentionRecommendations(context),
            interfaceImprovements: await this.generateInterfaceRecommendations(context),
            notificationOptimizations: await this.generateNotificationRecommendations(context),
            resilienceEnhancements: await this.generateResilienceRecommendations(context),
            implementation: await this.generateImplementationRecommendations(context)
        };
        return recommendations;
    }
    async generateAttentionRecommendations(context) {
        const recommendations = [];
        if (context.currentActivity === 'deep_work') {
            recommendations.push('Implement focus protection mode with minimal ambient feedback');
        }
        if (context.cognitiveLoad && context.cognitiveLoad > 0.7) {
            recommendations.push('Reduce information density and defer non-critical notifications');
        }
        return recommendations;
    }
    async generateInterfaceRecommendations(context) {
        const recommendations = [];
        if (context.deviceType === 'mobile') {
            recommendations.push('Optimize for thumb reach and one-handed operation');
        }
        if (context.location === 'meeting') {
            recommendations.push('Enable presentation mode with reduced visual complexity');
        }
        return recommendations;
    }
    async generateNotificationRecommendations(context) {
        const recommendations = [];
        if (context.socialSetting === 'group') {
            recommendations.push('Minimize auditory notifications in group settings');
        }
        if (context.timeOfDay >= 22 || context.timeOfDay <= 7) {
            recommendations.push('Reduce notification intensity during sleep hours');
        }
        return recommendations;
    }
    async generateResilienceRecommendations(context) {
        const recommendations = [];
        if (context.deviceType === 'mobile') {
            recommendations.push('Implement aggressive offline mode for mobile connectivity');
        }
        recommendations.push('Add circuit breaker patterns for external service dependencies');
        return recommendations;
    }
    async generateImplementationRecommendations(context) {
        const recommendations = [];
        recommendations.push('Integrate with existing agent coordination framework');
        recommendations.push('Implement comprehensive monitoring and analytics');
        recommendations.push('Add user preference learning for personalized calm experiences');
        return recommendations;
    }
    async shutdown() {
        try {
            console.log(`🔌 Shutting down Calm Technology Agent: ${this.name}`);
            // Clean up active notifications
            this.activeNotifications.clear();
            // Archive adaptation history
            if (this.adaptationHistory.length > 0) {
                console.log(`📚 Archived ${this.adaptationHistory.length} adaptation events`);
            }
            // Publish shutdown event
            await this.eventSystem?.publish('agent:shutdown', {
                agentId: this.id,
                agentType: 'CalmTechnologyAgent',
                timestamp: new Date().toISOString(),
                finalMetrics: Object.fromEntries(this.resilienceState.metrics)
            });
            console.log(`✅ Calm Technology Agent shutdown completed`);
            return true;
        }
        catch (error) {
            console.error(`❌ Failed to shutdown Calm Technology Agent:`, error);
            return false;
        }
    }
    // Getter methods for accessing agent state
    getAttentionAssessments() {
        return this.attentionAssessments;
    }
    getActiveNotifications() {
        return this.activeNotifications;
    }
    getResilienceState() {
        return this.resilienceState;
    }
    getAdaptationHistory() {
        return this.adaptationHistory;
    }
    getAgentInfo() {
        return {
            id: this.id,
            name: this.name,
            type: 'CalmTechnologyAgent',
            description: 'Specialized agent for calm technology implementation and attention-aware system design',
            capabilities: this.capabilities,
            status: this.status,
            metadata: {
                attentionThresholds: this.config.attentionThresholds,
                ambientChannels: this.config.ambientChannels,
                resilienceConfig: this.config.resilienceConfig,
                adaptationStrategies: this.config.adaptationStrategies,
                monitoringConfig: this.config.monitoringConfig,
                attentionAssessments: this.attentionAssessments.size,
                activeNotifications: this.activeNotifications.size,
                adaptationHistory: this.adaptationHistory.length,
                resilienceState: this.resilienceState.health
            },
            preferredModel: this.config.preferredModel,
            lastActive: this.lastActive,
            createdAt: this.createdAt
        };
    }
}
exports.CalmTechnologyAgent = CalmTechnologyAgent;
//# sourceMappingURL=CalmTechnologyAgent.js.map