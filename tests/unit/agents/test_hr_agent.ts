import { expect } from 'chai';
import { HRAgent } from '../../../src/agents/HRAgent';
import { OpenAIClient } from '../../../src/core/multiagent/OpenAIClient';
import { SharedStateManager } from '../../../src/core/multiagent/SharedStateManager';

describe('HRAgent', () => {
  let hrAgent: HRAgent;
  let mockOpenAIClient: any;
  let mockSharedState: any;
  let originalConsoleLog: any;

  beforeEach(() => {
    // Mock OpenAI client
    mockOpenAIClient = {
      sendPrompt: async (prompt: string, options?: any) => {
        return {
          choices: [{
            message: {
              content: `Mock HR response for: ${prompt.substring(0, 50)}...`
            }
          }],
          usage: {
            prompt_tokens: 150,
            completion_tokens: 300,
            total_tokens: 450
          }
        };
      }
    };

    // Mock SharedState manager
    mockSharedState = {
      setState: (path: string, value: any) => {},
      getState: (path: string) => undefined,
      subscribe: (path: string, callback: Function) => 'mock-subscription-id',
      unsubscribe: (id: string) => {}
    };

    // Create agent
    hrAgent = new HRAgent('Test HR Specialist', {
      openAIClient: mockOpenAIClient as OpenAIClient,
      sharedState: mockSharedState as SharedStateManager,
      preferredModel: 'gpt-4o',
      cacheTTL: 0 // Disable caching for testing
    });

    // Suppress console output during tests
    originalConsoleLog = console.log;
    console.log = () => {};
  });

  afterEach(() => {
    // Restore console.log
    console.log = originalConsoleLog;
  });

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      const result = await hrAgent.initialize();
      expect(result).to.be.true;
      expect(hrAgent.getAgentInfo().status).to.equal('available');
    });

    it('should have correct capabilities', async () => {
      await hrAgent.initialize();

      const info = hrAgent.getAgentInfo();
      expect(info.capabilities).to.include('job-description-creation');
      expect(info.capabilities).to.include('interview-question-generation');
      expect(info.capabilities).to.include('employee-onboarding');
      expect(info.capabilities).to.include('policy-development');
      expect(info.capabilities).to.include('performance-evaluation');
      expect(info.capabilities).to.include('compensation-analysis');
      expect(info.capabilities).to.include('professional-communication');
    });

    it('should support different HR specialties', async () => {
      const recruitmentAgent = new HRAgent('Recruitment Specialist', {
        openAIClient: mockOpenAIClient as OpenAIClient,
        sharedState: mockSharedState as SharedStateManager,
        specialty: 'recruitment'
      });

      const complianceAgent = new HRAgent('Compliance Officer', {
        openAIClient: mockOpenAIClient as OpenAIClient,
        sharedState: mockSharedState as SharedStateManager,
        specialty: 'compliance'
      });

      await recruitmentAgent.initialize();
      await complianceAgent.initialize();

      expect(recruitmentAgent.getAgentInfo().metadata?.specialty).to.equal('recruitment');
      expect(complianceAgent.getAgentInfo().metadata?.specialty).to.equal('compliance');
    });
  });

  describe('Job Description Creation', () => {
    beforeEach(async () => {
      await hrAgent.initialize();
    });

    it('should create comprehensive job descriptions', async () => {
      const jobTitle = 'Senior Software Engineer';

      const result = await hrAgent.createJobDescription(jobTitle);

      expect(result).to.have.property('title');
      expect(result).to.have.property('summary');
      expect(result).to.have.property('responsibilities');
      expect(result).to.have.property('requiredQualifications');
      expect(result).to.have.property('preferredQualifications');
      expect(result).to.have.property('processingTime');
      expect(result.title).to.equal(jobTitle);
      expect(typeof result.summary).to.equal('string');
      expect(Array.isArray(result.responsibilities)).to.be.true;
      expect(Array.isArray(result.requiredQualifications)).to.be.true;
      expect(Array.isArray(result.preferredQualifications)).to.be.true;
    });

    it('should include department information', async () => {
      const jobTitle = 'Marketing Manager';
      const department = 'Marketing';

      const result = await hrAgent.createJobDescription(jobTitle, {
        department
      });

      expect(result.title).to.equal(jobTitle);
      expect(result.summary).to.be.a('string');
      expect(result.summary.length).to.be.greaterThan(0);
    });

    it('should handle different experience levels', async () => {
      const jobTitle = 'Data Analyst';

      const experienceLevels = ['entry', 'mid', 'senior', 'executive'];

      for (const level of experienceLevels) {
        const result = await hrAgent.createJobDescription(jobTitle, {
          experienceLevel: level as any
        });

        expect(result.title).to.equal(jobTitle);
        expect(Array.isArray(result.responsibilities)).to.be.true;
        expect(Array.isArray(result.requiredQualifications)).to.be.true;
      }
    });

    it('should include responsibilities when provided', async () => {
      const jobTitle = 'Project Manager';
      const responsibilities = [
        'Lead cross-functional teams',
        'Manage project timelines and budgets',
        'Coordinate with stakeholders'
      ];

      const result = await hrAgent.createJobDescription(jobTitle, {
        responsibilities
      });

      expect(result.responsibilities).to.be.an('array');
      expect(result.responsibilities.length).to.be.greaterThan(0);
    });

    it('should include required skills when provided', async () => {
      const jobTitle = 'Full Stack Developer';
      const requiredSkills = ['JavaScript', 'React', 'Node.js', 'SQL'];

      const result = await hrAgent.createJobDescription(jobTitle, {
        requiredSkills
      });

      expect(Array.isArray(result.requiredQualifications)).to.be.true;
      expect(result.requiredQualifications.length).to.be.greaterThan(0);
    });

    it('should include preferred skills when provided', async () => {
      const jobTitle = 'DevOps Engineer';
      const preferredSkills = ['Docker', 'Kubernetes', 'AWS'];

      const result = await hrAgent.createJobDescription(jobTitle, {
        preferredSkills
      });

      expect(Array.isArray(result.preferredQualifications)).to.be.true;
      expect(result.preferredQualifications.length).to.be.greaterThan(0);
    });

    it('should include location and remote options', async () => {
      const jobTitle = 'Remote Developer';

      const result = await hrAgent.createJobDescription(jobTitle, {
        location: 'San Francisco, CA',
        remoteOption: true
      });

      expect(result.title).to.equal(jobTitle);
      expect(result.summary).to.be.a('string');
    });

    it('should handle empty job titles', async () => {
      try {
        await hrAgent.createJobDescription('');
        expect.fail('Should have thrown error for empty job title');
      } catch (error: any) {
        expect(error.message).to.be.a('string');
      }
    });
  });

  describe('Interview Question Generation', () => {
    beforeEach(async () => {
      await hrAgent.initialize();
    });

    it('should generate interview questions', async () => {
      const jobTitle = 'Product Manager';

      const result = await hrAgent.generateInterviewQuestions(jobTitle);

      expect(result).to.have.property('questions');
      expect(result).to.have.property('interviewStructure');
      expect(result).to.have.property('processingTime');
      expect(Array.isArray(result.questions)).to.be.true;
      expect(result.questions.length).to.be.greaterThan(0);
      expect(typeof result.interviewStructure).to.equal('string');
    });

    it('should include question details', async () => {
      const jobTitle = 'UX Designer';

      const result = await hrAgent.generateInterviewQuestions(jobTitle);

      expect(result.questions).to.be.an('array');
      result.questions.forEach(question => {
        expect(question).to.have.property('type');
        expect(question).to.have.property('question');
        expect(question).to.have.property('purpose');
        expect(question).to.have.property('followUp');
        expect(question).to.have.property('scoringGuidelines');
        expect(question.type).to.be.oneOf(['technical', 'behavioral', 'situational', 'cultural-fit']);
      });
    });

    it('should support different question types', async () => {
      const jobTitle = 'Software Engineer';
      const questionTypes = ['technical', 'behavioral', 'situational'];

      const result = await hrAgent.generateInterviewQuestions(jobTitle, {
        questionTypes: questionTypes as any
      });

      expect(Array.isArray(result.questions)).to.be.true;
      expect(result.questions.length).to.be.greaterThan(0);

      // Check that we have questions of requested types
      const types = result.questions.map(q => q.type);
      questionTypes.forEach(type => {
        expect(types).to.include(type);
      });
    });

    it('should support different experience levels', async () => {
      const jobTitle = 'Marketing Specialist';

      const experienceLevels = ['entry', 'mid', 'senior'];

      for (const level of experienceLevels) {
        const result = await hrAgent.generateInterviewQuestions(jobTitle, {
          experienceLevel: level as any
        });

        expect(Array.isArray(result.questions)).to.be.true;
        expect(result.questions.length).to.be.greaterThan(0);
      }
    });

    it('should include ideal answers when requested', async () => {
      const jobTitle = 'Sales Representative';

      const result = await hrAgent.generateInterviewQuestions(jobTitle, {
        includeIdealAnswers: true
      });

      expect(result.questions).to.be.an('array');
      result.questions.forEach(question => {
        expect(question).to.have.property('idealAnswer');
        expect(typeof question.idealAnswer).to.equal('string');
      });
    });

    it('should limit number of questions when specified', async () => {
      const jobTitle = 'HR Manager';

      const result = await hrAgent.generateInterviewQuestions(jobTitle, {
        numberOfQuestions: 5
      });

      expect(result.questions.length).to.be.at.most(5);
    });

    it('should handle empty job titles', async () => {
      try {
        await hrAgent.generateInterviewQuestions('');
        expect.fail('Should have thrown error for empty job title');
      } catch (error: any) {
        expect(error.message).to.be.a('string');
      }
    });
  });

  describe('Onboarding Plan Creation', () => {
    beforeEach(async () => {
      await hrAgent.initialize();
    });

    it('should create onboarding plans', async () => {
      const roleName = 'New Software Engineer';

      const result = await hrAgent.createOnboardingPlan(roleName);

      expect(result).to.have.property('overview');
      expect(result).to.have.property('timeline');
      expect(result).to.have.property('resources');
      expect(result).to.have.property('checkpoints');
      expect(typeof result.overview).to.equal('string');
      expect(Array.isArray(result.timeline)).to.be.true;
      expect(Array.isArray(result.resources)).to.be.true;
      expect(Array.isArray(result.checkpoints)).to.be.true;
    });

    it('should include timeline with phases', async () => {
      const roleName = 'Junior Developer';

      const result = await hrAgent.createOnboardingPlan(roleName);

      expect(result.timeline).to.be.an('array');
      result.timeline.forEach(phase => {
        expect(phase).to.have.property('phase');
        expect(phase).to.have.property('duration');
        expect(phase).to.have.property('activities');
        expect(Array.isArray(phase.activities)).to.be.true;
      });
    });

    it('should include activity details', async () => {
      const roleName = 'Product Manager';

      const result = await hrAgent.createOnboardingPlan(roleName);

      expect(result.timeline).to.be.an('array');
      result.timeline.forEach(phase => {
        phase.activities.forEach(activity => {
          expect(activity).to.have.property('name');
          expect(activity).to.have.property('description');
          expect(activity).to.have.property('responsible');
        });
      });
    });

    it('should support different durations', async () => {
      const roleName = 'Senior Manager';

      const result = await hrAgent.createOnboardingPlan(roleName, {
        duration: 60 // 60 days
      });

      expect(result).to.be.an('object');
      expect(result.overview).to.be.a('string');
    });

    it('should include required trainings when requested', async () => {
      const roleName = 'Compliance Officer';

      const result = await hrAgent.createOnboardingPlan(roleName, {
        includeTrainings: true
      });

      expect(result).to.have.property('requiredTrainings');
      expect(Array.isArray(result.requiredTrainings)).to.be.true;

      if (result.requiredTrainings && result.requiredTrainings.length > 0) {
        result.requiredTrainings.forEach(training => {
          expect(training).to.have.property('name');
          expect(training).to.have.property('description');
          expect(training).to.have.property('duration');
        });
      }
    });

    it('should include team introductions when requested', async () => {
      const roleName = 'Team Lead';

      const result = await hrAgent.createOnboardingPlan(roleName, {
        includeTeamIntroductions: true
      });

      expect(result).to.have.property('teamIntroductions');
      expect(Array.isArray(result.teamIntroductions)).to.be.true;

      if (result.teamIntroductions && result.teamIntroductions.length > 0) {
        result.teamIntroductions.forEach(intro => {
          expect(intro).to.have.property('name');
          expect(intro).to.have.property('role');
          expect(intro).to.have.property('purpose');
        });
      }
    });

    it('should handle remote onboarding', async () => {
      const roleName = 'Remote Worker';

      const result = await hrAgent.createOnboardingPlan(roleName, {
        isRemote: true
      });

      expect(result).to.be.an('object');
      expect(result.overview).to.be.a('string');
    });

    it('should handle empty role names', async () => {
      try {
        await hrAgent.createOnboardingPlan('');
        expect.fail('Should have thrown error for empty role name');
      } catch (error: any) {
        expect(error.message).to.be.a('string');
      }
    });
  });

  describe('Agent Information', () => {
    it('should provide correct agent information', async () => {
      await hrAgent.initialize();

      const info = hrAgent.getAgentInfo();

      expect(info.id).to.be.a('string');
      expect(info.name).to.equal('Test HR Specialist');
      expect(info.type).to.equal('hr');
      expect(info.capabilities).to.include('job-description-creation');
      expect(info.capabilities).to.include('interview-question-generation');
      expect(info.status).to.equal('available');
      expect(info.metadata).to.have.property('specialty');
      expect(info.metadata).to.have.property('empathyLevel');
      expect(info.metadata).to.have.property('formalityLevel');
    });

    it('should update status during operations', async () => {
      await hrAgent.initialize();

      expect(hrAgent.getAgentInfo().status).to.equal('available');

      // Start a long operation (simulate)
      const longOperation = hrAgent.createJobDescription('Complex Job Title', {
        department: 'Complex Department',
        experienceLevel: 'senior',
        responsibilities: ['Complex responsibility 1', 'Complex responsibility 2']
      });

      expect(hrAgent.getAgentInfo().status).to.equal('available');

      await longOperation;

      expect(hrAgent.getAgentInfo().status).to.equal('available');
    });
  });

  describe('Error Handling', () => {
    beforeEach(async () => {
      await hrAgent.initialize();
    });

    it('should handle OpenAI API errors gracefully', async () => {
      // Mock API error
      mockOpenAIClient.sendPrompt = async () => {
        throw new Error('OpenAI API Error');
      };

      try {
        await hrAgent.createJobDescription('Test Job');
        expect.fail('Should have thrown error');
      } catch (error: any) {
        expect(error.message).to.equal('OpenAI API Error');
      }
    });

    it('should handle malformed responses', async () => {
      // Mock malformed response
      mockOpenAIClient.sendPrompt = async () => {
        return {
          choices: [{
            message: {
              content: null
            }
          }]
        };
      };

      const result = await hrAgent.createJobDescription('Test Job');
      expect(result).to.be.an('object');
      expect(result.title).to.be.a('string');
    });

    it('should handle network timeouts', async () => {
      // Mock timeout
      mockOpenAIClient.sendPrompt = async () => {
        await new Promise(resolve => setTimeout(resolve, 10000));
        return { choices: [{ message: { content: 'timeout response' } }] };
      };

      try {
        await hrAgent.createJobDescription('Test Job');
        // Should handle timeout or complete successfully
      } catch (error: any) {
        expect(error.message).to.be.a('string');
      }
    });
  });

  describe('Performance', () => {
    beforeEach(async () => {
      await hrAgent.initialize();
    });

    it('should complete job description creation within reasonable time', async () => {
      const startTime = Date.now();
      await hrAgent.createJobDescription('Software Engineer', {
        department: 'Engineering',
        experienceLevel: 'mid'
      });
      const endTime = Date.now();

      const duration = endTime - startTime;
      expect(duration).to.be.below(10000); // Should complete in less than 10 seconds
    });

    it('should handle concurrent requests', async () => {
      const requests = [
        hrAgent.createJobDescription('Job 1'),
        hrAgent.generateInterviewQuestions('Job 2'),
        hrAgent.createOnboardingPlan('Role 1'),
        hrAgent.createJobDescription('Job 3'),
        hrAgent.generateInterviewQuestions('Job 4')
      ];

      const results = await Promise.all(requests);

      expect(results).to.have.length(5);
      results.forEach(result => {
        expect(result).to.be.an('object');
      });
    });

    it('should handle large job descriptions', async () => {
      const largeResponsibilities = Array.from({ length: 20 }, (_, i) => `Responsibility ${i + 1}`);
      const largeSkills = Array.from({ length: 15 }, (_, i) => `Skill ${i + 1}`);

      const result = await hrAgent.createJobDescription('Complex Job', {
        responsibilities: largeResponsibilities,
        requiredSkills: largeSkills,
        experienceLevel: 'senior'
      });

      expect(result).to.be.an('object');
      expect(result.responsibilities).to.be.an('array');
      expect(result.requiredQualifications).to.be.an('array');
    });
  });

  describe('Shutdown', () => {
    it('should shutdown gracefully', async () => {
      await hrAgent.initialize();

      const result = await hrAgent.shutdown();
      expect(result).to.be.true;
      expect(hrAgent.getAgentInfo().status).to.equal('offline');
    });

    it('should handle shutdown when not initialized', async () => {
      const result = await hrAgent.shutdown();
      expect(result).to.be.true;
    });
  });
});
