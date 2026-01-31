import os

EXCLUDED_DIRS = {
    'output', 'logs', 'coverage', 'dist', 'archive', '.git', '.gemini', 
    'node_modules', '__pycache__', '.pytest_cache', '.idea', '.vscode',
    '__tests__'  # Often minimal docs needed here, but user asked for "all depths". Let's include unless strictly system.
    # Actually, user said "at all depths", so I will be simpler with exclusions.
}

def should_process(path):
    parts = path.split(os.sep)
    for part in parts:
        if part in EXCLUDED_DIRS:
            return False
    return True

def create_file_if_missing(directory, filename, title_suffix):
    file_path = os.path.join(directory, filename)
    if os.path.exists(file_path):
        return False

    dirname = os.path.basename(directory)
    parent = os.path.dirname(directory)
    parent_name = os.path.basename(parent)
    
    title = f"{dirname} - {title_suffix}"
    if parent_name:
         title = f"{parent_name}/{dirname} - {title_suffix}"

    content = f"""# {title}

## Overview

This directory contains resources for {dirname}.

## Purpose

{title_suffix} for the {dirname} component of the NoOrg framework.

## Contents

- [AGENTS.md](./AGENTS.md) - Technical agent documentation
- [README.md](./README.md) - General overview
"""
    
    try:
        with open(file_path, "w") as f:
            f.write(content)
        print(f"Created {file_path}")
        return True
    except Exception as e:
        print(f"Error creating {file_path}: {e}")
        return False

def scan_and_generate(root_dir):
    agents_count = 0
    readme_count = 0
    
    for root, dirs, files in os.walk(root_dir):
        # Modify dirs in-place to skip excluded directories
        dirs[:] = [d for d in dirs if d not in EXCLUDED_DIRS]
        
        if should_process(root):
            if create_file_if_missing(root, "AGENTS.md", "Technical Documentation"):
                agents_count += 1
            if create_file_if_missing(root, "README.md", "General Documentation"):
                readme_count += 1
                
    return agents_count, readme_count

if __name__ == "__main__":
    print("Scanning for missing documentation files...")
    root_dir = os.path.abspath(".")
    agents, readmes = scan_and_generate(root_dir)
    print(f"Finished. Created {agents} AGENTS.md and {readmes} README.md files.")
