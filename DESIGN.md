---
name: Quire
description: The Sunday Bundle. Each bound issue is a British Sunday paper for one dyslexic reader.
colors:
  ink: "#22201b"
  ink-2: "#3d3a32"
  muted: "#5c574b"
  newsprint: "#f7f2df"
  sheet: "#fffcf0"
  rule: "#cfc6aa"
  rule-2: "#e4dcc3"
  mat: "#ebe3cb"
  marigold: "#f2b705"
  marigold-soft: "#fbeab0"
  on-marigold: "#22201b"
  press-blue: "#1d4f91"
  press-blue-hover: "#12376a"
  cream-paper: "#fbf6e9"
  cream-sheet: "#fffdf7"
  cream-mat: "#f1ead8"
  cream-rule: "#d8cfb8"
  cream-rule-2: "#ece5d3"
  yellow-paper: "#fbf0c2"
  yellow-sheet: "#fff8dc"
  yellow-mat: "#f1e2a6"
  yellow-rule: "#d9c77f"
  yellow-rule-2: "#efe2ae"
  yellow-marigold-soft: "#f5dc86"
  blue-paper: "#e3edf5"
  blue-sheet: "#f3f8fc"
  blue-mat: "#d3e0eb"
  blue-rule: "#b4c6d6"
  blue-rule-2: "#d3e0eb"
  blue-marigold-soft: "#f9e7a8"
  grey-paper: "#ecece8"
  grey-sheet: "#f8f8f5"
  grey-mat: "#deddd7"
  grey-rule: "#c4c3bc"
  grey-rule-2: "#deddd7"
  night-paper: "#1b1a16"
  night-sheet: "#24231e"
  night-mat: "#2c2a24"
  night-ink: "#ede6cf"
  night-ink-2: "#d6cfb9"
  night-muted: "#b2aa94"
  night-rule: "#4a463b"
  night-rule-2: "#34322a"
  night-marigold-soft: "#4a3d12"
  night-link: "#a9c6f2"
  night-link-hover: "#cfe0fa"
typography:
  display:
    fontFamily: "Atkinson Hyperlegible Next, Verdana, Tahoma, sans-serif"
    fontSize: "clamp(2.125rem, 1.45rem + 2.2vw, 3rem)"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "0"
  headline:
    fontFamily: "Atkinson Hyperlegible Next, Verdana, Tahoma, sans-serif"
    fontSize: "clamp(1.75rem, 1.45rem + 1vw, 2.25rem)"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "0"
  title:
    fontFamily: "Atkinson Hyperlegible Next, Verdana, Tahoma, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 800
    lineHeight: 1.3
    letterSpacing: "0"
  body:
    fontFamily: "Atkinson Hyperlegible Next, Verdana, Tahoma, sans-serif"
    fontSize: "1.1875rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0.02em"
  label:
    fontFamily: "Atkinson Hyperlegible Next, Verdana, Tahoma, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1.5
    letterSpacing: "0.02em"
rounded:
  radius: "2px"
spacing:
  gutter: "16px"
  gutter-wide: "32px"
  para: "1em"
  para-wide: "2em"
  measure: "64ch"
  page: "72rem"
  section: "48px"
components:
  button:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.radius}"
    padding: "0.55em 1.1em"
    height: "48px"
  button-hover:
    backgroundColor: "{colors.marigold-soft}"
    textColor: "{colors.ink}"
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.newsprint}"
    typography: "{typography.label}"
    rounded: "{rounded.radius}"
    padding: "0.55em 1.1em"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.ink-2}"
    textColor: "{colors.newsprint}"
  chip:
    backgroundColor: "{colors.newsprint}"
    textColor: "{colors.ink}"
    rounded: "{rounded.radius}"
    padding: "6px 12px"
    height: "44px"
  input-field:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.radius}"
    padding: "10px 14px"
    height: "52px"
  tick-checked:
    backgroundColor: "{colors.marigold}"
    textColor: "{colors.on-marigold}"
    rounded: "{rounded.radius}"
    size: "28px"
  section-band:
    backgroundColor: "{colors.marigold}"
    textColor: "{colors.on-marigold}"
    typography: "{typography.label}"
    padding: "10px 16px"
  dateline:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.newsprint}"
    typography: "{typography.label}"
    padding: "8px 14px"
  ear:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    padding: "10px 12px"
    width: "15rem"
  clipping-card:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.radius}"
    padding: "0 20px 14px"
  mini-front:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    padding: "14px 16px 12px"
  note-box:
    backgroundColor: "{colors.marigold-soft}"
    textColor: "{colors.ink}"
    rounded: "{rounded.radius}"
    padding: "18px 20px"
  ribbon-note:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    padding: "10px 14px"
  turn-bar:
    backgroundColor: "{colors.newsprint}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    padding: "8px 32px"
    height: "48px"
