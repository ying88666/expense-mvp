import './style.css';
import { CATEGORIES, TABLE_NAME, supabase } from './config.js';

const form = document.querySelector('#expenseForm');
const amountInput = document.querySelector('#amount');
const categorySelect = document.querySelector('#category');
const dateInput = document.querySelector('#date');
const noteInput = document.querySelector('#note');
const formMessage = document.querySelector('#formMessage');
const totalAmount = document.querySelector('#totalAmount');
const totalCount = document.querySelector('#totalCount');
const categorySummary = document.querySelector('#categorySummary');
const recordsBody = document.querySelector('#recordsBody');
const refreshButton = document.querySelector('#refreshButton');

categorySelect.innerHTML = CATEGORIES.map((item) => `<option value="${item}">${item}</option>`).join('');
dateInput.value = new Date().toISOString().slice(0, 10);

form.addEventListener('submit', handleSubmit);
refreshButton.addEventListener('click', loadExpenses);

loadExpenses();

async function handleSubmit(event) {
  event.preventDefault();
  setMessage('保存中...', false);

  const payload = {
    amount: Number(amountInput.value),
    category: categorySelect.value,
    date: dateInput.value,
    note: noteInput.value.trim() || null,
  };

  const { error } = await supabase.from(TABLE_NAME).insert(payload);

  if (error) {
    setMessage(error.message, true);
    return;
  }

  form.reset();
  categorySelect.value = CATEGORIES[0];
  dateInput.value = new Date().toISOString().slice(0, 10);
  setMessage('保存成功', false);
  await loadExpenses();
}

async function loadExpenses() {
  refreshButton.disabled = true;

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('id, amount, category, date, note, created_at')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });

  refreshButton.disabled = false;

  if (error) {
    recordsBody.innerHTML = `<tr><td colspan="4" class="empty error">${escapeHtml(error.message)}</td></tr>`;
    totalAmount.textContent = '¥0.00';
    totalCount.textContent = '0';
    renderCategorySummary([]);
    return;
  }

  renderSummary(data ?? []);
  renderTable(data ?? []);
}

function renderSummary(records) {
  const total = records.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  totalAmount.textContent = formatCurrency(total);
  totalCount.textContent = String(records.length);
  renderCategorySummary(records);
}

function renderCategorySummary(records) {
  const totals = CATEGORIES.map((category) => {
    const amount = records
      .filter((item) => item.category === category)
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    return { category, amount };
  });

  categorySummary.innerHTML = totals
    .map(
      (item) => `
        <article class="summary-item">
          <span>${item.category}</span>
          <strong>${formatCurrency(item.amount)}</strong>
        </article>
      `,
    )
    .join('');
}

function renderTable(records) {
  if (!records.length) {
    recordsBody.innerHTML = '<tr><td colspan="4" class="empty">暂无账单，请先新增一条记录。</td></tr>';
    return;
  }

  recordsBody.innerHTML = records
    .map(
      (item) => `
        <tr>
          <td>${escapeHtml(item.date)}</td>
          <td>${escapeHtml(item.category)}</td>
          <td>${formatCurrency(item.amount)}</td>
          <td>${escapeHtml(item.note || '-')}</td>
        </tr>
      `,
    )
    .join('');
}

function formatCurrency(value) {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
  }).format(Number(value || 0));
}

function setMessage(message, isError) {
  formMessage.textContent = message;
  formMessage.classList.toggle('error', Boolean(isError));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
