import { useEffect, useState } from 'react'
import { fetchHealth } from '../api/health.js'

// 環境確認。API・DB・初期データがそろっていれば「準備OK」
export default function HealthStatus() {
  const [health, setHealth] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchHealth().then(setHealth).catch(setError)
  }, [])

  if (!health && !error) return null

  const checks = [
    { label: 'API 接続', ok: !error, detail: error ? error.message : `Laravel ${health.laravel}` },
    { label: 'DB 接続', ok: !!health?.db?.ok, detail: health?.db?.error ?? '' },
    { label: 'users', ok: health?.db?.users_count > 0, detail: health?.db ? `${health.db.users_count ?? 0}件` : '' },
  ]
  const allOk = checks.every((c) => c.ok)

  return (
    <section className={`health ${allOk ? 'health--ok' : 'health--ng'}`} aria-label="環境チェック">
      <p className="health__result">{allOk ? '準備OK' : 'まだ準備できていません'}</p>
      <ul className="health__list">
        {checks.map((c) => (
          <li key={c.label}>
            <span className={c.ok ? 'ok' : 'ng'}>{c.ok ? 'OK' : 'NG'}</span> {c.label}
            {c.detail && <span className="health__detail">（{c.detail}）</span>}
          </li>
        ))}
      </ul>
    </section>
  )
}
