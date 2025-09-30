/**
 * Comprehensive Multi-Agent Workflow Example
 *
 * This example demonstrates the full capabilities of the NoOrg multi-agent framework
 * by implementing a complex workflow involving multiple specialized agents working
 * together to solve a real-world business problem.
 *
 * The workflow simulates a complete business intelligence and content generation pipeline:
 * 1. Research Agent gathers market data
 * 2. Analysis Agent processes and analyzes the data
 * 3. DataAnalysis Agent creates visualizations
 * 4. Finance Agent performs financial analysis
 * 5. Marketing Agent develops campaign strategy
 * 6. CreativeWriting Agent generates content
 * 7. Legal Agent reviews for compliance
 * 8. FinalReview Agent performs quality assurance
 */

import { MultiAgentCoordinator } from '../src/core/multiagent/MultiAgentCoordinator';
import { EventSystem } from '../src/core/events/EventSystem';
import { MonitoringSystem } from '../src/core/monitoring/MonitoringSystem';
import { StorageSystem } from '../src/core/storage/StorageSystem';

// Import all agent types
import { ResearchAgent } from '../src/agents/ResearchAgent';
import { AnalysisAgent } from '../src/agents/AnalysisAgent';
import { DataAnalysisAgent } from '../src/agents/DataAnalysisAgent';
import { FinanceAgent } from '../src/agents/FinanceAgent';
import { MarketingAgent } from '../src/agents/MarketingAgent';
import { CreativeWritingAgent } from '../src/agents/CreativeWritingAgent';
import { LegalAgent } from '../src/agents/LegalAgent';
import { FinalReviewAgent } from '../src/agents/FinalReviewAgent';
import { DevelopmentAgent } from '../src/agents/DevelopmentAgent';

// Import OpenAI client for testing
import { OpenAIClient } from '../src/core/multiagent/OpenAIClient';

// Mock data for the workflow
const SAMPLE_MARKET_DATA = {
  industry: 'SaaS',
  competitors: [
    { name: 'Competitor A', marketShare: 25, revenue: 50 },
    { name: 'Competitor B', marketShare: 20, revenue: 40 },
    { name: 'Competitor C', marketShare: 15, revenue: 30 }
  ],
  trends: ['AI integration', 'Cloud migration', 'Mobile-first'],
  opportunities: ['Emerging markets', 'Partnership potential', 'Technology gaps']
};

const SAMPLE_FINANCIAL_DATA = {
  revenue: [100000, 120000, 140000, 160000, 180000],
  expenses: [60000, 65000, 70000, 75000, 80000],
  growthRate: 0.15,
  profitMargin: 0.25
};

