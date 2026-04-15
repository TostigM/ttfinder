// TTFinder — Client-side router

const base = window.TTFinder?.base ?? '';

const routes = {
  [`${base}/`]:            () => import('./pages/home.js'),
  [`${base}/login`]:       () => import('./pages/login.js'),
  [`${base}/register`]:    () => import('./pages/register.js'),
  [`${base}/dashboard`]:   () => import('./pages/dashboard.js'),
  [`${base}/browse`]:      () => import('./pages/browse.js'),
  [`${base}/listing`]:     () => import('./pages/listing.js'),
  [`${base}/profile`]:     () => import('./pages/profile.js'),
  [`${base}/messages`]:    () => import('./pages/messages.js'),
};

export const router = {
  async navigate(path) {
    // Strip trailing slash except for root
    const clean = path.length > 1 ? path.replace(/\/$/, '') : path;
    const load  = routes[clean] ?? (() => import('./pages/not-found.js'));

    const app = document.getElementById('app');
    app.innerHTML = '<div class="flex items-center justify-center min-h-screen"><p class="text-gray-500 text-sm">Loading…</p></div>';

    try {
      const mod = await load();
      await mod.render(app);
    } catch (err) {
      console.error('Router error:', err);
      app.innerHTML = '<div class="flex items-center justify-center min-h-screen"><p class="text-red-400">Something went wrong. Please refresh.</p></div>';
    }
  },

  push(path) {
    window.history.pushState({}, '', path);
    this.navigate(path);
  },
};
