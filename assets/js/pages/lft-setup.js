import { api } from '../api.js';
import { router } from '../router.js';
import { systemsSelect } from '../components/systems-select.js';

const base = window.TTFinder?.base ?? '';

export async function render(app) {
  const user = window.TTFinder?.user;
  if (!user) { router.push(`${base}/login`); return; }

  // Load existing profile if any
  app.innerHTML = `<div class="flex items-center justify-center min-h-screen"><p class="text-gray-500 text-sm">Loading…</p></div>`;
  const { profile } = await api.lft.get().catch(() => ({ profile: null }));

  app.innerHTML = `
    <main class="max-w-xl mx-auto px-4 py-10">
      <div class="mb-6">
        <a href="${base}/profile" data-link class="text-sm text-gray-400 hover:text-white transition">&larr; Back to profile</a>
        <h1 class="text-2xl font-bold text-white mt-3">${profile ? 'Edit' : 'Set up'} LFT Profile</h1>
        <p class="text-gray-400 text-sm mt-1">Tell GMs what kind of table you're looking for.</p>
      </div>

      <form id="lft-form" novalidate class="space-y-6">

        <div id="form-error" class="hidden bg-red-900/50 border border-red-700 text-red-300 text-sm rounded-lg px-4 py-3"></div>
        <div id="form-success" class="hidden bg-green-900/50 border border-green-700 text-green-300 text-sm rounded-lg px-4 py-3"></div>

        <!-- Systems -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">TTRPG systems you want to play <span class="text-red-400">*</span></label>
          <div id="systems-input"></div>
        </div>

        <!-- Availability -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1.5" for="availability">Availability</label>
          <textarea id="availability" name="availability" rows="2" placeholder="e.g. Weekday evenings, every other Saturday…"
            class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition text-sm resize-none">${escHtml(profile?.availability ?? '')}</textarea>
        </div>

        <!-- Bio -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1.5" for="bio">About you <span class="text-gray-500">(optional)</span></label>
          <textarea id="bio" name="bio" rows="3" placeholder="A little about yourself as a player…"
            class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition text-sm resize-none">${escHtml(profile?.bio ?? '')}</textarea>
        </div>

        <!-- Visibility -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Visibility</label>
          <div class="flex flex-col gap-2">
            <label class="flex items-start gap-3 cursor-pointer">
              <input type="radio" name="visibility" value="public" ${(!profile || profile.visibility === 'public') ? 'checked' : ''}
                class="mt-0.5 accent-indigo-500" />
              <div>
                <p class="text-sm text-gray-200 font-medium">Public</p>
                <p class="text-xs text-gray-500">GMs can find and invite you through the browse page.</p>
              </div>
            </label>
            <label class="flex items-start gap-3 cursor-pointer">
              <input type="radio" name="visibility" value="private" ${profile?.visibility === 'private' ? 'checked' : ''}
                class="mt-0.5 accent-indigo-500" />
              <div>
                <p class="text-sm text-gray-200 font-medium">Private</p>
                <p class="text-xs text-gray-500">Hidden from browse. Share your QR code with a specific GM to connect.</p>
              </div>
            </label>
          </div>
        </div>

        <!-- Active toggle -->
        <div class="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3">
          <div>
            <p class="text-sm font-medium text-gray-200">Profile active</p>
            <p class="text-xs text-gray-500">Deactivate to pause without deleting your profile.</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" id="is_active" ${(!profile || profile.is_active) ? 'checked' : ''} class="sr-only peer" />
            <div class="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:bg-indigo-600 transition after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
          </label>
        </div>

        <button type="submit" id="submit-btn"
          class="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition">
          Save profile
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
    { initial: profile?.systems ?? [] }
  );

  const form      = app.querySelector('#lft-form');
  const errorBox  = app.querySelector('#form-error');
  const successBox= app.querySelector('#form-success');
  const submitBtn = app.querySelector('#submit-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBox.classList.add('hidden');
    successBox.classList.add('hidden');

    const systems    = systemsTags.getValues();
    const availability = form.availability.value.trim();
    const bio          = form.bio.value.trim();
    const visibility   = form.querySelector('[name=visibility]:checked').value;
    const is_active    = form.is_active.checked;

    if (!systems.length) return showError('Please add at least one TTRPG system.');

    submitBtn.disabled    = true;
    submitBtn.textContent = 'Saving…';

    try {
      await api.lft.save({ systems, availability, bio, visibility, is_active });
      successBox.textContent = 'Profile saved!';
      successBox.classList.remove('hidden');
      setTimeout(() => router.push(`${base}/profile`), 1000);
    } catch (err) {
      showError(err.message);
    } finally {
      submitBtn.disabled    = false;
      submitBtn.textContent = 'Save profile';
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
