# CreativeWritingAgent Documentation

## Overview

The **CreativeWritingAgent** specializes in generating creative content including stories, blog posts, marketing copy, poems, dialogue, and other forms of creative writing. It extends the AbstractAgent base class and includes intelligent caching for improved performance.

## Core Capabilities

- **Content Generation** - Generate content in various formats (stories, blog posts, marketing copy, poems, dialogue)
- **Content Refinement** - Revise and improve existing content based on feedback
- **Style Adaptation** - Generate content in specific writing styles
- **Intelligent Caching** - Cache generated content to improve performance for repeated requests
- **Format Support** - Support for multiple output formats and tones

## Interface

### Constructor

```typescript
constructor(config: AgentConfig)
```text

**Parameters:**
- `config` (AgentConfig): Configuration object containing agent settings

**Example:**
```typescript
const writingAgent = new CreativeWritingAgent({
  id: 'creative-001',
  name: 'Creative Writing Specialist',
  type: 'creative-writer',
  description: 'Expert in creative content generation and refinement',
  capabilities: ['creative-writing', 'content-generation', 'style-adaptation'],
  status: 'available',
  preferredModel: 'gpt-4o',
  metadata: {
    creativeLevel: 'high',
    supportedFormats: ['story', 'blog-post', 'marketing-copy', 'poem'],
    tonePreferences: ['professional', 'casual', 'inspirational']
  }
});
```text

### Core Methods

#### generateContent()

Generate creative content in various formats.

```typescript
async generateContent(
  contentPrompt: string,
  options?: {
    format?: 'story' | 'blog-post' | 'marketing-copy' | 'poem' | 'dialogue' | 'free-form';
    tone?: 'professional' | 'casual' | 'humorous' | 'serious' | 'inspirational';
    length?: 'short' | 'medium' | 'long';
    style?: string;
    keywords?: string[];
    checkCache?: boolean;
    temperature?: number;
  }
): Promise<ContentResult>
```text

**Parameters:**
- `contentPrompt` (string): Prompt describing the content to generate
- `options` (object, optional): Content generation configuration

**Returns:** `Promise<ContentResult>` - Generated content with metadata

**Example:**
```typescript
const content = await writingAgent.generateContent(
  'Write about the future of sustainable technology',
  {
    format: 'blog-post',
    tone: 'professional',
    length: 'medium',
    keywords: ['sustainability', 'innovation', 'technology'],
    style: 'thought-leadership'
  }
);

console.log('Title:', content.title);
console.log('Content:', content.content);
console.log('Word Count:', content.wordCount);
```text

#### refineContent()

Refine and improve existing content based on feedback.

```typescript
async refineContent(
  originalContent: string,
  feedback: string
): Promise<RefinementResult>
```text

**Parameters:**
- `originalContent` (string): Content to refine
- `feedback` (string): Specific feedback for improvements

**Returns:** `Promise<RefinementResult>` - Refined content with change descriptions

**Example:**
```typescript
const refined = await writingAgent.refineContent(
  originalContent,
  'Make it more engaging for younger audiences and add specific examples'
);

console.log('Refined Content:', refined.refinedContent);
console.log('Changes Made:', refined.changes);
```text

#### generateStylizedContent()

Generate content in a specific writing style.

```typescript
async generateStylizedContent(
  contentPrompt: string,
  style: string,
  options?: {
    format?: 'story' | 'blog-post' | 'marketing-copy' | 'poem' | 'dialogue' | 'free-form';
    length?: 'short' | 'medium' | 'long';
    examples?: string[];
    temperature?: number;
  }
): Promise<StylizedContentResult>
```text

**Parameters:**
- `contentPrompt` (string): Core content idea
- `style` (string): Target writing style description
- `options` (object, optional): Stylization options

**Returns:** `Promise<StylizedContentResult>` - Content with style confidence metrics

