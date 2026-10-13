import { useEffect, useRef, useState } from 'react'
import { createComment, deleteComment, fetchComments } from '../api/comments.js'
import { useCurrentUser } from '../hooks/useCurrentUser.js'
import { formatDate } from '../lib/formatDate.js'
import { Empty, ErrorMessage, Loading } from './Status.jsx'

export default function CommentSection({ postId }) {
  const { currentUserId } = useCurrentUser()
  const [comments, setComments] = useState(null) // null = まだ読み込んでいない
  const [loadError, setLoadError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  // フォームの状態
  const [body, setBody] = useState('')
  const [errors, setErrors] = useState({}) // API の 422 の errors（{ body: ['…'] }）
  const [message, setMessage] = useState('')
  const submittingRef = useRef(false) // 送信中か（ref は即座に変わるので、素早い連打でも確実に止められる）
  const [submitting, setSubmitting] = useState(false) // 画面表示用
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    let ignore = false
    fetchComments(postId)
      .then((data) => {
        if (!ignore) setComments(data)
      })
      .catch((err) => {
        if (!ignore) setLoadError(err)
      })
    return () => {
      ignore = true
    }
  }, [postId, reloadKey])

  const retry = () => {
    setLoadError(null)
    setComments(null)
    setReloadKey((k) => k + 1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submittingRef.current) return // 二重送信を防ぐ
    submittingRef.current = true
    setSubmitting(true)
    setErrors({})
    setMessage('')
    try {
      const comment = await createComment(postId, body)
      setComments((list) => [...list, comment])
      setBody('')
    } catch (err) {
      if (err.status === 422) {
        setErrors(err.errors)
      } else {
        setMessage(err.message)
      }
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  const handleDelete = async (comment) => {
    if (deletingId !== null) return
    if (!window.confirm('このコメントを削除しますか？')) return
    setDeletingId(comment.id)
    setMessage('')
    try {
      await deleteComment(comment.id)
      setComments((list) => list.filter((c) => c.id !== comment.id))
    } catch (err) {
      setMessage(err.message)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section className="comments" aria-labelledby="comments-heading">
      <h2 id="comments-heading">
        コメント
        {comments && <span className="count">{comments.length}件</span>}
      </h2>

      {loadError && <ErrorMessage error={loadError} onRetry={retry} />}
      {!loadError && comments === null && <Loading />}
      {!loadError && comments?.length === 0 && <Empty>まだコメントはありません。</Empty>}
      {!loadError &&
        comments?.map((comment) => (
          <div key={comment.id} className="comment">
            <div className="comment__head">
              <span className="meta">{comment.user.name}・{formatDate(comment.created_at)}</span>
              {comment.user.id === currentUserId && (
                <button
                  type="button"
                  className="icon-btn"
                  aria-label="このコメントを削除"
                  onClick={() => handleDelete(comment)}
                  disabled={deletingId === comment.id}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 7h16M10 7V4h4v3M6 7l1 13h10l1-13" /></svg>
                </button>
              )}
            </div>
            <p className="comment__body">{comment.body}</p>
          </div>
        ))}

      {message && <p className="error" role="alert">{message}</p>}

      <form className="card form form--comment" onSubmit={handleSubmit} noValidate>
        <div className="form__field">
          <label htmlFor="comment">コメントする</label>
          <textarea
            id="comment"
            rows={3}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={500}
            placeholder="感想やアイデアを書く"
            aria-invalid={!!errors.body}
          />
          {errors.body && <p className="field-error">{errors.body[0]}</p>}
        </div>
        <div className="form__actions">
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? '送信中…' : '送信'}
          </button>
        </div>
      </form>
    </section>
  )
}
