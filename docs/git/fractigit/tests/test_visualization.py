"""
FractiGit Visualization Tests
"""

import pytest
import numpy as np
import networkx as nx
import matplotlib.pyplot as plt
from pathlib import Path
from ..core.base import FractalConfig, FractalStructure
from ..core.git_ops import GitOperation
from ..visualization.graph import (
    FractalVisualizer,
    GitOperationVisualizer,
    MetricsVisualizer,
    VisualizationError
)

@pytest.fixture
def fractal_structure():
    """Fixture for FractalStructure"""
    config = FractalConfig()
    structure = FractalStructure(config)
    return structure

@pytest.fixture
def git_operation():
    """Fixture for GitOperation"""
    return GitOperation(
        command="init",
        args={"bare": True},
        pattern="init",
        level=0,
        priority=1,
        dependencies=[]
    )

@pytest.fixture
def tmp_image(tmp_path):
    """Fixture for temporary image path"""
    return tmp_path / "test.png"

@pytest.fixture
def complex_fractal_structure():
    """Fixture for a complex FractalStructure"""
    config = FractalConfig(pattern_depth=3, branching_factor=2)
    structure = FractalStructure(config)
    return structure

@pytest.fixture
def complex_git_operations():
    """Fixture for complex Git operations"""
    ops = [
        GitOperation(
            command="init",
            args={"bare": True},
            pattern="init",
            level=0,
            priority=1,
            dependencies=[]
        ),
        GitOperation(
            command="commit",
            args={"message": "test"},
            pattern="commit",
            level=1,
            priority=2,
            dependencies=["init"]
        ),
        GitOperation(
            command="push",
            args={},
            pattern="sync",
            level=2,
            priority=3,
            dependencies=["commit"]
        )
    ]
    return ops

@pytest.fixture
def empty_structure():
    """Fixture for empty structure"""
    config = FractalConfig()
    return FractalStructure(config)

@pytest.fixture
def invalid_operation():
    """Fixture for invalid operation"""
    return GitOperation(
        command="",  # Invalid empty command
        args={},
        pattern="invalid",
        level=-1,  # Invalid level
        priority=0,
        dependencies=["nonexistent"]  # Invalid dependency
    )

class TestFractalVisualizer:
    """Tests for FractalVisualizer"""
    
    @pytest.mark.asyncio
    async def test_build_graph(self, fractal_structure):
        """Test graph building"""
        # Add some nodes to structure
        await fractal_structure.add_node("node1")
        await fractal_structure.add_node("node2", "node1")
        
        visualizer = FractalVisualizer(fractal_structure)
        assert len(visualizer.graph.nodes) == 3  # Including root
        assert len(visualizer.graph.edges) == 2
        
    @pytest.mark.asyncio
    async def test_draw_structure(self, fractal_structure, tmp_image):
        """Test structure visualization"""
        # Add some nodes to structure
        await fractal_structure.add_node("node1")
        await fractal_structure.add_node("node2", "node1")
        
        visualizer = FractalVisualizer(fractal_structure)
        visualizer.draw_structure(tmp_image, show=False)
        assert tmp_image.exists()
        
    @pytest.mark.asyncio
    async def test_pattern_distribution(self, fractal_structure, tmp_image):
        """Test pattern distribution visualization"""
        # Add nodes with patterns
        node1 = await fractal_structure.add_node("node1")
        node1.patterns = {"pattern1", "pattern2"}
        node2 = await fractal_structure.add_node("node2", "node1")
        node2.patterns = {"pattern1"}
        
        visualizer = FractalVisualizer(fractal_structure)
        visualizer.draw_pattern_distribution(tmp_image, show=False)
        assert tmp_image.exists()

    @pytest.mark.asyncio
    async def test_complex_structure(self, complex_fractal_structure):
        """Test visualization of complex structures"""
        # Create a complex structure
        await complex_fractal_structure.add_node("main")
        await complex_fractal_structure.add_node("feature1", "main")
        await complex_fractal_structure.add_node("feature2", "main")
        await complex_fractal_structure.add_node("subfeature1", "feature1")
        
        visualizer = FractalVisualizer(complex_fractal_structure)
        assert len(visualizer.graph.nodes) == 5  # Including root
        assert len(visualizer.graph.edges) == 4
        
        # Test node attributes
        for node in visualizer.graph.nodes:
            assert 'level' in visualizer.graph.nodes[node]
            assert 'state' in visualizer.graph.nodes[node]
            assert 'patterns' in visualizer.graph.nodes[node]

    @pytest.mark.asyncio
    async def test_pattern_analysis(self, complex_fractal_structure):
        """Test pattern analysis visualization"""
        # Add nodes with multiple patterns
        node1 = await complex_fractal_structure.add_node("node1")
        node1.patterns = {"pattern1", "pattern2", "pattern3"}
        node2 = await complex_fractal_structure.add_node("node2", "node1")
        node2.patterns = {"pattern1", "pattern2"}
        node3 = await complex_fractal_structure.add_node("node3", "node1")
        node3.patterns = {"pattern1"}
        
        visualizer = FractalVisualizer(complex_fractal_structure)
        
        # Test pattern distribution
        pattern_counts = {}
        for node in visualizer.graph.nodes:
            patterns = visualizer.graph.nodes[node].get('patterns', set())
            for pattern in patterns:
                pattern_counts[pattern] = pattern_counts.get(pattern, 0) + 1
                
        assert pattern_counts.get("pattern1", 0) == 3
        assert pattern_counts.get("pattern2", 0) == 2
        assert pattern_counts.get("pattern3", 0) == 1

