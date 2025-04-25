import fs from 'fs-extra';
import path from 'path';
import puppeteer from 'puppeteer';
import type { Page } from 'puppeteer';
import {
  SwarmAgent,
  SwarmTask,
  AgentCapability,
  SwarmTemplate
} from '../types/swarm';
import { TEST_PATHS } from './test_config';
import { TaskVisualizationCollector } from './task_generators';
import { 
  SwarmAgent as Agent,
  SwarmTask as Task,
  ResourceAllocation,
  AgentCapability as Capability,
  SwarmResult as TaskResult
} from '../types/swarm';
import { v4 as uuidv4 } from 'uuid';

interface ChartLayout {
  title: string;
  showlegend: boolean;
  margin: { t: number; l: number; r: number; b: number; };
  width: number;
  height: number;
  xaxis: {
    title?: string;
    showgrid: boolean;
    zeroline: boolean;
    showticklabels: boolean;
    type?: string;
  };
  yaxis: {
    title?: string;
    showgrid: boolean;
    zeroline: boolean;
    showticklabels: boolean;
    range?: [number, number];
  };
  bargap?: number;
  bargroupgap?: number;
}

interface NetworkEdge {
  source: string;
  target: string;
}

interface MetricValue {
  taskId?: string;
  duration?: number;
  value?: number;
  metrics?: {
    duration: number;
    resourceUsage?: {
      cpu: number;
      memory: number;
    };
  };
  success?: boolean;
  agentId?: string;
  tasks?: number;
  total?: number;
  cpu?: number;
  memory?: number;
  storage?: number;
  agents?: Array<{
    agentId: string;
    status: string;
    tasks: number;
    resources: any;
  }>;
}

interface MetricDataPoint {
  timestamp: number;
  value: MetricValue;
}

interface ChartDataPoint {
  x: number | string;
  y: number;
  text?: string;
}

/**
 * Test data generator utilities
 */
export class TestDataGenerator {
  /**
   * Generate a specified number of test agents with basic capabilities
   */
  static generateTestAgents(count: number): Agent[] {
    const agents: Agent[] = [];
    
    for (let i = 0; i < count; i++) {
      const agentId = `agent-${uuidv4()}`;
      const agent: Agent = {
        id: agentId,
        type: 'test',
        status: 'idle',
        capabilities: this.generateBasicCapabilities(),
        resources: this.generateBasicResources(),
        executeTask: async (task: Task) => {
          // Simulate task execution with success rate
          await new Promise(resolve => setTimeout(resolve, this.generateDelay(100, 500)));
          const success = Math.random() > 0.1; // 90% success rate
          
          return {
            success,
            results: [{
              agentId,
              result: {
                success,
                data: success ? `Executed task ${task.id}` : undefined,
                error: success ? undefined : new Error('Task execution failed')
              }
            }],
            errors: success ? [] : [{
              agentId,
              message: 'Task execution failed'
            }]
          };
        }
      };
      
      agents.push(agent);
    }
    
    return agents;
  }

  /**
   * Generate a specified number of test tasks with basic requirements
   */
  static generateTestTasks(count: number): Task[] {
    const tasks: Task[] = [];
    const priorities = ['low', 'medium', 'high'] as const;
    
    for (let i = 0; i < count; i++) {
      const task: Task = {
        id: `task-${uuidv4()}`,
        type: 'test',
        priority: priorities[i % priorities.length],
        status: 'pending',
        requiredCapabilities: this.generateBasicCapabilities(),
        resourceRequirements: {
          cpu: 1,
          memory: 512,
          storage: 64
        },
        divisible: false,
        size: 1
      };
      
      tasks.push(task);
    }
    
    return tasks;
  }

  /**
   * Generate basic capabilities for testing
   */
  private static generateBasicCapabilities(): Capability[] {
    return [
      {
        type: 'compute',
        level: 2  // Minimum level 2 as required by test templates
      },
      {
        type: 'storage',
        level: 2  // Increased to ensure qualification
      },
      {
        type: 'network',
        level: 2  // Increased to ensure qualification
      }
    ];
  }

