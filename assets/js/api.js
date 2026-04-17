// TTFinder — API fetch helper
// All calls go through here so base path and error handling are consistent.

const base = window.TTFinder?.base ?? '';

async function request(method, path, body = null) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
  };
  if (body !== null) opts.body = JSON.stringify(body);

  const res = await fetch(`${base}${path}`, opts);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  get:    (path)        => request('GET',    path),
  post:   (path, body)  => request('POST',   path, body),
  put:    (path, body)  => request('PUT',    path, body),
  delete: (path)        => request('DELETE', path),

  auth: {
    register: (data) => request('POST', '/api/auth/register.php', data),
    login:    (data) => request('POST', '/api/auth/login.php',    data),
    logout:   ()     => request('POST', '/api/auth/logout.php'),
    me:       ()     => request('GET',  '/api/auth/me.php'),
  },
};
