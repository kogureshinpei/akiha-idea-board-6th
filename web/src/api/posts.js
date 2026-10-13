import { apiFetch } from './client.js'
import { getStoredUserId } from '../lib/userStorage.js'

// GET /api/posts
export async function fetchPosts() {
  const json = await apiFetch(`/posts?user_id=${getStoredUserId() ?? ''}`)
  return json.data
}

// GET /api/posts/{id}
export async function fetchPost(id) {
  const json = await apiFetch(`/posts/${id}?user_id=${getStoredUserId() ?? ''}`)
  return json.data
}

// POST /api/posts  { title, body }
export async function createPost({ title, body }) {
  const json = await apiFetch('/posts', { method: 'POST', body: { title, body } })
  return json.data
}
