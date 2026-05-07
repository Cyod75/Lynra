const BASE = '/lynra-api/v1';

function getToken() {
  return localStorage.getItem('lv_token');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// ── Auth ────────────────────────────────────────────────
export function loginUser(body) {
  return request('/auth/login', { method: 'POST', body: JSON.stringify(body) });
}
export function registerUser(body) {
  return request('/auth/register', { method: 'POST', body: JSON.stringify(body) });
}
export function getMe() {
  return request('/auth/me');
}

// ── Bookmarks ───────────────────────────────────────────
export function getBookmarks(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return request(`/bookmarks${qs ? '?' + qs : ''}`);
}
export function getBookmark(id) { return request(`/bookmarks/${id}`); }
export function createBookmark(body) {
  return request('/bookmarks', { method: 'POST', body: JSON.stringify(body) });
}
export function updateBookmark(id, body) {
  return request(`/bookmarks/${id}`, { method: 'PUT', body: JSON.stringify(body) });
}
export function deleteBookmark(id) {
  return request(`/bookmarks/${id}`, { method: 'DELETE' });
}
export function visitBookmark(id) {
  return request(`/bookmarks/${id}/visit`, { method: 'POST' });
}
export function scrapeUrl(url) {
  return request('/bookmarks/scrape', { method: 'POST', body: JSON.stringify({ url }) });
}

// ── Collections ─────────────────────────────────────────
export function getCollections() { return request('/collections'); }
export function createCollection(body) {
  return request('/collections', { method: 'POST', body: JSON.stringify(body) });
}
export function updateCollection(id, body) {
  return request(`/collections/${id}`, { method: 'PUT', body: JSON.stringify(body) });
}
export function deleteCollection(id) {
  return request(`/collections/${id}`, { method: 'DELETE' });
}

// ── Tags ────────────────────────────────────────────────
export function getTags() { return request('/tags'); }
export function deleteTag(id) { return request(`/tags/${id}`, { method: 'DELETE' }); }

// ── Stats ───────────────────────────────────────────────
export function getStats() { return request('/stats'); }

// ── Import / Export ─────────────────────────────────────
export async function importHtml(file) {
  const token = getToken();
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${BASE}/import/html`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Import failed');
  return data;
}
export function exportJson() {
  const token = getToken();
  const url = `${BASE}/import/export${token ? '?token=' + token : ''}`;
  window.open(url, '_blank');
}
