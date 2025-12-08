"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const LegalAgent_1 = require("../../../src/agents/LegalAgent");
describe('LegalAgent', () => {
    let legalAgent;
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
                                content: `Mock legal response for: ${prompt.substring(0, 50)}...`
                            }
                        }],
                    usage: {
                        prompt_tokens: 200,
                        completion_tokens: 400,
                        total_tokens: 600
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
        legalAgent = new LegalAgent_1.LegalAgent('Test Legal Counsel', {
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
            const result = await legalAgent.initialize();
            (0, chai_1.expect)(result).to.be.true;
            (0, chai_1.expect)(legalAgent.getAgentInfo().status).to.equal('available');
        });
        it('should have correct capabilities', async () => {
            await legalAgent.initialize();
            const info = legalAgent.getAgentInfo();
            (0, chai_1.expect)(info.capabilities).to.include('document-generation');
            (0, chai_1.expect)(info.capabilities).to.include('contract-review');
            (0, chai_1.expect)(info.capabilities).to.include('legal-research');
            (0, chai_1.expect)(info.capabilities).to.include('compliance-analysis');
            (0, chai_1.expect)(info.capabilities).to.include('legal-writing');
            (0, chai_1.expect)(info.capabilities).to.include('term-extraction');
        });
        it('should support different legal specialties', async () => {
            const contractsAgent = new LegalAgent_1.LegalAgent('Contracts Specialist', {
                openAIClient: mockOpenAIClient,
                sharedState: mockSharedState,
                specialty: 'contracts'
            });
            const complianceAgent = new LegalAgent_1.LegalAgent('Compliance Officer', {
                openAIClient: mockOpenAIClient,
                sharedState: mockSharedState,
                specialty: 'compliance'
            });
            await contractsAgent.initialize();
            await complianceAgent.initialize();
            (0, chai_1.expect)(contractsAgent.getAgentInfo().metadata?.specialty).to.equal('contracts');
            (0, chai_1.expect)(complianceAgent.getAgentInfo().metadata?.specialty).to.equal('compliance');
        });
        it('should support different jurisdictions', async () => {
            const usAgent = new LegalAgent_1.LegalAgent('US Legal Expert', {
                openAIClient: mockOpenAIClient,
                sharedState: mockSharedState,
                jurisdiction: 'United States'
            });
            const euAgent = new LegalAgent_1.LegalAgent('EU Legal Expert', {
                openAIClient: mockOpenAIClient,
                sharedState: mockSharedState,
                jurisdiction: 'European Union'
            });
            await usAgent.initialize();
            await euAgent.initialize();
            (0, chai_1.expect)(usAgent.getAgentInfo().metadata?.jurisdiction).to.equal('United States');
            (0, chai_1.expect)(euAgent.getAgentInfo().metadata?.jurisdiction).to.equal('European Union');
        });
    });
    describe('Legal Document Generation', () => {
        beforeEach(async () => {
            await legalAgent.initialize();
        });
        it('should generate contracts', async () => {
            const documentParameters = {
                parties: [
                    { name: 'Company A', type: 'Corporation' },
                    { name: 'Company B', type: 'LLC' }
                ],
                purpose: 'Software development agreement',
                jurisdiction: 'California',
                effectiveDate: '2024-01-01',
                termLength: '2 years'
            };
            const result = await legalAgent.generateLegalDocument('contract', documentParameters);
            (0, chai_1.expect)(result).to.have.property('title');
            (0, chai_1.expect)(result).to.have.property('content');
            (0, chai_1.expect)(result).to.have.property('sections');
            (0, chai_1.expect)(result).to.have.property('plainLanguageSummary');
            (0, chai_1.expect)(result).to.have.property('recommendations');
            (0, chai_1.expect)(result).to.have.property('warnings');
            (0, chai_1.expect)(typeof result.title).to.equal('string');
            (0, chai_1.expect)(typeof result.content).to.equal('string');
            (0, chai_1.expect)(Array.isArray(result.sections)).to.be.true;
            (0, chai_1.expect)(Array.isArray(result.recommendations)).to.be.true;
            (0, chai_1.expect)(Array.isArray(result.warnings)).to.be.true;
        });
        it('should generate different document types', async () => {
            const documentParameters = {
                purpose: 'Test document generation'
            };
            const documentTypes = ['contract', 'agreement', 'policy', 'terms', 'letter'];
            for (const docType of documentTypes) {
                const result = await legalAgent.generateLegalDocument(docType, documentParameters);
                (0, chai_1.expect)(result.title).to.be.a('string');
                (0, chai_1.expect)(result.content).to.be.a('string');
                (0, chai_1.expect)(Array.isArray(result.sections)).to.be.true;
            }
        });
        it('should include definitions when requested', async () => {
            const documentParameters = {
                purpose: 'Agreement with technical terms'
            };
            const result = await legalAgent.generateLegalDocument('agreement', documentParameters, {
                includeDefinitions: true
            });
            (0, chai_1.expect)(result).to.have.property('definitions');
            (0, chai_1.expect)(result.definitions).to.be.an('object');
        });
        it('should include section headings when requested', async () => {
            const documentParameters = {
                purpose: 'Policy document'
            };
            const result = await legalAgent.generateLegalDocument('policy', documentParameters, {
                includeSectionHeadings: true
            });
            (0, chai_1.expect)(Array.isArray(result.sections)).to.be.true;
            (0, chai_1.expect)(result.sections.length).to.be.greaterThan(0);
        });
        it('should handle different complexity levels', async () => {
            const documentParameters = {
                purpose: 'Simple agreement'
            };
            const complexities = ['simple', 'standard', 'comprehensive'];
            for (const complexity of complexities) {
                const result = await legalAgent.generateLegalDocument('agreement', documentParameters, {
                    complexity: complexity
                });
                (0, chai_1.expect)(result.title).to.be.a('string');
                (0, chai_1.expect)(result.content).to.be.a('string');
            }
        });
        it('should handle empty document parameters', async () => {
            try {
                await legalAgent.generateLegalDocument('contract', {});
                chai_1.expect.fail('Should have thrown error for empty parameters');
            }
            catch (error) {
                (0, chai_1.expect)(error.message).to.be.a('string');
            }
        });
    });
    describe('Legal Document Review', () => {
        beforeEach(async () => {
            await legalAgent.initialize();
        });
        it('should review legal documents', async () => {
            const document = `
        THIS AGREEMENT is made on January 1, 2024 between Party A and Party B.

        1. TERM: This agreement shall be effective for 2 years.
        2. PAYMENT: Party B shall pay Party A $10,000.
        3. TERMINATION: Either party may terminate with 30 days notice.
      `;
            const result = await legalAgent.reviewLegalDocument(document);
            (0, chai_1.expect)(result).to.have.property('summary');
            (0, chai_1.expect)(result).to.have.property('parties');
            (0, chai_1.expect)(result).to.have.property('keyTerms');
            (0, chai_1.expect)(result).to.have.property('issues');
            (0, chai_1.expect)(result).to.have.property('recommendations');
            (0, chai_1.expect)(typeof result.summary).to.equal('string');
            (0, chai_1.expect)(Array.isArray(result.parties)).to.be.true;
            (0, chai_1.expect)(Array.isArray(result.keyTerms)).to.be.true;
            (0, chai_1.expect)(Array.isArray(result.issues)).to.be.true;
            (0, chai_1.expect)(Array.isArray(result.recommendations)).to.be.true;
        });
        it('should identify key terms correctly', async () => {
            const document = `
        EMPLOYMENT AGREEMENT

        Employee shall work 40 hours per week.
        Salary shall be $100,000 per year.
        Benefits include health insurance and 401k.
      `;
            const result = await legalAgent.reviewLegalDocument(document);
            (0, chai_1.expect)(result.keyTerms).to.be.an('array');
            result.keyTerms.forEach(term => {
                (0, chai_1.expect)(term).to.have.property('term');
                (0, chai_1.expect)(term).to.have.property('category');
                (0, chai_1.expect)(term).to.have.property('summary');
                (0, chai_1.expect)(term).to.have.property('implications');
            });
        });
        it('should identify issues and recommendations', async () => {
            const document = `
        CONTRACT

        This contract has no termination clause.
        Payment terms are unclear.
      `;
            const result = await legalAgent.reviewLegalDocument(document);
            (0, chai_1.expect)(Array.isArray(result.issues)).to.be.true;
            (0, chai_1.expect)(Array.isArray(result.recommendations)).to.be.true;
            result.issues.forEach(issue => {
                (0, chai_1.expect)(issue).to.have.property('description');
                (0, chai_1.expect)(issue).to.have.property('severity');
                (0, chai_1.expect)(issue).to.have.property('recommendation');
                (0, chai_1.expect)(issue.severity).to.be.oneOf(['minor', 'moderate', 'major']);
            });
        });
        it('should support different focus areas', async () => {
            const document = 'Sample legal document for review.';
            const focusAreas = ['risks', 'obligations', 'rights', 'termination'];
            for (const focus of focusAreas) {
                const result = await legalAgent.reviewLegalDocument(document, {
                    focusAreas: [focus]
                });
                (0, chai_1.expect)(result).to.be.an('object');
                (0, chai_1.expect)(Array.isArray(result.issues)).to.be.true;
            }
        });
        it('should support different perspectives', async () => {
            const document = 'Sample contract between two parties.';
            const perspectives = ['neutral', 'party1', 'party2'];
            for (const perspective of perspectives) {
                const result = await legalAgent.reviewLegalDocument(document, {
                    perspective: perspective
                });
                (0, chai_1.expect)(result).to.be.an('object');
                (0, chai_1.expect)(result.summary).to.be.a('string');
            }
        });
        it('should handle empty documents', async () => {
            try {
                await legalAgent.reviewLegalDocument('');
                chai_1.expect.fail('Should have thrown error for empty document');
            }
            catch (error) {
                (0, chai_1.expect)(error.message).to.be.a('string');
            }
        });
    });
    describe('Legal Research', () => {
        beforeEach(async () => {
            await legalAgent.initialize();
        });
        it('should conduct legal research', async () => {
            const researchQuery = 'What are the requirements for data privacy compliance in the EU?';
            const result = await legalAgent.conductLegalResearch(researchQuery);
            (0, chai_1.expect)(result).to.have.property('summary');
            (0, chai_1.expect)(result).to.have.property('keyFindings');
            (0, chai_1.expect)(result).to.have.property('relevantLaw');
            (0, chai_1.expect)(result).to.have.property('analysis');
            (0, chai_1.expect)(result).to.have.property('limitations');
            (0, chai_1.expect)(typeof result.summary).to.equal('string');
            (0, chai_1.expect)(Array.isArray(result.keyFindings)).to.be.true;
            (0, chai_1.expect)(Array.isArray(result.relevantLaw)).to.be.true;
            (0, chai_1.expect)(typeof result.analysis).to.equal('string');
            (0, chai_1.expect)(Array.isArray(result.limitations)).to.be.true;
        });
        it('should include relevant law references', async () => {
            const researchQuery = 'Contract law in California';
            const result = await legalAgent.conductLegalResearch(researchQuery);
            (0, chai_1.expect)(result.relevantLaw).to.be.an('array');
            result.relevantLaw.forEach(law => {
                (0, chai_1.expect)(law).to.have.property('type');
                (0, chai_1.expect)(law).to.have.property('reference');
                (0, chai_1.expect)(law).to.have.property('summary');
                (0, chai_1.expect)(law).to.have.property('relevance');
                (0, chai_1.expect)(law.type).to.be.oneOf(['statute', 'regulation', 'case', 'legal principle']);
            });
        });
        it('should support different research depths', async () => {
            const researchQuery = 'Employment law basics';
            const depths = ['basic', 'detailed', 'comprehensive'];
            for (const depth of depths) {
                const result = await legalAgent.conductLegalResearch(researchQuery, {
                    depth: depth
                });
                (0, chai_1.expect)(result).to.be.an('object');
                (0, chai_1.expect)(Array.isArray(result.keyFindings)).to.be.true;
            }
        });
        it('should include case references when requested', async () => {
            const researchQuery = 'Intellectual property law';
            const result = await legalAgent.conductLegalResearch(researchQuery, {
                includeCaseReferences: true
            });
            (0, chai_1.expect)(Array.isArray(result.relevantLaw)).to.be.true;
            // Should include case law if relevant to the query
        });
        it('should include statutes when requested', async () => {
            const researchQuery = 'Corporate governance requirements';
            const result = await legalAgent.conductLegalResearch(researchQuery, {
                includeStatutes: true
            });
            (0, chai_1.expect)(Array.isArray(result.relevantLaw)).to.be.true;
            // Should include statutory references if relevant
        });
        it('should include regulations when requested', async () => {
            const researchQuery = 'Financial regulation compliance';
            const result = await legalAgent.conductLegalResearch(researchQuery, {
                includeRegulations: true
            });
            (0, chai_1.expect)(Array.isArray(result.relevantLaw)).to.be.true;
            // Should include regulatory references if relevant
        });
        it('should handle empty research queries', async () => {
            try {
                await legalAgent.conductLegalResearch('');
                chai_1.expect.fail('Should have thrown error for empty query');
            }
            catch (error) {
                (0, chai_1.expect)(error.message).to.be.a('string');
            }
        });
    });
    describe('Agent Information', () => {
        it('should provide correct agent information', async () => {
            await legalAgent.initialize();
            const info = legalAgent.getAgentInfo();
            (0, chai_1.expect)(info.id).to.be.a('string');
            (0, chai_1.expect)(info.name).to.equal('Test Legal Counsel');
            (0, chai_1.expect)(info.type).to.equal('legal');
            (0, chai_1.expect)(info.capabilities).to.include('document-generation');
            (0, chai_1.expect)(info.capabilities).to.include('contract-review');
            (0, chai_1.expect)(info.status).to.equal('available');
            (0, chai_1.expect)(info.metadata).to.have.property('specialty');
            (0, chai_1.expect)(info.metadata).to.have.property('jurisdiction');
            (0, chai_1.expect)(info.metadata).to.have.property('precisionLevel');
            (0, chai_1.expect)(info.metadata).to.have.property('formalityLevel');
        });
        it('should update status during operations', async () => {
            await legalAgent.initialize();
            (0, chai_1.expect)(legalAgent.getAgentInfo().status).to.equal('available');
            // Start a long operation (simulate)
            const longOperation = legalAgent.generateLegalDocument('contract', {
                parties: [{ name: 'Test Party', type: 'Individual' }],
                purpose: 'Test contract'
            });
            (0, chai_1.expect)(legalAgent.getAgentInfo().status).to.equal('available');
            await longOperation;
            (0, chai_1.expect)(legalAgent.getAgentInfo().status).to.equal('available');
        });
    });
    describe('Error Handling', () => {
        beforeEach(async () => {
            await legalAgent.initialize();
        });
        it('should handle OpenAI API errors gracefully', async () => {
            // Mock API error
            mockOpenAIClient.sendPrompt = async () => {
                throw new Error('OpenAI API Error');
            };
            try {
                await legalAgent.generateLegalDocument('contract', {
                    parties: [{ name: 'Test', type: 'Individual' }],
                    purpose: 'Test'
                });
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
            const result = await legalAgent.generateLegalDocument('contract', {
                parties: [{ name: 'Test', type: 'Individual' }],
                purpose: 'Test'
            });
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
                await legalAgent.generateLegalDocument('contract', {
                    parties: [{ name: 'Test', type: 'Individual' }],
                    purpose: 'Test'
                });
                // Should handle timeout or complete successfully
            }
            catch (error) {
                (0, chai_1.expect)(error.message).to.be.a('string');
            }
        });
    });
    describe('Performance', () => {
        beforeEach(async () => {
            await legalAgent.initialize();
        });
        it('should complete document generation within reasonable time', async () => {
            const startTime = Date.now();
            await legalAgent.generateLegalDocument('contract', {
                parties: [
                    { name: 'Party A', type: 'Corporation' },
                    { name: 'Party B', type: 'LLC' }
                ],
                purpose: 'Software license agreement'
            });
            const endTime = Date.now();
            const duration = endTime - startTime;
            (0, chai_1.expect)(duration).to.be.below(15000); // Should complete in less than 15 seconds
        });
        it('should handle concurrent requests', async () => {
            const requests = [
                legalAgent.generateLegalDocument('contract', { purpose: 'Contract 1' }),
                legalAgent.reviewLegalDocument('Sample contract document'),
                legalAgent.conductLegalResearch('Legal research query 1'),
                legalAgent.generateLegalDocument('policy', { purpose: 'Policy 1' }),
                legalAgent.reviewLegalDocument('Another contract document')
            ];
            const results = await Promise.all(requests);
            (0, chai_1.expect)(results).to.have.length(5);
            results.forEach(result => {
                (0, chai_1.expect)(result).to.be.an('object');
            });
        });
        it('should handle large documents', async () => {
            const largeDocument = 'A'.repeat(5000) + ' - This is a large legal document for review.';
            const result = await legalAgent.reviewLegalDocument(largeDocument);
            (0, chai_1.expect)(result).to.be.an('object');
            (0, chai_1.expect)(result.summary).to.be.a('string');
        });
    });
    describe('Shutdown', () => {
        it('should shutdown gracefully', async () => {
            await legalAgent.initialize();
            const result = await legalAgent.shutdown();
            (0, chai_1.expect)(result).to.be.true;
            (0, chai_1.expect)(legalAgent.getAgentInfo().status).to.equal('offline');
        });
        it('should handle shutdown when not initialized', async () => {
            const result = await legalAgent.shutdown();
            (0, chai_1.expect)(result).to.be.true;
        });
    });
});
//# sourceMappingURL=test_legal_agent.js.map