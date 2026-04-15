export async function render(app) {
  app.innerHTML = `
    <main class="max-w-xl mx-auto px-4 py-20 text-center">
      <h1 class="text-6xl font-bold text-gray-700 mb-4">404</h1>
      <p class="text-gray-400 mb-6">Page not found.</p>
      <a href="${window.TTFinder?.base ?? '/'}" class="text-indigo-400 hover:underline">Go home</a>
    </main>
  `;
}
