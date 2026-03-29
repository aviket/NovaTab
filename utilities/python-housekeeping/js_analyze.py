import os
import re

# ==========================================
# CONFIGURATION
# ==========================================
TARGET_DIR = os.path.abspath(os.path.join(os.getcwd(), "..", ".."))
OUTPUT_FILE = "js_architecture_report.md"

IGNORE_DIRS = {"node_modules", ".git", "dist", "build"}

IGNORE_KEYWORDS = {
    'if', 'for', 'while', 'switch', 'catch',
    'function', 'return', 'super', 'constructor'
}

# ==========================================
# REGEX PATTERNS
# ==========================================
CLASS_PATTERN = re.compile(r'class\s+([A-Za-z0-9_]+)')
METHOD_PATTERN = re.compile(r'^\s*(?:async\s+)?([A-Za-z0-9_]+)\s*\([^)]*\)\s*\{', re.MULTILINE)
PROPERTY_PATTERN = re.compile(r'this\.([A-Za-z0-9_]+)')
EXTERNAL_CALL_PATTERN = re.compile(r'(?<!this\.)([A-Za-z0-9_]+)\.([A-Za-z0-9_]+)\s*\(')


# ==========================================
# ANALYSIS
# ==========================================
def analyze_js_file(filepath):
    """Extract classes, methods, properties, and external calls."""
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    return {
        "file": filepath,
        "classes": CLASS_PATTERN.findall(content),
        "methods": {
            m for m in METHOD_PATTERN.findall(content)
            if m not in IGNORE_KEYWORDS
        },
        "properties": set(PROPERTY_PATTERN.findall(content)),
        "external_calls": {
            f"{obj}.{method}()"
            for obj, method in EXTERNAL_CALL_PATTERN.findall(content)
            if obj not in ['console', 'Math'] and method not in IGNORE_KEYWORDS
        }
    }


def collect_project_data():
    """Walk directory and analyze all JS files."""
    all_data = []

    for root, dirs, files in os.walk(TARGET_DIR):
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]

        for file in files:
            if file.endswith(".js"):
                filepath = os.path.join(root, file)
                analysis = analyze_js_file(filepath)
                all_data.append(analysis)

    return all_data


# ==========================================
# MARKDOWN GENERATION
# ==========================================
def generate_markdown_report(all_data):
    lines = ["# 📊 JavaScript Architecture Report\n"]

    for data in all_data:
        if not (data["classes"] or data["methods"]):
            continue

        rel_path = os.path.relpath(data["file"], TARGET_DIR).replace("\\", "/")

        lines.append(f"## 📁 `{rel_path}`\n")

        if data["classes"]:
            lines.append("### 📦 Classes")
            lines.extend([f"- `{c}`" for c in data["classes"]])
            lines.append("")

        if data["properties"]:
            lines.append("### 🏷️ Properties (`this.*`)")
            lines.extend([f"- `this.{p}`" for p in sorted(data["properties"])])
            lines.append("")

        if data["methods"]:
            lines.append("### ⚙️ Methods")
            lines.extend([f"- `{m}()`" for m in sorted(data["methods"])])
            lines.append("")

        if data["external_calls"]:
            lines.append("### 🔗 External Calls")
            lines.extend([f"- `{e}`" for e in sorted(data["external_calls"])])
            lines.append("")

        lines.append("---\n")

    return "\n".join(lines)


# ==========================================
# MERMAID GENERATION
# ==========================================
def generate_mermaid_class_diagram(all_data):
    lines = ["```mermaid", "classDiagram"]

    seen_classes = set()

    # Declare classes
    for data in all_data:
        for cls in data["classes"]:
            if cls not in seen_classes:
                lines.append(f"class {cls}")
                seen_classes.add(cls)

    # Add members
    for data in all_data:
        for cls in data["classes"]:
            for method in data["methods"]:
                lines.append(f"{cls} : +{method}()")
            for prop in data["properties"]:
                lines.append(f"{cls} : {prop}")

    # Add relationships (heuristic)
    for data in all_data:
        for cls in data["classes"]:
            for call in data["external_calls"]:
                obj = call.split(".")[0]
                if obj[0].isupper():
                    lines.append(f"{cls} --> {obj}")

    lines.append("```")
    return "\n".join(lines)


# ==========================================
# FILE OUTPUT
# ==========================================
def write_output(markdown, mermaid):
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write(markdown)
        f.write("\n# 🧠 Class Diagram\n\n")
        f.write(mermaid)


# ==========================================
# MAIN PIPELINE
# ==========================================
def main():
    print(f"🔍 Scanning: {TARGET_DIR}")

    all_data = collect_project_data()

    print(f"📊 Files analyzed: {len(all_data)}")

    markdown = generate_markdown_report(all_data)
    mermaid = generate_mermaid_class_diagram(all_data)

    write_output(markdown, mermaid)

    print(f"✅ Report generated: {OUTPUT_FILE}")


if __name__ == "__main__":
    main()