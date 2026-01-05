"use client";

import { useMemo, useState } from "react";
import { QUESTIONS, Question } from "@/lib/questions";
import type { Answers } from "@/lib/engine";
import { generateJobPost, generateOnePager, generateSOW, scoreDifficulty, scoreRisk, scoreTypes, topTypes, getOptionLabel } from "@/lib/engine";

type Step = {
  title: string;
  qids: string[];
};

const STEPS: Step[] = [
  { title: "基本情報", qids: ["Q1","Q2","Q3"] },
  { title: "目的・成功条件", qids: ["Q4","Q5","Q6","Q7"] },
  { title: "業務の実態", qids: ["Q8","Q9","Q10","Q11","Q12"] },
  { title: "データの状態", qids: ["Q13","Q14","Q15","Q16","Q17"] },
  { title: "IT制約・運用", qids: ["Q18","Q19","Q20","Q21","Q22"] },
  { title: "推進力", qids: ["Q23","Q24","Q25"] },
];

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function clampMulti(values: string[], max: number): string[] {
  if (values.length <= max) return values;
  return values.slice(0, max);
}

function QuestionCard({
  q,
  value,
  onChange,
}: {
  q: Question;
  value: string | string[] | undefined;
  onChange: (v: string | string[]) => void;
}) {
  const selected = Array.isArray(value) ? new Set(value) : new Set(value ? [value] : []);

  return (
    <div className="card" style={{ padding: 14, marginBottom: 12 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "baseline", justifyContent: "space-between" }}>
        <div style={{ fontWeight: 800 }}>{q.qid}. {q.text}</div>
        {q.multi ? <span className="pill">複数選択</span> : <span className="pill">単一選択</span>}
      </div>
      {q.help && <div className="small" style={{ marginTop: 6 }}>{q.help}</div>}
      <div className="grid" style={{ marginTop: 10 }}>
        {q.options.map((opt) => {
          const isSel = selected.has(opt.key);
          return (
            <div
              key={opt.key}
              className={"option" + (isSel ? " selected" : "")}
              role="button"
              tabIndex={0}
              onClick={() => {
                if (!q.multi) {
                  onChange(opt.key);
                  return;
                }
                const next = new Set(selected);
                if (next.has(opt.key)) next.delete(opt.key);
                else next.add(opt.key);
                let arr = Array.from(next);
                // Q3/Q5は最大2つ、Q13は最大3つに制限（MVP）
                if (q.qid === "Q3" || q.qid === "Q5") arr = clampMulti(arr, 2);
                if (q.qid === "Q13") arr = clampMulti(arr, 3);
                onChange(arr);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  (e.currentTarget as HTMLDivElement).click();
                }
              }}
            >
              <div style={{ fontWeight: 700 }}>{opt.key}</div>
              <div className="small">{opt.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function StepperForm() {
  const [stepIdx, setStepIdx] = useState(0);
  const [answers, setAnswers] = useState<Answers>(() => ({}));

  const step = STEPS[stepIdx];
  const stepQuestions = useMemo(
    () => QUESTIONS.filter((q) => step.qids.includes(q.qid)),
    [step.qids]
  );

  const setAnswer = (qid: string, v: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [qid]: v }));
  };

  const progress = Math.round(((stepIdx + 1) / STEPS.length) * 100);

  const canNext = useMemo(() => {
    // 現ステップのqidsがすべて回答済みか
    return step.qids.every((qid) => {
      const v = answers[qid];
      if (v === undefined) return false;
      if (Array.isArray(v)) return v.length > 0;
      return String(v).length > 0;
    });
  }, [answers, step.qids]);

  const finished = stepIdx === STEPS.length - 1;

  // Preview (computed only when finished and valid-ish)
  const computed = useMemo(() => {
    if (!finished) return null;
    try {
      const { scores } = scoreTypes(answers);
      const top = topTypes(scores, 3);
      const diff = scoreDifficulty(answers);
      const risk = scoreRisk(answers);
      return { top, diff, risk };
    } catch {
      return null;
    }
  }, [answers, finished]);

  const onePager = useMemo(() => (finished ? generateOnePager(answers) : ""), [answers, finished]);
  const sow = useMemo(() => (finished ? generateSOW(answers) : ""), [answers, finished]);
  const job = useMemo(() => (finished ? generateJobPost(answers) : ""), [answers, finished]);

  return (
    <div>
      <div className="row" style={{ alignItems: "center", justifyContent: "space-between" }}>
        <div className="pill">Step {stepIdx + 1}/{STEPS.length}: {step.title}</div>
        <div className="pill">進捗 {progress}%</div>
      </div>

      <div style={{ marginTop: 14 }}>
        {stepQuestions.map((q) => (
          <QuestionCard
            key={q.qid}
            q={q}
            value={answers[q.qid]}
            onChange={(v) => setAnswer(q.qid, v)}
          />
        ))}
      </div>

      <div className="row" style={{ justifyContent: "space-between", marginTop: 10 }}>
        <button
          className="btn"
          onClick={() => setStepIdx((i) => Math.max(0, i - 1))}
          disabled={stepIdx === 0}
        >
          戻る
        </button>

        {!finished ? (
          <button
            className="btn primary"
            onClick={() => setStepIdx((i) => Math.min(STEPS.length - 1, i + 1))}
            disabled={!canNext}
          >
            次へ
          </button>
        ) : (
          <div className="row">
            <button className="btn" onClick={() => downloadText("onepager.md", onePager)}>1枚サマリーDL</button>
            <button className="btn" onClick={() => downloadText("sow.md", sow)}>SOW DL</button>
            <button className="btn primary" onClick={() => downloadText("job_post.md", job)}>募集票DL</button>
          </div>
        )}
      </div>

      {finished && (
        <div style={{ marginTop: 18 }}>
          <hr />
          <div className="row">
            <div className="col">
              <div className="pill">推奨タイプ</div>
              <div style={{ marginTop: 10 }}>
                {computed?.top?.map((t) => (
                  <div key={t} className="option selected" style={{ marginBottom: 8, cursor: "default" }}>
                    <div style={{ fontWeight: 800 }}>{t}</div>
                    <div className="small">（推定ロジック: ルールベース / 調整前提）</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="col">
              <div className="pill">難易度 / 炎上リスク</div>
              <div style={{ marginTop: 10 }} className="card">
                <div style={{ fontWeight: 800 }}>難易度: {computed?.diff?.level}（score={computed?.diff?.score}）</div>
                <div className="small" style={{ marginTop: 6 }}>{computed?.diff?.reasons?.join(" / ") || "—"}</div>
                <hr />
                <div style={{ fontWeight: 800 }}>炎上リスク: {computed?.risk?.level}（score={computed?.risk?.score}）</div>
                <div className="small" style={{ marginTop: 6 }}>{computed?.risk?.reasons?.join(" / ") || "—"}</div>
              </div>
            </div>
          </div>

          <hr />
          <div className="row">
            <div className="col">
              <div className="pill">1枚サマリー（Markdown）</div>
              <pre style={{ marginTop: 10 }}>{onePager}</pre>
            </div>
            <div className="col">
              <div className="pill">SOW叩き台（Markdown）</div>
              <pre style={{ marginTop: 10 }}>{sow}</pre>
            </div>
          </div>

          <hr />
          <div>
            <div className="pill">募集票（Markdown）</div>
            <pre style={{ marginTop: 10 }}>{job}</pre>
          </div>
        </div>
      )}

      <hr />
      <div className="small">
        補足: Q3/Q5 は最大2つ、Q13は最大3つに制限しています（MVP）。必要なら設定を外せます。
      </div>
    </div>
  );
}
