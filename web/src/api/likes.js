import { apiFetch } from './client.js'

// POST /api/posts/{id}/like → { post_id, likes_count, liked_by_me }
export async function likePost(postId) {
  const json = await apiFetch(`/posts/${postId}/like`, { method: 'POST' })
  return json.data
}

// DELETE /api/posts/{id}/like → { post_id, likes_count, liked_by_me }
export async function unlikePost(postId) {
  const json = await apiFetch(`/posts/${postId}/like`, { method: 'DELETE' })
  return json.data
}
