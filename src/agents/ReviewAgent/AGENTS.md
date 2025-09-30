# ReviewAgent Documentation

## Overview

The **ReviewAgent** specializes in content review, feedback generation, and quality assessment. It extends the AbstractAgent base class to provide comprehensive review and evaluation capabilities.

## Core Capabilities

- **Content Review** - Evaluate content quality and effectiveness
- **Feedback Generation** - Provide constructive feedback and suggestions
- **Quality Assessment** - Score content against quality criteria
- **Improvement Suggestions** - Recommend specific improvements
- **Validation** - Check content against rules and standards

## Interface

### Constructor

```typescript
constructor(config: AgentConfig)
```

### Core Methods

#### reviewContent()

Review content based on specified criteria.

```typescript
async reviewContent(
  content: string,
  criteria: string[]
): Promise<ReviewResult>
```

#### validateContent()

Validate content against specific rules.

```typescript
async validateContent(
  content: string,
  rules: string[]
): Promise<ValidationResult>
```

## Configuration Options

### Agent Configuration

```typescript
interface ReviewAgentConfig extends AgentConfig {
  reviewStyle?: 'constructive' | 'critical' | 'balanced';
  detailLevel?: 'summary' | 'detailed' | 'comprehensive';
  focusAreas?: string[];
  qualityStandards?: Record<string, number>;
  feedbackFormat?: 'structured' | 'narrative' | 'bullet-points';
  cacheTTL?: number;
}
```

## Performance Characteristics

### Computational Complexity
- **Content Review**: O(n) - Linear with content length
- **Validation**: O(n) - Linear with rule count
- **Quality Assessment**: O(n) - Linear with criteria count

### Memory Usage
- **Simple Review**: ~3MB
- **Comprehensive Review**: ~8MB
- **Validation**: ~5MB

### Processing Time
- **Content Review**: 2-5 seconds
- **Validation**: 1-3 seconds
- **Quality Assessment**: 3-6 seconds

## Integration Examples

### With MultiAgentCoordinator

```typescript
// Register the agent
const agentId = await coordinator.registerAgent(reviewAgent.getAgentInfo());

// Create review task
const taskId = await coordinator.createTask({
  name: 'Content Review',
  description: 'Review blog post for quality and clarity',
  type: 'review',
  priority: 'medium',
  metadata: {
    requiredCapabilities: ['content-review', 'quality-assessment'],
    contentType: 'blog-post',
    reviewCriteria: ['clarity', 'engagement', 'accuracy']
  }
});

// Execute the review
await coordinator.assignTask(taskId, agentId);
const result = await coordinator.getTask(taskId);
```

## Best Practices

1. **Clear Criteria** - Define specific review criteria upfront
2. **Context Provision** - Provide context about content purpose and audience
3. **Balanced Feedback** - Include both positive and constructive feedback
4. **Actionable Suggestions** - Provide specific, implementable improvements

## Error Handling

The ReviewAgent includes comprehensive error handling for content format issues, criteria conflicts, and assessment failures.

## Advanced Usage

### Multi-criteria Review

```typescript
// Review content against multiple criteria sets
const criteriaSets = [
  ['technical-accuracy', 'completeness', 'clarity'],
  ['engagement', 'readability', 'structure'],
  ['seo-optimization', 'keyword-usage', 'meta-description']
];

const reviews = await Promise.all(
  criteriaSets.map(criteria =>
    reviewAgent.reviewContent(content, criteria)
  )
);

// Aggregate review results
const aggregatedReview = reviewAgent.aggregateReviews(reviews);
```

### Validation Rules

```typescript
// Define custom validation rules
const validationRules = [
  'Content must be at least 500 words',
  'Must include at least 3 headings',
  'Must contain specific keywords',
  'Must follow specified tone guidelines'
];

// Validate content against rules
const validation = await reviewAgent.validateContent(content, validationRules);
```

## Version History

- **v1.0.0** - Initial release with basic review capabilities
- **v1.1.0** - Added validation and quality scoring
- **v1.2.0** - Enhanced feedback generation
- **v1.3.0** - Added multi-criteria review support

## Support

For issues and questions:
- Check the [troubleshooting guide](../../../docs/troubleshooting/index.md)
- Review the [API reference](../../../docs/api/reference.md)
- File issues in the [GitHub repository](https://github.com/noorg/noorg/issues)

---

**Last Updated:** 2025-09-29
**Version:** 1.3.0
**License:** CC BY-NC-SA 4.0

