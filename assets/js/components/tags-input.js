// TTFinder — Reusable tags input component
// Usage: const tags = tagsInput(container, { placeholder, initial })
// tags.getValues() returns current array of tag strings

export function tagsInput(container, { placeholder = 'Add and press Enter', initial = [] } = {}) {
  let tags = [...initial];

  function render() {
    container.innerHTML = `
      <div class="flex flex-wrap gap-2 mb-2" id="tags-list">
        ${tags.map((t, i) => `
          <span class="flex items-center gap-1 bg-indigo-900/60 border border-indigo-700 text-indigo-200 text-sm px-2.5 py-1 rounded-full">
            ${escHtml(t)}
            <button type="button" data-index="${i}" class="text-indigo-400 hover:text-red-400 transition ml-1 leading-none">&times;</button>
          </span>
        `).join('')}
      </div>
      <div class="flex gap-2">
        <input id="tags-input-field" type="text" placeholder="${escHtml(placeholder)}"
          class="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition text-sm" />
        <button type="button" id="tags-add-btn"
          class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition text-sm">Add</button>
      </div>
    `;

    container.querySelector('#tags-list').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-index]');
      if (btn) {
        tags.splice(parseInt(btn.dataset.index), 1);
        render();
      }
    });

    const input = container.querySelector('#tags-input-field');
    const addBtn = container.querySelector('#tags-add-btn');

    function addTag() {
      const val = input.value.trim();
      if (val && !tags.includes(val)) {
        tags.push(val);
        render();
      } else {
        input.value = '';
      }
    }

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); addTag(); }
    });
    addBtn.addEventListener('click', addTag);
  }

  render();

  return {
    getValues: () => [...tags],
    setValues: (v) => { tags = [...v]; render(); },
  };
}

function escHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
