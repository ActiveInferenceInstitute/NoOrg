import fs from 'fs-extra';
import path from 'path';
import puppeteer from 'puppeteer';
import GIFEncoder from 'gif-encoder-2';
import { createCanvas } from 'canvas';
import { TEST_PATHS } from '../test_config';

interface HanoiState {
  disk: number;
  from: string;
  to: string;
  state: {
    A: number[];
    B: number[];
    C: number[];
  };
}

interface PegPositions {
  [key: string]: number;
}

/**
 * Hanoi Task Visualizer
 * Generates animated visualizations of the Towers of Hanoi solution
 */
export class HanoiVisualizer {
  private static readonly COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1',
    '#96CEB4', '#FFEEAD', '#D4A5A5',
    '#9B59B6', '#3498DB', '#E67E22'
  ];

  private static readonly CONFIG = {
    width: 800,
    height: 600,
    pegWidth: 20,
    pegHeight: 300,
    pegSpacing: 250,
    diskHeight: 30,
    baseHeight: 40,
    frameDelay: 500
  };

  /**
   * Generate visualization of Hanoi solution
   */
  static async generateVisualization(
    states: HanoiState[],
    testName: string
  ): Promise<void> {
    try {
      // Generate HTML visualization
      await this.generateHtmlVisualization(states, testName);
      
      // Generate animated GIF
      await this.generateGifVisualization(states, testName);
      
    } catch (error) {
      console.error('Failed to generate Hanoi visualization:', error);
    }
  }

  /**
   * Generate HTML visualization with animation controls
   */
  private static async generateHtmlVisualization(
    states: HanoiState[],
    testName: string
  ): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Towers of Hanoi Visualization</title>
          <style>
            body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
            #visualization { width: ${this.CONFIG.width}px; height: ${this.CONFIG.height}px; }
            .controls { margin: 20px 0; }
            .step-info { margin: 10px 0; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="controls">
            <button id="prevBtn">Previous</button>
            <button id="playBtn">Play</button>
            <button id="nextBtn">Next</button>
            <span id="stepCounter">Step: 1/${states.length}</span>
          </div>
          <div class="step-info" id="stepInfo"></div>
          <canvas id="visualization" width="${this.CONFIG.width}" height="${this.CONFIG.height}"></canvas>
          <script>
            const states = ${JSON.stringify(states)};
            const config = ${JSON.stringify(this.CONFIG)};
            const colors = ${JSON.stringify(this.COLORS)};
            let currentStep = 0;
            let isPlaying = false;
            let playInterval;

            const canvas = document.getElementById('visualization');
            const ctx = canvas.getContext('2d');
            
            function drawPeg(x, y, label) {
              // Draw base
              ctx.fillStyle = '#34495e';
              ctx.fillRect(
                x - config.pegWidth/2 - 100,
                y + config.pegHeight,
                200,
                config.baseHeight
              );
              
              // Draw peg
              ctx.fillRect(
                x - config.pegWidth/2,
                y,
                config.pegWidth,
                config.pegHeight
              );
              
              // Draw label
              ctx.fillStyle = '#2c3e50';
              ctx.font = '20px Arial';
              ctx.textAlign = 'center';
              ctx.fillText(label, x, y + config.pegHeight + 30);
            }
            
            function drawDisk(x, y, size, index) {
              const width = 40 + size * 30;
              ctx.fillStyle = colors[index % colors.length];
              ctx.beginPath();
              ctx.roundRect(
                x - width/2,
                y,
                width,
                config.diskHeight,
                10
              );
              ctx.fill();
              
              // Draw disk number
              ctx.fillStyle = '#fff';
              ctx.font = '16px Arial';
              ctx.textAlign = 'center';
              ctx.fillText(size.toString(), x, y + 20);
            }
            
            function drawState(state) {
              ctx.clearRect(0, 0, config.width, config.height);
              
              // Draw pegs
              const pegY = 100;
              const pegPositions = {
                'A': config.pegSpacing,
                'B': config.pegSpacing * 2,
                'C': config.pegSpacing * 3
              };
              
              Object.entries(pegPositions).forEach(([peg, x]) => {
                drawPeg(x, pegY, peg);
              });
              
              // Draw disks
              Object.entries(state.state).forEach(([peg, disks]) => {
                const x = pegPositions[peg];
                disks.forEach((disk, i) => {
                  const y = pegY + config.pegHeight - (i + 1) * config.diskHeight;
                  drawDisk(x, y, disk, disk - 1);
                });
              });
              
              // Update step info
              document.getElementById('stepCounter').textContent = 
                \`Step: \${currentStep + 1}/\${states.length}\`;
              document.getElementById('stepInfo').textContent = 
                currentStep > 0 ? 
                \`Moving disk \${state.disk} from \${state.from} to \${state.to}\` :
                'Initial state';
            }
            
            function updateState(step) {
              currentStep = step;
              drawState(states[step]);
            }
            
            function play() {
              if (isPlaying) {
                clearInterval(playInterval);
                playBtn.textContent = 'Play';
                isPlaying = false;
                return;
              }
              
              isPlaying = true;
              playBtn.textContent = 'Pause';
              playInterval = setInterval(() => {
                if (currentStep >= states.length - 1) {
                  clearInterval(playInterval);
                  playBtn.textContent = 'Play';
                  isPlaying = false;
                  return;
                }
                updateState(currentStep + 1);
              }, config.frameDelay);
            }
            
            // Event listeners
            document.getElementById('prevBtn').addEventListener('click', () => {
              if (currentStep > 0) updateState(currentStep - 1);
            });
            
            document.getElementById('nextBtn').addEventListener('click', () => {
              if (currentStep < states.length - 1) updateState(currentStep + 1);
            });
            
            const playBtn = document.getElementById('playBtn');
            playBtn.addEventListener('click', play);
            
            // Initial render
            updateState(0);
          </script>
        </body>
      </html>
    `;

    const htmlPath = path.join(TEST_PATHS.visualizations, `${testName}_hanoi.html`);
    await fs.writeFile(htmlPath, html);
  }

  /**
   * Generate animated GIF visualization
   */
  private static async generateGifVisualization(
    states: HanoiState[],
    testName: string
  ): Promise<void> {
    try {
      console.log('Starting GIF generation...');
      
      // Create canvas for drawing
      const canvas = createCanvas(this.CONFIG.width, this.CONFIG.height);
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      console.log('Created canvas and context');

      // Create GIF encoder
      const encoder = new GIFEncoder(this.CONFIG.width, this.CONFIG.height);
      const gifPath = path.join(TEST_PATHS.visualizations, `${testName}_hanoi.gif`);
      
      console.log(`Initializing GIF encoder for path: ${gifPath}`);
      
      // Initialize encoder
      encoder.setDelay(this.CONFIG.frameDelay);
      encoder.start();
      
      console.log('Encoder initialized');

      // Helper function to draw a peg
      const drawPeg = (x: number, y: number, label: string) => {
        // Draw base
        ctx.fillStyle = '#34495e';
        ctx.fillRect(
          x - this.CONFIG.pegWidth/2 - 100,
          y + this.CONFIG.pegHeight,
          200,
          this.CONFIG.baseHeight
        );
        
        // Draw peg
        ctx.fillRect(
          x - this.CONFIG.pegWidth/2,
          y,
          this.CONFIG.pegWidth,
          this.CONFIG.pegHeight
        );
        
        // Draw label
        ctx.fillStyle = '#2c3e50';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(label, x, y + this.CONFIG.pegHeight + 30);
      };
      
      // Helper function to draw a disk
      const drawDisk = (x: number, y: number, size: number, index: number) => {
        const width = 40 + size * 30;
        ctx.fillStyle = this.COLORS[index % this.COLORS.length];
        ctx.beginPath();
        ctx.rect(
          x - width/2,
          y,
          width,
          this.CONFIG.diskHeight
        );
        ctx.fill();
        
        // Draw disk number
        ctx.fillStyle = '#fff';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(size.toString(), x, y + 20);
      };
      
      // Draw each state as a frame
      console.log(`Drawing ${states.length} frames...`);
      
      for (let i = 0; i < states.length; i++) {
        const state = states[i];
        console.log(`Drawing frame ${i + 1}/${states.length}`);
        
        // Clear canvas
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, this.CONFIG.width, this.CONFIG.height);
        
        // Draw pegs
        const pegY = 100;
        const pegPositions: PegPositions = {
          'A': this.CONFIG.pegSpacing,
          'B': this.CONFIG.pegSpacing * 2,
          'C': this.CONFIG.pegSpacing * 3
        };
        
        Object.entries(pegPositions).forEach(([peg, x]) => {
          drawPeg(x, pegY, peg);
        });
        
        // Draw disks
        for (const [peg, disks] of Object.entries(state.state)) {
          if (peg in pegPositions) {
            const x = pegPositions[peg];
            disks.forEach((disk, i) => {
              const y = pegY + this.CONFIG.pegHeight - (i + 1) * this.CONFIG.diskHeight;
              drawDisk(x, y, disk, disk - 1);
            });
          }
        }
        
        // Add frame to GIF
        console.log('Adding frame to GIF');
        encoder.addFrame(ctx as unknown as CanvasRenderingContext2D);
      }
      
      console.log('Finalizing GIF...');
      
      // Finalize GIF
      encoder.finish();
      
      // Write to file
      console.log('Getting GIF data...');
      const buffer = encoder.out.getData();
      
      console.log(`Writing ${buffer.length} bytes to ${gifPath}`);
      await fs.writeFile(gifPath, buffer);
      
      console.log(`Generated Hanoi visualization GIF: ${gifPath}`);
    } catch (error) {
      console.error('Failed to generate Hanoi GIF visualization:', error);
      throw error;
    }
  }
} 