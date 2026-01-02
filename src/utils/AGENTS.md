# Utilities Technical Documentation

## Overview

Complete technical documentation for all utility classes and functions.

## DataGenerationManager

### Constructor

```typescript
constructor(
  apiKey: string,
  context: Record<string, any>,
  outputDir: string
)
```

**Parameters:**
- `apiKey` (string): OpenAI API key
- `context` (Record<string, any>): Application context
- `outputDir` (string): Output directory

### Methods

#### generateLocations()

```typescript
async generateLocations(
  count: number,
  options?: {
    coverage?: 'high' | 'medium' | 'low';
    useCache?: boolean;
    centerPoint?: { lat: number; lng: number };
    radius?: number;
  }
): Promise<Array<Location>>
```

Generates location data.

**Parameters:**
- `count` (number): Number of locations
- `options` (object, optional): Generation options

**Returns:** `Promise<Array<Location>>` - Array of locations

## ProjectConfigGenerator

### Static Methods

#### getInstance()

```typescript
public static getInstance(apiKey: string): ProjectConfigGenerator
```

Gets singleton instance.

**Parameters:**
- `apiKey` (string): OpenAI API key

**Returns:** `ProjectConfigGenerator` - Singleton instance

### Instance Methods

#### generateConfig()

```typescript
public async generateConfig(
  domain: string,
  objective?: string,
  options?: {
    useCache?: boolean;
    constraints?: string;
    targetUsers?: string;
    llmConfig?: object;
  }
): Promise<Record<string, any>>
```

Generates project configuration.

**Parameters:**
- `domain` (string): Project domain
- `objective` (string, optional): Project objective
- `options` (object, optional): Configuration options

**Returns:** `Promise<Record<string, any>>` - Project configuration

## I18n

### Static Methods

#### getInstance()

```typescript
static getInstance(config?: I18nConfig): I18n
```

Gets singleton instance.

**Parameters:**
- `config` (I18nConfig, optional): Configuration

**Returns:** `I18n` - Singleton instance

### Instance Methods

#### translate()

```typescript
translate(key: string, params?: Record<string, any>): string
```

Translates a key.

**Parameters:**
- `key` (string): Translation key
- `params` (Record<string, any>, optional): Parameters

**Returns:** `string` - Translated text

#### setLocale()

```typescript
setLocale(locale: string): void
```

Sets current locale.

**Parameters:**
- `locale` (string): Locale code

**Returns:** `void`

## WorkflowVisualizer

### Functions

#### generateWorkflowDOT()

```typescript
export function generateWorkflowDOT(workflow: Workflow): string
```

Generates DOT graph format.

**Parameters:**
- `workflow` (Workflow): Workflow object

**Returns:** `string` - DOT format string

#### generateWorkflowMermaid()

```typescript
export function generateWorkflowMermaid(workflow: Workflow): string
```

Generates Mermaid diagram.

**Parameters:**
- `workflow` (Workflow): Workflow object

**Returns:** `string` - Mermaid diagram string

## Related Documentation

- [Utils README](./README.md)
