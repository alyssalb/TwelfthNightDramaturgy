# Round 3: dropdowns on every page

New or changed since the last files:
- Dropdowns on About (10), Key West (10), Queer themes (8), Class themes (4). Each card has a definition and a source link. I wrote the definitions from the linked sources (Wikipedia for most; Florida Trend, Merriam-Webster, Village of Islamorada, and Florida Keys and Key West for the Key West terms). Please read them, since they are my wording.
- dropdown.js now supports `data-title`, a different heading for the card than the word on the page. Example: the word "an imbalance of bodily fluids" opens a card titled "humorism."
- Key West: the ALICE table now reads "Asset Limited" (the official name per United For ALICE).
- Stock Island is east of Key West (Wikipedia). The Class themes dropdown says so.

Dropdowns added:
- About: Lord Chamberlain's Men, Candlemas, Middle Temple, First Folio, blank verse, sumptuary laws, humorism, Lord of Misrule, Mikhail Bakhtin, carnivalesque
- Key West: Key West, wrecking, Julius Stone, Federal Emergency Relief Administration, Ernest Hemingway, Key Largo, Islamorada, Bahama Village, gentrification, Goombay
- Queer themes: Stonewall riots, Mattachine Society, Gay Liberation Front, Gay Activists Alliance, intersectionality, cis, Buggery Act 1533, Judith Butler
- Class themes: yeoman, Lawrence Stone, dowry, Stock Island

To paste into the repo: replace the four pages; assets/dropdown.js and prose-additions.css are updated too (re-copy both). Every page that has a dropdown loads `<script src="assets/dropdown.js"></script>` under the site.js line; all four now do.
