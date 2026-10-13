import { ApiError, apiFetch } from './client.js'

// GET /api/health … DB が NG のときは 503 が返るので、その中身もそのまま返す
export async function fetchHealth() {
  try {
    return await apiFetch('/health')
  } catch (e) {
    if (e instanceof ApiError && e.data) return e.data
    throw e
  }
}
