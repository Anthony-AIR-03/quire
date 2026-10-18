import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import {
  addToIssue,
  boundNote,
  chosenCount,
  chosenDetail,
  couldNotUnderstand,
  createIssueLabel,
  deskCount,
  deskInstruction,
  deskLabel,
  emptyState,
  inLabel,
  keepIssueLabel,
  keepLinkHint,
  keepLinkLabel,
  keepProgressCopy,
  keptNote,
  moreOnThisTopic,
  moreOnThisTopicCopy,
  nothingMoreOnTopic,
  nothingSelected,
  notStarted,
  pressCount,
  pressEmpty,
  pressInstruction,
  pressLabel,
  railAbsentCopy,
  readingSettingsLabel,
  readingSettingsShort,
  readToPage,
  removeIssueAsk,
  removeLabel,
  removePiecesTooLabel,
  returnToDeskLabel,
  signOutLabel,
  sourceHeadlineCopy,
  sourceLabel,
  stanceCopy,
  yourDeskLabel,
} from "../copy";
import { createIssue, type BoundIssue } from "../lib/bind";
import { issueNumber, longDate, minutesCopy, piecesCopy, readingMinutes, shortDate } from "../lib/edition";
import {
  hostnameOf,
  keptFigure,
  keptHeading,
  keepProgress,
  deskEnriching,
  keptSnippet,
  paperBadgeLabel,
  relatedCollapsed,
  relatedCountLabel,
  relatedRow,
  relatedVisible,
} from "../lib/kept";
import { afterResponse } from "../lib/after-response";
import { authClient } from "../lib/auth-client";
import { enrichClip, formatKeepTiming, keepClip, type Clip } from "../lib/save";
import { chosenFromBoard, chosenPieces, defaultBindChoice, type BindChoice } from "../lib/select";
import {
  clipStore,
  deleteBoundIssue,
  issueStore,
  listClips,
  listIssues,
  takeBoundOffDesk,
} from "../lib/store";
import { resolveSearchPages } from "../lib/search";
import type { RelatedPage } from "../lib/related";
import { slotState } from "../lib/related-stance";
import { Icon, stanceIcon } from "../icons";
import { Nameplate, OxfordRule } from "../mark";
import { ReadingSettingsPanel } from "../reading-settings";

const loadHome = createServerFn({ method: "GET" }).handler(async () => {
  const [clips, issues, progress] = await Promise.all([listClips(), listIssues(), readingProgress()]);
  return { clips, issues, progress };
});

/** The sheet this reader reached in each bound issue. Progress never stops the Desk from loading. */
async function readingProgress(): Promise<Record<string, number>> {
  try {
    const [{ currentReaderId }, { bookmarkStore }] = await Promise.all([
      import("../lib/reader"),
      import("../lib/bookmark"),
    ]);
    const bookmarks = await (await bookmarkStore()).forReader(await currentReaderId());
    return Object.fromEntries(bookmarks.map((bookmark) => [bookmark.itemId, bookmark.sheet]));
  } catch {
    return {};
  }
}

const keepUrl = createServerFn({ method: "POST" })
  .validator((data: { url: string }) => data)
  .handler(async ({ data }) => {
    const store = await clipStore();
    const clip = await keepClip({ url: data.url }, store);
    // Answer now; the card fills in while the desk polls. afterResponse keeps
    // the host from freezing the work once the answer is sent; if it is cut
    // off anyway, the card shows "stalled" (keepProgress) instead of hanging.
    afterResponse(
      enrichClip(clip, store, {
        searchPages: resolveSearchPages(),
        onTiming: (timing) => console.info(formatKeepTiming(timing)),
      }).catch((error: unknown) => console.error("Keep enrichment failed", error)),
    );
    return { note: keptNote, clip };
  });

