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
        <h1 class="text-3xl font-bold text-white mb-2 text-center">${t('register.title')}</h1>
        <p class="text-gray-400 text-center mb-8">${t('register.subtitle')}</p>

        <form id="register-form" novalidate class="bg-gray-900 rounded-xl p-8 space-y-5 border border-gray-800">

          <div id="form-error" class="hidden bg-red-900/50 border border-red-700 text-red-300 text-sm rounded-lg px-4 py-3"></div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1.5" for="display_name">${t('register.display_name')}</label>
            <input id="display_name" name="display_name" type="text" autocomplete="nickname" required
              placeholder="${t('register.display_name_ph')}"
              class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1.5">${t('register.show_as')}</label>
            <div class="flex gap-4">
              <label class="flex items-center gap-2 cursor-pointer text-sm text-gray-300">
                <input type="radio" name="display_preference" value="first_name" checked
                  class="accent-indigo-500" />
                ${t('register.first_name')}
              </label>
              <label class="flex items-center gap-2 cursor-pointer text-sm text-gray-300">
                <input type="radio" name="display_preference" value="initials"
                  class="accent-indigo-500" />
                ${t('register.initials')}
              </label>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1.5" for="email">${t('register.email')}</label>
            <input id="email" name="email" type="email" autocomplete="email" required
              placeholder="you@example.com"
              class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1.5" for="password">${t('register.password')}</label>
            <input id="password" name="password" type="password" autocomplete="new-password" required
              placeholder="${t('register.password_ph')}"
              class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1.5" for="confirm_password">${t('register.confirm_password')}</label>
            <input id="confirm_password" name="confirm_password" type="password" autocomplete="new-password" required
              placeholder="${t('register.confirm_ph')}"
              class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition" />
          </div>

          <button type="submit" id="submit-btn"
            class="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition">
            ${t('register.submit')}
          </button>

          <p class="text-center text-sm text-gray-500">
            ${t('register.have_account')}
            <a href="${base}/login" class="text-indigo-400 hover:underline" data-link>${t('nav.login')}</a>
          </p>

        </form>
      </div>
    </main>
  `;

  app.querySelector('[data-link]').addEventListener('click', (e) => {
    e.preventDefault();
    router.push(e.target.getAttribute('href'));
  });

  const form      = app.querySelector('#register-form');
  const errorBox  = app.querySelector('#form-error');
  const submitBtn = app.querySelector('#submit-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBox.classList.add('hidden');

    const display_name       = form.display_name.value.trim();
    const display_preference = form.querySelector('[name=display_preference]:checked').value;
    const email              = form.email.value.trim();
    const password           = form.password.value;
    const confirm_password   = form.confirm_password.value;

    if (!display_name)                     return showError(t('register.err_name'));
    if (!email)                            return showError(t('register.err_email'));
    if (password.length < 8)              return showError(t('register.err_password_length'));
    if (password !== confirm_password)    return showError(t('register.err_password_match'));

    submitBtn.disabled    = true;
    submitBtn.textContent = t('register.submitting');

    try {
      const res = await api.auth.register({ display_name, display_preference, email, password, confirm_password });
      window.TTFinder.user = res.user;
      router.push(`${base}/dashboard`);
    } catch (err) {
      showError(err.message);
      submitBtn.disabled    = false;
      submitBtn.textContent = t('register.submit');
    }
  });

  function showError(msg) {
    errorBox.textContent = msg;
    errorBox.classList.remove('hidden');
  }
}
