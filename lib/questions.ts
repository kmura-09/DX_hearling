export type OptionKey = string;

export type Option = { key: OptionKey; label: string };
export type Question = {
  qid: string;
  text: string;
  options: Option[];
  multi?: boolean;
  help?: string;
};

export const QUESTIONS: Question[] = [
  { qid: "Q1", text: "業種（近いもの）", options: [
    { key: "A", label: "製造" }, { key: "B", label: "卸・小売" }, { key: "C", label: "サービス" },
    { key: "D", label: "建設・不動産" }, { key: "E", label: "医療・介護" }, { key: "F", label: "その他" },
  ]},
  { qid: "Q2", text: "従業員規模", options: [
    { key: "A", label: "〜20" }, { key: "B", label: "21〜50" }, { key: "C", label: "51〜100" },
    { key: "D", label: "101〜300" }, { key: "E", label: "301〜" },
  ]},
  { qid: "Q3", text: "相談テーマ（複数可・最大2つ）", multi: true, help: "最も困っている領域を2つまで選んでください。",
    options: [
      { key: "A", label: "バックオフィス（経理・人事・総務）" },
      { key: "B", label: "フロント（営業・顧客対応・受発注）" },
      { key: "C", label: "現場（現業/物流/店舗等）" },
      { key: "D", label: "情報共有（文書・ナレッジ・問い合わせ）" },
      { key: "E", label: "データ活用（可視化・分析・予測）" },
    ],
  },

  { qid: "Q4", text: "いちばん困っていることは？（1つ）", options: [
    { key: "A", label: "工数が多い" }, { key: "B", label: "ミスが多い" },
    { key: "C", label: "リードタイムが長い" }, { key: "D", label: "属人化" },
    { key: "E", label: "数字が合わない・見えない" },
  ]},
  { qid: "Q5", text: "成功したと判断するKPIは？（最大2つ）", multi: true, options: [
    { key: "A", label: "工数削減" }, { key: "B", label: "ミス削減" }, { key: "C", label: "締め短縮" },
    { key: "D", label: "取りこぼし削減" }, { key: "E", label: "その他" },
  ]},
  { qid: "Q6", text: "期限（いつまでに）", options: [
    { key: "A", label: "〜1ヶ月" }, { key: "B", label: "〜3ヶ月" }, { key: "C", label: "〜6ヶ月" },
    { key: "D", label: "6ヶ月〜" }, { key: "E", label: "未定" },
  ]},
  { qid: "Q7", text: "影響範囲（関係部署数）", options: [
    { key: "A", label: "1部署" }, { key: "B", label: "2部署" }, { key: "C", label: "3〜4部署" }, { key: "D", label: "5部署〜" },
  ]},

  { qid: "Q8", text: "対象業務の処理件数（月あたり概算）", options: [
    { key: "A", label: "〜100" }, { key: "B", label: "101〜500" }, { key: "C", label: "501〜2000" }, { key: "D", label: "2001〜" },
  ]},
  { qid: "Q9", text: "例外対応の多さ", options: [
    { key: "A", label: "ほぼ定型" }, { key: "B", label: "たまに例外" }, { key: "C", label: "例外が多い" }, { key: "D", label: "例外が主流（ルール未整理）" },
  ]},
  { qid: "Q10", text: "現状の主な運用", options: [
    { key: "A", label: "紙中心" }, { key: "B", label: "Excel中心" }, { key: "C", label: "SaaS中心" }, { key: "D", label: "基幹中心" }, { key: "E", label: "混在" },
  ]},
  { qid: "Q11", text: "二重入力はありますか？", options: [
    { key: "A", label: "なし" }, { key: "B", label: "たまに" }, { key: "C", label: "日常的" }, { key: "D", label: "ほぼ全工程" },
  ]},
  { qid: "Q12", text: "既存の手順書・ルールは？", options: [
    { key: "A", label: "あり&守られている" }, { key: "B", label: "あるが古い/守られていない" },
    { key: "C", label: "口頭・属人" }, { key: "D", label: "担当者ごとに違う" },
  ]},

  { qid: "Q13", text: "データはどこにありますか？（複数可）", multi: true, options: [
    { key: "A", label: "Excel/CSV（共有フォルダ）" }, { key: "B", label: "SaaS（Salesforce等）" },
    { key: "C", label: "基幹（会計/在庫/生産等）" }, { key: "D", label: "個人PC" }, { key: "E", label: "紙/PDFスキャン" },
  ]},
  { qid: "Q14", text: "データの取り出しやすさ", options: [
    { key: "A", label: "誰でも出せる" }, { key: "B", label: "一部の人だけ" }, { key: "C", label: "ベンダー依頼が必要" }, { key: "D", label: "ほぼ出せない" },
  ]},
  { qid: "Q15", text: "マスタ品質（表記揺れ/重複）", options: [
    { key: "A", label: "きれい" }, { key: "B", label: "少し揺れ" }, { key: "C", label: "揺れ・重複が多い" }, { key: "D", label: "マスタがない/信用できない" },
  ]},
  { qid: "Q16", text: "個人情報・機微情報の有無", options: [
    { key: "A", label: "なし" }, { key: "B", label: "少し" }, { key: "C", label: "あり" }, { key: "D", label: "かなりある" },
  ]},
  { qid: "Q17", text: "データ更新頻度", options: [
    { key: "A", label: "月次" }, { key: "B", label: "週次" }, { key: "C", label: "日次" }, { key: "D", label: "リアルタイムに近い" },
  ]},

  { qid: "Q18", text: "クラウド利用の方針", options: [
    { key: "A", label: "何でもOK" }, { key: "B", label: "条件付きOK" }, { key: "C", label: "原則NG" }, { key: "D", label: "分からない（方針がない）" },
  ]},
  { qid: "Q19", text: "社内ネットワーク制約", options: [
    { key: "A", label: "制約少" }, { key: "B", label: "VPN必須" }, { key: "C", label: "社内LAN限定" }, { key: "D", label: "端末制限・持ち出し不可が強い" },
  ]},
  { qid: "Q20", text: "既存システムの連携可否（API/CSV等）", options: [
    { key: "A", label: "APIあり" }, { key: "B", label: "CSVならOK" }, { key: "C", label: "手作業しかない" }, { key: "D", label: "不明" },
  ]},
  { qid: "Q21", text: "セキュリティ・権限管理", options: [
    { key: "A", label: "役割ごとに権限設計済み" }, { key: "B", label: "一部できている" },
    { key: "C", label: "共有アカウント/ゆるい" }, { key: "D", label: "何も決まってない" },
  ]},
  { qid: "Q22", text: "運用体制（保守/障害対応）", options: [
    { key: "A", label: "担当がいて運用できる" }, { key: "B", label: "担当はいるが忙しい" },
    { key: "C", label: "兼務で難しい" }, { key: "D", label: "いない（外部前提）" },
  ]},

  { qid: "Q23", text: "決裁者（GOを出せる人）は誰？", options: [
    { key: "A", label: "経営者" }, { key: "B", label: "部門長" }, { key: "C", label: "担当者" }, { key: "D", label: "不明" },
  ]},
  { qid: "Q24", text: "週次レビュー時間を確保できる？", options: [
    { key: "A", label: "30分以上" }, { key: "B", label: "15分程度" }, { key: "C", label: "ほぼ無理" }, { key: "D", label: "不明" },
  ]},
  { qid: "Q25", text: "予算感（ざっくり）", options: [
    { key: "A", label: "〜30万" }, { key: "B", label: "〜100万" }, { key: "C", label: "〜300万" },
    { key: "D", label: "300万〜" }, { key: "E", label: "未定" },
  ]},
];