**Example:**
```typescript
const stylizedContent = await writingAgent.generateStylizedContent(
  'A story about friendship and adventure',
  'Ernest Hemingway style',
  {
    format: 'story',
    length: 'medium',
    examples: ['The Old Man and the Sea excerpt...']
  }
);

console.log('Content:', stylizedContent.content);
console.log('Style Confidence:', stylizedContent.styleConfidence);
```text

## Configuration Options

### Agent Configuration

```typescript
interface CreativeWritingAgentConfig extends AgentConfig {
  creativeLevel?: 'conservative' | 'balanced' | 'bold';
  supportedFormats?: string[];
  tonePreferences?: string[];
  defaultLength?: 'short' | 'medium' | 'long';
  styleAdaptation?: boolean;
  cacheTTL?: number; // Cache time-to-live
}
```text

### Runtime Options

```typescript
interface ContentGenerationOptions {
  format?: 'story' | 'blog-post' | 'marketing-copy' | 'poem' | 'dialogue' | 'free-form';
  tone?: 'professional' | 'casual' | 'humorous' | 'serious' | 'inspirational';
  length?: 'short' | 'medium' | 'long';
  style?: string;
  keywords?: string[];
  checkCache?: boolean;
  temperature?: number;
}
```text

## Performance Characteristics

### Computational Complexity
- **Basic Content**: O(n) - Linear with content length
- **Style Adaptation**: O(n²) - Quadratic due to style analysis
- **Format Optimization**: O(n) - Linear content restructuring

### Memory Usage
- **Short Content**: ~5MB
- **Medium Content**: ~15MB
- **Long Content**: ~50MB

### Processing Time
- **Short Content**: 2-5 seconds
- **Medium Content**: 5-15 seconds
- **Long Content**: 15-45 seconds
- **Style Adaptation**: +50% processing time

## Integration Examples

### With MultiAgentCoordinator

```typescript
// Register the agent
const agentId = await coordinator.registerAgent(writingAgent.getAgentInfo());

// Create content generation task
const taskId = await coordinator.createTask({
  name: 'Generate Blog Post',
  description: 'Create engaging blog post about AI ethics',
  type: 'creative-writing',
  priority: 'medium',
  metadata: {
    requiredCapabilities: ['creative-writing'],
    format: 'blog-post',
    tone: 'professional',
    length: 'medium'
  }
});

// Execute the task
await coordinator.assignTask(taskId, agentId);
const result = await coordinator.getTask(taskId);
```text

### With Other Agents

```typescript
// Research Agent provides topic
const researchData = await researchAgent.gatherData('AI Ethics in Business');

// Writing Agent creates content
const content = await writingAgent.generateContent(
  `Based on this research: ${researchData.summary}`,
  {
    format: 'blog-post',
    tone: 'professional',
    keywords: researchData.keyTopics
  }
);

// Review Agent checks quality
const review = await reviewAgent.reviewContent(content.content);
```text

## Best Practices

### 1. Content Structure
```typescript
// Use clear, specific prompts
const content = await writingAgent.generateContent(
  'Write about renewable energy adoption',
  {
    format: 'blog-post',
    length: 'medium',
    keywords: ['solar', 'wind', 'sustainability']
  }
);
```text

### 2. Style Consistency
```typescript
// Maintain consistent voice across content
const article1 = await writingAgent.generateContent('Topic 1', {
  style: 'professional-tech',
  tone: 'informative'
});

const article2 = await writingAgent.generateContent('Topic 2', {
  style: 'professional-tech',
  tone: 'informative'
});
```text

### 3. Content Refinement
```typescript
// Use refinement for iterative improvement
let content = await writingAgent.generateContent(initialPrompt);
const feedback = await reviewAgent.reviewContent(content.content);

content = await writingAgent.refineContent(content.content, feedback);
```text

### 4. Performance Optimization
```typescript
// Use appropriate length settings
const shortContent = await writingAgent.generateContent(prompt, {
  length: 'short', // Faster generation
  temperature: 0.7
});
```text

## Error Handling

