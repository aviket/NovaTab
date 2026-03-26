import os
import re

# ==========================================
# CONFIGURATION
# ==========================================
TARGET_DIR = os.path.abspath(os.path.join(os.getcwd(), "..", ".."))  # "." means current directory. Change to a specific path if needed.
OUTPUT_FILE = "js_architecture_report.txt"
IGNORE_DIRS = ["node_modules", ".git", "dist", "build"]

# Keywords to ignore so we don't accidentally log "if" or "for" as methods
IGNORE_KEYWORDS = {'if', 'for', 'while', 'switch', 'catch', 'function', 'return', 'super', 'constructor'}

# ==========================================
# REGEX PATTERNS
# ==========================================
# 1. Finds 'class ClassName'
CLASS_PATTERN = re.compile(r'class\s+([A-Za-z0-9_]+)')

# 2. Finds 'methodName(args) {'
METHOD_PATTERN = re.compile(r'^\s*(?:async\s+)?([A-Za-z0-9_]+)\s*\([^)]*\)\s*\{', re.MULTILINE)

# 3. Finds 'this.propertyName'
PROPERTY_PATTERN = re.compile(r'this\.([A-Za-z0-9_]+)')

# 4. Finds 'SomeClass.methodName(' or 'someObj.methodName(' (External Calls)
# Matches word.word( but ignores 'this.something('
EXTERNAL_CALL_PATTERN = re.compile(r'(?<!this\.)([A-Za-z0-9_]+)\.([A-Za-z0-9_]+)\s*\(')

def analyze_js_file(filepath):
    """Reads a JS file and extracts classes, methods, properties, and external calls."""
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    results = {
        "classes": [],
        "methods": set(),
        "properties": set(),
        "external_calls": set()
    }

    # Extract Classes
    for match in CLASS_PATTERN.finditer(content):
        results["classes"].append(match.group(1))

    # Extract Methods
    for match in METHOD_PATTERN.finditer(content):
        method_name = match.group(1)
        if method_name not in IGNORE_KEYWORDS:
            results["methods"].add(method_name)

    # Extract Properties (anything attached to 'this.')
    for match in PROPERTY_PATTERN.finditer(content):
        results["properties"].add(match.group(1))

    # Extract External Method Calls (e.g., chrome.storage, document.createElement, accordion.addItem)
    for match in EXTERNAL_CALL_PATTERN.finditer(content):
        obj_name = match.group(1)
        method_name = match.group(2)
        
        # Filter out common standard browser/JS objects if you only want YOUR external calls
        # (Optional: You can add 'console', 'document', 'window', 'Math' to this ignore list)
        if obj_name not in ['console', 'Math'] and method_name not in IGNORE_KEYWORDS:
            results["external_calls"].add(f"{obj_name}.{method_name}()")

    return results

def main():
    print(f"🔍 Scanning directory: {os.path.abspath(TARGET_DIR)}...")
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as out_file:
        out_file.write("=========================================\n")
        out_file.write(" JavaScript Architecture & Method Report \n")
        out_file.write("=========================================\n\n")

        file_count = 0

        # Walk through all directories and subdirectories
        for root, dirs, files in os.walk(TARGET_DIR):
            # Modify dirs in-place to skip ignored directories
            dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]

            for file in files:
                if file.endswith('.js'):
                    filepath = os.path.join(root, file)
                    file_count += 1
                    
                    # Analyze the file
                    analysis = analyze_js_file(filepath)
                    
                    # Only write to report if we found classes or substantial data
                    if analysis["classes"] or analysis["methods"]:
                        out_file.write(f"📁 FILE: {filepath}\n")
                        out_file.write("-" * 50 + "\n")
                        
                        if analysis["classes"]:
                            out_file.write(f"  📦 CLASSES: {', '.join(analysis['classes'])}\n")
                        
                        if analysis["properties"]:
                            out_file.write(f"  🏷️ PROPERTIES (this.*):\n")
                            for prop in sorted(analysis["properties"]):
                                out_file.write(f"     - this.{prop}\n")
                        
                        if analysis["methods"]:
                            out_file.write(f"  ⚙️ METHODS:\n")
                            for method in sorted(analysis["methods"]):
                                out_file.write(f"     - {method}()\n")
                                
                        if analysis["external_calls"]:
                            out_file.write(f"  🔗 EXTERNAL CALLS USED:\n")
                            for ext_call in sorted(analysis["external_calls"]):
                                out_file.write(f"     - {ext_call}\n")
                                
                        out_file.write("\n\n")

    print(f"✅ Scanning complete! Parsed {file_count} JavaScript files.")
    print(f"📄 Report saved to: {OUTPUT_FILE}")

if __name__ == "__main__":
    main()