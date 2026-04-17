import { api } from '../api.js';
import { router } from '../router.js';
import { t } from '../i18n.js';

const base = window.TTFinder?.base ?? '';

export async function render(app) {
  const user = window.TTFinder?.user;
  if (!user) { router.push(`${base}/login`); return; }

  app.innerHTML = `<div class="flex items-center justify-center min-h-screen"><p class="text-gray-500 text-sm">${t('common.loading')}</p></div>`;

  const [lftRes, lfpRes] = await Promise.all([
    api.lft.get().catch(() => ({ profile: null })),
    api.lfp.list().catch(() => ({ listings: [] })),
  ]);

  const lft      = lftRes.profile;
  const listings = lfpRes.listings ?? [];

  app.innerHTML = `
    <main class="max-w-3xl mx-auto px-4 py-10 space-y-8">

      <div>
        <h1 class="text-2xl font-bold text-white">${t('profile.title')}</h1>
        <p class="text-gray-400 text-sm mt-1">${escHtml(user.email)}</p>
      </div>

      <!-- LFT Section -->
      <section class="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-lg font-semibold text-indigo-400">${t('profile.lft_title')}</h2>
            <p class="text-gray-400 text-sm">${t('profile.lft_desc')}</p>
          </div>
          <a href="${base}/lft-setup" data-link
            class="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition">
            ${lft ? t('profile.lft_edit') : t('profile.lft_setup')}
          </a>
        </div>
        ${lft ? lftSummary(lft) : `<p class="text-gray-500 text-sm">${t('profile.lft_empty')}</p>`}
      </section>

      <!-- LFP Section -->
      <section class="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-lg font-semibold text-emerald-400">${t('profile.lfp_title')}</h2>
            <p class="text-gray-400 text-sm">${t('profile.lfp_desc')}</p>
          </div>
          <a href="${base}/lfp-create" data-link
            class="text-sm bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg transition">
            ${t('profile.lfp_new')}
          </a>
        </div>
        ${listings.length ? lfpList(listings) : `<p class="text-gray-500 text-sm">${t('profile.lfp_empty')}</p>`}
      </section>

    </main>
  `;

  app.querySelectorAll('[data-link]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      router.push(e.target.closest('[data-link]').getAttribute('href'));
    });
  });

  app.querySelectorAll('[data-delete-id]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id    = parseInt(btn.dataset.deleteId);
      const title = btn.dataset.deleteTitle;
      if (!confirm(t('profile.delete_confirm', { title }))) return;

      btn.disabled    = true;
      btn.textContent = t('profile.deleting');

      try {
        await api.lfp.delete(id);
        render(app);
      } catch (err) {
        alert(err.message || t('profile.delete_error'));
        btn.disabled    = false;
        btn.textContent = t('profile.delete');
      }
    });
  });
}

function lftSummary(lft) {
  const systems = lft.systems?.join(', ') || '—';
  const badge = lft.visibility === 'private'
    ? `<span class="text-xs bg-yellow-900/50 border border-yellow-700 text-yellow-300 px-2 py-0.5 rounded-full">${t('profile.private')}</span>`
    : `<span class="text-xs bg-green-900/50 border border-green-700 text-green-300 px-2 py-0.5 rounded-full">${t('profile.public')}</span>`;
  const active = lft.is_active
    ? `<span class="text-xs bg-indigo-900/50 border border-indigo-700 text-indigo-300 px-2 py-0.5 rounded-full">${t('profile.active')}</span>`
    : `<span class="text-xs bg-gray-700 text-gray-400 px-2 py-0.5 rounded-full">${t('profile.inactive')}</span>`;
  return `
    <div class="space-y-2 text-sm text-gray-300">
      <div class="flex gap-2">${badge}${active}</div>
      <p><span class="text-gray-500">${t('profile.systems')}</span> ${escHtml(systems)}</p>
      ${lft.availability ? `<p><span class="text-gray-500">${t('profile.availability')}</span> ${escHtml(lft.availability)}</p>` : ''}
    </div>
  `;
}

function lfpList(listings) {
  return listings.map(l => `
    <div class="border-t border-gray-800 pt-4 mt-4 first:border-0 first:pt-0 first:mt-0 flex items-start justify-between gap-4">
      <div class="space-y-1 text-sm">
        <p class="font-medium text-white">${escHtml(l.title)}</p>
        <p class="text-gray-400">${escHtml(l.systems?.join(', ') || '—')} · ${escHtml(l.location_town)}, ${escHtml(l.location_state)}</p>
        <span class="${l.is_active ? 'text-green-400' : 'text-gray-500'} text-xs">${l.is_active ? t('profile.active') : t('profile.inactive')}</span>
      </div>
      <div class="flex gap-2 shrink-0">
        <a href="${base}/lfp-edit?id=${l.id}" data-link
          class="text-xs bg-gray-700 hover:bg-gray-600 text-gray-200 px-3 py-1.5 rounded-lg transition">
          ${t('profile.edit')}
        </a>
        <button data-delete-id="${l.id}" data-delete-title="${escHtml(l.title)}"
          class="text-xs bg-red-900/50 hover:bg-red-800 border border-red-700 text-red-300 px-3 py-1.5 rounded-lg transition">
          ${t('profile.delete')}
        </button>
      </div>
    </div>
  `).join('');
}

function escHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
