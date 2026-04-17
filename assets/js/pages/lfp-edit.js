import { api } from '../api.js';
import { router } from '../router.js';
import { systemsSelect } from '../components/systems-select.js';

const base = window.TTFinder?.base ?? '';

const LOCATION_TYPES = ['Game store', 'Private home', 'Library', 'Park / outdoor', 'Online', 'Other'];

export async function render(app) {
  const user = window.TTFinder?.user;
  if (!user) { router.push(`${base}/login`); return; }

  const id = parseInt(new URLSearchParams(window.location.search).get('id'));
  if (!id) { router.push(`${base}/profile`); return; }

  app.innerHTML = `<div class="flex items-center justify-center min-h-screen"><p class="text-gray-500 text-sm">Loading…</p></div>`;

  let listing;
  try {
    const res = await api.lfp.get(id);
    listing = res.listing;
  } catch {
    router.push(`${base}/profile`);
    return;
  }

  app.innerHTML = `
    <main class="max-w-xl mx-auto px-4 py-10">
      <div class="mb-6">
        <a href="${base}/profile" data-link class="text-sm text-gray-400 hover:text-white transition">&larr; Back to profile</a>
        <h1 class="text-2xl font-bold text-white mt-3">Edit LFP Listing</h1>
        <p class="text-gray-400 text-sm mt-1">Update your table listing.</p>
      </div>

      <form id="lfp-form" novalidate class="space-y-6">

        <div id="form-error" class="hidden bg-red-900/50 border border-red-700 text-red-300 text-sm rounded-lg px-4 py-3"></div>
        <div id="form-success" class="hidden bg-green-900/50 border border-green-700 text-green-300 text-sm rounded-lg px-4 py-3"></div>

        <!-- Title -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1.5" for="title">Listing title <span class="text-red-400">*</span></label>
          <input id="title" name="title" type="text" value="${escHtml(listing.title)}"
            class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition" />
        </div>

        <!-- Description -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1.5" for="description">Description <span class="text-gray-500">(optional)</span></label>
          <textarea id="description" name="description" rows="3"
            class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition text-sm resize-none">${escHtml(listing.description ?? '')}</textarea>
        </div>

        <!-- Systems -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">TTRPG system(s) <span class="text-red-400">*</span></label>
          <div id="systems-input"></div>
        </div>

        <!-- Schedule -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Schedule</label>
          <div class="grid grid-cols-1 gap-3">
            <input id="schedule_day" name="schedule_day" type="text" placeholder="Day(s) — e.g. Every Saturday"
              value="${escHtml(listing.schedule_day ?? '')}"
              class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition text-sm" />
            <input id="schedule_frequency" name="schedule_frequency" type="text" placeholder="Frequency — e.g. Bi-weekly"
              value="${escHtml(listing.schedule_frequency ?? '')}"
              class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition text-sm" />
            <input id="schedule_time" name="schedule_time" type="text" placeholder="Time — e.g. 6pm–10pm EST"
              value="${escHtml(listing.schedule_time ?? '')}"
              class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition text-sm" />
          </div>
        </div>

        <!-- Safety tools -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1.5" for="safety_tools">Safety tools <span class="text-gray-500">(optional)</span></label>
          <textarea id="safety_tools" name="safety_tools" rows="2"
            class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition text-sm resize-none">${escHtml(listing.safety_tools ?? '')}</textarea>
        </div>

        <!-- Location -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Location <span class="text-red-400">*</span></label>
          <p class="text-xs text-gray-500 mb-3">Only your town name will be shown publicly.</p>
          <div class="space-y-3">
            <select id="location_type" name="location_type"
              class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition text-sm">
              <option value="">Where do you meet?</option>
              ${LOCATION_TYPES.map(t => `<option value="${t}" ${listing.location_type === t ? 'selected' : ''}>${t}</option>`).join('')}
            </select>
            <div class="grid grid-cols-2 gap-3">
              <input id="location_town" name="location_town" type="text" placeholder="Town / City *"
                value="${escHtml(listing.location_town ?? '')}"
                class="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition text-sm" />
              <input id="location_state" name="location_state" type="text" placeholder="State / Region *"
                value="${escHtml(listing.location_state ?? '')}"
                class="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition text-sm" />
            </div>
          </div>
        </div>

        <!-- Player slots -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1.5" for="player_slots_total">Total player slots <span class="text-gray-500">(optional)</span></label>
          <input id="player_slots_total" name="player_slots_total" type="number" min="1" max="20"
            value="${listing.player_slots_total ?? ''}"
            class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition text-sm" />
        </div>

        <!-- Active toggle -->
        <div class="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3">
          <div>
            <p class="text-sm font-medium text-gray-200">Listing active</p>
            <p class="text-xs text-gray-500">Deactivate to pause without deleting.</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" id="is_active" ${listing.is_active ? 'checked' : ''} class="sr-only peer" />
            <div class="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:bg-indigo-600 transition after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
          </label>
        </div>

        <button type="submit" id="submit-btn"
          class="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition">
          Save changes
        </button>

      </form>
    </main>
  `;

  app.querySelector('[data-link]').addEventListener('click', (e) => {
    e.preventDefault();
    router.push(e.target.closest('[data-link]').getAttribute('href'));
  });

  const systemsTags = systemsSelect(
    app.querySelector('#systems-input'),
    { initial: listing.systems ?? [] }
  );

  const form       = app.querySelector('#lfp-form');
  const errorBox   = app.querySelector('#form-error');
  const successBox = app.querySelector('#form-success');
  const submitBtn  = app.querySelector('#submit-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBox.classList.add('hidden');
    successBox.classList.add('hidden');

    const title              = form.title.value.trim();
    const description        = form.description.value.trim();
    const systems            = systemsTags.getValues();
    const schedule_day       = form.schedule_day.value.trim();
    const schedule_frequency = form.schedule_frequency.value.trim();
    const schedule_time      = form.schedule_time.value.trim();
    const safety_tools       = form.safety_tools.value.trim();
    const location_type      = form.location_type.value;
    const location_town      = form.location_town.value.trim();
    const location_state     = form.location_state.value.trim();
    const player_slots_total = form.player_slots_total.value ? parseInt(form.player_slots_total.value) : null;
    const is_active          = form.is_active.checked;

    if (!title)          return showError('A title is required.');
    if (!systems.length) return showError('Please add at least one TTRPG system.');
    if (!location_town)  return showError('Please enter a town or city.');
    if (!location_state) return showError('Please enter a state or region.');

    submitBtn.disabled    = true;
    submitBtn.textContent = 'Saving…';

    try {
      await api.lfp.update({
        id, title, description, systems, schedule_day, schedule_frequency, schedule_time,
        safety_tools, location_type, location_town, location_state, player_slots_total, is_active,
      });
      successBox.textContent = 'Listing saved!';
      successBox.classList.remove('hidden');
      setTimeout(() => router.push(`${base}/profile`), 1000);
    } catch (err) {
      showError(err.message);
      submitBtn.disabled    = false;
      submitBtn.textContent = 'Save changes';
    }
  });

  function showError(msg) {
    errorBox.textContent = msg;
    errorBox.classList.remove('hidden');
  }
}

function escHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
