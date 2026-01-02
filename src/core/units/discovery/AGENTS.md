# Unit Discovery System Technical Documentation

## Overview

This document provides complete technical documentation for all interfaces, classes, and methods in the Unit Discovery System.

## AgentDiscoveryService

### Interfaces

#### AgentInfo

```typescript
interface AgentInfo {
  id: string;
  name: string;
  capabilities: string[];
  status: 'active' | 'inactive' | 'busy';
  lastSeen: number;
  metadata: Record<string, any>;
  endpoint?: string;
  address?: string;
}
```

#### DiscoveryOptions

```typescript
interface DiscoveryOptions {
  heartbeatInterval?: number;
  expirationTime?: number;
  broadcastInterval?: number;
}
```

### AgentDiscoveryService Class

#### Static Methods

##### getInstance()

```typescript
public static getInstance(options?: DiscoveryOptions): AgentDiscoveryService
```

Gets singleton instance.

**Parameters:**
- `options` (DiscoveryOptions, optional): Configuration

**Returns:** `AgentDiscoveryService` - Singleton instance

#### Instance Methods

##### registerAgent()

```typescript
public async registerAgent(
  agent: Omit<AgentInfo, 'lastSeen'>
): Promise<AgentInfo>
```

Registers an agent with the discovery service.

**Parameters:**
- `agent` (Omit<AgentInfo, 'lastSeen'>): Agent information

**Returns:** `Promise<AgentInfo>` - Registered agent info

##### updateAgent()

```typescript
public async updateAgent(
  id: string,
  updates: Partial<Omit<AgentInfo, 'id' | 'lastSeen'>>
): Promise<AgentInfo | null>
```

Updates agent information.

**Parameters:**
- `id` (string): Agent ID
- `updates` (Partial<Omit<AgentInfo, 'id' | 'lastSeen'>>): Updates

**Returns:** `Promise<AgentInfo | null>` - Updated agent or null

##### heartbeat()

```typescript
public async heartbeat(id: string): Promise<boolean>
```

Sends heartbeat for an agent.

**Parameters:**
- `id` (string): Agent ID

**Returns:** `Promise<boolean>` - Success status

##### deregisterAgent()

```typescript
public async deregisterAgent(id: string): Promise<boolean>
```

Deregisters an agent.

**Parameters:**
- `id` (string): Agent ID

**Returns:** `Promise<boolean>` - Success status

##### findAgentsByCapability()

```typescript
public findAgentsByCapability(capability: string): AgentInfo[]
```

Finds agents by capability.

**Parameters:**
- `capability` (string): Capability name

**Returns:** `AgentInfo[]` - Array of matching agents

##### getAgent()

```typescript
public getAgent(id: string): AgentInfo | null
```

Gets agent by ID.

**Parameters:**
- `id` (string): Agent ID

**Returns:** `AgentInfo | null` - Agent info or null

##### getAllAgents()

```typescript
public getAllAgents(): AgentInfo[]
```

Gets all registered agents.

**Returns:** `AgentInfo[]` - Array of all agents

## UnitDiscovery

### UnitDiscovery Class

#### Methods

##### discoverUnits()

```typescript
public async discoverUnits(): Promise<OrganizationalUnit[]>
```

Discovers all organizational units.

**Returns:** `Promise<OrganizationalUnit[]>` - Array of units

##### discoverUnit()

```typescript
public async discoverUnit(unitId: string): Promise<OrganizationalUnit | null>
```

Discovers a specific unit.

**Parameters:**
- `unitId` (string): Unit ID

**Returns:** `Promise<OrganizationalUnit | null>` - Unit or null

## UnitParser

### UnitParser Class

#### Methods

##### parseUnit()

```typescript
public parseUnit(unitData: any): OrganizationalUnit
```

Parses unit data into OrganizationalUnit.

**Parameters:**
- `unitData` (any): Raw unit data

**Returns:** `OrganizationalUnit` - Parsed unit

## Related Documentation

- [Discovery README](./README.md)
- [Units System](../../units/README.md)
