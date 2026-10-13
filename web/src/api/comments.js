import { apiFetch } from './client.js'

// GET /api/posts/{postId}/comments
export async function fetchComments(postId) {
  const json = await apiFetch(`/posts/${postId}/comments`)
  return json.data
}

// POST /api/posts/{postId}/comments  { body }
export async function createComment(postId, body) {
  const json = await apiFetch(`/posts/${postId}/comments`, { method: 'POST', body: { body } })
  return json.data
}

// DELETE /api/comments/{id}
export async function deleteComment(id) {
  await apiFetch(`/comments/${id}`, { method: 'DELETE' })
}
