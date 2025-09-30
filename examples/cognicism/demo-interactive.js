#!/usr/bin/env node

/**
 * Interactive Cognicism Framework Demo
 *
 * This script provides an interactive command-line interface for exploring
 * the Cognicism framework components and running various demonstrations.
 */

const readline = require('readline');
const path = require('path');
const fs = require('fs-extra');
const { runCognicismWorkflow, IrisAgent, FourThoughtAgent, SemanticLedgerAgent } = require('./cognicism-workflow');

class InteractiveDemo {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    this.currentDemo = null;
    this.demoHistory = [];

    // Initialize demo components
    this.irisAgents = new Map();
    this.fourThoughtAgents = new Map();
    this.ledgerAgent = null;

    console.log(`
╔════════════════════════════════════════════════════════════════╗
║                  Cognicism Framework Demo                      ║
║              Interactive Exploration Interface                 ║
╚════════════════════════════════════════════════════════════════╝

Welcome to the Cognicism Framework Interactive Demo!

Available demo modes:
• workflow - Run the complete Cognicism workflow
• iris     - Explore Iris belief encoding models
• fourthought - Interactive FourThought dialectic process
• ledger   - Semantic ledger operations and queries
• trust    - Trust mechanism demonstrations
• visualize - Visualization and analytics demos
• help     - Show available commands

Type 'help' for more information or choose a demo mode to begin.
    `);
  }

  start() {
    this.showPrompt();
  }

  showPrompt() {
    this.rl.question('\nCognicism Demo > ', (answer) => {
      this.processCommand(answer.trim().toLowerCase());
    });
  }

  processCommand(command) {
    this.demoHistory.push(command);

    switch (command) {
      case 'help':
      case 'h':
        this.showHelp();
        break;

      case 'workflow':
      case 'w':
        this.runWorkflowDemo();
        break;

      case 'iris':
      case 'i':
        this.runIrisDemo();
        break;

      case 'fourthought':
      case 'ft':
        this.runFourThoughtDemo();
        break;

      case 'ledger':
      case 'l':
        this.runLedgerDemo();
        break;

      case 'trust':
      case 't':
        this.runTrustDemo();
        break;

      case 'visualize':
      case 'v':
        this.runVisualizationDemo();
        break;

      case 'history':
        this.showHistory();
        break;

      case 'clear':
        console.clear();
        break;

      case 'exit':
      case 'quit':
      case 'q':
        this.exit();
        break;

      default:
        console.log(`Unknown command: ${command}`);
        console.log("Type 'help' for available commands.");
    }

    if (command !== 'exit' && command !== 'quit' && command !== 'q') {
      this.showPrompt();
    }
  }

  showHelp() {
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║                    Available Commands                         ║
╚════════════════════════════════════════════════════════════════╝

workflow (w)     - Run the complete Cognicism workflow
iris (i)         - Explore Iris belief encoding models
fourthought (ft) - Interactive FourThought dialectic process
ledger (l)       - Semantic ledger operations and queries
trust (t)        - Trust mechanism demonstrations
visualize (v)    - Visualization and analytics demos
history          - Show command history
clear            - Clear the screen
help (h)         - Show this help message
exit (quit, q)   - Exit the demo

Examples:
  workflow                    - Run full workflow
  iris climate-change         - Explore climate change with Iris
  fourthought ethics          - Generate thoughts on AI ethics
  ledger query "climate adaptation"
  trust analyze source1       - Analyze trust for a source

Type a command to begin exploration!
    `);
  }

  async runWorkflowDemo() {
    console.log('\n🚀 Starting Cognicism Workflow Demo...');
    console.log('This will run the complete framework with all agents.\n');

    try {
      const context = await runCognicismWorkflow();

      console.log('\n✅ Workflow completed successfully!');
      console.log(`📊 Generated ${Object.keys(context.outputs).length} outputs`);
      console.log(`⏱️  Total execution time: ${((Date.now() - context.startTime) / 1000).toFixed(2)}s`);
      console.log(`📁 Output directory: ${context.config.OUTPUT_DIR}`);

      // Show key insights
      if (context.outputs.integrated_findings) {
        const findings = context.outputs.integrated_findings;
        console.log('\n📋 Key Insights:');
        if (findings.synthesis?.key_insights) {
          findings.synthesis.key_insights.slice(0, 3).forEach((insight, i) => {
            console.log(`  ${i + 1}. ${insight}`);
          });
        }
      }

    } catch (error) {
      console.error('\n❌ Workflow failed:', error.message);
    }
  }

  async runIrisDemo() {
    console.log('\n🧠 Iris Belief Encoding Demo');
    console.log('Exploring the Iris model for belief encoding and trust management.\n');

    const topics = [
      'climate-change',
      'ai-ethics',
      'scientific-method',
      'policy-making',
      'sustainable-development'
    ];

    console.log('Available topics:');
    topics.forEach((topic, i) => {
      console.log(`  ${i + 1}. ${topic}`);
    });

    this.rl.question('\nChoose a topic (1-5) or enter custom topic: ', async (answer) => {
      let topic = topics[parseInt(answer) - 1];

      if (!topic) {
        topic = answer.trim();
        if (!topic) topic = 'general-ai-safety';
      }

      await this.exploreIrisTopic(topic);
      this.showPrompt();
    });
  }

  async exploreIrisTopic(topic) {
    console.log(`\n🔍 Exploring topic: ${topic}`);

    // Create or get Iris agent for this topic
    const agentId = `iris_${topic.replace(/[^a-zA-Z0-9]/g, '_')}`;
    if (!this.irisAgents.has(agentId)) {
      this.irisAgents.set(agentId, new IrisAgent({
        id: agentId,
        name: `${topic} Iris`,
        unitId: 'demo_unit',
        unitName: 'Interactive Demo Unit',
        description: `Iris agent specialized in ${topic} analysis`,
        systemPrompt: `You are an Iris belief encoding model specialized in ${topic}. Process information, track source reliability, and update trust distributions based on community feedback and evidence quality.`
      }));
    }

    const irisAgent = this.irisAgents.get(agentId);

    this.rl.question(`Enter a statement or question about ${topic}: `, async (input) => {
      if (!input.trim()) {
        console.log('No input provided.');
        return;
      }

      try {
        console.log('\n🤔 Processing with Iris model...');

        const mockContext = {
          logger: {
            info: (msg) => console.log(`ℹ️  ${msg}`),
            error: (msg) => console.error(`❌ ${msg}`)
          },
          config: {
            OUTPUT_DIR: './demo_output',
            LLM_CONFIG: {
              DEFAULT_MODEL: 'gpt-4o',
              DEFAULT_MAX_TOKENS: 1000
            }
          }
        };

        const result = await irisAgent.process(input, mockContext);

        console.log('\n📊 Iris Analysis Results:');
        console.log(`Thoughts generated: ${result.thoughts?.length || 0}`);
        console.log(`Trust distribution updated for ${Object.keys(result.trust_distribution || {}).length} sources`);

        if (result.thoughts && result.thoughts.length > 0) {
          console.log('\n💭 Generated Thoughts:');
          result.thoughts.forEach((thought, i) => {
            console.log(`${i + 1}. [${thought.type?.toUpperCase()}] ${thought.content.substring(0, 100)}${thought.content.length > 100 ? '...' : ''}`);
          });
        }

      } catch (error) {
        console.error('❌ Error in Iris processing:', error.message);
      }
    });
  }

  async runFourThoughtDemo() {
    console.log('\n💭 FourThought Dialectic Process Demo');
    console.log('Exploring the FourThought protocol for generating diverse perspectives.\n');

    const topics = [
      'ai-ethics',
      'climate-policy',
      'scientific-progress',
      'democratic-governance',
      'technological-innovation'
    ];

    console.log('Suggested topics:');
    topics.forEach((topic, i) => {
      console.log(`  ${i + 1}. ${topic}`);
    });

    this.rl.question('\nEnter a topic for FourThought exploration: ', async (topic) => {
      if (!topic.trim()) {
        console.log('No topic provided.');
        this.showPrompt();
        return;
      }

      await this.runFourThoughtExploration(topic.trim());
      this.showPrompt();
    });
  }

  async runFourThoughtExploration(topic) {
    console.log(`\n🔄 Running FourThought exploration on: ${topic}`);

    // Create FourThought agent
    const agentId = `ft_${topic.replace(/[^a-zA-Z0-9]/g, '_')}`;
    if (!this.fourThoughtAgents.has(agentId)) {
      this.fourThoughtAgents.set(agentId, new FourThoughtAgent({
        id: agentId,
        name: `${topic} FourThought`,
        unitId: 'demo_unit',
        unitName: 'Interactive Demo Unit',
        description: `FourThought agent for ${topic} dialectic exploration`,
        topic: topic
      }));
    }

    const ftAgent = this.fourThoughtAgents.get(agentId);

    this.rl.question('Enter an initial statement or question to explore: ', async (input) => {
      if (!input.trim()) {
        console.log('No input provided.');
        return;
      }

      try {
        console.log('\n🧠 Generating FourThought perspectives...');

        const mockContext = {
          logger: {
            info: (msg) => console.log(`ℹ️  ${msg}`),
            error: (msg) => console.error(`❌ ${msg}`)
          },
          config: {
            OUTPUT_DIR: './demo_output',
            LLM_CONFIG: {
              DEFAULT_MODEL: 'gpt-4o',
              DEFAULT_MAX_TOKENS: 1500
            }
          }
        };

        const result = await ftAgent.process(input, mockContext);

        console.log('\n📊 FourThought Results:');
        console.log(`Total thoughts generated: ${result.thought_count || 0}`);

        if (result.thoughts) {
          console.log('\n💭 Generated Thoughts by Category:');

          for (const [category, thoughts] of Object.entries(result.thoughts)) {
            console.log(`\n📂 ${category.toUpperCase()}:`);
            if (Array.isArray(thoughts)) {
              thoughts.slice(0, 2).forEach((thought, i) => {
                console.log(`  ${i + 1}. ${thought.content.substring(0, 80)}${thought.content.length > 80 ? '...' : ''}`);
              });
            }
          }
        }

        // Show analytics if available
        const analytics = ftAgent.getThoughtAnalytics();
        console.log('\n📈 Thought Analytics:');
        console.log(`  Total thoughts: ${analytics.totalThoughts}`);
        console.log(`  Average uncertainty: ${analytics.averageUncertainty.toFixed(2)}`);
        console.log(`  Average valence: ${analytics.averageValence.toFixed(2)}`);

      } catch (error) {
        console.error('❌ Error in FourThought processing:', error.message);
      }
    });
  }

  async runLedgerDemo() {
    console.log('\n📚 Semantic Ledger Demo');
    console.log('Demonstrating knowledge storage, retrieval, and semantic search.\n');

    // Initialize ledger agent if not exists
    if (!this.ledgerAgent) {
      this.ledgerAgent = new SemanticLedgerAgent({
        id: 'demo_ledger',
        name: 'Demo Semantic Ledger',
        unitId: 'demo_unit',
        unitName: 'Interactive Demo Unit',
        description: 'Semantic ledger for demo knowledge storage'
      });
    }

    const operations = [
      'store - Store sample thoughts',
      'query - Query stored knowledge',
      'search - Semantic search',
      'analyze - Analyze stored content'
    ];

    console.log('Available operations:');
    operations.forEach((op, i) => {
      console.log(`  ${i + 1}. ${op}`);
    });

    this.rl.question('\nChoose an operation (1-4): ', async (answer) => {
      const choice = parseInt(answer);

      switch (choice) {
        case 1:
          await this.demoStoreThoughts();
          break;
        case 2:
          await this.demoQueryKnowledge();
          break;
        case 3:
          await this.demoSemanticSearch();
          break;
        case 4:
          await this.demoAnalyzeContent();
          break;
        default:
          console.log('Invalid choice.');
      }

      this.showPrompt();
    });
  }

  async demoStoreThoughts() {
    console.log('\n💾 Storing sample thoughts in the semantic ledger...');

    const sampleThoughts = [
      {
        type: 'statement',
        content: 'Climate change represents one of the greatest challenges facing humanity in the 21st century.',
        author: 'Climate Scientist',
        valence: 0.8,
        uncertainty: 0.2
      },
      {
        type: 'prediction',
        content: 'AI systems will become integral to scientific research methodology within the next decade.',
        author: 'AI Researcher',
        valence: 0.7,
        uncertainty: 0.3
      },
      {
        type: 'question',
        content: 'How can we balance technological innovation with ethical considerations in AI development?',
        author: 'Ethics Committee',
        valence: 0.5,
        uncertainty: 0.6
      }
    ];

    const mockContext = {
      logger: {
        info: (msg) => console.log(`ℹ️  ${msg}`),
        error: (msg) => console.error(`❌ ${msg}`)
      },
      config: {
        OUTPUT_DIR: './demo_output'
      }
    };

    for (const thought of sampleThoughts) {
      try {
        const result = await this.ledgerAgent.process(
          { operation: 'store', thoughts: [thought] },
          mockContext
        );
        console.log(`✅ Stored: ${thought.content.substring(0, 50)}...`);
      } catch (error) {
        console.error(`❌ Failed to store thought: ${error.message}`);
      }
    }
  }

  async demoQueryKnowledge() {
    this.rl.question('Enter a query to search the knowledge base: ', async (query) => {
      if (!query.trim()) {
        console.log('No query provided.');
        this.showPrompt();
        return;
      }

      console.log(`\n🔍 Searching for: "${query}"`);

      const mockContext = {
        logger: {
          info: (msg) => console.log(`ℹ️  ${msg}`),
          error: (msg) => console.error(`❌ ${msg}`)
        },
        config: {
          OUTPUT_DIR: './demo_output'
        }
      };

      try {
        const result = await this.ledgerAgent.process(
          { operation: 'query', query: query },
          mockContext
        );

        console.log(`\n📊 Query Results: ${result.results_count} matches found`);

        if (result.results && result.results.length > 0) {
          console.log('\n📋 Top Results:');
          result.results.slice(0, 3).forEach((thought, i) => {
            console.log(`${i + 1}. [${thought.type?.toUpperCase()}] ${thought.content}`);
            console.log(`   Author: ${thought.author} | Valence: ${thought.valence || 0} | Uncertainty: ${thought.uncertainty || 0.5}`);
          });
        }

      } catch (error) {
        console.error('❌ Query failed:', error.message);
      }
    });
  }

  async demoSemanticSearch() {
    this.rl.question('Enter a semantic search query: ', async (query) => {
      if (!query.trim()) {
        console.log('No query provided.');
        this.showPrompt();
        return;
      }

      console.log(`\n🔍🔍 Performing semantic search for: "${query}"`);

      const mockContext = {
        logger: {
          info: (msg) => console.log(`ℹ️  ${msg}`),
          error: (msg) => console.error(`❌ ${msg}`)
        },
        config: {
          OUTPUT_DIR: './demo_output'
        }
      };

      try {
        const result = await this.ledgerAgent.process(
          { operation: 'query', query: query },
          mockContext
        );

        console.log(`\n📊 Semantic Search Results:`);
        console.log(`Query intent: ${result.intent || 'general'}`);
        console.log(`Search terms: ${result.search_terms?.join(', ') || 'N/A'}`);
        console.log(`Results found: ${result.results_count}`);

      } catch (error) {
        console.error('❌ Semantic search failed:', error.message);
      }
    });
  }

  async demoAnalyzeContent() {
    console.log('\n📊 Analyzing stored content...');

    // This would need to be implemented in the SemanticLedgerAgent
    console.log('Content analysis feature coming soon!');
    console.log('This would show:');
    console.log('• Topic distributions');
    console.log('• Author diversity');
    console.log('• Temporal patterns');
    console.log('• Semantic clusters');
  }

  async runTrustDemo() {
    console.log('\n🔐 Trust Mechanism Demo');
    console.log('Demonstrating advanced trust calculation and source evaluation.\n');

    console.log('Trust mechanisms include:');
    console.log('• Source reliability tracking');
    console.log('• Social proof integration');
    console.log('• Prophet incentive systems');
    console.log('• Temporal relevance weighting');
    console.log('• Community consensus building');

    this.rl.question('\nChoose a trust demo (1-3): \n1. Source evaluation\n2. Trust evolution\n3. Prophet incentives\n', async (answer) => {
      const choice = parseInt(answer);

      switch (choice) {
        case 1:
          await this.demoSourceEvaluation();
          break;
        case 2:
          await this.demoTrustEvolution();
          break;
        case 3:
          await this.demoProphetIncentives();
          break;
        default:
          console.log('Invalid choice.');
      }

      this.showPrompt();
    });
  }

  async demoSourceEvaluation() {
    console.log('\n🔍 Source Evaluation Demo');

    // Create sample sources
    const sources = [
      { id: 'source1', name: 'Research Journal', reliability: 0.9, expertise: 0.95, alignment: 0.8 },
      { id: 'source2', name: 'News Media', reliability: 0.6, expertise: 0.5, alignment: 0.4 },
      { id: 'source3', name: 'Social Media', reliability: 0.3, expertise: 0.2, alignment: 0.1 }
    ];

    console.log('\n📊 Sample Sources:');
    sources.forEach(source => {
      console.log(`  ${source.name}:`);
      console.log(`    Reliability: ${source.reliability}`);
      console.log(`    Expertise: ${source.expertise}`);
      console.log(`    Alignment: ${source.alignment}`);
    });

    console.log('\n🔬 Advanced Trust Calculations:');
    sources.forEach(source => {
      // Simulate advanced trust calculation
      const baseTrust = 0.5;
      const reliabilityBoost = source.reliability * 0.3;
      const expertiseBoost = source.expertise * 0.2;
      const alignmentBoost = (source.alignment + 1) * 0.25; // Convert -1,1 to 0,1 scale

      const advancedTrust = baseTrust + reliabilityBoost + expertiseBoost + alignmentBoost;
      const finalTrust = Math.min(1, Math.max(0, advancedTrust));

      console.log(`  ${source.name}: ${finalTrust.toFixed(2)} (Base: 0.50 + Rel: ${(reliabilityBoost * 100).toFixed(0)}% + Exp: ${(expertiseBoost * 100).toFixed(0)}% + Align: ${(alignmentBoost * 100).toFixed(0)}%)`);
    });
  }

  async demoTrustEvolution() {
    console.log('\n📈 Trust Evolution Demo');

    // Simulate trust evolution over time
    const timePoints = [0, 1, 2, 3, 4, 5];
    const sourceNames = ['Research Journal', 'News Media', 'Social Media'];
    const initialTrusts = [0.8, 0.5, 0.3];

    console.log('\n📊 Trust Evolution Over Time:');

    timePoints.forEach((time, i) => {
      console.log(`\nTime ${time}h:`);
      sourceNames.forEach((name, j) => {
        // Simulate trust changes based on feedback
        let trust = initialTrusts[j];

        // Apply some random but realistic changes
        if (i > 0) {
          const feedback = (Math.random() - 0.5) * 0.2;
          trust = Math.max(0, Math.min(1, trust + feedback));

          // Mean reversion for stability
          if (trust > 0.7) trust -= 0.05;
          if (trust < 0.3) trust += 0.05;
        }

        console.log(`  ${name}: ${trust.toFixed(2)} ${trust > 0.7 ? '🟢' : trust > 0.4 ? '🟡' : '🔴'}`);
      });
    });
  }

  async demoProphetIncentives() {
    console.log('\n🔮 Prophet Incentives Demo');

    const predictions = [
      { id: 'pred1', content: 'AI will solve climate change by 2030', author: 'Optimist', accuracy: 0.8 },
      { id: 'pred2', content: 'Social media will decline in influence', author: 'Pessimist', accuracy: 0.3 },
      { id: 'pred3', content: 'Quantum computing will become mainstream by 2025', author: 'Technologist', accuracy: 0.6 }
    ];

    console.log('\n📊 Prediction Accuracy and Rewards:');

    predictions.forEach(pred => {
      // Calculate reward based on accuracy and current trust
      const baseReward = pred.accuracy * 0.1; // Base reward
      const trustMultiplier = 0.8; // Assume current trust
      const finalReward = baseReward * trustMultiplier;

      console.log(`\n${pred.author}:`);
      console.log(`  Prediction: ${pred.content}`);
      console.log(`  Accuracy: ${(pred.accuracy * 100).toFixed(0)}%`);
      console.log(`  Reward: ${finalReward.toFixed(3)} Ŧrust`);
    });

    console.log('\n💡 Prophet incentives encourage accurate predictions and build community trust!');
  }

  async runVisualizationDemo() {
    console.log('\n📊 Visualization and Analytics Demo');
    console.log('Demonstrating data visualization capabilities.\n');

    console.log('Available visualizations:');
    console.log('• Trust network graphs');
    console.log('• Thought timeline animations');
    console.log('• Trust evolution heatmaps');
    console.log('• 3D semantic spaces');
    console.log('• Workflow progress diagrams');

    this.rl.question('\nChoose a visualization type (1-5): \n1. Trust network\n2. Thought timeline\n3. Trust heatmap\n4. 3D semantic space\n5. Workflow overview\n', async (answer) => {
      const choice = parseInt(answer);

      switch (choice) {
        case 1:
          console.log('\n🔗 Trust Network Visualization');
          console.log('This would show:');
          console.log('• Sources as nodes with trust levels');
          console.log('• Thoughts connected to their authors');
          console.log('• Interactive network with hover details');
          console.log('• Color coding by trust levels');
          break;

        case 2:
          console.log('\n⏱️  Thought Timeline Animation');
          console.log('This would show:');
          console.log('• Chronological sequence of thoughts');
          console.log('• Color coding by thought type');
          console.log('• Valence and uncertainty indicators');
          console.log('• Animated progression over time');
          break;

        case 3:
          console.log('\n🔥 Trust Evolution Heatmap');
          console.log('This would show:');
          console.log('• Trust changes over time for each source');
          console.log('• Heat intensity representing trust levels');
          console.log('• Interactive time scrubbing');
          console.log('• Pattern identification');
          break;

        case 4:
          console.log('\n🌌 3D Semantic Space');
          console.log('This would show:');
          console.log('• Thoughts positioned by semantic similarity');
          console.log('• Clustering by topic and type');
          console.log('• Interactive 3D exploration');
          console.log('• Distance representing conceptual similarity');
          break;

        case 5:
          console.log('\n📋 Workflow Overview');
          console.log('This would show:');
          console.log('• Stage-by-stage progress');
          console.log('• Agent interactions and dependencies');
          console.log('• Performance metrics');
          console.log('• Visual workflow diagram');
          break;

        default:
          console.log('Invalid choice.');
      }

      console.log('\n💻 Note: Full interactive visualizations require running the Python visualization script.');
      console.log('See cognicism_visualizations.py for implementation details.');

      this.showPrompt();
    });
  }

  showHistory() {
    console.log('\n📜 Command History:');
    this.demoHistory.slice(-10).forEach((cmd, i) => {
      console.log(`  ${i + 1}. ${cmd}`);
    });
    if (this.demoHistory.length > 10) {
      console.log(`  ... and ${this.demoHistory.length - 10} more`);
    }
  }

  exit() {
    console.log('\n👋 Thank you for exploring the Cognicism Framework!');
    console.log('For more information, see the documentation and example files.');
    this.rl.close();
  }
}

// Start the demo if this file is run directly
if (require.main === module) {
  const demo = new InteractiveDemo();
  demo.start();
}

module.exports = { InteractiveDemo };
