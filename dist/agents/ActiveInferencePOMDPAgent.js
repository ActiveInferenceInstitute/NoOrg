"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActiveInferencePOMDPAgent = void 0;
/**
 * ActiveInferencePOMDPAgent - An agent that uses Active Inference with POMDP for decision making
 *
 * This agent implements a Partially Observable Markov Decision Process (POMDP) within
 * the Active Inference framework. It can process observations and generate beliefs,
 * policies, and take actions according to the Free Energy Principle.
 */
class ActiveInferencePOMDPAgent {
    constructor(config) {
        this.type = 'active-inference';
        this.status = 'available';
        this.capabilities = ['reasoning', 'planning', 'data-analysis', 'decision-making', 'active-inference'];
        this.lastActive = Date.now();
        this.createdAt = Date.now();
        this.metadata = {};
        this.posterior = []; // Posterior beliefs after each time step
        this.policies = []; // Possible action sequences
        this.expectedFreeEnergy = []; // Expected free energy for each policy
        this.id = config.id;
        this.name = config.name;
        this.description = config.description;
        if (config.capabilities) {
            this.capabilities = [...this.capabilities, ...config.capabilities];
        }
        if (config.metadata) {
            this.metadata = { ...this.metadata, ...config.metadata };
        }
        // Initialize POMDP parameters
        this.states = config.states;
        this.observations = config.observations;
        this.actions = config.actions;
        // Initialize with uniform transition model if not provided
        this.transitionModel = config.transitionModel || this.createUniformMatrix(this.actions.length, this.states.length, this.states.length);
        // Initialize with uniform observation model if not provided
        this.observationModel = config.observationModel || this.createUniformMatrix(this.states.length, this.observations.length);
        // Initialize with neutral preferences if not provided
        this.preferences = config.preferences || Array(this.observations.length).fill(0).map(() => Array(this.states.length).fill(0));
        // Default planning horizon
        this.policyDepth = config.policyDepth || 2;
        // Initialize beliefs with uniform distribution
        this.beliefs = Array(this.states.length).fill(1 / this.states.length);
        // Initialize history trackers
        this.beliefHistory = [this.beliefs.slice()];
        this.actionHistory = [];
        this.observationHistory = [];
        this.freeEnergyHistory = [];
        // Generate possible policies (action sequences)
        this.generatePolicies();
        // Initialize expected free energy
        this.expectedFreeEnergy = Array(this.policies.length).fill(0);
    }
    /**
     * Process observations through the POMDP model
     * @param observations - The observations to process
     * @param context - The workflow context
     */
    async process(observations, context) {
        this.status = 'busy';
        this.lastActive = Date.now();
        const logger = context.logger;
        logger.info(`ActiveInferencePOMDPAgent ${this.name} processing observations`);
        // Handle different input formats
        let processedObservations;
        if (Array.isArray(observations) && observations.every(o => typeof o === 'number')) {
            processedObservations = observations;
        }
        else if (typeof observations === 'object' && observations.temperatures) {
            processedObservations = observations.temperatures;
        }
        else {
            logger.warn('Input format not recognized, attempting to convert to numbers');
            try {
                processedObservations = this.extractObservations(observations);
            }
            catch (error) {
                logger.error('Failed to process observations:', error);
                this.status = 'error';
                return {
                    error: 'Failed to process observations',
                    message: error.message
                };
            }
        }
        // Log the processed observations
        logger.info(`Processing observations: ${JSON.stringify(processedObservations)}`);
        // Store the observations
        this.observationHistory = this.observationHistory.concat(processedObservations);
        try {
            // Run the active inference process
            const inferenceResults = await this.runActiveInference(processedObservations);
            // Generate visualization data
            const visualizationData = this.generateVisualizationData();
            this.status = 'available';
            // Return complete results
            return {
                observations: processedObservations,
                beliefs: this.beliefs,
                posterior: this.posterior,
                policy: inferenceResults.selectedPolicy,
                action: inferenceResults.selectedAction,
                expectedFreeEnergy: this.expectedFreeEnergy,
                visualizationData,
                logs: inferenceResults.logs
            };
        }
        catch (error) {
            logger.error('Error in active inference process:', error);
            this.status = 'error';
            return {
                error: 'Error in active inference process',
                message: error.message
            };
        }
    }
    /**
     * Run the active inference algorithm on the given observations
     */
    async runActiveInference(observations) {
        const logs = [];
        logs.push(`Starting Active Inference process with ${observations.length} observations`);
        // Update beliefs based on observations (perception)
        this.updateBeliefs(observations);
        logs.push(`Updated beliefs: ${JSON.stringify(this.beliefs.map(b => b.toFixed(4)))}`);
        // Calculate expected free energy for each policy
        this.calculateExpectedFreeEnergy();
        logs.push(`Expected free energy: ${JSON.stringify(this.expectedFreeEnergy.map(ef => ef.toFixed(4)))}`);
        // Select policy with lowest expected free energy
        const policyIndex = this.selectPolicy();
        const selectedPolicy = this.policies[policyIndex];
        logs.push(`Selected policy index: ${policyIndex}`);
        // Get first action from selected policy
        const selectedAction = selectedPolicy[0][0];
        logs.push(`Selected action: ${selectedAction} (${this.actions[selectedAction]})`);
        // Store the action
        this.actionHistory.push(selectedAction);
        return {
            selectedPolicy: selectedPolicy.map(step => step[0]),
            selectedAction,
            logs
        };
    }
    /**
     * Update beliefs based on observations (Bayesian inference)
     */
    updateBeliefs(observations) {
        // Initialize posterior with prior beliefs
        let posterior = this.beliefs.slice();
        // For each observation, update posterior using Bayes' rule
        for (let i = 0; i < observations.length; i++) {
            const obs = observations[i];
            // Calculate likelihood: P(o|s)
            const likelihood = this.observationModel.map(row => row[obs]);
            // Calculate posterior: P(s|o) ∝ P(o|s) * P(s)
            let sum = 0;
            const newPosterior = posterior.map((prior, idx) => {
                const post = likelihood[idx] * prior;
                sum += post;
                return post;
            });
            // Normalize
            posterior = newPosterior.map(p => p / sum);
        }
        // Update beliefs
        this.beliefs = posterior;
        this.beliefHistory.push(posterior.slice());
        this.posterior = [posterior.slice()];
    }
    /**
     * Calculate expected free energy for each policy
     */
    calculateExpectedFreeEnergy() {
        for (let pi = 0; pi < this.policies.length; pi++) {
            const policy = this.policies[pi];
            let G = 0; // Expected free energy
            // Current beliefs
            let beliefs = this.beliefs.slice();
            // For each time step in the policy
            for (let t = 0; t < policy.length; t++) {
                const action = policy[t][0];
                // Predict next state beliefs after action
                const predictedBeliefs = this.predictNextBeliefs(beliefs, action);
                // Expected observations
                const expectedObservations = this.calculateExpectedObservations(predictedBeliefs);
                // Ambiguity term: sum_o sum_s P(o|s)P(s) * log(P(o|s))
                let ambiguity = 0;
                for (let o = 0; o < this.observations.length; o++) {
                    for (let s = 0; s < this.states.length; s++) {
                        const p_o_s = this.observationModel[s][o];
                        const p_s = predictedBeliefs[s];
                        const joint = p_o_s * p_s;
                        if (joint > 0) {
                            ambiguity -= joint * Math.log(p_o_s);
                        }
                    }
                }
                // Risk term: sum_o P(o) * C(o)
                let risk = 0;
                for (let o = 0; o < this.observations.length; o++) {
                    let p_o = 0;
                    for (let s = 0; s < this.states.length; s++) {
                        p_o += this.observationModel[s][o] * predictedBeliefs[s];
                    }
                    // Get preference for this observation
                    const pref = this.preferences[o];
                    let prefValue = 0;
                    for (let s = 0; s < this.states.length; s++) {
                        prefValue += pref[s] * predictedBeliefs[s];
                    }
                    risk -= p_o * prefValue;
                }
                // Add to total expected free energy
                G += ambiguity + risk;
                // Update beliefs for next time step
                beliefs = predictedBeliefs;
            }
            this.expectedFreeEnergy[pi] = G;
        }
        // Store the free energy history
        this.freeEnergyHistory.push(this.expectedFreeEnergy.slice());
    }
    /**
     * Predict next beliefs after taking an action
     */
    predictNextBeliefs(beliefs, action) {
        const nextBeliefs = Array(this.states.length).fill(0);
        // For each possible next state
        for (let s_next = 0; s_next < this.states.length; s_next++) {
            // Sum over current states
            for (let s = 0; s < this.states.length; s++) {
                // P(s'|s,a) * P(s)
                nextBeliefs[s_next] += this.transitionModel[action][s][s_next] * beliefs[s];
            }
        }
        return nextBeliefs;
    }
    /**
     * Calculate expected observations given beliefs
     */
    calculateExpectedObservations(beliefs) {
        const expectedObs = Array(this.observations.length).fill(0);
        // For each observation
        for (let o = 0; o < this.observations.length; o++) {
            // Sum over states
            for (let s = 0; s < this.states.length; s++) {
                // P(o|s) * P(s)
                expectedObs[o] += this.observationModel[s][o] * beliefs[s];
            }
        }
        return expectedObs;
    }
    /**
     * Select policy with lowest expected free energy
     */
    selectPolicy() {
        let minIndex = 0;
        let minValue = this.expectedFreeEnergy[0];
        for (let i = 1; i < this.expectedFreeEnergy.length; i++) {
            if (this.expectedFreeEnergy[i] < minValue) {
                minValue = this.expectedFreeEnergy[i];
                minIndex = i;
            }
        }
        return minIndex;
    }
    /**
     * Generate all possible policies (action sequences)
     */
    generatePolicies() {
        const numActions = this.actions.length;
        // Generate all possible action sequences of length policyDepth
        const allPolicies = [];
        const generatePolicyRecursive = (currentPolicy, depth) => {
            if (depth === 0) {
                allPolicies.push(currentPolicy);
                return;
            }
            for (let a = 0; a < numActions; a++) {
                const newPolicy = [...currentPolicy, [a]];
                generatePolicyRecursive(newPolicy, depth - 1);
            }
        };
        generatePolicyRecursive([], this.policyDepth);
        this.policies = allPolicies;
    }
    /**
     * Generate visualization data for the POMDP process
     */
    generateVisualizationData() {
        return {
            beliefHistory: this.beliefHistory,
            actionHistory: this.actionHistory,
            observationHistory: this.observationHistory,
            freeEnergyHistory: this.freeEnergyHistory,
            states: this.states,
            observations: this.observations,
            actions: this.actions,
            transitionModel: this.transitionModel,
            observationModel: this.observationModel,
            preferences: this.preferences
        };
    }
    /**
     * Extract observations from different input formats
     */
    extractObservations(input) {
        if (typeof input === 'string') {
            // Try to parse JSON
            try {
                const parsed = JSON.parse(input);
                if (Array.isArray(parsed)) {
                    return parsed.map(Number);
                }
                else if (parsed.temperatures) {
                    return parsed.temperatures.map(Number);
                }
            }
            catch (e) {
                // Not JSON, try to extract numbers
                const matches = input.match(/-?\d+(\.\d+)?/g);
                if (matches) {
                    return matches.map(Number);
                }
            }
        }
        else if (typeof input === 'number') {
            return [input];
        }
        throw new Error('Could not extract observations from input');
    }
    /**
     * Create a uniform probability matrix of given dimensions
     */
    createUniformMatrix(dim1, dim2, dim3) {
        if (dim3) {
            // 3D matrix
            return Array(dim1).fill(0).map(() => Array(dim2).fill(0).map(() => Array(dim3).fill(1 / dim3)));
        }
        else {
            // 2D matrix
            return Array(dim1).fill(0).map(() => Array(dim2).fill(1 / dim2));
        }
    }
}
exports.ActiveInferencePOMDPAgent = ActiveInferencePOMDPAgent;
//# sourceMappingURL=ActiveInferencePOMDPAgent.js.map