class TestGitOperationVisualizer:
    """Tests for GitOperationVisualizer"""
    
    def test_add_operation(self, git_operation):
        """Test adding operations"""
        visualizer = GitOperationVisualizer()
        visualizer.add_operation(git_operation)
        assert len(visualizer.operation_graph.nodes) == 1
        
    def test_add_pattern(self, git_operation):
        """Test adding patterns"""
        visualizer = GitOperationVisualizer()
        visualizer.add_pattern("test_pattern", [git_operation])
        assert len(visualizer.pattern_graph.nodes) == 2  # Pattern + operation
        assert len(visualizer.pattern_graph.edges) == 1
        
    def test_draw_operation_graph(self, git_operation, tmp_image):
        """Test operation graph visualization"""
        visualizer = GitOperationVisualizer()
        visualizer.add_operation(git_operation)
        visualizer.draw_operation_graph(tmp_image, show=False)
        assert tmp_image.exists()
        
    def test_draw_pattern_graph(self, git_operation, tmp_image):
        """Test pattern graph visualization"""
        visualizer = GitOperationVisualizer()
        visualizer.add_pattern("test_pattern", [git_operation])
        visualizer.draw_pattern_graph(tmp_image, show=False)
        assert tmp_image.exists()

    def test_complex_operations(self, complex_git_operations):
        """Test handling of complex operations"""
        visualizer = GitOperationVisualizer()
        
        # Add all operations
        for op in complex_git_operations:
            visualizer.add_operation(op)
            
        # Test graph properties
        assert len(visualizer.operation_graph.nodes) == 3
        assert len(visualizer.operation_graph.edges) == 2
        
        # Test node priorities
        priorities = nx.get_node_attributes(visualizer.operation_graph, 'priority')
        assert priorities['init'] == 1
        assert priorities['commit'] == 2
        assert priorities['push'] == 3
        
        # Test pattern relationships
        patterns = set(nx.get_node_attributes(visualizer.operation_graph, 'pattern').values())
        assert patterns == {'init', 'commit', 'sync'}

class TestMetricsVisualizer:
    """Tests for MetricsVisualizer"""
    
    def test_add_metric(self):
        """Test adding metrics"""
        visualizer = MetricsVisualizer()
        visualizer.add_metric("test_metric", 1.0, 0.0)
        assert "test_metric" in visualizer.metrics
        assert len(visualizer.metrics["test_metric"]) == 1
        assert len(visualizer.timestamps["test_metric"]) == 1
        
    def test_draw_metric_trends(self, tmp_image):
        """Test metric trends visualization"""
        visualizer = MetricsVisualizer()
        visualizer.add_metric("metric1", 1.0, 0.0)
        visualizer.add_metric("metric1", 2.0, 1.0)
        visualizer.add_metric("metric2", 0.5, 0.0)
        visualizer.add_metric("metric2", 1.5, 1.0)
        
        visualizer.draw_metric_trends(output_path=tmp_image, show=False)
        assert tmp_image.exists()
        
    def test_draw_metric_distribution(self, tmp_image):
        """Test metric distribution visualization"""
        visualizer = MetricsVisualizer()
        for i in range(100):
            visualizer.add_metric("test_metric", float(i), float(i))
            
        visualizer.draw_metric_distribution(
            "test_metric",
            output_path=tmp_image,
            show=False
        )
        assert tmp_image.exists()

    def test_complex_metrics(self):
        """Test handling of complex metrics"""
        visualizer = MetricsVisualizer()
        
        # Add multiple metrics with different patterns
        metrics = {
            'cpu_usage': [(i, np.sin(i/10)) for i in range(100)],
            'memory_usage': [(i, np.cos(i/10)) for i in range(100)],
            'operation_count': [(i, i*2) for i in range(100)]
        }
        
        for metric_name, values in metrics.items():
            for timestamp, value in values:
                visualizer.add_metric(metric_name, value, timestamp)
                
        # Test metric storage
        assert len(visualizer.metrics) == 3
        assert len(visualizer.metrics['cpu_usage']) == 100
        assert len(visualizer.metrics['memory_usage']) == 100
        assert len(visualizer.metrics['operation_count']) == 100
        
        # Test timestamp storage
        assert len(visualizer.timestamps) == 3
        assert len(visualizer.timestamps['cpu_usage']) == 100
        assert visualizer.timestamps['cpu_usage'] == list(range(100))

