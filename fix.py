import re
import sys

with open('src/types/database.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(
    r"Partial<([a-zA-Z0-9_]+)\['Row'\]>",
    r"Partial<Database['public']['Tables']['\g<1>']['Row']>",
    content
)

with open('src/types/database.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Fixed database.ts types.")
