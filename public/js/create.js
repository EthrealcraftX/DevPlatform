const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('fileList');
const mainFileSelect = document.getElementById('mainFile');
const projectNameInput = document.getElementById('projectName');
const projectTypeSelect = document.getElementById('projectType');
const maxSpaceInput = document.getElementById('maxSpace');
const githubInput = document.getElementById('githubUrl');

const chooseBtn = document.getElementById('chooseBtn');
const uploadBtn = document.getElementById('uploadBtn');
const githubBtn = document.getElementById('installGithubBtn');
const cancelBtn = document.getElementById('cancelBtn');
const nextBtn = document.getElementById('nextBtn');

let uploadedFiles = [];
let uploadedFolderId = null;

// === Render uploaded files to UI
function refreshFileList() {
  fileList.innerHTML = '';
  mainFileSelect.innerHTML = '<option value="">-- Select --</option>';

  uploadedFiles.forEach((file, index) => {
    const item = document.createElement('div');
    item.className = 'file-item';

    const name = document.createElement('span');
    name.textContent = file.webkitRelativePath || file.name;

    const remove = document.createElement('button');
    remove.textContent = 'X';
    remove.onclick = () => {
      uploadedFiles.splice(index, 1);
      refreshFileList();
    };

    item.appendChild(name);
    item.appendChild(remove);
    fileList.appendChild(item);

    // Main fayl select ga qo‘sh
    mainFileSelect.innerHTML += `<option value="${file.webkitRelativePath || file.name}">${file.webkitRelativePath || file.name}</option>`;
  });

  // Aktivlashtirish
  nextBtn.disabled = !(uploadedFiles.length && uploadedFolderId);
}

// === Drag & Drop Events ===
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
    if (!uploadedFiles.find(file => file.webkitRelativePath === f.webkitRelativePath && file.name === f.name)) {
      uploadedFiles.push(f);
    }
  }
  refreshFileList();
});

// === Choose Folder Click
chooseBtn.addEventListener('click', () => {
  fileInput.click();
});

// === File Input Change
fileInput.addEventListener('change', e => {
  for (const f of e.target.files) {
    if (!uploadedFiles.find(file => file.webkitRelativePath === f.webkitRelativePath && file.name === f.name)) {
      uploadedFiles.push(f);
    }
  }
  refreshFileList();
});

// === Upload Files to Server
uploadBtn.addEventListener('click', async () => {
  if (!uploadedFiles.length) return alert('Please select files or folder first.');

  const formData = new FormData();
  uploadedFiles.forEach(file => {
    formData.append('files', file, file.webkitRelativePath || file.name);
  });

  const res = await fetch('/create/upload', {
    method: 'POST',
    body: formData
  });

  const data = await res.json();
  if (data.success) {
    uploadedFolderId = data.id;
    alert('Uploaded successfully!');
    nextBtn.disabled = false;
  } else {
    alert('Upload failed!');
  }
});

// === GitHub Install
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
    uploadedFiles = data.files.map(name => ({ name }));
    refreshFileList();
    alert('GitHub repo installed!');
  } else {
    alert(data.message || 'GitHub install failed.');
  }
});

// === Cancel Upload
cancelBtn.addEventListener('click', async () => {
  if (!uploadedFolderId) return window.location.href = '/home';

  const res = await fetch(`/create/${uploadedFolderId}/cancel`, { method: 'DELETE' });
  if (res.ok) {
    alert('Canceled successfully');
    window.location.href = '/home';
  } else {
    alert('Cancel failed');
  }
});

// === Create Final Project
nextBtn.addEventListener('click', async () => {
  const name = projectNameInput.value.trim();
  const type = projectTypeSelect.value;
  const main = mainFileSelect.value;
  const maxSpace = Number(maxSpaceInput.value);

  if (!name || !type || !main || !uploadedFolderId) {
    return alert('Please fill all fields and upload files.');
  }

  const res = await fetch('/create/finish', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: uploadedFolderId, name, type, main, maxSpace })
  });

  const data = await res.json();
  if (data.success) {
    alert('Project created!');
    window.location.href = '/home';
  } else {
    alert(data.message || 'Creation failed.');
  }
});

// ... boshqa event listenerlar yoki funksiyalar

// === DOM tayyor bo‘lganda elementlarni bloklash ===
window.addEventListener('DOMContentLoaded', () => {
  const uploadBtn = document.getElementById('uploadBtn');
  const chooseBtn = document.getElementById('chooseBtn');
  const dropZone = document.getElementById('dropZone');

  if (uploadBtn) uploadBtn.disabled = true;
  if (chooseBtn) chooseBtn.disabled = true;
  if (dropZone) dropZone.style.pointerEvents = 'none';
});
