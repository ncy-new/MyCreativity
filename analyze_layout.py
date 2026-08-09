import re
with open('fetch.js', 'r', encoding='utf-8') as f:
    text = f.read()

# We look for the main container
import json

def extract_jsx(text, keyword):
    # Find all chunks of code around the keyword
    idx = text.find(keyword)
    if idx == -1: return
    print(f"--- Context for {keyword} ---")
    start = max(0, idx - 500)
    end = min(len(text), idx + 500)
    print(text[start:end])
    print("-" * 50)

extract_jsx(text, "md:col-span-12")
extract_jsx(text, "md:col-span-9")
extract_jsx(text, "md:col-span-3")
extract_jsx(text, "max-w-7xl mx-auto grid")
