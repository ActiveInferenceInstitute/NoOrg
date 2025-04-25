"""
FractiGit Core Tests
"""

import pytest
import asyncio
from pathlib import Path
from typing import Dict, List
from ..core.base import FractalConfig, FractalNode, FractalStructure
from ..core.git_ops import (
    GitOperation,
    GitOperationManager,
    GitRepositoryManager,
    GitBranchManager
)

@pytest.fixture
def config():
    """Fixture for FractalConfig"""
    return FractalConfig(
        pattern_depth=3,
        branching_factor=2,
        scaling_factor=1.5,
        adaptation_rate=0.1,
        pattern_threshold=0.8
    )

@pytest.fixture
def fractal_structure(config):
    """Fixture for FractalStructure"""
    return FractalStructure(config)

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
def operation_manager(config):
    """Fixture for GitOperationManager"""
    return GitOperationManager(config)

@pytest.fixture
def repository_manager(config, tmp_path):
    """Fixture for GitRepositoryManager"""
    return GitRepositoryManager(tmp_path, config)

@pytest.fixture
def branch_manager(config):
    """Fixture for GitBranchManager"""
    return GitBranchManager(config)

class TestFractalStructure:
    """Tests for FractalStructure"""
    
    @pytest.mark.asyncio
    async def test_init_structure(self, fractal_structure):
        """Test structure initialization"""
        assert fractal_structure.root is not None
        assert fractal_structure.root.node_id == "root"
        assert fractal_structure.root.level == 0
        
    @pytest.mark.asyncio
    async def test_add_node(self, fractal_structure):
        """Test adding nodes"""
        node = await fractal_structure.add_node("test_node")
        assert node in fractal_structure.root.children
        assert node.level == 1
        assert node.parent == fractal_structure.root
        
    @pytest.mark.asyncio
    async def test_remove_node(self, fractal_structure):
        """Test removing nodes"""
        node = await fractal_structure.add_node("test_node")
        await fractal_structure.remove_node("test_node")
        assert node not in fractal_structure.root.children
        assert "test_node" not in fractal_structure.nodes
        
    @pytest.mark.asyncio
    async def test_get_subtree(self, fractal_structure):
        """Test getting subtree"""
        node1 = await fractal_structure.add_node("node1")
        node2 = await fractal_structure.add_node("node2", "node1")
        subtree = await fractal_structure.get_subtree("node1")
        assert len(subtree) == 2
        assert node1 in subtree
        assert node2 in subtree

class TestGitOperationManager:
    """Tests for GitOperationManager"""
    
    @pytest.mark.asyncio
    async def test_queue_operation(self, operation_manager, git_operation):
        """Test queuing operations"""
        await operation_manager.queue_operation(git_operation)
        assert len(operation_manager.operation_history) == 1
        assert git_operation.pattern in operation_manager.operation_patterns
        
    @pytest.mark.asyncio
    async def test_operation_priority(self, operation_manager):
        """Test operation priority handling"""
        op1 = GitOperation("cmd1", {}, "pattern1", 0, 1)
        op2 = GitOperation("cmd2", {}, "pattern2", 0, 2)
        await operation_manager.queue_operation(op1)
        await operation_manager.queue_operation(op2)
        next_op = operation_manager._get_next_operation()
        assert next_op.priority == 2
        
    @pytest.mark.asyncio
    async def test_pattern_evolution(self, operation_manager, git_operation):
        """Test pattern evolution"""
        await operation_manager.queue_operation(git_operation)
        await operation_manager.evolve_patterns()
        # Add assertions for pattern evolution

class TestGitRepositoryManager:
    """Tests for GitRepositoryManager"""
    
    @pytest.mark.asyncio
    async def test_init_repository(self, repository_manager, tmp_path):
        """Test repository initialization"""
        repo_path = tmp_path / "test_repo"
        await repository_manager.init_repository(repo_path)
        assert str(repo_path) in repository_manager.repositories
        
    @pytest.mark.asyncio
    async def test_add_submodule(self, repository_manager, tmp_path):
        """Test adding submodule"""
        repo_path = tmp_path / "test_repo"
        submodule_url = "https://example.com/repo.git"
        await repository_manager.init_repository(repo_path)
        await repository_manager.add_submodule(submodule_url, repo_path / "submodule")
        # Add assertions for submodule addition

class TestGitBranchManager:
    """Tests for GitBranchManager"""
    
    @pytest.mark.asyncio
    async def test_create_branch(self, branch_manager):
        """Test branch creation"""
        await branch_manager.create_branch("test-branch")
        # Add assertions for branch creation
        
    @pytest.mark.asyncio
    async def test_pattern_branch(self, branch_manager):
        """Test pattern-based branch creation"""
        pattern = "feature/{level}/{component}"
        name = "feature/1/auth"
        await branch_manager.create_pattern_branch(pattern, name)
        assert pattern in branch_manager.branch_patterns
        assert name in branch_manager.branch_patterns[pattern]

@pytest.mark.integration
class TestIntegration:
    """Integration tests"""
    
    @pytest.mark.asyncio
    async def test_full_workflow(self, repository_manager, branch_manager, tmp_path):
        """Test complete workflow"""
        # Initialize repository
        repo_path = tmp_path / "test_repo"
        await repository_manager.init_repository(repo_path)
        
        # Create branches
        await branch_manager.create_pattern_branch(
            "feature/{level}",
            "feature/1"
        )
        
        # Add submodule
        submodule_url = "https://example.com/repo.git"
        await repository_manager.add_submodule(
            submodule_url,
            repo_path / "submodule"
        )
        
        # Verify state
        assert str(repo_path) in repository_manager.repositories
        assert "feature/1" in branch_manager.branch_patterns["feature/{level}"] 