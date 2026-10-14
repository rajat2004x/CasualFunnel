import { initTracker } from '../tracker/src/tracker.js';

const tracker = initTracker({ apiUrl: 'http://localhost:5000' });
const products = [
  { name: 'Daily Carry Tote', price: 68, color: 'sand', description: 'A sturdy canvas companion for busy days.' },
  { name: 'Ceramic Pour Over', price: 42, color: 'clay', description: 'A slow morning, made beautifully simple.' },
  { name: 'Field Notes Set', price: 18, color: 'sage', description: 'Three notebooks for ideas worth keeping.' },
  { name: 'Desk Lamp No. 2', price: 96, color: 'ink', description: 'Warm light for focused evenings.' }
];
let cartCount = 0;

const productGrid = document.querySelector('#product-grid');
productGrid.innerHTML = products.map((product, index) => `
  <article class="product-card">
    <div class="product-art ${product.color}"><span>0${index + 1}</span></div>
    <div class="product-info">
      <div><h3>${product.name}</h3><p>${product.description}</p></div>
      <strong>$${product.price}</strong>
    </div>
    <button class="add-button" data-product="${product.name}" type="button">Add to bag</button>
  </article>
`).join('');

productGrid.addEventListener('click', (event) => {
  const button = event.target.closest('[data-product]');
  if (!button) return;
  cartCount += 1;
  document.querySelector('#cart-count').textContent = cartCount;
  document.querySelector('#cart-message').textContent =
    `${cartCount} item${cartCount === 1 ? '' : 's'} in your bag.`;
  button.textContent = 'Added';
});

document.querySelector('#checkout-button').addEventListener('click', () => {
  document.querySelector('#cart-message').textContent =
    cartCount ? 'Checkout is ready for the next step.' : 'Add an item before checking out.';
});

window.addEventListener('beforeunload', () => tracker.destroy());
