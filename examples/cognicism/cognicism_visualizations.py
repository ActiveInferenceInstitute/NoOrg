#!/usr/bin/env python3
"""
Cognicism Advanced Visualizations

This script provides interactive visualizations and animations for the Cognicism framework,
complementing the TypeScript implementation.

Features:
- Interactive network visualizations of trust relationships
- Dynamic timeline of thought evolution
- Animated heatmaps of belief certainty
- 3D representations of the semantic ledger
"""

import os
import json
import argparse
import numpy as np
import pandas as pd
from datetime import datetime
import matplotlib.pyplot as plt
import matplotlib.animation as animation
import networkx as nx
from matplotlib.colors import LinearSegmentedColormap
from mpl_toolkits.mplot3d import Axes3D
import seaborn as sns
from typing import List, Dict, Any, Optional, Tuple

# Try to import Plotly for interactive visualizations, but provide fallbacks
try:
    import plotly.graph_objects as go
    import plotly.express as px
    from plotly.subplots import make_subplots
    PLOTLY_AVAILABLE = True
except ImportError:
    PLOTLY_AVAILABLE = False
    print("Plotly not available. Some interactive visualizations will be disabled.")

# Optional dependency for more advanced network visualizations
try:
    import holoviews as hv
    from holoviews import opts, dim
    from holoviews.operation.datashader import datashade, bundle_graph
    hv.extension('bokeh')
    HOLOVIEWS_AVAILABLE = True
except ImportError:
    HOLOVIEWS_AVAILABLE = False
    print("HoloViews not available. Advanced network visualizations will be disabled.")

# Define color schemes for the visualizations
COLOR_SCHEMES = {
    'trust': {
        'high': '#4CAF50',  # Green
        'medium': '#FFC107',  # Amber
        'low': '#F44336',  # Red
    },
    'thought_types': {
        'prediction': '#90CAF9',  # Blue
        'reflection': '#A5D6A7',  # Green
        'statement': '#FFCC80',  # Orange
        'question': '#CE93D8',  # Purple
    },
    'valence': {
        'positive': '#4CAF50',  # Green
        'neutral': '#9E9E9E',  # Grey
        'negative': '#F44336',  # Red
    }
}

