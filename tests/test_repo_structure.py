"""
Repository Structure Test Suite

This module contains tests that document and validate the repository structure.
These tests provide a snapshot of the codebase organization to facilitate
LLM/Agent-enabled code development.
"""

import os
import json
import pytest
from pathlib import Path
from tests.utils.file_structure_mapper import FileStructureMapper


class TestRepositoryStructure:
    """Test class for repository structure documentation and validation."""

    @pytest.fixture
    def repo_root(self):
        """Get the repository root directory."""
        return Path(os.path.dirname(os.path.dirname(__file__)))

    @pytest.fixture
    def structure_mapper(self, repo_root):
        """Create a FileStructureMapper instance."""
        return FileStructureMapper(
            root_dir=str(repo_root),
            exclude_patterns=[
                "*.pyc",
                "__pycache__",
                "node_modules",
                ".git",
                ".pytest_cache",
                "*.egg-info",
                "dist",
                "build",
                ".coverage",
                ".hypothesis",
                ".mypy_cache",
                ".ruff_cache",
                ".tox",
                ".venv",
                "venv",
                "env",
            ]
        )

    def test_generate_repo_structure_json(self, structure_mapper, repo_root):
        """
        Generate and save the repository structure as JSON.
        
        This test documents the complete repository structure as JSON for tooling use.
        """
        # Define output directories
        output_dir = repo_root / "tests" / "data" / "repo_structure"
        output_dir.mkdir(exist_ok=True, parents=True)
        
        # Generate and save the full structure
        json_file = output_dir / "repository_structure.json"
        structure_mapper.save_json_structure(str(json_file))
        
        # Verify the file was created and is valid JSON
        assert json_file.exists(), f"Repository structure file not created: {json_file}"
        
        with open(json_file, "r") as f:
            structure = json.load(f)
        
        # Basic validations
        assert "root" in structure, "Repository structure missing 'root' key"
        assert "structure" in structure, "Repository structure missing 'structure' key"

    def test_generate_repo_structure_markdown(self, structure_mapper, repo_root):
        """
        Generate and save the repository structure as Markdown.
        
        This test creates a human-readable representation of the repository structure.
        """
        # Define output directories
        output_dir = repo_root / "tests" / "data" / "repo_structure"
        output_dir.mkdir(exist_ok=True, parents=True)
        
        # Save markdown file
        md_file = output_dir / "repository_structure.md"
        structure_mapper.save_markdown_structure(str(md_file))
        
        # Verify the file was created
        assert md_file.exists(), f"Repository structure markdown file not created: {md_file}"

    def test_main_directories_exist(self, repo_root):
        """
        Verify that all expected main directories exist.
        
        This test validates that the repository has the expected top-level structure.
        """
        expected_directories = [
            "agents",
            "docs",
            "tests",
            "units",
            "src",
            "examples",
        ]
        
        for dir_name in expected_directories:
            dir_path = repo_root / dir_name
            assert dir_path.exists(), f"Expected directory missing: {dir_name}"
            assert dir_path.is_dir(), f"Expected {dir_name} to be a directory, but it's a file"

    def test_document_source_structure(self, repo_root):
        """
        Document the source code structure for agents, frameworks, and operations.
        
        This test maps the structure of the main source code directories and saves it.
        """
        # Define output directory
        output_dir = repo_root / "tests" / "data" / "repo_structure"
        output_dir.mkdir(exist_ok=True, parents=True)
        
        # Map each main source directory
        source_dirs = ["agents", "frameworks", "operations", "docs"]
        
        for dir_name in source_dirs:
            dir_path = repo_root / dir_name
            if not dir_path.exists():
                continue
                
            # Create a mapper for this directory
            dir_mapper = FileStructureMapper(
                root_dir=str(dir_path),
                exclude_patterns=["__pycache__", "*.pyc", "node_modules"],
            )
            
            # Generate JSON and save
            json_file = output_dir / f"{dir_name}_structure.json"
            dir_mapper.save_json_structure(str(json_file))
            
            # Generate markdown and save
            md_file = output_dir / f"{dir_name}_structure.md"
            dir_mapper.save_markdown_structure(str(md_file))
            
            assert json_file.exists()
            assert md_file.exists()

    def test_document_test_structure(self, repo_root):
        """
        Document the test structure.
        
        This test maps the structure of the test directory.
        """
        # Define output directory
        output_dir = repo_root / "tests" / "data" / "repo_structure"
        output_dir.mkdir(exist_ok=True, parents=True)
        
        # Create a mapper for the test directory
        test_dir = repo_root / "tests"
        test_mapper = FileStructureMapper(
            root_dir=str(test_dir),
            exclude_patterns=["__pycache__", "*.pyc", ".pytest_cache", "htmlcov", ".coverage"],
        )
        
        # Generate JSON and save
        json_file = output_dir / "tests_structure.json"
        test_mapper.save_json_structure(str(json_file))
        
        # Generate markdown and save
        md_file = output_dir / "tests_structure.md"
        test_mapper.save_markdown_structure(str(md_file))
        
        assert json_file.exists()
        assert md_file.exists()

    def test_document_file_extensions(self, repo_root):
        """
        Document all file extensions used in the repository.
        
        This test extracts and counts all file extensions to help understand 
        the types of files in the codebase.
        """
        # Define output directory
        output_dir = repo_root / "tests" / "data" / "repo_structure"
        output_dir.mkdir(exist_ok=True, parents=True)
        
        extensions = {}
        
        # Walk through the repository and count extensions
        for root, _, files in os.walk(str(repo_root)):
            for file in files:
                ext = os.path.splitext(file)[1]
                if ext:
                    extensions[ext] = extensions.get(ext, 0) + 1
        
        # Sort by count (descending)
        sorted_extensions = sorted(
            extensions.items(), key=lambda x: x[1], reverse=True
        )
        
        # Create a markdown report
        lines = [
            "# File Extensions in Repository",
            "",
            "| Extension | Count |",
            "|-----------|-------|",
        ]
        
        for ext, count in sorted_extensions:
            lines.append(f"| {ext} | {count} |")
        
        # Save the report
        md_file = output_dir / "file_extensions.md"
        with open(md_file, "w") as f:
            f.write("\n".join(lines))
        
        # Also save as JSON for programmatic use
        json_file = output_dir / "file_extensions.json"
        with open(json_file, "w") as f:
            json.dump(dict(sorted_extensions), f, indent=2)


if __name__ == "__main__":
    pytest.main(["-xvs", __file__]) 