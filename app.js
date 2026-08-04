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

// Save action feedback via Toast notification
function save(label) {
  const toast = document.getElementById('toast');
  toast.textContent = `✓ ${label} inserted successfully`;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
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