---

# Design System: Quire

The **why** behind every decision here (marigold, Atkinson Hyperlegible Next, the Grenze Gotisch nameplate, the BDA rules, the declined directions) lives in [docs/brand/README.md](docs/brand/README.md) and `docs/brand/brand-guide.html`. This file records what the shipped build in `src/styles.css` and the routes actually does. Where the two differ, this file describes the build.

## Overview

**Creative North Star: "The Sunday Bundle"**

Each bound issue reads as a British Sunday paper made for one dyslexic reader. The front page shows what is inside at a glance; every other piece gets its own page, opening on a marigold section band, set in one calm ragged-right column. **The newspaper is the frame; the reading is plain.** The furniture is traditional: an outlined blackletter nameplate, Oxford rules (thick over thin), ears, an ink dateline bar, section bands, folios, an end mark. The reading text drops the tradition's habits and follows the BDA Dyslexia Style Guide instead: sans-serif, left-aligned, one column, no italics, no capital labels, off-white paper.

Density is calm. One family at five sizes, hairline rules instead of boxes, flat paper with no texture. The reader owns the paper. Six tints, four text sizes and two spacing settings are applied as `data-*` attributes on `<html>` before first paint, and every surface (the reading pages and the Desk) is built from the tint-swappable tokens. The signature interaction is the **ribbon**: the issue remembers where you stopped and offers to take you back.

The product refuses the read-later list and the dense justified broadsheet.

**Key Characteristics:**
- Flat newsprint paper. Ink rules, no shadows, 2px corners.
- Marigold is only ever a fill: band, ribbon, ticks, current-tab bar, end mark, selection, focus halo.
- One reversed (paper-on-ink) element per reading page marks what matters most.
- One sans family, five sizes, nothing below 16px.
- Every colour is a token that swaps per reader tint, including the mat behind photographs.

## Colors

Warm ink on newsprint, one marigold used only as a fill, and press blue for links.

### Primary
- **Marigold** (`marigold`): the brand colour, used only as a fill. It is the section band at the top of every piece, the ribbon, ticked checkboxes, the 5px current-tab bar in the Desk nav and chosen chips, the 6px top band on a chosen clipping, the square end mark, `::selection`, and the 7px focus halo. It is 1.6:1 on paper, so it never carries text on paper. Text on it is `on-marigold` (ink in every tint, including night).
- **Marigold Soft** (`marigold-soft`): hover fill for outlined buttons and the background of Quire's note. Each tint has its own value: yellow, blue and night override it.

### Secondary
- **Press Blue** (`press-blue`, hover `press-blue-hover`): links and link-like page numbers. Always underlined, 1px at a 0.28em offset, thickening to 2px on hover. Colour alone is never the cue (blue against ink is only 2.0:1).

### Neutral
- **Ink** (`ink`): text, Oxford rules, ear frames, button outlines, focus outline, and the reversed fill (`--band-ink`) of the dateline bar, primary button and mini-front date strip.
- **Ink 2** (`ink-2`): standfirst text, caption credits, and the primary button's hover.
- **Muted** (`muted`): bylines, dates, captions, meta lines, hints, the app bar's "where" line.
- **Newsprint** (`newsprint`, `--paper`): the page. Also the background of the sticky page-turn and bind bars, chips, tick boxes and the Keep input.
- **Sheet** (`sheet`): one step lighter than paper. Clipping cards, mini fronts, the settings panel, the ribbon note, sign-in fields.
- **Rule / Rule 2** (`rule`, `rule-2`): hairlines (app bar, column rule, card borders, unselected chips) and quieter dividers (card action rows, the "More on this topic" list, figure frame edges).
- **Mat** (`mat`): one step darker than paper, behind every photograph (front-page figure, article figure, clipping thumbnail), like a printed picture frame. Images sit centred and uncropped on it.

