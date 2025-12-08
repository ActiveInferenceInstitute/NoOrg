"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const HRAgent_1 = require("../../../src/agents/HRAgent");
describe('HRAgent', () => {
    let hrAgent;
    let mockOpenAIClient;
    let mockSharedState;
    let originalConsoleLog;
    beforeEach(() => {
        // Mock OpenAI client
        mockOpenAIClient = {
            sendPrompt: async (prompt, options) => {
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
            setState: (path, value) => { },
            getState: (path) => undefined,
            subscribe: (path, callback) => 'mock-subscription-id',
            unsubscribe: (id) => { }
        };
        // Create agent
        hrAgent = new HRAgent_1.HRAgent('Test HR Specialist', {
            openAIClient: mockOpenAIClient,
            sharedState: mockSharedState,
            preferredModel: 'gpt-4o',
            cacheTTL: 0 // Disable caching for testing
        });
        // Suppress console output during tests
        originalConsoleLog = console.log;
        console.log = () => { };
    });
    afterEach(() => {
        // Restore console.log
        console.log = originalConsoleLog;
    });
    describe('Initialization', () => {
        it('should initialize successfully', async () => {
            const result = await hrAgent.initialize();
            (0, chai_1.expect)(result).to.be.true;
            (0, chai_1.expect)(hrAgent.getAgentInfo().status).to.equal('available');
        });
        it('should have correct capabilities', async () => {
            await hrAgent.initialize();
            const info = hrAgent.getAgentInfo();
            (0, chai_1.expect)(info.capabilities).to.include('job-description-creation');
            (0, chai_1.expect)(info.capabilities).to.include('interview-question-generation');
            (0, chai_1.expect)(info.capabilities).to.include('employee-onboarding');
            (0, chai_1.expect)(info.capabilities).to.include('policy-development');
            (0, chai_1.expect)(info.capabilities).to.include('performance-evaluation');
            (0, chai_1.expect)(info.capabilities).to.include('compensation-analysis');
            (0, chai_1.expect)(info.capabilities).to.include('professional-communication');
        });
        it('should support different HR specialties', async () => {
            const recruitmentAgent = new HRAgent_1.HRAgent('Recruitment Specialist', {
                openAIClient: mockOpenAIClient,
                sharedState: mockSharedState,
                specialty: 'recruitment'
            });
            const complianceAgent = new HRAgent_1.HRAgent('Compliance Officer', {
                openAIClient: mockOpenAIClient,
                sharedState: mockSharedState,
                specialty: 'compliance'
            });
            await recruitmentAgent.initialize();
            await complianceAgent.initialize();
            (0, chai_1.expect)(recruitmentAgent.getAgentInfo().metadata?.specialty).to.equal('recruitment');
            (0, chai_1.expect)(complianceAgent.getAgentInfo().metadata?.specialty).to.equal('compliance');
        });
    });
    describe('Job Description Creation', () => {
        beforeEach(async () => {
            await hrAgent.initialize();
        });
        it('should create comprehensive job descriptions', async () => {
            const jobTitle = 'Senior Software Engineer';
            const result = await hrAgent.createJobDescription(jobTitle);
            (0, chai_1.expect)(result).to.have.property('title');
            (0, chai_1.expect)(result).to.have.property('summary');
            (0, chai_1.expect)(result).to.have.property('responsibilities');
            (0, chai_1.expect)(result).to.have.property('requiredQualifications');
            (0, chai_1.expect)(result).to.have.property('preferredQualifications');
            (0, chai_1.expect)(result).to.have.property('processingTime');
            (0, chai_1.expect)(result.title).to.equal(jobTitle);
            (0, chai_1.expect)(typeof result.summary).to.equal('string');
            (0, chai_1.expect)(Array.isArray(result.responsibilities)).to.be.true;
            (0, chai_1.expect)(Array.isArray(result.requiredQualifications)).to.be.true;
            (0, chai_1.expect)(Array.isArray(result.preferredQualifications)).to.be.true;
        });
        it('should include department information', async () => {
            const jobTitle = 'Marketing Manager';
            const department = 'Marketing';
            const result = await hrAgent.createJobDescription(jobTitle, {
                department
            });
            (0, chai_1.expect)(result.title).to.equal(jobTitle);
            (0, chai_1.expect)(result.summary).to.be.a('string');
            (0, chai_1.expect)(result.summary.length).to.be.greaterThan(0);
        });
        it('should handle different experience levels', async () => {
            const jobTitle = 'Data Analyst';
            const experienceLevels = ['entry', 'mid', 'senior', 'executive'];
            for (const level of experienceLevels) {
                const result = await hrAgent.createJobDescription(jobTitle, {
                    experienceLevel: level
                });
                (0, chai_1.expect)(result.title).to.equal(jobTitle);
                (0, chai_1.expect)(Array.isArray(result.responsibilities)).to.be.true;
                (0, chai_1.expect)(Array.isArray(result.requiredQualifications)).to.be.true;
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
            (0, chai_1.expect)(result.responsibilities).to.be.an('array');
            (0, chai_1.expect)(result.responsibilities.length).to.be.greaterThan(0);
        });
        it('should include required skills when provided', async () => {
            const jobTitle = 'Full Stack Developer';
            const requiredSkills = ['JavaScript', 'React', 'Node.js', 'SQL'];
            const result = await hrAgent.createJobDescription(jobTitle, {
                requiredSkills
            });
            (0, chai_1.expect)(Array.isArray(result.requiredQualifications)).to.be.true;
            (0, chai_1.expect)(result.requiredQualifications.length).to.be.greaterThan(0);
        });
        it('should include preferred skills when provided', async () => {
            const jobTitle = 'DevOps Engineer';
            const preferredSkills = ['Docker', 'Kubernetes', 'AWS'];
            const result = await hrAgent.createJobDescription(jobTitle, {
                preferredSkills
            });
            (0, chai_1.expect)(Array.isArray(result.preferredQualifications)).to.be.true;
            (0, chai_1.expect)(result.preferredQualifications.length).to.be.greaterThan(0);
        });
        it('should include location and remote options', async () => {
            const jobTitle = 'Remote Developer';
            const result = await hrAgent.createJobDescription(jobTitle, {
                location: 'San Francisco, CA',
                remoteOption: true
            });
            (0, chai_1.expect)(result.title).to.equal(jobTitle);
            (0, chai_1.expect)(result.summary).to.be.a('string');
        });
        it('should handle empty job titles', async () => {
            try {
                await hrAgent.createJobDescription('');
                chai_1.expect.fail('Should have thrown error for empty job title');
            }
            catch (error) {
                (0, chai_1.expect)(error.message).to.be.a('string');
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
            (0, chai_1.expect)(result).to.have.property('questions');
            (0, chai_1.expect)(result).to.have.property('interviewStructure');
            (0, chai_1.expect)(result).to.have.property('processingTime');
            (0, chai_1.expect)(Array.isArray(result.questions)).to.be.true;
            (0, chai_1.expect)(result.questions.length).to.be.greaterThan(0);
            (0, chai_1.expect)(typeof result.interviewStructure).to.equal('string');
        });
        it('should include question details', async () => {
            const jobTitle = 'UX Designer';
            const result = await hrAgent.generateInterviewQuestions(jobTitle);
            (0, chai_1.expect)(result.questions).to.be.an('array');
            result.questions.forEach(question => {
                (0, chai_1.expect)(question).to.have.property('type');
                (0, chai_1.expect)(question).to.have.property('question');
                (0, chai_1.expect)(question).to.have.property('purpose');
                (0, chai_1.expect)(question).to.have.property('followUp');
                (0, chai_1.expect)(question).to.have.property('scoringGuidelines');
                (0, chai_1.expect)(question.type).to.be.oneOf(['technical', 'behavioral', 'situational', 'cultural-fit']);
            });
        });
        it('should support different question types', async () => {
            const jobTitle = 'Software Engineer';
            const questionTypes = ['technical', 'behavioral', 'situational'];
            const result = await hrAgent.generateInterviewQuestions(jobTitle, {
                questionTypes: questionTypes
            });
            (0, chai_1.expect)(Array.isArray(result.questions)).to.be.true;
            (0, chai_1.expect)(result.questions.length).to.be.greaterThan(0);
            // Check that we have questions of requested types
            const types = result.questions.map(q => q.type);
            questionTypes.forEach(type => {
                (0, chai_1.expect)(types).to.include(type);
            });
        });
        it('should support different experience levels', async () => {
            const jobTitle = 'Marketing Specialist';
            const experienceLevels = ['entry', 'mid', 'senior'];
            for (const level of experienceLevels) {
                const result = await hrAgent.generateInterviewQuestions(jobTitle, {
                    experienceLevel: level
                });
                (0, chai_1.expect)(Array.isArray(result.questions)).to.be.true;
                (0, chai_1.expect)(result.questions.length).to.be.greaterThan(0);
            }
        });
        it('should include ideal answers when requested', async () => {
            const jobTitle = 'Sales Representative';
            const result = await hrAgent.generateInterviewQuestions(jobTitle, {
                includeIdealAnswers: true
            });
            (0, chai_1.expect)(result.questions).to.be.an('array');
            result.questions.forEach(question => {
                (0, chai_1.expect)(question).to.have.property('idealAnswer');
                (0, chai_1.expect)(typeof question.idealAnswer).to.equal('string');
            });
        });
        it('should limit number of questions when specified', async () => {
            const jobTitle = 'HR Manager';
            const result = await hrAgent.generateInterviewQuestions(jobTitle, {
                numberOfQuestions: 5
            });
            (0, chai_1.expect)(result.questions.length).to.be.at.most(5);
        });
        it('should handle empty job titles', async () => {
            try {
                await hrAgent.generateInterviewQuestions('');
                chai_1.expect.fail('Should have thrown error for empty job title');
            }
            catch (error) {
                (0, chai_1.expect)(error.message).to.be.a('string');
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
            (0, chai_1.expect)(result).to.have.property('overview');
            (0, chai_1.expect)(result).to.have.property('timeline');
            (0, chai_1.expect)(result).to.have.property('resources');
            (0, chai_1.expect)(result).to.have.property('checkpoints');
            (0, chai_1.expect)(typeof result.overview).to.equal('string');
            (0, chai_1.expect)(Array.isArray(result.timeline)).to.be.true;
            (0, chai_1.expect)(Array.isArray(result.resources)).to.be.true;
            (0, chai_1.expect)(Array.isArray(result.checkpoints)).to.be.true;
        });
        it('should include timeline with phases', async () => {
            const roleName = 'Junior Developer';
            const result = await hrAgent.createOnboardingPlan(roleName);
            (0, chai_1.expect)(result.timeline).to.be.an('array');
            result.timeline.forEach(phase => {
                (0, chai_1.expect)(phase).to.have.property('phase');
                (0, chai_1.expect)(phase).to.have.property('duration');
                (0, chai_1.expect)(phase).to.have.property('activities');
                (0, chai_1.expect)(Array.isArray(phase.activities)).to.be.true;
            });
        });
        it('should include activity details', async () => {
            const roleName = 'Product Manager';
            const result = await hrAgent.createOnboardingPlan(roleName);
            (0, chai_1.expect)(result.timeline).to.be.an('array');
            result.timeline.forEach(phase => {
                phase.activities.forEach(activity => {
                    (0, chai_1.expect)(activity).to.have.property('name');
                    (0, chai_1.expect)(activity).to.have.property('description');
                    (0, chai_1.expect)(activity).to.have.property('responsible');
                });
            });
        });
        it('should support different durations', async () => {
            const roleName = 'Senior Manager';
            const result = await hrAgent.createOnboardingPlan(roleName, {
                duration: 60 // 60 days
            });
            (0, chai_1.expect)(result).to.be.an('object');
            (0, chai_1.expect)(result.overview).to.be.a('string');
        });
        it('should include required trainings when requested', async () => {
            const roleName = 'Compliance Officer';
            const result = await hrAgent.createOnboardingPlan(roleName, {
                includeTrainings: true
            });
            (0, chai_1.expect)(result).to.have.property('requiredTrainings');
            (0, chai_1.expect)(Array.isArray(result.requiredTrainings)).to.be.true;
            if (result.requiredTrainings && result.requiredTrainings.length > 0) {
                result.requiredTrainings.forEach(training => {
                    (0, chai_1.expect)(training).to.have.property('name');
                    (0, chai_1.expect)(training).to.have.property('description');
                    (0, chai_1.expect)(training).to.have.property('duration');
                });
            }
        });
        it('should include team introductions when requested', async () => {
            const roleName = 'Team Lead';
            const result = await hrAgent.createOnboardingPlan(roleName, {
                includeTeamIntroductions: true
            });
            (0, chai_1.expect)(result).to.have.property('teamIntroductions');
            (0, chai_1.expect)(Array.isArray(result.teamIntroductions)).to.be.true;
            if (result.teamIntroductions && result.teamIntroductions.length > 0) {
                result.teamIntroductions.forEach(intro => {
                    (0, chai_1.expect)(intro).to.have.property('name');
                    (0, chai_1.expect)(intro).to.have.property('role');
                    (0, chai_1.expect)(intro).to.have.property('purpose');
                });
            }
        });
        it('should handle remote onboarding', async () => {
            const roleName = 'Remote Worker';
            const result = await hrAgent.createOnboardingPlan(roleName, {
                isRemote: true
            });
            (0, chai_1.expect)(result).to.be.an('object');
            (0, chai_1.expect)(result.overview).to.be.a('string');
        });
        it('should handle empty role names', async () => {
            try {
                await hrAgent.createOnboardingPlan('');
                chai_1.expect.fail('Should have thrown error for empty role name');
            }
            catch (error) {
                (0, chai_1.expect)(error.message).to.be.a('string');
            }
        });
    });
    describe('Agent Information', () => {
        it('should provide correct agent information', async () => {
            await hrAgent.initialize();
            const info = hrAgent.getAgentInfo();
            (0, chai_1.expect)(info.id).to.be.a('string');
            (0, chai_1.expect)(info.name).to.equal('Test HR Specialist');
            (0, chai_1.expect)(info.type).to.equal('hr');
            (0, chai_1.expect)(info.capabilities).to.include('job-description-creation');
            (0, chai_1.expect)(info.capabilities).to.include('interview-question-generation');
            (0, chai_1.expect)(info.status).to.equal('available');
            (0, chai_1.expect)(info.metadata).to.have.property('specialty');
            (0, chai_1.expect)(info.metadata).to.have.property('empathyLevel');
            (0, chai_1.expect)(info.metadata).to.have.property('formalityLevel');
        });
        it('should update status during operations', async () => {
            await hrAgent.initialize();
            (0, chai_1.expect)(hrAgent.getAgentInfo().status).to.equal('available');
            // Start a long operation (simulate)
            const longOperation = hrAgent.createJobDescription('Complex Job Title', {
                department: 'Complex Department',
                experienceLevel: 'senior',
                responsibilities: ['Complex responsibility 1', 'Complex responsibility 2']
            });
            (0, chai_1.expect)(hrAgent.getAgentInfo().status).to.equal('available');
            await longOperation;
            (0, chai_1.expect)(hrAgent.getAgentInfo().status).to.equal('available');
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
                chai_1.expect.fail('Should have thrown error');
            }
            catch (error) {
                (0, chai_1.expect)(error.message).to.equal('OpenAI API Error');
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
            (0, chai_1.expect)(result).to.be.an('object');
            (0, chai_1.expect)(result.title).to.be.a('string');
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
            }
            catch (error) {
                (0, chai_1.expect)(error.message).to.be.a('string');
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
            (0, chai_1.expect)(duration).to.be.below(10000); // Should complete in less than 10 seconds
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
            (0, chai_1.expect)(results).to.have.length(5);
            results.forEach(result => {
                (0, chai_1.expect)(result).to.be.an('object');
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
            (0, chai_1.expect)(result).to.be.an('object');
            (0, chai_1.expect)(result.responsibilities).to.be.an('array');
            (0, chai_1.expect)(result.requiredQualifications).to.be.an('array');
        });
    });
    describe('Shutdown', () => {
        it('should shutdown gracefully', async () => {
            await hrAgent.initialize();
            const result = await hrAgent.shutdown();
            (0, chai_1.expect)(result).to.be.true;
            (0, chai_1.expect)(hrAgent.getAgentInfo().status).to.equal('offline');
        });
        it('should handle shutdown when not initialized', async () => {
            const result = await hrAgent.shutdown();
            (0, chai_1.expect)(result).to.be.true;
        });
    });
});
//# sourceMappingURL=test_hr_agent.js.map