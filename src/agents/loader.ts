import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { isAbsolute, relative, resolve } from 'node:path';
import { NoOrgError } from '../domain/errors';
import { agentDescriptorSchema } from '../domain/types';
import type { Agent } from './abstract-agent';

export const AGENT_CONTRACT_VERSION = 1;

interface AgentModule {
  readonly contractVersion?: unknown;
  readonly createAgents?: unknown;
  readonly agents?: unknown;
  readonly default?: unknown;
}

export interface AgentLoaderOptions {
  readonly deploymentRoot?: string;
  readonly trustedDigests?: Readonly<Record<string, string>>;
}

export async function loadConfiguredAgents(
  modulePaths: readonly string[],
  options: AgentLoaderOptions = {}
): Promise<Agent[]> {
  const loaded: Agent[] = [];
  const requireModule = createRequire(__filename);
  const deploymentRoot = resolve(options.deploymentRoot ?? process.cwd());
  for (const modulePath of modulePaths) {
    const absolute = resolve(process.cwd(), modulePath);
    let digest: string;
    try {
      digest = createHash('sha256').update(readFileSync(absolute)).digest('hex');
    } catch (error) {
      throw new NoOrgError(
        'AGENT_MODULE_LOAD_FAILED',
        `Unable to read configured agent module ${modulePath}`,
        false,
        error instanceof Error ? error.message : undefined
      );
    }
    const outsideBoundary =
      isAbsolute(relative(deploymentRoot, absolute)) ||
      relative(deploymentRoot, absolute).startsWith('..');
    const trustedDigest = options.trustedDigests?.[absolute];
    if (outsideBoundary && trustedDigest === undefined)
      throw new NoOrgError(
        'AGENT_MODULE_UNTRUSTED',
        `Configured agent module ${modulePath} is outside the local deployment boundary`
      );
    if (trustedDigest !== undefined && trustedDigest.toLowerCase() !== digest)
      throw new NoOrgError(
        'AGENT_MODULE_DIGEST_MISMATCH',
        `Configured agent module ${modulePath} does not match its trusted digest`
      );
    let imported: AgentModule;
    try {
      try {
        imported = (await import(pathToFileURL(absolute).href)) as AgentModule;
      } catch {
        imported = requireModule(absolute) as AgentModule;
      }
    } catch (error) {
      throw new NoOrgError(
        'AGENT_MODULE_LOAD_FAILED',
        `Unable to load configured agent module ${modulePath}`,
        false,
        error instanceof Error ? error.message : undefined
      );
    }
    const contractVersion = imported.contractVersion ?? 1;
    if (contractVersion !== AGENT_CONTRACT_VERSION)
      throw new NoOrgError(
        'AGENT_CONTRACT_UNSUPPORTED',
        `Agent module ${modulePath} requires unsupported contract version ${String(contractVersion)}`
      );
    const factory = imported.createAgents ?? imported.default;
    const agents =
      typeof factory === 'function'
        ? await (factory as () => Agent[] | Promise<Agent[]>)()
        : imported.agents;
    if (!Array.isArray(agents) || agents.length === 0)
      throw new NoOrgError(
        'AGENT_MODULE_INVALID',
        `Agent module ${modulePath} must export a non-empty createAgents function or agents array`
      );
    for (const agent of agents) {
      if (!isAgentShape(agent))
        throw new NoOrgError(
          'AGENT_MODULE_INVALID',
          `Agent module ${modulePath} returned an agent that does not implement the typed contract`
        );
      try {
        agentDescriptorSchema.parse(agent.descriptor);
      } catch {
        throw new NoOrgError(
          'AGENT_MODULE_INVALID',
          `Agent module ${modulePath} returned an agent with an invalid descriptor`
        );
      }
      loaded.push(agent);
    }
  }
  return loaded;
}

function isAgentShape(value: unknown): value is Agent {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Partial<Agent>;
  const inputSchema = candidate.inputSchema as { parse?: unknown } | undefined;
  const resultSchema = candidate.resultSchema as { parse?: unknown } | undefined;
  return (
    'descriptor' in candidate &&
    typeof inputSchema?.parse === 'function' &&
    typeof resultSchema?.parse === 'function' &&
    typeof candidate.initialize === 'function' &&
    typeof candidate.execute === 'function' &&
    typeof candidate.validateResult === 'function' &&
    typeof candidate.shutdown === 'function'
  );
}
