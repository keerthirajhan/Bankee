import { byCategory, catOf, dateKey, money, prettyDate, summarize } from './utils';

// ---------- export formats: CSV and a readable text summary ----------
const csvCell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
const newestFirst = (list) => [...list].sort((a, b) => +new Date(b.date) - +new Date(a.date));

export const buildCsv = (list) => {
  const rows = newestFirst(list).map((t) =>
    [dateKey(new Date(t.date)), t.type, catOf(t.category).name, t.note || '', t.type === 'income' ? t.amount : -t.amount].map(csvCell).join(',')
  );
  return ['Date,Type,Category,Note,Amount', ...rows].join('\n');
};

export const buildSummary = (list, { name, period, filters }) => {
  const sum = summarize(list);
  const cats = byCategory(list);
  const spent = cats.reduce((s, c) => s + c.total, 0);
  const lines = [
    'Bänkee - Transaction summary',
    `Account: ${name}`,
    `Period: ${period}`,
    filters ? `Filters: ${filters}` : null,
    `Generated: ${prettyDate(new Date().toISOString())}`,
    '',
    `Income: ${money(sum.income)}`,
    `Expenses: ${money(sum.expense)}`,
    `Balance: ${money(sum.balance)}`,
  ].filter((l) => l !== null);
  if (cats.length) {
    lines.push('', 'Spending by category:');
    cats.forEach((c) => lines.push(` - ${c.cat.name}: ${money(c.total)} (${Math.round((c.total / spent) * 100)}%)`));
  }
  lines.push('', `Transactions (${list.length}):`);
  newestFirst(list).forEach((t) =>
    lines.push(`${dateKey(new Date(t.date))} | ${t.type === 'income' ? 'Income ' : 'Expense'} | ${catOf(t.category).name} | ${t.note || '-'} | ${t.type === 'income' ? '+' : '-'}${money(t.amount)}`)
  );
  return lines.join('\n');
};
