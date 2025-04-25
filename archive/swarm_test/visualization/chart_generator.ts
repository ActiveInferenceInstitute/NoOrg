import fs from 'fs-extra';
import path from 'path';
import puppeteer from 'puppeteer';
import { TEST_PATHS } from '../test_config';
import { HanoiVisualizer } from './hanoi_visualizer';

interface ChartConfig {
  title: string;
  type: 'line' | 'bar' | 'scatter' | 'pie' | 'heatmap';
  data: any;
  layout?: any;
  options?: any;
}

/**
 * Chart Generator for test visualizations
 * Handles generation of various chart types with consistent styling and error handling
 */
export class ChartGenerator {
  private static readonly DEFAULT_WIDTH = 800;
  private static readonly DEFAULT_HEIGHT = 600;
  private static readonly CHART_COLORS = {
    success: '#28a745',
    failure: '#dc3545',
    warning: '#ffc107',
    info: '#17a2b8'
  };

  /**
   * Generate a chart and save as HTML and PNG
   */
  static async generateChart(name: string, config: ChartConfig): Promise<void> {
    try {
      const html = this.generateChartHtml(config);
      const basePath = path.join(TEST_PATHS.visualizations, name);
      
      // Save HTML
      await fs.writeFile(`${basePath}.html`, html);
      
      // Generate PNG
      await this.generateChartPng(`${basePath}.html`, `${basePath}.png`);
    } catch (error) {
      console.warn(`Failed to generate chart ${name}:`, error);
      await this.generateFallbackChart(name, config);
    }
  }

  /**
   * Generate multiple charts for a test case
   */
  static async generateTestCharts(testName: string, metrics: Map<string, any[]>): Promise<void> {
    console.log(`Generating charts for ${testName} with metrics:`, 
      Object.fromEntries(metrics.entries()));

    const charts: ChartConfig[] = [
      {
        title: 'Task Duration Distribution',
        type: 'scatter',
        data: this.transformDurationData(metrics.get('taskDuration')),
        layout: {
          title: {
            text: 'Task Duration Distribution',
            font: { size: 24 }
          },
          xaxis: { 
            title: 'Time (ms)', 
            showgrid: true,
            gridcolor: '#eee'
          },
          yaxis: { 
            title: 'Duration (ms)', 
            showgrid: true,
            gridcolor: '#eee'
          },
          plot_bgcolor: 'white',
          paper_bgcolor: 'white',
          hovermode: 'closest'
        }
      },
      {
        title: 'Task Success Rate',
        type: 'pie',
        data: this.transformSuccessData([
          ...(metrics.get('taskSuccess') || []),
          ...(metrics.get('taskDuration') || []).map(d => ({
            timestamp: d.timestamp,
            value: { success: d.value.success, value: d.value.success ? 1 : 0 }
          }))
        ]),
        layout: {
          title: {
            text: 'Task Success Rate',
            font: { size: 24 }
          },
          showlegend: true,
          plot_bgcolor: 'white',
          paper_bgcolor: 'white'
        }
      },
      {
        title: 'Resource Utilization',
        type: 'heatmap',
        data: this.transformResourceData(metrics.get('resourceUtilization')),
        layout: {
          title: {
            text: 'Resource Utilization by Agent',
            font: { size: 24 }
          },
          xaxis: { 
            title: 'Resource Type',
            showgrid: true,
            gridcolor: '#eee'
          },
          yaxis: { 
            title: 'Agent ID',
            showgrid: true,
            gridcolor: '#eee'
          },
          plot_bgcolor: 'white',
          paper_bgcolor: 'white'
        }
      },
      {
        title: 'Task Distribution',
        type: 'bar',
        data: this.transformDistributionData([
          ...(metrics.get('taskDistribution') || []),
          ...(metrics.get('taskDuration') || []).map(d => ({
            timestamp: d.timestamp,
            value: {
              agentId: d.value.agentId,
              success: d.value.success,
              tasks: 1
            }
          }))
        ]),
        layout: {
          title: {
            text: 'Task Distribution by Agent',
            font: { size: 24 }
          },
          xaxis: { 
            title: 'Agent ID',
            showgrid: true,
            gridcolor: '#eee'
          },
          yaxis: { 
            title: 'Tasks',
            showgrid: true,
            gridcolor: '#eee'
          },
          barmode: 'stack',
          plot_bgcolor: 'white',
          paper_bgcolor: 'white'
        }
      }
    ];

    for (const chart of charts) {
      console.log(`Generating chart ${chart.title} with data:`, chart.data);
      await this.generateChart(`${testName}_${chart.title.toLowerCase().replace(/\s+/g, '_')}`, chart);
    }
  }

