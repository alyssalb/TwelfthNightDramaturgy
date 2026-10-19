# What I add to my repo

Same folders as my repo. I drop each file into the matching place and let it overwrite.

- about.html, key-west.html, queer-themes.html, class-themes.html, concept-map.html go in the repo root (they replace the stubs).
- assets/dropdown.js and assets/conceptmap.js go in assets/.
- data/conceptmap.json goes in data/.
- img/ is a new folder with two Library of Congress photos for the Key West page.
- The two .css files are not files to upload. I open assets/style.css and paste the first, then the second, just above the footer rule. If I pasted an earlier concept map block, I delete it first.

Then I run `python3 -m http.server 8000` and check each page before I commit. The notes/ folder has my change logs and the things I still need to check.
