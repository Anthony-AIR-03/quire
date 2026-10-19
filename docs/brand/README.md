# Quire brand — v1 (approved 2026-10-19)

This folder is the source of truth for the visual identity of **Anthony's personal build of Quire**
(fork `Anthony-AIR-03/quire`): the nameplate, colour, typography, reading rules, voice, and the
screens. Everything needed to recreate or extend the brand is written down here.

**Status:** approved and being applied on `feature/brand` (see §11). `DESIGN.md` at the repo root
describes how the app implements it once the build is finished.

| File | What it is |
|---|---|
| `brand-guide.html` | The visual brand guide. Open it in a browser (fonts load from Google Fonts). |
| `design-proposal.html` | A **working static mockup**: Front page, Article page, Desk, Press, Sign in. Reading settings and page turning work. All content is invented (`.example` sources). **Not the live app.** |
| `../../PRODUCT.md` | Product facts the design is built on (Impeccable's product record). |
| `kit/` | Final artwork (SVG): nameplate, masthead, Q mark, app icon, favicon, ribbon, Oxford rule. |
| `tools/build-kit.cjs` | Regenerates every SVG in `kit/` from the outlined nameplate. `node tools/build-kit.cjs` |
| `tools/build-icons.cjs` | Builds the home-screen icons (`apple-touch-icon.png`, `icon-192/512.png`, `icon-maskable-512.png`) and `site.webmanifest` in `public/` from the Q mark. `npm install --no-save sharp`, then `node docs/brand/tools/build-icons.cjs`. |
| `tools/build-og.cjs` | Builds the link-preview image `public/og-image.png` (1200 × 630) from the fonts and the nameplate outline, all text outlined. `npm install --no-save opentype.js sharp`, then `node docs/brand/tools/build-og.cjs`. |
| `tools/outline-text.cjs` | Turns text into an outlined SVG path (used to make the nameplate). Needs `opentype.js`. |
| `tools/nameplate-outline.svg`, `tools/q-outline.svg` | Outlined sources `build-kit.cjs` reads, so rebuilding does not need the font. |
| `tools/nameplate-specimen.html`, `tools/phone-preview.html`, `tools/phone-one.html` | The blackletter comparison (needs the candidate TTFs in `tools/fonts/`, not committed), and phone-width previews of the mockup. |

---

## 1. Decisions in one place

| Decision | Choice |
|---|---|
| World | **The Sunday Bundle**: each issue is a British Sunday paper. A front page, then each piece as its own section. |
| Rule of thumb | **The newspaper is the frame. The reading is plain.** Furniture is traditional; reading text follows the BDA Dyslexia Style Guide. |
| Nameplate | `Quire` in **Grenze Gotisch SemiBold (600)**, outlined. The only blackletter anywhere. |
| Brand colour | **Marigold `#F2B705`**, yes to yellow, but used as a **fill only** (never text on paper). |
| Core colours | Ink `#22201B`, Newsprint `#F7F2DF`, Press blue `#1D4F91` (links). |
| Typeface | **Atkinson Hyperlegible Next** for everything you read (400 / 700 / 800), five sizes. |
| Read model | Front page (lead + "In this issue"), then **one article per page**, one ragged-right column ≤ 64ch, Previous / Next. |
| Reader control | Reading settings: paper colour (6), text size (4), spacing (Standard / Wide). Saved on the device. |
| Voice | William's calm register + BDA writing rules: short sentences, plain words, no "URL". |

## 2. Idea

A quire is a gathering of folded sheets. A Sunday paper is a bundle of sections, each with its own
name across the top. Quire binds the pieces you choose into an issue, so the Sunday bundle is the
natural model: the front page shows the lead piece and what else is inside; every other piece opens
on its own marigold section band.

The newspaper tradition supplies the **furniture**: blackletter nameplate, Oxford rules (thick over
thin), an ink dateline bar, ears beside the nameplate, section bands, an end mark, folios. It does not
supply its **reading habits** (justified multi-column serif text, italics, capital labels, drop
caps), because those work against dyslexic readers.

### How we got here (so a later session doesn't repeat it)

- Owner's brief (2026-10-18): issues and kept articles, when read, should look like a **traditional
  English newspaper**; the rest of the site should match to some extent; it must be
  **dyslexia friendly**. References: an Alamy newspaper layout template, the **BDA Dyslexia Style
  Guide 2023**, and **L. Ebbing, "Design of a newspaper for people with dyslexia" (ESAD, 2023)**.
- Owner's answers: this is for the **personal build** (copy and features may diverge from upstream);
  **sans-serif everywhere except the masthead** (BDA over tradition for headlines); **front page +
  one article per page** (replaces the floating-sheet-on-cloth stage).
- Direction round (Impeccable, seed `6d2730ee`): the roll assigned **The Sunday Bundle**; the owner
  chose it over "The Broadsheet Front Page" (too dense for dyslexic readers). Three off-brief
  challengers were declined, each donating one discipline:
  - from *cutting bench*: the **ribbon** that marks where you stopped, saved and offered back;
  - from *destination blind*: **on phones columns drop, type never shrinks**, and rank by inversion:
    **one reversed element per page**;
  - from *type specimen*: **one family at five fixed sizes**.
- Nameplate face: Grenze Gotisch beat UnifrakturMaguntia, UnifrakturCook and Pirata One because its
  capital **Q stays a Q** (in Maguntia it reads close to a D) and it stays open at small sizes.

## 3. Colour

**Yes to yellow.** It suits Quire for three reasons. Highlighter yellow fits a product about keeping
what you marked. Yellow and cream overlays are a common dyslexia aid. And yellow avoids the red,
pink and green the BDA advises against. The yellow is a warm **marigold**, not lemon, which vibrates
on cream. Alternatives considered: ink blue (calm but corporate; kept for links), salmon/FT pink
(most newspaper-like, but in the pink range the BDA warns against).

| Token | Hex | Notes |
|---|---|---|
| Marigold | `#F2B705` | **Fills only**: section band, ribbon, ticked boxes, current-tab bar, end mark, selection, focus halo. 1.6:1 on paper, so **never text on paper**. Ink on marigold 8.95:1. ≈ Pantone 7409 C (check against a swatch book). |
| Marigold soft | `#FBEAB0` | Quire's note box, hover fills. Ink 13.6:1. |
| Ink | `#22201B` | Text, rules, dateline bar. 14.5:1 on newsprint. |
| Ink 2 | `#3D3A32` | Hover on the primary button. |
| Muted | `#5C574B` | Bylines, dates, captions. 6.41:1 on newsprint. |
| Newsprint | `#F7F2DF` | Default paper. |
| Sheet | `#FFFCF0` | Desk clippings, inputs, settings panel. |
| Rule / Rule 2 | `#CFC6AA` / `#E4DCC3` | Hairlines / quiet dividers. |
| Press blue | `#1D4F91` | Links, always underlined (blue vs ink is only 2.0:1, so colour alone fails WCAG 1.4.1). 7.26:1. Hover `#12376A`. |

**Night:** paper `#1B1A16`, sheet `#24231E`, text `#EDE6CF` (13.95:1), muted `#B2AA94` (7.52:1), links
`#A9C6F2` (9.99:1), rules `#4A463B` / `#34322A`, marigold soft `#4A3D12`. The dateline bar and primary
button invert to paper-on-night. Follows `prefers-color-scheme` until the reader picks a paper.

**Reader tints** (all keep ink ≥ 13.7:1): Newsprint `#F7F2DF`, Cream `#FBF6E9`, Yellow `#FBF0C2`,
Blue `#E3EDF5`, Grey `#ECECE8`, Night.

**Status:** no red or green status colours at all. A problem is a drawn alert icon + a bold sentence
in ink; waiting is a clock icon + the step in words. One reversed (paper-on-ink) element per page
marks the most important thing.

## 4. Typography

| Role | Face | Size / weight / line |
|---|---|---|
| Nameplate | Grenze Gotisch 600, **outlined SVG only** | min 24 px high |
| Display | Atkinson Hyperlegible Next 800 | 34 → 48 px, 1.15 (front-page lead) |
| Headline | 800 | 28 → 36 px, 1.2 (article headline) |
| Subhead | 700–800 | 24 px, 1.3 (subheads +26% over body; section titles; pull quotes) |
| Body | 400, bold 700 for emphasis | 19 px, 1.6, measure ≤ 64ch |
| Small | 400 / 700 | 16 px, 1.5 (bylines, captions, buttons, folios); **nothing smaller** |

Body tracking `0.02em`, word spacing `0.08em`. Headlines: sentence case, no negative tracking,
`text-wrap: balance`. **No italics anywhere** (source italics become bold). No capital-letter
labels. No hyphenation. Self-host `.woff2` (privacy). Atkinson Hyperlegible Next separates `I l 1 |`,
`O 0`, and `b d p q` by design, which also fixes the Arial `I`/`l` problem the thesis's dyslexia
expert raised.

## 5. Dyslexia rules (BDA 2023 + Ebbing 2023) → Quire

| Guidance | Quire |
|---|---|
| Sans serif, 16–19 px | Atkinson Hyperlegible Next; body 19, user choice 17/19/22/25; floor 16 |
| Letter spacing ≈ 35% letter width; word ≥ 3.5× letter | Open face + 0.02em / 0.08em; **Wide** = 0.12em letters, 0.16em words, line 2, paragraphs 2em (WCAG 1.4.12) |
| Line spacing ≈ 1.5 | 1.6 body, 1.5 small |
| Left aligned, no justification | Ragged right everywhere; no hyphenation |
| Avoid multiple columns | Reading text **always one column ≤ 64ch**; columns only for separate items (front-page "In this issue") |
| No italics or underline | No italics; links keep a thin, well-offset underline (WCAG needs a non-colour cue) |
| No capitals for continuous text | No capital labels; sentence case + bold |
| Headings ≥ 20% larger, space around | 24 vs 19 px; 2em above, 0.6em below |
| Off-white single colour, no patterns | Newsprint; no texture or grain |
| Readers' own colour preference | Six paper tints in Reading settings |
| Avoid red/green/pink | Not used; status = icon + words |
| Images help; large images distract (thesis) | Shown whole (`contain`), height capped ~26rem page / 12rem card, never inside the text |
| Consistent layout (thesis) | Every article page: band → headline → byline → figure → text → end mark → source note → page-turn bar |
| Plain, short writing | Quire's own copy (see §9); authors' words untouched |

**Left out of the tradition:** justified columns, text running across columns, serif body, italic
standfirsts, drop caps, capital labels, "continued on page 6", dense 6-column fronts, halftones.

## 6. Logo and marks (`kit/`)

| File | Use |
|---|---|
| `nameplate.svg` / `nameplate-paper.svg` | The word, ink / paper colour. Alt text "Quire". |
| `masthead.svg` / `masthead-night.svg` | Nameplate between Oxford rules. Unit u = nameplate height / 10: thick 0.5u, thin 0.15u, pair gap 0.3u, clear space 1.2u, side margin 4u. |
| `mark.svg` | Blackletter Q on a marigold square (news-bill), Q scaled to 78%, lifted 2.3% so the bowl, not the tail, is centred. |
| `mark-ink.svg` | Marigold Q on ink. |
| `app-icon.svg` | Q on marigold tile, radius 56/256, Q at 66%. |
| `favicon.svg` | 64-unit tile, radius 6, Q at 90% so it survives 16 px. |
| `ribbon.svg` | 24 × 64, V-notch 8 deep. Means "you stopped here" (and "chosen"). Never decoration. |
| `oxford-rule.svg` | Thick-over-thin strip (4 : 2 gap : 1). In CSS it's two gradients, see the mockup. |

Rules: nameplate only on paper, night or marigold; never on photos. Clear space = height of the
small letter u. Under 24 px high use the Q mark. Never set other text in blackletter, never add
"The", never colour the nameplate marigold, no effects.

## 7. Screens (from `design-proposal.html`)

- **App bar (reading pages):** small nameplate (→ Desk), "Issue No. 7, page 2 of 5", Contents,
  Reading settings, Print this issue. Phones: Contents + Settings; Print is hidden.
- **Front page:** masthead with ears (left: issue number + bound date; right: piece count +
  estimated reading time — computed, never invented), Oxford rule, **ink dateline bar** (the one
  reversed element), then a **skyline strip** ("Also inside": the other headlines with stance and
  page number) so the whole issue is visible in the first screen. Lead: Display headline, the
  source's **standfirst** (24 px regular, only when the source has one; never invented), byline,
  then figure (7/12, capped at 18rem, with the source's photo credit) beside the author's
  opening paragraphs (5/12, hairline column rule) and an outlined "Read the full piece". The app
  bar hides its small nameplate on the front page so the masthead is the only one. Then "In this issue": a ruled
  three-up grid of the other pieces (headline, stance word + icon, source · date, page number);
  one column on phones. Replaces the separate cover and contents sheets.
- **Article page:** marigold section band (Page n · From <source>, link out), optional ribbon note
  ("Welcome back. You stopped at…" + Go there), Headline, byline, contained figure + caption, body
  (first paragraph ×1.08), subheads, pull quotes, **Quire's note** (the optional take, labelled,
  marigold-soft box), end mark, source note ("The author's words, fetched when this issue was bound
  on …"). Sticky page-turn bar: Previous · Page n of N · Next (with next headline on wide screens),
  48 px targets, ← → keys.
- **Desk:** masthead (smaller) with nav Desk · Press · Reading settings · Sign out, Oxford rule, date
  line. **Keep a link** box (visible label + hint + Keep). "Your Desk": two-column clippings
  (sheet colour, hairline, natural heights). Keep is an outlined button; Create issue is the
  page's one ink element. A chosen clipping gets a 6 px marigold top band. Card: contained
  figure, headline, source snippet, meta, then actions: **"In the issue" checkbox with a visible
  label** (28 px, marigold when ticked), Source ↗, Remove. "More on this topic (n)" disclosure with
  per-item checkbox, stance word + icon, host; absent slots in words. States in words + icons
  ("Reading the page…", "Could not read a headline from the source."). Sticky bind bar: "4 pieces
  chosen · 1 kept piece and 3 more on this topic" + **Create issue** (reversed).
- **Empty states:** Desk "Nothing kept yet. Paste a link above to keep it."; Press "No issues bound
  yet. Tick pieces on your Desk, then choose Create issue." (`#empty` in the mockup).
- **Press:** a grid of mini front pages (nameplate, rule, ink date strip "No. 7 · 18 October 2026",
  lead headline, pieces · minutes), reading progress ("Read to page 2", "Finished") from the
  ribbon, quiet Remove.
- **Sign in:** nameplate, Oxford rule, "Sign in to your press", labelled fields, errors as icon +
  sentence under the field.
- **Shape language:** 2 px radii, hairlines, no shadows, square end mark, focus = 3 px ink outline
  + marigold halo.

## 8. Reading settings

Panel under the app bar (not a modal). Paper colour (Newsprint, Cream, Yellow, Blue, Grey, Night),
Text size (Small 17, Standard 19, Large 22, Largest 25), Spacing (Standard, Wide). Saved per device
(`localStorage`, wrapped in try/catch); applies to the Desk too. Headline sizes don't scale with it.

## 9. Voice and copy changes

Keep William's product words (Keep, Desk, Select, Create issue, Press, More on this topic, Other
reporting, A contrasting angle, Could not place, Source, Remove). Add BDA writing rules.

| Now | Proposed |
|---|---|
| Nothing kept yet. Paste a URL. It stays. | Nothing kept yet. Paste a link above to keep it. |
| Placeholder `https://` only | Label "Keep a link" + hint "Paste the address of an article. Quire saves it and reads it for you." |
| Tick with `aria-label="In"` | Visible label "In the issue" |
| Select something to bind. An issue is what you choose. | Tick at least one piece to create an issue. |
| Take (unlabelled italic) | **Quire's note** (labelled, upright) |
| `01 / 05` | Page 2 of 5 |
| That issue is not here. | This issue is not in your Press. It may have been removed. |
| Return the pieces to Desk, or remove them too? | Remove this issue? Its pieces can go back to your Desk, or be removed too. → "Put pieces back on the Desk" · "Remove the pieces too" · "Keep the issue" |

## 10. Motion and print

Page turn = ~220 ms fade (ease-out), no flip; next page starts at the top; nothing animates under
`prefers-reduced-motion`. Print: same sequence, one column, 12 pt Atkinson Hyperlegible Next, band +
end mark per piece, folio per page; no app bar / settings / turn bar. Recommend matt paper.

## 11. Rolling it out (after approval)

On `staging` via a `feature/brand` branch, squash-merged (one cherry-pickable commit), then
cherry-picked to `personal`. Not to `main` unless William wants it. Split into focused commits on the
feature branch:

1. Move this folder to `docs/brand/`, `PRODUCT.md` to the root.
2. Fonts: self-host Atkinson Hyperlegible Next (400/700/800) `.woff2`; drop Source Serif/Sans and the
   Google Fonts link. Print (`print-compose.ts`) embeds the same TTFs.
3. Tokens + base CSS in `src/styles.css` (colours, five sizes, spacing, focus, no italics).
4. Kit: favicon, app icon, nameplate replacing `QuireMark` (`src/mark.tsx`).
5. Reading settings (component + `data-*` attributes on `<html>`, set before paint to avoid a flash).
6. Read route: front page + one article per page (`compose.ts` sheets → front, pieces), page-turn
   bar, keys, section band, Quire's note, end mark, ribbon (stored per issue: page + paragraph).
7. Desk: Keep box, clippings, labelled checkboxes, More on this topic, bind bar, states.
8. Press: mini front pages + reading progress. Sign in.
9. Copy changes (`src/copy.ts`) and tests that assert copy.
10. Print stylesheet / composer to match. Then write `DESIGN.md` from the built result.

## 12. Open items

- Approval of: marigold, Atkinson Hyperlegible Next, Grenze Gotisch nameplate, the front page +
  one-article-per-page model (it replaces the floating sheet on cloth), and the copy changes.
- "About N minutes" needs a words-per-minute figure; 200 wpm is a common default for adults but is
  slower for many dyslexic readers. Either use ~150 wpm or drop the estimate.
- Ribbon storage: per issue, on the server (so it follows you between devices) or per device.
- The mockup uses drawn sample figures. A real CC0 photograph would show the newspaper feel better;
  not downloaded without the owner's go-ahead.
- The Pantone value is approximate; check a swatch book before printing anything.
- No trademark search done for the name or the nameplate.
- Ideally test the mockup with one or two dyslexic readers before building, as Ebbing recommends.
