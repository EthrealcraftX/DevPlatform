document.addEventListener('DOMContentLoaded', () => {
  const output = document.getElementById('consoleOutput');
  const projectId = window.location.pathname.split('/')[2]; // /project/:id
  const socket = io(`/project-console/${projectId}`);

  // === Konsoldan kelayotgan xabarlarni ko‘rsatish
  socket.on('console', (msg) => {
    output.textContent += msg;
    output.scrollTop = output.scrollHeight;
  });

  // === Konsol forma yuborish
  const form = document.getElementById('consoleForm');
  const input = document.getElementById('consoleCommand');

  if (form && input) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const cmd = input.value.trim();
      if (cmd) {
        socket.emit('consoleInput', cmd);
        input.value = '';
      }
    });
  }
});
