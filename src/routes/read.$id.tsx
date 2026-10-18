import { useEffect, useRef, useState, type ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import {
  boundFromDesk,
  continueReadingLabel,
  contentsKicker,
  contentsLabel,
  couldNotFetchWords,
  couldNotPrint,
  fromSource,
  frontPageLabel,
  frontPageOf,
  goThere,
  issueMissing,
  keptPieceLabel,
  motto,
  nextLabel,
  pageOf,
  previousLabel,
  printThisIssue,
  productName,
  readFullPiece,
  readingSettingsLabel,
  readingSettingsShort,
  readOriginalAt,
  resumeNote,
  resumeOnPage,
  stanceCopy,
  takeLabel,
  welcomeBack,
  wordsFetched,
} from "../copy";
import { issueFromKeptWords } from "../lib/bind";
import { fetchArticleWords } from "../lib/article";
import type { BodyBlock } from "../lib/article";
import {
  clampSheetIndex,
  composeIssue,
  nextSheetIndex,
  pieceSheetIndex,
  previousSheetIndex,
  readingSheets,
  type ContentsRow,
  type PagePlan,
  type ReadingSheet,
  type SequenceSheet,
  type SheetFigure,
} from "../lib/compose";
import {
  issueNumber,
  longDate,
  minutesCopy,
  openingParagraphs,
  piecesCopy,
  readingMinutes,
  shortDate,
} from "../lib/edition";
import { hostnameOf } from "../lib/kept";
import { qrMatrix } from "../lib/qr";
import { composeBoundPrint } from "../lib/print-bound";
import { offerPrint, paperNameFor } from "../lib/print";
import { clipStore, issueStore, listIssues } from "../lib/store";
import { bookmarkStore } from "../lib/bookmark";
import { blockMatches, blockStart, resumeSheet, type SavedPlace } from "../lib/place";
import { Icon, stanceIcon } from "../icons";
import { Nameplate, OxfordRule } from "../mark";
import { ReadingSettingsPanel } from "../reading-settings";

/** A short fade between pages; nothing moves (moving text is harder to track). */
const TURN_MS = 220;

const loadIssue = createServerFn({ method: "GET" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const issues = await issueStore();
    const bound = await issues.get(data.id);
    if (bound) {
      return {
        bound: true as const,
        issue: bound,
        number: issueNumber(await listIssues(), data.id),
        bookmark: await readBookmark(data.id),
      };
    }
    const clip = await (await clipStore()).get(data.id);
    if (!clip) return { bound: false as const, issue: null };
    try {
      const words = await fetchArticleWords(clip.url);
      return {
        bound: false as const,
        issue: issueFromKeptWords(clip, words),
        bookmark: await readBookmark(data.id),
      };
    } catch (error) {
      return {
        bound: false as const,
        issue: null,
        fail: error instanceof Error && error.message ? error.message : couldNotFetchWords,
      };
    }
  });

/** How long scrolling must rest before the paragraph at the top is saved. */
const SETTLE_MS = 1200;

/** Where this reader last stopped, or null. A missing bookmark never stops reading. */
async function readBookmark(id: string): Promise<SavedPlace | null> {
  try {
    const { currentReaderId } = await import("../lib/reader");
    const bookmark = await (await bookmarkStore()).get(await currentReaderId(), id);
    return bookmark ? { sheet: bookmark.sheet, block: bookmark.block, start: bookmark.start } : null;
  } catch {
    return null;
  }
}

const saveBookmark = createServerFn({ method: "POST" })
  .validator((data: { id: string } & SavedPlace) => data)
  .handler(async ({ data }) => {
    const { currentReaderId } = await import("../lib/reader");
    const { id, ...place } = data;
    await (await bookmarkStore()).set(await currentReaderId(), id, place);
  });

/** The first paragraph still on screen below the top edge, with its opening words. */
function topBlock(): { block: number; start: string } | null {
  for (const element of document.querySelectorAll<HTMLElement>(".sheet-piece [data-block]")) {
    if (element.getBoundingClientRect().bottom > 0) {
      return { block: Number(element.dataset.block), start: blockStart(element.textContent ?? "") };
    }
  }
  return null;
}

export const Route = createFileRoute("/read/$id")({
  loader: ({ params }) => loadIssue({ data: { id: params.id } }),
  component: ReadIssue,
});

function ReadIssue() {
  const payload = Route.useLoaderData();
  const issue = payload?.issue ?? null;
  const bound = payload?.bound === true;
  const number = payload && "number" in payload ? (payload.number ?? null) : null;
  const [index, setIndex] = useState(0);
  const [turning, setTurning] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [printError, setPrintError] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [bookmark, setBookmark] = useState<SavedPlace | null>(payload?.bookmark ?? null);
  // The place saved before this visit: the ribbon marks it, and it does not follow the scroll.
  const [arrivedAt] = useState<SavedPlace | null>(payload?.bookmark ?? null);
  const [resumed, setResumed] = useState(false);
  const timer = useRef<number | null>(null);
  const saving = useRef<Promise<unknown>>(Promise.resolve());
  const pendingBlock = useRef<SavedPlace | null>(null);
  const itemId = issue?.id ?? "";

  function queueSave(place: SavedPlace) {
    setBookmark(place);
    // One save at a time, so quick turns land in order.
    saving.current = saving.current.then(() =>
      saveBookmark({ data: { id: itemId, ...place } }).catch(() => undefined),
    );
  }

  useEffect(() => {
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, []);

  // On a piece, remember the paragraph at the top of the screen once scrolling settles.
  useEffect(() => {
    if (!itemId || turning) return;
    let settle: number | null = null;
    function onScroll() {
      if (settle !== null) window.clearTimeout(settle);
      settle = window.setTimeout(() => {
        const top = topBlock();
        if (top) queueSave({ sheet: index, block: top.block, start: top.start });
      }, SETTLE_MS);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (settle !== null) window.clearTimeout(settle);
    };
  }, [itemId, index, turning]);

  // After Continue lands on its sheet, scroll back to the saved paragraph if the words still match.
  useEffect(() => {
    const place = pendingBlock.current;
    if (!place || turning || place.sheet !== index) return;
    pendingBlock.current = null;
    if (place.block === null) return;
    const target = document.querySelector<HTMLElement>(`[data-block="${place.block}"]`);
    if (target && blockMatches(target.textContent ?? "", place.start)) {
      target.scrollIntoView({ block: "start" });
    }
  }, [index, turning]);

  // Arrow keys turn the page.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable]")) return;
      if (event.key === "ArrowRight") document.querySelector<HTMLButtonElement>(".turn .next")?.click();
      if (event.key === "ArrowLeft") document.querySelector<HTMLButtonElement>(".turn .prev")?.click();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!issue) {
    return (
      <main>
        <header className="appbar">
          <Link className="home" to="/">
            <Nameplate label="Quire, back to the Desk" />
          </Link>
        </header>
        <p className="page-fail status fail" role="alert">
          <Icon name="alert" />
          <span>{payload?.fail ?? issueMissing}</span>
        </p>
      </main>
    );
  }

  const boundId = issue.id;
  const page = composeIssue(issue);
  const front = bound;
  const sheets = readingSheets(page, { front });
  const last = sheets.length - 1;
  const current = sheets[clampSheetIndex(index, sheets.length)] ?? sheets[0];
  const piece = current?.kind === "piece" ? page.sequence[current.index] : undefined;
  const isFront = current?.kind === "front";
  const resumeAt = !resumed && index === 0 ? resumeSheet(bookmark, sheets.length) : null;
  const total = sheets.length;

  function goTo(target: number) {
    const next = clampSheetIndex(target, sheets.length);
    if (next === index || turning) return;
    setResumed(true);
    queueSave({ sheet: next, block: null, start: null });
    turnTo(next);
  }

  /** Continue: go back to the saved sheet and paragraph without moving the bookmark. */
  function resume(place: SavedPlace) {
    if (turning) return;
    setResumed(true);
    pendingBlock.current = place;
    const next = clampSheetIndex(place.sheet, sheets.length);
    if (next === index) {
      setIndex(next);
      const target = document.querySelector<HTMLElement>(`[data-block="${place.block}"]`);
      if (target && blockMatches(target.textContent ?? "", place.start)) {
        target.scrollIntoView({ block: "start" });
      }
      pendingBlock.current = null;
      return;
    }
    turnTo(next);
  }

  function turnTo(next: number) {
    const land = () => {
      setIndex(next);
      if (!pendingBlock.current) window.scrollTo(0, 0);
    };
    const quiet =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (quiet) {
      land();
      return;
    }
    setTurning(true);
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      land();
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTurning(false);
          timer.current = null;
        });
      });
    }, TURN_MS);
  }

  function printBound() {
    if (printing) return;
    setPrinting(true);
    setPrintError("");
    composeBoundPrint({
      data: {
        id: boundId,
        paper: paperNameFor(typeof navigator !== "undefined" ? navigator.language : "en-GB"),
      },
    })
      .then((result) => {
        offerPrint(result.bytes);
      })
      .catch((cause: unknown) => {
        setPrintError(cause instanceof Error && cause.message ? cause.message : couldNotPrint);
      })
      .finally(() => setPrinting(false));
  }

  function sheetTitle(sheet: ReadingSheet | undefined) {
    if (!sheet) return "";
    return sheet.kind === "front" ? frontPageLabel : (page.sequence[sheet.index]?.headline ?? "");
  }

  const issueName = number ? `Issue No. ${number}` : productName;
  const where = !bound
    ? keptPieceLabel
    : isFront
      ? `${issueName}, front page`
      : `${issueName}, ${pageOf(index + 1, total).toLowerCase()}`;
  const folio = isFront ? frontPageOf(total) : bound ? pageOf(index + 1, total) : keptPieceLabel;
  const stoppedBlock =
    arrivedAt && arrivedAt.sheet === index && arrivedAt.block !== null ? arrivedAt : null;

  return (
    <main>
      <header className={isFront ? "appbar is-front" : "appbar"}>
        {isFront ? null : (
          <Link className="home" to="/">
            <Nameplate label="Quire, back to the Desk" />
          </Link>
        )}
        <span className="where">{where}</span>
        <div className="tools">
          {bound && !isFront ? (
            <button type="button" className="link-btn" onClick={() => goTo(0)}>
              <Icon name="list" />
              {contentsLabel}
            </button>
          ) : null}
          <button
            type="button"
            className="link-btn"
            aria-expanded={settingsOpen}
            aria-controls="reading-settings"
            onClick={() => setSettingsOpen((open) => !open)}
          >
            <Icon name="text" />
            <span className="long">{readingSettingsLabel}</span>
            <span className="short">{readingSettingsShort}</span>
          </button>
          {bound ? (
            <button type="button" className="link-btn print" disabled={printing} onClick={printBound}>
              <Icon name="print" />
              {printThisIssue}
            </button>
          ) : null}
        </div>
      </header>
      <ReadingSettingsPanel id="reading-settings" open={settingsOpen} />
      {printError ? (
        <p className="page-fail status fail" role="alert">
          <Icon name="alert" />
          <span>{printError}</span>
        </p>
      ) : null}

      <div className="paper">
        <article
          className={[
            "sheet",
            isFront ? "sheet-front" : "sheet-piece",
            turning ? "is-turning" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          data-sheet={isFront ? "front" : "piece"}
          data-treatment={piece?.intent.treatment}
        >
          {isFront ? (
            <FrontPage
              page={page}
              issueName={issueName}
              createdAt={issue.createdAt}
              total={total}
              resume={
                resumeAt !== null && bookmark ? (
                  <Resume
                    note={resumeNote(resumeAt + 1)}
                    action={continueReadingLabel(resumeAt + 1, total)}
                    onResume={() => resume(bookmark)}
                  />
                ) : null
              }
              onOpen={(pieceIndex) => goTo(pieceSheetIndex(pieceIndex, { front }))}
            />
          ) : null}
          {piece ? (
            <PieceSheet
              sheet={piece}
              stance={current?.kind === "piece" ? page.contents.rows[current.index]?.stance : undefined}
              pageLabel={bound ? `Page ${index + 1}` : keptPieceLabel}
              boundOn={bound ? shortDate(issue.createdAt) : ""}
              stopped={stoppedBlock}
              resume={
                resumeAt !== null && bookmark && !bound ? (
                  <Resume note={resumeOnPage} action={goThere} onResume={() => resume(bookmark)} />
                ) : null
              }
            />
          ) : null}
        </article>
      </div>

      {sheets.length > 1 ? (
        <nav className="turn" aria-label="Turn the page">
          <div className="turn-inner">
            {index > 0 ? (
              <button
                type="button"
                className="prev"
                disabled={turning}
                onClick={() => goTo(previousSheetIndex(index, sheets.length))}
              >
                <span>
                  <Icon name="left" /> {previousLabel}
                </span>
                <strong>{sheetTitle(sheets[index - 1])}</strong>
              </button>
            ) : (
              <span />
            )}
            <span className="folio">{folio}</span>
            {index < last ? (
              <button
                type="button"
                className="next"
                disabled={turning}
                onClick={() => goTo(nextSheetIndex(index, sheets.length))}
              >
                <span>
                  {nextLabel} <Icon name="right" />
                </span>
                <strong>{sheetTitle(sheets[index + 1])}</strong>
              </button>
            ) : (
              <span />
            )}
          </div>
        </nav>
      ) : null}
    </main>
  );
}

function Resume({ note, action, onResume }: { note: string; action: string; onResume: () => void }) {
  return (
    <div className="resume" role="status">
      <span>
        <strong>{welcomeBack}</strong> {note}
      </span>
      <button type="button" className="link-btn" onClick={onResume}>
        {action}
      </button>
    </div>
  );
}

function Stance({ stance }: { stance: ContentsRow["stance"] }) {
  if (!stance) return null;
  return (
    <p className="stance">
      <Icon name={stanceIcon[stance]} />
      {stanceCopy(stance)}
    </p>
  );
}

function FrontPage({
  page,
  issueName,
  createdAt,
  total,
  resume,
  onOpen,
}: {
  page: PagePlan;
  issueName: string;
  createdAt: string;
  total: number;
  resume: ReactNode;
  onOpen: (pieceIndex: number) => void;
}) {
  const [lead, ...rest] = page.sequence;
  if (!lead) return null;
  const minutes = readingMinutes(page.sequence);
  const opening = openingParagraphs(lead.paragraphs);
  const absent = page.contents.rows.filter((row) => row.absent);

  return (
    <>
      <header className="masthead">
        <div className="masthead-row">
          <p className="ear">
            <strong>{issueName}</strong>Bound {shortDate(createdAt)}
          </p>
          <h1 className="visually-hidden">{productName}</h1>
          <Nameplate />
          <p className="ear ear-right">
            <strong>{piecesCopy(page.sequence.length)}</strong>
            {minutesCopy(minutes)}
          </p>
        </div>
        <p className="ears-inline">
          {issueName} · {piecesCopy(page.sequence.length)} · {minutesCopy(minutes).toLowerCase()}
        </p>
        <OxfordRule />
        <p className="dateline">
          <span>{longDate(createdAt)}</span>
          <span>{motto}</span>
        </p>
        {rest.length > 0 ? (
          <ul className="skyline" aria-label="Also inside">
            {rest.map((sheet, at) => (
              <li key={sheet.url}>
                <button type="button" onClick={() => onOpen(at + 1)}>
                  <strong>{sheet.headline}</strong>
                  <span className="skyline-meta">
                    {page.contents.rows[at + 1]?.stance
                      ? `${stanceCopy(page.contents.rows[at + 1]!.stance!)} · `
                      : ""}
                    <span className="page-link">Page {pieceSheetIndex(at + 1, { front: true }) + 1}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </header>

      {resume}

      <section className="lead" aria-labelledby="lead-headline">
        <h2 id="lead-headline" className="lead-title">
          <button type="button" className="headline-link" onClick={() => onOpen(0)}>
            {lead.headline}
          </button>
        </h2>
        {lead.standfirst ? <p className="standfirst">{lead.standfirst}</p> : null}
        {lead.sourceLine ? <p className="byline">{lead.sourceLine}</p> : null}
        <div className={lead.figure ? "lead-grid" : "lead-grid no-figure"}>
          {lead.figure ? <SheetPhoto figure={lead.figure} /> : null}
          <div className="opening">
            {opening.map((text, at) => (
              <p key={at}>{text}</p>
            ))}
            <button type="button" className="btn" onClick={() => onOpen(0)}>
              {readFullPiece}
              <Icon name="right" />
            </button>
          </div>
        </div>
      </section>

      {rest.length > 0 || absent.length > 0 ? (
        <section aria-labelledby="inside-heading">
          <div className="section-head">
            <h2 id="inside-heading">{contentsKicker}</h2>
            <span className="small muted">{`Pages 3 to ${total}`}</span>
          </div>
          <ol className="inside">
            {rest.map((sheet, at) => (
              <li key={sheet.url}>
                <h3>
                  <button type="button" className="headline-link" onClick={() => onOpen(at + 1)}>
                    {sheet.headline}
                  </button>
                </h3>
                <Stance stance={page.contents.rows[at + 1]?.stance} />
                {sheet.sourceLine ? <p className="meta">{sheet.sourceLine}</p> : null}
                <button type="button" className="page-no" onClick={() => onOpen(at + 1)}>
                  Page {pieceSheetIndex(at + 1, { front: true }) + 1}
                </button>
              </li>
            ))}
            {absent.map((row) => (
              <li key={row.title}>
                <p className="absent">{row.title}</p>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <footer className="colophon">
        <span>
          {productName} · {issueName} · {frontPageLabel}
        </span>
        <span>{boundFromDesk}</span>
      </footer>
    </>
  );
}

function pieceBlocks(sheet: SequenceSheet): BodyBlock[] {
  if (sheet.blocks?.length) return sheet.blocks;
  return sheet.paragraphs.map((text) => ({ kind: "paragraph" as const, text }));
}

function PieceSheet({
  sheet,
  stance,
  pageLabel,
  boundOn,
  stopped,
  resume,
}: {
  sheet: SequenceSheet;
  stance: ContentsRow["stance"];
  pageLabel: string;
  boundOn: string;
  stopped: SavedPlace | null;
  resume: ReactNode;
}) {
  const screening = sheet.intent.treatment === "screening";
  const blocks = pieceBlocks(sheet);
  const lastParagraph = blocks.map((block) => block.kind).lastIndexOf("paragraph");
  const host = hostnameOf(sheet.url);
  const source = sheet.sourceLine?.split(" · ")[0] || host;

  return (
    <>
      <p className="band">
        <span>
          <strong>{pageLabel}</strong> · {fromSource(source)}
        </span>
        <a href={sheet.url} target="_blank" rel="noreferrer">
          {host}
          <Icon name="out" />
        </a>
      </p>
      {resume}
      <div className="article">
        <header className="article-head">
          <h1>{sheet.headline}</h1>
          {sheet.standfirst ? <p className="standfirst">{sheet.standfirst}</p> : null}
          {sheet.sourceLine ? <p className="byline">{sheet.sourceLine}</p> : null}
          <Stance stance={stance} />
        </header>
        {sheet.figure ? <SheetPhoto figure={sheet.figure} /> : null}
        {sheet.take ? (
          <aside className="note-box">
            <h2>{takeLabel}</h2>
            <p>{sheet.take.text}</p>
          </aside>
        ) : null}
        <div className="article-body">
          {blocks.map((block, index) =>
            block.kind === "subhead" ? (
              <h2 key={`h-${index}`}>{block.text}</h2>
            ) : block.kind === "pullQuote" ? (
              <blockquote key={`q-${index}`} className="pull">
                <p>{`“${block.text}”`}</p>
              </blockquote>
            ) : (
              <p
                key={`p-${index}`}
                data-block={index}
                className={
                  stopped?.block === index && blockMatches(block.text, stopped.start) ? "stopped" : undefined
                }
              >
                {block.text}
                {index === lastParagraph ? <span className="end-mark" aria-hidden="true" /> : null}
              </p>
            ),
          )}
        </div>
        {screening && sheet.videoUrl ? <SheetQr url={sheet.videoUrl} /> : null}
        <p className="source-foot">
          {wordsFetched(boundOn)} {readOriginalAt} <a href={sheet.url}>{host}</a>.
        </p>
      </div>
    </>
  );
}

function SheetPhoto({ figure }: { figure: SheetFigure }) {
  return (
    <figure>
      <div className="figure-frame">
        <img src={figure.url} alt="" />
      </div>
      {figure.caption || figure.credit ? (
        <figcaption>
          {figure.caption ? <span>{figure.caption} </span> : null}
          {figure.credit ? <span className="credit">{figure.credit}</span> : null}
        </figcaption>
      ) : null}
    </figure>
  );
}

function SheetQr({ url }: { url: string }) {
  const { data, size } = qrMatrix(url);
  return (
    <svg
      className="sheet-qr"
      viewBox={`0 0 ${size} ${size}`}
      width={104}
      height={104}
      shapeRendering="crispEdges"
      aria-hidden
    >
      {data.flatMap((row, y) =>
        row.flatMap((on, x) =>
          on ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} /> : [],
        ),
      )}
    </svg>
  );
}
