function myForEach(arr, fn) {
  if (!Array.isArray(arr)) return;
  for (let i = 0; i < arr.length; i++)
    fn(arr[i], i, arr);
}

function myFilter(arr, pred) {
  if (!Array.isArray(arr)) return [];
  const out = [];
  myForEach(arr, v => pred(v) && out.push(v));
  return out;
}

function niceName(raw) {
  if (!raw) return '';
  return String(raw).trim().toLowerCase()
    .split(/\s+/)
    .map(p => p[0].toUpperCase() + p.slice(1))
    .join(' ');
}

const API_ROOT = 'https://jsonplaceholder.typicode.com/users';

let users = [];
let usingMock = false;

const MOCK_USERS = [
  { id: 1, name: 'Leanne Graham', username: 'Bret', email: 'Sincere@april.biz' },
  { id: 2, name: 'Ervin Howell', username: 'Antonette', email: 'Shanna@melissa.tv' },
  { id: 3, name: 'Clementine Bauch', username: 'Samantha', email: 'Nathan@yesenia.net' },
  { id: 4, name: 'Patricia Lebsack', username: 'Karianne', email: 'Julianne.OConner@kory.org' }
];

const usersTableBody = document.querySelector('#usersTable tbody');
const refreshBtn = document.getElementById('refreshBtn');
const toggleAddBtn = document.getElementById('toggleAddBtn');
const useMockBtn = document.getElementById('useMockBtn');
const formContainer = document.getElementById('formContainer');
const userForm = document.getElementById('userForm');
const cancelBtn = document.getElementById('cancelBtn');

const userIdInput = document.getElementById('userId');
const nameInput = document.getElementById('name');
const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const noticeEl = document.getElementById('notice');

function showNotice(msg, isError) {
  if (!noticeEl) return;
  noticeEl.style.display = 'block';
  noticeEl.textContent = msg;
  noticeEl.style.color = isError ? 'red' : 'gray';
}
function hideNotice() {
  if (noticeEl) {
    noticeEl.style.display = 'none';
    noticeEl.textContent = '';
  }
}
function fetchWithTimeout(url, options = {}, timeout = 5000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(timer));
}
function renderUsers(list) {
  if (!usersTableBody) return;
  usersTableBody.innerHTML = '';

  myForEach(list, user => {
    usersTableBody.innerHTML += `
      <tr>
        <td>${user.id}</td>
        <td>${niceName(user.name)}</td>
        <td>${user.username}</td>
        <td>${(user.email || '').toLowerCase()}</td>
        <td>
          <button data-action="edit" data-id="${user.id}">Edit</button>
          <button data-action="delete" data-id="${user.id}">Delete</button>
        </td>
      </tr>
    `;
  });
}
function filterActive(list) {
  return Promise.resolve(myFilter(list, u => Number(u.id) % 2 === 1));
}
function getUsersFromNetwork() {
  return fetchWithTimeout(API_ROOT)
    .then(res => {
      if (!res.ok) throw new Error('Network error');
      return res.json();
    });
}

function fetchUsers() {
  hideNotice();
  usingMock = false;

  return getUsersFromNetwork()
    .then(data => users = data.slice(0, 10))
    .catch(err => {
      console.error(err);
      usingMock = true;
      showNotice('Using mock data (API failed)', true);
      users = MOCK_USERS.slice();
      return users;
    })
    .then(filterActive)
    .then(renderUsers);
}
function postUserToNetwork(payload) {
  return fetchWithTimeout(API_ROOT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).then(r => r.json());
}

function addUser(newUser) {
  if (usingMock) {
    const id = users.length + 1;
    const created = { ...newUser, id };
    users.push(created);
    renderUsers(myFilter(users, u => u.id % 2 === 1));
    return Promise.resolve(created);
  }

  return postUserToNetwork(newUser)
    .then(created => {
      users.push({ ...newUser, id: created.id });
      renderUsers(myFilter(users, u => u.id % 2 === 1));
      return created;
    })
    .catch(() => {
      usingMock = true;
      return addUser(newUser);
    });
}
function updateUser(id, payload) {
  id = Number(id);

  const idx = users.findIndex(u => Number(u.id) === id);
  if (idx === -1) return Promise.resolve(null);

  users[idx] = { ...users[idx], ...payload };
  renderUsers(myFilter(users, u => u.id % 2 === 1));

  return Promise.resolve(users[idx]);
}
function deleteUser(id) {
  id = Number(id);
  users = users.filter(u => Number(u.id) !== id);
  renderUsers(myFilter(users, u => u.id % 2 === 1));
  return Promise.resolve();
}
refreshBtn?.addEventListener('click', fetchUsers);

toggleAddBtn?.addEventListener('click', () => {
  formContainer?.classList.toggle('show');
  userForm?.reset();
});

useMockBtn?.addEventListener('click', () => {
  usingMock = true;
  users = MOCK_USERS.slice();
  renderUsers(myFilter(users, u => u.id % 2 === 1));
  showNotice('Mock data enabled', false);
});

cancelBtn?.addEventListener('click', () => {
  formContainer?.classList.remove('show');
});

usersTableBody?.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;

  const id = Number(btn.dataset.id);

  if (btn.dataset.action === 'edit') {
    const u = users.find(x => x.id === id);
    if (!u) return;

    formContainer.classList.add('show');
    userIdInput.value = u.id;
    nameInput.value = u.name;
    usernameInput.value = u.username;
    emailInput.value = u.email;
  }

  if (btn.dataset.action === 'delete') {
    if (confirm('Delete user?')) deleteUser(id);
  }
});
userForm?.addEventListener('submit', e => {
  e.preventDefault();

  const id = userIdInput.value ? Number(userIdInput.value) : null;

  const userData = {
    name: niceName(nameInput.value),
    username: usernameInput.value.trim(),
    email: emailInput.value.trim().toLowerCase()
  };

  const action = id ? updateUser(id, userData) : addUser(userData);

  action.then(() => formContainer.classList.remove('show'));
});

fetchUsers();

window._demo = { fetchUsers, addUser, updateUser, deleteUser };
