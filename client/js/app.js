// ---------- Елементи сторінки ----------
const listEl = document.getElementById('equipmentList');
const messageEl = document.getElementById('message');
const categoryFilter = document.getElementById('categoryFilter');
const statusFilter = document.getElementById('statusFilter');
const authBar = document.getElementById('authBar');
const tabs = document.getElementById('tabs');
const rentalsTab = document.getElementById('rentalsTab');
const catalogView = document.getElementById('catalogView');
const rentalsView = document.getElementById('rentalsView');
const rentalsList = document.getElementById('rentalsList');
const rentalsMessage = document.getElementById('rentalsMessage');
const rentalFilterBar = document.getElementById('rentalFilterBar');
const rentalStatusFilter = document.getElementById('rentalStatusFilter');

const statusLabels = { available: 'Вільна', rented: 'Видана', maintenance: 'У ремонті' };
const categoryLabels = { laptop: 'Ноутбук', camera: 'Камера', sensor: 'Датчик', other: 'Інше' };
const categoryIcons = { laptop: '💻', camera: '📷', sensor: '📡', other: '📦' };
const rentalStatusLabels = {
  pending: 'Очікує',
  approved: 'Підтверджено',
  rejected: 'Відхилено',
  cancelled: 'Скасовано',
  returned: 'Повернено',
};

// ---------- Стан входу ----------
let currentUser = null;
try {
  currentUser = JSON.parse(localStorage.getItem('user'));
} catch (e) {
  currentUser = null;
}

function isAdmin() {
  return currentUser && currentUser.role === 'admin';
}

function saveSession(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  currentUser = user;
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  currentUser = null;
  renderAuthBar();
  showView('catalog');
}

// ---------- Обгортка над fetch ----------
// Додає токен, розбирає JSON, перетворює помилки сервера на Error
async function api(path, { method = 'GET', body } = {}) {
  const headers = {};
  const token = localStorage.getItem('token');
  if (token) headers.Authorization = 'Bearer ' + token;
  if (body) headers['Content-Type'] = 'application/json';

  const response = await fetch('/api' + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401 && token && !path.startsWith('/auth')) {
      logout(); // токен прострочений
    }
    throw new Error((data && data.error) || 'Помилка ' + response.status);
  }
  return data;
}

// Допоміжне: 2026-10-20 -> 20.10.2026
function formatDate(iso) {
  return iso ? iso.split('-').reverse().join('.') : '';
}

// ---------- Перемикання вкладок ----------
function showView(view) {
  catalogView.hidden = view !== 'catalog';
  rentalsView.hidden = view !== 'rentals';
  document.querySelectorAll('.tab').forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.view === view);
  });
  if (view === 'catalog') loadEquipment();
  else loadRentals();
}

document.querySelectorAll('.tab').forEach((tab) => {
  tab.addEventListener('click', () => showView(tab.dataset.view));
});

// ---------- Панель входу ----------
function renderAuthBar() {
  authBar.replaceChildren();
  tabs.hidden = !currentUser;
  rentalFilterBar.hidden = !isAdmin();
  rentalsTab.textContent = isAdmin() ? 'Усі заявки' : 'Мої заявки';

  if (currentUser) {
    const hello = document.createElement('span');
    hello.textContent = currentUser.name + ' (' + currentUser.role + ')';
    const btn = document.createElement('button');
    btn.textContent = 'Вийти';
    btn.className = 'secondary';
    btn.addEventListener('click', logout);
    authBar.append(hello, btn);
  } else {
    const btn = document.createElement('button');
    btn.textContent = 'Увійти';
    btn.addEventListener('click', () => openAuthDialog('login'));
    authBar.append(btn);
  }
}

// ---------- Діалог входу / реєстрації ----------
const authDialog = document.getElementById('authDialog');
const authForm = document.getElementById('authForm');
const authTitle = document.getElementById('authTitle');
const authSubmit = document.getElementById('authSubmit');
const authToggle = document.getElementById('authToggle');
const authError = document.getElementById('authError');
const nameLabel = document.getElementById('nameLabel');
const nameInput = document.getElementById('nameInput');
const emailInput = document.getElementById('emailInput');
const passwordInput = document.getElementById('passwordInput');
let authMode = 'login';

function openAuthDialog(mode) {
  authMode = mode;
  const isRegister = mode === 'register';
  authTitle.textContent = isRegister ? 'Реєстрація' : 'Вхід';
  authSubmit.textContent = isRegister ? 'Зареєструватися' : 'Увійти';
  authToggle.textContent = isRegister ? 'Вже є акаунт? Увійти' : 'Немає акаунта? Зареєструватися';
  nameLabel.hidden = !isRegister;
  nameInput.required = isRegister;
  authError.textContent = '';
  authDialog.showModal();
}

