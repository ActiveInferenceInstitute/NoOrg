#!/usr/bin/env python3
"""
Unified Test Runner for Python Tests

This script provides a single entry point for running all Python tests,
with support for running different test types and generating reports.

Usage:
    python tests/runners/run_py.py [options]

Options:
    --test-type TYPE    Run tests of a specific type (unit, integration, system, all)
    --markers MARKERS   Only run tests with specific markers
    --coverage          Generate coverage report
    --report            Generate test reports
    --verbose           Show verbose output
"""

import os
import sys
import argparse
import subprocess
import json
from datetime import datetime
from pathlib import Path


def parse_args():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(description="Unified Python Test Runner")
    
    parser.add_argument(
        "--test-type",
        choices=["unit", "integration", "system", "all"],
        default="all",
        help="Type of tests to run"
    )
    
    parser.add_argument(
        "--markers",
        help="Only run tests with specific markers"
    )
    
    parser.add_argument(
        "--coverage",
        action="store_true",
        help="Generate coverage report"
    )
    
    parser.add_argument(
        "--report",
        action="store_true",
        help="Generate test report"
    )
    
    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Show verbose output"
    )

    parser.add_argument(
        "files",
        nargs="*",
        help="Specific test files to run"
    )
    
    return parser.parse_args()


def get_test_files(test_type, specified_files=None):
    """Get test files based on test type."""
    if specified_files:
        return specified_files
    
    repo_root = Path(__file__).parent.parent.parent
    test_dir = repo_root / "tests"
    
    if test_type == "all":
        return [str(test_dir)]
    else:
        type_dir = test_dir / test_type
        if type_dir.exists():
            return [str(type_dir)]
        else:
            print(f"Error: Test directory {type_dir} does not exist")
            sys.exit(1)


def run_pytest(test_files, args):
    """Run pytest with specified arguments."""
    repo_root = Path(__file__).parent.parent.parent
    test_dir = repo_root / "tests"
    
    # Base pytest command
    pytest_args = ["pytest"]
    
    # Add verbosity
    if args.verbose:
        pytest_args.append("-v")
    
    # Add markers
    if args.markers:
        pytest_args.extend(["-m", args.markers])
    
    # Add coverage
    if args.coverage:
        pytest_args.extend([
            "--cov=src",
            "--cov-report=term-missing",
            "--cov-report=html:tests/reports/coverage"
        ])
    
    # Add reporting
    if args.report:
        reports_dir = test_dir / "reports"
        reports_dir.mkdir(exist_ok=True, parents=True)
        
        timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
        report_file = reports_dir / f"test-report-{timestamp}.json"
        
        pytest_args.extend([
            "--json-report",
            f"--json-report-file={report_file}"
        ])
    
    # Add test files
    pytest_args.extend(test_files)
    
    # Run pytest
    print("=" * 60)
    print(f"🧪 Running pytest with: {' '.join(pytest_args)}")
    print("=" * 60)
    
    result = subprocess.run(pytest_args)
    return result.returncode


def analyze_repo_structure():
    """Run the repository structure analysis."""
    repo_root = Path(__file__).parent.parent.parent
    test_dir = repo_root / "tests"
    
    # Structure tests
    structure_tests = [
        test_dir / "test_repo_structure.py",
        test_dir / "test_codebase_relationships.py"
    ]
    
    # Check if files exist
    if not all(f.exists() for f in structure_tests):
        print("Structure test files not found, skipping structure analysis")
        return 0
    
    # Run pytest for structure analysis
    print("\n" + "=" * 60)
    print("🔍 Running Repository Structure Analysis")
    print("=" * 60)
    
    pytest_args = ["pytest", "-xvs"] + [str(f) for f in structure_tests]
    result = subprocess.run(pytest_args)
    
    # Create README files for generated documentation
    data_dir = test_dir / "data"
    if data_dir.exists():
        structure_dir = data_dir / "repo_structure"
        relationship_dir = data_dir / "codebase_relationships"
        
        if structure_dir.exists():
            print("\nRepository Structure Files:")
            for file in sorted(structure_dir.glob("*.md")):
                print(f"  - {file.name}")
            
            for file in sorted(structure_dir.glob("*.json")):
                print(f"  - {file.name}")
        
        if relationship_dir.exists():
            print("\nCodebase Relationship Files:")
            for file in sorted(relationship_dir.glob("*.md")):
                print(f"  - {file.name}")
            
            for file in sorted(relationship_dir.glob("*.json")):
                print(f"  - {file.name}")
    
    return result.returncode


def main():
    """Main entry point."""
    args = parse_args()
    
    print("==================================")
    print("🧪 Unified Python Test Runner")
    print("==================================")
    print(f"Test type: {args.test_type}")
    print(f"Markers: {args.markers}")
    print(f"Coverage: {args.coverage}")
    print(f"Report: {args.report}")
    
    # Get test files
    test_files = get_test_files(args.test_type, args.files)
    
    # Run tests
    exit_code = run_pytest(test_files, args)
    
    # Run structure analysis if requested
    if args.test_type == "all" or "structure" in (args.markers or ""):
        structure_exit_code = analyze_repo_structure()
        if structure_exit_code != 0 and exit_code == 0:
            exit_code = structure_exit_code
    
    if exit_code == 0:
        print("\n✅ All tests passed successfully")
    else:
        print(f"\n❌ Tests failed with exit code {exit_code}")
    
    return exit_code


if __name__ == "__main__":
    sys.exit(main()) 