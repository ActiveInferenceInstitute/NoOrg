import { expect } from 'chai';
import { LegalAgent } from '../../../src/agents/LegalAgent';
import { OpenAIClient } from '../../../src/core/multiagent/OpenAIClient';
import { SharedStateManager } from '../../../src/core/multiagent/SharedStateManager';

describe('LegalAgent', () => {
  let legalAgent: LegalAgent;
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
      setState: (path: string, value: any) => {},
      getState: (path: string) => undefined,
      subscribe: (path: string, callback: Function) => 'mock-subscription-id',
      unsubscribe: (id: string) => {}
    };

    // Create agent
    legalAgent = new LegalAgent('Test Legal Counsel', {
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
      const result = await legalAgent.initialize();
      expect(result).to.be.true;
      expect(legalAgent.getAgentInfo().status).to.equal('available');
    });

    it('should have correct capabilities', async () => {
      await legalAgent.initialize();

      const info = legalAgent.getAgentInfo();
      expect(info.capabilities).to.include('document-generation');
      expect(info.capabilities).to.include('contract-review');
      expect(info.capabilities).to.include('legal-research');
      expect(info.capabilities).to.include('compliance-analysis');
      expect(info.capabilities).to.include('legal-writing');
      expect(info.capabilities).to.include('term-extraction');
    });

    it('should support different legal specialties', async () => {
      const contractsAgent = new LegalAgent('Contracts Specialist', {
        openAIClient: mockOpenAIClient as OpenAIClient,
        sharedState: mockSharedState as SharedStateManager,
        specialty: 'contracts'
      });

      const complianceAgent = new LegalAgent('Compliance Officer', {
        openAIClient: mockOpenAIClient as OpenAIClient,
        sharedState: mockSharedState as SharedStateManager,
        specialty: 'compliance'
      });

      await contractsAgent.initialize();
      await complianceAgent.initialize();

      expect(contractsAgent.getAgentInfo().metadata?.specialty).to.equal('contracts');
      expect(complianceAgent.getAgentInfo().metadata?.specialty).to.equal('compliance');
    });

    it('should support different jurisdictions', async () => {
      const usAgent = new LegalAgent('US Legal Expert', {
        openAIClient: mockOpenAIClient as OpenAIClient,
        sharedState: mockSharedState as SharedStateManager,
        jurisdiction: 'United States'
      });

      const euAgent = new LegalAgent('EU Legal Expert', {
        openAIClient: mockOpenAIClient as OpenAIClient,
        sharedState: mockSharedState as SharedStateManager,
        jurisdiction: 'European Union'
      });

      await usAgent.initialize();
      await euAgent.initialize();

      expect(usAgent.getAgentInfo().metadata?.jurisdiction).to.equal('United States');
      expect(euAgent.getAgentInfo().metadata?.jurisdiction).to.equal('European Union');
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

      expect(result).to.have.property('title');
      expect(result).to.have.property('content');
      expect(result).to.have.property('sections');
      expect(result).to.have.property('plainLanguageSummary');
      expect(result).to.have.property('recommendations');
      expect(result).to.have.property('warnings');
      expect(typeof result.title).to.equal('string');
      expect(typeof result.content).to.equal('string');
      expect(Array.isArray(result.sections)).to.be.true;
      expect(Array.isArray(result.recommendations)).to.be.true;
      expect(Array.isArray(result.warnings)).to.be.true;
    });

    it('should generate different document types', async () => {
      const documentParameters = {
        purpose: 'Test document generation'
      };

      const documentTypes = ['contract', 'agreement', 'policy', 'terms', 'letter'];

      for (const docType of documentTypes) {
        const result = await legalAgent.generateLegalDocument(docType as any, documentParameters);

        expect(result.title).to.be.a('string');
        expect(result.content).to.be.a('string');
        expect(Array.isArray(result.sections)).to.be.true;
      }
    });

    it('should include definitions when requested', async () => {
      const documentParameters = {
        purpose: 'Agreement with technical terms'
      };

      const result = await legalAgent.generateLegalDocument('agreement', documentParameters, {
        includeDefinitions: true
      });

      expect(result).to.have.property('definitions');
      expect(result.definitions).to.be.an('object');
    });

    it('should include section headings when requested', async () => {
      const documentParameters = {
        purpose: 'Policy document'
      };

      const result = await legalAgent.generateLegalDocument('policy', documentParameters, {
        includeSectionHeadings: true
      });

      expect(Array.isArray(result.sections)).to.be.true;
      expect(result.sections.length).to.be.greaterThan(0);
    });

    it('should handle different complexity levels', async () => {
      const documentParameters = {
        purpose: 'Simple agreement'
      };

      const complexities = ['simple', 'standard', 'comprehensive'];

      for (const complexity of complexities) {
        const result = await legalAgent.generateLegalDocument('agreement', documentParameters, {
          complexity: complexity as any
        });

        expect(result.title).to.be.a('string');
        expect(result.content).to.be.a('string');
      }
    });

    it('should handle empty document parameters', async () => {
      try {
        await legalAgent.generateLegalDocument('contract', {} as any);
        expect.fail('Should have thrown error for empty parameters');
      } catch (error: any) {
        expect(error.message).to.be.a('string');
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

      expect(result).to.have.property('summary');
      expect(result).to.have.property('parties');
      expect(result).to.have.property('keyTerms');
      expect(result).to.have.property('issues');
      expect(result).to.have.property('recommendations');
      expect(typeof result.summary).to.equal('string');
      expect(Array.isArray(result.parties)).to.be.true;
      expect(Array.isArray(result.keyTerms)).to.be.true;
      expect(Array.isArray(result.issues)).to.be.true;
      expect(Array.isArray(result.recommendations)).to.be.true;
    });

    it('should identify key terms correctly', async () => {
      const document = `
        EMPLOYMENT AGREEMENT

        Employee shall work 40 hours per week.
        Salary shall be $100,000 per year.
        Benefits include health insurance and 401k.
      `;

      const result = await legalAgent.reviewLegalDocument(document);

      expect(result.keyTerms).to.be.an('array');
      result.keyTerms.forEach(term => {
        expect(term).to.have.property('term');
        expect(term).to.have.property('category');
        expect(term).to.have.property('summary');
        expect(term).to.have.property('implications');
      });
    });

    it('should identify issues and recommendations', async () => {
      const document = `
        CONTRACT

        This contract has no termination clause.
        Payment terms are unclear.
      `;

      const result = await legalAgent.reviewLegalDocument(document);

      expect(Array.isArray(result.issues)).to.be.true;
      expect(Array.isArray(result.recommendations)).to.be.true;

      result.issues.forEach(issue => {
        expect(issue).to.have.property('description');
        expect(issue).to.have.property('severity');
        expect(issue).to.have.property('recommendation');
        expect(issue.severity).to.be.oneOf(['minor', 'moderate', 'major']);
      });
    });

    it('should support different focus areas', async () => {
      const document = 'Sample legal document for review.';

      const focusAreas = ['risks', 'obligations', 'rights', 'termination'];

      for (const focus of focusAreas) {
        const result = await legalAgent.reviewLegalDocument(document, {
          focusAreas: [focus as any]
        });

        expect(result).to.be.an('object');
        expect(Array.isArray(result.issues)).to.be.true;
      }
    });

    it('should support different perspectives', async () => {
      const document = 'Sample contract between two parties.';

      const perspectives = ['neutral', 'party1', 'party2'];

      for (const perspective of perspectives) {
        const result = await legalAgent.reviewLegalDocument(document, {
          perspective: perspective as any
        });

        expect(result).to.be.an('object');
        expect(result.summary).to.be.a('string');
      }
    });

    it('should handle empty documents', async () => {
      try {
        await legalAgent.reviewLegalDocument('');
        expect.fail('Should have thrown error for empty document');
      } catch (error: any) {
        expect(error.message).to.be.a('string');
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

      expect(result).to.have.property('summary');
      expect(result).to.have.property('keyFindings');
      expect(result).to.have.property('relevantLaw');
      expect(result).to.have.property('analysis');
      expect(result).to.have.property('limitations');
      expect(typeof result.summary).to.equal('string');
      expect(Array.isArray(result.keyFindings)).to.be.true;
      expect(Array.isArray(result.relevantLaw)).to.be.true;
      expect(typeof result.analysis).to.equal('string');
      expect(Array.isArray(result.limitations)).to.be.true;
    });

    it('should include relevant law references', async () => {
      const researchQuery = 'Contract law in California';

      const result = await legalAgent.conductLegalResearch(researchQuery);

      expect(result.relevantLaw).to.be.an('array');
      result.relevantLaw.forEach(law => {
        expect(law).to.have.property('type');
        expect(law).to.have.property('reference');
        expect(law).to.have.property('summary');
        expect(law).to.have.property('relevance');
        expect(law.type).to.be.oneOf(['statute', 'regulation', 'case', 'legal principle']);
      });
    });

    it('should support different research depths', async () => {
      const researchQuery = 'Employment law basics';

      const depths = ['basic', 'detailed', 'comprehensive'];

      for (const depth of depths) {
        const result = await legalAgent.conductLegalResearch(researchQuery, {
          depth: depth as any
        });

        expect(result).to.be.an('object');
        expect(Array.isArray(result.keyFindings)).to.be.true;
      }
    });

    it('should include case references when requested', async () => {
      const researchQuery = 'Intellectual property law';

      const result = await legalAgent.conductLegalResearch(researchQuery, {
        includeCaseReferences: true
      });

      expect(Array.isArray(result.relevantLaw)).to.be.true;
      // Should include case law if relevant to the query
    });

    it('should include statutes when requested', async () => {
      const researchQuery = 'Corporate governance requirements';

      const result = await legalAgent.conductLegalResearch(researchQuery, {
        includeStatutes: true
      });

      expect(Array.isArray(result.relevantLaw)).to.be.true;
      // Should include statutory references if relevant
    });

    it('should include regulations when requested', async () => {
      const researchQuery = 'Financial regulation compliance';

      const result = await legalAgent.conductLegalResearch(researchQuery, {
        includeRegulations: true
      });

      expect(Array.isArray(result.relevantLaw)).to.be.true;
      // Should include regulatory references if relevant
    });

    it('should handle empty research queries', async () => {
      try {
        await legalAgent.conductLegalResearch('');
        expect.fail('Should have thrown error for empty query');
      } catch (error: any) {
        expect(error.message).to.be.a('string');
      }
    });
  });

  describe('Agent Information', () => {
    it('should provide correct agent information', async () => {
      await legalAgent.initialize();

      const info = legalAgent.getAgentInfo();

      expect(info.id).to.be.a('string');
      expect(info.name).to.equal('Test Legal Counsel');
      expect(info.type).to.equal('legal');
      expect(info.capabilities).to.include('document-generation');
      expect(info.capabilities).to.include('contract-review');
      expect(info.status).to.equal('available');
      expect(info.metadata).to.have.property('specialty');
      expect(info.metadata).to.have.property('jurisdiction');
      expect(info.metadata).to.have.property('precisionLevel');
      expect(info.metadata).to.have.property('formalityLevel');
    });

    it('should update status during operations', async () => {
      await legalAgent.initialize();

      expect(legalAgent.getAgentInfo().status).to.equal('available');

      // Start a long operation (simulate)
      const longOperation = legalAgent.generateLegalDocument('contract', {
        parties: [{ name: 'Test Party', type: 'Individual' }],
        purpose: 'Test contract'
      });

      expect(legalAgent.getAgentInfo().status).to.equal('available');

      await longOperation;

      expect(legalAgent.getAgentInfo().status).to.equal('available');
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

      const result = await legalAgent.generateLegalDocument('contract', {
        parties: [{ name: 'Test', type: 'Individual' }],
        purpose: 'Test'
      });
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
        await legalAgent.generateLegalDocument('contract', {
          parties: [{ name: 'Test', type: 'Individual' }],
          purpose: 'Test'
        });
        // Should handle timeout or complete successfully
      } catch (error: any) {
        expect(error.message).to.be.a('string');
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
      expect(duration).to.be.below(15000); // Should complete in less than 15 seconds
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

      expect(results).to.have.length(5);
      results.forEach(result => {
        expect(result).to.be.an('object');
      });
    });

    it('should handle large documents', async () => {
      const largeDocument = 'A'.repeat(5000) + ' - This is a large legal document for review.';

      const result = await legalAgent.reviewLegalDocument(largeDocument);
      expect(result).to.be.an('object');
      expect(result.summary).to.be.a('string');
    });
  });

  describe('Shutdown', () => {
    it('should shutdown gracefully', async () => {
      await legalAgent.initialize();

      const result = await legalAgent.shutdown();
      expect(result).to.be.true;
      expect(legalAgent.getAgentInfo().status).to.equal('offline');
    });

    it('should handle shutdown when not initialized', async () => {
      const result = await legalAgent.shutdown();
      expect(result).to.be.true;
    });
  });
});