const bindIssue = createServerFn({ method: "POST" })
  .validator(
    (data: { selections: { clipId: string; includeOriginal: boolean; relatedUrls: string[] }[] }) =>
      data,
  )
  .handler(async ({ data }) => {
    const clips = await clipStore();
    const items = [];
    for (const selection of data.selections) {
      const clip = await clips.get(selection.clipId);
      if (!clip) continue;
      items.push({
        clip,
        choice: {
          includeOriginal: selection.includeOriginal,
          relatedUrls: selection.relatedUrls,
        },
      });
    }
    const issue = await createIssue({ items }, await issueStore());
    await takeBoundOffDesk(issue.pieces.map((piece) => piece.url));
    return { note: boundNote, id: issue.id };
  });

const removeKept = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const store = await clipStore();
    await store.remove(data.id);
  });

const removeBound = createServerFn({ method: "POST" })
  .validator((data: { id: string; pieces: "return" | "discard" }) => data)
  .handler(async ({ data }) => {
    await deleteBoundIssue(data.id, data.pieces);
  });

export const Route = createFileRoute("/")({
  loader: () => loadHome(),
  component: Home,
});

function Home() {
  const router = useRouter();
  const { clips, issues, progress } = Route.useLoaderData();
  const [keeping, setKeeping] = useState(false);
  const [binding, setBinding] = useState(false);
  const [choices, setChoices] = useState<Record<string, BindChoice>>({});
  const [bindError, setBindError] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const enriching = deskEnriching(clips);

  // Keep answers before the card is read; reload until every card has filled in.
  useEffect(() => {
    if (!enriching) return;
    const timer = setInterval(() => void router.invalidate(), 2000);
    return () => clearInterval(timer);
  }, [enriching, router]);

  const board = useMemo(
    () =>
      clips.map((clip: Clip) => ({
        clip,
        choice: choices[clip.id] ?? defaultBindChoice(),
      })),
    [clips, choices],
  );
  const chosen = chosenFromBoard(board);
  const keptChosen = chosen.filter((piece) => piece.role === "original").length;

  function setChoice(id: string, choice: BindChoice) {
    setChoices((current) => ({ ...current, [id]: choice }));
  }

  function createIssueNow() {
    if (binding) return;
    if (chosen.length === 0) {
      setBindError(nothingSelected);
      return;
    }
    setBindError("");
    setBinding(true);
    bindIssue({
      data: {
        selections: board
          .filter(({ clip, choice }) => chosenPieces(clip, choice).length > 0)
          .map(({ clip, choice }) => ({
            clipId: clip.id,
            includeOriginal: choice.includeOriginal,
            relatedUrls: choice.relatedUrls,
          })),
      },
    })
      .then(
        (result) =>
          router.invalidate().then(() => router.navigate({ to: "/read/$id", params: { id: result.id } })),
        (cause: unknown) => {
          setBindError(cause instanceof Error ? cause.message : "Could not bind this issue.");
        },
      )
      .finally(() => setBinding(false));
  }

  return (
    <main>
      <div className="paper desk-head">
        <header className="masthead site">
          <Nameplate />
          <nav className="desk-nav" aria-label={productNav}>
            <a href="#desk" aria-current="page">
              {deskLabel}
            </a>
            <a href="#press">{pressLabel}</a>
            <button
              type="button"
              aria-expanded={settingsOpen}
              aria-controls="reading-settings"
              onClick={() => setSettingsOpen((open) => !open)}
            >
              <span className="long">{readingSettingsLabel}</span>
              <span className="short">{readingSettingsShort}</span>
            </button>
            <button
              type="button"
              onClick={() => authClient.signOut().finally(() => window.location.assign("/login"))}
            >
              {signOutLabel}
            </button>
          </nav>
          <OxfordRule />
          <p className="desk-date">
            <span>{longDate(new Date().toISOString())}</span>
            <span>{deskCount(clips.length)}</span>
          </p>
        </header>
      </div>
      <ReadingSettingsPanel id="reading-settings" open={settingsOpen} />

      <div className="paper">
        <form
          className="keep"
          onSubmit={(event) => {
            event.preventDefault();
            if (keeping) return;
            const form = event.currentTarget;
            const url = String(new FormData(form).get("url") ?? "");
            setKeeping(true);
            keepUrl({ data: { url } })
              .then(() => {
                form.reset();
                return router.invalidate();
              })
              .finally(() => setKeeping(false));
          }}
        >
          <label htmlFor="url">{keepLinkLabel}</label>
          <p className="hint" id="url-hint">
            {keepLinkHint}
          </p>
          <div className="keep-row">
            <input
              id="url"
              name="url"
              type="url"
              required
              placeholder="https://"
              aria-describedby="url-hint"
              disabled={keeping}
            />
            <button className="btn" type="submit" disabled={keeping} aria-busy={keeping}>
              {keeping ? "Keeping…" : "Keep"}
            </button>
          </div>
        </form>

        <section className="board" id="desk" aria-labelledby="desk-heading">
          <div className="board-head">
            <h2 id="desk-heading">{yourDeskLabel}</h2>
            {clips.length > 0 ? <p>{deskInstruction}</p> : null}
          </div>
          {clips.length === 0 ? (
            <p className="empty-copy">{emptyState}</p>
          ) : (
            <ul className="cards">
              {clips.map((clip: Clip) => (
                <li key={clip.id}>
                  <BindCard
                    clip={clip}
                    choice={choices[clip.id] ?? defaultBindChoice()}
                    onChoice={(choice) => setChoice(clip.id, choice)}
                    onRemove={() => removeKept({ data: { id: clip.id } }).then(() => router.invalidate())}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="board press" id="press" aria-labelledby="press-heading">
          <div className="board-head">
            <h2 id="press-heading">{pressLabel}</h2>
            <p>{issues.length > 0 ? `${pressInstruction} ${pressCount(issues.length)}.` : null}</p>
          </div>
          {issues.length === 0 ? (
            <p className="empty-copy">{pressEmpty}</p>
          ) : (
            <ul className="press-grid">
              {issues.map((issue) => (
                <li key={issue.id}>
                  <BoundCover
                    issue={issue}
                    number={issueNumber(issues, issue.id)}
                    reached={progress[issue.id]}
                    onRemove={(pieces) =>
                      removeBound({ data: { id: issue.id, pieces } }).then(() => router.invalidate())
                    }
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {clips.length > 0 ? (
        <div className="bindbar">
          <div className="bindbar-inner">
            <div>
              <p>
                <strong>{chosenCount(chosen.length)}</strong>
                {chosen.length > 0 ? (
                  <span className="detail">
                    <br />
                    {chosenDetail(keptChosen, chosen.length - keptChosen)}
                  </span>
                ) : null}
              </p>
              {bindError ? (
                <p className="status fail" role="alert">
                  <Icon name="alert" />
                  <span>{bindError}</span>
                </p>
              ) : null}
            </div>
            <button
              type="button"
              className="btn btn-primary"
              disabled={binding}
              aria-busy={binding}
              onClick={createIssueNow}
            >
              {binding ? "Creating…" : createIssueLabel}
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}

const productNav = "Quire";

function BoundCover({
  issue,
  number,
  reached,
  onRemove,
}: {
  issue: BoundIssue;
  number: number | null;
  reached: number | undefined;
  onRemove: (pieces: "return" | "discard") => Promise<void>;
}) {
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState("");
  const pages = issue.pieces.length + 1;
  const progress = reached && reached > 0 ? readToPage(Math.min(reached + 1, pages), pages) : notStarted;

  function choose(pieces: "return" | "discard") {
    setError("");
    onRemove(pieces).then(
      () => undefined,
      (cause: unknown) => {
        setError(cause instanceof Error ? cause.message : "Could not remove this issue.");
      },
    );
  }

  return (
    <article className="mini">
      <Link className="open" to="/read/$id" params={{ id: issue.id }}>
        <Nameplate label="" />
        <div className="mini-rule" />
        <p className="mini-date">
          {number ? `No. ${number} · ` : ""}
          {shortDate(issue.createdAt)}
        </p>
        <h3>{issue.title}</h3>
        <p className="meta">
          {piecesCopy(issue.pieces.length)} · {minutesCopy(readingMinutes(issue.pieces)).toLowerCase()}
        </p>
      </Link>
      {asking ? (
        <div className="ask">
          <p>{removeIssueAsk}</p>
          <div className="ask-actions">
            <button type="button" className="btn" onClick={() => choose("return")}>
              {returnToDeskLabel}
            </button>
            <button type="button" className="btn" onClick={() => choose("discard")}>
              {removePiecesTooLabel}
            </button>
            <button type="button" className="link-btn" onClick={() => setAsking(false)}>
              {keepIssueLabel}
            </button>
          </div>
        </div>
      ) : (
        <div className="actions">
          <span className="small muted">{progress}</span>
          <button type="button" className="link-btn push" onClick={() => setAsking(true)}>
            {removeLabel}
          </button>
        </div>
      )}
      {error ? (
        <p className="status fail" role="alert">
          <Icon name="alert" />
          <span>{error}</span>
        </p>
      ) : null}
    </article>
  );
}

function BindCard({
  clip,
  choice,
  onChoice,
  onRemove,
}: {
  clip: Clip;
  choice: BindChoice;
  onChoice: (choice: BindChoice) => void;
  onRemove: () => Promise<void>;
}) {
  const [error, setError] = useState("");
  const host = hostnameOf(clip.url);
  const heading = keptHeading(clip);
  const kind = paperBadgeLabel(clip.understanding);
  const snippet = keptSnippet(clip.sourceHeadline);
  const figure = keptFigure(clip.sourceHeadline);
  const keptOn = shortDate(clip.savedAt);
  const progress = keepProgress(clip);
  const topic = clip.understanding?.status === "ok" ? clip.understanding.topic : "";
  const headlineSpoken =
    clip.sourceHeadline && clip.sourceHeadline.status !== "ok"
      ? sourceHeadlineCopy(clip.sourceHeadline)
      : null;
  const sourceDate = clip.understanding?.status === "ok" ? clip.understanding.date : "";
  const date = (sourceDate && (shortDate(sourceDate) || sourceDate)) || keptOn;
  const secondary = [kind, host, date, clip.sourceHeadline?.status === "ok" ? topic : ""]
    .filter(Boolean)
    .filter((item, index, all) => all.indexOf(item) === index);
  const checkboxId = `in-${clip.id}`;

  return (
    <article className={choice.includeOriginal ? "clip is-in" : "clip"}>
      {figure ? (
        <div className="thumb">
          <img src={figure} alt="" />
        </div>
      ) : null}
      <h3>
        <Link to="/read/$id" params={{ id: clip.id }}>
          {heading}
        </Link>
      </h3>
      {snippet ? <p className="snippet">{snippet}</p> : null}
      {secondary.length > 0 ? <p className="meta">{secondary.join(" · ")}</p> : null}
      {headlineSpoken ? (
        <p className={headlineSpoken.kind === "fail" ? "status fail" : "status"}>
          {headlineSpoken.kind === "fail" ? <Icon name="alert" /> : null}
          <span>{headlineSpoken.text}</span>
        </p>
      ) : null}
      <UnderstandingFail clip={clip} />
      {progress ? (
        <p className={progress === "stalled" ? "status fail" : "status"} role="status">
          <Icon name={progress === "stalled" ? "alert" : "wait"} />
          <span>{keepProgressCopy[progress]}</span>
        </p>
      ) : null}
      <div className="actions">
        <label className="tick" htmlFor={checkboxId}>
          <input
            id={checkboxId}
            type="checkbox"
            checked={choice.includeOriginal}
            onChange={(event) => onChoice({ ...choice, includeOriginal: event.currentTarget.checked })}
          />
          {inLabel}
        </label>
        <a className="source" href={clip.url} target="_blank" rel="noreferrer">
          {sourceLabel}
          <Icon name="out" />
        </a>
        <button
          type="button"
          className="link-btn push"
          onClick={() => {
            setError("");
            onRemove().then(
              () => undefined,
              (cause: unknown) => {
                setError(cause instanceof Error ? cause.message : "Could not remove this keep.");
              },
            );
          }}
        >
          {removeLabel}
        </button>
      </div>
      <RelatedSelect
        clip={clip}
        selected={choice.relatedUrls}
        onToggle={(url, on) => {
          onChoice({
            ...choice,
            relatedUrls: on
              ? [...choice.relatedUrls, url]
              : choice.relatedUrls.filter((item) => item !== url),
          });
        }}
      />
      {error ? (
        <p className="status fail" role="alert">
          <Icon name="alert" />
          <span>{error}</span>
        </p>
      ) : null}
    </article>
  );
}

function UnderstandingFail({ clip }: { clip: Clip }) {
  const record = clip.understanding;
  if (!record || record.status !== "failed") return null;
  return (
    <p className="status fail">
      <Icon name="alert" />
      <span>
        {couldNotUnderstand} {record.message}
      </span>
    </p>
  );
}

function RelatedSelect({
  clip,
  selected,
  onToggle,
}: {
  clip: Clip;
  selected: string[];
  onToggle: (url: string, on: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const rail = clip.relatedRail;
  if (!rail) return null;

  if (rail.status !== "ok") {
    const copy = moreOnThisTopicCopy({ status: rail.status, count: 0 });
    return (
      <section className="more rail">
        <p className="status fail">
          <Icon name="alert" />
          <span>
            {copy.text} {rail.message}
          </span>
        </p>
      </section>
    );
  }

  const pages = clip.relatedReporting ?? [];
  const copy = moreOnThisTopicCopy({ status: "ok", count: pages.length });
  if (copy.kind === "empty") {
    return (
      <section className="more rail">
        <p className="absent">{nothingMoreOnTopic}</p>
      </section>
    );
  }

  const visible = relatedVisible(pages, selected);
  const collapsed = relatedCollapsed(pages, selected);
  const count = relatedCountLabel(pages.length);
  const comparableSlot = slotState(pages, "comparable");
  const contrarianSlot = slotState(pages, "contrarian");
  const listId = `more-${clip.id}`;

  return (
    <section className="more rail">
      <h3>
        <button
          type="button"
          className="more-toggle"
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => setOpen((current) => !current)}
        >
          <Icon name="right" />
          {moreOnThisTopic}
          {count ? <span className="tally">({count})</span> : null}
        </button>
      </h3>
      {visible.length > 0 ? (
        <ul>
          {visible.map((page) => (
            <RelatedItem key={page.url} page={page} on={selected.includes(page.url)} onToggle={onToggle} />
          ))}
        </ul>
      ) : null}
      {collapsed.length > 0 ? (
        <ul id={listId} hidden={!open}>
          {collapsed.map((page) => (
            <RelatedItem key={page.url} page={page} on={selected.includes(page.url)} onToggle={onToggle} />
          ))}
        </ul>
      ) : null}
      {open && (comparableSlot === "absent" || contrarianSlot === "absent") ? (
        <ul className="absent-slots">
          {comparableSlot === "absent" ? <li className="absent">{railAbsentCopy("comparable")}</li> : null}
          {contrarianSlot === "absent" ? <li className="absent">{railAbsentCopy("contrarian")}</li> : null}
        </ul>
      ) : null}
    </section>
  );
}

function RelatedItem({
  page,
  on,
  onToggle,
}: {
  page: RelatedPage;
  on: boolean;
  onToggle: (url: string, on: boolean) => void;
}) {
  const row = relatedRow(page);
  return (
    <li>
      <label className="rel tick">
        <input type="checkbox" checked={on} onChange={(event) => onToggle(page.url, event.currentTarget.checked)} />
        <span className="rel-text">
          <span className="visually-hidden">{addToIssue}: </span>
          <span className="rel-title">{row.title}</span>
          {row.stance ? (
            <span className="stance">
              <Icon name={stanceIcon[row.stance]} />
              {stanceCopy(row.stance)}
            </span>
          ) : null}
          {row.snippet ? <span className="rel-note">{row.snippet}</span> : null}
          {row.detail ? <span className="rel-meta">{row.detail}</span> : null}
        </span>
      </label>
    </li>
  );
}
