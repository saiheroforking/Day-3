const API_URL = "https://jsonplaceholder.typicode.com/users";

const MOCK_USERS = [
  { id: 1, name: "Sai", username: "sai01", email: "sai@gmail.com" },
  { id: 2, name: "Ravi", username: "ravi02", email: "ravi@gmail.com" }
];

let users = [];
let usingMock = false;

// ✅ Custom forEach
function myForEach(arr, fn){
  for(let i = 0; i < arr.length; i++){
    fn(arr[i], i, arr);
  }
}

// ✅ Custom filter
function myFilter(arr, predicate){
  const result = [];
  myForEach(arr, item => {
    if(predicate(item)) result.push(item);
  });
  return result;
}

// ✅ Name formatting
function niceName(name){
  return name.trim().toLowerCase()
             .split(" ")
             .map(w => w[0].toUpperCase() + w.slice(1))
             .join(" ");
}

// ✅ Fetch with timeout
function fetchWithTimeout(url, timeout = 5000){
  return Promise.race([
    fetch(url),
    new Promise((_, reject) =>
      setTimeout(() => reject("Timeout Error"), timeout)
    )
  ]);
}

// ✅ Get users
function getUsers(){
  return fetchWithTimeout(API_URL)
    .then(res => res.json())
    .catch(() => {
      usingMock = true;
      return MOCK_USERS;
    });
}

// ✅ Render users
function renderUsers(list){
  const tbody = document.querySelector("tbody");
  tbody.innerHTML = "";

  myForEach(list, user => {
    tbody.innerHTML += `
      <tr>
        <td>${user.id}</td>
        <td>${niceName(user.name)}</td>
        <td>${user.username}</td>
        <td>${user.email}</td>
      </tr>`;
  });
}

// ✅ Fetch → Filter → Render
function fetchUsers(){
  getUsers()
    .then(data => {
      users = data;
      return myFilter(users, user => user.id % 2 === 1);
    })
    .then(active => renderUsers(active))
    .catch(err => console.log(err));
}

// ✅ Add User
function addUser(user){
  user.id = users.length + 1;
  users.push(user);
  renderUsers(users);
  return Promise.resolve(user);
}

// ✅ Update User
function updateUser(id, data){
  const index = users.findIndex(u => u.id === id);
  users[index] = {...users[index], ...data};
  renderUsers(users);
  return Promise.resolve(users[index]);
}

// ✅ Delete User
function deleteUser(id){
  users = users.filter(u => u.id !== id);
  renderUsers(users);
  return Promise.resolve();
}

// ✅ Start app
fetchUsers();
