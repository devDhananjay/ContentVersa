import { useCallback, useEffect, useState } from "react";
import {
  analyzeJob,
  fetchMe,
  generateCoverLetter,
  getApiBase,
  getToken,
  loginUrl,
  saveToTracker,
  setToken,
  trackerUrl,
  uploadResumeText,
} from "../shared/api";
import type {
  AnalysisResult,
  MeResponse,
  ScrapedJob,
  UsageSnapshot,
} from "../shared/types";

type View = "home" | "cover" | "resume";

export function PopupApp() {
  const [view, setView] = useState<View>("home");
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<MeResponse | null>(null);
  const [job, setJob] = useState<ScrapedJob | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [usage, setUsage] = useState<UsageSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [cover, setCover] = useState<string | null>(null);
  const [coverStyle, setCoverStyle] = useState<"PROFESSIONAL" | "SHORT" | "STARTUP">(
    "PROFESSIONAL"
  );
  const [resumeText, setResumeText] = useState("");
  const [apiBase, setApiBaseState] = useState("https://contentverse.co.in");

  const refreshMe = useCallback(async () => {
    const token = await getToken();
    if (!token) {
      setMe(null);
      return;
    }
    try {
      const data = await fetchMe();
      setMe(data);
      setUsage(data.usage);
      setError(null);
      // Update badge with remaining analyses
      if (data.usage) {
        chrome.runtime.sendMessage({ type: "JOBPILOT_UPDATE_BADGE", analysesLeft: data.usage.analysisRemaining });
      }
    } catch (e: unknown) {
      setMe(null);
      setError(`Auth failed: ${(e as Error)?.message || "unknown"}`);
    }
  }, []);

  const scrapeActiveTab = useCallback(async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id || !tab.url) {
      setJob(null);
      return;
    }
    const isLinkedIn = /linkedin\.com/i.test(tab.url);
    const isNaukri = /naukri\.com/i.test(tab.url);
    if (!isLinkedIn && !isNaukri) {
      setJob(null);
      return;
    }

    // Try content script message first
    try {
      const res = await chrome.tabs.sendMessage(tab.id, { type: "JOBPILOT_SCRAPE" });
      if (res?.job) {
        setJob(res.job as ScrapedJob);
        return;
      }
    } catch {
      // content script not injected, fall through to executeScript
    }

    // Fallback: inject scraper directly via scripting API
    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id, allFrames: true },
        func: (source: string) => {
          function textOf(el: Element | null | undefined): string {
            return (el?.textContent || "").replace(/\s+/g, " ").trim();
          }
          if (source === "LINKEDIN") {
            const selTitle = [
              ".job-details-jobs-unified-top-card__job-title",
              ".jobs-unified-top-card__job-title",
              "h1.t-24",
              ".t-24.job-details-jobs-unified-top-card__job-title",
              ".jobs-search__job-details h1",
              ".jobs-details h1",
              "h2.job-details-jobs-unified-top-card__job-title",
              ".scaffold-layout__detail h2",
              "[class*='job-details'] h2",
              "[class*='topcard'] h1",
              "[class*='topcard'] h2",
              "h1",
            ];
            let title = "";
            for (const s of selTitle) { title = textOf(document.querySelector(s)); if (title && title.length < 200) break; }
            // Fallback: use page title
            if (!title || title.length > 200) {
              title = document.title.replace(/ \|.*$/, "").replace(/\(\d+\)/, "").trim();
            }

            const selCompany = [
              ".job-details-jobs-unified-top-card__company-name a",
              ".job-details-jobs-unified-top-card__company-name",
              ".jobs-unified-top-card__company-name a",
              ".jobs-unified-top-card__company-name",
              ".jobs-details .jobs-unified-top-card__subtitle-primary-grouping span",
            ];
            let company: string | null = null;
            for (const s of selCompany) { company = textOf(document.querySelector(s)) || null; if (company) break; }

            const selJd = [
              "#job-details",
              ".jobs-description__content",
              ".jobs-box__html-content",
              ".jobs-description-content__text",
              "[class*='jobs-description']",
              ".jobs-search__job-details--wrapper [class*='description']",
              "article [class*='description']",
              ".scaffold-layout__detail",
              "[class*='job-details']",
              "[class*='jobDetail']",
            ];
            let jd = "";
            for (const s of selJd) { jd = textOf(document.querySelector(s)); if (jd && jd.length > 40) break; }

            // Ultimate fallback: grab right-side panel or article text
            if (jd.length < 40) {
              const panels = document.querySelectorAll("article, section, [role='main'], .scaffold-layout__detail, [class*='detail'], [class*='job'], main");
              for (const p of panels) {
                const t = textOf(p);
                if (t.length > 200) { jd = t.slice(0, 40000); break; }
              }
            }
            // Last resort: use body text (LinkedIn search pages have JD in main content)
            if (jd.length < 40) {
              const body = document.body.innerText || "";
              if (body.length > 500) jd = body.slice(0, 40000);
            }

            if (!title || jd.length < 40) return null;
            return { url: location.href.split("?")[0], source: "LINKEDIN", title, company, jdText: jd.slice(0, 40000) };
          } else {
            const title =
              textOf(document.querySelector("h1.jd-header-title")) ||
              textOf(document.querySelector("h1"));
            const company =
              textOf(document.querySelector(".jd-header-comp-name a")) ||
              textOf(document.querySelector(".jd-header-comp-name")) ||
              null;
            const jd =
              textOf(document.querySelector(".styles_JDC__dang-inner-html__h0K4t")) ||
              textOf(document.querySelector("[class*='job-desc']")) ||
              textOf(document.querySelector(".dang-inner-html"));
            if (!title || (jd || "").length < 40) return null;
            return { url: location.href.split("?")[0], source: "NAUKRI", title, company, jdText: (jd || "").slice(0, 40000) };
          }
        },
        args: [isLinkedIn ? "LINKEDIN" : "NAUKRI"],
      });
      const scraped = results?.find((r: { result?: unknown }) => r.result)?.result;
      setJob((scraped as ScrapedJob) || null);
    } catch {
      setJob(null);
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const base = await getApiBase();
      setApiBaseState(base);
      await Promise.all([refreshMe(), scrapeActiveTab()]);
      setLoading(false);
    })();
  }, [refreshMe, scrapeActiveTab]);

  const openLogin = async () => {
    const base = await getApiBase();
    await chrome.tabs.create({ url: loginUrl(base) });
  };

  const runAnalyze = async () => {
    if (!job) return;
    setBusy(true);
    setError(null);
    try {
      const data = await analyzeJob(job);
      setAnalysis(data.analysis);
      setUsage(data.usage);
      chrome.runtime.sendMessage({ type: "JOBPILOT_UPDATE_BADGE", analysesLeft: data.usage.analysisRemaining });
    } catch (err) {
      const e = err as Error & { upgrade?: boolean };
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const runCover = async () => {
    if (!analysis) return;
    setBusy(true);
    setError(null);
    try {
      const data = await generateCoverLetter(analysis.id, coverStyle);
      setCover(data.coverLetter.content);
      setUsage(data.usage);
      setView("cover");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const saveJob = async () => {
    if (!job) return;
    setBusy(true);
    try {
      await saveToTracker({
        analysisId: analysis?.id,
        title: job.title,
        company: job.company,
        url: job.url,
        status: "SAVED",
      });
      setError(null);
      alert("Saved to Job Tracker");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const saveResume = async () => {
    setBusy(true);
    try {
      await uploadResumeText(resumeText);
      await refreshMe();
      setView("home");
      setResumeText("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const signOut = async () => {
    await setToken(null);
    setMe(null);
    setAnalysis(null);
  };

  if (loading) {
    return (
      <div className="w-[340px] p-6 text-center text-sm text-slate-500">
        Loading HirePilot…
      </div>
    );
  }

  if (!me) {
    return (
      <div className="w-[340px] p-5 space-y-4">
        <Header />
        <p className="text-sm text-slate-600">
          Sign in to ContentVerse to analyze jobs, generate cover letters, and
          track applications.
        </p>
        <button
          type="button"
          onClick={() => void openLogin()}
          className="w-full rounded-xl bg-emerald-600 text-white py-2.5 text-sm font-semibold hover:bg-emerald-700"
        >
          Sign in / Connect
        </button>
        <p className="text-[10px] text-slate-400 break-all">API: {apiBase}</p>
      </div>
    );
  }

  return (
    <div className="w-[340px] p-4 space-y-3">
      <Header />
      <div className="flex items-center justify-between text-[11px] text-slate-500">
        <span className="truncate max-w-[180px]">{me.user.email}</span>
        <button type="button" className="underline" onClick={() => void signOut()}>
          Sign out
        </button>
      </div>

      {usage && (
        <p className="text-[11px] text-slate-500">
          Free left: {usage.analysisRemaining}/{usage.analysisLimit} analyses ·{" "}
          {usage.coverLetterRemaining}/{usage.coverLetterLimit} letters
        </p>
      )}

      {!me.hasResume && view === "home" && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 space-y-2">
          <p>Upload a resume before analyzing jobs.</p>
          <button
            type="button"
            className="font-semibold underline"
            onClick={() => setView("resume")}
          >
            Add resume
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
          {/PRO|limit|Upgrade/i.test(error) && (
            <a
              className="block mt-1 font-semibold underline"
              href={`${apiBase}/jobpilot`}
              target="_blank"
              rel="noreferrer"
            >
              Upgrade to PRO (coming soon)
            </a>
          )}
        </div>
      )}

      {view === "resume" && (
        <div className="space-y-2">
          <textarea
            className="w-full h-32 rounded-lg border border-slate-200 p-2 text-xs"
            placeholder="Paste resume text…"
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              type="button"
              disabled={busy || resumeText.trim().length < 40}
              onClick={() => void saveResume()}
              className="flex-1 rounded-lg bg-emerald-600 text-white py-2 text-xs font-semibold disabled:opacity-50"
            >
              Save resume
            </button>
            <button
              type="button"
              onClick={() => setView("home")}
              className="rounded-lg border px-3 py-2 text-xs"
            >
              Back
            </button>
          </div>
        </div>
      )}

      {view === "cover" && cover && (
        <div className="space-y-2">
          <textarea
            readOnly
            className="w-full h-48 rounded-lg border border-slate-200 p-2 text-xs"
            value={cover}
          />
          <button
            type="button"
            className="w-full rounded-lg border py-2 text-xs font-semibold"
            onClick={() => void navigator.clipboard.writeText(cover)}
          >
            Copy cover letter
          </button>
          <button
            type="button"
            className="w-full text-xs underline text-slate-500"
            onClick={() => setView("home")}
          >
            Back
          </button>
        </div>
      )}

      {view === "home" && (
        <>
          {!job ? (
            <div className="rounded-xl border border-dashed border-slate-300 p-4 text-center text-xs text-slate-500">
              Open a LinkedIn or Naukri job page, then reopen HirePilot.
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold leading-snug">{job.title}</p>
                <p className="text-[11px] text-slate-500">
                  {job.company || "Company"} · {job.source}
                </p>
              </div>

              {!analysis ? (
                <button
                  type="button"
                  disabled={busy || !me.hasResume}
                  onClick={() => void runAnalyze()}
                  className="w-full rounded-xl bg-emerald-600 text-white py-2.5 text-sm font-semibold disabled:opacity-50"
                >
                  {busy ? "Analyzing…" : "🎯 Analyze job match"}
                </button>
              ) : (
                <>
                  <ScoreCard analysis={analysis} />
                  <div className="flex gap-2">
                    <select
                      className="flex-1 rounded-lg border text-xs px-2 py-2"
                      value={coverStyle}
                      onChange={(e) =>
                        setCoverStyle(e.target.value as typeof coverStyle)
                      }
                    >
                      <option value="PROFESSIONAL">Professional</option>
                      <option value="SHORT">Short & Direct</option>
                      <option value="STARTUP">Startup Style</option>
                    </select>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void runCover()}
                      className="rounded-lg bg-slate-900 text-white px-3 py-2 text-xs font-semibold"
                    >
                      Cover letter
                    </button>
                  </div>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void saveJob()}
                    className="w-full rounded-lg border border-slate-300 py-2 text-xs font-semibold"
                  >
                    📊 Save to Tracker
                  </button>
                  <button
                    type="button"
                    className="w-full text-[11px] text-emerald-700 underline"
                    onClick={() => void runAnalyze()}
                    disabled={busy}
                  >
                    Re-analyze
                  </button>
                </>
              )}
            </div>
          )}

          <div className="flex gap-2 pt-1 border-t border-slate-200">
            <button
              type="button"
              className="flex-1 text-[11px] underline text-slate-500"
              onClick={() => setView("resume")}
            >
              Resume
            </button>
            <a
              className="flex-1 text-[11px] underline text-slate-500 text-center"
              href={trackerUrl(apiBase)}
              target="_blank"
              rel="noreferrer"
            >
              View Tracker
            </a>
          </div>
        </>
      )}
    </div>
  );
}

function Header() {
  return (
    <div className="flex items-center gap-2">
      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center text-[10px] font-bold">
        HP
      </div>
      <div>
        <p className="font-bold text-sm leading-none">ContentVerse HirePilot</p>
        <p className="text-[10px] text-slate-500">Find · Understand · Apply</p>
      </div>
    </div>
  );
}

function ScoreCard({ analysis }: { analysis: AnalysisResult }) {
  const sa = analysis.shouldApply;
  const verdictColor =
    sa.verdict === "APPLY"
      ? "border-emerald-300 bg-emerald-50"
      : sa.verdict === "SKIP"
        ? "border-red-200 bg-red-50"
        : "border-amber-200 bg-amber-50";

  return (
    <div className="space-y-3">
      <div className="text-center">
        <p className="text-[10px] uppercase tracking-wide text-slate-500">
          Job Match
        </p>
        <p className="text-4xl font-extrabold text-emerald-600 tabular-nums">
          {analysis.matchScore}%
        </p>
        <div className="mt-2 h-2 rounded-full bg-slate-200 overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full"
            style={{ width: `${analysis.matchScore}%` }}
          />
        </div>
      </div>

      <div className={`rounded-xl border p-3 space-y-1 ${verdictColor}`}>
        <p className="text-xs font-bold">Should You Apply?</p>
        <p className="text-sm font-semibold">{sa.label}</p>
        <p className="text-[11px] text-slate-700">{sa.summary}</p>
        <p className="text-[10px] text-slate-500">
          Competition: {sa.competition} · Experience: {sa.experienceMatch}% · ATS:{" "}
          {sa.resumeAts}%
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <div>
          <p className="font-semibold text-emerald-700 mb-1">Matched</p>
          <ul className="space-y-0.5">
            {analysis.skillsMatched.slice(0, 6).map((s) => (
              <li key={s}>✅ {s}</li>
            ))}
            {analysis.skillsMatched.length === 0 && (
              <li className="text-slate-400">—</li>
            )}
          </ul>
        </div>
        <div>
          <p className="font-semibold text-amber-700 mb-1">Missing</p>
          <ul className="space-y-0.5">
            {analysis.skillsMissing.slice(0, 6).map((s) => (
              <li key={s}>⚠️ {s}</li>
            ))}
            {analysis.skillsMissing.length === 0 && (
              <li className="text-slate-400">—</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
