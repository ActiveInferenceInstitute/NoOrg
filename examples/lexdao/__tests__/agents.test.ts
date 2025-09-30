/**
 * LexDAO Agent Tests
 *
 * Comprehensive test suite for all agent types in the LexDAO governance workflow.
 * Tests both individual agent functionality and integration scenarios.
 */

import { LLMAgent, BlockchainAgent, DataProcessingAgent, RuleBasedAgent, GovernanceVisualizationAgent } from '../lexdao_workflow';
import * as fs from 'fs-extra';
import * as path from 'path';

// Mock OpenAI client for testing
jest.mock('../../src/core/multiagent/OpenAIClient', () => {
  return {
    OpenAIClient: jest.fn().mockImplementation(() => ({
      createChatCompletion: jest.fn().mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              test: 'response',
              analysis: 'mock analysis result'
            })
          }
        }]
      })
    }))
  };
});

describe('LLMAgent', () => {
  let agent: LLMAgent;
  const mockContext = {
    logger: {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn()
    },
    config: {},
    outputs: {}
  };

  beforeEach(() => {
    agent = new LLMAgent({
      id: 'test-llm-agent',
      name: 'Test LLM Agent',
      unitId: 'test-unit',
      unitName: 'Test Unit',
      description: 'Test agent for LLM functionality',
      systemPrompt: 'You are a helpful test assistant.'
    });
  });

  test('should initialize with correct configuration', () => {
    expect(agent.id).toBe('test-llm-agent');
    expect(agent.name).toBe('Test LLM Agent');
    expect(agent.systemPrompt).toContain('helpful test assistant');
  });

  test('should process string input correctly', async () => {
    const input = 'Test input string';
    const result = await agent.process(input, mockContext as any);

    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
  });

  test('should process object input correctly', async () => {
    const input = { test: 'data', nested: { value: 123 } };
    const result = await agent.process(input, mockContext as any);

    expect(result).toBeDefined();
  });

  test('should handle LLM API errors gracefully', async () => {
    // Mock LLM client to throw error
    const mockLlmClient = {
      createChatCompletion: jest.fn().mockRejectedValue(new Error('API Error'))
    };
    (agent as any).llm = mockLlmClient;

    const input = 'Test input';
    await expect(agent.process(input, mockContext as any)).rejects.toThrow('API Error');
  });

  test('should handle null LLM response', async () => {
    // Mock LLM client to return null content
    const mockLlmClient = {
      createChatCompletion: jest.fn().mockResolvedValue({
        choices: [{ message: { content: null } }]
      })
    };
    (agent as any).llm = mockLlmClient;

    const input = 'Test input';
    const result = await agent.process(input, mockContext as any);

    expect(result).toBeNull();
  });

  test('should log LLM responses to file', async () => {
    const input = 'Test input for logging';
    await agent.process(input, mockContext as any);

    // Check if log file was created (would need actual file system for full test)
    expect(mockContext.logger.info).toHaveBeenCalledWith(
      expect.stringContaining('processing input')
    );
  });
});

describe('BlockchainAgent', () => {
  let agent: BlockchainAgent;
  const mockContext = {
    logger: {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn()
    },
    config: {},
    outputs: {}
  };

  beforeEach(() => {
    agent = new BlockchainAgent({
      id: 'test-blockchain-agent',
      name: 'Test Blockchain Agent',
      unitId: 'test-unit',
      unitName: 'Test Unit',
      description: 'Test agent for blockchain operations',
      blockchainProvider: 'ethereum',
      contractAddress: '0x97103fda00a2b47EaC669568063C00e65866a633'
    });
  });

  test('should initialize with correct blockchain configuration', () => {
    expect(agent.blockchainProvider).toBe('ethereum');
    expect(agent.contractAddress).toBe('0x97103fda00a2b47EaC669568063C00e65866a633');
  });

  test('should handle getMembership operation', async () => {
    const input = { operation: 'getMembership', address: '0x123' };
    const result = await agent.process(input, mockContext as any);

    expect(result).toBeDefined();
    expect(result).toHaveProperty('status');
  });

  test('should handle getVotingPower operation', async () => {
    const input = { operation: 'getVotingPower', address: '0x456' };
    const result = await agent.process(input, mockContext as any);

    expect(result).toBeDefined();
    expect(result).toHaveProperty('power');
  });

  test('should handle getTreasuryBalance operation', async () => {
    const input = { operation: 'getTreasuryBalance' };
    const result = await agent.process(input, mockContext as any);

    expect(result).toBeDefined();
    expect(result).toHaveProperty('eth');
    expect(result).toHaveProperty('dai');
    expect(result).toHaveProperty('usdc');
  });

  test('should handle submitProposal operation', async () => {
    const input = {
      operation: 'submitProposal',
      proposal: {
        title: 'Test Proposal',
        description: 'Test proposal description',
        proposer: '0x789'
      }
    };
    const result = await agent.process(input, mockContext as any);

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result).toHaveProperty('proposalId');
  });

  test('should handle castVote operation', async () => {
    const input = {
      operation: 'castVote',
      proposalId: 'test-proposal-id',
      voterAddress: '0xabc',
      support: true
    };
    const result = await agent.process(input, mockContext as any);

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });

  test('should handle executeProposal operation', async () => {
    const input = { operation: 'executeProposal', proposalId: 'test-proposal-id' };
    const result = await agent.process(input, mockContext as any);

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.status).toBe('executed');
  });

  test('should throw error for unknown operation', async () => {
    const input = { operation: 'unknownOperation' };

    await expect(agent.process(input, mockContext as any))
      .rejects.toThrow('Unknown blockchain operation: unknownOperation');
  });
});

