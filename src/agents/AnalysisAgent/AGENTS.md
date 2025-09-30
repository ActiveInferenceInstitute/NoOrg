# AnalysisAgent Documentation

## Overview

The **AnalysisAgent** specializes in analyzing datasets, extracting insights, creating visualizations, and generating statistical reports. It extends the AbstractAgent base class to provide comprehensive data analysis capabilities.

## Core Capabilities

- **Data Analysis** - Exploratory, descriptive, inferential, diagnostic, and predictive analysis
- **Statistical Testing** - Hypothesis testing, correlation analysis, regression modeling
- **Trend Analysis** - Time series analysis, pattern detection, forecasting
- **Outlier Detection** - Anomaly detection and impact assessment
- **Visualization Generation** - Chart creation, configuration, and code generation
- **Report Generation** - Executive, technical, and comprehensive reports

## Interface

### Constructor

```typescript
constructor(config: AgentConfig)
```

**Parameters:**
- `config` (AgentConfig): Configuration object containing agent settings

**Example:**
```typescript
const analysisAgent = new AnalysisAgent({
  id: 'analysis-001',
  name: 'Data Analysis Specialist',
  type: 'analysis',
  description: 'Expert in data analysis and insights extraction',
  capabilities: ['data-analysis', 'statistics', 'visualization'],
  status: 'available',
  preferredModel: 'gpt-4o',
  metadata: {
    analysisDepth: 'comprehensive',
    visualizationFramework: 'plotly',
    statisticalTests: ['t-test', 'chi-square', 'correlation']
  }
});
```

### Core Methods

#### analyzeData()

Performs comprehensive data analysis and extracts insights.

```typescript
async analyzeData(
  data: any,
  options?: {
    analysisType?: 'exploratory' | 'descriptive' | 'inferential' | 'diagnostic' | 'predictive';
    focusAreas?: string[];
    includeVisualizationSuggestions?: boolean;
    includeStatisticalTests?: boolean;
    includeTrends?: boolean;
    includeCorrelations?: boolean;
    includeOutliers?: boolean;
    includeRecommendations?: boolean;
    checkCache?: boolean;
  }
): Promise<AnalysisResult>
```

**Parameters:**
- `data` (any): Dataset to analyze (array of objects or similar structure)
- `options` (object, optional): Analysis configuration options

**Returns:** `Promise<AnalysisResult>` - Comprehensive analysis results

**Example:**
```typescript
const analysisResult = await analysisAgent.analyzeData(dataset, {
  analysisType: 'comprehensive',
  focusAreas: ['profitability', 'growth', 'efficiency'],
  includeVisualizationSuggestions: true,
  includeStatisticalTests: true,
  includeRecommendations: true
});

console.log('Analysis Summary:', analysisResult.summary);
console.log('Key Insights:', analysisResult.keyInsights);
console.log('Statistical Tests:', analysisResult.statisticalTests);
```

#### createVisualization()

Generates visualization configurations and code.

```typescript
async createVisualization(
  data: any,
  options?: {
    visualizationType?: 'bar' | 'line' | 'scatter' | 'pie' | 'histogram' | 'heatmap' | 'box' | 'radar' | 'auto';
    variables?: string[];
    title?: string;
    purpose?: string;
    palette?: string[];
    includeCode?: boolean;
    framework?: 'matplotlib' | 'plotly' | 'seaborn' | 'ggplot' | 'chart.js' | 'd3' | 'echarts';
    checkCache?: boolean;
  }
): Promise<VisualizationResult>
```

**Parameters:**
- `data` (any): Data to visualize
- `options` (object, optional): Visualization configuration

**Returns:** `Promise<VisualizationResult>` - Visualization configuration and code

**Example:**
```typescript
const vizConfig = await analysisAgent.createVisualization(salesData, {
  visualizationType: 'line',
  variables: ['revenue', 'month'],
  title: 'Monthly Revenue Trends',
  purpose: 'Show revenue growth over time',
  framework: 'plotly',
  includeCode: true
});

console.log('Visualization Type:', vizConfig.visualizationType);
console.log('Generated Code:', vizConfig.code);
```

#### generateReport()

Creates formatted reports based on analysis results.

```typescript
async generateReport(
  data: any,
  options?: {
    reportType?: 'executive' | 'technical' | 'comprehensive';
    sections?: string[];
    audience?: 'executives' | 'analysts' | 'stakeholders' | 'technical';
    includeExecutiveSummary?: boolean;
    includeMethodology?: boolean;
    includeVisualizations?: boolean;
    includeRecommendations?: boolean;
    checkCache?: boolean;
  }
): Promise<ReportResult>
```

