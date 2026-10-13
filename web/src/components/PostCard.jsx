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
        </div>
      </div>
    </article>
  )
}
