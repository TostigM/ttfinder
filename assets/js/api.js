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

  lft: {
    get:  ()     => request('GET',  '/api/lft/get.php'),
    save: (data) => request('POST', '/api/lft/save.php', data),
  },

  lfp: {
    list:   ()       => request('GET',  '/api/lfp/list.php'),
    get:    (id)     => request('GET',  `/api/lfp/get.php?id=${id}`),
    create: (data)   => request('POST', '/api/lfp/create.php', data),
    update: (data)   => request('POST', '/api/lfp/update.php', data),
    delete: (id)     => request('POST', '/api/lfp/delete.php', { id }),
    browse: (params) => {
      const qs = new URLSearchParams(
        Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null))
      ).toString();
      return request('GET', `/api/lfp/browse.php${qs ? '?' + qs : ''}`);
    },
  },

  connections: {
    request: (listingId) => request('POST', '/api/connections/request.php', { listing_id: listingId }),
  },
};