  /**
   * Generate basic resource requirements for testing
   */
  private static generateBasicResources(): { total: ResourceAllocation; available: ResourceAllocation; reserved: ResourceAllocation } {
    const total: ResourceAllocation = {
      cpu: 8,        // Increased to meet requirements
      memory: 16384, // Increased to 16GB
      storage: 1024  // Increased to 1GB
    };

    const reserved: ResourceAllocation = {
      cpu: 1,
      memory: 1024,
      storage: 64
    };

    const available: ResourceAllocation = {
      cpu: total.cpu - reserved.cpu,
      memory: total.memory - reserved.memory,
      storage: total.storage - reserved.storage
    };

    return {
      total,
      available,
      reserved
    };
  }

  /**
   * Generate random delay between min and max milliseconds
   */
  static generateDelay(min: number = 100, max: number = 1000): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  /**
   * Generate a random success rate between 0 and 1
   */
  static generateSuccessRate(): number {
    return Math.random();
  }

  /**
   * Generate random metrics for testing
   */
  static generateTestMetrics() {
    return {
      taskDuration: Math.floor(Math.random() * 1000),
      resourceUtilization: {
        cpu: Math.random(),
        memory: Math.random(),
        storage: Math.random()
      },
      successRate: this.generateSuccessRate(),
      timestamp: Date.now()
    };
  }

  /**
   * Generate test templates
   */
  static generateTestTemplate(id: string, name: string): SwarmTemplate {
    return {
      id,
      name,
      version: '1.0.0',
      requirements: {
        minAgents: 3,
        capabilities: [
          { type: 'compute', level: 2 },
          { type: 'storage', level: 1 },
          { type: 'network', level: 1 }
        ],
        resources: {
          cpu: 2,
          memory: 2048,
          storage: 128
        }
      },
      coordinationStrategy: {
        mode: 'collaborative',
        communicationPatterns: ['broadcast', 'p2p'],
        decisionMaking: {
          strategy: 'consensus',
          parameters: {
            threshold: 0.7,
            timeout: 5000
          }
        }
      }
    };
  }
}

/**
 * Test execution utilities
 */
export class TestExecutionUtils {
  /**
   * Initialize test directories
   */
  static async initializeTestDirectories(): Promise<void> {
    await Promise.all(
      Object.values(TEST_PATHS).map(dir => fs.ensureDir(dir))
    );
  }

  /**
   * Clean directory contents
   */
  static async cleanDirectory(dir: string): Promise<void> {
    try {
      await fs.emptyDir(dir);
    } catch (error) {
      console.error(`Failed to clean directory ${dir}:`, error);
    }
  }

  /**
   * Create test logger
   */
  static createTestLogger(testName: string) {
    const logFile = path.join(TEST_PATHS.logs, `${testName}.log`);
    
    return {
      info: (message: string) => this.log(logFile, 'INFO', message),
      error: (message: string) => this.log(logFile, 'ERROR', message),
      debug: (message: string) => this.log(logFile, 'DEBUG', message),
      warn: (message: string) => this.log(logFile, 'WARN', message)
    };
  }

  /**
   * Save test results
   */
  static async saveTestResults(testName: string, results: any): Promise<void> {
    const resultsFile = path.join(TEST_PATHS.results, `${testName}.json`);
    await fs.writeJson(resultsFile, results, { spaces: 2 });
  }

  /**
   * Save test visualization
   */
  static async saveVisualization(testName: string, data: string): Promise<void> {
    const visualFile = path.join(TEST_PATHS.visualizations, `${testName}.html`);
    await fs.writeFile(visualFile, data);
  }

