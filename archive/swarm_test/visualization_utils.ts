import type { PlotData, Layout, Config } from 'plotly.js';
import { createCanvas, Canvas, CanvasRenderingContext2D } from 'canvas';
import GIFEncoder from 'gif-encoder-2';
import fs from 'fs-extra';
import path from 'path';
import { TEST_PATHS } from './test_config';

interface ChartOptions {
  title: string;
  xAxis: string;
  yAxis: string;
  type: 'scatter' | 'bar' | 'line' | 'heatmap' | 'box';
  colorScale?: string[];
  animate?: boolean;
  width?: number;
  height?: number;
}

interface AnimationOptions {
  duration: number;
  fps: number;
  loop?: boolean;
  quality?: number;
}

interface ChartConfig {
  data: Partial<PlotData>[];
  layout: Partial<Layout>;
  config: Partial<Config>;
}

/**
 * Enhanced visualization utilities for test metrics and animations
 */
export class VisualizationUtils {
  private canvas: Canvas;
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;

  constructor(width = 800, height = 600) {
    this.width = width;
    this.height = height;
    this.canvas = createCanvas(width, height);
    this.ctx = this.canvas.getContext('2d');
  }

  /**
   * Generate chart configuration
   */
  private generateChartConfig(
    data: any[],
    options: ChartOptions
  ): ChartConfig {
    const config: ChartConfig = {
      data: [{
        x: data.map(d => d.x),
        y: data.map(d => d.y),
        type: options.type,
        mode: options.type === 'scatter' ? 'markers' : undefined,
        marker: {
          color: options.colorScale?.[0] || '#17a2b8',
          size: 8
        }
      }],
      layout: {
        title: options.title,
        width: options.width || this.width,
        height: options.height || this.height,
        xaxis: {
          title: options.xAxis,
          showgrid: true,
          zeroline: true
        },
        yaxis: {
          title: options.yAxis,
          showgrid: true,
          zeroline: true
        },
        showlegend: true,
        margin: { t: 60, r: 30, b: 60, l: 60 }
      },
      config: {
        responsive: true,
        displayModeBar: true
      }
    };

    if (options.animate) {
      config.layout.updatemenus = [{
        type: 'buttons',
        showactive: false,
        buttons: [{
          label: 'Play',
          method: 'animate',
          args: [null, {
            mode: 'immediate',
            fromcurrent: true,
            frame: { duration: 500, redraw: true },
            transition: { duration: 250 }
          }]
        }]
      }];
    }

    return config;
  }

  /**
   * Generate animated GIF
   */
  async generateAnimation(
    frames: any[],
    outputPath: string,
    options: AnimationOptions
  ): Promise<void> {
    const encoder = new GIFEncoder(this.width, this.height);
    const outputStream = fs.createWriteStream(outputPath);

    console.log('Starting GIF generation...');
    console.log('Created canvas and context');
    console.log(`Initializing GIF encoder for path: ${outputPath}`);

    // Initialize encoder
    encoder.createReadStream().pipe(outputStream);
    encoder.start();
    encoder.setFrameRate(options.fps);
    encoder.setQuality(options.quality || 10);
    encoder.setRepeat(options.loop ? 0 : -1);

    console.log('Encoder initialized');
    console.log(`Drawing ${frames.length} frames...`);

    // Draw each frame
    for (let i = 0; i < frames.length; i++) {
      console.log(`Drawing frame ${i + 1}/${frames.length}`);
      
      // Clear canvas
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillRect(0, 0, this.width, this.height);

      // Draw frame
      await this.drawFrame(frames[i]);

      // Add frame to GIF
      console.log('Adding frame to GIF');
      encoder.addFrame(this.ctx as any);
    }

    // Finalize GIF
    console.log('Finalizing GIF...');
    encoder.finish();

    // Get GIF data
    console.log('Getting GIF data...');
    const buffer = await new Promise<Buffer>((resolve) => {
      const chunks: Buffer[] = [];
      encoder.createReadStream()
        .on('data', (chunk) => chunks.push(chunk))
        .on('end', () => resolve(Buffer.concat(chunks)));
    });

    // Write to file
    console.log(`Writing ${buffer.length} bytes to ${outputPath}`);
    await fs.writeFile(outputPath, buffer);
    console.log(`Generated animation GIF: ${outputPath}`);
  }

