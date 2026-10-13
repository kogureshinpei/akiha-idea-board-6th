import { apiFetch } from './client.js'

// GET /api/users
export async function fetchUsers() {
  const json = await apiFetch('/users')
  return json.data
}