  /**
   * Log message to file
   */
  private static async log(file: string, level: string, message: string): Promise<void> {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp} [${level}] ${message}\n`;
    await fs.appendFile(file, logMessage);
  }
}

/**
 * Test metrics collector
 */
export class TestMetricsCollector {
  private metrics: Map<string, any[]>;
  private startTime: number;

  constructor() {
    this.metrics = new Map();
    this.startTime = Date.now();
  }

  /**
   * Record metric
   */
  recordMetric(name: string, value: any): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    // Add timestamp to metric
    const metricPoint = {
      timestamp: Date.now() - this.startTime,
      value: value
    };
    
    this.metrics.get(name)?.push(metricPoint);
  }

  /**
   * Get metric by name
   */
  get(name: string): any[] {
    return Array.from(this.metrics.get(name) || []);
  }

  /**
   * Get all metrics
   */
  getMetrics(): Map<string, any[]> {
    // Convert all metric values to arrays
    const formattedMetrics = new Map<string, any[]>();
    this.metrics.forEach((values, name) => {
      formattedMetrics.set(name, Array.from(values));
    });
    return formattedMetrics;
  }

  /**
   * Calculate statistics
   */
  calculateStatistics(): Record<string, any> {
    const stats: Record<string, any> = {};
    
    this.metrics.forEach((values, name) => {
      // Extract numeric values from metric data
      const numericValues = values
        .map(v => {
          if (typeof v.value === 'number') return v.value;
          if (typeof v.value.duration === 'number') return v.value.duration;
          if (typeof v.value.value === 'number') return v.value.value;
          if (typeof v.value.tasks === 'number') return v.value.tasks;
          if (typeof v.value.cpu === 'number') return v.value.cpu;
          return NaN;
        })
        .filter(v => !isNaN(v));
      
      if (numericValues.length > 0) {
        stats[name] = {
          min: Math.min(...numericValues),
          max: Math.max(...numericValues),
          avg: numericValues.reduce((a, b) => a + b, 0) / numericValues.length,
          count: values.length
        };
      }
    });
    
    return stats;
  }
}

/**
 * Test visualization utilities
 */
export class TestVisualization {
  /**
   * Validate visualization data
   */
  private static validateVisualizationData(data: any, chartType: string): boolean {
    if (!data || (Array.isArray(data) && data.length === 0)) {
      console.warn(`Empty data for chart type: ${chartType}`);
      return false;
    }

    let isValid = false;
    switch (chartType) {
      case 'scatter':
      case 'line':
        isValid = Array.isArray(data) && data.some(d => d.x !== undefined && d.y !== undefined);
        break;

      case 'bar':
        isValid = Array.isArray(data) && data.some(d => d.x !== undefined && d.y !== undefined);
        break;

      case 'pie':
        isValid = data.values?.length > 0 && data.labels?.length > 0;
        break;

      case 'heatmap':
        isValid = data.z?.length > 0 && data.x?.length > 0 && data.y?.length > 0;
        break;

      case 'network':
        isValid = Array.isArray(data) && data.some(d => d.source !== undefined && Array.isArray(d.targets));
        break;

      default:
        isValid = true;
    }

    if (!isValid) {
      console.warn(`Invalid data format for chart type: ${chartType}`);
      console.warn('Data:', JSON.stringify(data, null, 2));
    }

    return isValid;
  }

  /**
   * Transform metrics data for visualization
   */
  private static transformMetricsData(data: any, chartType: string): any {
    if (!data) return [];

    // Ensure data is an array for array operations
    const ensureArray = (d: any) => Array.isArray(d) ? d : [d];

    // Extract value from complex objects
    const getValue = (obj: any): number => {
      if (typeof obj === 'number') return obj;
      if (typeof obj === 'object' && obj !== null) {
        // Handle direct value property
        if (obj.value !== undefined) return Number(obj.value);
        if (obj.duration !== undefined) return Number(obj.duration);
        if (obj.success !== undefined) return Number(obj.success);
        if (obj.tasks !== undefined) return Number(obj.tasks);
        
        // Handle nested metrics
        if (obj.metrics?.duration !== undefined) return Number(obj.metrics.duration);
        
        // Try to find any numeric value in the object
        for (const key in obj) {
          if (typeof obj[key] === 'number') return obj[key];
        }
      }
      return 0;
    };

    // Handle different chart types
    switch (chartType) {
      case 'scatter':
      case 'line':
        return ensureArray(data).map((d: any) => ({
          x: d.timestamp || 0,
          y: getValue(d.value),
          text: d.value.taskId ? `Task: ${d.value.taskId}` : undefined
        })).filter(d => d.y !== undefined && d.y !== null && d.y !== 0);

      case 'bar':
        // Special handling for task distribution
        if (data.some((d: any) => d.value?.agentId)) {
          const agentTaskMap = new Map();
          ensureArray(data).forEach((d: any) => {
            const agentId = d.value.agentId;
            const tasks = d.value.tasks || d.value.value || 0;
            if (agentId && tasks > 0) {
              agentTaskMap.set(agentId, {
                x: agentId,
                y: tasks,
                text: `Agent: ${agentId}, Tasks: ${tasks}`
              });
            }
          });
          const result = Array.from(agentTaskMap.values());
          return result.length > 0 ? result.sort((a, b) => a.x.localeCompare(b.x)) : [{ x: 'No Data', y: 0 }];
        }
        
        // Default bar chart handling
        const barData = ensureArray(data).map((d: any) => ({
          x: d.value.agentId || d.value.taskId || '',
          y: getValue(d.value),
          text: d.value.agentId ? `Agent: ${d.value.agentId}` : undefined
        })).filter(d => d.x && d.y !== undefined && d.y !== null);
        return barData.length > 0 ? barData : [{ x: 'No Data', y: 0 }];

      case 'pie':
        if (Array.isArray(data)) {
          const successCount = data.filter(d => getValue(d.value) === 1).length;
          const failureCount = data.filter(d => getValue(d.value) === 0).length;
          return {
            values: [successCount, failureCount],
            labels: ['Success', 'Failed']
          };
        }
        return { values: [1], labels: ['No Data'] };

      case 'heatmap':
        const heatmapData = ensureArray(data);
        if (heatmapData.length === 0) return { z: [[0]], x: ['No Data'], y: ['No Data'] };

        const agents = Array.from(new Set(heatmapData.map((d: any) => d.value.agentId))).filter(Boolean);
        const resources = ['CPU', 'Memory', 'Storage'];
        
        const z = agents.map(agent => {
          const agentData = heatmapData.find((d: any) => d.value.agentId === agent);
          return [
            getValue(agentData?.value?.cpu),
            getValue(agentData?.value?.memory),
            getValue(agentData?.value?.storage)
          ];
        });

        return {
          z: z.length > 0 ? z : [[0]],
          x: resources,
          y: agents.length > 0 ? agents : ['No Data'],
          type: 'heatmap',
          colorscale: 'Viridis'
        };

      case 'network':
        const networkData = ensureArray(data);
        const nodes = networkData.map((d: any) => ({
          source: d.value.source || '',
          targets: Array.isArray(d.value.targets) ? d.value.targets : []
        })).filter(d => d.source && d.targets.length > 0);

        return nodes.length > 0 ? nodes : [{ source: 'No Data', targets: [] }];

      default:
        return ensureArray(data);
    }
  }

  /**
   * Generate performance charts
   */
  static async generatePerformanceCharts(metrics: any, testName: string): Promise<void> {
    const charts = [
      {
        name: 'task_duration',
        title: 'Task Duration Distribution',
        data: this.transformMetricsData(metrics.get('taskDuration'), 'scatter'),
        type: 'scatter',
        mode: 'lines+markers'
      },
      {
        name: 'success_rate',
        title: 'Task Success Rate',
        data: this.transformMetricsData(metrics.get('taskSuccess'), 'pie'),
        type: 'pie'
      },
      {
        name: 'agent_performance',
        title: 'Agent Performance',
        data: this.transformMetricsData(metrics.get('resourceUtilization'), 'bar'),
        type: 'bar'
      }
    ];

    // Add task distribution chart
    const taskDistData = this.transformMetricsData(metrics.get('taskDistribution'), 'bar');
    if (taskDistData.length > 0 && taskDistData[0].x !== 'No Data') {
      charts.push({
        name: 'task_distribution',
        title: 'Task Distribution Across Agents',
        data: taskDistData,
        type: 'bar'
      });
    }

    // Generate each chart
    for (const chart of charts) {
      if (!chart.data || (Array.isArray(chart.data) && chart.data.length === 0)) {
        console.warn(`No data for chart: ${chart.name}`);
        continue;
      }

      const chartPath = path.join(TEST_PATHS.visualizations, `${testName}_${chart.name}.html`);
      await this.generateChart(chartPath, chart);
    }
  }

  /**
   * Generate swarm metrics charts
   */
  static async generateSwarmMetricsCharts(metrics: any, testName: string): Promise<void> {
    const charts = [
      {
        name: 'swarm_size',
        title: 'Swarm Size Over Time',
        data: (metrics.get('swarmSize') || []).map((d: MetricDataPoint) => ({
          x: d.timestamp,
          y: d.value.value || d.value.total || 0,
          text: `Total: ${d.value.total}, Active: ${d.value.value}`
        })).filter((d: ChartDataPoint) => d.y > 0),
        type: 'scatter',
        mode: 'lines'
      },
      {
        name: 'task_distribution',
        title: 'Task Distribution Across Agents',
        data: (() => {
          const taskData = metrics.get('taskDistribution') || [];
          // Group by agentId and get the latest count for each agent
          const agentTaskMap = new Map();
          taskData.forEach((d: MetricDataPoint) => {
            if (d.value.agentId) {
              agentTaskMap.set(d.value.agentId, {
                x: d.value.agentId,
                y: d.value.tasks || d.value.value || 0,
                text: `Agent: ${d.value.agentId}, Tasks: ${d.value.tasks || d.value.value || 0}`
              });
            }
          });
          const result = Array.from(agentTaskMap.values());
          return result.length > 0 ? result : [{ x: 'No Data', y: 0 }];
        })(),
        type: 'bar'
      }
    ];

    for (const chart of charts) {
      const chartPath = path.join(TEST_PATHS.visualizations, `${testName}_${chart.name}.html`);
      await this.generateChart(chartPath, chart);
    }
  }

  /**
   * Generate fault tolerance charts
   */
  static async generateFaultToleranceCharts(metrics: any, testName: string): Promise<void> {
    const charts = [
      {
        name: 'failure_impact',
        title: 'Failure Impact Analysis',
        data: metrics.failureImpact || [],
        type: 'scatter'
      },
      {
        name: 'recovery_time',
        title: 'Recovery Time Distribution',
        data: metrics.recoveryTime || [],
        type: 'box'
      },
      {
        name: 'redundancy_effectiveness',
        title: 'Redundancy Effectiveness',
        data: metrics.redundancyEffectiveness || [],
        type: 'bar'
      }
    ];

    for (const chart of charts) {
      const chartPath = path.join(TEST_PATHS.visualizations, `${testName}_${chart.name}.html`);
      await this.generateChart(chartPath, chart);
    }
  }

  /**
   * Generate scalability charts
   */
  static async generateScalabilityCharts(metrics: any, testName: string): Promise<void> {
    const charts = [
      {
        name: 'throughput',
        title: 'System Throughput',
        data: metrics.throughput || [],
        type: 'line'
      },
      {
        name: 'latency',
        title: 'Latency Distribution',
        data: metrics.latency || [],
        type: 'violin'
      },
      {
        name: 'resource_scaling',
        title: 'Resource Scaling Efficiency',
        data: metrics.resourceScaling || [],
        type: 'scatter'
      }
    ];

    for (const chart of charts) {
      const chartPath = path.join(TEST_PATHS.visualizations, `${testName}_${chart.name}.html`);
      await this.generateChart(chartPath, chart);
    }
  }

  /**
   * Generate a single chart
   */
  private static async generateChart(filePath: string, chart: any): Promise<void> {
    console.log(`Generating chart: ${chart.title}`);
    
    // Transform data before validation
    const transformedData = this.transformMetricsData(chart.data, chart.type);
    console.log('Transformed chart data:', JSON.stringify(transformedData, null, 2));
    
    // Validate data before processing
    if (!this.validateVisualizationData(transformedData, chart.type)) {
      console.warn(`Invalid or empty data for chart: ${chart.title}`);
      return;
    }

    let plotData;
    let layout;

    switch (chart.type) {
      case 'scatter':
      case 'line':
        plotData = [{
          x: transformedData.map((d: any) => d.x),
          y: transformedData.map((d: any) => d.y),
          type: chart.type,
          mode: chart.mode || 'lines',
          name: chart.name
        }];
        break;

      case 'bar':
        plotData = [{
          x: transformedData.map((d: any) => d.x),
          y: transformedData.map((d: any) => d.y),
          type: 'bar',
          name: chart.name || 'Tasks'
        }];
        break;

      case 'pie':
        plotData = [{
          values: transformedData.values,
          labels: transformedData.labels,
          type: 'pie'
        }];
        break;

      case 'heatmap':
        plotData = [{
          z: transformedData.z,
          x: transformedData.x,
          y: transformedData.y,
          type: 'heatmap',
          colorscale: transformedData.colorscale || 'Viridis'
        }];
        break;

      case 'network':
        // Convert to network graph format for plotly
        const nodes = Array.from(new Set(transformedData.flatMap((d: any) => 
          [d.source, ...(d.targets || [])]
        ))).map(id => ({ id, label: String(id) }));
        
        plotData = [{
          type: 'scatter',
          x: nodes.map((_, i) => Math.cos(2 * Math.PI * i / nodes.length)),
          y: nodes.map((_, i) => Math.sin(2 * Math.PI * i / nodes.length)),
          mode: 'markers+text',
          text: nodes.map(n => n.label),
          marker: { size: 20 }
        }];

        // Add edges as lines
        transformedData.forEach((edge: any) => {
          edge.targets.forEach((target: string) => {
            const sourceIdx = nodes.findIndex(n => n.id === edge.source);
            const targetIdx = nodes.findIndex(n => n.id === target);
            
            if (sourceIdx !== -1 && targetIdx !== -1) {
              plotData.push({
                type: 'scatter',
                x: [Math.cos(2 * Math.PI * sourceIdx / nodes.length), Math.cos(2 * Math.PI * targetIdx / nodes.length)],
                y: [Math.sin(2 * Math.PI * sourceIdx / nodes.length), Math.sin(2 * Math.PI * targetIdx / nodes.length)],
                mode: 'lines',
                line: { width: 1 },
                showlegend: false
              });
            }
          });
        });
        break;

      default:
        plotData = [{
          x: transformedData.map((d: any, i: number) => d.x || i),
          y: transformedData.map((d: any) => d.y || d.value),
          type: chart.type
        }];
    }

    layout = {
      title: chart.title,
      showlegend: true,
      margin: { t: 50, l: 50, r: 50, b: 50 },
      width: 800,
      height: 600,
      xaxis: {
        title: this.getAxisTitle(chart, 'x'),
        showgrid: true,
        zeroline: true,
        showticklabels: true,
        ...chart.type === 'network' ? { showgrid: false, zeroline: false, showticklabels: false } : {}
      },
      yaxis: {
        title: this.getAxisTitle(chart, 'y'),
        showgrid: true,
        zeroline: true,
        showticklabels: true,
        ...chart.type === 'network' ? { showgrid: false, zeroline: false, showticklabels: false } : {}
      }
    } as ChartLayout;

    // Add specific layout configurations based on chart type
    switch (chart.type) {
      case 'scatter':
      case 'line':
        if (transformedData[0]?.x > 1000) {
          layout.xaxis.title = 'Time (ms)';
          layout.xaxis.type = 'date';
        }
        break;
      
      case 'bar':
        layout.bargap = 0.1;
        layout.bargroupgap = 0.2;
        break;
      
      case 'heatmap':
        layout.xaxis.title = 'Resource Type';
        layout.yaxis.title = 'Agent ID';
        break;
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${chart.title}</title>
          <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
          <style>
            body { margin: 0; padding: 20px; }
            #chart { width: 800px; height: 600px; }
          </style>
        </head>
        <body>
          <div id="chart"></div>
          <script>
            const data = ${JSON.stringify(plotData)};
            const layout = ${JSON.stringify(layout)};
            Plotly.newPlot('chart', data, layout);
          </script>
        </body>
      </html>
    `;

