const fileInput = document.getElementById('fileInput');
const dropZone = document.getElementById('dropZone');
const fileList = document.getElementById('fileList');
const mainFileSelect = document.getElementById('mainFile');
const projectNameInput = document.getElementById('projectName');
const projectTypeSelect = document.getElementById('projectType');
const uploadBtn = document.getElementById('uploadBtn');
const nextBtn = document.getElementById('nextBtn');
const cancelBtn = document.getElementById('cancelBtn');
const githubBtn = document.getElementById('installGithubBtn');
const githubInput = document.getElementById('githubUrl');

let uploadedFiles = [];
let uploadedFolderId = null;

// === Update file list UI
function refreshFileList() {
  fileList.innerHTML = '';
  mainFileSelect.innerHTML = '<option value="">-- Select Main File --</option>';

  uploadedFiles.forEach((file, index) => {
    const item = document.createElement('div');
    item.className = 'file-item';

    const name = document.createElement('span');
    name.textContent = file.name;

    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'X';
    removeBtn.onclick = () => {
      uploadedFiles.splice(index, 1);
      refreshFileList();
    };

    item.appendChild(name);
    item.appendChild(removeBtn);
    fileList.appendChild(item);

    // Main fayl selectga qo‘sh
    mainFileSelect.innerHTML += `<option value="${file.name}">${file.name}</option>`;
  });
}

// === Fayllarni tanlaganda
fileInput.addEventListener('change', (e) => {
  for (const f of e.target.files) {
    if (!uploadedFiles.find(file => file.name === f.name)) {
      uploadedFiles.push(f);
    }
  }
  refreshFileList();
});

// === Drag & Drop qo‘llab-quvvatlash
dropZone.addEventListener('dragover', e => {
  e.preventDefault();
  dropZone.classList.add('dragover');
});
dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('dragover');
});
dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  for (const f of e.dataTransfer.files) {
    if (!uploadedFiles.find(file => file.name === f.name)) {
      uploadedFiles.push(f);
    }
  }
  refreshFileList();
});

// === Choose btn bosilganda
document.getElementById('chooseBtn').addEventListener('click', () => {
  fileInput.click();
});

// === Upload tugmasi
uploadBtn.addEventListener('click', async () => {
  if (!uploadedFiles.length) return alert('Please select files.');

  const formData = new FormData();
  uploadedFiles.forEach(file => formData.append('files', file));

  const res = await fetch('/create/upload', {
    method: 'POST',
    body: formData
  });

  const data = await res.json();
  if (data.success) {
    uploadedFolderId = data.id;
    alert('Files uploaded successfully!');
  } else {
    alert('Upload failed.');
  }
});

// === GitHubdan install qilish
githubBtn.addEventListener('click', async () => {
  const url = githubInput.value.trim();
  if (!url) return alert('Enter GitHub repo URL');

  const res = await fetch('/create/github', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  });

  const data = await res.json();
  if (data.success) {
    uploadedFolderId = data.id;
    uploadedFiles = data.files.map(f => ({ name: f }));
    refreshFileList();
    alert('GitHub repo installed!');
  } else {
    alert(data.message || 'GitHub install failed.');
  }
});

// === Cancel tugmasi
cancelBtn.addEventListener('click', async () => {
  if (!uploadedFolderId) return window.location.href = '/home';

  const res = await fetch(`/create/${uploadedFolderId}/cancel`, {
    method: 'DELETE'
  });

  if (res.ok) {
    alert('Upload canceled.');
    window.location.href = '/home';
  } else {
    alert('Could not cancel.');
  }
});

// === Next tugmasi
nextBtn.addEventListener('click', async () => {
  const name = projectNameInput.value.trim();
  const type = projectTypeSelect.value;
  const main = mainFileSelect.value;

  if (!name || !type || !main || !uploadedFolderId) {
    return alert('Fill all fields and upload files.');
  }

  const res = await fetch('/create/finish', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: uploadedFolderId,
      name,
      type,
      main
    })
  });

  const data = await res.json();
  if (data.success) {
    alert('Project created!');
    window.location.href = '/home';
  } else {
    alert('Creation failed.');
  }
});
