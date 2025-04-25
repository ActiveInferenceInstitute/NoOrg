import pytest
import numpy as np
from swarm_sort import SwarmSort
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
import os
import logging
from matplotlib.animation import FuncAnimation, PillowWriter
import matplotlib.colors as mcolors

# Configure test logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    filename='agents/swarm_sort_test/logs/test_swarm_sort.log'
)
logger = logging.getLogger('TestSwarmSort')

class TestSwarmSort:
    @pytest.fixture
    def setup_sorter(self):
        return SwarmSort(num_agents=4)
    
    @pytest.fixture
    def random_numbers(self):
        np.random.seed(42)
        return np.random.randint(1, 1000, size=100).tolist()
    
    def test_sorting_correctness(self, setup_sorter, random_numbers):
        """Test if the swarm sort produces correctly sorted output"""
        result = setup_sorter.sort(random_numbers)
        expected = sorted(random_numbers)
        assert result == expected
        logger.info("Sorting correctness test passed")
    
    def test_metrics_collection(self, setup_sorter, random_numbers):
        """Test if metrics are properly collected"""
        setup_sorter.sort(random_numbers)
        metrics = setup_sorter.get_metrics()
        
        assert 'time_taken' in metrics
        assert 'num_operations' in metrics
        assert 'agent_utilization' in metrics
        assert len(metrics['agent_utilization']) == 4
        logger.info("Metrics collection test passed")
    
    def test_different_sizes(self, setup_sorter):
        """Test sorting with different input sizes"""
        sizes = [10, 50, 100, 200]
        for size in sizes:
            numbers = np.random.randint(1, 1000, size=size).tolist()
            result = setup_sorter.sort(numbers)
            assert len(result) == size
            assert result == sorted(numbers)
        logger.info("Different sizes test passed")
    
    def test_generate_visualizations(self, setup_sorter):
        """Generate comprehensive performance visualizations"""
        # Create visualization directory
        viz_dir = 'agents/swarm_sort_test/visualizations'
        os.makedirs(viz_dir, exist_ok=True)
        
        # Test parameters
        sizes = [10, 50, 100, 200, 500]
        metrics_data = []
        
        # Collect performance data
        for size in sizes:
            numbers = np.random.randint(1, 1000, size=size).tolist()
            setup_sorter.sort(numbers)
            metrics = setup_sorter.get_metrics()
            
            metrics_data.append({
                'size': size,
                'time': metrics['time_taken'],
                'operations': metrics['num_operations'],
                'avg_agent_utilization': np.mean(metrics['agent_utilization'])
            })
        
        # Convert to DataFrame for easier plotting
        df = pd.DataFrame(metrics_data)
        
        # Set default style
        plt.style.use('default')
        
        # Configure common plot settings
        plt.rcParams['figure.figsize'] = [10, 6]
        plt.rcParams['axes.grid'] = True
        plt.rcParams['lines.markersize'] = 8
        
        # 1. Time Complexity Plot
        plt.figure()
        plt.plot(df['size'], df['time'], marker='o', linewidth=2)
        plt.xlabel('Input Size')
        plt.ylabel('Time (seconds)')
        plt.title('SwarmSort Time Complexity')
        plt.grid(True)
        plt.savefig(f'{viz_dir}/time_complexity.png', dpi=300, bbox_inches='tight')
        plt.close()
        
        # 2. Operations Count Plot
        plt.figure()
        plt.plot(df['size'], df['operations'], marker='o', linewidth=2)
        plt.xlabel('Input Size')
        plt.ylabel('Number of Operations')
        plt.title('SwarmSort Operation Count')
        plt.grid(True)
        plt.savefig(f'{viz_dir}/operations.png', dpi=300, bbox_inches='tight')
        plt.close()
        
        # 3. Agent Utilization Plot
        plt.figure()
        plt.plot(df['size'], df['avg_agent_utilization'], marker='o', linewidth=2)
        plt.xlabel('Input Size')
        plt.ylabel('Average Agent Utilization')
        plt.title('SwarmSort Agent Utilization')
        plt.grid(True)
        plt.savefig(f'{viz_dir}/agent_utilization.png', dpi=300, bbox_inches='tight')
        plt.close()
        
        # 4. Combined Metrics Plot
        plt.figure(figsize=(12, 8))
        # Normalize the metrics for comparison
        df_norm = df.copy()
        for col in ['time', 'operations', 'avg_agent_utilization']:
            df_norm[col] = (df[col] - df[col].min()) / (df[col].max() - df[col].min())
        
        plt.plot(df_norm['size'], df_norm['time'], marker='o', label='Time (normalized)', linewidth=2)
        plt.plot(df_norm['size'], df_norm['operations'], marker='s', label='Operations (normalized)', linewidth=2)
        plt.plot(df_norm['size'], df_norm['avg_agent_utilization'], marker='^', label='Avg Utilization (normalized)', linewidth=2)
        plt.xlabel('Input Size')
        plt.ylabel('Normalized Metric Value')
        plt.title('SwarmSort Combined Performance Metrics')
        plt.legend()
        plt.grid(True)
        plt.savefig(f'{viz_dir}/combined_metrics.png', dpi=300, bbox_inches='tight')
        plt.close()
        
        logger.info(f"Generated visualization plots in {viz_dir}")
        
        # Verify files were created
        expected_files = [
            'time_complexity.png',
            'operations.png',
            'agent_utilization.png',
            'combined_metrics.png'
        ]
        for file in expected_files:
            assert os.path.exists(f'{viz_dir}/{file}'), f"Failed to generate {file}"

    def test_generate_sorting_animation(self, setup_sorter):
        """Generate a comprehensive multi-dimensional visualization of the sorting process"""
        viz_dir = 'agents/swarm_sort_test/visualizations'
        os.makedirs(viz_dir, exist_ok=True)
        
        # Generate random numbers for visualization
        np.random.seed(42)
        numbers = np.random.randint(1, 1000, size=40).tolist()  # Reduced size for clarity
        original_numbers = numbers.copy()
        
        # Initialize figure with complex layout
        fig = plt.figure(figsize=(20, 12))
        gs = plt.GridSpec(3, 4, height_ratios=[1, 1, 0.8])
        
        # Create subplots
        ax_orig = fig.add_subplot(gs[0, :2])      # Original array
        ax_work = fig.add_subplot(gs[1, :2])      # Work in progress
        ax_metrics = fig.add_subplot(gs[0, 2:])   # Real-time metrics
        ax_agents = fig.add_subplot(gs[1, 2:])    # Agent activity
        ax_info = fig.add_subplot(gs[2, :])       # Information and status
        
        fig.suptitle('SwarmSort: Multi-dimensional Visualization of Parallel Sorting', fontsize=16, y=0.95)
        
        # Initialize bars
        bars_orig = ax_orig.bar(range(len(numbers)), original_numbers)
        bars_work = ax_work.bar(range(len(numbers)), numbers)
        
        # Set axis limits and labels
        max_val = max(numbers)
        for ax in [ax_orig, ax_work]:
            ax.set_ylim(0, max_val * 1.1)
            ax.set_xlabel('Index')
            ax.set_ylabel('Value')
        
        # Set titles
        ax_orig.set_title('Original Array')
        ax_work.set_title('Sorting Progress')
        ax_metrics.set_title('Real-time Metrics')
        ax_agents.set_title('Agent Activity')
        
        # Hide info axis elements
        ax_info.axis('off')
        
        # Get agent colors
        colors = list(mcolors.TABLEAU_COLORS.values())
        
        # Calculate segment boundaries
        segment_size = len(numbers) // setup_sorter.num_agents
        segments = []
        for i in range(setup_sorter.num_agents):
            start = i * segment_size
            end = start + segment_size if i < setup_sorter.num_agents - 1 else len(numbers)
            segments.append((start, end))
        
        # Initialize metrics tracking
        metrics_history = {
            'comparisons': [0],  # Initialize with 0
            'swaps': [0],       # Initialize with 0
            'agent_progress': np.zeros(setup_sorter.num_agents),
            'time_elapsed': [0]  # Initialize with 0
        }
        
        def update(frame):
            # Clear dynamic plots
            ax_metrics.clear()
            ax_agents.clear()
            ax_info.clear()
            
            # Reset axes that were cleared
            ax_metrics.set_title('Real-time Metrics')
            ax_agents.set_title('Agent Activity')
            ax_info.axis('off')
            
            # Update metrics
            if frame > 0:
                metrics_history['time_elapsed'].append(frame)
                metrics_history['comparisons'].append(len(numbers) * frame)
                metrics_history['swaps'].append(len(numbers) // 2 * frame)
            
            if frame == 0:
                # Initial state
                ax_work.set_title('Initial State')
                for bar in bars_work:
                    bar.set_color('lightgray')
                    
                # Initialize agent view
                agent_positions = np.zeros(setup_sorter.num_agents)
                ax_agents.bar(range(setup_sorter.num_agents), agent_positions, color=colors)
                ax_agents.set_ylim(0, 100)
                ax_agents.set_xlabel('Agent ID')
                ax_agents.set_ylabel('Progress (%)')
                
                # Status text
                ax_info.text(0.5, 0.6, 'Initializing SwarmSort...', 
                           ha='center', va='center', fontsize=14)
                ax_info.text(0.5, 0.3, 'Preparing to distribute workload among agents', 
                           ha='center', va='center', fontsize=12)
            
            elif frame == 1:
                # Agent assignment phase
                for i, (start, end) in enumerate(segments):
                    for j in range(start, end):
                        bars_work[j].set_color(colors[i])
                
                # Update agent view
                agent_positions = np.ones(setup_sorter.num_agents) * 20  # 20% progress
                ax_agents.bar(range(setup_sorter.num_agents), agent_positions, color=colors)
                ax_agents.set_ylim(0, 100)
                ax_agents.set_xlabel('Agent ID')
                ax_agents.set_ylabel('Progress (%)')
                
                # Status text
                ax_info.text(0.5, 0.6, 'Segment Assignment Phase', 
                           ha='center', va='center', fontsize=14)
                ax_info.text(0.5, 0.3, 
                           f'Dividing array into {setup_sorter.num_agents} segments for parallel processing',
                           ha='center', va='center', fontsize=12)
            
            elif frame < setup_sorter.num_agents + 2:
                # Individual agent sorting phase
                agent_idx = frame - 2
                if agent_idx < len(segments):
                    start, end = segments[agent_idx]
                    segment = sorted(numbers[start:end])
                    numbers[start:end] = segment
                    
                    # Update bars
                    for j in range(start, end):
                        bars_work[j].set_height(numbers[j])
                    
                    # Update agent progress
                    metrics_history['agent_progress'][agent_idx] = 100
                    ax_agents.bar(range(setup_sorter.num_agents), 
                                metrics_history['agent_progress'], color=colors)
                    ax_agents.set_ylim(0, 100)
                    ax_agents.set_xlabel('Agent ID')
                    ax_agents.set_ylabel('Progress (%)')
                    
                    # Status text
                    ax_info.text(0.5, 0.6, f'Agent {agent_idx} Sorting Phase', 
                               ha='center', va='center', fontsize=14)
                    ax_info.text(0.5, 0.3, 
                               f'Sorting segment [{start}:{end}] with {end-start} elements',
                               ha='center', va='center', fontsize=12)
            
            elif frame == setup_sorter.num_agents + 2:
                # Merge preparation phase
                # Update agent view to show all at 100%
                metrics_history['agent_progress'] = np.ones(setup_sorter.num_agents) * 100
                ax_agents.bar(range(setup_sorter.num_agents), 
                            metrics_history['agent_progress'], color=colors)
                ax_agents.set_ylim(0, 100)
                
                # Status text
                ax_info.text(0.5, 0.6, 'Merge Preparation Phase', 
                           ha='center', va='center', fontsize=14)
                ax_info.text(0.5, 0.3, 'All segments sorted, preparing final merge...',
                           ha='center', va='center', fontsize=12)
            
            elif frame == setup_sorter.num_agents + 3:
                # Final merge phase
                sorted_numbers = sorted(numbers)
                for i, val in enumerate(sorted_numbers):
                    bars_work[i].set_height(val)
                    bars_work[i].set_color('green')
                
                # Show completion in agent view
                ax_agents.bar(range(setup_sorter.num_agents), 
                            metrics_history['agent_progress'], color='green')
                
                # Status text
                ax_info.text(0.5, 0.6, 'Sort Complete!', 
                           ha='center', va='center', fontsize=14, color='green')
                ax_info.text(0.5, 0.3, 'All elements successfully sorted',
                           ha='center', va='center', fontsize=12)
            
            # Update metrics plot
            if len(metrics_history['time_elapsed']) > 1:
                ax_metrics.plot(metrics_history['time_elapsed'], 
                              metrics_history['comparisons'], 
                              label='Comparisons', marker='o')
                ax_metrics.plot(metrics_history['time_elapsed'], 
                              metrics_history['swaps'], 
                              label='Swaps', marker='s')
                ax_metrics.legend()
                ax_metrics.set_xlabel('Step')
                ax_metrics.set_ylabel('Count')
                ax_metrics.grid(True)
            
            # Add step counter and progress bar
            total_steps = setup_sorter.num_agents + 4
            progress = (frame + 1) / total_steps * 100
            ax_info.text(0.98, 0.8, f'Step {frame+1} of {total_steps}',
                        ha='right', va='center', fontsize=10)
            
            # Add progress bar
            ax_info.axhline(y=0.1, xmin=0.2, xmax=0.8, color='gray', linewidth=3)
            ax_info.axhline(y=0.1, xmin=0.2, xmax=0.2 + (0.6 * progress/100),
                          color='green', linewidth=3)
            ax_info.text(0.5, 0.15, f'{progress:.0f}% Complete',
                        ha='center', va='center', fontsize=10)
            
            # Ensure figure is properly rendered
            fig.canvas.draw()
            
            return bars_work
        
        # Create animation
        total_frames = setup_sorter.num_agents + 4
        anim = FuncAnimation(fig, update, frames=total_frames, interval=1000, repeat=False, blit=False)
        
        # Save animation with higher quality
        writer = PillowWriter(fps=1)
        anim.save(f'{viz_dir}/sorting_animation.gif', writer=writer, dpi=150)
        plt.close()
        
        # Verify animation was created
        assert os.path.exists(f'{viz_dir}/sorting_animation.gif'), "Failed to generate sorting animation"
        logger.info("Generated comprehensive multi-dimensional sorting animation")

if __name__ == '__main__':
    # Create directories for logs and visualizations
    os.makedirs('agents/swarm_sort_test/logs', exist_ok=True)
    os.makedirs('agents/swarm_sort_test/visualizations', exist_ok=True)
    
    # Run tests with visualization
    pytest.main(['-v', '--capture=no']) 