### Reader tints
Each tint is a full swap of `--paper`, `--sheet`, `--mat`, `--line`, `--line-2`, and sometimes `--marigold-soft`. The frontmatter holds every value under `<tint>-paper`, `<tint>-sheet`, `<tint>-mat`, `<tint>-rule`, `<tint>-rule-2`, `<tint>-marigold-soft`. Newsprint is the default (`:root`). Cream, Yellow, Blue and Grey keep ink and links unchanged; each keeps ink at 13.7:1 or better. **Night** also swaps text: `night-ink`, `night-ink-2`, `night-muted`, `night-link`/`night-link-hover`. The reversed fill inverts (`--band-ink` becomes `night-ink`, `--band-text` becomes `night-paper`) and the focus outline turns marigold. With no tint chosen, the paper follows `prefers-color-scheme` and uses the night values when the device is dark.

### Named Rules
**The Fill-Only Marigold Rule.** Marigold is a fill, never text on paper and never the nameplate's colour. Anything set on marigold is ink.

**The Every-Colour-Is-A-Token Rule.** A new surface uses `--paper`, `--sheet`, `--mat`, `--line`, `--line-2`, `--ink*`, `--muted`, `--link*`, `--band-*`, never a literal hex, so all six tints and night work without extra code.

**The No Status Colour Rule.** There is no red, green or pink anywhere. A problem is the drawn alert icon plus a bold sentence in ink. Waiting is the clock icon plus the step in words.

## Typography

**Display, body and label font:** Atkinson Hyperlegible Next (self-hosted variable `.woff2`, weights 200–800, used at 400 / 700 / 800), falling back to Verdana and Tahoma.
**Nameplate:** Grenze Gotisch SemiBold, shipped only as an outlined SVG path (`src/lib/nameplate.ts`), drawn in `currentColor`. The font itself is never loaded.

**Character:** a single open, hyperlegible sans that tells `I l 1`, `O 0` and `b d p q` apart, set with body tracking 0.02em and word spacing 0.08em. The one blackletter word above it supplies all of the newspaper's voice.

### Hierarchy
- **Display** (800, 34→48px fluid, 1.15, max 22ch): the front-page lead headline only.
- **Headline** (800, 28→36px fluid, 1.2): the article headline on each piece page and the sign-in title.
- **Title / Subhead** (700–800, 24px, 1.3): section titles ("In this issue", "Your Desk", "Press"), "In this issue" headlines, article subheads (2em above, 0.6em below), pull quotes (700, 1.4), the Keep label, and the standfirst (400, 1.4, ink-2, max 46ch).
- **Body** (400, 19px, 1.6, measure 64ch): reading text, ragged right, no hyphenation. Paragraphs are separated by `--para` (1em), not indents. The first paragraph of a piece is ×1.08. Clipping and mini-front headlines use body size at 800 / 1.35.
- **Label / Small** (400 or 700, 16px, 1.4–1.5): bylines, captions, buttons, chips, the band, dateline, ears, folios, meta, hints. This is the floor; nothing is smaller.

Reader size settings change only `--fs-body` (17 / 19 / 22 / 25px); Largest also lifts the subhead to 28px. Headlines do not scale with them. **Wide** spacing applies WCAG 1.4.12 values: letters 0.12em, words 0.16em, line 2, paragraphs 2em.

### Named Rules
**The Five Sizes Rule.** Display, Headline, Subhead, Body, Small. That is the whole scale. The only derived size is the ×1.08 opening paragraph.

**The Upright Rule.** No italics anywhere. `em`, `i`, `cite` and `blockquote` are set upright, and emphasis becomes weight 700, including the source's own italics.

**The Sentence Case Rule.** Headlines and labels are sentence case with no negative tracking (headings track 0, word spacing 0.04em, `text-wrap: balance`). There are no capital-letter labels and no small caps.

