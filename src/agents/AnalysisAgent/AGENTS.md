# AnalysisAgent Documentation

## Overview

The **AnalysisAgent** specializes in analyzing data and generating insights through AI-powered analysis. It extends the BaseAgent class to provide basic data analysis capabilities using OpenAI's language models.

## Core Capabilities

- **Data Analysis** - Basic data analysis using AI to extract insights, trends, and recommendations
- **Report Generation** - Generate reports in text, JSON, or markdown formats
- **Pattern Recognition** - Identify patterns and trends in datasets
- **Insight Extraction** - Extract key insights from structured and unstructured data

## Interface

### Constructor

```typescript
constructor(name: string, config: AgentConfig)
```

**Parameters:**
- `name` (string): Human-readable name for the agent
- `config` (AgentConfig): Configuration object containing agent settings

**Example:**
```typescript
const analysisAgent = new AnalysisAgent('Data Analyst', {
  id: 'analysis-001',
  capabilities: ['data-analysis'],
  preferredModel: 'o3-mini',
  metadata: {}
});
```

### Core Methods

#### analyzeData()

Analyzes data using AI to extract insights, trends, and recommendations.

```typescript
async analyzeData(data: any): Promise<{
  insights: string[];
  trends: string[];
  recommendations: string[];
  confidence: number;
  processingTime: number;
}>
```

**Parameters:**
- `data` (any): Data to analyze (can be any JSON-serializable object)

**Returns:** `Promise<Object>` - Analysis results containing:
- `insights` (string[]): Key insights extracted from the data
- `trends` (string[]): Identified trends and patterns
- `recommendations` (string[]): Actionable recommendations
- `confidence` (number): Confidence score (0-1)
- `processingTime` (number): Processing time in milliseconds

**Example:**
```typescript
const data = {
  sales: [100, 150, 120, 180, 200],
  months: ['Jan', 'Feb', 'Mar', 'Apr', 'May']
};

const result = await analysisAgent.analyzeData(data);

console.log('Insights:', result.insights);
console.log('Trends:', result.trends);
console.log('Recommendations:', result.recommendations);
console.log('Confidence:', result.confidence);
console.log('Processing Time:', result.processingTime + 'ms');
```

#### generateReport()

Generates a formatted report from data in the specified format.

```typescript
async generateReport(data: any, format: 'text' | 'json' | 'markdown'): Promise<string>
```

**Parameters:**
- `data` (any): Data to generate report from
- `format` ('text' | 'json' | 'markdown'): Output format for the report

**Returns:** `Promise<string>` - Formatted report content

**Example:**
```typescript
const analysisData = await analysisAgent.analyzeData(someData);
const report = await analysisAgent.generateReport(analysisData, 'markdown');

console.log('Generated Report:');
console.log(report);
```

## Configuration Options

The AnalysisAgent uses standard AgentConfig options:

```typescript
interface AgentConfig {
  id?: string;
  capabilities?: string[];
  preferredModel?: string;
  metadata?: Record<string, any>;
}
```

## Error Handling

Basic error handling through the BaseAgent class:

```typescript
try {
  const result = await analysisAgent.analyzeData(data);
  console.log('Analysis complete:', result);
} catch (error) {
  console.error('Analysis failed:', error.message);
  // Agent status automatically updated to 'error' by BaseAgent
}
```

## Performance Characteristics

### Processing Time
- **Typical Analysis**: 2-5 seconds (depends on data size and OpenAI response time)
- **Report Generation**: 1-3 seconds

### Resource Usage
- **Memory**: Minimal additional memory beyond base agent requirements
- **API Calls**: 1-2 OpenAI API calls per analysis operation

## Integration Examples

### With MultiAgentCoordinator

```typescript
// Register the agent
const agentId = await coordinator.registerAgent({
  id: 'analysis-agent',
  name: 'Data Analyst',
  type: 'analysis',
  capabilities: ['data-analysis'],
  status: 'available'
});

// Create analysis task
const taskId = await coordinator.createTask({
  name: 'Sales Data Analysis',
  description: 'Analyze sales data for insights',
  type: 'analysis',
  metadata: {
    data: { sales: [100, 200, 150, 300] }
  }
});

// Execute the analysis
await coordinator.assignTask(taskId, agentId);
// Task will be processed automatically
```

### Basic Usage

```typescript
// Direct usage
const salesData = {
  revenue: [10000, 15000, 12000, 18000, 22000],
  months: ['Jan', 'Feb', 'Mar', 'Apr', 'May']
};

const analysis = await analysisAgent.analyzeData(salesData);

// Generate a markdown report
const report = await analysisAgent.generateReport(analysis, 'markdown');
console.log(report);
```

## Best Practices

### Data Formatting
```typescript
// Structure data clearly for better analysis
const salesData = {
  revenue: [10000, 15000, 12000, 18000, 22000],
  periods: ['Q1', 'Q2', 'Q3', 'Q4', 'Q5'],
  categories: ['Product A', 'Product B', 'Product C']
};

const analysis = await analysisAgent.analyzeData(salesData);
```

### Report Formats
```typescript
// Choose appropriate format for your use case
const textReport = await analysisAgent.generateReport(data, 'text');
const markdownReport = await analysisAgent.generateReport(data, 'markdown');
const jsonData = await analysisAgent.generateReport(data, 'json');
```

### Error Handling
```typescript
try {
  const result = await analysisAgent.analyzeData(largeDataset);
  console.log('Analysis confidence:', result.confidence);
} catch (error) {
  console.error('Analysis failed, trying simpler data:', error.message);
  // Fallback to smaller dataset or different approach
}
```

## Troubleshooting

### Common Issues

#### OpenAI API Errors
**Cause:** API key issues, rate limits, or network problems
**Solution:**
```typescript
// Check API key configuration
console.log('API Key configured:', !!process.env.OPENAI_API_KEY);

// Use different model if rate limited
const result = await analysisAgent.analyzeData(data); // Will use fallback model
```

#### Large Data Processing
**Cause:** Data too large for single API call
**Solution:**
```typescript
// Break large datasets into smaller chunks
const chunks = splitDataIntoChunks(largeData, 100);
const results = [];
for (const chunk of chunks) {
  const result = await analysisAgent.analyzeData(chunk);
  results.push(result);
}
```

#### Processing Timeouts
**Cause:** Complex data or slow API responses
**Solution:**
```typescript
// Simplify data structure
const simplified = extractKeyFields(complexData);
const result = await analysisAgent.analyzeData(simplified);
```

## Performance Optimization

1. **Data Simplification**: Remove unnecessary fields before analysis
2. **Chunking**: Process large datasets in smaller pieces
3. **Caching**: Cache results for similar data patterns
4. **Model Selection**: Use appropriate models for task complexity

## Version History

- **v1.0.0** - Initial release with basic analysis and reporting capabilities

## Dependencies

- BaseAgent (framework core)
- OpenAI API (for AI-powered analysis)
- SharedStateManager (for state management)

