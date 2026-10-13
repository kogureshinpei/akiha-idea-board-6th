import { apiFetch } from './client.js'

// POST /api/posts/{postId}/likes  { user_id }
export async function likePost(postId, userId) {
  const json = await apiFetch(`/posts/${postId}/likes`, { method: 'POST', body: { user_id: userId } })
  return json.data
}

// DELETE /api/likes/{likeId}
export async function unlikePost(likeId) {
  await apiFetch(`/likes/${likeId}`, { method: 'DELETE' })
}
