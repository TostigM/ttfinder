import { api } from '../api.js';
import { router } from '../router.js';

const base = window.TTFinder?.base ?? '';

export async function render(app) {
  // Already logged in — go to dashboard
  if (window.TTFinder?.user) {
    router.push(`${base}/dashboard`);
    return;
  }

  app.innerHTML = `
    <main class="min-h-screen flex items-center justify-center px-4 py-12">
      <div class="w-full max-w-md">
        <h1 class="text-3xl font-bold text-white mb-2 text-center">Welcome back</h1>
        <p class="text-gray-400 text-center mb-8">Log in to TTFinder.</p>

        <form id="login-form" novalidate class="bg-gray-900 rounded-xl p-8 space-y-5 border border-gray-800">

          <div id="form-error" class="hidden bg-red-900/50 border border-red-700 text-red-300 text-sm rounded-lg px-4 py-3"></div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1.5" for="email">Email</label>
            <input id="email" name="email" type="email" autocomplete="email" required
              placeholder="you@example.com"
              class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition" />
          </div>

          <div>
            <div class="flex justify-between items-baseline mb-1.5">
              <label class="block text-sm font-medium text-gray-300" for="password">Password</label>
              <a href="${base}/forgot-password" class="text-xs text-indigo-400 hover:underline" data-link>Forgot password?</a>
            </div>
            <input id="password" name="password" type="password" autocomplete="current-password" required
              placeholder="Your password"
              class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition" />
          </div>

          <button type="submit" id="submit-btn"
            class="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition">
            Log in
          </button>

          <p class="text-center text-sm text-gray-500">
            Don't have an account?
            <a href="${base}/register" class="text-indigo-400 hover:underline" data-link>Sign up</a>
          </p>

        </form>
      </div>
    </main>
  `;

  app.querySelectorAll('[data-link]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      router.push(e.target.getAttribute('href'));
    });
  });

  const form      = app.querySelector('#login-form');
  const errorBox  = app.querySelector('#form-error');
  const submitBtn = app.querySelector('#submit-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBox.classList.add('hidden');

    const email    = form.email.value.trim();
    const password = form.password.value;

    if (!email)    return showError('Email is required.');
    if (!password) return showError('Password is required.');

    submitBtn.disabled    = true;
    submitBtn.textContent = 'Logging in…';

    try {
      const res = await api.auth.login({ email, password });
      window.TTFinder.user = res.user;
      router.push(`${base}/dashboard`);
    } catch (err) {
      showError(err.message);
      submitBtn.disabled    = false;
      submitBtn.textContent = 'Log in';
    }
  });

  function showError(msg) {
    errorBox.textContent = msg;
    errorBox.classList.remove('hidden');
  }
}
