import { QUESTIONS } from "./questions";

export type AnswerValue = string | string[];
export type Answers = Record<string, AnswerValue>;

export type TypeName =
  | "データ整備"
  | "可視化・KPI"
  | "業務標準化"
  | "ワークフロー電子化"
  | "システム連携"
  | "入力改善"
  | "社内ナレッジ検索"
  | "予測・最適化";

export const TYPES: TypeName[] = [
  "データ整備",
  "可視化・KPI",
  "業務標準化",
  "ワークフロー電子化",
  "システム連携",
  "入力改善",
  "社内ナレッジ検索",
  "予測・最適化",
];

const DIFFICULTY_WEIGHTS: Record<string, number> = {
  Q7: 2,
  Q9: 2,
  Q14: 2,
  Q15: 2,
  Q16: 1,
  Q18: 1,
  Q19: 1,
  Q20: 2,
  Q22: 1,
};

const RISK_WEIGHTS: Record<string, number> = {
  Q12: 2,
  Q14: 2,
  Q15: 2,
  Q16: 2,
  Q21: 2,
  Q23: 2,
  Q24: 2,
  Q25: 1,
};

// 0..3（悪いほど大きい）
const BADNESS: Record<string, Record<string, number>> = {
  Q7: { A: 0, B: 1, C: 2, D: 3 },
  Q9: { A: 0, B: 1, C: 2, D: 3 },
  Q14: { A: 0, B: 1, C: 2, D: 3 },
  Q15: { A: 0, B: 1, C: 2, D: 3 },
  Q16: { A: 0, B: 1, C: 2, D: 3 },
  Q18: { A: 0, B: 1, C: 3, D: 2 },
  Q19: { A: 0, B: 1, C: 2, D: 3 },
  Q20: { A: 0, B: 1, C: 3, D: 2 },
  Q22: { A: 0, B: 1, C: 2, D: 3 },

  Q12: { A: 0, B: 1, C: 2, D: 3 },
  Q21: { A: 0, B: 1, C: 2, D: 3 },
  Q23: { A: 0, B: 1, C: 2, D: 3 },
  Q24: { A: 0, B: 1, C: 3, D: 2 },
  // 予算：未定/極小は炎上しがち（初期仮置き）
  Q25: { A: 2, B: 1, C: 0, D: 0, E: 2 },
};

function asList(v: AnswerValue | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

export function getOptionLabel(qid: string, key: string): string {
  const q = QUESTIONS.find((x) => x.qid === qid);
  if (!q) return key;
  const opt = q.options.find((o) => o.key === key);
  return opt ? opt.label : key;
}

export function validateAnswers(answers: Answers): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  for (const q of QUESTIONS) {
    const v = answers[q.qid];
    if (v === undefined || (Array.isArray(v) && v.length === 0) || v === "") {
      errors.push(`未回答: ${q.qid}`);
      continue;
    }
    if (q.multi && !Array.isArray(v)) errors.push(`${q.qid} は複数選択（配列）で渡してください`);
    if (!q.multi && Array.isArray(v)) errors.push(`${q.qid} は単一選択で渡してください`);
  }
  return { ok: errors.length === 0, errors };
}

function badness(qid: string, ans: AnswerValue | undefined): number {
  const t = BADNESS[qid];
  if (!t || ans === undefined) return 0;
  const list = asList(ans);
  return list.reduce((m, k) => Math.max(m, t[String(k)] ?? 0), 0);
}

export function scoreDifficulty(answers: Answers): { score: number; level: "S" | "M" | "L"; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  for (const [qid, w] of Object.entries(DIFFICULTY_WEIGHTS)) {
    const b = badness(qid, answers[qid]);
    score += w * b;
    if (b >= 2) reasons.push(`${qid} が重め（選択=${asList(answers[qid]).join(",")}）`);
  }
  const level = score <= 10 ? "S" : score <= 18 ? "M" : "L";
  return { score, level, reasons: reasons.slice(0, 5) };
}

export function scoreRisk(answers: Answers): { score: number; level: "低" | "中" | "高"; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  for (const [qid, w] of Object.entries(RISK_WEIGHTS)) {
    const b = badness(qid, answers[qid]);
    score += w * b;
    if (b >= 2) reasons.push(`${qid} が炎上要因（選択=${asList(answers[qid]).join(",")}）`);
  }
  const level = score <= 10 ? "低" : score <= 18 ? "中" : "高";
  return { score, level, reasons: reasons.slice(0, 5) };
}

