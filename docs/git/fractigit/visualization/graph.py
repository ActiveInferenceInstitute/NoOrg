"""
FractiGit Visualization Module
"""

import numpy as np
import networkx as nx
import matplotlib.pyplot as plt
from typing import Dict, List, Optional, Any, Set
from pathlib import Path
from ..core.base import FractalNode, FractalStructure

class VisualizationError(Exception):
    """Custom exception for visualization errors"""
    pass

class FractalVisualizer:
    """Visualizes fractal Git structures"""
    def __init__(self, structure: FractalStructure):
        if not structure:
            raise VisualizationError("Cannot visualize empty structure")
        self.structure = structure
        self.graph = nx.DiGraph()
        self._build_graph()
        
    def _build_graph(self):
        """Build graph from fractal structure"""
        if not self.structure.nodes:
            raise VisualizationError("Structure contains no nodes")
            
        for node_id, node in self.structure.nodes.items():
            self.graph.add_node(
                node_id,
                level=node.level if node.level is not None else 0,
                state=node.state if node.state is not None else {},
                patterns=node.patterns if node.patterns is not None else set()
            )
            if node.parent:
                self.graph.add_edge(node.parent.node_id, node_id)
                
    def draw_structure(self, 
                      output_path: Optional[Path] = None,
                      show: bool = True,
                      figsize: tuple = (12, 8),
                      node_size: int = 1000,
                      alpha: float = 0.8,
                      layout: str = 'spring'):
        """Draw fractal structure with enhanced visualization"""
        if not self.graph.nodes:
            raise VisualizationError("No nodes to visualize")
            
        plt.figure(figsize=figsize)
        
        # Choose layout algorithm
        if layout == 'spring':
            pos = nx.spring_layout(self.graph, k=1/np.sqrt(len(self.graph)))
        elif layout == 'spectral':
            pos = nx.spectral_layout(self.graph)
        elif layout == 'shell':
            pos = nx.shell_layout(self.graph)
        else:
            pos = nx.spring_layout(self.graph)
        
        # Draw nodes by level with enhanced coloring
        levels = self._get_levels()
        if not levels:
            raise VisualizationError("No levels found in structure")
            
        colors = plt.cm.viridis(np.linspace(0, 1, len(levels)))
        
        for level, color in zip(levels, colors):
            nodes = [n for n, d in self.graph.nodes(data=True) 
                    if d['level'] == level]
            if nodes:
                nx.draw_networkx_nodes(
                    self.graph,
                    pos,
                    nodelist=nodes,
                    node_color=[color],
                    node_size=node_size,
                    alpha=alpha
                )
            
        # Draw edges with improved styling
        nx.draw_networkx_edges(
            self.graph,
            pos,
            edge_color='gray',
            arrows=True,
            arrowsize=20,
            width=2,
            alpha=0.6
        )
        
        # Add labels with better formatting
        labels = {n: f"{n}\nL{d['level']}" for n, d in self.graph.nodes(data=True)}
        nx.draw_networkx_labels(
            self.graph, 
            pos, 
            labels,
            font_size=10,
            font_weight='bold'
        )
        
        plt.title("Fractal Git Structure", pad=20, fontsize=14, fontweight='bold')
        plt.axis('off')
        
        try:
            if output_path:
                plt.savefig(output_path, bbox_inches='tight', dpi=300)
            if show:
                plt.show()
        finally:
            plt.close()
            
    def _get_levels(self) -> List[int]:
        """Get unique levels in structure"""
        return sorted(set(
            d['level'] for n, d in self.graph.nodes(data=True)
        ))
        
    def get_pattern_stats(self) -> Dict[str, int]:
        """Get pattern distribution statistics"""
        pattern_counts: Dict[str, int] = {}
        for n, d in self.graph.nodes(data=True):
            patterns = d.get('patterns', set())
            if patterns:
                for pattern in patterns:
                    pattern_counts[pattern] = pattern_counts.get(pattern, 0) + 1
        return pattern_counts
        
    def draw_pattern_distribution(self,
                                output_path: Optional[Path] = None,
                                show: bool = True,
                                figsize: tuple = (10, 6),
                                color_map: str = 'viridis'):
        """Draw enhanced pattern distribution"""
        pattern_counts = self.get_pattern_stats()
        if not pattern_counts:
            raise VisualizationError("No patterns to visualize")
            
        plt.figure(figsize=figsize)
        
        # Create bar plot with enhanced styling
        bars = plt.bar(
            pattern_counts.keys(),
            pattern_counts.values(),
            alpha=0.8,
            color=plt.cm.viridis(np.linspace(0, 1, len(pattern_counts)))
        )
        
        # Add value labels on top of bars
        for bar in bars:
            height = bar.get_height()
            plt.text(
                bar.get_x() + bar.get_width()/2.,
                height,
                f'{int(height)}',
                ha='center',
                va='bottom'
            )
        
        plt.title("Pattern Distribution", pad=20, fontsize=14, fontweight='bold')
        plt.xlabel("Patterns", fontsize=12)
        plt.ylabel("Count", fontsize=12)
        plt.xticks(rotation=45, ha='right')
        plt.grid(True, alpha=0.3)
        
        try:
            if output_path:
                plt.savefig(output_path, bbox_inches='tight', dpi=300)
            if show:
                plt.show()
        finally:
            plt.close()

