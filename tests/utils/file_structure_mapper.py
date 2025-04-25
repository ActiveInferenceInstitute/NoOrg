"""
File Structure Mapper Utility

This module provides utilities to recursively scan and map the repository structure.
It creates a JSON representation of the folder/file hierarchy that can be used by
LLM/Agent-enabled code development tools.
"""

import os
import json
import fnmatch
from pathlib import Path
from typing import Dict, List, Union, Optional, Set
from datetime import datetime

# Default patterns to exclude
DEFAULT_EXCLUDES = {
    # Hidden directories
    ".*",
    "__pycache__",
    "node_modules",
    ".git",
    ".github",
    # Build artifacts
    "dist",
    "build",
    "*.pyc",
    "*.pyo",
    "*.pyd",
    "*.so",
    "*.dylib",
    "*.dll",
    "*.exe",
    # Coverage reports
    "htmlcov",
    ".coverage",
    ".pytest_cache",
    ".benchmarks",
    # Large or unnecessary files
    "*.log",
    "*.dump",
}


class FileStructureMapper:
    """Maps and documents repository structure."""

    def __init__(
        self,
        root_dir: str,
        exclude_patterns: Optional[Union[List[str], Set[str]]] = None,
        max_depth: Optional[int] = None,
    ):
        """Initialize the mapper.
        
        Args:
            root_dir: Root directory to start mapping from
            exclude_patterns: List of glob patterns to exclude
            max_depth: Maximum depth to traverse (None for no limit)
        """
        self.root_dir = Path(root_dir)
        self.exclude_patterns = set(exclude_patterns or [
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
        ])
        self.max_depth = max_depth

    def _should_exclude(self, path: Path) -> bool:
        """Check if a path should be excluded based on patterns."""
        name = path.name
        return any(
            name == pat or (pat.startswith('*') and name.endswith(pat[1:]))
            for pat in self.exclude_patterns
        )

    def _get_file_info(self, file_path: Path) -> Dict:
        """Get metadata about a file."""
        stat = file_path.stat()
        return {
            "name": file_path.name,
            "size": stat.st_size,
            "modified": datetime.fromtimestamp(stat.st_mtime).isoformat(),
            "type": "file",
            "extension": file_path.suffix[1:] if file_path.suffix else None
        }

    def _get_dir_info(self, dir_path: Path) -> Dict:
        """Get metadata about a directory."""
        stat = dir_path.stat()
        return {
            "name": dir_path.name,
            "modified": datetime.fromtimestamp(stat.st_mtime).isoformat(),
            "type": "directory",
            "children": []
        }

    def _scan_directory(self, current_path: Path, depth: int = 0) -> Dict:
        """Recursively scan a directory and build structure."""
        if self.max_depth is not None and depth > self.max_depth:
            return None

        if self._should_exclude(current_path):
            return None

        if current_path.is_file():
            return self._get_file_info(current_path)

        dir_info = self._get_dir_info(current_path)

        try:
            children = sorted(current_path.iterdir(), key=lambda p: (p.is_file(), p.name))
            for child in children:
                child_info = self._scan_directory(child, depth + 1)
                if child_info:
                    dir_info["children"].append(child_info)
        except PermissionError:
            dir_info["error"] = "Permission denied"
        except Exception as e:
            dir_info["error"] = str(e)

        return dir_info

    def get_structure(self) -> Dict:
        """Get the complete structure as a dictionary."""
        return {
            "root": str(self.root_dir),
            "generated": datetime.now().isoformat(),
            "structure": self._scan_directory(self.root_dir)
        }

    def save_json_structure(self, output_file: str) -> None:
        """Save the structure as JSON."""
        structure = self.get_structure()
        with open(output_file, 'w') as f:
            json.dump(structure, f, indent=2)

    def _generate_markdown_tree(self, node: Dict, prefix: str = "", is_last: bool = True) -> List[str]:
        """Generate a markdown tree representation of a node."""
        lines = []
        
        # Add current node
        marker = "└── " if is_last else "├── "
        if node["type"] == "file":
            size = f"({node['size']} bytes)" if node.get('size') is not None else ""
            lines.append(f"{prefix}{marker}{node['name']} {size}")
        else:
            lines.append(f"{prefix}{marker}{node['name']}/")
            
            # Process children
            if "children" in node:
                new_prefix = prefix + ("    " if is_last else "│   ")
                children = node["children"]
                for i, child in enumerate(children):
                    child_lines = self._generate_markdown_tree(
                        child,
                        new_prefix,
                        i == len(children) - 1
                    )
                    lines.extend(child_lines)
        
        return lines

    def generate_markdown(self) -> str:
        """Generate a markdown representation of the structure."""
        structure = self.get_structure()
        
        lines = [
            "# Repository Structure",
            "",
            f"Generated: {structure['generated']}",
            f"Root: {structure['root']}",
            "",
            "## Directory Tree",
            "```",
            structure['root'],
        ]
        
        if "structure" in structure and structure["structure"]:
            tree_lines = self._generate_markdown_tree(structure["structure"])
            lines.extend(tree_lines)
        
        lines.append("```")
        return "\n".join(lines)

    def save_markdown_structure(self, output_file: str) -> None:
        """Save the structure as markdown."""
        markdown = self.generate_markdown()
        with open(output_file, 'w') as f:
            f.write(markdown)


def create_structure_map(
    root_dir: str = "../..",
    output_file: str = "repository_structure.json",
    exclude_patterns: Optional[Set[str]] = None,
    max_depth: Optional[int] = None,
) -> Dict:
    """
    Create a structure map of the repository.

    Args:
        root_dir: Root directory to map (relative to this file's location)
        output_file: File to save the JSON output to
        exclude_patterns: Patterns to exclude
        max_depth: Maximum depth to traverse

    Returns:
        Dictionary containing the repository structure
    """
    # Convert relative path to absolute path based on this file's location
    current_dir = Path(__file__).parent
    absolute_root = (current_dir / root_dir).resolve()
    
    mapper = FileStructureMapper(
        root_dir=absolute_root,
        exclude_patterns=exclude_patterns,
        max_depth=max_depth,
    )
    
    # Save to file if output_file is specified
    if output_file:
        output_path = current_dir / output_file
        mapper.save_json_structure(output_path)
    
    return mapper.get_structure()


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Map repository structure")
    parser.add_argument("--root-dir", required=True, help="Root directory to map")
    parser.add_argument("--output", required=True, help="Output JSON file")
    parser.add_argument("--markdown", help="Optional markdown output file")
    parser.add_argument("--exclude", nargs="*", help="Patterns to exclude")
    parser.add_argument("--max-depth", type=int, help="Maximum depth to traverse")
    
    args = parser.parse_args()
    
    mapper = FileStructureMapper(
        root_dir=args.root_dir,
        exclude_patterns=args.exclude,
        max_depth=args.max_depth
    )
    
    mapper.save_json_structure(args.output)
    if args.markdown:
        mapper.save_markdown_structure(args.markdown) 