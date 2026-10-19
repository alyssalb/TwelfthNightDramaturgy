# Script page: line links, character picker, production notes

## What I added
- **Line links.** Every speech has a small Link button that copies an address like script.html#a1s2.52 (scene id, then line number from my cut). Opening that address scrolls to the line and highlights it. If a line sits inside a reflowed prose paragraph, the whole paragraph is highlighted.
- **Follow a character.** A menu above the scene dims every speech except that character's. "Only their lines" hides the rest. The choice is remembered on that device. Characters with no lines in the scene are greyed out, and the count shows how many speeches they have in the scene.
- **Production notes.** A second kind of note beside the glossary. Each note has a type (Cut, Adaptation, Staging, Dramaturgy), an author and text. A small tag appears at the end of the line, and tapping it opens the note. A note with no line number shows in a box at the top of the scene. A button turns the tags off.
- A print rule hides the buttons so a scene prints cleanly.

## Files
- assets/reader.js replaces the existing file.
- data/annotations.json is new. The first note is an example to delete, and the next four are drafts from decisions I have already made (Viola's disguise, the forged letter, the yellow stockings, the ending). I edit or delete them. If the file is missing, the script still loads without notes.
- script-additions.css: I paste it into assets/style.css before the footer rule.

## How I add a note
In data/annotations.json I copy one block inside "notes", then change scene (like a1s2), line (the number from my cut; delete the whole "line" entry for a note about the whole scene), type (cut, adapt, stage or dram), author and text. A missing or extra comma stops the file from loading, and a JSON checker such as jsonlint.com finds the line. I can rename the types at the top of the file.

## Things to check
- The persistent "Follow" choice carries from scene to scene. If someone opens a scene where that character has no lines, it falls back to everyone.
- Line numbers restart each scene, so a link always needs both parts.
- I tested at desktop and phone widths in light and dark, and the link copy with clipboard permission granted. I did not test printing.