authToggle.addEventListener('click', (e) => {
  e.preventDefault();
  openAuthDialog(authMode === 'login' ? 'register' : 'login');
});
document.getElementById('authCancel').addEventListener('click', () => authDialog.close());

authForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  authError.textContent = '';
  authSubmit.disabled = true;

  try {
    if (authMode === 'register') {
      await api('/auth/register', {
        method: 'POST',
        body: { name: nameInput.value.trim(), email: emailInput.value.trim(), password: passwordInput.value },
      });
    }
    // Після реєстрації одразу входимо
    const data = await api('/auth/login', {
      method: 'POST',
      body: { email: emailInput.value.trim(), password: passwordInput.value },
    });
    saveSession(data.token, data.user);
    authDialog.close();
    authForm.reset();
    renderAuthBar();
    showView('catalog');
  } catch (err) {
    authError.textContent = err.message;
  } finally {
    authSubmit.disabled = false;
  }
});

// ---------- Діалог нової заявки ----------
const rentalDialog = document.getElementById('rentalDialog');
const rentalForm = document.getElementById('rentalForm');
const rentalError = document.getElementById('rentalError');
const dueDateInput = document.getElementById('dueDateInput');
const notesInput = document.getElementById('notesInput');
let rentalEquipmentId = null;

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function openRentalDialog(item) {
  rentalEquipmentId = item.id;
  document.getElementById('rentalEquipmentName').textContent = item.name;
  dueDateInput.min = todayIso();
  rentalError.textContent = '';
  rentalDialog.showModal();
}

document.getElementById('rentalCancel').addEventListener('click', () => rentalDialog.close());

rentalForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  rentalError.textContent = '';

  try {
    await api('/rentals', {
      method: 'POST',
      body: { equipmentId: rentalEquipmentId, dueDate: dueDateInput.value, notes: notesInput.value.trim() },
    });
    rentalDialog.close();
    rentalForm.reset();
    await loadEquipment();
    messageEl.textContent = 'Заявку подано. Статус дивись у розділі «Мої заявки».';
  } catch (err) {
    rentalError.textContent = err.message;
  }
});

// ---------- Діалог редагування заявки ----------
const editDialog = document.getElementById('editDialog');
const editForm = document.getElementById('editForm');
const editDueDate = document.getElementById('editDueDate');
const editNotes = document.getElementById('editNotes');
const editError = document.getElementById('editError');
let editRentalId = null;

function openEditDialog(rental) {
  editRentalId = rental.id;
  editDueDate.value = rental.dueDate;
  editDueDate.min = todayIso();
  editNotes.value = rental.notes || '';
  editError.textContent = '';
  editDialog.showModal();
}

document.getElementById('editCancel').addEventListener('click', () => editDialog.close());

editForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  editError.textContent = '';
  try {
    await api('/rentals/' + editRentalId, {
      method: 'PUT',
      body: { dueDate: editDueDate.value, notes: editNotes.value.trim() },
    });
    editDialog.close();
    loadRentals();
  } catch (err) {
    editError.textContent = err.message;
  }
});

// ---------- Діалог відхилення (адмін) ----------
const rejectDialog = document.getElementById('rejectDialog');
const rejectForm = document.getElementById('rejectForm');
const rejectReason = document.getElementById('rejectReason');
const rejectError = document.getElementById('rejectError');
let rejectRentalId = null;

function openRejectDialog(rental) {
  rejectRentalId = rental.id;
  rejectReason.value = '';
  rejectError.textContent = '';
  rejectDialog.showModal();
}

document.getElementById('rejectCancel').addEventListener('click', () => rejectDialog.close());

rejectForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  rejectError.textContent = '';
  try {
    await api('/rentals/' + rejectRentalId + '/reject', {
      method: 'PATCH',
      body: { reason: rejectReason.value.trim() },
    });
    rejectDialog.close();
    loadRentals();
  } catch (err) {
    rejectError.textContent = err.message;
  }
});

// ---------- Каталог ----------
function renderCard(item) {
  const card = document.createElement('article');
  card.className = 'card';

  const icon = document.createElement('div');
  icon.className = 'card-icon';
  icon.textContent = categoryIcons[item.category] || '📦';

  const title = document.createElement('h3');
  title.textContent = item.name;

  const category = document.createElement('p');
  category.className = 'category';
  category.textContent = categoryLabels[item.category] || item.category;

  const badge = document.createElement('span');
  badge.className = 'badge ' + item.status;
  badge.textContent = statusLabels[item.status] || item.status;

  const inv = document.createElement('p');
  inv.className = 'inv';
  inv.textContent = 'Інв. номер: ' + item.inventoryNumber;

  card.append(icon, title, category, badge, inv);

  if (currentUser && currentUser.role === 'student' && item.status === 'available') {
    const btn = document.createElement('button');
    btn.textContent = 'Подати заявку';
    btn.addEventListener('click', () => openRentalDialog(item));
    card.append(btn);
  }
  return card;
}