export function scoreTypes(answers: Answers): { scores: Record<TypeName, number>; reasons: Record<TypeName, string[]> } {
  const scores: Record<TypeName, number> = TYPES.reduce((acc, t) => {
   acc[t] = 0;
   return acc;
   }, {} as Record<TypeName, number>);

  const reasons: Record<TypeName, string[]> = TYPES.reduce((acc, t) => {
   acc[t] = [];
   return acc;
   }, {} as Record<TypeName, string[]>);


  const q3 = new Set(asList(answers.Q3));
  const q4 = String(answers.Q4 ?? "");
  const q9 = String(answers.Q9 ?? "");
  const q10 = String(answers.Q10 ?? "");
  const q11 = String(answers.Q11 ?? "");
  const q12 = String(answers.Q12 ?? "");
  const q13 = new Set(asList(answers.Q13));
  const q15 = String(answers.Q15 ?? "");
  const q17 = String(answers.Q17 ?? "");
  const q20 = String(answers.Q20 ?? "");

  // 1) データ整備
  if (q15 === "C" || q15 === "D" || q13.has("D")) {
    scores["データ整備"] += 4;
    reasons["データ整備"].push("マスタ/データ品質が不安定（表記揺れ・重複・個人PCなど）");
  }

  // 2) 可視化・KPI
  if (q4 === "E" || (q3.has("E") && (q13.has("B") || q13.has("C")))) {
    scores["可視化・KPI"] += 3;
    reasons["可視化・KPI"].push("数値が見えない/合わない、またはデータ活用テーマ");
  }

  // 3) 業務標準化
  if ((q9 === "C" || q9 === "D") && (q12 === "B" || q12 === "C" || q12 === "D")) {
    scores["業務標準化"] += 3;
    reasons["業務標準化"].push("例外が多い＋ルールが属人/未整備");
  }

  // 4) ワークフロー電子化
  if (q3.has("A") && (q10 === "A" || q10 === "B" || q10 === "E")) {
    scores["ワークフロー電子化"] += 3;
    reasons["ワークフロー電子化"].push("バックオフィス×紙/Excel中心（申請・承認の電子化が効く）");
  }

  // 5) システム連携
  if (q11 === "C" || q11 === "D") {
    scores["システム連携"] += 3;
    reasons["システム連携"].push("二重入力が多い（連携/自動化で削減余地）");
  }
  if (q20 === "A" || q20 === "B") {
    scores["システム連携"] += 2;
    reasons["システム連携"].push("API/CSV連携が可能");
  }

  // 6) 入力改善
  if ((q10 === "A" || q10 === "B") && (q3.has("C") || q3.has("B"))) {
    scores["入力改善"] += 3;
    reasons["入力改善"].push("紙/Excel中心で現場/フロントの入力負荷が高い");
  }

  // 7) 社内ナレッジ検索
  if (q3.has("D")) {
    scores["社内ナレッジ検索"] += 4;
    reasons["社内ナレッジ検索"].push("情報共有/ナレッジがテーマ");
  }

  // 8) 予測・最適化
  if (q3.has("E") && (q17 === "C" || q17 === "D")) {
    scores["予測・最適化"] += 2;
    reasons["予測・最適化"].push("日次以上でデータ更新（予測/最適化の土台がある）");
  }
  if (q3.has("E") && (q15 === "C" || q15 === "D")) {
    scores["予測・最適化"] -= 1;
    reasons["予測・最適化"].push("ただしデータ品質が課題（先にデータ整備が必要）");
  }

  return { scores, reasons };
}

export function topTypes(scores: Record<TypeName, number>, k = 3): TypeName[] {
  return (Object.entries(scores) as Array<[TypeName, number]>)
    .sort((a, b) => b[1] - a[1])
    .slice(0, k)
    .map(([t]) => t);
}