async function runComprehensiveWorkflow() {
  console.log('🚀 Starting Comprehensive Multi-Agent Workflow...\n');

  // Initialize core systems
  const coordinator = new MultiAgentCoordinator();
  const eventSystem = EventSystem.getInstance();
  const monitoring = MonitoringSystem.getInstance();
  const storage = StorageSystem.getInstance();

  // Mock OpenAI client for demonstration
  const mockOpenAIClient = new OpenAIClient({
    apiKey: process.env.OPENAI_API_KEY || 'demo-key',
    defaultModel: 'gpt-4o'
  });

  // Initialize agents with different specializations
  const agents = [
    new ResearchAgent('Market Research Specialist', {
      openAIClient: mockOpenAIClient,
      sharedState: storage as any
    }),

    new AnalysisAgent('Business Intelligence Analyst', {
      openAIClient: mockOpenAIClient,
      sharedState: storage as any
    }),

    new DataAnalysisAgent('Data Visualization Expert', {
      openAIClient: mockOpenAIClient,
      sharedState: storage as any,
      specialty: 'business'
    }),

    new FinanceAgent('Financial Planning Advisor', {
      openAIClient: mockOpenAIClient,
      sharedState: storage as any
    }),

    new MarketingAgent('Marketing Strategy Director', {
      openAIClient: mockOpenAIClient,
      sharedState: storage as any
    }),

    new CreativeWritingAgent('Content Marketing Writer', {
      openAIClient: mockOpenAIClient,
      sharedState: storage as any
    }),

    new LegalAgent('Compliance Officer', {
      openAIClient: mockOpenAIClient,
      sharedState: storage as any,
      jurisdiction: 'United States'
    }),

    new FinalReviewAgent('Quality Assurance Manager', {
      openAIClient: mockOpenAIClient,
      sharedState: storage as any
    }),

    new DevelopmentAgent('Technical Documentation Lead', {
      openAIClient: mockOpenAIClient,
      sharedState: storage as any,
      specialty: 'fullstack'
    })
  ];

  // Initialize coordinator and register all agents
  await coordinator.initialize();

  console.log('📋 Registering agents...');
  for (const agent of agents) {
    await coordinator.registerAgent(agent);
    console.log(`  ✅ Registered: ${agent.getAgentInfo().name} (${agent.getAgentInfo().type})`);
  }

  // Set up event monitoring
  let workflowStep = 0;
  const eventSubscription = eventSystem.subscribe('workflow.*', (event) => {
    workflowStep++;
    console.log(`📈 Workflow Step ${workflowStep}: ${event.type} - ${event.data?.message || 'Processing...'}`);
  });

  try {
    // Execute comprehensive workflow
    console.log('\n🎯 Executing Comprehensive Workflow...\n');

    // Phase 1: Research and Data Collection
    console.log('🔍 Phase 1: Research and Data Collection');
    const researchResults = await coordinator.executeTask({
      type: 'research',
      agent: 'Market Research Specialist',
      data: {
        query: 'Current SaaS market trends and competitive analysis',
        focusAreas: ['market size', 'growth trends', 'competitive landscape'],
        depth: 'comprehensive'
      }
    });

    await storage.set('workflow.research', researchResults);
    console.log('✅ Research completed');

    // Phase 2: Data Analysis and Insights
    console.log('\n📊 Phase 2: Data Analysis and Insights');
    const analysisResults = await coordinator.executeTask({
      type: 'analyze',
      agent: 'Business Intelligence Analyst',
      data: {
        marketData: SAMPLE_MARKET_DATA,
        researchData: researchResults,
        analysisType: 'comprehensive'
      }
    });

    await storage.set('workflow.analysis', analysisResults);
    console.log('✅ Analysis completed');

    // Phase 3: Financial Analysis
    console.log('\n💰 Phase 3: Financial Analysis');
    const financialResults = await coordinator.executeTask({
      type: 'analyze',
      agent: 'Financial Planning Advisor',
      data: SAMPLE_FINANCIAL_DATA
    });

    await storage.set('workflow.finance', financialResults);
    console.log('✅ Financial analysis completed');

    // Phase 4: Marketing Strategy Development
    console.log('\n🎯 Phase 4: Marketing Strategy Development');
    const marketingResults = await coordinator.executeTask({
      type: 'createCampaign',
      agent: 'Marketing Strategy Director',
      data: {
        analysis: analysisResults,
        targetAudience: 'Enterprise customers',
        budget: '$50,000',
        goals: ['Increase market share', 'Generate leads', 'Build brand awareness']
      }
    });

    await storage.set('workflow.marketing', marketingResults);
    console.log('✅ Marketing strategy completed');

    // Phase 5: Content Creation
    console.log('\n✍️ Phase 5: Content Creation');
    const contentResults = await coordinator.executeTask({
      type: 'generate',
      agent: 'Content Marketing Writer',
      data: {
        strategy: marketingResults,
        format: 'blog-post',
        tone: 'professional',
        length: 'long'
      }
    });

    await storage.set('workflow.content', contentResults);
    console.log('✅ Content creation completed');

    // Phase 6: Legal Review and Compliance
    console.log('\n⚖️ Phase 6: Legal Review and Compliance');
    const legalResults = await coordinator.executeTask({
      type: 'review',
      agent: 'Compliance Officer',
      data: {
        content: contentResults,
        documentType: 'marketing-material',
        jurisdiction: 'US'
      }
    });

    await storage.set('workflow.legal', legalResults);
    console.log('✅ Legal review completed');

    // Phase 7: Quality Assurance and Final Review
    console.log('\n🔍 Phase 7: Quality Assurance and Final Review');
    const reviewResults = await coordinator.executeTask({
      type: 'review',
      agent: 'Quality Assurance Manager',
      data: {
        content: contentResults,
        legalReview: legalResults,
        criteria: ['accuracy', 'clarity', 'compliance', 'effectiveness']
      }
    });

    await storage.set('workflow.final-review', reviewResults);
    console.log('✅ Final review completed');

    // Phase 8: Technical Documentation
    console.log('\n📚 Phase 8: Technical Documentation');
    const docResults = await coordinator.executeTask({
      type: 'generate',
      agent: 'Technical Documentation Lead',
      data: {
        workflow: {
          research: researchResults,
          analysis: analysisResults,
          finance: financialResults,
          marketing: marketingResults,
          content: contentResults,
          legal: legalResults,
          review: reviewResults
        },
        format: 'markdown',
        includeCodeExamples: true
      }
    });

    await storage.set('workflow.documentation', docResults);
    console.log('✅ Documentation completed');

    // Generate final report
    console.log('\n📋 Generating Final Report...');

    const finalReport = {
      workflowId: 'comprehensive-demo-' + Date.now(),
      timestamp: new Date().toISOString(),
      phases: {
        research: await storage.get('workflow.research'),
        analysis: await storage.get('workflow.analysis'),
        finance: await storage.get('workflow.finance'),
        marketing: await storage.get('workflow.marketing'),
        content: await storage.get('workflow.content'),
        legal: await storage.get('workflow.legal'),
        review: await storage.get('workflow.final-review'),
        documentation: await storage.get('workflow.documentation')
      },
      summary: {
        totalAgents: agents.length,
        workflowSteps: 8,
        processingTime: Date.now() - Date.now(), // Would be actual timing in real implementation
        success: true
      }
    };

    // Save final report
    await storage.set('workflow.final-report', finalReport);

    // Get monitoring metrics
    const metrics = monitoring.getMetrics ? monitoring.getMetrics() : {};
    const health = monitoring.getOverallHealth ? await monitoring.getOverallHealth() : {};

    console.log('\n🎉 Workflow Completed Successfully!');
    console.log('\n📊 Workflow Summary:');
    console.log(`  • Agents Involved: ${agents.length}`);
    console.log(`  • Workflow Phases: 8`);
    console.log(`  • Processing Steps: ${workflowStep}`);
    console.log(`  • System Health: ${health.status || 'Unknown'}`);

    if (metrics) {
      console.log('\n📈 Performance Metrics:');
      console.log(`  • Events Processed: ${metrics['events.published'] || 0}`);
      console.log(`  • Tasks Completed: ${metrics['tasks.completed'] || 0}`);
      console.log(`  • Agent Operations: ${metrics['agents.operations'] || 0}`);
    }

    console.log('\n📁 Generated Outputs:');
    console.log('  • Market Research Report');
    console.log('  • Business Intelligence Analysis');
    console.log('  • Financial Analysis Report');
    console.log('  • Marketing Strategy Plan');
    console.log('  • Content Marketing Materials');
    console.log('  • Legal Compliance Review');
    console.log('  • Quality Assurance Report');
    console.log('  • Technical Documentation');

    return finalReport;

  } catch (error) {
    console.error('\n❌ Workflow Failed:', error);

    // Record error in monitoring
    monitoring.recordMetric('workflow.errors', 1);

    throw error;
  } finally {
    // Cleanup
    eventSystem.unsubscribe(eventSubscription);

    // Shutdown coordinator
    await coordinator.shutdown();

    console.log('\n🧹 Cleanup completed');
  }
}

// Export for use in other modules
export { runComprehensiveWorkflow };

// Run if called directly
if (require.main === module) {
  runComprehensiveWorkflow()
    .then(() => {
      console.log('\n✅ Comprehensive workflow demonstration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Workflow demonstration failed:', error);
      process.exit(1);
    });
}