    // Save HTML file
    await fs.writeFile(filePath, html);

    // Generate PNG
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 800, height: 600 });
    await page.goto(`file://${path.resolve(filePath)}`);
    
    // Wait for plot to render
    await page.waitForFunction(() => {
      const plot = document.querySelector('#chart');
      return plot && plot.children.length > 0;
    });
    
    // Save PNG
    const pngPath = filePath.replace('.html', '.png');
    await page.screenshot({
      path: pngPath,
      clip: { x: 0, y: 0, width: 800, height: 600 }
    });
    
    await browser.close();
  }

  /**
   * Get appropriate axis title based on chart type and data
   */
  private static getAxisTitle(chart: any, axis: 'x' | 'y'): string {
    switch (chart.type) {
      case 'scatter':
        if (axis === 'x') {
          return chart.data[0]?.timestamp ? 'Time (ms)' : 'Sample';
        } else {
          if (chart.data[0]?.cpu !== undefined) return 'Resource Usage (%)';
          if (chart.data[0]?.duration !== undefined) return 'Duration (ms)';
          return 'Value';
        }
      
      case 'bar':
        if (axis === 'x') {
          return chart.data[0]?.agentId !== undefined ? 'Agent ID' : 'Category';
        } else {
          return chart.data[0]?.tasks !== undefined ? 'Number of Tasks' : 'Value';
        }
      
      case 'heatmap':
        return axis === 'x' ? 'Resource Type' : 'Agent ID';
      
      default:
        return axis.toUpperCase();
    }
  }

  /**
   * Generate animated visualization
   */
  private static async generateAnimatedChart(filePath: string, frames: any[], config: any): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${config.title}</title>
          <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
          <style>
            body { margin: 0; padding: 20px; }
            #chart { width: 800px; height: 600px; }
          </style>
        </head>
        <body>
          <div id="chart"></div>
          <script>
            const frames = ${JSON.stringify(frames)};
            const layout = {
              title: '${config.title}',
              showlegend: true,
              margin: { t: 50, l: 50, r: 50, b: 50 },
              width: 800,
              height: 600,
              updatemenus: [{
                type: 'buttons',
                showactive: false,
                buttons: [
                  { label: 'Play', method: 'animate', args: [null, { fromcurrent: true, frame: { duration: ${config.frameDuration || 1000} } }] },
                  { label: 'Pause', method: 'animate', args: [[null], { mode: 'immediate' }] }
                ]
              }]
            };
            
            Plotly.newPlot('chart', frames[0].data, layout)
              .then(() => Plotly.addFrames('chart', frames));
          </script>
        </body>
      </html>
    `;

    // Save HTML file
    await fs.writeFile(filePath, html);

    // Generate PNGs for each frame
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 800, height: 600 });
    await page.goto(`file://${path.resolve(filePath)}`);
    
    // Wait for plot to render
    await page.waitForFunction(() => {
      const plot = document.querySelector('#chart');
      return plot && plot.children.length > 0;
    });
    
    // Save frames as PNGs
    for (let i = 0; i < frames.length; i++) {
      // Update frame
      await page.evaluate((frameIndex: number) => {
        const plotly = (window as any).Plotly;
        return plotly.animate('chart', frameIndex);
      }, i);
      
      // Wait for animation
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Save PNG
      const pngPath = filePath.replace('.html', `_frame${i.toString().padStart(3, '0')}.png`);
      await page.screenshot({
        path: pngPath,
        clip: { x: 0, y: 0, width: 800, height: 600 }
      });
    }
    
    await browser.close();
  }

  /**
   * Generate task-specific visualizations
   */
  static async generateTaskVisualizations(testName: string, metrics: Map<string, any[]>): Promise<void> {
    // Generate Hanoi visualization if available
    const hanoiStates = metrics.get('hanoiStates');
    if (hanoiStates && hanoiStates.length > 0) {
      console.log('Generating Hanoi visualization...');
      const states = hanoiStates.map(m => ({
        disk: m.value.disk,
        from: m.value.from,
        to: m.value.to,
        state: m.value.state
      }));
      
      await import('./visualization/hanoi_visualizer').then(({ HanoiVisualizer }) => {
        return HanoiVisualizer.generateVisualization(states, testName);
      });
    }

    // Generate other task-specific visualizations...
  }
} 