**The One Blackletter Rule.** The nameplate is the only blackletter, always the outlined path, never under 24px high (app bar 30px, mini front 30px, Desk masthead 48–72px, front masthead 60–88px, sign-in 96px).

## Layout

The page is a centred `72rem` column with a `--gutter` of 16px, or 32px from 720px up. Reading text never exceeds `--measure` (64ch) and is always one column. Columns appear only for separate items.

- **Front page:** app bar (no small nameplate here, so the masthead is the only one), then the masthead: a three-column grid with two framed ears (15rem, 1px ink) either side of the centred nameplate, an Oxford rule, and the ink dateline bar. Under that sits the skyline, a 3-up list of the other pieces ruled below in ink, so the whole issue shows in the first screen. Then the lead: Display headline, optional standfirst and byline, and a 7/12 + 5/12 grid with the figure beside the opening paragraphs (hairline column rule, 32px inset) and an outlined "Read the full piece" button. After that, "In this issue" as a ruled 3-up grid (ink rule on top, hairline cells), then a hairline colophon.
- **Piece page:** marigold section band (full page width), then the 64ch article column: optional ribbon note, headline, standfirst, byline, figure on its mat, body, pull quotes, Quire's note, end mark, and a hairline source note. The order is the same on every piece.
- **Desk:** a smaller masthead with a centred text nav, Oxford rule and date line. Then the Keep box (2px ink frame on sheet), a "Your Desk" board head ruled in ink, and clippings in two columns of natural height. The Press grid is auto-fill, min 15.5rem.
- **Sticky bars:** the page-turn bar (reading) and the bind bar (Desk) stick to the bottom with a 2px ink top rule on paper. `scroll-padding-bottom: 96px` keeps focused content clear of them.
- **Breakpoints:** 900px (skyline, lead grid, "In this issue" and the clipping cards collapse to one column), 720px (gutter, masthead stacks, ears become one centred muted line, app bar drops "where" and Print and uses short labels, the turn bar shows only Previous/Next), 560px (Desk nav short labels, Keep row and bind bar stack, card actions become a grid).
- **Rhythm:** sections open 40–48px apart. Stacked blocks inside a section step 8–14px (meta 10px, byline 12px, standfirst 14px), and inside a card the padding is 14–20px. Section heads sit 48px (front) or 44px (Desk) above their rule.

**The Columns Drop, Type Never Shrinks Rule.** On phones every grid collapses to one column. Type sizes stay the same, and labels shorten instead.

## Elevation & Depth

The system is flat: there are no drop shadows anywhere. Depth comes from paper steps: `sheet` sits a step lighter than the page, `mat` a step darker behind photographs, and one reversed ink element carries rank. Structure comes from rules: Oxford rules (4px over 1px with a 2px gap, flipped as needed), 1px ink frames on the ears, 2px ink top rules on the sticky bars, 1px `rule` hairlines and `rule-2` dividers.

The build does use `box-shadow`, but only as a flat marigold fill, never to show elevation:
- **Focus halo** (`outline: 3px solid var(--focus); outline-offset: 3px; box-shadow: 0 0 0 7px var(--marigold)`): every `:focus-visible`.
- **Current bar** (`box-shadow: inset 0 -5px 0 var(--marigold)`): the current Desk nav item and a chosen settings chip.

### Named Rules
**The Flat Paper Rule.** No drop shadows, no texture, no grain, no gradients except the two-band Oxford rule. To lift something, step the paper (`sheet`) or reverse it (ink).

**The One Reversed Element Rule.** Each reading page has exactly one paper-on-ink element: the dateline bar on the front page, and the primary button where it is the page's main action (Create issue on the bind bar). Everything else is outlined or ruled.

## Shapes

Corners are almost square: `--radius` 2px on buttons, chips, ticks, inputs, clipping cards, Quire's note and the focus ring. Rule-built furniture has no radius at all: the band, dateline, ears, ribbon note, mini fronts, and the Oxford rule. The end mark is a square (0.6em, marigold, 1px ink outline). The ribbon (`assets/ribbon.svg`, a V-notched strip) marks where you stopped and nothing else. The one round shape is the colour swatch inside the paper-colour chips (18px circle, 1px border of ink at 45%).

