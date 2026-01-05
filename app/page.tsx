import StepperForm from "@/components/StepperForm";

export default function Page() {
  return (
    <div className="card">
      <div className="row" style={{alignItems:"baseline", justifyContent:"space-between"}}>
        <div>
          <h1 className="h1">DX 案件化診断（MVP）</h1>
          <div className="muted">
            25問 → タイプ推定 / 難易度 / 炎上リスク → 1枚サマリー・SOW・募集票（Markdown）を生成
          </div>
        </div>
        <div className="pill">ロジック: ルールベース（調整前提）</div>
      </div>

      <hr />
      <StepperForm />
      <hr />
      <div className="muted small">
        ※このMVPは「診断結果を案件化に落とす」ことを目的に、成熟度評価よりも見積/要件に効く質問を優先しています。
      </div>
    </div>
  );
}
