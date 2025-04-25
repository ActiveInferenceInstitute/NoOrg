import os
import re
import logging
from pathlib import Path

# --- Configuration ---
SCRIPT_DIR = Path(__file__).parent.resolve()
WORKSPACE_ROOT = SCRIPT_DIR.parent.parent # Assumes script is in src/scripts/
UNITS_DIR = WORKSPACE_ROOT / "units"
STANDARD_SUBFOLDERS = ["MeetingNotes", "Policies", "Processes", "Reports"]
INDEX_FILENAME = "index.md"
LOG_FILENAME = "units_audit.log"
WIKI_LINK_PATTERN = re.compile(r"\[\[.*?\]\]")
PASCAL_CASE_PATTERN = re.compile(r"^[A-Z][a-zA-Z0-9]*$") # Simple PascalCase check

# --- Logging Setup ---
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(LOG_FILENAME),
        logging.StreamHandler() # Also print to console
    ]
)

# --- Helper Functions ---

def is_valid_unit(item_path: Path) -> bool:
    """Check if an item in the units directory is a valid unit folder."""
    # Simple check: is it a directory and not hidden?
    return item_path.is_dir() and not item_path.name.startswith('.')

def check_and_create_subfolders(unit_path: Path):
    """Ensures standard subfolders exist within a unit directory."""
    logging.info(f"Checking standard subfolders for unit: {unit_path.name}")
    for folder_name in STANDARD_SUBFOLDERS:
        subfolder_path = unit_path / folder_name
        if not subfolder_path.exists():
            try:
                subfolder_path.mkdir()
                logging.warning(f"CREATED missing standard subfolder: {subfolder_path}")
            except OSError as e:
                logging.error(f"FAILED to create subfolder {subfolder_path}: {e}")
        elif not subfolder_path.is_dir():
            logging.error(f"Expected directory but found file at: {subfolder_path}")

def check_naming_conventions(unit_path: Path):
    """Checks naming convention for the unit directory itself."""
    unit_name = unit_path.name
    if not PASCAL_CASE_PATTERN.match(unit_name):
        logging.warning(f"Naming Convention Issue: Unit directory '{unit_name}' may not be PascalCase.")
    # Could be extended to check subfolders/files recursively if needed

def create_basic_index_content(unit_name: str) -> str:
    """Generates basic markdown content for an index file."""
    content = f"# {unit_name}\n\n"
    content += "## Standard Sections\n\n"
    for folder in STANDARD_SUBFOLDERS:
        # Basic link assumes subfolders contain index pages or navigable content
        content += f"- [[{folder}/]]\n" # Link to the folder itself
    content += "\n## Overview\n\n(Add a brief description of this unit here)\n"
    return content

def check_and_create_index(unit_path: Path):
    """Ensures an index.md file exists in the unit directory."""
    index_path = unit_path / INDEX_FILENAME
    if not index_path.exists():
        try:
            content = create_basic_index_content(unit_path.name)
            with open(index_path, 'w', encoding='utf-8') as f:
                f.write(content)
            logging.warning(f"CREATED missing index file: {index_path}")
        except OSError as e:
            logging.error(f"FAILED to create index file {index_path}: {e}")
    elif not index_path.is_file():
        logging.error(f"Expected index file but found directory at: {index_path}")

def check_wiki_links(file_path: Path):
    """Checks if a markdown file contains any [[wiki links]]."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        if not WIKI_LINK_PATTERN.search(content):
            logging.info(f"Link Check: No [[wiki links]] found in: {file_path}")
    except Exception as e:
        logging.error(f"FAILED to read or check links in {file_path}: {e}")

# --- Main Audit Function ---

def audit_units_directory():
    """Performs the full audit and update process on the units directory."""
    logging.info(f"--- Starting Units Directory Audit ({UNITS_DIR}) ---")
    if not UNITS_DIR.exists() or not UNITS_DIR.is_dir():
        logging.error(f"Units directory not found or is not a directory: {UNITS_DIR}")
        return

    found_files_without_links = False

    for item in UNITS_DIR.iterdir():
        if is_valid_unit(item):
            unit_path = item
            logging.info(f"Processing Unit: {unit_path.name}")

            # 1. Check Naming Convention
            check_naming_conventions(unit_path)

            # 2. Check/Create Standard Subfolders
            check_and_create_subfolders(unit_path)

            # 3. Check/Create Index File
            check_and_create_index(unit_path)

            # 4. Scan Markdown Files for Links
            logging.info(f"Scanning for wiki links in unit: {unit_path.name}")
            for md_file in unit_path.rglob('*.md'):
                if md_file.name.lower() != INDEX_FILENAME.lower(): # Skip checking index files themselves for now
                     check_wiki_links(md_file)
                     # We only need to know *if* there are files without links, not track them individually here for the summary
                     try:
                         with open(md_file, 'r', encoding='utf-8') as f:
                             content = f.read()
                         if not WIKI_LINK_PATTERN.search(content):
                              found_files_without_links = True
                     except Exception:
                         pass # Error already logged by check_wiki_links


        elif item.is_file() and item.name.lower() == "unitdirectory.md":
             logging.info(f"Found top-level file: {item.name}. Skipping unit-specific checks.")
             check_wiki_links(item) # Check the top-level file too
        elif item.is_dir() and item.name.startswith('.'):
             logging.info(f"Skipping hidden directory: {item.name}")
        elif item.is_file():
             logging.warning(f"Unexpected file found directly under units/: {item.name}")


    logging.info(f"--- Units Directory Audit Complete ---")
    if found_files_without_links:
        logging.info("NOTE: Some markdown files were found without [[wiki links]]. See details above.")
    else:
        logging.info("All scanned markdown files appear to contain [[wiki links]].")
    logging.info(f"Log file saved to: {LOG_FILENAME}")


# --- Script Execution ---
if __name__ == "__main__":
    audit_units_directory()
