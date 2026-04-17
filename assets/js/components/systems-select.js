// TTFinder — TTRPG systems selector
// Searchable dropdown with "Other" free-text fallback.
// Multiple systems can be selected; shown as removable tags.
//
// Usage:
//   const sel = systemsSelect(container, { initial: ['D&D 5e'] });
//   sel.getValues(); // returns string[]

import { TTRPG_SYSTEMS } from '../data/systems.js';
import { t } from '../i18n.js';

export function systemsSelect(container, { initial = [] } = {}) {
  let selected = [...initial];
  let query    = '';
  let open     = false;
  let otherMode = false;

  function filtered() {
    const q = query.toLowerCase();
    return TTRPG_SYSTEMS.filter(s => !selected.includes(s) && s.toLowerCase().includes(q));
  }

  function render() {
    const list = filtered();

    container.innerHTML = `
      <!-- Selected tags -->
      <div class="flex flex-wrap gap-2 mb-2" id="sel-tags">
        ${selected.map((s, i) => `
          <span class="flex items-center gap-1 bg-indigo-900/60 border border-indigo-700 text-indigo-200 text-sm px-2.5 py-1 rounded-full">
            ${escHtml(s)}
            <button type="button" data-remove="${i}" class="text-indigo-400 hover:text-red-400 transition ml-1 leading-none" aria-label="Remove">&times;</button>
          </span>
        `).join('')}
      </div>

      <!-- Search input -->
      <div class="relative">
        <input id="sys-search" type="text" autocomplete="off"
          placeholder="${t('sys.search_ph')}"
          value="${escHtml(query)}"
          class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition text-sm" />

        <!-- Dropdown list -->
        ${open && list.length ? `
          <ul id="sys-dropdown"
            class="absolute z-20 left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-52 overflow-y-auto">
            ${list.map(s => `
              <li data-system="${escHtml(s)}"
                class="px-4 py-2.5 text-sm text-gray-200 hover:bg-indigo-600 hover:text-white cursor-pointer transition ${s === 'Other' ? 'border-t border-gray-700 text-gray-400' : ''}">
                ${escHtml(s)}
              </li>
            `).join('')}
          </ul>
        ` : ''}
      </div>

      <!-- "Other" free-text input -->
      ${otherMode ? `
        <div class="flex gap-2 mt-2">
          <input id="other-input" type="text" placeholder="${t('sys.other_ph')}"
            class="flex-1 bg-gray-800 border border-indigo-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-400 transition text-sm" />
          <button type="button" id="other-add"
            class="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition text-sm">${t('sys.other_add')}</button>
          <button type="button" id="other-cancel"
            class="text-gray-400 hover:text-white px-3 py-2 transition text-sm">${t('sys.other_cancel')}</button>
        </div>
      ` : ''}
    `;

    bindEvents();
  }

  function bindEvents() {
    // Remove tag
    container.querySelector('#sel-tags')?.addEventListener('click', e => {
      const btn = e.target.closest('[data-remove]');
      if (btn) {
        selected.splice(parseInt(btn.dataset.remove), 1);
        render();
      }
    });

    // Search input
    const searchInput = container.querySelector('#sys-search');
    searchInput?.addEventListener('focus', () => { open = true; render(); });
    searchInput?.addEventListener('input', e => { query = e.target.value; open = true; render(); });
    searchInput?.addEventListener('keydown', e => {
      if (e.key === 'Escape') { open = false; query = ''; render(); }
    });

    // Dropdown item click
    container.querySelector('#sys-dropdown')?.addEventListener('click', e => {
      const li = e.target.closest('[data-system]');
      if (!li) return;
      const system = li.dataset.system;
      if (system === 'Other') {
        otherMode = true;
        open = false;
        query = '';
        render();
        container.querySelector('#other-input')?.focus();
      } else {
        selected.push(system);
        query = '';
        open  = false;
        render();
      }
    });

    // Other: add button
    container.querySelector('#other-add')?.addEventListener('click', () => {
      const val = container.querySelector('#other-input')?.value.trim();
      if (val && !selected.includes(val)) selected.push(val);
      otherMode = false;
      render();
    });

    // Other: enter key
    container.querySelector('#other-input')?.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        container.querySelector('#other-add')?.click();
      }
      if (e.key === 'Escape') {
        otherMode = false;
        render();
      }
    });

    // Other: cancel
    container.querySelector('#other-cancel')?.addEventListener('click', () => {
      otherMode = false;
      render();
    });
  }

  // Close dropdown when clicking outside
  document.addEventListener('click', e => {
    if (!container.contains(e.target) && open) {
      open  = false;
      query = '';
      render();
    }
  });

  render();

  return {
    getValues: () => [...selected],
    setValues: (v) => { selected = [...v]; render(); },
  };
}

function escHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
