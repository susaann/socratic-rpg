#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Rename C* and D* files to 第X章_1.1/1.2_标题 format."""

import os
import re

# Chinese digits
CN_DIGITS = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']

def num_to_chinese(n):
    """Convert integer 1-99 to Chinese numeral."""
    if n < 1 or n > 99:
        return str(n)
    if n <= 9:
        return CN_DIGITS[n]
    elif n <= 19:
        ones = n - 10
        return '十' + ('' if ones == 0 else CN_DIGITS[ones])
    else:
        tens = n // 10
        ones = n % 10
        return CN_DIGITS[tens] + '十' + ('' if ones == 0 else CN_DIGITS[ones])

# Test conversion
print("=== Number conversion test ===")
for i in range(1, 22):
    print(f"  {i:2d} -> {num_to_chinese(i)}")

print()

# Get script directory
script_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(script_dir)

# Collect rename operations
renames = []

for fname in os.listdir('.'):
    if not os.path.isfile(fname):
        continue

    match_c = re.match(r'^C(\d+)_第.+章_(.+)\.txt$', fname)
    match_d = re.match(r'^D(\d+)_(.+)\.txt$', fname)

    if match_c:
        num = int(match_c.group(1))
        title = match_c.group(2)
        cn = num_to_chinese(num)
        new_name = f'第{cn}章_1.2_{title}.txt'
        renames.append((fname, new_name))
        print(f'C -> 章{num} 1.2: {fname}')
        print(f'       -> {new_name}')

    elif match_d:
        num = int(match_d.group(1))
        title = match_d.group(2)
        cn = num_to_chinese(num)
        new_name = f'第{cn}章_1.1_{title}.txt'
        renames.append((fname, new_name))
        print(f'D -> 章{num} 1.1: {fname}')
        print(f'       -> {new_name}')

print(f'\n=== Total: {len(renames)} files to rename ===')
print()

# Check for conflicts
new_names = set()
for _, new_name in renames:
    if new_name in new_names:
        print(f'WARNING: Duplicate target name: {new_name}')
    new_names.add(new_name)

# Check if target names already exist
existing = set(os.listdir('.'))
for old, new in renames:
    if new in existing:
        print(f'WARNING: Target already exists: {new}')

print()

import sys
if '--execute' in sys.argv:
    print('=== EXECUTING RENAMES ===')
    for old, new in renames:
        os.rename(old, new)
        print(f'  {old}')
        print(f'  -> {new}')
    print(f'\n=== Done! {len(renames)} files renamed. ===')
else:
    print('=== Dry run complete. Rename? ===')
    print('Run with --execute to apply renames.')
