# User Dashboard — API Integration

A small, single-page dashboard that demonstrates basic API integration (GET/POST/PUT/DELETE), custom higher-order functions, promise chaining, and minimal UI for managing a list of users.

---

## Project structure

```
project-root/
├─ index.html                # Single-page UI
├─ Styles/
│  └─ main.css               # Styling
└─ Scripts/
   └─ app.js                 # Main application logic
```

> Note: `index.html` references `./Styles/main.css` and `./Scripts/app.js`. Keep these paths when serving locally.

---
## 🚀 Live Demo
🔗 *GitHub Pages Link:*  
https://saiheroforking.github.io/Day-3/

---

## 📸 Project Preview

![Project Screenshot](./Screenshot%2025-12-01%235538.png)


---

## Features

* Fetch users from a public API (`https://jsonplaceholder.typicode.com/users`).
* Fallback to local mock data when network fetch fails or when the **Use Mock Data** button is clicked.
* Add, edit and delete users (POST / PUT / DELETE). When network is unavailable the operations are simulated against the local mock.
* Uses small custom Higher-Order Functions (HOFs): `myForEach` and `myFilter`.
* Small form that appears inline for Add / Edit operations.
* Simple visual notifications for fallbacks and errors.

---

## How to run

1. Clone or copy the files to a folder with this structure.
2. Open `index.html` in a modern browser (Chrome, Firefox, Edge) — no build step required.

**If you prefer a basic local server** (recommended for some browser environments):

```bash
# using Python 3
python -m http.server 8000
# then open http://localhost:8000
```

---

## Important files and responsibilities

* **`index.html`** — markup for the dashboard, the small form and the table.
* **`Styles/main.css`** — simple, modern styling using CSS variables.
* **`Scripts/app.js`** — app logic. Key functions and variables:

  * `API_ROOT` — API base URL (`https://jsonplaceholder.typicode.com/users`).
  * `MOCK_USERS` — array of 10 mock users used when network fails.
  * `fetchWithTimeout(url, opts, timeout)` — wrapper around `fetch()` with an AbortController-based timeout (default 5000ms).
  * `fetchUsers()` — main function to fetch users, fallback to mock on failure, then filter & render.
  * `addUser(newUser)` — POSTs a user (or simulates when using mock data).
  * `updateUser(id, payload)` — PUTs an update (or simulates when using mock data).
  * `deleteUser(id)` — DELETEs a user (or simulates when using mock data).
  * `renderUsers(list)` — updates the DOM table with user rows.
  * `window._demo` — exposes `{ fetchUsers, addUser, updateUser, deleteUser, myForEach, myFilter, MOCK_USERS }` for quick dev testing in the console.

---

## HOFs (Custom Higher-Order Functions)

`app.js` includes two tiny HOF implementations to demonstrate function composition and callback usage:

* `myForEach(arr, fn)` — safe `forEach` replacement (checks for arrays) and calls `fn(value, index, arr)`.
* `myFilter(arr, pred)` — safe `filter` replacement that uses `myForEach` and returns a new array of items passing `pred`.

These are intentionally minimal for teaching/demonstration purposes.

---

## Promise chaining & flow (brief)

`fetchUsers()` demonstrates a promise chain:

1. Call `getUsersFromNetwork()` (which uses `fetchWithTimeout`).
2. If the network call succeeds, keep the first 10 users; otherwise catch the error and fall back to `MOCK_USERS`.
3. Pass the user list to `filterActive()` (returns a Promise) which filters to only odd `id`s.
4. Render the filtered list with `renderUsers()`.

This pattern shows `then`/`catch` handling and clean fallbacks when network operations fail.

---

## Updating / Deleting / Adding users (UI flow)

* Click **Add User** → small form slides down. Submit to save (calls `addUser`).
* Click **Edit** on a row → populates the small form with that user and allows editing (calls `updateUser`).
* Click **Delete** → confirmation prompt, then calls `deleteUser`.
* **Use Mock Data** button forces local mock usage (useful for offline testing).

When working in mock mode, changes are kept only in memory (no persistence).

---

## Sample console output

The script logs helpful messages to the browser console. Example lines you may see:

```
GET request to https://jsonplaceholder.typicode.com/users → 200 OK
Fetched users → Filtered active → Rendered to DOM [Promise Chain]
POST request to add new user → { id: 11, name: 'Alice ...' }
PUT request to update user ID 3 → Success
DELETE request to remove user ID 5 → Success
Network fetch failed — falling back to local mock data. (Reason: timeout)
```

---

## Known limitations

* The project talks to `jsonplaceholder.typicode.com` (a public test API). Some environments may block network requests or CORS; there is a fallback to mock data but network-backed POST/PUT/DELETE are not persisted (jsonplaceholder simulates responses).
* Timeout for `fetchWithTimeout` defaults to **5000 ms**; adjust in `app.js` if necessary.
* Minimal validation on form inputs — only basic `required` attributes are set. No email format validation beyond the browser's default.
* No automated tests included.

---

## Security & privacy notes

* This is a demo application. Do NOT use it as-is for production.
* Do not trust or store sensitive data here. Mock data is shipped in the source for convenience only.

---

## Future enhancements (ideas)

* Add client-side validation (email format, duplicate usernames).
* Add a search/filter bar and pagination.
* Add unit tests for HOFs and API wrappers.
* Improve accessibility (keyboard focus, ARIA attributes and better color contrast).
* Show success/error toasts instead of single `notice` element.
* Persist mock changes to `localStorage` for a better demo experience.

---

## License

MIT — feel free to reuse and adapt for learning purposes.

---

If you'd like, I can also:

* generate a short `CHANGELOG.md` describing the current snapshot,
* produce a compact `CONTRIBUTING.md` with development rules,
* or create a version of the README that includes screenshots and copy-ready badges.
