import os
import re

ROOT_DIR = os.path.abspath(os.path.join(os.getcwd(), "..", ".."))
OUTPUT_MERMAID_FILE = "folder_structure.md"
BLACKLIST_DIRS = {".git", "node_modules", "__pycache__"}


def get_relative_path(file_path):
    return os.path.relpath(file_path, ROOT_DIR).replace("\\", "/")




def add_comment_to_file(file_path, rel_path):
    """
    Ensures first line contains ONLY the correct relative path comment.

    Rules:
    1. If first line has a path-like comment → replace it
    2. Otherwise → prepend new comment
    """

    _, ext = os.path.splitext(file_path)

    if ext == ".js":
        comment = f"// {rel_path}\n"
        # matches: // something/like/this.js OR // folder/file.css
        pattern = re.compile(r"^\s*//\s*[\w./-]+\.(js|css)\s*$")

    elif ext == ".css":
        comment = f"/* {rel_path} */\n"
        # matches: /* something/like/this.js */ OR /* folder/file.css */
        pattern = re.compile(r"^\s*/\*\s*[\w./-]+\.(js|css)\s*\*/\s*$")

    else:
        return

    with open(file_path, "r", encoding="utf-8") as f:
        content = f.readlines()

    if content:
        first_line = content[0].strip()

        # 🔥 Replace ONLY if it's a path-like comment
        if pattern.match(first_line):
            content[0] = comment
        else:
            content.insert(0, comment)
    else:
        content = [comment]

    with open(file_path, "w", encoding="utf-8") as f:
        f.writelines(content)

def build_mermaid_tree():
    """
    Generates Mermaid graph for folder structure
    """
    lines = ["```mermaid", "graph TD"]

    node_id_counter = 0
    path_to_id = {}

    def get_node_id(path):
        nonlocal node_id_counter
        if path not in path_to_id:
            path_to_id[path] = f"N{node_id_counter}"
            node_id_counter += 1
        return path_to_id[path]

    for root, dirs, files in os.walk(ROOT_DIR):
        dirs[:] = [d for d in dirs if d not in BLACKLIST_DIRS]
        rel_root = os.path.relpath(root, ROOT_DIR).replace("\\", "/")
        if rel_root == ".":
            rel_root = "root"

        parent_id = get_node_id(rel_root)
        lines.append(f'{parent_id}["{rel_root}"]')

        # Directories
        for d in dirs:
            child_path = os.path.join(root, d)
            rel_child = os.path.relpath(child_path, ROOT_DIR).replace("\\", "/")
            child_id = get_node_id(rel_child)

            lines.append(f'{child_id}["{d}/"]')
            lines.append(f"{parent_id} --> {child_id}")

        # Files
        for f in files:
            child_path = os.path.join(root, f)
            rel_child = os.path.relpath(child_path, ROOT_DIR).replace("\\", "/")
            child_id = get_node_id(rel_child)

            lines.append(f'{child_id}["{f}"]')
            lines.append(f"{parent_id} --> {child_id}")

    lines.append("```")
    return "\n".join(lines)


def main():
    print("⚙️ Select operations:\n")

    # 🔹 Ask user choices
    do_comments = input("👉 Add/update relative path comments in JS/CSS files? (y/n): ").strip().lower() == "y"
    do_mermaid = input("👉 Generate Mermaid folder structure? (y/n): ").strip().lower() == "y"

    # 🔹 Run comment updater
    if do_comments:
        print("\n🔍 Scanning files for JS/CSS...")

        for root, dirs, files in os.walk(ROOT_DIR):
            dirs[:] = [d for d in dirs if d not in BLACKLIST_DIRS]

            for file in files:
                if file.endswith(".js") or file.endswith(".css"):
                    full_path = os.path.join(root, file)
                    rel_path = get_relative_path(full_path)

                    add_comment_to_file(full_path, rel_path)
                    print(f"✔ Updated: {rel_path}")

    # 🔹 Run mermaid generator
    if do_mermaid:
        print("\n📊 Generating Mermaid diagram...")

        mermaid_code = build_mermaid_tree()

        with open(OUTPUT_MERMAID_FILE, "w", encoding="utf-8") as f:
            f.write(mermaid_code)

        print(f"✅ Mermaid saved to: {OUTPUT_MERMAID_FILE}")

    # 🔹 Nothing selected
    if not do_comments and not do_mermaid:
        print("\n⚠️ No operation selected. Exiting.")

if __name__ == "__main__":
    main()