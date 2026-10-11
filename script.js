// Nexus Fitness: front-end behaviour

// ===== EDIT THESE =====
// Optional: paste a Formspree URL (https://formspree.io/f/xxxx) to receive real sign-ups.
// Leave empty to just show the thank-you message.
const FORM_ENDPOINT = '';

const zones = [
  { name: 'Strength floor', v: 62 },
  { name: 'Cardio deck', v: 38 },
  { name: 'Studio A', v: 91 },
  { name: 'Recovery lounge', v: 24 }
];

// [time, class name, details]
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const schedule = {
  Mon: [['6:00', 'Strength Basics', 'Hamza Q. · 45 min · 4 spots left'], ['12:15', 'Lunch Burn', 'Bilal A. · 30 min · 9 spots left'], ['18:30', 'Power Hour', 'Hamza Q. · 60 min · 2 spots left']],
  Tue: [['7:00', 'Vinyasa Flow', 'Ayesha M. · 60 min · 11 spots left'], ['17:45', 'Conditioning Circuit', 'Bilal A. · 45 min · 6 spots left'], ['19:30', 'Mobility Reset', 'Ayesha M. · 30 min · 14 spots left']],
  Wed: [['6:00', 'Barbell Club', 'Hamza Q. · 60 min · 5 spots left'], ['12:15', 'Core 30', 'Sana R. · 30 min · 12 spots left'], ['18:30', 'HIIT Intervals', 'Bilal A. · 45 min · 1 spot left']],
  Thu: [['7:00', 'Yoga for Lifters', 'Ayesha M. · 60 min · 10 spots left'], ['17:45', 'Strength Basics', 'Hamza Q. · 45 min · 8 spots left']],
  Fri: [['6:00', 'Conditioning Circuit', 'Bilal A. · 45 min · 7 spots left'], ['12:15', 'Lunch Burn', 'Sana R. · 30 min · 9 spots left'], ['18:00', 'Friday Flow', 'Ayesha M. · 45 min · 13 spots left']],
  Sat: [['9:00', 'Team Workout', 'Bilal A. · 60 min · 3 spots left'], ['10:30', 'Mobility Reset', 'Ayesha M. · 45 min · 15 spots left']],
  Sun: [['10:00', 'Slow Flow', 'Ayesha M. · 60 min · 16 spots left'], ['16:00', 'Open Recovery', 'Sana R. · 90 min · 20 spots left']]
};
// ======================

// 1. Follow the device light/dark setting (Bootstrap 5.3 colour modes)
const mq = window.matchMedia('(prefers-color-scheme: dark)');
const applyTheme = () => document.documentElement.setAttribute('data-bs-theme', mq.matches ? 'dark' : 'light');
applyTheme();
mq.addEventListener('change', applyTheme);

// 2. Live gym floor
const zonesEl = document.getElementById('zones');

function renderZones() {
  zonesEl.innerHTML = zones.map(z => `
    <div class="nx-zone ${z.v > 85 ? 'busy' : ''}">
      <div class="d-flex justify-content-between fw-medium small mb-1"><span>${z.name}</span><span>${z.v}%</span></div>
      <div class="progress" role="progressbar" aria-label="${z.name} occupancy" aria-valuenow="${z.v}" aria-valuemin="0" aria-valuemax="100">
        <div class="progress-bar" style="width:${z.v}%"></div>
      </div>
    </div>`).join('');
}
renderZones();
setInterval(() => {
  zones.forEach(z => z.v = Math.max(10, Math.min(98, z.v + Math.round(Math.random() * 6 - 3))));
  renderZones();
}, 3500);

// 3. Class schedule
const tabsEl = document.getElementById('dayTabs');
const listEl = document.getElementById('classList');
const todayIndex = (new Date().getDay() + 6) % 7; // Monday = 0

function showDay(i) {
  tabsEl.querySelectorAll('.nav-link').forEach((b, idx) => {
    b.classList.toggle('active', idx === i);
    b.setAttribute('aria-selected', idx === i);
  });
  listEl.innerHTML = '';
  schedule[days[i]].forEach(([time, title, meta]) => {
    const row = document.createElement('div');
    row.className = 'nx-class';
    row.innerHTML = `<time>${time}</time><div><strong>${title}</strong><br><small>${meta}</small></div>
      <button class="btn btn-sm btn-outline-primary rounded-pill px-3">Reserve</button>`;
    const btn = row.querySelector('button');
    btn.addEventListener('click', () => {
      const reserved = btn.classList.toggle('active');
      btn.textContent = reserved ? 'Reserved' : 'Reserve';
    });
    listEl.appendChild(row);
  });
}

days.forEach((d, i) => {
  const li = document.createElement('li');
  li.className = 'nav-item';
  li.innerHTML = `<button class="nav-link" role="tab" type="button">${d}</button>`;
  li.firstChild.addEventListener('click', () => showDay(i));
  tabsEl.appendChild(li);
});
showDay(todayIndex);

// 4. Monthly / yearly pricing toggle
document.querySelectorAll('input[name="billing"]').forEach(radio => {
  radio.addEventListener('change', () => {
    document.querySelectorAll('[data-m]').forEach(el => {
      el.textContent = '$' + el.dataset[radio.value];
    });
  });
});

// 5. Join form with Bootstrap validation
const form = document.getElementById('joinForm');
const msg = document.getElementById('formMsg');

form.addEventListener('submit', async e => {
  e.preventDefault();
  if (!form.checkValidity()) {
    form.classList.add('was-validated');
    msg.textContent = '';
    return;
  }
  const data = {
    name: document.getElementById('name').value.trim(),
    email: document.getElementById('email').value.trim(),
    goal: document.getElementById('goal').value
  };

  if (FORM_ENDPOINT) {
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Request failed');
    } catch (err) {
      msg.textContent = 'Something went wrong. Check your connection and try again.';
      return;
    }
  }

  msg.textContent = `Thanks, ${data.name.split(' ')[0]}. Your free week pass is on its way.`;
  form.reset();
  form.classList.remove('was-validated');
});