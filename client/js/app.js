const listEl = document.getElementById('equipmentList');
const messageEl = document.getElementById('message');
const categoryFilter = document.getElementById('categoryFilter');
const statusFilter = document.getElementById('statusFilter');

const statusLabels = {
  available: 'Вільна',
  rented: 'Видана',
  maintenance: 'У ремонті',
};
const categoryLabels = {
  laptop: 'Ноутбук',
  camera: 'Камера',
  sensor: 'Датчик',
  other: 'Інше',
};

// Створює одну картку техніки
function renderCard(item) {
  const card = document.createElement('article');
  card.className = 'card';

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

  card.append(title, category, badge, inv);
  return card;
}

async function loadEquipment() {
  messageEl.textContent = 'Завантаження...';
  listEl.replaceChildren();

  const params = new URLSearchParams();
  if (categoryFilter.value) params.set('category', categoryFilter.value);
  if (statusFilter.value) params.set('status', statusFilter.value);

  try {
    const response = await fetch('/api/equipment?' + params.toString());
    if (!response.ok) {
      throw new Error('сервер відповів зі статусом ' + response.status);
    }
    const items = await response.json();

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

loadEquipment();