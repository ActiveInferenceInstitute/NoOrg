import { NoOrgError } from '../domain/errors';
import { agentDescriptorSchema, type AgentDescriptor, type AgentTask } from '../domain/types';
import type { Agent, AgentContext } from './abstract-agent';
import { AGENT_CONTRACT_VERSION } from './loader';

export type AgentAvailability = 'available' | 'at_capacity' | 'no_match';

export class AgentRegistry {
  private readonly agents = new Map<string, Agent>();
  private readonly active = new Map<string, number>();
  private initialized = false;

  public register(agent: Agent): void {
    const descriptor = agent.descriptor;
    const parsedDescriptor = agentDescriptorSchema.parse(descriptor);
    if (parsedDescriptor.contractVersion !== AGENT_CONTRACT_VERSION)
      throw new NoOrgError(
        'AGENT_CONTRACT_UNSUPPORTED',
        `Agent ${descriptor.id} uses unsupported contract version ${String(parsedDescriptor.contractVersion)}`
      );
    if (
      !descriptor.id.trim() ||
      descriptor.capabilities.length === 0 ||
      descriptor.maxConcurrentTasks < 1
    ) {
      throw new NoOrgError(
        'INVALID_AGENT_DESCRIPTOR',
        `Invalid descriptor for ${descriptor.id || 'unnamed agent'}`
      );
    }
    if (this.agents.has(descriptor.id))
      throw new NoOrgError('DUPLICATE_AGENT', `Agent ${descriptor.id} is already registered`);
    this.agents.set(descriptor.id, agent);
    this.active.set(descriptor.id, 0);
  }

  public async initialize(context: AgentContext): Promise<void> {
    if (this.initialized)
      throw new NoOrgError('REGISTRY_ALREADY_INITIALIZED', 'Agent registry is already initialized');
    const initialized: Agent[] = [];
    try {
      for (const agent of this.agents.values()) {
        await agent.initialize(context);
        initialized.push(agent);
      }
      this.initialized = true;
    } catch (error) {
      await Promise.allSettled(initialized.reverse().map(agent => agent.shutdown()));
      throw error;
    }
  }

  public descriptors(): AgentDescriptor[] {
    return [...this.agents.values()].map(agent => structuredClone(agent.descriptor));
  }

  public acquire(task: AgentTask): { agent: Agent; release: () => void } | undefined {
    const candidates = this.candidates(task);
    for (const agent of candidates) {
      if (task.agentId !== undefined && agent.descriptor.id !== task.agentId) continue;
      const active = this.active.get(agent.descriptor.id) ?? 0;
      if (active >= agent.descriptor.maxConcurrentTasks) continue;
      this.active.set(agent.descriptor.id, active + 1);
      let released = false;
      return {
        agent,
        release: () => {
          if (released) return;
          released = true;
          this.active.set(
            agent.descriptor.id,
            Math.max(0, (this.active.get(agent.descriptor.id) ?? 1) - 1)
          );
        },
      };
    }
    return undefined;
  }

  public availability(task: AgentTask): AgentAvailability {
    const candidates = this.candidates(task);
    if (candidates.length === 0) return 'no_match';
    return candidates.some(
      agent => (this.active.get(agent.descriptor.id) ?? 0) < agent.descriptor.maxConcurrentTasks
    )
      ? 'available'
      : 'at_capacity';
  }

  public activeCount(): number {
    return [...this.active.values()].reduce((sum, value) => sum + value, 0);
  }

  public isReady(): boolean {
    return this.initialized && this.agents.size > 0;
  }

  public async shutdown(): Promise<void> {
    const shutdowns = [...this.agents.values()].map(agent => agent.shutdown());
    const results = await Promise.allSettled(shutdowns);
    this.initialized = false;
    this.agents.clear();
    this.active.clear();
    const failure = results.find(result => result.status === 'rejected');
    if (failure?.status === 'rejected') throw failure.reason;
  }

  private candidates(task: AgentTask): Agent[] {
    return (
      task.requiredCapabilities.length > 0
        ? [...this.agents.values()].filter(agent =>
            task.requiredCapabilities.every(capability =>
              agent.descriptor.capabilities.includes(capability)
            )
          )
        : task.agentId
          ? [this.agents.get(task.agentId)].filter((agent): agent is Agent => agent !== undefined)
          : [...this.agents.values()]
    ).filter(agent => task.agentId === undefined || agent.descriptor.id === task.agentId);
  }
}
