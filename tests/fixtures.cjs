'use strict';
// Synthetic HTML only. Never put real account exports or captured RSI HTML here.
const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
const item = ({
  model = 'Synthetic Scout',
  kind = 'Ship',
  manufacturer = 'Synthetic Works',
  name = '',
  ancillary = false,
} = {}) =>
  `<div class="${ancillary ? 'without-images' : 'with-images'}"><div class="item"><div class="title">${escape(model)}</div>${kind ? `<div class="kind">${escape(kind)}</div>` : ''}${manufacturer ? `<div class="liner">${escape(manufacturer)}</div>` : ''}${name ? `<span class="custom-name-text">${escape(name)}</span>` : ''}</div></div>`;
const row = (items, extra = '') =>
  `<li><div class="row"><div class="items-col">Contains: ${items.length} items</div><div class="items">${items.join('')}</div>${extra}</div></li>`;
const page = (number, rows, last = number, extra = '') =>
  `<!doctype html><html lang="en"><meta charset="utf-8"><title>Synthetic RSI hangar</title><body><h1>Synthetic test hangar</h1><a class="active" href="/account/pledges?page=${number}">${number}</a>${number < last ? `<a class="gt btn" href="/account/pledges?page=${number + 1}">Next</a><a class="raquo btn" href="/account/pledges?page=${last}">Last</a>` : ''}<ul class="list-items">${rows.join('')}</ul>${extra}</body></html>`;
module.exports = { item, row, page };