describe('DataProcessingAgent', () => {
  let agent: DataProcessingAgent;
  const mockContext = {
    logger: {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn()
    },
    config: {},
    outputs: {}
  };

  beforeEach(() => {
    const mockProcessingFunction = jest.fn().mockReturnValue({
      processed: true,
      result: 'mock processing result'
    });

    agent = new DataProcessingAgent({
      id: 'test-data-agent',
      name: 'Test Data Agent',
      unitId: 'test-unit',
      unitName: 'Test Unit',
      description: 'Test agent for data processing',
      processingFunction: mockProcessingFunction
    });
  });

  test('should process data using custom function', async () => {
    const input = { data: 'test data' };
    const result = await agent.process(input, mockContext as any);

    expect(result).toBeDefined();
    expect(result.processed).toBe(true);
  });

  test('should handle processing function errors', async () => {
    // Create agent with function that throws error
    const errorFunction = jest.fn().mockImplementation(() => {
      throw new Error('Processing error');
    });

    const errorAgent = new DataProcessingAgent({
      id: 'test-error-agent',
      name: 'Test Error Agent',
      unitId: 'test-unit',
      unitName: 'Test Unit',
      description: 'Test agent that throws errors',
      processingFunction: errorFunction
    });

    const input = { data: 'test data' };

    await expect(errorAgent.process(input, mockContext as any))
      .rejects.toThrow('Processing error');
  });
});

describe('RuleBasedAgent', () => {
  let agent: RuleBasedAgent;
  const mockContext = {
    logger: {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn()
    },
    config: {},
    outputs: {}
  };

  beforeEach(() => {
    agent = new RuleBasedAgent({
      id: 'test-rule-agent',
      name: 'Test Rule Agent',
      unitId: 'test-unit',
      unitName: 'Test Unit',
      description: 'Test agent for rule-based processing',
      rules: [
        {
          condition: (input: any) => input.status === 'valid',
          action: (input: any) => ({ processed: true, status: input.status })
        },
        {
          condition: (input: any) => input.status === 'invalid',
          action: (input: any) => ({ processed: false, error: 'Invalid status' })
        }
      ],
      defaultAction: (input: any) => ({ processed: false, default: true })
    });
  });

  test('should apply first matching rule', async () => {
    const input = { status: 'valid' };
    const result = await agent.process(input, mockContext as any);

    expect(result).toBeDefined();
    expect(result.processed).toBe(true);
    expect(result.status).toBe('valid');
  });

  test('should apply second matching rule', async () => {
    const input = { status: 'invalid' };
    const result = await agent.process(input, mockContext as any);

    expect(result).toBeDefined();
    expect(result.processed).toBe(false);
    expect(result.error).toBe('Invalid status');
  });

  test('should apply default action when no rules match', async () => {
    const input = { status: 'unknown' };
    const result = await agent.process(input, mockContext as any);

    expect(result).toBeDefined();
    expect(result.processed).toBe(false);
    expect(result.default).toBe(true);
  });

  test('should handle rule action errors', async () => {
    const errorAgent = new RuleBasedAgent({
      id: 'test-error-rule-agent',
      name: 'Test Error Rule Agent',
      unitId: 'test-unit',
      unitName: 'Test Unit',
      description: 'Test agent with error-throwing rules',
      rules: [
        {
          condition: (input: any) => input.throwError,
          action: (input: any) => {
            throw new Error('Rule action error');
          }
        }
      ]
    });

    const input = { throwError: true };

    await expect(errorAgent.process(input, mockContext as any))
      .rejects.toThrow('Rule action error');
  });
});