  /**
   * Generate a fallback chart when data is invalid
   */
  private static async generateFallbackChart(name: string, config: ChartConfig): Promise<void> {
    const fallbackConfig: ChartConfig = {
      ...config,
      data: this.getFallbackData(config.type),
      layout: {
        ...config.layout,
        title: {
          text: `${config.title} (No Data)`,
          font: { size: 24 }
        },
        annotations: [{
          text: 'No valid data available',
          showarrow: false,
          font: { size: 16 },
          xref: 'paper',
          yref: 'paper',
          x: 0.5,
          y: 0.5
        }],
        plot_bgcolor: 'white',
        paper_bgcolor: 'white'
      }
    };

    const html = this.generateChartHtml(fallbackConfig);
    const basePath = path.join(TEST_PATHS.visualizations, name);
    await fs.writeFile(`${basePath}.html`, html);
  }

  /**
   * Generate PNG version of chart
   */
  private static async generateChartPng(htmlPath: string, pngPath: string): Promise<void> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
      const page = await browser.newPage();
      await page.setViewport({ 
        width: this.DEFAULT_WIDTH, 
        height: this.DEFAULT_HEIGHT 
      });
      
      await page.goto(`file://${path.resolve(htmlPath)}`);
      await page.waitForFunction(() => {
        const plot = document.querySelector('#chart');
        return plot && plot.children.length > 0;
      });
      