  /**
   * Draw single animation frame
   */
  private async drawFrame(frame: any): Promise<void> {
    // Clear canvas
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Set drawing styles
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = 2;
    this.ctx.font = '14px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    // Draw frame content
    if (frame.type === 'hanoi') {
      await this.drawHanoiFrame(frame);
    } else if (frame.type === 'network') {
      await this.drawNetworkFrame(frame);
    } else if (frame.type === 'process') {
      await this.drawProcessFrame(frame);
    }
  }

  /**
   * Draw Towers of Hanoi frame
   */
  private async drawHanoiFrame(frame: any): Promise<void> {
    const { pegs, disks } = frame;
    const pegWidth = 10;
    const pegHeight = this.height * 0.6;
    const pegSpacing = this.width / 4;
    const diskHeight = 20;
    const maxDiskWidth = pegSpacing * 0.8;

    // Draw pegs
    pegs.forEach((peg: any[], i: number) => {
      const x = pegSpacing * (i + 1);
      const y = this.height * 0.8;

      // Draw peg base
      this.ctx.fillStyle = '#666666';
      this.ctx.fillRect(x - 50, y, 100, 10);

      // Draw peg
      this.ctx.fillStyle = '#666666';
      this.ctx.fillRect(x - pegWidth/2, y - pegHeight, pegWidth, pegHeight);

      // Draw disks
      peg.forEach((disk: number, j: number) => {
        const diskWidth = (disk / disks.length) * maxDiskWidth;
        const diskY = y - (j + 1) * diskHeight;

        this.ctx.fillStyle = `hsl(${(disk / disks.length) * 360}, 70%, 50%)`;
        this.ctx.fillRect(x - diskWidth/2, diskY, diskWidth, diskHeight - 2);
      });
    });

    // Draw labels
    this.ctx.fillStyle = '#000000';
    pegs.forEach((_: any, i: number) => {
      const x = pegSpacing * (i + 1);
      const y = this.height * 0.9;
      this.ctx.fillText(`Peg ${i + 1}`, x, y);
    });
  }

  /**
   * Draw network visualization frame
   */
  private async drawNetworkFrame(frame: any): Promise<void> {
    const { nodes, edges } = frame;
    const nodeRadius = 20;
    const padding = 50;

    // Calculate node positions
    const positions = new Map();
    nodes.forEach((node: any, i: number) => {
      const angle = (i / nodes.length) * Math.PI * 2;
      const radius = Math.min(this.width, this.height) / 3;
      positions.set(node.id, {
        x: this.width/2 + Math.cos(angle) * radius,
        y: this.height/2 + Math.sin(angle) * radius
      });
    });

    // Draw edges
    this.ctx.strokeStyle = '#999999';
    this.ctx.lineWidth = 1;
    edges.forEach((edge: any) => {
      const start = positions.get(edge.source);
      const end = positions.get(edge.target);
      
      this.ctx.beginPath();
      this.ctx.moveTo(start.x, start.y);
      this.ctx.lineTo(end.x, end.y);
      this.ctx.stroke();
    });

    // Draw nodes
    nodes.forEach((node: any) => {
      const pos = positions.get(node.id);
      
      // Node circle
      this.ctx.fillStyle = node.color || '#17a2b8';
      this.ctx.beginPath();
      this.ctx.arc(pos.x, pos.y, nodeRadius, 0, Math.PI * 2);
      this.ctx.fill();

      // Node label
      this.ctx.fillStyle = '#000000';
      this.ctx.fillText(node.label, pos.x, pos.y);
    });
  }