class GitOperationVisualizer:
    """Visualizes Git operations and patterns"""
    def __init__(self):
        self.operation_graph = nx.DiGraph()
        self.pattern_graph = nx.DiGraph()
        
    def add_operation(self, operation: 'GitOperation'):
        """Add operation to visualization"""
        self.operation_graph.add_node(
            operation.command,
            pattern=operation.pattern,
            level=operation.level,
            priority=operation.priority
        )
        if operation.dependencies:
            for dep in operation.dependencies:
                self.operation_graph.add_edge(dep, operation.command)
                
    def add_pattern(self, pattern: str, operations: List['GitOperation']):
        """Add pattern to visualization"""
        self.pattern_graph.add_node(pattern)
        for op in operations:
            self.pattern_graph.add_edge(pattern, op.command)
            
    def draw_operation_graph(self,
                           output_path: Optional[Path] = None,
                           show: bool = True):
        """Draw operation dependency graph"""
        plt.figure(figsize=(12, 8))
        pos = nx.spring_layout(self.operation_graph)
        
        # Draw nodes colored by priority
        priorities = [d['priority'] for n, d in 
                     self.operation_graph.nodes(data=True)]
        norm = plt.Normalize(min(priorities), max(priorities))
        
        nx.draw_networkx_nodes(
            self.operation_graph,
            pos,
            node_color=priorities,
            cmap=plt.cm.viridis,
            node_size=1000,
            alpha=0.8
        )
        
        # Draw edges
        nx.draw_networkx_edges(
            self.operation_graph,
            pos,
            edge_color='gray',
            arrows=True
        )
        
        # Add labels
        labels = {n: n for n in self.operation_graph.nodes()}
        nx.draw_networkx_labels(self.operation_graph, pos, labels)
        
        plt.title("Git Operation Dependencies")
        plt.axis('off')
        
        if output_path:
            plt.savefig(output_path)
        if show:
            plt.show()
        plt.close()
        
    def draw_pattern_graph(self,
                          output_path: Optional[Path] = None,
                          show: bool = True):
        """Draw pattern relationship graph"""
        plt.figure(figsize=(12, 8))
        pos = nx.bipartite_layout(
            self.pattern_graph,
            [n for n in self.pattern_graph.nodes() 
             if self.pattern_graph.out_degree(n) > 0]
        )
        
        # Draw pattern nodes
        pattern_nodes = [n for n in self.pattern_graph.nodes() 
                        if self.pattern_graph.out_degree(n) > 0]
        nx.draw_networkx_nodes(
            self.pattern_graph,
            pos,
            nodelist=pattern_nodes,
            node_color='lightblue',
            node_size=1000,
            alpha=0.8
        )
        
        # Draw operation nodes
        operation_nodes = [n for n in self.pattern_graph.nodes() 
                         if self.pattern_graph.out_degree(n) == 0]
        nx.draw_networkx_nodes(
            self.pattern_graph,
            pos,
            nodelist=operation_nodes,
            node_color='lightgreen',
            node_size=800,
            alpha=0.8
        )
        
        # Draw edges
        nx.draw_networkx_edges(
            self.pattern_graph,
            pos,
            edge_color='gray',
            arrows=True
        )
        
        # Add labels
        labels = {n: n for n in self.pattern_graph.nodes()}
        nx.draw_networkx_labels(self.pattern_graph, pos, labels)
        
        plt.title("Git Pattern Relationships")
        plt.axis('off')
        
        if output_path:
            plt.savefig(output_path)
        if show:
            plt.show()
        plt.close()

class MetricsVisualizer:
    """Visualizes FractiGit metrics"""
    def __init__(self):
        self.metrics: Dict[str, List[float]] = {}
        self.timestamps: Dict[str, List[float]] = {}
        
    def add_metric(self, name: str, value: float, timestamp: float):
        """Add metric value"""
        if name not in self.metrics:
            self.metrics[name] = []
            self.timestamps[name] = []
        self.metrics[name].append(value)
        self.timestamps[name].append(timestamp)
        
    def draw_metric_trends(self,
                          metrics: Optional[List[str]] = None,
                          output_path: Optional[Path] = None,
                          show: bool = True):
        """Draw metric trends"""
        if metrics is None:
            metrics = list(self.metrics.keys())
            
        plt.figure(figsize=(12, 6))
        for metric in metrics:
            plt.plot(
                self.timestamps[metric],
                self.metrics[metric],
                label=metric,
                marker='o'
            )
            
        plt.title("FractiGit Metrics")
        plt.xlabel("Time")
        plt.ylabel("Value")
        plt.legend()
        plt.grid(True)
        
        if output_path:
            plt.savefig(output_path)
        if show:
            plt.show()
        plt.close()
        
    def draw_metric_distribution(self,
                               metric: str,
                               output_path: Optional[Path] = None,
                               show: bool = True):
        """Draw metric distribution"""
        plt.figure(figsize=(10, 6))
        plt.hist(
            self.metrics[metric],
            bins=20,
            alpha=0.7,
            color='blue'
        )
        
        plt.title(f"{metric} Distribution")
        plt.xlabel("Value")
        plt.ylabel("Frequency")
        plt.grid(True)
        
        if output_path:
            plt.savefig(output_path)
        if show:
            plt.show()
        plt.close() 