@pytest.mark.integration
class TestVisualizationIntegration:
    """Integration tests for visualization"""
    
    @pytest.mark.asyncio
    async def test_full_visualization(self, fractal_structure, tmp_path):
        """Test complete visualization workflow"""
        # Setup structure
        node1 = await fractal_structure.add_node("node1")
        node1.patterns = {"pattern1", "pattern2"}
        node2 = await fractal_structure.add_node("node2", "node1")
        node2.patterns = {"pattern1"}
        
        # Create visualizers
        fractal_viz = FractalVisualizer(fractal_structure)
        op_viz = GitOperationVisualizer()
        metrics_viz = MetricsVisualizer()
        
        # Generate visualizations
        structure_img = tmp_path / "structure.png"
        pattern_img = tmp_path / "patterns.png"
        metrics_img = tmp_path / "metrics.png"
        
        fractal_viz.draw_structure(structure_img, show=False)
        fractal_viz.draw_pattern_distribution(pattern_img, show=False)
        
        # Add some metrics
        for i in range(10):
            metrics_viz.add_metric("test_metric", float(i), float(i))
        metrics_viz.draw_metric_trends(output_path=metrics_img, show=False)
        
        # Verify outputs
        assert structure_img.exists()
        assert pattern_img.exists()
        assert metrics_img.exists()

    @pytest.mark.asyncio
    async def test_complex_visualization_workflow(self, complex_fractal_structure, complex_git_operations, tmp_path):
        """Test complete visualization workflow with complex data"""
        # Setup complex structure
        await complex_fractal_structure.add_node("main")
        main_node = complex_fractal_structure.nodes["main"]
        main_node.patterns = {"init", "commit"}
        
        await complex_fractal_structure.add_node("feature1", "main")
        feature1_node = complex_fractal_structure.nodes["feature1"]
        feature1_node.patterns = {"branch", "commit"}
        
        await complex_fractal_structure.add_node("feature2", "main")
        feature2_node = complex_fractal_structure.nodes["feature2"]
        feature2_node.patterns = {"branch", "merge"}
        
        # Create visualizers
        fractal_viz = FractalVisualizer(complex_fractal_structure)
        op_viz = GitOperationVisualizer()
        metrics_viz = MetricsVisualizer()
        
        # Add operations
        for op in complex_git_operations:
            op_viz.add_operation(op)
            
        # Add metrics
        for i in range(50):
            metrics_viz.add_metric("commits", np.sin(i/10), float(i))
            metrics_viz.add_metric("merges", np.cos(i/10), float(i))
            
        # Generate all visualizations
        structure_img = tmp_path / "complex_structure.png"
        operations_img = tmp_path / "complex_operations.png"
        patterns_img = tmp_path / "complex_patterns.png"
        metrics_img = tmp_path / "complex_metrics.png"
        
        fractal_viz.draw_structure(structure_img, show=False)
        fractal_viz.draw_pattern_distribution(patterns_img, show=False)
        op_viz.draw_operation_graph(operations_img, show=False)
        metrics_viz.draw_metric_trends(output_path=metrics_img, show=False)
        
        # Verify all outputs
        assert structure_img.exists()
        assert operations_img.exists()
        assert patterns_img.exists()
        assert metrics_img.exists()
        
        # Verify image sizes are non-zero
        assert structure_img.stat().st_size > 0
        assert operations_img.stat().st_size > 0
        assert patterns_img.stat().st_size > 0
        assert metrics_img.stat().st_size > 0 