**Parameters:**
- `data` (any): Data or analysis results to report on
- `options` (object, optional): Report configuration

**Returns:** `Promise<ReportResult>` - Structured report

**Example:**
```typescript
const report = await analysisAgent.generateReport(analysisResults, {
  reportType: 'executive',
  audience: 'executives',
  includeExecutiveSummary: true,
  includeVisualizations: true,
  includeRecommendations: true
});

console.log('Report Title:', report.title);
console.log('Sections:', report.sections.length);
console.log('Key Findings:', report.keyFindings);
```

## Configuration Options

### Agent Configuration

```typescript
interface AnalysisAgentConfig extends AgentConfig {
  analysisDepth?: 'basic' | 'detailed' | 'comprehensive';
  defaultVisualizationFramework?: 'matplotlib' | 'plotly' | 'seaborn' | 'chart.js';
  statisticalTestDefaults?: string[];
  reportTemplate?: 'executive' | 'technical' | 'comprehensive';
  cacheTTL?: number; // Cache time-to-live in milliseconds
}
```

### Runtime Options

```typescript
interface AnalysisOptions {
  analysisType?: 'exploratory' | 'descriptive' | 'inferential' | 'diagnostic' | 'predictive';
  focusAreas?: string[];
  includeVisualizationSuggestions?: boolean;
  includeStatisticalTests?: boolean;
  includeTrends?: boolean;
  includeCorrelations?: boolean;
  includeOutliers?: boolean;
  includeRecommendations?: boolean;
  checkCache?: boolean;
}
```

## Error Handling

The AnalysisAgent includes comprehensive error handling:

```typescript
try {
  const result = await analysisAgent.analyzeData(data);
} catch (error) {
  if (error instanceof AnalysisError) {
    console.error('Analysis failed:', error.message);
    console.error('Suggestions:', error.suggestions);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

**Common Error Types:**
- `DataValidationError` - Invalid data format or structure
- `AnalysisTimeoutError` - Analysis exceeded time limits
- `StatisticalError` - Statistical computation failures
- `VisualizationError` - Chart generation failures

## Performance Characteristics

### Computational Complexity
- **Basic Analysis**: O(n) - Linear with dataset size
- **Comprehensive Analysis**: O(n²) - Quadratic for correlation analysis
- **Statistical Tests**: O(n) to O(n²) depending on test type

### Memory Usage
- **Small Datasets** (< 1,000 records): ~10MB
- **Medium Datasets** (1,000-10,000 records): ~50MB
- **Large Datasets** (10,000+ records): ~200MB+

### Processing Time
- **Basic Analysis**: 1-5 seconds
- **Comprehensive Analysis**: 5-30 seconds
- **Report Generation**: 2-10 seconds
- **Visualization Creation**: 1-3 seconds

## Integration Examples

### With MultiAgentCoordinator

```typescript
// Register the agent
const agentId = await coordinator.registerAgent(analysisAgent.getAgentInfo());

// Create analysis task
const taskId = await coordinator.createTask({
  name: 'Customer Segmentation Analysis',
  description: 'Analyze customer data to identify segments',
  type: 'data-analysis',
  priority: 'high',
  metadata: {
    requiredCapabilities: ['data-analysis', 'statistics'],
    dataSource: 'customer_database',
    analysisType: 'descriptive'
  }
});

// Execute the analysis
await coordinator.assignTask(taskId, agentId);
const result = await coordinator.getTask(taskId);
console.log('Analysis complete:', result.results);
```

### With Other Agents

```typescript
// Research Agent provides data
const researchData = await researchAgent.gatherData(topic);

// Analysis Agent processes the data
const analysis = await analysisAgent.analyzeData(researchData, {
  analysisType: 'comprehensive',
  includeRecommendations: true
});

// Writing Agent creates report
const report = await writingAgent.generateContent(
  `Analysis Results: ${analysis.summary}`,
  {
    format: 'blog-post',
    tone: 'professional',
    includeRecommendations: true
  }
);
```

## Best Practices

### 1. Data Preparation
```typescript
// Ensure data is properly formatted
const cleanedData = await dataAgent.cleanData(rawData);

// Validate data structure
const validatedData = await dataAgent.validateSchema(cleanedData, schema);

