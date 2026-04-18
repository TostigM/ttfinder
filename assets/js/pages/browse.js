import { api } from '../api.js';
import { router } from '../router.js';
import { t, SUPPORTED_LANGS, langLabel } from '../i18n.js';

const base = window.TTFinder?.base ?? '';

const DISTANCE_OPTIONS = [5, 10, 15, 25, 50, 100];

export async function render(app) {
  const user = window.TTFinder?.user;

  const distOptions = DISTANCE_OPTIONS.map(d =>
    `<option value="${d}" ${d === 25 ? 'selected' : ''}>${t(`dist.${d}`)}</option>`
  ).join('');

  const langOptions = SUPPORTED_LANGS.map(l =>
    `<option value="${l}">${langLabel(l)}</option>`
  ).join('');

  app.innerHTML = `
    <main class="max-w-2xl mx-auto px-4 py-10">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-white">${t('browse.title')}</h1>
        <p class="text-gray-400 text-sm mt-1">${t('browse.subtitle')}</p>
      </div>

      <!-- Filters -->
      <form id="browse-form" novalidate class="bg-gray-800/60 border border-gray-700 rounded-xl p-5 mb-8 space-y-4">

        <!-- Location -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1.5" for="location">${t('browse.your_location')}</label>
          <input id="location" name="location" type="text" placeholder="${t('browse.location_ph')}"
            class="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition text-sm" />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">

          <!-- Distance -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1.5" for="distance">${t('browse.distance')}</label>
            <select id="distance" name="distance"
              class="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition text-sm">
              ${distOptions}
            </select>
          </div>

          <!-- Language -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1.5" for="language">${t('browse.language')}</label>
            <select id="language" name="language"
              class="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition text-sm">
              <option value="">${t('browse.any_language')}</option>
              ${langOptions}
            </select>
          </div>

          <!-- System -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1.5" for="system">${t('browse.system')}</label>
            <input id="system" name="system" type="text" placeholder="${t('browse.any_system')}"
              class="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition text-sm" />
          </div>

        </div>

        <button type="submit" id="search-btn"
          class="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-lg transition text-sm">
          ${t('browse.search')}
        </button>

      </form>

      <!-- Results -->
      <div id="results"></div>

    </main>
  `;

  const form      = app.querySelector('#browse-form');
  const searchBtn = app.querySelector('#search-btn');
  const results   = app.querySelector('#results');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await doSearch();
  });

  // Auto-search on load if user is logged in (uses their stored location)
  if (user) {
    await doSearch();
  }

  async function doSearch() {
    const location = form.location.value.trim();
    const distance = parseInt(form.distance.value, 10);
    const language = form.language.value;
    const system   = form.system.value.trim();

    searchBtn.disabled    = true;
    searchBtn.textContent = t('browse.searching');
    results.innerHTML = `<p class="text-gray-500 text-sm text-center py-8">${t('browse.loading')}</p>`;

    try {
      const params = { distance };
      if (location) params.location = location;
      if (language) params.language = language;
      if (system)   params.system   = system;

      const data = await api.lfp.browse(params);
      renderResults(data.listings ?? []);
    } catch (err) {
      results.innerHTML = `<p class="text-red-400 text-sm text-center py-8">${escHtml(err.message)}</p>`;
    } finally {
      searchBtn.disabled    = false;
      searchBtn.textContent = t('browse.search');
    }
  }

  function renderResults(listings) {
    if (!listings.length) {
      results.innerHTML = `<p class="text-gray-500 text-sm text-center py-8">${t('browse.no_results')}</p>`;
      return;
    }

    results.innerHTML = listings.map(l => {
      const gmName = l.display_preference === 'first_name'
        ? escHtml(l.display_name)
        : escHtml(l.display_name.split(' ').map(p => p[0]).join('.') + '.');

      const locationLine = [l.location_town, l.location_state, l.location_country]
        .filter(Boolean).map(escHtml).join(', ');

      const slotsHtml = l.player_slots_total != null
        ? (l.player_slots_total > 0
            ? `<span class="text-xs bg-emerald-900/50 text-emerald-300 border border-emerald-700/50 rounded-full px-2 py-0.5">${t('browse.slots_open', { n: l.player_slots_total })}</span>`
            : `<span class="text-xs bg-red-900/50 text-red-300 border border-red-700/50 rounded-full px-2 py-0.5">${t('browse.full')}</span>`)
        : '';

      const onlineBadge = l.location_type === 'Online'
        ? `<span class="text-xs bg-blue-900/50 text-blue-300 border border-blue-700/50 rounded-full px-2 py-0.5">${t('browse.online')}</span>`
        : '';

      const systemTags = (l.systems ?? []).map(s =>
        `<span class="text-xs bg-gray-700 text-gray-300 rounded-full px-2 py-0.5">${escHtml(s)}</span>`
      ).join(' ');

      const scheduleHtml = [l.schedule_day, l.schedule_frequency, l.schedule_time]
        .filter(Boolean).join(' · ');

      const connectBtn = user
        ? `<button data-id="${l.id}" class="connect-btn text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-3 py-1.5 rounded-lg transition">${t('browse.connect')}</button>`
        : `<a href="${base}/login" data-link class="text-xs text-indigo-400 hover:text-indigo-300 transition">${t('browse.login_to_connect')}</a>`;

      return `
        <article class="bg-gray-800/60 border border-gray-700 rounded-xl p-5 mb-4">
          <div class="flex items-start justify-between gap-3 mb-3">
            <div class="flex-1 min-w-0">
              <h2 class="text-base font-semibold text-white leading-snug">${escHtml(l.title)}</h2>
              ${locationLine ? `<p class="text-xs text-gray-500 mt-0.5">${locationLine}</p>` : ''}
            </div>
            <div class="flex-shrink-0 flex flex-col items-end gap-1.5">
              ${slotsHtml}
              ${onlineBadge}
            </div>
          </div>

          ${systemTags ? `<div class="flex flex-wrap gap-1.5 mb-3">${systemTags}</div>` : ''}

          ${l.description ? `<p class="text-sm text-gray-400 mb-3 line-clamp-3">${escHtml(l.description)}</p>` : ''}

          <div class="text-xs text-gray-500 space-y-1 mb-4">
            <p><span class="text-gray-400">${t('browse.gm')}</span> ${gmName}</p>
            ${scheduleHtml ? `<p><span class="text-gray-400">${t('browse.schedule')}</span> ${escHtml(scheduleHtml)}</p>` : ''}
            ${l.safety_tools ? `<p><span class="text-gray-400">${t('browse.safety')}</span> ${escHtml(l.safety_tools)}</p>` : ''}
          </div>

          <div class="flex items-center justify-between">
            <span class="text-xs text-indigo-400 font-medium">${t('browse.within_area')}</span>
            ${connectBtn}
          </div>
        </article>
      `;
    }).join('');

    // Wire up data-link anchors and connect buttons
    results.querySelectorAll('[data-link]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        router.push(el.getAttribute('href'));
      });
    });

    results.querySelectorAll('.connect-btn').forEach(btn => {
      btn.addEventListener('click', () => handleConnect(parseInt(btn.dataset.id), btn));
    });
  }

  async function handleConnect(listingId, btn) {
    btn.disabled = true;
    try {
      await api.connections.request(listingId);
      btn.textContent = '✓';
      btn.classList.replace('bg-indigo-600', 'bg-gray-600');
      btn.classList.replace('hover:bg-indigo-500', 'hover:bg-gray-600');
    } catch (err) {
      btn.disabled = false;
      // Show inline error near the button
      const errSpan = document.createElement('span');
      errSpan.className = 'text-xs text-red-400 ml-2';
      errSpan.textContent = err.message;
      btn.after(errSpan);
      setTimeout(() => errSpan.remove(), 3000);
    }
  }
}

function escHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
