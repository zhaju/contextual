import json

def extract_conversations(file_path, output_path=None):
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    results = []

    # Each top-level conversation
    for conv in data:
        mapping = conv.get("mapping", {})
        for node in mapping.values():
            message = node.get("message")
            if not message:
                continue

            role = message.get("author", {}).get("role")
            content_parts = message.get("content", {}).get("parts", [])

            if role in ("user", "assistant"):
                # Handle both strings and dicts in content_parts
                texts = []
                for part in content_parts:
                    if isinstance(part, str):
                        texts.append(part)
                    elif isinstance(part, dict):
                        # Try to extract 'text' or 'content' key if present
                        if 'text' in part:
                            texts.append(str(part['text']))
                        elif 'content' in part:
                            texts.append(str(part['content']))
                        else:
                            texts.append(str(part))
                    else:
                        texts.append(str(part))
                text = "\n".join(texts).strip()
                if text:  # skip empty system messages
                    results.append({"role": role, "text": text})

    # Write results or print
    if output_path:
        with open(output_path, "w", encoding="utf-8") as f:
            for r in results:
                f.write(f"{r['role'].upper()}:\n{r['text']}\n\n")
    else:
        for r in results:
            print(f"{r['role'].upper()}:\n{r['text']}\n")

    return results


if __name__ == "__main__":
    # Change file paths as needed
    input_file = "conversations.json"
    output_file = "parsed_conversations.txt"
    extract_conversations(input_file, output_file)
    print(f"Parsed conversations saved to {output_file}")
