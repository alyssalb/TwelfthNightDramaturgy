#!/usr/bin/env python3
"""Rebuild data/script.json from a plain-text cut of the play.

Usage:  python3 tools/build_script.py path/to/cut.txt

The text file follows the same conventions as my clean cut:
  ACT 2 / =====           starts an act (the text before any ACT line is Act 1)
  Scene 3 / =======       starts a scene
  VIOLA  text...          a speaker, alone on a line or followed by two spaces and text
  VIOLA, [aside]  text    optional direction after the name
  [Enter Maria.]          stage directions in square brackets
  blank line              ends a block of lines

Speaker names must be listed in SPEAKERS below. Add a name there if the cast changes.
Every text line gets a number that counts up through the scene; the reader uses those
numbers for "line 12" references.
"""
import json, re, sys, os

SPEAKERS = {'ORSINO','CURIO','VALENTINE','VIOLA','CAPTAIN','TOBY','MARIA','ANDREW','FOOL','OLIVIA',
            'MALVOLIO','SEBASTIAN','ANTONIO','FABIAN','PRIEST','FIRST OFFICER','SECOND OFFICER','SERVANT'}
HEADER = re.compile(r"^([A-Z][A-Z ]*?)((?:,?\s*\[[^\]]*\])?)(?:\s{2,}(.*))?$")

def header(line):
    m = HEADER.match(line.rstrip())
    if m and m.group(1).strip() in SPEAKERS:
        return m.group(1).strip(), m.group(2).strip().lstrip(',').strip(), (m.group(3) or '')
    return None

def split_scenes(lines):
    scenes, cur, act, i = [], None, 1, 0
    while i < len(lines):
        l = lines[i]
        m = re.match(r'^ACT (\d)$', l)
        if m:
            act = int(m.group(1)); i += 2; continue
        m = re.match(r'^Scene (\d)$', l)
        if m and i + 1 < len(lines) and lines[i + 1].startswith('==='):
            cur = dict(id='a%ds%s' % (act, m.group(1)), act=act, scene=int(m.group(1)), lines=[])
            scenes.append(cur); i += 2; continue
        if cur is not None: cur['lines'].append(l)
        i += 1
    return scenes

def parse_scene(sc):
    blocks, b = [], []
    for l in sc['lines']:
        if l.strip() == '':
            if b: blocks.append(b); b = []
        else: b.append(l)
    if b: blocks.append(b)
    entries, n, last, depth = [], 0, None, 0
    for blk in blocks:
        curr = None; dirblock = None
        for l in blk:
            h = header(l) if depth == 0 else None
            if h:
                who, note, rest = h
                curr = dict(k='sp', who=who, note=note, cont=False, lines=[]); entries.append(curr); last = who; dirblock = None
                if rest.strip():
                    n += 1; curr['lines'].append(dict(n=n, t=rest, d=False))
                continue
            s = l.strip(); d0 = depth
            if d0 > 0 or s.startswith('['):
                for ch in s:
                    if ch == '[': depth += 1
                    elif ch == ']': depth = max(0, depth - 1)
                if depth > 0 or s.endswith(']'):          # the whole line is a stage direction
                    n += 1; ent = dict(n=n, t=s, d=True)
                    if curr is not None: curr['lines'].append(ent)
                    else:
                        if dirblock is None:
                            dirblock = dict(k='dir', lines=[]); entries.append(dirblock)
                        dirblock['lines'].append(ent)
                    continue
            n += 1; dirblock = None
            if curr is None:
                curr = dict(k='sp', who=last, note='', cont=True, lines=[]); entries.append(curr)
            curr['lines'].append(dict(n=n, t=l.rstrip('\n'), d=False))
    return dict(id=sc['id'], act=sc['act'], scene=sc['scene'], entries=entries, count=n)

if __name__ == '__main__':
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    text = open(sys.argv[1], encoding='utf-8').read().split('\n')
    out = [parse_scene(s) for s in split_scenes(text)]
    dest = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data', 'script.json')
    json.dump(out, open(dest, 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    print('Wrote %d scenes, %d lines.' % (len(out), sum(s['count'] for s in out)))
