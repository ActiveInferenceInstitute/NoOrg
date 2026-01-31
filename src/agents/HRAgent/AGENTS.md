# HRAgent Documentation

## Overview

The **HRAgent** specializes in human resources tasks including job description creation, interview question generation, employee onboarding, and policy development. It extends the AbstractAgent base class to provide comprehensive HR support.

## Core Capabilities

- **Job Description Creation** - Write detailed job descriptions and requirements
- **Interview Question Generation** - Create relevant interview questions and evaluation criteria
- **Employee Onboarding** - Develop comprehensive onboarding plans and processes
- **Policy Development** - Create HR policies and procedures
- **Performance Evaluation** - Design performance review frameworks
- **Professional Communication** - Generate HR communications and templates

## Interface

### Constructor

```typescript
constructor(config: AgentConfig)
```text

### Core Methods

#### createJobDescription()

Create comprehensive job descriptions.

```typescript
async createJobDescription(
  jobTitle: string,
  options?: {
    department?: string;
    experienceLevel?: 'entry' | 'mid' | 'senior' | 'executive';
    responsibilities?: string[];
    requiredSkills?: string[];
    preferredSkills?: string[];
    education?: string;
    location?: string;
    remoteOption?: boolean;
    companyDescription?: string;
    checkCache?: boolean;
  }
): Promise<JobDescriptionResult>
```text

#### generateInterviewQuestions()

Generate structured interview questions.

```typescript
async generateInterviewQuestions(
  jobTitle: string,
  options?: {
    questionTypes?: ('technical' | 'behavioral' | 'situational' | 'cultural-fit')[];
    experienceLevel?: 'entry' | 'mid' | 'senior' | 'executive';
    skillsToAssess?: string[];
    numberOfQuestions?: number;
    includeIdealAnswers?: boolean;
    checkCache?: boolean;
  }
): Promise<InterviewQuestionsResult>
```text

#### createOnboardingPlan()

Create employee onboarding plans.

```typescript
async createOnboardingPlan(
  roleName: string,
  options?: {
    department?: string;
    duration?: number;
    includeTrainings?: boolean;
    includeTeamIntroductions?: boolean;
    includeSetupTasks?: boolean;
    isRemote?: boolean;
  }
): Promise<OnboardingPlanResult>
```text

## Configuration Options

### Agent Configuration

```typescript
interface HRAgentConfig extends AgentConfig {
  specialty?: 'recruitment' | 'employee-relations' | 'benefits' | 'compliance' | 'training';
  empathyLevel?: number; // 0.0 to 1.0
  formalityLevel?: number; // 0.0 to 1.0
  companyContext?: Record<string, any>;
  policyTemplates?: Record<string, string>;
  cacheTTL?: number;
}
```text

## Performance Characteristics

### Computational Complexity
- **Job Description**: O(n) - Linear with requirements
- **Interview Questions**: O(n) - Linear with question count
- **Onboarding Plan**: O(n) - Linear with plan complexity

### Memory Usage
- **Simple Document**: ~3MB
- **Complex Plan**: ~8MB
- **Interview Guide**: ~5MB

### Processing Time
- **Job Description**: 2-5 seconds
- **Interview Questions**: 3-6 seconds
- **Onboarding Plan**: 4-8 seconds

## Integration Examples

### With MultiAgentCoordinator

```typescript
// Register the agent
const agentId = await coordinator.registerAgent(hrAgent.getAgentInfo());

// Create HR task
const taskId = await coordinator.createTask({
  name: 'Create Job Description',
  description: 'Write job description for Senior Developer position',
  type: 'hr',
  priority: 'medium',
  metadata: {
    requiredCapabilities: ['job-description-creation'],
    department: 'Engineering',
    experienceLevel: 'senior'
  }
});

// Execute the task
await coordinator.assignTask(taskId, agentId);
const result = await coordinator.getTask(taskId);
```text

## Best Practices

1. **Clear Specifications** - Provide detailed job requirements and context
2. **Company Alignment** - Include company culture and values in HR materials
3. **Legal Compliance** - Ensure all HR materials comply with employment laws
4. **Inclusive Language** - Use inclusive, non-discriminatory language

## Error Handling

The HRAgent includes comprehensive error handling for template issues, requirement conflicts, and generation failures.

## Advanced Usage

### Custom HR Templates

```typescript
// Define custom HR templates
const customTemplates = {
  'job-description': 'Custom job description template...',
  'interview-guide': 'Custom interview guide template...',
  'onboarding-checklist': 'Custom onboarding checklist...'
};

// Configure agent with templates
const agent = new HRAgent({
  ...config,
  metadata: {
    ...config.metadata,
    customTemplates: customTemplates
  }
});
```text

### Multi-department Workflows

```typescript
// Create onboarding for multiple departments
const departments = ['Engineering', 'Marketing', 'Sales'];

const onboardingPlans = await Promise.all(
  departments.map(dept =>
    hrAgent.createOnboardingPlan(`Software Engineer - ${dept}`, {
      department: dept,
      duration: 90,
      includeTrainings: true
    })
  )
);
```text

## Version History

- **v1.0.0** - Initial release with job description creation
- **v1.1.0** - Added interview question generation
- **v1.2.0** - Enhanced onboarding plan capabilities
- **v1.3.0** - Added policy development features

## Support

For issues and questions:
- Check the [troubleshooting guide](../../../docs/troubleshooting/index.md)
- Review the [API reference](../../../docs/api/reference.md)
- File issues in the [GitHub repository](https://github.com/noorg/noorg/issues)

---

**Last Updated:** 2025-09-29
**Version:** 1.3.0
**License:** CC BY-NC-SA 4.0

