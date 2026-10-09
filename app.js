// Navigation section switching logic
function switchSection(id, el) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('sec-' + id).classList.add('active');
  el.classList.add('active');
}

// Option pill selection logic
function selectPill(el, group) {
  el.closest('.pill-group').querySelectorAll('.pill').forEach(p => p.classList.remove('selected'));
  el.classList.add('selected');
}

// Add split row to dynamic table
function addSplitRow() {
  const container = document.getElementById('split-rows');
  const row = document.createElement('div');
  row.className = 'split-row';
  row.innerHTML = `
    <div class="field">
      <label>Member (User ID) <span class="req">*</span></label>
      <input type="text" placeholder="e.g. USR002">
    </div>
    <div class="field">
      <label>Split Amount (INR) <span class="req">*</span></label>
      <input type="number" step="0.01" placeholder="0.00">
    </div>
    <button class="btn-icon" title="Remove row" onclick="removeRow(this)">×</button>
  `;
  container.appendChild(row);
}

// Remove split row
function removeRow(btn) {
  const rows = document.querySelectorAll('.split-row');
  if (rows.length > 1) {
    btn.closest('.split-row').remove();
  }
}

// Save User
async function save(entityType) {
  if (entityType === 'User') {
    const payload = {
      userId: document.getElementById('u-id').value,
      fullName: document.getElementById('u-name').value,
      email: document.getElementById('u-email').value,
      phone: document.getElementById('u-phone').value,
      passwordHash: document.getElementById('u-pass').value,
      createdAt: document.getElementById('u-created').value || null
    };
    sendRequest('http://localhost:3000/api/users', payload, 'User');
  }
}

// Save Trip
async function saveTrip() {
  const payload = {
    tripId: document.getElementById('tr-id').value,
    tripName: document.getElementById('tr-name').value,
    description: document.getElementById('tr-desc').value,
    startDate: document.getElementById('tr-start').value,
    endDate: document.getElementById('tr-end').value,
    baseCurrency: document.getElementById('tr-currency').value,
    coordinatorId: document.getElementById('tr-coord').value
  };
  sendRequest('http://localhost:3000/api/trips', payload, 'Trip');
}

// Save Trip Member
async function saveMember() {
  const selectedRoleEl = document.querySelector('#sec-members .pill.selected');
  const payload = {
    tripId: document.getElementById('m-trip').value,
    userId: document.getElementById('m-user').value,
    role: selectedRoleEl ? selectedRoleEl.textContent : 'Member',
    joinedAt: document.getElementById('m-joined').value
  };
  sendRequest('http://localhost:3000/api/trip-members', payload, 'Trip Member');
}

// Save Itinerary Item
async function saveItinerary() {
  const payload = {
    itemId: document.getElementById('it-id').value,
    tripId: document.getElementById('it-trip').value,
    location: document.getElementById('it-loc').value,
    activityType: document.getElementById('it-type').value,
    dayNumber: document.getElementById('it-day').value,
    startTime: document.getElementById('it-start').value,
    endTime: document.getElementById('it-end').value,
    notes: document.getElementById('it-notes').value
  };
  sendRequest('http://localhost:3000/api/itinerary', payload, 'Itinerary Item');
}

// Save Expense
async function saveExpense() {
  const payload = {
    expenseId: document.getElementById('ex-id').value,
    tripId: document.getElementById('ex-trip').value,
    description: document.getElementById('ex-desc').value,
    totalAmount: document.getElementById('ex-amount').value,
    currency: document.getElementById('ex-currency').value,
    paidBy: document.getElementById('ex-payer').value,
    category: document.getElementById('ex-cat').value,
    expenseDate: document.getElementById('ex-date').value,
    itineraryItemId: document.getElementById('ex-itin').value
  };
  sendRequest('http://localhost:3000/api/expenses', payload, 'Expense');
}

// Save Expense Splits
async function saveSplits() {
  const expenseId = document.getElementById('sp-exp').value;
  const splitRows = document.querySelectorAll('#split-rows .split-row');
  const splits = [];

  splitRows.forEach(row => {
    const inputs = row.querySelectorAll('input');
    splits.push({
      userId: inputs[0].value,
      amount: inputs[1].value
    });
  });

  sendRequest('http://localhost:3000/api/expense-splits', { expenseId, splits }, 'Expense Splits');
}

// Save Member Balance (Seed/Update)
async function saveBalance() {
  const payload = {
    tripId: document.getElementById('bal-trip').value,
    userId: document.getElementById('bal-user').value,
    netBalance: document.getElementById('bal-amount').value
  };
  sendRequest('http://localhost:3000/api/member-balances', payload, 'Balance Record');
}

// Generic helper function for fetch requests & toast alerts
async function sendRequest(url, payload, label) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    const toast = document.getElementById('toast');

    if (response.ok && result.success) {
      toast.textContent = `✓ ${label} inserted successfully`;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2800);
    } else {
      alert(`Error: ${result.error || 'Database insert failed'}`);
    }
  } catch (err) {
    console.error(err);
    alert('Could not connect to the server. Ensure node server.js is running.');
  }
}

// Form clear functionality
function clearForm(sectionId) {
  const section = document.getElementById('sec-' + sectionId);
  if (section) {
    const inputs = section.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      if (input.type === 'date') {
        input.value = new Date().toISOString().split('T')[0];
      } else {
        input.value = '';
      }
    });
  }
}

// Run settlement routine preview
function runSettle() {
  const r = document.getElementById('settle-result');
  r.style.display = 'block';
  const toast = document.getElementById('toast');
  toast.textContent = '✓ simplify_trip_debts() executed';
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
}

// Initialize default today's date in date inputs on DOM load
document.addEventListener('DOMContentLoaded', () => {
  const today = new Date().toISOString().split('T')[0];
  document.querySelectorAll('input[type=date]').forEach(el => {
    if (!el.value) el.value = today;
  });
});