Icons are drawn line icons on a 24 grid with a 2px round stroke in `currentColor`, sized 1.25em. They always sit next to a word and never stand alone: stance (parallel / contrast / unplaced), out-link, print, contents, prev/next, wait, alert, reading settings.

## Components

### Buttons
Outlined and plain, like a stamped box on newsprint.
- **Shape:** 2px corners, 2px ink border, min height 48px, padding 0.55em 1.1em, Small at 700.
- **Outlined (default):** transparent with ink text. Hover fills `marigold-soft`. Used for "Read the full piece", Keep, and Remove-dialog choices (44px there).
- **Primary (reversed):** `--band-ink` fill with `--band-text` text. Hover goes to `ink-2`. Only one per page (Create issue, Sign in).
- **Link button:** borderless Small 700 ink text, min 44px, underlined on hover. Used for app-bar tools (Contents, Reading settings, Print) and the ribbon's "Go there" (press blue, underlined, 36px inside the ribbon note).
- **Disabled:** opacity 0.45, `not-allowed` cursor.
- **Focus:** the global halo (3px ink outline + 7px marigold ring).

### Chips (Reading settings)
- **Style:** radio inside a label, 44px min, 6px 12px, 2px `rule` border, paper fill, Small. Paper-colour chips lead with a swatch. Size chips preview their own size, and the Wide chip previews its own spacing.
- **Selected:** ink border, inset 5px marigold bottom bar, 700.
- **Focus:** 3px focus outline on the visible span.

### Checkbox ("In the issue")
A 28px square, 2px ink border, paper fill, 2px corners, with a visible bold label beside it (row min 44px). Ticked, it fills with marigold and shows a drawn ink check.

### Cards / Containers
- **Clipping card (Desk):** `sheet`, 1px `rule` border, 2px corners, padding 0 20px 14px. A 6px top band turns marigold when the clipping is in the issue. Thumbnail on `mat` (contain, max 12rem). Headline at body size 800 (ink, underlined on hover), snippet in Small, meta, then an actions row above a `rule-2` divider: tick, Source ↗ (link), Remove (pushed right). The "More on this topic (n)" disclosure has a rotating chevron (160ms) and a per-item tick, stance word + icon, and note.
- **Mini front (Press):** a tiny front page. `sheet`, 1px `rule`, 2px corners. A 30px nameplate, a 2px-over-1px rule, an ink date strip ("No. 2 · 18 October 2026"), headline, pieces · minutes, and reading progress from the ribbon ("Read to page 2 of 4").
- **Keep box:** 2px ink frame on `sheet`, 20px padding, Subhead label, muted hint, input + outlined Keep button.
- **Quire's note:** `marigold-soft` fill, 1px `rule` border, 2px corners, padding 18px 20px, with a Small bold "Quire's note" heading. It is labelled and upright so it is never mistaken for the author's words.

### Inputs / Fields
- **Style:** 2px ink border, 2px corners, min 52px, padding 10px 14px, body-size text. Sign-in fields sit on `sheet`; the Keep input sits on paper. The label sits above, Small 700.
- **Focus:** the global halo.
- **Error:** drawn alert icon + a bold sentence in ink under the field (`.form-error`, `.status.fail`). There is no red.

### Navigation
- **App bar:** outside the paper, with a 1px `rule` underline and Small text: nameplate (30px, links to the Desk; hidden on the front page), muted "Issue No. 2, page 2 of 4", then link-button tools pushed right. Under 720px "where" and Print hide and labels shorten.
- **Desk nav:** centred Small 700 ink links, 44px targets, underline on hover, with a 5px marigold inset bar on `aria-current`.
- **Page-turn bar:** sticky, paper fill, 2px ink top rule. Previous (muted word + bold headline), centred bold folio ("Page 2 of 4" / "Front page of 4"), Next (right-aligned), 48px targets, ← → keys. Phones show only the bold Previous/Next words.

### Section band
Each piece's own nameplate: a full-width marigold strip (10px 16px, Small, ink) with **Page n** in 800 and "From <source>" on the left, and the source link with an out-icon in ink on the right.

