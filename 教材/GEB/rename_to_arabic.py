#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Rename 第X章 files: Chinese numerals -> Arabic numerals."""

import os
import re

# Mapping Chinese numeral -> Arabic number in 第X章 context
CN_TO_NUM = {
    '一': 1, '二': 2, '三': 3, '四': 4, '五': 5,
    '六': 6, '七': 7, '八': 8, '九': 9, '十': 10,
    '十一': 11, '十二': 12, '十三': 13, '十四': 14, '十五': 15,
    '十六': 16, '十七': 17, '十八': 18, '十九': 19,
    '二十': 20, '二十一': 21,
}

script_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(script_dir)

renames = []

for fname in os.listdir('.'):
    if not os.path.isfile(fname):
        continue
    # Match: 第(中文数字)章_1.1/1.2_标题
    m = re.match(r'^第(.+?)章_(1\.[12])_(.+)\.txt$', fname)
    if m:
        cn = m.group(1)
        section = m.group(2)
        title = m.group(3)
        if cn in CN_TO_NUM:
            num = CN_TO_NUM[cn]
            new_name = f'第{num}章_{section}_{title}.txt'
            if new_name != fname:
                renames.append((fname, new_name))

print(f'Files to rename: {len(renames)}')
for old, new in renames:
    print(f'  {old}')
    print(f'  -> {new}')

import sys
if '--execute' in sys.argv:
    print(f'\n=== EXECUTING {len(renames)} RENAMES ===')
    for old, new in renames:
        os.rename(old, new)
    print('Done!')
else:
    print('\nRun with --execute to apply.')
