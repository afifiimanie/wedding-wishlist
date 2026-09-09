const wishlistItems = [
  { name: 'Dish rack', link: 'https://s.shopee.com.my/3LQh6IDGGp' },
  { name: 'Spice rack', link: 'https://s.shopee.com.my/8AVwrmnpVV' },
  { name: 'Microwave', link: 'https://s.shopee.com.my/3Vk7JFfdQZ' },
  { name: 'Rice cooker', link: 'https://s.shopee.com.my/9053rPRFlg' },
  { name: 'Knife set with holder', link: 'https://s.shopee.com.my/6AksUJn1ui' },
  { name: 'Knife set', link: 'https://s.shopee.com.my/4Azo6gb4p9' },
  { name: 'Teapot and cup set', link: 'https://s.shopee.com.my/6AksUxipk' },
  { name: 'Cooking pan', link: 'https://s.shopee.com.my/BTfM5ONkD' },
  { name: 'Chopping board', link: 'https://s.shopee.com.my/9zxb4Hj1o' },
  { name: 'Kitchen set', link: 'https://s.shopee.com.my/8AVwtRYLWi' },
  { name: 'Spice rack', link: 'https://s.shopee.com.my/2LY9wnStKZ' },
  { name: 'Kitchen rack', link: 'https://my.shp.ee/5t3wwrhe?fromSource=copy_link&smtt=0.0.9' },
  { name: 'Seasoning storage', link: 'https://s.shopee.com.my/8KpN63UuxY' },
  { name: 'Rice dispenser', link: 'https://s.shopee.com.my/4VceXEzVi5' },
  { name: 'Blender', link: 'https://s.shopee.com.my/8fSDV2BDNK' },
  { name: 'Juicer', link: 'https://s.shopee.com.my/1BMCZHzIkE' },
  { name: 'Iron', link: 'https://s.shopee.com.my/6VNivBYaQk' },
  { name: 'Kettle', link: 'https://s.shopee.com.my/9V1KUkrmcS' },
  { name: 'Air fryer', link: 'https://s.shopee.com.my/5VVBjXT0cI' }
];

const storageKey = 'weddingWishlistStatuses';
const tableBody = document.querySelector('#wishlistTable tbody');
const API_ENDPOINT = 'http://localhost:5000/api/wishlist';

async function loadSavedStatuses() {
  try {
    if (API_ENDPOINT) {
      const response = await fetch(API_ENDPOINT);

      if (!response.ok) {
        throw new Error('Failed to load shared wishlist statuses');
      }

      const saved = await response.json();
      return saved || {};
    }

    const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
    return saved;
  } catch {
    return {};
  }
}

async function saveStatuses(statuses) {
  if (API_ENDPOINT) {
    await fetch(API_ENDPOINT, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(statuses)
    });
    return;
  }

  localStorage.setItem(storageKey, JSON.stringify(statuses));
}

function createStatusOptions(selectedStatus) {
  const options = ['Available', 'Reserved', 'Purchased'];
  return options
    .map((option) => {
      const isSelected = option === selectedStatus ? 'selected' : '';
      return `<option value="${option}" ${isSelected}>${option}</option>`;
    })
    .join('');
}

async function renderTable() {
  const savedStatuses = await loadSavedStatuses();

  tableBody.innerHTML = wishlistItems
    .map((item, index) => {
      const savedStatus = savedStatuses[index] || 'Available';
      const statusClass = savedStatus.toLowerCase();

      return `
        <tr data-index="${index}">
          <td class="item-name">${item.name}</td>
          <td class="link-cell">
            <a href="${item.link}" target="_blank" rel="noopener noreferrer">Open item</a>
          </td>
          <td>
            <select class="status-select ${statusClass}" aria-label="Reserved status for ${item.name}">
              ${createStatusOptions(savedStatus)}
            </select>
          </td>
        </tr>
      `;
    })
    .join('');

  const selects = document.querySelectorAll('.status-select');

  selects.forEach((select) => {
    select.addEventListener('change', async (event) => {
      const rowIndex = event.target.closest('tr').dataset.index;
      const currentStatuses = await loadSavedStatuses();
      const selectedStatus = event.target.value;

      currentStatuses[rowIndex] = selectedStatus;
      await saveStatuses(currentStatuses);

      event.target.classList.remove('available', 'reserved', 'purchased');
      event.target.classList.add(selectedStatus.toLowerCase());
    });
  });
}

renderTable();