      await page.screenshot({
        path: pngPath,
        clip: { 
          x: 0, 
          y: 0, 
          width: this.DEFAULT_WIDTH, 
          height: this.DEFAULT_HEIGHT 
        }
      });
    } finally {
      await browser.close();
    }
  }

  /**
   * Generate HTML for chart
   */
  private static generateChartHtml(config: ChartConfig): string {
    const { title, type, data, layout, options } = config;
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
          <style>
            body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
            #chart { width: ${this.DEFAULT_WIDTH}px; height: ${this.DEFAULT_HEIGHT}px; }
            .error { color: #dc3545; text-align: center; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div id="chart"></div>
          <script>
            const data = ${JSON.stringify(data)};
            const layout = ${JSON.stringify({
              title,
              width: this.DEFAULT_WIDTH,
              height: this.DEFAULT_HEIGHT,
              margin: { t: 50, l: 50, r: 50, b: 50 },
              showlegend: true,
              barmode: type === 'bar' ? 'stack' : undefined,
              ...layout
            })};
            const config = ${JSON.stringify({
              responsive: true,
              displayModeBar: true,
              displaylogo: false,
              ...options
            })};
            
            Plotly.newPlot('chart', data, layout, config).catch(error => {
              document.getElementById('chart').innerHTML = \`
                <div class="error">
                  <h3>Failed to generate chart</h3>
                  <p>\${error.message}</p>
                </div>
              \`;
            });
          </script>
        </body>
      </html>
    `;
  }

  /**
   * Transform duration data for visualization
   */
  private static transformDurationData(data: any[] = []): any {
    console.log('Transforming duration data:', data);
    
    if (!data || data.length === 0) {
        console.log('No duration data available');
        return this.getFallbackData('scatter');
    }
    
    try {
        // Group by task ID and sort by timestamp
        const taskGroups = new Map<string, { x: number[]; y: number[]; }>();
        
        data.sort((a, b) => a.timestamp - b.timestamp)
            .forEach(d => {
            if (!d.value || !d.value.taskId || typeof d.value.duration !== 'number') {
                console.warn('Invalid duration data point:', d);
                return;
            }
            
            const taskId = d.value.taskId;
            if (!taskGroups.has(taskId)) {
                taskGroups.set(taskId, { x: [], y: [] });
            }
            const group = taskGroups.get(taskId)!;
            group.x.push(d.timestamp);
            group.y.push(d.value.duration);
        });

        if (taskGroups.size === 0) {
            console.log('No valid task groups found');
            return this.getFallbackData('scatter');
        }

        // Create a moving average line
        const allDurations = data.map(d => d.value.duration);
        const movingAvg = this.calculateMovingAverage(allDurations, 5);
        const avgTrace = {
            x: data.map(d => d.timestamp),
            y: movingAvg,
            mode: 'lines',
            type: 'scatter',
            name: 'Moving Average',
            line: {
                color: '#dc3545',
                width: 2,
                dash: 'dot'
            }
        };

        return [
            ...Array.from(taskGroups.entries()).map(([taskId, group]) => ({
                x: group.x,
                y: group.y,
                mode: 'markers',
                type: 'scatter',
                name: `Task ${taskId}`,
                marker: {
                    color: this.CHART_COLORS.info,
                    size: 8
                }
            })),
            avgTrace
        ];
    } catch (error) {
        console.error('Error transforming duration data:', error);
        return this.getFallbackData('scatter');
    }
  }

  /**
   * Calculate moving average
   */
  private static calculateMovingAverage(data: number[], window: number): number[] {
    const result = [];
    for (let i = 0; i < data.length; i++) {
        const start = Math.max(0, i - Math.floor(window / 2));
        const end = Math.min(data.length, i + Math.ceil(window / 2));
        const sum = data.slice(start, end).reduce((a, b) => a + b, 0);
        result.push(sum / (end - start));
    }
    return result;
  }

  /**
   * Transform success rate data for visualization
   */
  private static transformSuccessData(data: any[] = []): any {
    console.log('Transforming success data:', data);
    
    if (!data || data.length === 0) {
        console.log('No success data available');
        return this.getFallbackData('pie');
    }
    
    try {
        const successful = data.filter(d => d.value && d.value.success).length;
        const failed = data.length - successful;
        
        console.log(`Success rate: ${successful}/${data.length} tasks`);
        
        if (successful === 0 && failed === 0) {
            return this.getFallbackData('pie');
        }
        
        return [{
            values: [successful, failed],
            labels: ['Success', 'Failed'],
            type: 'pie',
            marker: {
                colors: [this.CHART_COLORS.success, this.CHART_COLORS.failure]
            },
            textinfo: 'label+percent',
            hoverinfo: 'label+value',
            hole: 0.4
        }];
    } catch (error) {
        console.error('Error transforming success data:', error);
        return this.getFallbackData('pie');
    }
  }

  /**
   * Transform resource utilization data for visualization
   */
  private static transformResourceData(data: any[] = []): any {
    console.log('Transforming resource data:', data);
    
    if (!data || data.length === 0) {
        console.log('No resource data available');
        return this.getFallbackData('heatmap');
    }
    
    try {
        // Group by agent ID and get latest data point for each
        const agentData = new Map<string, any>();
        data.forEach(d => {
            if (!d.value || !d.value.agentId || 
                typeof d.value.cpu !== 'number' || 
                typeof d.value.memory !== 'number' || 
                typeof d.value.storage !== 'number') {
                console.warn('Invalid resource data point:', d);
                return;
            }
            
            const agentId = d.value.agentId;
            if (!agentData.has(agentId) || agentData.get(agentId).timestamp < d.timestamp) {
                agentData.set(agentId, {
                    timestamp: d.timestamp,
                    ...d.value
                });
            }
        });
        
        if (agentData.size === 0) {
            console.log('No valid resource data found');
            return this.getFallbackData('heatmap');
        }

        const agents = Array.from(agentData.keys()).sort();
        const resources = ['CPU', 'Memory', 'Storage'];
        
        const z = agents.map(agent => {
            const data = agentData.get(agent);
            return [
                data.cpu,
                data.memory,
                data.storage
            ];
        });

        // Create text matrix for hover information
        const text = agents.map(agent => {
            const data = agentData.get(agent);
            return [
                `CPU: ${data.cpu.toFixed(1)}%`,
                `Memory: ${data.memory.toFixed(1)}%`,
                `Storage: ${data.storage.toFixed(1)}%`
            ];
        });
        
        return [{
            z,
            x: resources,
            y: agents,
            type: 'heatmap',
            colorscale: [
                [0, '#f8f9fa'],      // Light gray for 0%
                [0.25, '#d1ecf1'],   // Light blue for 25%
                [0.5, '#17a2b8'],    // Medium blue for 50%
                [0.75, '#0056b3'],   // Dark blue for 75%
                [1, '#003380']       // Very dark blue for 100%
            ],
            showscale: true,
            hoverongaps: false,
            text,
            hovertemplate: 'Agent: %{y}<br>Resource: %{x}<br>%{text}<extra></extra>',
            colorbar: {
                title: 'Utilization %',
                tickformat: '.0%',
                tickmode: 'array',
                tickvals: [0, 0.25, 0.5, 0.75, 1],
                ticktext: ['0%', '25%', '50%', '75%', '100%']
            }
        }];
    } catch (error) {
        console.error('Error transforming resource data:', error);
        return this.getFallbackData('heatmap');
    }
  }

  /**
   * Transform task distribution data for visualization
   */
  private static transformDistributionData(data: any[] = []): any {
    console.log('Transforming distribution data:', data);
    
    if (!data || data.length === 0) {
        console.log('No distribution data available');
        return this.getFallbackData('bar');
    }
    
    try {
        // Count tasks per agent and their success/failure
        const agentStats = new Map<string, { total: number; success: number; }>();
        data.forEach(d => {
            if (!d.value || !d.value.agentId || typeof d.value.success !== 'boolean') {
                console.warn('Invalid distribution data point:', d);
                return;
            }
            
            const agentId = d.value.agentId;
            if (!agentStats.has(agentId)) {
                agentStats.set(agentId, { total: 0, success: 0 });
            }
            const stats = agentStats.get(agentId)!;
            stats.total++;
            if (d.value.success) stats.success++;
        });
        
        if (agentStats.size === 0) {
            console.log('No valid distribution data found');
            return this.getFallbackData('bar');
        }

        const agents = Array.from(agentStats.keys());
        
        return [
            {
                x: agents,
                y: agents.map(id => agentStats.get(id)!.success),
                type: 'bar',
                name: 'Successful Tasks',
                marker: { color: this.CHART_COLORS.success }
            },
            {
                x: agents,
                y: agents.map(id => agentStats.get(id)!.total - agentStats.get(id)!.success),
                type: 'bar',
                name: 'Failed Tasks',
                marker: { color: this.CHART_COLORS.failure }
            }
        ];
    } catch (error) {
        console.error('Error transforming distribution data:', error);
        return this.getFallbackData('bar');
    }
  }

  /**
   * Get fallback data for different chart types
   */
  private static getFallbackData(type: string): any {
    switch (type) {
      case 'scatter':
      case 'line':
        return [{
          x: [0],
          y: [0],
          type: 'scatter',
          name: 'No Data'
        }];
      
      case 'bar':
        return [{
          x: ['No Data'],
          y: [0],
          type: 'bar'
        }];
      
      case 'pie':
        return [{
          values: [1],
          labels: ['No Data'],
          type: 'pie'
        }];
      
      case 'heatmap':
        return [{
          z: [[0]],
          x: ['No Data'],
          y: ['No Data'],
          type: 'heatmap'
        }];
      
      default:
        return [{
          x: [0],
          y: [0],
          type: 'scatter',
          name: 'No Data'
        }];
    }
  }

  /**
   * Generate task-specific visualizations
   */
  static async generateTaskVisualizations(testName: string, metrics: Map<string, any[]>): Promise<void> {
    // Generate Hanoi visualization if available
    const hanoiStates = metrics.get('hanoiStates');
    if (hanoiStates && hanoiStates.length > 0) {
      await HanoiVisualizer.generateVisualization(
        hanoiStates.map(m => m.value),
        testName
      );
    }

    // Generate other task-specific visualizations...
  }
} 