class CognicismVisualizer:
    """Main class for generating visualizations of Cognicism data"""
    
    def __init__(self, data_dir: str):
        """
        Initialize with the path to the data directory from a Cognicism workflow run
        
        Args:
            data_dir: Path to the data directory containing JSON outputs
        """
        self.data_dir = data_dir
        self.output_dir = os.path.join(os.path.dirname(data_dir), 'visualizations')
        
        # Ensure output directory exists
        os.makedirs(self.output_dir, exist_ok=True)
        
        # Load the workflow data
        self.load_workflow_data()
    
    def load_workflow_data(self) -> None:
        """Load all available data files from the workflow run"""
        self.data = {}
        
        # Iterate through all JSON files in the data directory
        for filename in os.listdir(self.data_dir):
            if filename.endswith('.json'):
                filepath = os.path.join(self.data_dir, filename)
                try:
                    with open(filepath, 'r') as f:
                        # Extract the key name from filename (remove .json extension)
                        key = filename.rsplit('.', 1)[0]
                        self.data[key] = json.load(f)
                except (json.JSONDecodeError, IOError) as e:
                    print(f"Error loading {filename}: {e}")
        
        print(f"Loaded {len(self.data)} data files from {self.data_dir}")
        
        # Extract key data structures
        self.extract_thoughts()
        self.extract_trust_data()
    
    def extract_thoughts(self) -> None:
        """Extract all thoughts from the FourThought agents and Iris models"""
        self.thoughts = []
        
        # Extract from FourThought results
        for key in ['climate_fourthought_results', 'ai_ethics_fourthought_results']:
            if key in self.data and 'all_thoughts' in self.data[key]:
                self.thoughts.extend(self.data[key]['all_thoughts'])
        
        # Extract from Iris results
        for key in ['scientific_iris_results', 'policy_iris_results']:
            if key in self.data and 'thoughts' in self.data[key]:
                thoughts = self.data[key]['thoughts']
                # Check if thoughts is a list or needs to be flattened from categories
                if isinstance(thoughts, dict):
                    for category, category_thoughts in thoughts.items():
                        # Convert category (e.g., 'predictions') to singular type (e.g., 'prediction')
                        thought_type = category[:-1] if category.endswith('s') else category
                        for thought in category_thoughts:
                            # Add the type if not present
                            if 'type' not in thought:
                                thought['type'] = thought_type
                            self.thoughts.append(thought)
                elif isinstance(thoughts, list):
                    self.thoughts.extend(thoughts)
        
        print(f"Extracted {len(self.thoughts)} thoughts")
    
    def extract_trust_data(self) -> None:
        """Extract trust distribution data from Iris models"""
        self.trust_data = {}
        self.sources = []
        
        # Extract from Iris results
        for key in ['scientific_iris_results', 'policy_iris_results']:
            if key in self.data:
                if 'trust_distribution' in self.data[key]:
                    self.trust_data[key] = self.data[key]['trust_distribution']
                
                if 'sources' in self.data[key]:
                    # Add a field to identify which Iris model this source belongs to
                    for source in self.data[key]['sources']:
                        source['iris_model'] = key
                    self.sources.extend(self.data[key]['sources'])
        
        print(f"Extracted trust data for {len(self.trust_data)} Iris models and {len(self.sources)} sources")
    
    def create_trust_network_visualization(self, save_path: Optional[str] = None) -> None:
        """
        Create an interactive network visualization of trust relationships
        
        Args:
            save_path: Path to save the visualization, if None, a default path is used
        """
        if not PLOTLY_AVAILABLE:
            print("Plotly is required for interactive trust network visualization")
            return
        
        if not self.sources or not self.thoughts:
            print("No source or thought data available for trust network visualization")
            return
        
        # Create a graph
        G = nx.Graph()
        
        # Add source nodes
        for source in self.sources:
            # Find the trust value for this source
            iris_model = source.get('iris_model', '')
            trust_value = 0.5  # Default
            
            if iris_model in self.trust_data and source['id'] in self.trust_data[iris_model]:
                trust_value = self.trust_data[iris_model][source['id']]
            
            # Map trust to color
            if trust_value >= 0.7:
                color = COLOR_SCHEMES['trust']['high']
            elif trust_value <= 0.3:
                color = COLOR_SCHEMES['trust']['low']
            else:
                color = COLOR_SCHEMES['trust']['medium']
            
            G.add_node(
                source['id'],
                label=source['name'],
                type='source',
                size=20,  # Larger nodes for sources
                color=color,
                trust=trust_value,
                reliability=source.get('reliability', 0.5),
                iris_model=iris_model
            )
        
        # Add thought nodes and edges
        for i, thought in enumerate(self.thoughts):
            thought_id = f"thought_{i}"
            
            # Get type-specific color
            thought_type = thought.get('type', 'unknown')
            color = COLOR_SCHEMES['thought_types'].get(
                thought_type, 
                '#CCCCCC'  # Default grey
            )
            
            # Get valence-adjusted color if available
            valence = thought.get('valence', 0)
            if valence is not None:
                if valence > 0.3:
                    color = COLOR_SCHEMES['valence']['positive']
                elif valence < -0.3:
                    color = COLOR_SCHEMES['valence']['negative']
            
            # Add the thought node
            G.add_node(
                thought_id,
                label=thought.get('content', '')[:30] + '...',
                type='thought',
                thought_type=thought_type,
                size=10,  # Smaller nodes for thoughts
                color=color,
                valence=valence,
                uncertainty=thought.get('uncertainty', 0.5)
            )
            
            # Link to author if possible
            author = thought.get('author', '')
            for source in self.sources:
                if source['name'] == author:
                    G.add_edge(
                        source['id'], 
                        thought_id,
                        weight=1.0,
                        trust=thought.get('trustScore', 0.5)
                    )
                    break
        
        # Create positions for nodes using a spring layout
        pos = nx.spring_layout(G, seed=42)
        
        # Extract node attributes
        node_x = []
        node_y = []
        node_text = []
        node_color = []
        node_size = []
        
        for node in G.nodes():
            node_x.append(pos[node][0])
            node_y.append(pos[node][1])
            
            # Create hover text
            node_data = G.nodes[node]
            if node_data['type'] == 'source':
                text = (
                    f"Source: {node_data['label']}<br>"
                    f"Trust: {node_data.get('trust', 0.5):.2f}<br>"
                    f"Reliability: {node_data.get('reliability', 0.5):.2f}"
                )
            else:
                text = (
                    f"Type: {node_data.get('thought_type', 'unknown')}<br>"
                    f"Content: {node_data['label']}<br>"
                    f"Valence: {node_data.get('valence', 0):.2f}<br>"
                    f"Uncertainty: {node_data.get('uncertainty', 0.5):.2f}"
                )
            node_text.append(text)
            
            # Add color and size
            node_color.append(node_data.get('color', '#CCCCCC'))
            node_size.append(node_data.get('size', 10))
        
        # Create edge traces
        edge_x = []
        edge_y = []
        edge_text = []
        
        for edge in G.edges():
            x0, y0 = pos[edge[0]]
            x1, y1 = pos[edge[1]]
            
            # Create curved edges
            edge_x.append(x0)
            edge_x.append(x1)
            edge_x.append(None)  # Discontinuity
            
            edge_y.append(y0)
            edge_y.append(y1)
            edge_y.append(None)  # Discontinuity
            
            # Create hover text
            edge_data = G.edges[edge]
            text = f"Trust: {edge_data.get('trust', 0.5):.2f}"
            edge_text.append(text)
        
        # Create node trace
        node_trace = go.Scatter(
            x=node_x, y=node_y,
            mode='markers',
            hoverinfo='text',
            text=node_text,
            marker=dict(
                color=node_color,
                size=node_size,
                line=dict(width=2, color='#FFFFFF')
            )
        )
        
        # Create edge trace
        edge_trace = go.Scatter(
            x=edge_x, y=edge_y,
            mode='lines',
            line=dict(width=1, color='#888888'),
            hoverinfo='text',
            text=edge_text
        )
        
        # Create the figure
        fig = go.Figure(data=[edge_trace, node_trace],
                     layout=go.Layout(
                         title='Cognicism Trust Network',
                         titlefont=dict(size=16),
                         showlegend=False,
                         hovermode='closest',
                         margin=dict(b=20,l=5,r=5,t=40),
                         annotations=[dict(
                             text="Trust relationships between sources and thoughts",
                             xref="paper", yref="paper",
                             x=0.005, y=-0.002,
                             showarrow=False,
                             font=dict(size=12)
                         )],
                         xaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
                         yaxis=dict(showgrid=False, zeroline=False, showticklabels=False)
                     )
                    )
        
        # Add a legend for node types
        legend_items = [
            ("Source - High Trust", COLOR_SCHEMES['trust']['high']),
            ("Source - Medium Trust", COLOR_SCHEMES['trust']['medium']),
            ("Source - Low Trust", COLOR_SCHEMES['trust']['low']),
            ("Prediction", COLOR_SCHEMES['thought_types']['prediction']),
            ("Reflection", COLOR_SCHEMES['thought_types']['reflection']),
            ("Statement", COLOR_SCHEMES['thought_types']['statement']),
            ("Question", COLOR_SCHEMES['thought_types']['question'])
        ]
        
        for i, (name, color) in enumerate(legend_items):
            fig.add_trace(go.Scatter(
                x=[None], y=[None],
                mode='markers',
                marker=dict(size=10, color=color),
                showlegend=True,
                name=name
            ))
        
        if save_path is None:
            save_path = os.path.join(self.output_dir, 'trust_network_interactive.html')
        
        # Save the figure
        fig.write_html(save_path)
        print(f"Saved interactive trust network visualization to {save_path}")
    
    def create_thought_timeline_animation(self, save_path: Optional[str] = None) -> None:
        """
        Create an animated timeline of thoughts showing the evolution of ideas
        
        Args:
            save_path: Path to save the animation, if None, a default path is used
        """
        if not self.thoughts:
            print("No thought data available for timeline animation")
            return
        
        # Sort thoughts by timestamp
        sorted_thoughts = sorted(
            self.thoughts, 
            key=lambda x: x.get('timestamp', '2000-01-01T00:00:00Z')
        )
        
        # Set up the figure
        fig, ax = plt.subplots(figsize=(12, 8))
        
        # Dictionary to store the y-position for each thought type
        type_positions = {
            'prediction': 4,
            'reflection': 3,
            'statement': 2,
            'question': 1
        }
        
        # Create a smaller subset for animation (maximum 40 thoughts)
        max_thoughts = min(40, len(sorted_thoughts))
        animation_thoughts = sorted_thoughts[:max_thoughts]
        
        # Function to update the plot for each frame
        def update(frame):
            ax.clear()
            
            # Set up the plot
            ax.set_xlim(0, max_thoughts)
            ax.set_ylim(0, 5)
            ax.set_yticks([1, 2, 3, 4])
            ax.set_yticklabels(['Questions', 'Statements', 'Reflections', 'Predictions'])
            ax.set_title('Cognicism Thought Timeline')
            ax.grid(True, linestyle='--', alpha=0.7)
            
            # Plot each thought up to the current frame
            for i, thought in enumerate(animation_thoughts[:frame+1]):
                thought_type = thought.get('type', 'unknown')
                y_pos = type_positions.get(thought_type, 2.5)
                
                # Get color based on valence
                valence = thought.get('valence', 0)
                if valence > 0.3:
                    color = COLOR_SCHEMES['valence']['positive']
                elif valence < -0.3:
                    color = COLOR_SCHEMES['valence']['negative']
                else:
                    color = COLOR_SCHEMES['valence']['neutral']
                
                # Get size based on uncertainty (inverse relationship)
                uncertainty = thought.get('uncertainty', 0.5)
                size = 100 * (1 - uncertainty)
                
                # Plot the point
                ax.scatter(i, y_pos, s=size, color=color, alpha=0.7, edgecolors='white')
                
                # Add a line connecting consecutive thoughts of the same type
                if i > 0 and thought_type == animation_thoughts[i-1].get('type', ''):
                    prev_y = type_positions.get(animation_thoughts[i-1].get('type', ''), 2.5)
                    ax.plot([i-1, i], [prev_y, y_pos], 'k-', alpha=0.3)
                
                # Add content preview for the latest thought
                if i == frame:
                    content = thought.get('content', '')
                    preview = content[:50] + ('...' if len(content) > 50 else '')
                    ax.annotate(
                        preview,
                        xy=(i, y_pos),
                        xytext=(5, 10),
                        textcoords='offset points',
                        fontsize=8,
                        bbox=dict(boxstyle='round,pad=0.5', fc='yellow', alpha=0.3)
                    )
            
            # Add a legend
            legend_elements = [
                plt.Line2D([0], [0], marker='o', color='w', markerfacecolor=COLOR_SCHEMES['valence']['positive'], label='Positive Valence', markersize=8),
                plt.Line2D([0], [0], marker='o', color='w', markerfacecolor=COLOR_SCHEMES['valence']['neutral'], label='Neutral Valence', markersize=8),
                plt.Line2D([0], [0], marker='o', color='w', markerfacecolor=COLOR_SCHEMES['valence']['negative'], label='Negative Valence', markersize=8),
                plt.Line2D([0], [0], marker='o', color='w', label='Size = Certainty', markersize=5),
                plt.Line2D([0], [0], marker='o', color='w', label='Size = Certainty', markersize=10)
            ]
            ax.legend(handles=legend_elements, loc='upper right')
            
            return ax
        
        # Create the animation
        ani = animation.FuncAnimation(
            fig, update, frames=max_thoughts, 
            blit=False, interval=200, repeat=True
        )
        
        if save_path is None:
            save_path = os.path.join(self.output_dir, 'thought_timeline_animation.gif')
        
        # Save the animation
        ani.save(save_path, writer='pillow', fps=5, dpi=100)
        plt.close(fig)
        print(f"Saved thought timeline animation to {save_path}")
    
    def create_trust_evolution_heatmap(self, save_path: Optional[str] = None) -> None:
        """
        Create a heatmap showing the evolution of trust over time
        
        Args:
            save_path: Path to save the visualization, if None, a default path is used
        """
        if not PLOTLY_AVAILABLE:
            print("Plotly is required for trust evolution heatmap")
            return
        
        if not self.sources:
            print("No source data available for trust evolution heatmap")
            return
        
        # Create simulated trust data evolving over time
        timestamps = []
        base_time = datetime.now()
        
        # Create 10 timepoints
        for i in range(10):
            # Create timestamp string
            timestamp = base_time.replace(hour=base_time.hour - 9 + i).isoformat()
            timestamps.append(timestamp)
        
        # Create a pandas DataFrame to hold the trust values
        trust_data = []
        
        # For each source, create evolving trust values
        for source in self.sources:
            # Get initial trust value or use 0.5 as default
            initial_trust = 0.5
            iris_model = source.get('iris_model', '')
            if iris_model in self.trust_data and source['id'] in self.trust_data[iris_model]:
                initial_trust = self.trust_data[iris_model][source['id']]
            
            # Create a random walk of trust values, but ensure they stay between 0 and 1
            np.random.seed(hash(source['id']) % 2**32)
            
            trust_values = [initial_trust]
            for i in range(9):
                # Random change with a tendency to revert to the mean
                change = np.random.normal(0, 0.05)
                # Add mean reversion
                if trust_values[-1] > 0.5:
                    change -= 0.01
                else:
                    change += 0.01
                
                new_value = trust_values[-1] + change
                # Ensure trust stays between 0 and 1
                new_value = max(0, min(1, new_value))
                trust_values.append(new_value)
            
            # Add to the data
            for i, timestamp in enumerate(timestamps):
                trust_data.append({
                    'Source': source['name'],
                    'Timestamp': timestamp,
                    'Trust': trust_values[i],
                    'Iris': iris_model
                })
        
        # Convert to DataFrame
        df = pd.DataFrame(trust_data)
        
        # Create a figure
        fig = px.density_heatmap(
            df, x='Timestamp', y='Source', z='Trust',
            title='Trust Evolution Over Time',
            labels={'Trust': 'Trust Value'},
            color_continuous_scale='RdYlGn'
        )
        
        if save_path is None:
            save_path = os.path.join(self.output_dir, 'trust_evolution_heatmap.html')
        
        # Save the figure
        fig.write_html(save_path)
        print(f"Saved trust evolution heatmap to {save_path}")
    
    def create_3d_semantic_space(self, save_path: Optional[str] = None) -> None:
        """
        Create a 3D visualization of the semantic space of thoughts
        
        Args:
            save_path: Path to save the visualization, if None, a default path is used
        """
        if not PLOTLY_AVAILABLE:
            print("Plotly is required for 3D semantic space visualization")
            return
        
        if not self.thoughts:
            print("No thought data available for 3D semantic space visualization")
            return
        
        # To simulate embeddings, we'll create random 3D coordinates
        # In a real implementation, these would be derived from the actual semantic embeddings
        np.random.seed(42)
        
        # Create a pandas DataFrame
        data = []
        
        for i, thought in enumerate(self.thoughts):
            thought_type = thought.get('type', 'unknown')
            
            # Generate pseudo-random coordinates based on thought type for clustering effect
            base_coords = {
                'prediction': [0.7, 0.3, 0.5],
                'reflection': [0.3, 0.7, 0.5],
                'statement': [0.5, 0.5, 0.7],
                'question': [0.5, 0.7, 0.3]
            }.get(thought_type, [0.5, 0.5, 0.5])
            
            # Add some noise
            coords = [
                base_coords[0] + np.random.normal(0, 0.15),
                base_coords[1] + np.random.normal(0, 0.15),
                base_coords[2] + np.random.normal(0, 0.15)
            ]
            
            # Add to data
            data.append({
                'x': coords[0],
                'y': coords[1],
                'z': coords[2],
                'type': thought_type,
                'content': thought.get('content', '')[:50] + ('...' if len(thought.get('content', '')) > 50 else ''),
                'valence': thought.get('valence', 0),
                'uncertainty': thought.get('uncertainty', 0.5),
                'author': thought.get('author', 'Unknown')
            })
        
        # Convert to DataFrame
        df = pd.DataFrame(data)
        
        # Create colors based on thought type
        color_map = {
            'prediction': COLOR_SCHEMES['thought_types']['prediction'],
            'reflection': COLOR_SCHEMES['thought_types']['reflection'],
            'statement': COLOR_SCHEMES['thought_types']['statement'],
            'question': COLOR_SCHEMES['thought_types']['question']
        }
        
        # Create figure
        fig = px.scatter_3d(
            df, x='x', y='y', z='z',
            color='type',
            hover_name='content',
            hover_data=['valence', 'uncertainty', 'author'],
            color_discrete_map=color_map,
            title='3D Semantic Space of Thoughts',
            labels={'x': 'Dimension 1', 'y': 'Dimension 2', 'z': 'Dimension 3'}
        )
        
        # Update layout for better aesthetics
        fig.update_layout(
            scene=dict(
                xaxis=dict(showbackground=False, showticklabels=False),
                yaxis=dict(showbackground=False, showticklabels=False),
                zaxis=dict(showbackground=False, showticklabels=False)
            ),
            margin=dict(r=0, l=0, b=0, t=40)
        )
        
        if save_path is None:
            save_path = os.path.join(self.output_dir, '3d_semantic_space.html')
        
        # Save the figure
        fig.write_html(save_path)
        print(f"Saved 3D semantic space visualization to {save_path}")
    
    def create_all_visualizations(self) -> None:
        """Create all available visualizations"""
        self.create_trust_network_visualization()
        self.create_thought_timeline_animation()
        self.create_trust_evolution_heatmap()
        self.create_3d_semantic_space()
        print("Created all visualizations")

def main():
    """Main function to run from the command line"""
    parser = argparse.ArgumentParser(description='Generate Cognicism visualizations')
    parser.add_argument('--data-dir', type=str, required=True,
                        help='Path to the data directory from a Cognicism workflow run')
    args = parser.parse_args()
    
    visualizer = CognicismVisualizer(args.data_dir)
    visualizer.create_all_visualizations()

if __name__ == '__main__':
    main() 