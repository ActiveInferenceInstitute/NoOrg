# Workflow Example Refactoring Guide

This guide outlines how to refactor the `8-hybrid-agent-workflow-example.ts` file to make it more modular, dynamic, and less dependent on hardcoded values.

## Current Issues

The current implementation has these problems:
1. Many agent classes are defined within the example file
2. Contains hardcoded data generators specific to air quality or ant neuroscience
3. Lengthy functions that could be extracted to their own modules
4. Limited reusability due to domain-specific content

## Recommended Approach

### 1. Extract Agent Classes

Move all agent classes to separate files in the `src/core/units/agents/` directory:
- `LLMAgent.ts` - already moved
- `DataProcessingAgent.ts`
- `APIAgent.ts`
- `RuleBasedAgent.ts`
- `VisualizationAgent.ts`
- `ImageGenerationAgent.ts`
- `DocumentProcessingAgent.ts`

### 2. Use Data Generation Manager

Replace all hardcoded data generators with the new `DataGenerationManager` in `src/utils/DataGenerationManager.ts`:

```typescript
// Before (in workflow file):
const generateLocations = (count: number) => {
  // Hardcoded air quality location generation
  // ...
};

// After (in workflow file):
const dataGenerator = new DataGenerationManager(
  process.env.OPENAI_API_KEY || '',
  PROJECT_CONFIG,
  outputDir
);

const generateLocations = async (count: number, options = {}) => {
  return await dataGenerator.generateLocations(count, options);
};
```

Similarly:
- Replace `generateNeuralData` with `dataGenerator.generateNeuralData`
- Use `dataGenerator.generateVisualizationConfig` for visualization configs

### 3. Make Project Configuration Dynamic

Create a configuration factory that can use LLM to generate contextually appropriate configs:

```typescript
// Create src/utils/ConfigurationManager.ts
import { OpenAIClient } from '../core/multiagent/OpenAIClient';

export class ConfigurationManager {
  static async generateProjectConfig(
    domain?: string, 
    objective?: string,
    options?: {
      apiKey?: string;
      defaultDomain?: string;
      defaultObjective?: string;
    }
  ): Promise<Record<string, any>> {
    // Use LLM to generate appropriate config if not provided
    // ...
  }
}

// In workflow example:
const PROJECT_CONFIG = await ConfigurationManager.generateProjectConfig(
  process.env.PROJECT_DOMAIN,
  process.env.PROJECT_OBJECTIVE
);
```

### 4. Extract Workflow Building Blocks

Move reusable workflow patterns to their own modules:
- Workflow Stage builders
- Organizational Unit factories
- Visualization generators

### 5. Implementation Steps

1. Extract all agent classes first
2. Incorporate `DataGenerationManager` to replace hardcoded generators
3. Update workflow stages to use the dynamic data generators
4. Test with various domains to ensure it's working across contexts

## Example: Refactored Workflow Stage

Here's how a refactored workflow stage might look:

```typescript
{
  id: 'location_optimization',
  name: 'Deployment Location Optimization',
  description: 'Analyze environmental data to determine optimal sensor deployment locations',
  unit: UNITS.RESEARCH,
  agent: new DataProcessingAgent({
    id: 'location_optimizer',
    name: 'Deployment Optimization Algorithm',
    unitId: UNITS.RESEARCH.id,
    unitName: UNITS.RESEARCH.name,
    description: 'Processes geographic and demographic data to recommend optimal deployment locations',
    processingFunction: async (data) => {
      // Use the data generation manager instead of hardcoded function
      const coverage = data.coverage || 'medium';
      const locations = await dataGenerator.generateLocations(
        count = coverage === 'high' ? 20 : 
               coverage === 'medium' ? 12 : 
               coverage === 'low' ? 5 : 10,
        { coverage }
      );
      
      return {
        recommended_locations: locations,
        optimization_criteria: {
          coverage_level: coverage,
          demographic_factors: data.demographics || ['population_density', 'vulnerability'],
          environmental_factors: data.environmental || ['pollution_sources', 'wind_patterns']
        },
        timestamp: new Date().toISOString()
      };
    }
  }),
  prepareInput: (context) => {
    return {
      project_name: context.config.PROJECT_ID || 'deployment-optimization',
      coverage: 'medium',
      demographics: ['population_density', 'age_distribution', 'vulnerability_index'],
      environmental: ['pollution_sources', 'wind_patterns', 'traffic_density']
    };
  },
  dependencies: [],
  outputKey: 'deployment_locations'
}
```

## Testing

To test the refactored workflow, try running it with different project configurations:

```typescript
// Test with air quality domain
await runHybridAgentWorkflow({
  DOMAIN: "Environmental monitoring",
  OBJECTIVE: "Develop a community air quality monitoring network",
  // ...
});

// Test with neuroscience domain
await runHybridAgentWorkflow({
  DOMAIN: "Neuroscience and micro-robotics",
  OBJECTIVE: "Develop an automated micro-dissection system for precise ant brain extraction",
  // ...
});
```

This approach ensures the workflow is truly domain-agnostic and can generate appropriate content for any project context. 