// Analysis works best with clean, structured data
```

### 2. Analysis Configuration
```typescript
// Start with basic analysis to understand data
const basicAnalysis = await analysisAgent.analyzeData(data, {
  analysisType: 'exploratory'
});

// Then do comprehensive analysis based on findings
const comprehensiveAnalysis = await analysisAgent.analyzeData(data, {
  analysisType: 'comprehensive',
  focusAreas: basicAnalysis.keyInsights,
  includeRecommendations: true
});
```

### 3. Visualization Best Practices
```typescript
// Choose appropriate visualization types
const chartConfig = await analysisAgent.createVisualization(data, {
  visualizationType: 'auto', // Let agent suggest best type
  variables: ['revenue', 'month'],
  purpose: 'Show revenue trends over time'
});

// Use consistent frameworks
const consistentCharts = await analysisAgent.createVisualization(data, {
  framework: 'plotly', // Consistent with project standards
  includeCode: true
});
```

### 4. Report Generation
```typescript
// Tailor reports to audience
const executiveReport = await analysisAgent.generateReport(analysis, {
  reportType: 'executive',
  audience: 'executives',
  includeExecutiveSummary: true
});

const technicalReport = await analysisAgent.generateReport(analysis, {
  reportType: 'technical',
  audience: 'analysts',
  includeMethodology: true
});
```

## Advanced Usage

### Custom Statistical Tests

```typescript
// Define custom statistical tests
const customTests = [
  {
    name: 'Custom Correlation Test',
    variables: ['feature1', 'feature2'],
    testFunction: (data: any[]) => customCorrelationTest(data)
  }
];

// Run analysis with custom tests
const result = await analysisAgent.analyzeData(data, {
  includeStatisticalTests: true,
  customTests: customTests
});
```

### Real-time Analysis

```typescript
// Set up real-time analysis monitoring
const analysisStream = analysisAgent.createAnalysisStream();

analysisStream.on('data', (partialResult) => {
  console.log('Partial analysis:', partialResult);
});

analysisStream.on('complete', (finalResult) => {
  console.log('Analysis complete:', finalResult);
});

await analysisStream.start(data);
```

### Batch Processing

```typescript
// Process multiple datasets
const batchResults = await Promise.all(
  datasets.map(dataset =>
    analysisAgent.analyzeData(dataset, { analysisType: 'basic' })
  )
);

// Aggregate results
const aggregatedInsights = analysisAgent.aggregateResults(batchResults);
```

## Troubleshooting

### Common Issues

#### 1. "Data validation failed"
**Cause:** Invalid data format or structure
**Solution:**
```typescript
// Validate data first
const validation = await dataAgent.validateData(inputData);
if (!validation.valid) {
  console.error('Data issues:', validation.errors);
  // Fix data issues before analysis
}
```

#### 2. "Analysis timeout"
**Cause:** Dataset too large or complex analysis
**Solution:**
```typescript
// Use smaller datasets or simpler analysis
const result = await analysisAgent.analyzeData(data.slice(0, 1000), {
  analysisType: 'basic'
});
```

#### 3. "Statistical test failed"
**Cause:** Insufficient data or inappropriate test
**Solution:**
```typescript
// Check data requirements for statistical tests
const requirements = analysisAgent.getStatisticalTestRequirements(testName);
if (data.length < requirements.minSampleSize) {
  // Use different test or collect more data
}
```

### Performance Optimization

1. **Enable caching** for repeated analyses
2. **Use appropriate analysis types** for data size
3. **Batch similar analyses** to reduce overhead
4. **Monitor memory usage** for large datasets

### Debug Mode

```typescript
// Enable detailed logging
analysisAgent.setLogLevel('debug');

// Get detailed error information
try {
  await analysisAgent.analyzeData(data);
} catch (error) {
  console.error('Detailed error:', error.details);
  console.error('Stack trace:', error.stack);
}
```

## Version History

- **v1.0.0** - Initial release with core analysis capabilities
- **v1.1.0** - Added visualization generation and report creation
- **v1.2.0** - Enhanced statistical testing and caching
- **v1.3.0** - Added real-time analysis and batch processing

## Support

For issues and questions:
- Check the [troubleshooting guide](../../../docs/troubleshooting/index.md)
- Review the [API reference](../../../docs/api/reference.md)
- File issues in the [GitHub repository](https://github.com/noorg/noorg/issues)

---

**Last Updated:** 2025-09-29
**Version:** 1.3.0
**License:** CC BY-NC-SA 4.0

