"""Tests for analyzing and documenting codebase relationships."""

import json
import os
import re
from pathlib import Path

import pytest

from tests.utils.file_structure_mapper import FileStructureMapper

class TestCodebaseRelationships:
    """Test suite for analyzing and documenting codebase relationships."""
    
    # Regular expressions for scanning imports and links
    PYTHON_IMPORT_RE = re.compile(r'^(?:from|import)\s+([.\w]+)(?:\s+import\s+[.\w]+)?')
    TS_IMPORT_RE = re.compile(r'(?:import|from)\s+[\'"]([^\'"]*)[\'"]\s*;?')
    MARKDOWN_LINK_RE = re.compile(r'\[\[([^\]]+)\]\]|\[([^\]]+)\]\(([^)]+)\)')
    
    @pytest.fixture
    def repo_root(self):
        """Get the repository root directory."""
        return Path(os.path.dirname(os.path.dirname(__file__)))
    
    @pytest.fixture
    def output_dir(self, repo_root):
        """Get the output directory for relationship data."""
        output_dir = repo_root / "tests/data/codebase_relationships"
        output_dir.mkdir(parents=True, exist_ok=True)
        return output_dir
    
    def _scan_python_imports(self, file_path):
        """Scan Python file for import statements."""
        imports = set()
        with open(file_path) as f:
            for line in f:
                match = self.PYTHON_IMPORT_RE.match(line.strip())
                if match:
                    imports.add(match.group(1))
        return imports
    
    def _scan_typescript_imports(self, file_path):
        """Scan TypeScript/JavaScript file for import statements."""
        imports = set()
        with open(file_path) as f:
            content = f.read()
            for match in self.TS_IMPORT_RE.finditer(content):
                imports.add(match.group(1))
        return imports
    
    def _scan_markdown_links(self, file_path):
        """Scan Markdown file for internal links."""
        links = set()
        with open(file_path) as f:
            content = f.read()
            for match in self.MARKDOWN_LINK_RE.finditer(content):
                if match.group(1):  # Wiki-style link [[target]]
                    links.add(match.group(1))
                elif match.group(3):  # Standard link [text](target)
                    links.add(match.group(3))
        return links
    
    def _get_file_dependencies(self, file_path):
        """Get dependencies based on file extension."""
        ext = file_path.suffix.lower()
        if ext in {'.py', '.pyi'}:
            return self._scan_python_imports(file_path)
        elif ext in {'.ts', '.tsx', '.js', '.jsx'}:
            return self._scan_typescript_imports(file_path)
        elif ext in {'.md', '.mdx'}:
            return self._scan_markdown_links(file_path)
        return set()
    
    def _scan_directory_dependencies(self, directory, exclude_patterns=None):
        """Recursively scan directory for file dependencies."""
        exclude_patterns = exclude_patterns or {
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
        }
        
        dependencies = {}
        for root, dirs, files in os.walk(directory):
            # Filter out excluded directories
            dirs[:] = [d for d in dirs if not any(
                d == pat or (pat.startswith('*') and d.endswith(pat[1:]))
                for pat in exclude_patterns
            )]
            
            for file in files:
                if any(file.endswith(pat[1:]) for pat in exclude_patterns if pat.startswith('*')):
                    continue
                
                file_path = Path(root) / file
                try:
                    deps = self._get_file_dependencies(file_path)
                    if deps:
                        dependencies[str(file_path.relative_to(directory))] = list(deps)
                except Exception as e:
                    print(f"Error processing {file_path}: {e}")
        
        return dependencies
    
    def test_document_python_dependencies(self, repo_root, output_dir):
        """Test documenting Python import dependencies."""
        python_deps = {}
        for dir_name in ['agents', 'src', 'tests', 'examples']:
            dir_path = repo_root / dir_name
            if dir_path.exists():
                deps = self._scan_directory_dependencies(dir_path)
                if deps:
                    python_deps[dir_name] = deps
        
        output_file = output_dir / "python_dependencies.json"
        with open(output_file, 'w') as f:
            json.dump(python_deps, f, indent=2)
        
        assert output_file.exists()
        with open(output_file) as f:
            data = json.load(f)
            assert isinstance(data, dict)
    
    def test_document_typescript_dependencies(self, repo_root, output_dir):
        """Test documenting TypeScript/JavaScript import dependencies."""
        ts_deps = {}
        for dir_name in ['agents', 'src', 'examples']:
            dir_path = repo_root / dir_name
            if dir_path.exists():
                deps = self._scan_directory_dependencies(dir_path)
                if deps:
                    ts_deps[dir_name] = deps
        
        output_file = output_dir / "typescript_dependencies.json"
        with open(output_file, 'w') as f:
            json.dump(ts_deps, f, indent=2)
        
        assert output_file.exists()
        with open(output_file) as f:
            data = json.load(f)
            assert isinstance(data, dict)
    
    def test_document_markdown_links(self, repo_root, output_dir):
        """Test documenting Markdown file relationships."""
        md_links = {}
        for dir_name in ['docs', 'meta']:
            dir_path = repo_root / dir_name
            if dir_path.exists():
                links = self._scan_directory_dependencies(dir_path)
                if links:
                    md_links[dir_name] = links
        
        output_file = output_dir / "markdown_links.json"
        with open(output_file, 'w') as f:
            json.dump(md_links, f, indent=2)
        
        assert output_file.exists()
        with open(output_file) as f:
            data = json.load(f)
            assert isinstance(data, dict)
    
    def test_generate_dependency_metrics(self, repo_root, output_dir):
        """Test generating metrics about dependencies."""
        metrics = {
            'total_files': 0,
            'files_with_dependencies': 0,
            'total_dependencies': 0,
            'dependencies_by_type': {
                'python': 0,
                'typescript': 0,
                'markdown': 0
            }
        }
        
        for dir_name in ['agents', 'src', 'docs', 'tests', 'examples']:
            dir_path = repo_root / dir_name
            if dir_path.exists():
                for root, _, files in os.walk(dir_path):
                    metrics['total_files'] += len(files)
                    for file in files:
                        file_path = Path(root) / file
                        try:
                            deps = self._get_file_dependencies(file_path)
                            if deps:
                                metrics['files_with_dependencies'] += 1
                                metrics['total_dependencies'] += len(deps)
                                
                                ext = file_path.suffix.lower()
                                if ext in {'.py', '.pyi'}:
                                    metrics['dependencies_by_type']['python'] += len(deps)
                                elif ext in {'.ts', '.tsx', '.js', '.jsx'}:
                                    metrics['dependencies_by_type']['typescript'] += len(deps)
                                elif ext in {'.md', '.mdx'}:
                                    metrics['dependencies_by_type']['markdown'] += len(deps)
                        except Exception as e:
                            print(f"Error processing {file_path}: {e}")
        
        # Save metrics as JSON
        json_file = output_dir / "dependency_metrics.json"
        with open(json_file, 'w') as f:
            json.dump(metrics, f, indent=2)
        
        # Generate markdown report
        md_file = output_dir / "dependency_metrics.md"
        with open(md_file, 'w') as f:
            f.write("# Codebase Dependency Metrics\n\n")
            f.write(f"- Total Files: {metrics['total_files']}\n")
            f.write(f"- Files with Dependencies: {metrics['files_with_dependencies']}\n")
            f.write(f"- Total Dependencies: {metrics['total_dependencies']}\n\n")
            
            f.write("## Dependencies by Type\n\n")
            f.write("| Type | Count |\n")
            f.write("|------|-------|\n")
            for type_name, count in metrics['dependencies_by_type'].items():
                f.write(f"| {type_name} | {count} |\n")
        
        assert json_file.exists()
        assert md_file.exists()


if __name__ == "__main__":
    pytest.main(["-xvs", __file__]) 