  /**
   * Draw process visualization frame
   */
  private async drawProcessFrame(frame: any): Promise<void> {
    const { processes, connections } = frame;
    const boxWidth = 120;
    const boxHeight = 60;
    const padding = 20;
    const arrowSize = 10;

    // Calculate process positions
    const positions = new Map();
    const cols = Math.ceil(Math.sqrt(processes.length));
    const rows = Math.ceil(processes.length / cols);
    
    processes.forEach((process: any, i: number) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      positions.set(process.id, {
        x: padding + col * (boxWidth + padding) + boxWidth/2,
        y: padding + row * (boxHeight + padding) + boxHeight/2
      });
    });

    // Draw connections
    this.ctx.strokeStyle = '#999999';
    this.ctx.lineWidth = 1;
    connections.forEach((conn: any) => {
      const start = positions.get(conn.source);
      const end = positions.get(conn.target);
      
      // Draw arrow
      const angle = Math.atan2(end.y - start.y, end.x - start.x);
      this.ctx.beginPath();
      this.ctx.moveTo(start.x, start.y);
      this.ctx.lineTo(end.x, end.y);
      this.ctx.stroke();

      // Arrow head
      this.ctx.beginPath();
      this.ctx.moveTo(end.x, end.y);
      this.ctx.lineTo(
        end.x - arrowSize * Math.cos(angle - Math.PI/6),
        end.y - arrowSize * Math.sin(angle - Math.PI/6)
      );
      this.ctx.lineTo(
        end.x - arrowSize * Math.cos(angle + Math.PI/6),
        end.y - arrowSize * Math.sin(angle + Math.PI/6)
      );
      this.ctx.closePath();
      this.ctx.fill();
    });

    // Draw processes
    processes.forEach((process: any) => {
      const pos = positions.get(process.id);
      
      // Process box
      this.ctx.fillStyle = process.color || '#ffffff';
      this.ctx.strokeStyle = '#000000';
      this.ctx.lineWidth = 2;
      this.ctx.fillRect(
        pos.x - boxWidth/2,
        pos.y - boxHeight/2,
        boxWidth,
        boxHeight
      );
      this.ctx.strokeRect(
        pos.x - boxWidth/2,
        pos.y - boxHeight/2,
        boxWidth,
        boxHeight
      );

      // Process label
      this.ctx.fillStyle = '#000000';
      this.ctx.fillText(process.label, pos.x, pos.y);
    });
  }

  /**
   * Generate static chart
   */
  async generateChart(
    data: any[],
    outputPath: string,
    options: ChartOptions
  ): Promise<void> {
    const config = this.generateChartConfig(data, options);
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${options.title}</title>
          <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
          <style>
            body { margin: 0; padding: 20px; }
            #chart { width: 100%; height: 100%; }
          </style>
        </head>
        <body>
          <div id="chart"></div>
          <script>
            Plotly.newPlot('chart', ${JSON.stringify(config.data)}, ${JSON.stringify(config.layout)}, ${JSON.stringify(config.config)});
          </script>
        </body>
      </html>
    `;

    await fs.writeFile(outputPath, html);
  }

  /**
   * Generate multiple charts in a dashboard
   */
  async generateDashboard(
    charts: { data: any[]; options: ChartOptions }[],
    outputPath: string
  ): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Test Visualization Dashboard</title>
          <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
          <style>
            body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
            .dashboard { display: grid; grid-template-columns: repeat(auto-fit, minmax(600px, 1fr)); gap: 20px; }
            .chart { width: 100%; height: 400px; }
          </style>
        </head>
        <body>
          <h1>Test Visualization Dashboard</h1>
          <div class="dashboard">
            ${charts.map((chart, i) => `
              <div class="chart" id="chart${i}"></div>
              <script>
                Plotly.newPlot(
                  'chart${i}',
                  ${JSON.stringify(this.generateChartConfig(chart.data, chart.options).data)},
                  ${JSON.stringify(this.generateChartConfig(chart.data, chart.options).layout)},
                  ${JSON.stringify(this.generateChartConfig(chart.data, chart.options).config)}
                );
              </script>
            `).join('\n')}
          </div>
        </body>
      </html>
    `;

    await fs.writeFile(outputPath, html);
  }
} 