async function loadEquipment() {
  messageEl.textContent = 'Завантаження...';
  listEl.replaceChildren();

  const params = new URLSearchParams();
  if (categoryFilter.value) params.set('category', categoryFilter.value);
  if (statusFilter.value) params.set('status', statusFilter.value);

  try {
    const items = await api('/equipment?' + params.toString());

    if (items.length === 0) {
      messageEl.textContent = 'За цими фільтрами нічого не знайдено.';
      return;
    }
    messageEl.textContent = '';
    items.forEach((item) => listEl.append(renderCard(item)));
  } catch (err) {
    messageEl.textContent = 'Помилка завантаження: ' + err.message;
  }
}

categoryFilter.addEventListener('change', loadEquipment);
statusFilter.addEventListener('change', loadEquipment);

// ---------- Заявки ----------
function makeButton(text, className, handler) {
  const btn = document.createElement('button');
  btn.textContent = text;
  if (className) btn.className = className;
  btn.addEventListener('click', handler);
  return btn;
}

// Виконує дію над заявкою і оновлює список
async function rentalAction(path, options) {
  rentalsMessage.textContent = '';
  try {
    await api(path, options);
    loadRentals();
  } catch (err) {
    rentalsMessage.textContent = err.message;
  }
}

function renderRental(rental) {
  const row = document.createElement('article');
  row.className = 'rental-row';

  const info = document.createElement('div');
  info.className = 'rental-info';

  const title = document.createElement('h3');
  title.textContent = rental.equipmentName;

  const badge = document.createElement('span');
  badge.className = 'badge ' + rental.status;
  badge.textContent = rentalStatusLabels[rental.status] || rental.status;

  info.append(title, badge);

  if (isAdmin()) {
    const who = document.createElement('p');
    who.textContent = 'Студент: ' + rental.userName;
    info.append(who);
  }

  const dates = document.createElement('p');
  dates.textContent = 'Подано: ' + formatDate(rental.requestedAt) + ' · Повернути до: ' + formatDate(rental.dueDate);
  if (rental.returnedAt) dates.textContent += ' · Повернено: ' + formatDate(rental.returnedAt);
  info.append(dates);

  if (rental.notes) {
    const notes = document.createElement('p');
    notes.textContent = 'Примітка: ' + rental.notes;
    info.append(notes);
  }
  if (rental.status === 'rejected' && rental.rejectionReason) {
    const reason = document.createElement('p');
    reason.className = 'reason';
    reason.textContent = 'Причина відхилення: ' + rental.rejectionReason;
    info.append(reason);
  }

  // Кнопки залежать від ролі та статусу
  const actions = document.createElement('div');
  actions.className = 'rental-actions';

  if (!isAdmin() && rental.status === 'pending') {
    actions.append(
      makeButton('Змінити', 'secondary', () => openEditDialog(rental)),
      makeButton('Скасувати', 'danger', () => {
        if (confirm('Скасувати цю заявку?')) {
          rentalAction('/rentals/' + rental.id, { method: 'DELETE' });
        }
      })
    );
  }
  if (isAdmin() && rental.status === 'pending') {
    actions.append(
      makeButton('Підтвердити', 'success', () =>
        rentalAction('/rentals/' + rental.id + '/approve', { method: 'PATCH' })
      ),
      makeButton('Відхилити', 'danger', () => openRejectDialog(rental))
    );
  }
  if (isAdmin() && rental.status === 'approved') {
    actions.append(
      makeButton('Прийняти повернення', 'success', () =>
        rentalAction('/rentals/' + rental.id + '/return', { method: 'PATCH' })
      )
    );
  }

  row.append(info, actions);
  return row;
}

async function loadRentals() {
  rentalsMessage.textContent = 'Завантаження...';
  rentalsList.replaceChildren();

  let path = '/rentals';
  if (isAdmin() && rentalStatusFilter.value) {
    path += '?status=' + encodeURIComponent(rentalStatusFilter.value);
  }

  try {
    const rentals = await api(path);
    if (rentals.length === 0) {
      rentalsMessage.textContent = 'Заявок поки немає.';
      return;
    }
    rentalsMessage.textContent = '';
    rentals.forEach((r) => rentalsList.append(renderRental(r)));
  } catch (err) {
    rentalsMessage.textContent = 'Помилка завантаження: ' + err.message;
  }
}

rentalStatusFilter.addEventListener('change', loadRentals);

// ---------- Старт ----------
renderAuthBar();
loadEquipment();