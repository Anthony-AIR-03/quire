# Product

<!-- impeccable:product-schema 1 -->

> Product record for Anthony's personal build of Quire (fork `Anthony-AIR-03/quire`). Copy and
> features may diverge from upstream; William can adopt what he wants.

## Platform

web

## Users

One reader: the owner of the instance (Anthony). Sign-in is owner-only; sign-up is closed. The reader
saves articles during the day and reads them later, calmly, on a laptop or phone, sometimes on paper
(Print this issue). The reader is dyslexic-friendly by requirement: every reading surface must follow
the British Dyslexia Association Style Guide (2023).

## Product Purpose

A personal press for one reader. Paste a link and Quire keeps it (Keep). It reads the page, works out
what the piece claims, and suggests other reporting on the same claim (More on this topic). The reader
chooses what belongs together (Select) and binds it into an issue (Create issue). Quire fetches the
authors' original words and recomposes them as a readable paper (Read). Bound issues collect in a
library (Press) and can be printed on A4 or letter.

Success: the reader actually reads what they kept, without strain, and returns to past issues.

## Positioning

Not a read-later list and not a feed. Quire binds. The reader chooses a set of pieces, and Quire sets
them as one issue of a personal newspaper, with the author's own words, a front page, contents and
folios. Related reporting is found by the piece's central claim, and is labelled by stance (Other
reporting / A contrasting angle / Could not place), never invented.

## Operating Context

- Routes: `/` (Desk: Keep rail + Select board + Press library), `/read/$id` (a bound issue, or a single
  kept piece read on its own), `/login`.
- Reading happens on screen first, print second. Print uses the same bound sequence.
- Self-hosted; one owner; no analytics.

## Capabilities and Constraints

- Terms (keep these words): Keep, Desk, Select, Create issue, Issue, Press, Read, Print this issue,
  More on this topic, Other reporting, A contrasting angle, Could not place, Source, Remove.
- Content is other people's writing. Quire never invents headlines, kickers, decks or photos. A cover
  line appears only if the source has one. Missing data stays missing, honestly labelled.
- Figures come from the source only; photographs are contained, never cropped by default.
- Stack: TanStack Start (React), self-hosted fonts preferred for privacy.
- Failures (search, understanding, take, bind) never fail Keep.

## Brand Commitments

- Name: **Quire** (a gathering of folded sheets, the unit of a bound book).
- Personal build: copy and features may diverge from upstream; William may adopt later.
- Visual direction pinned by the owner (2026-10-18): issues and kept pieces, when read, look like a
  **traditional English newspaper**; the rest of the site matches to some extent.
- Type pinned by the owner: **sans-serif everywhere except the masthead** (BDA guidance wins over
  newspaper tradition for headlines).
- Read model pinned by the owner: **a front page, then one article per page**, single ragged-right
  column, Next/Previous turn the page.
- Brand colour: owner proposed **yellow**, open to a better fit.

## Evidence on Hand

- `src/copy.ts` (William's product voice), `src/mark.tsx` (current wordmark with flourish).
- No real issues or screenshots are committed; mockups use clearly synthetic sample articles.
- References: BDA Dyslexia Style Guide 2023; L. Ebbing, *Design of a newspaper for people with
  dyslexia* (ESAD, 2023).

## Product Principles

1. Reading comes first. Nothing on a reading page competes with the text.
2. The author's words, the reader's choice. Quire sets type; it does not editorialise.
3. Honest gaps. A missing piece is said plainly, never filled.
4. The same paper everywhere: screen, phone, print.
5. Calm by default. No streaks, counts, badges or urgency.

## Accessibility & Inclusion

Dyslexia-friendly by requirement (BDA 2023): sans-serif reading text 16–19 px, letter spacing around
0.35 of average letter width, word spacing at least 3.5× letter spacing, line height 1.5, left-aligned
ragged right (never justified), 60–70 characters per line, no running text in more than one column,
no italics or underline for emphasis (bold only), no all-caps running text, headings at least 20%
larger than body, extra space around headings and between paragraphs, links distinct from headings
and body, single-colour off-white or tinted backgrounds, no red/green or pink meaning-carriers, matt
print. Plus WCAG 2.2 AA (contrast, focus, reduced motion), and reader-chosen comfort settings
(tint, size, spacing) because dyslexic readers often have their own colour preference.
