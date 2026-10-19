# Twelfth Night: cast and crew packet

This is my packet site.

## What is where

```
index.html, about.html, key-west.html,
queer-themes.html, class-themes.html,
concept-map.html, script.html,
glossary.html, notes.html         the content pages
assets/style.css                  colors, fonts, layout (light and dark)
assets/site.js                    top bar, menu, theme toggle, string lights, page list
assets/reader.js                  the script reader and gloss cards
assets/glossary.js, notes.js      the glossary and notes pages
data/cut.txt                      the cut version of the script
data/script.json                  the interactive cut, from cut.txt (don't edit)
data/glossary.json                the glossary entries on top of the cut text
data/notes.json                   Notes from the field (discoveries in rehearsal)
tools/build_script.py             rebuilds script.json from cut.txt
```

## Notes from the Field Edits

**Add a note to Notes from the field.** In data/notes.json, copy one whole block from the opening brace to the closing brace, paste it above the first one, and change the date (year-month-day), title, body and tags. The body is a list of paragraphs, each in quotation marks and separated by commas. Inside a paragraph, `[text](https://link)` makes a link and `*word*` makes italics. A missing or extra comma will stop the page from loading ( :) )

**Add or change a glossary entry.** In data/glossary.json each entry looks like this:

```
{ "term": "abjured", "gloss": "renounced, sworn off" }
```

Save, reload, and it is highlighted everywhere it appears in the script and listed on the Glossary page. Optional fields:

- `"editorsDiffer": true` adds the line "Editors differ on this one."
- `"noHighlight": true` lists the entry on the Glossary page but does not highlight it in the script.
- `"match"` is a pattern for words that need context. The part inside the first pair of parentheses is what gets highlighted. Example: `"match": "(catch)(?! the plague)"` highlights "catch" except in "catch the plague". I use this when a plain word would light up in places where it means something ordinary.

**To change the script.** Edit data/cut.txt, then from this folder run:

```
python3 tools/build_script.py data/cut.txt
```

That rewrites data/script.json. Commit both files. Line numbers follow cut.txt, so the numbers on gloss cards always match my cut. If I add a new character name, I add it to the `SPEAKERS` set near the top of build_script.py.

**Add, rename or reorder pages.** Edit the `PAGES` list at the top of assets/site.js. To add a page, I copy an existing page's HTML file, change its title and content, and add a line to `PAGES`.

**Change colors.** The palette is a short list of named values at the top of assets/style.css. The dark-mode values are redefined lower down in the dark blocks. Change them there to change globally.

## Highlighting

When a scene opens, reader.js reads data/glossary.json and searches each speech for every term, ignoring capitals. It matches whole words only, lets a phrase run across a line break, skips stage directions in [brackets], and when two terms overlap the longer one wins. Nothing is stored in the script itself, so changing the glossary doesn't necessitate rebuilding the script.

Tap or click to open a card with the gloss and the scene and line. On a computer, hovering shows a short preview. The "Glossary highlights" button turns every highlight off, and the toggle/choice is remembered on that device.
