import { Link } from 'react-router'
import { formatDate } from '../lib/formatDate.js'
import LikeButton from './LikeButton.jsx'

export default function PostCard({ post, onChange }) {
  return (
    <article className="card">
      <Link to={`/posts/${post.id}`} className="card__title">{post.title}</Link>
      <p className="card__body card__body--clamp">{post.body}</p>
      <div className="card__footer">
        <span className="meta">{post.user.name}・{formatDate(post.created_at)}</span>
        <div className="card__actions">
          <LikeButton post={post} onChange={onChange} />
          <Link to={`/posts/${post.id}`} className="comment-count" aria-label={`コメント${post.comments_count}件`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z" /></svg>
            {post.comments_count}
          </Link>
        </div>
      </div>
    </article>
  )
}
