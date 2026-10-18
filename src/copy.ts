/** William's product-essay register. Not a vendor pitch. */

export const productName = "Quire";

export const kicker = "A personal press";

export const headline = "Save the links.";

export const bindLine = "Bind the issue.";

export const dek =
  "For one reader who likes to keep articles for calm later reading. New Quire. Not a patch on quire-bind.";

export const emptyState = "Nothing kept yet. Paste a link above to keep it.";

export const keepHint = "One owner. Your pile stays yours.";

export const keepLinkLabel = "Keep a link";

export const keepLinkHint = "Paste the address of an article. Quire saves it and reads it for you.";

export const deskLabel = "Desk";

export const yourDeskLabel = "Your Desk";

export const deskInstruction = "Tick what belongs in the next issue.";

export const keptNote = "Kept.";

export const keepNeedsUrl = "A URL is needed to keep.";

export const couldNotUnderstand = "Could not understand this keep.";

export const moreOnThisTopic = "More on this topic";

export const nothingMoreOnTopic = "We looked and found nothing more on this topic.";

export const couldNotLook = "Could not look for more on this topic.";

export const otherReporting = "Other reporting";

export const contrastingAngle = "A contrasting angle";

export const couldNotPlace = "Could not place";

export const otherReportingAbsentRail = "Other reporting — not in this set.";

export const contrastingAngleAbsentRail = "A contrasting angle — not in this set.";

export const otherReportingAbsentContents = "Other reporting is missing from this issue.";

export const contrastingAngleAbsentContents = "This issue has no contrasting piece.";

export type RelatedStanceCopy = "comparable" | "contrarian" | "inconclusive";

export function stanceCopy(stance: RelatedStanceCopy) {
  if (stance === "comparable") return otherReporting;
  if (stance === "contrarian") return contrastingAngle;
  return couldNotPlace;
}

export function railAbsentCopy(slot: "comparable" | "contrarian") {
  return slot === "comparable" ? otherReportingAbsentRail : contrastingAngleAbsentRail;
}

export function contentsAbsentCopy(slot: "comparable" | "contrarian") {
  return slot === "comparable" ? otherReportingAbsentContents : contrastingAngleAbsentContents;
}

export const suggestionsUntilSelected = "Suggestions until you select them.";

export const selectLine = "Choose what belongs in the issue.";

export const originalInByDefault = "The kept piece is in unless you take it out.";

export const relatedJoinWhenSelected = "Related reporting joins only when you select it.";

export const createIssueLabel = "Create issue";

export const sourceLabel = "Source";

export const inLabel = "In the issue";

export const removeLabel = "Remove";

export const removeIssueAsk = "Remove this issue? Its pieces can go back to your Desk, or be removed too.";

export const returnToDeskLabel = "Put pieces back on the Desk";

export const removePiecesTooLabel = "Remove the pieces too";

export const keepIssueLabel = "Keep the issue";

export const signOutLabel = "Sign out";

export const pressLabel = "Press";

export const pressEmpty = "No issues bound yet. Tick pieces on your Desk, then choose Create issue.";

export const pressInstruction = "Every issue you have bound. Open one to read it again.";

export const notStarted = "Not started";

export function readToPage(page: number, total: number) {
  return `Read to page ${page} of ${total}`;
}

export function deskCount(count: number) {
  if (count === 0) return "Nothing on your Desk";
  return count === 1 ? "1 piece on your Desk" : `${count} pieces on your Desk`;
}

export function pressCount(count: number) {
  return count === 1 ? "1 issue in your Press" : `${count} issues in your Press`;
}

export function chosenCount(count: number) {
  return count === 1 ? "1 piece chosen" : `${count} pieces chosen`;
}

export function chosenDetail(kept: number, related: number) {
  const keptText = kept === 1 ? "1 kept piece" : `${kept} kept pieces`;
  return related > 0 ? `${keptText} and ${related} more on this topic` : keptText;
}

export const addToIssue = "Add to the issue";

export function pressCoverMeta(issue: { createdAt: string; pieces: { length: number } }) {
  const count = issue.pieces.length === 1 ? "One piece" : `${issue.pieces.length} pieces`;
  return `${count} · ${issue.createdAt.slice(0, 10)}`;
}

export const contentsKicker = "In this issue";

export const takeLabel = "Quire's note";

export const boundNote = "Bound.";

export const nothingSelected = "Tick at least one piece to create an issue.";

export const couldNotFetchWords = "Could not fetch the author's words.";

export const couldNotReadHeadline = "Could not read a headline from the source.";

export const noHeadlineOnSource = "No headline on the source.";

export const printThisIssue = "Print this issue";

export const couldNotPrint = "Could not print this issue.";

export function continueReadingLabel(page: number, total: number) {
  return `Continue on page ${page} of ${total}`;
}

export function resumeNote(page: number) {
  return `You stopped on page ${page}.`;
}

export const resumeOnPage = "You stopped partway down this page.";

export const goThere = "Go there";

export const keptPieceLabel = "Kept piece";

export const frontPageLabel = "Front page";

export function frontPageOf(total: number) {
  return `Front page of ${total}`;
}

export const boundFromDesk = "Bound from your Desk. The authors' own words, set for reading.";

export const readOriginalAt = "Read the original at";

export const welcomeBack = "Welcome back.";

export const issueMissing = "This issue is not in your Press. It may have been removed.";

export const motto = "A personal press for one reader";

export const readFullPiece = "Read the full piece";

export const contentsLabel = "Contents";

export const previousLabel = "Previous";

export const nextLabel = "Next";

export const readingSettingsLabel = "Reading settings";

export const readingSettingsShort = "Settings";

export const paperColourLabel = "Paper colour";

export const textSizeLabel = "Text size";

export const spacingLabel = "Spacing";

export const settingsSavedNote = "Saved on this device. Applies to every page.";

export const signInTitle = "Sign in to your press";

export function pageOf(page: number, total: number) {
  return `Page ${page} of ${total}`;
}

export function fromSource(source: string) {
  return `From ${source}`;
}

export function wordsFetched(date: string) {
  return date
    ? `The author's words, fetched when this issue was bound on ${date}.`
    : "The author's words, fetched from the source just now.";
}

export function sourceHeadlineCopy(input: { status: "ok" | "empty" | "failed"; message?: string }) {
  if (input.status === "ok") {
    return { kind: "ok" as const, text: "" };
  }
  if (input.status === "empty") {
    return { kind: "empty" as const, text: noHeadlineOnSource };
  }
  const stored = (input.message ?? "").trim();
  if (stored.includes(couldNotReadHeadline)) {
    return { kind: "fail" as const, text: stored };
  }
  if (!stored) {
    return { kind: "fail" as const, text: couldNotReadHeadline };
  }
  return { kind: "fail" as const, text: `${couldNotReadHeadline} ${stored}` };
}

export function moreOnThisTopicCopy(input: {
  status: "ok" | "failed" | "unconfigured" | "timeout";
  count: number;
}) {
  if (input.status !== "ok") {
    return { kind: "fail" as const, text: couldNotLook };
  }
  if (input.count === 0) {
    return { kind: "empty" as const, text: nothingMoreOnTopic };
  }
  return { kind: "suggestions" as const, text: moreOnThisTopic };
}

export const keepProgressCopy = {
  reading: "Reading the page…",
  understanding: "Understanding the piece…",
  related: "Finding more on this topic…",
  stalled: "This keep stopped before it finished. Remove it and keep it again.",
} as const;
