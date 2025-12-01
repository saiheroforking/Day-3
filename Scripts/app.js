function myForEach(arr, fn){
      if(!Array.isArray(arr)) return;
      for(let i=0;i<arr.length;i++) fn(arr[i], i, arr);
    }

    function myFilter(arr, pred){
      if(!Array.isArray(arr)) return [];
      const out = [];
      myForEach(arr, (v,i,a) => { if(pred(v,i,a)) out.push(v); });
      return out;
    }

    function niceName(raw){
      if(raw === null || raw === undefined) return '';
      const s = String(raw).trim();
      if(s === '') return '';
      return s.toLowerCase().split(/\s+/).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
    }

    const API_ROOT = 'https://jsonplaceholder.typicode.com/users';
    let users = [];
    let usingMock = false;

    const MOCK_USERS = [
      { id: 1, name: 'Leanne Graham', username: 'Bret', email: 'Sincere@april.biz' },
      { id: 2, name: 'Ervin Howell', username: 'Antonette', email: 'Shanna@melissa.tv' },
      { id: 3, name: 'Clementine Bauch', username: 'Samantha', email: 'Nathan@yesenia.net' },
      { id: 4, name: 'Patricia Lebsack', username: 'Karianne', email: 'Julianne.OConner@kory.org' },
      { id: 5, name: 'Chelsey Dietrich', username: 'Kamren', email: 'Lucio_Hettinger@annie.ca' },
      { id: 6, name: 'Mrs. Dennis Schulist', username: 'Leopoldo_Corkery', email: 'Karley_Dach@jasper.info' },
      { id: 7, name: 'Kurtis Weissnat', username: 'Elwyn.Skiles', email: 'Telly.Hoeger@billy.biz' },
      { id: 8, name: 'Nicholas Runolfsdottir V', username: 'Maxime_Nienow', email: 'Sherwood@rosamond.me' },
      { id: 9, name: 'Glenna Reichert', username: 'Delphine', email: 'Chaim_McDermott@dana.io' },
      { id: 10, name: 'Clementina DuBuque', username: 'Moriah.Stanton', email: 'Rey.Padberg@karina.biz' }
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

    function showNotice(msg, isError){
      if(!noticeEl) return;
      noticeEl.style.display = 'block';
      noticeEl.textContent = msg;
      noticeEl.style.color = isError ? '#ffb4b4' : 'var(--muted)';
    }
    function hideNotice(){ if(noticeEl){ noticeEl.style.display='none'; noticeEl.textContent=''; } }

    function fetchWithTimeout(url, opts, timeout){
      opts = opts || {};
      timeout = typeof timeout === 'number' ? timeout : 5000;
      if(typeof fetch === 'undefined') return Promise.reject(new Error('fetch not available'));
      if(typeof AbortController !== 'undefined'){
        const controller = new AbortController();
        const signal = controller.signal;
        const timer = setTimeout(() => controller.abort(), timeout);
        return fetch(url, Object.assign({}, opts, { signal })).finally(() => clearTimeout(timer));
      }
      const p = fetch(url, opts);
      const t = new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), timeout));
      return Promise.race([p, t]);
    }

    function renderUsers(list){
      if(!usersTableBody) return;
      usersTableBody.innerHTML = '';
      myForEach(list, user => {
        const tr = document.createElement('tr');
        const idTd = document.createElement('td'); idTd.textContent = user.id;
        const nameTd = document.createElement('td'); nameTd.textContent = niceName(user.name);
        const usernameTd = document.createElement('td'); usernameTd.textContent = user.username || '';
        const emailTd = document.createElement('td'); emailTd.textContent = (user.email || '').toLowerCase();
        const actionsTd = document.createElement('td'); actionsTd.className = 'actions';
        const editBtn = document.createElement('button'); editBtn.textContent = 'Edit'; editBtn.dataset.action = 'edit'; editBtn.dataset.id = String(user.id);
        const delBtn = document.createElement('button'); delBtn.textContent = 'Delete'; delBtn.className = 'ghost'; delBtn.dataset.action = 'delete'; delBtn.dataset.id = String(user.id);
        actionsTd.appendChild(editBtn); actionsTd.appendChild(delBtn);
        tr.appendChild(idTd); tr.appendChild(nameTd); tr.appendChild(usernameTd); tr.appendChild(emailTd); tr.appendChild(actionsTd);
        usersTableBody.appendChild(tr);
      });
      try{ console.log('[Array.map] Displayed all usernames', Array.isArray(list) ? list.map(u => u.username) : []); }catch(e){ console.log('[Array.map] map failed', e); }
      if(Array.isArray(list) && list.length) console.log('[Object.keys] Extracted all user fields', Object.keys(list[0]));
    }

    function filterActive(list){
      return new Promise((resolve) => {
        const active = myFilter(list, u => Number(u.id) % 2 === 1);
        resolve(active);
      });
    }

    function getUsersFromNetwork(){
      return fetchWithTimeout(API_ROOT, {}, 5000).then(res => {
        console.log('GET request to ' + API_ROOT + ' → ' + (res && res.status ? res.status + ' ' + (res.statusText || '') : 'no-status'));
        if(!res || !res.ok) throw new Error('Network response not OK');
        return res.json();
      });
    }

    function fetchUsers(){
      hideNotice();
      usingMock = false;
      return getUsersFromNetwork()
        .then(data => {
          users = Array.isArray(data) ? data.slice(0,10) : MOCK_USERS.slice();
          return users;
        })
        .catch(err => {
          console.error('Fetch users failed', err);
          showNotice('Network fetch failed — falling back to local mock data. (Reason: ' + (err && err.message ? err.message : 'unknown') + ')', true);
          usingMock = true;
          users = MOCK_USERS.slice();
          return users;
        })
        .then(usersList => filterActive(usersList))
        .then(active => {
          renderUsers(active);
          console.log('Fetched users → Filtered active → Rendered to DOM [Promise Chain]');
        });
    }

    function postUserToNetwork(payload){
      return fetchWithTimeout(API_ROOT, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) }, 5000)
        .then(res => {
          if(!res || !res.ok) throw new Error('POST failed');
          return res.json();
        });
    }

    function addUser(newUser){
      if(usingMock){
        const nextId = users.length ? Math.max(...users.map(u => Number(u.id))) + 1 : 1;
        const created = Object.assign({}, newUser, { id: nextId });
        users.push(created);
        console.log('POST request to add new user → ' + JSON.stringify(created));
        const active = myFilter(users, u => Number(u.id) % 2 === 1);
        renderUsers(active);
        return Promise.resolve(created);
      }
      return postUserToNetwork(newUser).then(created => {
        console.log('POST request to add new user → ' + JSON.stringify(created));
        const actual = Object.assign({}, newUser, { id: created && created.id ? created.id : (users.length ? Math.max(...users.map(u=>Number(u.id)))+1 : 1) });
        users.push(actual);
        const active = myFilter(users, u => Number(u.id) % 2 === 1);
        renderUsers(active);
        return actual;
      }).catch(err => {
        console.error('POST failed, switching to mock', err);
        usingMock = true;
        return addUser(newUser);
      });
    }

    function putUserToNetwork(id, payload){
      return fetchWithTimeout(API_ROOT + '/' + id, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) }, 5000)
        .then(res => {
          if(!res || !res.ok) throw new Error('PUT failed');
          return res.json();
        });
    }

    function updateUser(id, payload){
      const numericId = Number(id);
      if(usingMock){
        const idx = users.findIndex(u => Number(u.id) === numericId);
        if(idx > -1) users[idx] = Object.assign({}, users[idx], payload);
        console.log('PUT request to update user ID ' + numericId + ' → Success');
        const active = myFilter(users, u => Number(u.id) % 2 === 1);
        renderUsers(active);
        return Promise.resolve(users[idx] || null);
      }
      return putUserToNetwork(numericId, payload).then(resp => {
        const idx = users.findIndex(u => Number(u.id) === numericId);
        if(idx > -1) users[idx] = Object.assign({}, users[idx], payload);
        console.log('PUT request to update user ID ' + numericId + ' → Success');
        const active = myFilter(users, u => Number(u.id) % 2 === 1);
        renderUsers(active);
        return resp;
      }).catch(err => {
        console.error('PUT failed, switching to mock', err);
        usingMock = true;
        return updateUser(numericId, payload);
      });
    }

    function deleteUserFromNetwork(id){
      return fetchWithTimeout(API_ROOT + '/' + id, { method: 'DELETE' }, 5000).then(res => {
        if(!res) throw new Error('DELETE no response');
        if(!res.ok && res.status !== 200 && res.status !== 204) throw new Error('DELETE failed');
        return res;
      });
    }

    function deleteUser(id){
      const numericId = Number(id);
      if(usingMock){
        users = users.filter(u => Number(u.id) !== numericId);
        console.log('DELETE request to remove user ID ' + numericId + ' → Success');
        const active = myFilter(users, u => Number(u.id) % 2 === 1);
        renderUsers(active);
        return Promise.resolve();
      }
      return deleteUserFromNetwork(numericId).then(res => {
        users = users.filter(u => Number(u.id) !== numericId);
        console.log('DELETE request to remove user ID ' + numericId + ' → Success');
        const active = myFilter(users, u => Number(u.id) % 2 === 1);
        renderUsers(active);
      }).catch(err => {
        console.error('DELETE failed, switching to mock', err);
        usingMock = true;
        return deleteUser(numericId);
      });
    }

    if(refreshBtn) refreshBtn.addEventListener('click', () => fetchUsers());
    if(toggleAddBtn) toggleAddBtn.addEventListener('click', () => {
      if(formContainer && formContainer.classList.contains('show')) { formContainer.classList.remove('show'); formContainer.setAttribute('aria-hidden','true'); }
      else { formContainer.classList.add('show'); formContainer.setAttribute('aria-hidden','false'); userIdInput.value=''; nameInput.value=''; usernameInput.value=''; emailInput.value=''; }
    });
    if(useMockBtn) useMockBtn.addEventListener('click', () => {
      usingMock = true; showNotice('Using mock data', false); users = MOCK_USERS.slice(); const active = myFilter(users, u => Number(u.id) % 2 === 1); renderUsers(active);
    });
    if(cancelBtn) cancelBtn.addEventListener('click', () => { if(formContainer){ formContainer.classList.remove('show'); formContainer.setAttribute('aria-hidden','true'); } });

    if(usersTableBody) usersTableBody.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if(!btn) return;
      const action = btn.dataset.action;
      const id = btn.dataset.id;
      const numericId = Number(id);
      if(action === 'edit'){ const u = users.find(x => Number(x.id) === numericId); if(u){ formContainer.classList.add('show'); formContainer.setAttribute('aria-hidden','false'); userIdInput.value = String(u.id); nameInput.value = u.name || ''; usernameInput.value = u.username || ''; emailInput.value = u.email || ''; } }
      else if(action === 'delete'){ if(confirm('Delete user ID ' + numericId + '?')) deleteUser(numericId).catch(err => console.error('Delete failed', err)); }
    });

    if(userForm) userForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = userIdInput && userIdInput.value ? userIdInput.value : '';
      const numericId = id !== '' ? Number(id) : null;
      const name = niceName(nameInput && nameInput.value ? nameInput.value : '');
      const username = usernameInput && usernameInput.value ? usernameInput.value.trim() : '';
      const email = emailInput && emailInput.value ? emailInput.value.trim().toLowerCase() : '';
      if(numericId){ updateUser(numericId, { name, username, email }).then(() => { if(formContainer){ formContainer.classList.remove('show'); formContainer.setAttribute('aria-hidden','true'); } }).catch(err => console.error('Update failed', err)); }
      else { addUser({ name, username, email }).then(() => { if(formContainer){ formContainer.classList.remove('show'); formContainer.setAttribute('aria-hidden','true'); } }).catch(err => console.error('Add user failed', err)); }
    });

    fetchUsers();
    window._demo = { fetchUsers, addUser, updateUser, deleteUser, myForEach, myFilter, MOCK_USERS };