### Masthead furniture
- **Ears:** 15rem boxes, 1px ink frame, 10px 12px, Small. They hold only computed facts (issue number + bound date; piece count + estimated reading time).
- **Oxford rule:** an `<hr>` drawn with two gradients, 4px over 1px in a 7px band (`.flip` for thin over thick).
- **Dateline bar:** the reversed element. Ink fill, paper text, Small 700, 8px 14px, date left and "A personal press for one reader" right.
- **Skyline:** the other pieces as a 3-up list (headline bold, muted meta, press-blue "page n"), ruled below in ink.

### Ribbon (signature)
Where you stopped. On return, a ribbon note (`sheet`, 1px `rule`, 10px 14px, the ribbon SVG at 14×38 in its own column) says "Welcome back. You stopped at…" with a "Go there" link button. On the front page it lines up left with the rows above; on a piece page it is centred in the 64ch column. The paragraph you stopped at carries a 16×44 ribbon hanging 36px into the left margin (10×30 at 14px on phones). It is a marker, never decoration.

### Motion
- **Page turn:** the sheet fades out over 220ms with `cubic-bezier(0.16, 1, 0.3, 1)`. The next page lands at the top (or at the ribbon's paragraph) and fades back in. There is no flip.
- **Disclosure:** the chevron rotates 90° over 160ms ease-out.
- **Reduced motion:** under `prefers-reduced-motion: reduce` the page changes instantly and nothing animates.

### Print (PDF, `src/lib/print-compose.ts`)
The same sequence as the screen, composed with pdf-lib and embedding the same Atkinson Hyperlegible Next TTFs (Regular, Bold, ExtraBold). A4 or Letter, 56pt margins, body 12pt on 18pt leading, ragged right, one column. Colours are the newsprint-tint token values (ink, ink-2, muted, rule, marigold, marigold-soft) on white paper. There is a front sheet with the outlined nameplate and an Oxford rule (2.4pt / 2pt gap / 0.6pt), then each piece opens on a 22pt marigold band (10pt ExtraBold). Pieces end with a marigold end-mark square after the last word. Quire's note is printed at 11pt in a marigold-soft box. Each page carries a folio: a 0.6pt rule, "Quire" 9pt bold left, "Page n" 9pt right, both muted. Each piece also gets a QR code for its source. The app bar, settings and turn bar are not printed.

## Do's and Don'ts

### Do:
- **Do** build every new surface from the tint tokens (`--paper`, `--sheet`, `--mat`, `--line`, `--line-2`, `--ink`, `--muted`, `--link`, `--band-ink`, `--band-text`) and check it in all six papers, Night included.
- **Do** put photographs on `--mat`, whole (`object-fit: contain`), capped at 26rem on a page, 18rem in the front-page lead and 12rem on a card, and never inside running text.
- **Do** keep reading text in one ragged-right column of 64ch or less, with paragraph gaps from `--para`.
- **Do** underline every link (1px, 0.28em offset; 2px on hover) so the cue is never colour alone.
- **Do** pair every icon with a word and every state with an icon plus a sentence.
- **Do** keep targets at 44px minimum, and 48px for buttons and page turns.
- **Do** mark rank by reversal (one ink element per page) and by Oxford rules, not by colour or size jumps.
- **Do** fade the page turn at 220ms and drop it under reduced motion.

### Don't:
- **Don't** set text in marigold on paper, colour the nameplate marigold, or use marigold as a large decorative ground beyond the band.
- **Don't** use italics, capital-letter labels, eyebrows above headlines, justified text, hyphenation, drop caps or multi-column reading text.
- **Don't** add a sixth type size or anything below 16px.
- **Don't** use drop shadows, textures, grain or glassy effects. `box-shadow` is allowed only as the flat marigold focus halo or the inset current bar.
- **Don't** use red, green or pink, for status or anything else.
- **Don't** set any other text in blackletter, or put the nameplate on a photograph.
- **Don't** crop source figures or invent standfirsts, ear facts or reading times. Show what the source and the issue actually hold.
- **Don't** use the ribbon as decoration. It means "you stopped here".
