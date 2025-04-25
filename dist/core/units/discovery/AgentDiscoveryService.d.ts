export interface AgentInfo {
    id: string;
    name: string;
    capabilities: string[];
    status: 'active' | 'inactive' | 'busy';
    lastSeen: number;
    metadata: Record<string, any>;
    endpoint?: string;
    address?: string;
}
export interface DiscoveryOptions {
    heartbeatInterval?: number;
    expirationTime?: number;
    broadcastInterval?: number;
}
/**
 * AgentDiscoveryService allows agents to register themselves and discover other agents
 * in the distributed system.
 */
export declare class AgentDiscoveryService {
    private static instance;
    private agents;
    private eventSystem;
    private storageSystem;
    private heartbeatInterval?;
    private broadcastInterval?;
    private options;
    private constructor();
    static getInstance(options?: DiscoveryOptions): AgentDiscoveryService;
    /**
     * Register an agent with the discovery service
     */
    registerAgent(agent: Omit<AgentInfo, 'lastSeen'>): Promise<AgentInfo>;
    /**
     * Update an existing agent's information
     */
    updateAgent(id: string, updates: Partial<Omit<AgentInfo, 'id' | 'lastSeen'>>): Promise<AgentInfo | null>;
    /**
     * Send a heartbeat for an agent to indicate it's still active
     */
    heartbeat(id: string): Promise<boolean>;
    /**
     * Deregister an agent from the discovery service
     */
    deregisterAgent(id: string): Promise<boolean>;
    /**
     * Find agents that match specified criteria
     */
    findAgents(criteria?: {
        capabilities?: string[];
        status?: AgentInfo['status'];
        metadata?: Record<string, any>;
    }): AgentInfo[];
    /**
     * Get a specific agent by ID
     */
    getAgent(id: string): AgentInfo | undefined;
    /**
     * Get all registered agents
     */
    getAllAgents(): AgentInfo[];
    /**
     * Set up event listeners for discovery-related events
     */
    private setupEventListeners;
    /**
     * Start the heartbeat check interval to detect inactive agents
     */
    private startHeartbeatCheck;
    /**
     * Start broadcasting the list of available agents
     */
    private startBroadcasting;
    /**
     * Load previously registered agents from storage
     */
    private loadAgentsFromStorage;
    /**
     * Clean up resources when the service is shutting down
     */
    dispose(): void;
}
