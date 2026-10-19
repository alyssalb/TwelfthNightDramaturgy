# Page drafts, round 2

## What changed this round
- All four pages are now bullets with bold lead-ins; longer bullets carry nested sub-bullets. Your wording is kept; I trimmed repetition.
- Dropdown definitions added on Key West (10 terms): Key West, wrecking, Julius Stone, Federal Emergency Relief Administration, Ernest Hemingway, Key Largo, Islamorada, Bahama Village, gentrification, Goombay. "Wrecking" and "Bahama Village" use your own definitions. The other eight definitions are mine, each with a source link in the card. Please check them.
- Stone date now reads "the 1920s and 30s."
- About: Shakespeare bullet now says Twelfth Night comes after Much Ado and As You Like It, before Macbeth and King Lear, and around the same time as Hamlet. The "we'll never be able to say officially which came first" line is in.
- Queer themes: the profanity is out ("So why is Key West so gay?"). The Butler paragraph's last sentence is flagged with an HTML comment (see below).
- Cuba row updated: Equaldex says a new Civil Registry Law took effect September 17, 2026 and no longer requires surgery. Equaldex is user-edited, so confirm against the law or a news source before you present it.
- Immigration section has a content note.

## To paste into the repo
1. Replace about.html, key-west.html, queer-themes.html, class-themes.html.
2. Add assets/dropdown.js (new file). Only key-west.html loads it. To use a dropdown on another page, add `<script src="assets/dropdown.js"></script>` under the site.js line.
3. In assets/style.css, paste prose-additions.css above the `footer {` rule. If you already pasted the earlier prose block, replace it with this one (it is a superset).
4. The img folder from the earlier zip is unchanged.

## Writing a dropdown term in HTML
`<button type="button" class="dd" data-def="The definition." data-src="Source name" data-url="https://link">the term</button>`
data-src and data-url are optional.

## Still to check
- I changed "Federal Emergency Relief Commission" to "Administration," the agency's name per Florida Trend.
- Butler paragraph: the original ended "...gives power to the idea that it doesn't really need to have." That clause stops mid-thought. I wrote "gives power to the idea that gender is simply natural," which matches the Butler quote. It is marked with an HTML comment in queer-themes.html.
- Still true from round 1: the two home values, Dwayne Jones attribution, Gale link omitted, credit lines (you are handling), and Fantasy Fest still a placeholder.
