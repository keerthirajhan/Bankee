import { C } from './theme';

// ---------- categories ----------
export const CATEGORIES = [
  { id: 'food', name: 'Food & Dining', icon: 'restaurant', color: C.amber, type: 'expense', budget: 6000 },
  { id: 'shopping', name: 'Shopping', icon: 'bag-handle', color: C.pink, type: 'expense', budget: 5000 },
  { id: 'transport', name: 'Transport', icon: 'car', color: C.blue, type: 'expense', budget: 3000 },
  { id: 'bills', name: 'Bills & Utilities', icon: 'receipt', color: C.coral, type: 'expense', budget: 5000 },
  { id: 'health', name: 'Health', icon: 'medkit', color: C.mint, type: 'expense', budget: 2500 },
  { id: 'fun', name: 'Entertainment', icon: 'game-controller', color: C.primary2, type: 'expense', budget: 2500 },
  { id: 'other', name: 'Other', icon: 'ellipsis-horizontal-circle', color: '#8EA0C9', type: 'expense', budget: 2000 },
  { id: 'salary', name: 'Salary', icon: 'wallet', color: C.mint, type: 'income', budget: 0 },
  { id: 'freelance', name: 'Freelance', icon: 'laptop', color: C.blue, type: 'income', budget: 0 },
  { id: 'gift', name: 'Gifts & Other Income', icon: 'gift', color: C.pink, type: 'income', budget: 0 },
];
export const EXPENSE_CATS = CATEGORIES.filter((c) => c.type === 'expense');
export const INCOME_CATS = CATEGORIES.filter((c) => c.type === 'income');
export const catOf = (id) => CATEGORIES.find((c) => c.id === id) || CATEGORIES[6];

// ---------- formatting ----------
export const money = (n) => {
  const v = Math.round(Number(n) || 0);
  const s = String(Math.abs(v)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return (v < 0 ? '-' : '') + '₹' + s;
};
export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const pad = (n) => String(n).padStart(2, '0');
export const dateKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const prettyDate = (iso) => {
  const d = new Date(iso);
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`;
};
export const initials = (name = '') =>
  name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || 'U';

// ---------- validation ----------
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const PHONE_RE = /^[6-9]\d{9}$/;
export const parseDateInput = (s) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim());
  if (!m) return null;
  const d = new Date(+m[1], +m[2] - 1, +m[3], 12, 0, 0);
  if (d.getMonth() !== +m[2] - 1 || d > new Date(Date.now() + 86400000)) return null;
  return d;
};

// ---------- aggregation ----------
export const summarize = (list) => {
  let income = 0;
  let expense = 0;
  list.forEach((t) => (t.type === 'income' ? (income += t.amount) : (expense += t.amount)));
  return { income, expense, balance: income - expense };
};
export const inMonth = (t, y, m) => {
  const d = new Date(t.date);
  return d.getFullYear() === y && d.getMonth() === m;
};
export const byCategory = (list) => {
  const map = {};
  list.filter((t) => t.type === 'expense').forEach((t) => (map[t.category] = (map[t.category] || 0) + t.amount));
  return Object.entries(map)
    .map(([id, total]) => ({ cat: catOf(id), total }))
    .sort((a, b) => b.total - a.total);
};

// Reports for the home screen: daily / weekly / monthly
export function buildReport(txns, period, now = new Date()) {
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let start;
  let end;
  let buckets;
  let label;
  if (period === 'daily') {
    start = startOfDay;
    end = new Date(+startOfDay + 86400000);
    label = 'Today';
    buckets = ['12a', '4a', '8a', '12p', '4p', '8p'].map((l, i) => ({ label: l, from: +start + i * 4 * 3600000, to: +start + (i + 1) * 4 * 3600000 }));
  } else if (period === 'weekly') {
    const dow = (startOfDay.getDay() + 6) % 7; // Monday = 0
    start = new Date(+startOfDay - dow * 86400000);
    end = new Date(+start + 7 * 86400000);
    label = 'This week';
    buckets = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((l, i) => ({ label: l, from: +start + i * 86400000, to: +start + (i + 1) * 86400000 }));
  } else {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    label = MONTHS[now.getMonth()];
    const weeks = Math.ceil((end - start) / (7 * 86400000));
    buckets = Array.from({ length: weeks }, (_, i) => ({ label: `W${i + 1}`, from: +start + i * 7 * 86400000, to: Math.min(+start + (i + 1) * 7 * 86400000, +end) }));
  }
  const list = txns.filter((t) => +new Date(t.date) >= +start && +new Date(t.date) < +end);
  const bars = buckets.map((b) => ({
    label: b.label,
    value: list.filter((t) => t.type === 'expense' && +new Date(t.date) >= b.from && +new Date(t.date) < b.to).reduce((s, t) => s + t.amount, 0),
  }));
  return { label, list, bars, ...summarize(list) };
}

// Demo transactions given to every new customer so charts are not empty
export function sampleTransactions(userId) {
  const now = new Date();
  const mk = (daysAgo, type, amount, category, note, hour = 12) => {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysAgo, hour, 0, 0);
    return { id: `${userId}-s${daysAgo}-${category}-${amount}`, userId, type, amount, category, note, date: d.toISOString() };
  };
  return [
    mk(0, 'expense', 240, 'food', 'Lunch at canteen', 9),
    mk(0, 'expense', 90, 'transport', 'Metro card top-up', 8),
    mk(1, 'expense', 1299, 'shopping', 'Headphones', 18),
    mk(2, 'income', 1500, 'freelance', 'Logo design gig', 15),
    mk(3, 'expense', 560, 'fun', 'Movie night', 20),
    mk(5, 'expense', 1850, 'bills', 'Electricity bill', 11),
    mk(6, 'expense', 420, 'health', 'Pharmacy', 10),
    mk(9, 'income', 25000, 'salary', 'Stipend', 10),
    mk(12, 'expense', 780, 'food', 'Weekend dinner', 21),
    mk(17, 'expense', 2200, 'shopping', 'Shoes', 17),
    mk(24, 'expense', 650, 'transport', 'Cab rides', 19),
    mk(33, 'income', 24000, 'salary', 'Stipend', 10),
    mk(36, 'expense', 3100, 'bills', 'Rent share', 11),
    mk(41, 'expense', 1400, 'food', 'Groceries', 12),
    mk(55, 'expense', 900, 'fun', 'Concert', 20),
    mk(63, 'income', 23500, 'salary', 'Stipend', 10),
    mk(70, 'expense', 2600, 'shopping', 'Clothes', 16),
    mk(80, 'expense', 1100, 'health', 'Check-up', 11),
  ];
}