The CreativeWritingAgent includes comprehensive error handling:

```typescript
try {
  const content = await writingAgent.generateContent(prompt);
} catch (error) {
  if (error instanceof ContentGenerationError) {
    console.error('Content generation failed:', error.message);
    console.error('Suggestions:', error.suggestions);
  } else {
    console.error('Unexpected error:', error);
  }
}
```text

**Common Error Types:**
- `PromptValidationError` - Invalid or unclear prompts
- `ContentGenerationError` - API failures or timeouts
- `FormatValidationError` - Generated content doesn't match format requirements
- `StyleAdaptationError` - Unable to adapt to requested style

## Advanced Usage

### Custom Style Training

```typescript
// Train agent on specific style
const styleExamples = [
  'Example 1 in target style...',
  'Example 2 in target style...'
];

const stylizedContent = await writingAgent.generateStylizedContent(
  'New content idea',
  'Custom trained style',
  { examples: styleExamples }
);
```text

### Batch Content Generation

```typescript
// Generate multiple pieces of content
const prompts = [
  'Topic 1 description',
  'Topic 2 description',
  'Topic 3 description'
];

const contents = await Promise.all(
  prompts.map(prompt =>
    writingAgent.generateContent(prompt, { format: 'blog-post' })
  )
);
```text

### Content Series Management

```typescript
// Create content series with consistent style
const seriesConfig = {
  format: 'blog-post',
  tone: 'professional',
  style: 'thought-leadership'
};

const series = await Promise.all(
  topics.map(topic =>
    writingAgent.generateContent(topic, seriesConfig)
  )
);
```text

## Troubleshooting

### Common Issues

#### 1. "Content doesn't match requested format"
**Cause:** Format specifications unclear or conflicting
**Solution:**
```typescript
// Provide clearer format instructions
const content = await writingAgent.generateContent(prompt, {
  format: 'blog-post',
  length: 'medium',
  // Add format-specific instructions
  metadata: {
    formatInstructions: 'Include introduction, body sections, and conclusion'
  }
});
```text

#### 2. "Generated content is too generic"
**Cause:** Prompt lacks specific details
**Solution:**
```typescript
// Provide more specific, detailed prompts
const content = await writingAgent.generateContent(
  'Write about sustainable fashion trends',
  {
    keywords: ['organic cotton', 'recycled materials', 'ethical manufacturing'],
    style: 'industry-expert',
    tone: 'authoritative'
  }
);
```text

#### 3. "Style adaptation not working"
**Cause:** Style description too vague or examples insufficient
**Solution:**
```typescript
// Provide clear style description and examples
const content = await writingAgent.generateStylizedContent(
  'New content idea',
  'Hemingway-esque minimalist style',
  {
    examples: ['The Old Man and the Sea excerpt...'],
    format: 'story'
  }
);
```text

### Performance Optimization

1. **Enable caching** for repeated content types
2. **Use appropriate length settings** for faster generation
3. **Provide clear, specific prompts** to reduce iterations
4. **Batch similar content** to reduce overhead

### Debug Mode

```typescript
// Enable detailed logging
writingAgent.setLogLevel('debug');

// Get detailed error information
try {
  await writingAgent.generateContent(prompt);
} catch (error) {
  console.error('Detailed error:', error.details);
  console.error('Stack trace:', error.stack);
}
```text

## Version History

- **v1.0.0** - Initial release with basic content generation
- **v1.1.0** - Added style adaptation and content refinement
- **v1.2.0** - Enhanced format support and caching
- **v1.3.0** - Added batch processing and style training

## Support

For issues and questions:
- Check the [troubleshooting guide](../../../docs/troubleshooting/index.md)
- Review the [API reference](../../../docs/api/reference.md)
- File issues in the [GitHub repository](https://github.com/noorg/noorg/issues)

---

**Last Updated:** 2025-09-29
**Version:** 1.3.0
**License:** CC BY-NC-SA 4.0

