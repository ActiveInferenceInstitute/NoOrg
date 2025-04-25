import { EventSystem } from '../../events/EventSystem';
import { StorageSystem } from '../../storage/StorageSystem';

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
export class AgentDiscoveryService {
  private static instance: AgentDiscoveryService;
  private agents: Map<string, AgentInfo>;
  private eventSystem: EventSystem;
  private storageSystem: StorageSystem;
  private heartbeatInterval?: NodeJS.Timeout;
  private broadcastInterval?: NodeJS.Timeout;
  private options: Required<DiscoveryOptions>;

  private constructor(options: DiscoveryOptions = {}) {
    this.agents = new Map();
    this.eventSystem = EventSystem.getInstance();
    this.storageSystem = StorageSystem.getInstance();
    this.options = {
      heartbeatInterval: 30000,  // 30 seconds
      expirationTime: 90000,     // 90 seconds
      broadcastInterval: 60000,  // 60 seconds
      ...options
    };

    this.setupEventListeners();
    this.startHeartbeatCheck();
    this.startBroadcasting();
    this.loadAgentsFromStorage();
  }

  public static getInstance(options?: DiscoveryOptions): AgentDiscoveryService {
    if (!AgentDiscoveryService.instance) {
      AgentDiscoveryService.instance = new AgentDiscoveryService(options);
    }
    return AgentDiscoveryService.instance;
  }

  /**
   * Register an agent with the discovery service
   */
  public async registerAgent(agent: Omit<AgentInfo, 'lastSeen'>): Promise<AgentInfo> {
    const agentInfo: AgentInfo = {
      ...agent,
      lastSeen: Date.now()
    };

    this.agents.set(agent.id, agentInfo);
    await this.storageSystem.set(`agent:${agent.id}`, agentInfo);
    this.eventSystem.emit('discovery:agent:registered', { agent: agentInfo });
    
    return agentInfo;
  }

  /**
   * Update an existing agent's information
   */
  public async updateAgent(id: string, updates: Partial<Omit<AgentInfo, 'id' | 'lastSeen'>>): Promise<AgentInfo | null> {
    const agent = this.agents.get(id);
    if (!agent) return null;

    const updatedAgent: AgentInfo = {
      ...agent,
      ...updates,
      id,
      lastSeen: Date.now()
    };

    this.agents.set(id, updatedAgent);
    await this.storageSystem.set(`agent:${id}`, updatedAgent);
    this.eventSystem.emit('discovery:agent:updated', { agent: updatedAgent });
    
    return updatedAgent;
  }

  /**
   * Send a heartbeat for an agent to indicate it's still active
   */
  public async heartbeat(id: string): Promise<boolean> {
    const agent = this.agents.get(id);
    if (!agent) return false;

    agent.lastSeen = Date.now();
    await this.storageSystem.set(`agent:${id}`, agent);
    return true;
  }

  /**
   * Deregister an agent from the discovery service
   */
  public async deregisterAgent(id: string): Promise<boolean> {
    const agent = this.agents.get(id);
    if (!agent) return false;

    this.agents.delete(id);
    await this.storageSystem.delete(`agent:${id}`);
    this.eventSystem.emit('discovery:agent:deregistered', { agentId: id });
    
    return true;
  }

  /**
   * Find agents that match specified criteria
   */
  public findAgents(criteria: {
    capabilities?: string[];
    status?: AgentInfo['status'];
    metadata?: Record<string, any>;
  } = {}): AgentInfo[] {
    return Array.from(this.agents.values()).filter(agent => {
      // Filter by capabilities
      if (criteria.capabilities && criteria.capabilities.length > 0) {
        if (!criteria.capabilities.every(cap => agent.capabilities.includes(cap))) {
          return false;
        }
      }

      // Filter by status
      if (criteria.status && agent.status !== criteria.status) {
        return false;
      }

      // Filter by metadata
      if (criteria.metadata) {
        for (const [key, value] of Object.entries(criteria.metadata)) {
          if (agent.metadata[key] !== value) {
            return false;
          }
        }
      }

      return true;
    });
  }

  /**
   * Get a specific agent by ID
   */
  public getAgent(id: string): AgentInfo | undefined {
    return this.agents.get(id);
  }

  /**
   * Get all registered agents
   */
  public getAllAgents(): AgentInfo[] {
    return Array.from(this.agents.values());
  }

  /**
   * Set up event listeners for discovery-related events
   */
  private setupEventListeners(): void {
    this.eventSystem.on('discovery:heartbeat', (event) => {
      const { agentId } = event.payload;
      this.heartbeat(agentId);
    });
  }

  /**
   * Start the heartbeat check interval to detect inactive agents
   */
  private startHeartbeatCheck(): void {
    this.heartbeatInterval = setInterval(() => {
      const now = Date.now();
      const expiredAgents: string[] = [];

      for (const [id, agent] of this.agents.entries()) {
        if (now - agent.lastSeen > this.options.expirationTime) {
          expiredAgents.push(id);
        }
      }

      // Remove expired agents
      for (const id of expiredAgents) {
        this.agents.delete(id);
        this.storageSystem.delete(`agent:${id}`);
        this.eventSystem.emit('discovery:agent:expired', { agentId: id });
      }
    }, this.options.heartbeatInterval);
  }

  /**
   * Start broadcasting the list of available agents
   */
  private startBroadcasting(): void {
    this.broadcastInterval = setInterval(() => {
      const agents = this.getAllAgents();
      this.eventSystem.emit('discovery:agents:broadcast', { agents });
    }, this.options.broadcastInterval);
  }

  /**
   * Load previously registered agents from storage
   */
  private async loadAgentsFromStorage(): Promise<void> {
    try {
      // Get keys matching agent:*
      // Note: This is a simplified approach since we don't have a keys() method in StorageSystem
      // In a real implementation, you might need a list or query method

      // As a workaround, we're manually loading a known registry of agent IDs
      const agentRegistry = await this.storageSystem.get<string[]>('agent:registry') || [];
      
      for (const agentId of agentRegistry) {
        const agent = await this.storageSystem.get<AgentInfo>(`agent:${agentId}`);
        if (agent) {
          this.agents.set(agent.id, agent);
        }
      }
      
      this.eventSystem.emit('discovery:loaded', { 
        count: this.agents.size 
      });
    } catch (error) {
      console.error('Error loading agents from storage:', error);
    }
  }

  /**
   * Clean up resources when the service is shutting down
   */
  public dispose(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    if (this.broadcastInterval) {
      clearInterval(this.broadcastInterval);
    }
  }
} 