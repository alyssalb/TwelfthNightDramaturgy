# Twelfth Night, Key West: cast and crew packet

This is my packet site. It is plain HTML, CSS and JavaScript. There is no build step and nothing to install. The script and glossary live in data files, so most of my updates mean editing one text file.

## What is where

```
index.html, about.html, key-west.html,
queer-themes.html, class-themes.html,
concept-map.html, script.html,
glossary.html, notes.html         the pages
assets/style.css                  colors, fonts, layout (light and dark)
assets/site.js                    top bar, menu, theme toggle, string lights, page list
assets/reader.js                  the script reader and gloss cards
assets/glossary.js, notes.js      the glossary and notes pages
data/cut.txt                      my clean cut (the source of truth for the script)
data/script.json                  the cut, built from cut.txt (I do not edit this by hand)
data/glossary.json                the glossary entries
data/notes.json                   Notes from the field
tools/build_script.py             rebuilds script.json from cut.txt
```

## Preview on my computer

Browsers will not load the data files if I double-click a page, so I run a tiny local server from this folder:

```
python3 -m http.server 8000
```

Then I open http://localhost:8000. Ctrl+C stops it.

## Publish on GitHub Pages

1. Make a repository on GitHub and upload everything in this folder (the files themselves, not a folder that contains them).
2. Go to Settings, then Pages.
3. Under Build and deployment, choose "Deploy from a branch", pick the main branch and the root folder, and save.
4. After a minute or two the site is live at the address GitHub shows on that page.

Every commit updates the site.

## How I make the common edits

**Home page (my approach and contact info).** In index.html I find the highlighted placeholders (class `ph`) and replace each with my own words. The other pages (About, Key West, Queer themes, Class themes, Concept map) are stubs with planned section headings. I replace those the same way.

**Add a note to Notes from the field.** In data/notes.json I copy one whole block from the opening brace to the closing brace, paste it above the first one, and change the date (year-month-day), title, body and tags. The body is a list of paragraphs, each in quotation marks and separated by commas. Inside a paragraph, `[text](https://link)` makes a link and `*word*` makes italics. I delete the "How to add a note" example once I have my own. A missing or extra comma stops the page from loading, and a JSON checker such as jsonlint.com points to the line.

**Add or change a glossary entry.** In data/glossary.json each entry looks like this:

```
{ "term": "abjured", "gloss": "renounced, sworn off" }
```

I save, reload, and it is highlighted everywhere it appears in the script and listed on the Glossary page. Optional fields:

- `"editorsDiffer": true` adds the line "Editors differ on this one."
- `"noHighlight": true` lists the entry on the Glossary page but never highlights it in the script.
- `"match"` is a pattern for words that need context. The part inside the first pair of parentheses is what gets highlighted. Example: `"match": "(catch)(?! the plague)"` highlights "catch" except in "catch the plague". I use this when a plain word would light up in places where it means something ordinary.

**Change the script.** I edit data/cut.txt, then from this folder run:

```
python3 tools/build_script.py data/cut.txt
```

That rewrites data/script.json. I commit both files. Line numbers follow cut.txt, so the numbers on gloss cards always match my cut. If I add a new character name, I add it to the `SPEAKERS` set near the top of build_script.py.

**Add, rename or reorder pages.** I edit the `PAGES` list at the top of assets/site.js. To add a page, I copy an existing page's HTML file, change its title and content, and add a line to `PAGES`.

**Change colors.** The palette is a short list of named values at the top of assets/style.css. The dark-mode values are redefined lower down in the dark blocks. I change them there and everything follows.

## How highlighting works

When a scene opens, reader.js reads data/glossary.json and searches each speech for every term, ignoring capitals. It matches whole words only, lets a phrase run across a line break, skips stage directions in [brackets], and when two terms overlap the longer one wins. Nothing is stored in the script itself, so changing the glossary never means rebuilding the script.

A tap or click opens a card with the gloss and the scene and line. On a computer, hovering shows a short preview. The "Glossary highlights" button turns every highlight off, and the choice is remembered on that device.

## A note on sources

I wrote the glosses for this production from my cutting. I did not open the Folger or Shakespeare's Words pages while building this, so I check any gloss against a source in hand before I cite it.
