import { api } from '../api.js';
import { router } from '../router.js';
import { t } from '../i18n.js';

const base = window.TTFinder?.base ?? '';

export async function render(app) {
  if (window.TTFinder?.user) {
    router.push(`${base}/dashboard`);
    return;
  }

  app.innerHTML = `
    <main class="min-h-screen flex items-center justify-center px-4 py-12">
      <div class="w-full max-w-md">
        <h1 class="text-3xl font-bold text-white mb-2 text-center">${t('login.title')}</h1>
        <p class="text-gray-400 text-center mb-8">${t('login.subtitle')}</p>

        <form id="login-form" novalidate class="bg-gray-900 rounded-xl p-8 space-y-5 border border-gray-800">

          <div id="form-error" class="hidden bg-red-900/50 border border-red-700 text-red-300 text-sm rounded-lg px-4 py-3"></div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1.5" for="email">${t('login.email')}</label>
            <input id="email" name="email" type="email" autocomplete="email" required
              placeholder="you@example.com"
              class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition" />
          </div>

          <div>
            <div class="flex justify-between items-baseline mb-1.5">
              <label class="block text-sm font-medium text-gray-300" for="password">${t('login.password')}</label>
              <a href="${base}/forgot-password" class="text-xs text-indigo-400 hover:underline" data-link>${t('login.forgot')}</a>
            </div>
            <input id="password" name="password" type="password" autocomplete="current-password" required
              placeholder="••••••••"
              class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition" />
          </div>

          <button type="submit" id="submit-btn"
            class="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition">
            ${t('login.submit')}
          </button>

          <p class="text-center text-sm text-gray-500">
            ${t('login.no_account')}
            <a href="${base}/register" class="text-indigo-400 hover:underline" data-link>${t('nav.signup')}</a>
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

    if (!email)    return showError(t('login.err_email'));
    if (!password) return showError(t('login.err_password'));

    submitBtn.disabled    = true;
    submitBtn.textContent = t('login.submitting');

    try {
      const res = await api.auth.login({ email, password });
      window.TTFinder.user = res.user;
      router.push(`${base}/dashboard`);
    } catch (err) {
      showError(err.message);
      submitBtn.disabled    = false;
      submitBtn.textContent = t('login.submit');
    }
  });

  function showError(msg) {
    errorBox.textContent = msg;
    errorBox.classList.remove('hidden');
  }
}
