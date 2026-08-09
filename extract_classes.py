import re
with open('fetch.js', 'r', encoding='utf-16') as f:
    text = f.read()

classes = re.findall(r'className:\s*["\']([^"\']+)["\']', text)
for c in set(classes):
    if 'grid' in c or 'flex' in c or 'col' in c:
        print(c)
