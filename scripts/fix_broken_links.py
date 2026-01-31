#!/usr/bin/env python3
"""
Fix broken links in AGENTS.md files by calculating correct relative paths.
"""

from pathlib import Path
import re

UNITS_DIR = Path("/Users/4d/Documents/GitHub/NoOrg/units")

def get_unit_name(file_path: Path) -> str:
    """Extract the unit name from file path."""
    parts = file_path.relative_to(UNITS_DIR).parts
    return parts[0] if parts else "Unknown"

def get_depth_from_unit(file_path: Path) -> int:
    """Calculate how many directories deep we are from the unit root."""
    rel = file_path.relative_to(UNITS_DIR)
    # parts[0] is unit name, parts[-1] is filename
    # depth = number of directories between unit root and the file
    return len(rel.parts) - 2  # -1 for unit name, -1 for filename

def generate_correct_paths(depth: int) -> str:
    """Generate correct relative path prefix based on depth."""
    if depth <= 0:
        return "./"
    return "../" * depth

def fix_agents_file(file_path: Path) -> tuple[bool, str]:
    """Fix AGENTS.md file with correct relative paths."""
    
    unit_name = get_unit_name(file_path)
    depth = get_depth_from_unit(file_path)
    prefix = generate_correct_paths(depth)
    parent_dir = file_path.parent.name
    
    # Check if this is a committee file
    is_committee = "Committee" in parent_dir
    
    try:
        content = file_path.read_text()
        original_content = content
        
        # Fix common broken patterns
        # Pattern 1: ../Charter.md when depth > 1
        content = re.sub(
            r'\[([^\]]*Charter[^\]]*)\]\(\.\./Charter\.md\)',
            f'[{unit_name} Charter]({prefix}Charter.md)',
            content
        )
        
        # Pattern 2: ../Policies/ when depth > 1
        content = re.sub(
            r'\[Unit Policies\]\(\.\./Policies/\)',
            f'[Unit Policies]({prefix}Policies/)',
            content
        )
        
        # Pattern 3: ../Processes/ when depth > 1
        content = re.sub(
            r'\[Unit Processes\]\(\.\./Processes/\)',
            f'[Unit Processes]({prefix}Processes/)',
            content
        )
        
        # Pattern 4: ./Charter.md for committees (usually need to go up)
        if is_committee:
            content = re.sub(
                r'\[Committee Charter\]\(\./Charter\.md\)',
                f'[Committee Charter](./Charter.md)',
                content
            )
        
        # Pattern 5: Fix unit name in charter reference
        content = re.sub(
            r'\[([A-Za-z]+) Charter\]\(\.\./Charter\.md\)',
            f'[{unit_name} Charter]({prefix}Charter.md)',
            content
        )
        
        if content != original_content:
            file_path.write_text(content)
            return (True, f"Fixed: {file_path.relative_to(UNITS_DIR)}")
        
        return (False, f"No changes: {file_path.relative_to(UNITS_DIR)}")
        
    except Exception as e:
        return (False, f"Error: {file_path.relative_to(UNITS_DIR)} - {e}")

def validate_links(file_path: Path) -> list[str]:
    """Check markdown links in a file for validity."""
    broken = []
    try:
        content = file_path.read_text()
        links = re.findall(r'\[([^\]]+)\]\(([^)]+)\)', content)
        
        for text, link in links:
            if link.startswith(('http://', 'https://', '#', 'mailto:')):
                continue
            
            if link.startswith('./'):
                target = file_path.parent / link[2:]
            elif link.startswith('../'):
                target = file_path.parent / link
            else:
                target = file_path.parent / link
            
            target_str = str(target).split('#')[0]
            target = Path(target_str)
            
            if not target.exists():
                broken.append(f"  [{text}]({link})")
    except Exception as e:
        broken.append(f"  Error: {e}")
    
    return broken

def main():
    print("=" * 60)
    print("Scanning for AGENTS.md files that might have broken links")
    print("=" * 60)
    
    # Find all AGENTS.md files that are at depth > 1
    agents_files = []
    for f in UNITS_DIR.rglob("AGENTS.md"):
        depth = get_depth_from_unit(f)
        if depth >= 1:
            agents_files.append(f)
    
    print(f"Found {len(agents_files)} nested AGENTS.md files to check\n")
    
    fixed = 0
    still_broken = []
    
    for f in agents_files:
        success, msg = fix_agents_file(f)
        if success:
            print(f"✓ {msg}")
            fixed += 1
        
        # Check if links are now valid
        broken = validate_links(f)
        if broken:
            still_broken.append((f, broken))
    
    print(f"\n{'=' * 60}")
    print(f"Fixed {fixed} files")
    
    if still_broken:
        print(f"\n{len(still_broken)} files still have broken links:")
        for f, links in still_broken[:20]:  # Show first 20
            print(f"\n{f.relative_to(UNITS_DIR)}:")
            for link in links:
                print(f"  {link}")
    else:
        print("\n✓ All links now valid!")

if __name__ == "__main__":
    main()