describe('GovernanceVisualizationAgent', () => {
  let agent: GovernanceVisualizationAgent;
  const mockContext = {
    logger: {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn()
    },
    config: {},
    outputs: {}
  };

  beforeEach(() => {
    agent = new GovernanceVisualizationAgent({
      id: 'test-viz-agent',
      name: 'Test Visualization Agent',
      unitId: 'test-unit',
      unitName: 'Test Unit',
      description: 'Test agent for visualization',
      visualizationType: 'membership'
    });
  });

  test('should initialize with correct visualization type', () => {
    expect(agent.visualizationType).toBe('membership');
  });

  test('should generate membership visualization', async () => {
    const input = {
      members: [
        { address: '0x123', tokens: 1000, joined: '2023-01-01' },
        { address: '0x456', tokens: 1000, joined: '2023-02-01' }
      ]
    };

    const result = await agent.process(input, mockContext as any);

    expect(result).toBeDefined();
    expect(result.visualizationType).toBe('membership');
    expect(result).toHaveProperty('filePath');
    expect(result).toHaveProperty('summary');
  });

  test('should generate voting visualization', async () => {
    const votingAgent = new GovernanceVisualizationAgent({
      id: 'test-voting-viz',
      name: 'Test Voting Visualization',
      unitId: 'test-unit',
      unitName: 'Test Unit',
      description: 'Test voting visualization',
      visualizationType: 'voting'
    });

    const input = {
      title: 'Test Proposal',
      votes: [
        { support: true, voter: '0x123' },
        { support: false, voter: '0x456' }
      ]
    };

    const result = await votingAgent.process(input, mockContext as any);

    expect(result).toBeDefined();
    expect(result.visualizationType).toBe('voting');
    expect(result).toHaveProperty('filePath');
  });

  test('should generate treasury visualization', async () => {
    const treasuryAgent = new GovernanceVisualizationAgent({
      id: 'test-treasury-viz',
      name: 'Test Treasury Visualization',
      unitId: 'test-unit',
      unitName: 'Test Unit',
      description: 'Test treasury visualization',
      visualizationType: 'treasury'
    });

    const input = {
      treasury: {
        eth: 5.3,
        dai: 12500,
        usdc: 8750
      }
    };

    const result = await treasuryAgent.process(input, mockContext as any);

    expect(result).toBeDefined();
    expect(result.visualizationType).toBe('treasury');
    expect(result).toHaveProperty('filePath');
  });

  test('should throw error for unknown visualization type', async () => {
    const unknownAgent = new GovernanceVisualizationAgent({
      id: 'test-unknown-viz',
      name: 'Test Unknown Visualization',
      unitId: 'test-unit',
      unitName: 'Test Unit',
      description: 'Test unknown visualization type',
      visualizationType: 'unknown' as any
    });

    const input = {};

    await expect(unknownAgent.process(input, mockContext as any))
      .rejects.toThrow('Unknown visualization type: unknown');
  });

  test('should generate animation for supported types', async () => {
    const input = {
      members: [
        { address: '0x123', tokens: 1000, joined: '2023-01-01' }
      ]
    };

    const result = await agent.process(input, mockContext as any);

    expect(result).toBeDefined();
    expect(result).toHaveProperty('animationFilePath');
  });
});

describe('Agent Integration', () => {
  test('should handle complex workflow scenario', async () => {
    const mockContext = {
      logger: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn()
      },
      config: {},
      outputs: {}
    };

    // Test a complete workflow with multiple agents
    const llmAgent = new LLMAgent({
      id: 'integration-llm',
      name: 'Integration LLM Agent',
      unitId: 'test-unit',
      unitName: 'Test Unit',
      description: 'LLM agent for integration test',
      systemPrompt: 'You are a helpful assistant for testing.'
    });

    const blockchainAgent = new BlockchainAgent({
      id: 'integration-blockchain',
      name: 'Integration Blockchain Agent',
      unitId: 'test-unit',
      unitName: 'Test Unit',
      description: 'Blockchain agent for integration test',
      blockchainProvider: 'ethereum',
      contractAddress: '0x97103fda00a2b47EaC669568063C00e65866a633'
    });

    // Test LLM agent processing
    const llmResult = await llmAgent.process('Test integration input', mockContext as any);
    expect(llmResult).toBeDefined();

    // Test blockchain agent processing
    const blockchainResult = await blockchainAgent.process(
      { operation: 'getTreasuryBalance' },
      mockContext as any
    );
    expect(blockchainResult).toBeDefined();

    // Verify logging was called
    expect(mockContext.logger.info).toHaveBeenCalled();
  });

  test('should handle error propagation in workflow', async () => {
    const mockContext = {
      logger: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn()
      },
      config: {},
      outputs: {}
    };

    const errorAgent = new LLMAgent({
      id: 'error-llm',
      name: 'Error LLM Agent',
      unitId: 'test-unit',
      unitName: 'Test Unit',
      description: 'LLM agent that throws errors',
      systemPrompt: 'You are an assistant that fails.'
    });

    // Mock the LLM client to throw an error
    const mockLlmClient = {
      createChatCompletion: jest.fn().mockRejectedValue(new Error('Simulated LLM error'))
    };
    (errorAgent as any).llm = mockLlmClient;

    await expect(errorAgent.process('Test input', mockContext as any))
      .rejects.toThrow('Simulated LLM error');

    expect(mockContext.logger.error).toHaveBeenCalled();
  });
});
