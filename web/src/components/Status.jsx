// 読み込み中・エラー・0件の表示。どの画面でも同じ見た目にするための部品

export function Loading() {
  return <p className="status" role="status">読み込み中…</p>
}

export function ErrorMessage({ error, onRetry }) {
  return (
    <div className="status status--error" role="alert">
      <p>{error.message}</p>
      {onRetry && <button type="button" className="btn" onClick={onRetry}>もう一度読み込む</button>}
    </div>
  )
}

export function Empty({ children }) {
  return <p className="status">{children}</p>
}
