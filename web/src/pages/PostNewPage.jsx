import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { createPost } from '../api/posts.js'
import BackLink from '../components/BackLink.jsx'
import { useCurrentUser } from '../hooks/useCurrentUser.js'

export default function PostNewPage() {
  const navigate = useNavigate()
  const { currentUser } = useCurrentUser()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [errors, setErrors] = useState({}) // { title: ['…'], body: ['…'] }（API の 422 の形そのまま）
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return // 二重送信を防ぐ
    setSubmitting(true)
    setErrors({})
    setMessage('')
    try {
      await createPost({ title, body })
      navigate('/')
    } catch (err) {
      if (err.status === 422) {
        setErrors(err.errors)
      } else {
        setMessage(err.message)
      }
      setSubmitting(false)
    }
  }

  return (
    <main className="container container--narrow">
      <BackLink />
      <h1>アイデアを投稿</h1>

      {message && <p className="error" role="alert">{message}</p>}

      <form className="card form" onSubmit={handleSubmit} noValidate>
        <div className="form__field">
          <label htmlFor="title">タイトル</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            placeholder="例：サークルの備品貸し出し管理"
            aria-invalid={!!errors.title}
          />
          {errors.title && <p className="field-error">{errors.title[0]}</p>}
        </div>
        <div className="form__field">
          <label htmlFor="body">内容</label>
          <textarea
            id="body"
            rows={6}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="どんな課題を、どう解決したいか"
            aria-invalid={!!errors.body}
          />
          {errors.body && <p className="field-error">{errors.body[0]}</p>}
        </div>
        <p className="meta">投稿者：{currentUser?.name ?? '―'}（操作ユーザー）</p>
        <div className="form__actions">
          <Link to="/" className="btn">キャンセル</Link>
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? '送信中…' : '投稿する'}
          </button>
        </div>
      </form>
    </main>
  )
}
