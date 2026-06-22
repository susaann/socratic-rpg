"""Generate file index for static hosting fallback"""
import os, json, sys

ROOT = os.path.dirname(os.path.abspath(__file__))

TARGET_DIRS = [
    '教材',
    '老师',
    '习题集',
    'homework/待批改',
    'system',
]

index = {}

def scan_dir(rel_path):
    abs_path = os.path.join(ROOT, rel_path)
    if not os.path.isdir(abs_path):
        return

    entries = []
    try:
        for name in sorted(os.listdir(abs_path)):
            full = os.path.join(abs_path, name)
            if os.path.isdir(full):
                if name not in ('.claude', '__pycache__', '.git'):
                    entries.append(name + '/')
                    scan_dir((rel_path + '/' + name) if rel_path else name)
            elif os.path.isfile(full):
                if name.startswith('.') or name.endswith('.py') or name == 'rename_files.py':
                    continue
                entries.append(name)
    except PermissionError:
        pass

    key = rel_path + '/' if rel_path else '/'
    if entries:
        index[key] = entries

for d in TARGET_DIRS:
    scan_dir(d)

# Ensure top-level 教材/ is in index
top_entries = []
try:
    for name in sorted(os.listdir(os.path.join(ROOT, '教材'))):
        full = os.path.join(ROOT, '教材', name)
        if os.path.isdir(full) and name not in ('.claude', '__pycache__', '.git'):
            top_entries.append(name + '/')
        elif os.path.isfile(full) and not name.startswith('.') and not name.endswith('.py'):
            top_entries.append(name)
except FileNotFoundError:
    pass
if top_entries:
    index['教材/'] = top_entries

out_path = os.path.join(ROOT, '文件索引.json')
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(index, f, ensure_ascii=False, indent=2)

sys.stdout.reconfigure(encoding='utf-8')
total_files = sum(len(v) for v in index.values())
print(f'[OK] Generated: {out_path}')
print(f'  {len(index)} directories indexed')
print(f'  {total_files} entries total')
for k, v in index.items():
    print(f'  {k} -> {len(v)} entries')
