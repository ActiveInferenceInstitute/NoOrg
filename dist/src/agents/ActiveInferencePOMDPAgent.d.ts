import { Agent } from './types';
/**
 * ActiveInferencePOMDPAgent - An agent that uses Active Inference with POMDP for decision making
 *
 * This agent implements a Partially Observable Markov Decision Process (POMDP) within
 * the Active Inference framework. It can process observations and generate beliefs,
 * policies, and take actions according to the Free Energy Principle.
 */
export declare class ActiveInferencePOMDPAgent implements Agent {
    id: string;
    name: string;
    description: string;
    type: string;
    status: 'initializing' | 'available' | 'busy' | 'offline' | 'error';
    capabilities: string[];
    lastActive: number;
    createdAt: number;
    metadata: Record<string, any>;
    private states;
    private observations;
    private actions;
    private transitionModel;
    private observationModel;
    private preferences;
    private policyDepth;
    private beliefs;
    private posterior;
    private policies;
    private expectedFreeEnergy;
    private beliefHistory;
    private actionHistory;
    private observationHistory;
    private freeEnergyHistory;
    constructor(config: {
        id: string;
        name: string;
        description: string;
        states: string[];
        observations: string[];
        actions: string[];
        transitionModel?: number[][][];
        observationModel?: number[][];
        preferences?: number[][];
        policyDepth?: number;
        capabilities?: string[];
        metadata?: Record<string, any>;
    });
    /**
     * Process observations through the POMDP model
     * @param observations - The observations to process
     * @param context - The workflow context
     */
    process(observations: number[] | any, context: any): Promise<any>;
    /**
     * Run the active inference algorithm on the given observations
     */
    private runActiveInference;
    /**
     * Update beliefs based on observations (Bayesian inference)
     */
    private updateBeliefs;
    /**
     * Calculate expected free energy for each policy
     */
    private calculateExpectedFreeEnergy;
    /**
     * Predict next beliefs after taking an action
     */
    private predictNextBeliefs;
    /**
     * Calculate expected observations given beliefs
     */
    private calculateExpectedObservations;
    /**
     * Select policy with lowest expected free energy
     */
    private selectPolicy;
    /**
     * Generate all possible policies (action sequences)
     */
    private generatePolicies;
    /**
     * Generate visualization data for the POMDP process
     */
    private generateVisualizationData;
    /**
     * Extract observations from different input formats
     */
    private extractObservations;
    /**
     * Create a uniform probability matrix of given dimensions
     */
    private createUniformMatrix;
}
//# sourceMappingURL=ActiveInferencePOMDPAgent.d.ts.map