import os
from pathlib import Path
import logging
import json
from datetime import datetime

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def get_file_size(file_path):
    size_bytes = os.path.getsize(file_path)
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size_bytes < 1024:
            return f"{size_bytes:.2f} {unit}"
        size_bytes /= 1024
    return f"{size_bytes:.2f} TB"

def check_static_files():
    # Get the absolute path of the static directory
    static_dir = Path(__file__).parent / "static"
    logger.info(f"Starting static files check at: {datetime.now().isoformat()}")
    logger.info(f"Static directory path: {static_dir}")

    # Check if static directory exists
    if not static_dir.exists():
        logger.error(f"Static directory does not exist at {static_dir}")
        return

    # Initialize statistics
    stats = {
        "total_files": 0,
        "total_size": 0,
        "file_types": {},
        "largest_files": []
    }

    # List all files in static directory with detailed information
    logger.info("\nFiles in static directory:")
    for root, dirs, files in os.walk(static_dir):
        level = root.replace(str(static_dir), '').count(os.sep)
        indent = ' ' * 4 * level
        relative_path = os.path.relpath(root, static_dir)
        logger.info(f"{indent}📁 {relative_path}/")
        
        subindent = ' ' * 4 * (level + 1)
        for f in files:
            file_path = Path(root) / f
            file_size = os.path.getsize(file_path)
            stats["total_files"] += 1
            stats["total_size"] += file_size
            
            # Track file types
            ext = os.path.splitext(f)[1].lower()
            stats["file_types"][ext] = stats["file_types"].get(ext, 0) + 1
            
            # Track largest files
            stats["largest_files"].append((str(file_path), file_size))
            stats["largest_files"].sort(key=lambda x: x[1], reverse=True)
            stats["largest_files"] = stats["largest_files"][:5]
            
            size_str = get_file_size(file_path)
            logger.info(f"{subindent}📄 {f} ({size_str})")

    # Check for critical files
    critical_files = {
        "index.html": static_dir / "index.html",
        "asset-manifest.json": static_dir / "asset-manifest.json",
        "manifest.json": static_dir / "manifest.json",
        "favicon.ico": static_dir / "favicon.ico"
    }

    logger.info("\nCritical file checks:")
    for name, path in critical_files.items():
        if path.exists():
            size = get_file_size(path)
            logger.info(f"✅ {name} found ({size})")
        else:
            logger.error(f"❌ {name} not found")

    # Print statistics
    logger.info("\nStatistics:")
    logger.info(f"Total files: {stats['total_files']}")
    logger.info(f"Total size: {get_file_size(stats['total_size'])}")
    
    logger.info("\nFile types distribution:")
    for ext, count in stats["file_types"].items():
        logger.info(f"{ext or 'no extension'}: {count} files")
    
    logger.info("\nLargest files:")
    for path, size in stats["largest_files"]:
        logger.info(f"{os.path.basename(path)}: {get_file_size(size)}")

    # Write debug report to file
    report = {
        "timestamp": datetime.now().isoformat(),
        "static_dir": str(static_dir),
        "stats": {
            "total_files": stats["total_files"],
            "total_size_bytes": stats["total_size"],
            "file_types": stats["file_types"],
            "largest_files": [(os.path.basename(p), s) for p, s in stats["largest_files"]]
        },
        "critical_files": {name: str(path.exists()) for name, path in critical_files.items()}
    }
    
    report_path = static_dir.parent / "static_files_report.json"
    with open(report_path, "w") as f:
        json.dump(report, f, indent=2)
    logger.info(f"\nDetailed report written to: {report_path}")

if __name__ == "__main__":
    check_static_files()