function todayISO(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// ---- Markdown generators ----

export function generateOnePager(answers: Answers): string {
  const { ok, errors } = validateAnswers(answers);
  if (!ok) return `# 入力エラー\n\n${errors.map((e) => `- ${e}`).join("\n")}`;

  const { scores, reasons } = scoreTypes(answers);
  const top = topTypes(scores, 3);

  const diff = scoreDifficulty(answers);
  const risk = scoreRisk(answers);

  const themeLabels = asList(answers.Q3).map((k) => getOptionLabel("Q3", k)).join(" / ");
  const pain = getOptionLabel("Q4", String(answers.Q4));
  const deadline = getOptionLabel("Q6", String(answers.Q6));

  const lines: string[] = [];
  lines.push(`# 1枚サマリー（案件化診断）`);
  lines.push(`- 作成日: ${todayISO()}`);
  lines.push(`- 主要テーマ: ${themeLabels}`);
  lines.push(`- 主要課題: **${pain}**`);
  lines.push(`- 期限: **${deadline}**`);
  lines.push("");
  lines.push(`## 推奨案件タイプ（優先順）`);
  top.forEach((t, i) => {
    const rs = (reasons[t] ?? []).slice(0, 2).join("; ") || "（理由：回答から推定）";
    lines.push(`${i + 1}. **${t}** — ${rs}`);
  });
  lines.push("");
  lines.push(`## 難易度 / 炎上リスク`);
  lines.push(`- 難易度: **${diff.level}**（score=${diff.score}）`);
  if (diff.reasons.length) lines.push(`  - 理由: ${diff.reasons.join(" / ")}`);
  lines.push(`- 炎上リスク: **${risk.level}**（score=${risk.score}）`);
  if (risk.reasons.length) lines.push(`  - 理由: ${risk.reasons.join(" / ")}`);
  lines.push("");
  lines.push(`## 次の一手（最短）`);
  lines.push(`- ① 前提整理（データ所在/抽出方法/権限/制約）を確定してSOW叩き台を固める`);
  lines.push(`- ② 募集票で提案募集（3名程度）→ 15分×2回でスコープ確定→着手`);
  return lines.join("\n");
}

export function generateSOW(answers: Answers, primaryType?: TypeName): string {
  const { ok, errors } = validateAnswers(answers);
  if (!ok) return `# 入力エラー\n\n${errors.map((e) => `- ${e}`).join("\n")}`;

  const { scores, reasons } = scoreTypes(answers);
  const top = topTypes(scores, 1)[0];
  const primary = primaryType ?? top;

  const themeLabels = asList(answers.Q3).map((k) => getOptionLabel("Q3", k)).join(" / ");
  const pain = getOptionLabel("Q4", String(answers.Q4));
  const deadline = getOptionLabel("Q6", String(answers.Q6));
  const kpis = asList(answers.Q5).map((k) => getOptionLabel("Q5", k)).join(" / ") || "（未設定）";

  const lines: string[] = [];
  lines.push(`# 案件定義書（SOW叩き台）: ${primary}`);
  lines.push(`- 作成日: ${todayISO()}`);
  lines.push(`- 主要テーマ: ${themeLabels}`);
  lines.push(`- 主要課題: ${pain}`);
  lines.push("");
  lines.push(`## 1. 背景・課題`);
  lines.push(`- 現状の困りごと（具体例を1〜3個）：`);
  lines.push(`  - （例）二重入力で毎日◯分/人かかる`);
  lines.push("");
  lines.push(`## 2. 目的・KPI・期限`);
  lines.push(`- KPI: ${kpis}`);
  lines.push(`- 期限: ${deadline}`);
  lines.push("");
  lines.push(`## 3. 対象範囲（やる/やらない）`);
  lines.push(`- やること：`);
  lines.push(`  - （例）対象業務のデータ収集・設計・実装・テスト・運用手順作成`);
  lines.push(`- やらないこと：`);
  lines.push(`  - （例）全社展開/他部門の追加要望は別途`);
  lines.push("");
  lines.push(`## 4. 現状フロー（As-Is）`);
  lines.push(`- 主要ステップ（箇条書き）：`);
  lines.push("");
  lines.push(`## 5. データ一覧（所在/形式/更新/機微情報）`);
  lines.push(`- データ所在(Q13): ${asList(answers.Q13).map((k) => getOptionLabel("Q13", k)).join(", ")}`);
  lines.push(`- 取得容易性(Q14): ${getOptionLabel("Q14", String(answers.Q14))}`);
  lines.push(`- マスタ品質(Q15): ${getOptionLabel("Q15", String(answers.Q15))}`);
  lines.push(`- 機微情報(Q16): ${getOptionLabel("Q16", String(answers.Q16))}`);
  lines.push(`- 更新頻度(Q17): ${getOptionLabel("Q17", String(answers.Q17))}`);
  lines.push("");
  lines.push(`## 6. 連携対象・制約`);
  lines.push(`- 連携可否(Q20): ${getOptionLabel("Q20", String(answers.Q20))}`);
  lines.push(`- クラウド方針(Q18): ${getOptionLabel("Q18", String(answers.Q18))}`);
  lines.push(`- ネットワーク制約(Q19): ${getOptionLabel("Q19", String(answers.Q19))}`);
  lines.push("");
  lines.push(`## 7. 成果物（Deliverables）`);
  const rs = (reasons[primary] ?? []).slice(0, 2).join("; ") || "（回答から推定）";
  lines.push(`- 推奨根拠: ${rs}`);
  lines.push(`- 詳細設計（項目定義/データマッピング/権限/運用）`);
  lines.push(`- 実装物（連携/フォーム/ダッシュボード等）`);
  lines.push(`- テスト観点と受入基準（Acceptance criteria）`);
  lines.push(`- 運用手順書（定例/障害時/問い合わせ）`);
  lines.push("");
  lines.push(`## 8. フェーズ案`);
  lines.push(`- 0. 事前調査（現場ヒアリング/データ確認）`);
  lines.push(`- 1. 設計（要件/SOW確定・画面/連携/データ設計）`);
  lines.push(`- 2. 実装（MVP）`);
  lines.push(`- 3. テスト（受入/例外/負荷）`);
  lines.push(`- 4. 運用開始（監視・改善サイクル）`);
  lines.push("");
  lines.push(`## 9. 体制・会議体`);
  lines.push(`- 窓口担当: （氏名/役割）`);
  lines.push(`- 決裁者: ${getOptionLabel("Q23", String(answers.Q23))}`);
  lines.push(`- レビュー頻度: ${getOptionLabel("Q24", String(answers.Q24))}`);
  lines.push("");
  lines.push(`## 10. 前提条件（社内の宿題）`);
  lines.push(`- データ提供（サンプル/本番）と抽出権限の付与`);
  lines.push(`- マスタ/ルールの“正”を決める責任者の設定`);
  lines.push(`- テスト協力（代表ユーザー2名以上）`);
  return lines.join("\n");
}

export function generateJobPost(answers: Answers, primaryType?: TypeName): string {
  const { ok, errors } = validateAnswers(answers);
  if (!ok) return `# 入力エラー\n\n${errors.map((e) => `- ${e}`).join("\n")}`;

  const { scores } = scoreTypes(answers);
  const top = topTypes(scores, 1)[0];
  const primary = primaryType ?? top;

  const diff = scoreDifficulty(answers);
  const risk = scoreRisk(answers);

  const pain = getOptionLabel("Q4", String(answers.Q4));
  const deadline = getOptionLabel("Q6", String(answers.Q6));
  const budget = getOptionLabel("Q25", String(answers.Q25));

  const lines: string[] = [];
  lines.push(`# 募集票（マッチング用）: ${primary}`);
  lines.push(`- 作成日: ${todayISO()}`);
  lines.push("");
  lines.push(`## ミッション`);
  lines.push(`- 課題「${pain}」を改善し、期限「${deadline}」までに成果物をリリースする`);
  lines.push("");
  lines.push(`## 難易度 / 炎上リスク`);
  lines.push(`- 難易度: ${diff.level} / 炎上リスク: ${risk.level}`);
  lines.push("");
  lines.push(`## スコープ（やること）`);
  lines.push(`- 要件整理（現場ヒアリング/データ確認/スコープ確定）`);
  lines.push(`- 設計（データ/連携/画面/権限/運用）`);
  lines.push(`- 実装（MVP）＋テスト＋運用引継ぎ`);
  lines.push("");
  lines.push(`## スコープ外（やらないこと）`);
  lines.push(`- 全社展開や他領域への横展開は別途合意後`);
  lines.push("");
  lines.push(`## 成果物`);
  lines.push(`- 1枚サマリー / SOW確定版 / 実装物 / 手順書 / 受入基準`);
  lines.push("");
  lines.push(`## 制約・前提`);
  lines.push(`- クラウド方針: ${getOptionLabel("Q18", String(answers.Q18))}`);
  lines.push(`- ネットワーク: ${getOptionLabel("Q19", String(answers.Q19))}`);
  lines.push(`- 個人情報: ${getOptionLabel("Q16", String(answers.Q16))}`);
  lines.push(`- 連携可否: ${getOptionLabel("Q20", String(answers.Q20))}`);
  lines.push("");
  lines.push(`## 稼働・期間（仮）`);
  lines.push(`- 期間: ${deadline}（目安）`);
  lines.push(`- MTG: 週1回 15〜30分`);
  lines.push(`- 予算感: ${budget}`);
  lines.push("");
  lines.push(`## 必須スキル（例）`);
  lines.push(`- 要件定義/業務理解、データ設計、実装・運用設計`);
  lines.push(`## 歓迎スキル（例）`);
  lines.push(`- iPaaS/RPA、BI、権限設計、セキュリティ対応、ドキュメンテーション`);
  return lines.join("\n");
}
