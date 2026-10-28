import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, R, createStyles } from '../theme';
import { AnimatedIn, Button, CatIcon, Empty, Header, Input, MonthSwitcher, Screen, Segmented, TxItem } from '../ui';
import { useApp } from '../AppContext';
import { CATEGORIES, EXPENSE_CATS, INCOME_CATS, MONTHS, catOf, dateKey, inMonth, money, parseDateInput, prettyDate, summarize } from '../utils';
import { buildCsv, buildSummary } from '../exporters';
import { shareContent } from '../share';

const FILTERS = [{ label: 'All', value: 'all' }, { label: 'Income', value: 'income' }, { label: 'Expense', value: 'expense' }];

// ---------- Transactions (month wise) with search, filters and export ----------
export function TransactionsScreen({ navigation }) {
  const { user, myTxns, deleteTxn, confirm, showAlert } = useApp();
  const now = new Date();
  const [ym, setYm] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [catId, setCatId] = useState('all');
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');
  const [allMonths, setAllMonths] = useState(false);
  const [more, setMore] = useState(false);

  const q = query.trim().toLowerCase();
  const digits = q.replace(/[^\d.]/g, '');
  const lo = min.trim() === '' ? null : Number(min);
  const hi = max.trim() === '' ? null : Number(max);
  const amountErr =
    (lo !== null && (isNaN(lo) || lo < 0)) || (hi !== null && (isNaN(hi) || hi < 0))
      ? 'Enter valid amounts'
      : lo !== null && hi !== null && lo > hi
      ? 'Min cannot be more than max'
      : '';
  const active = !!q || filter !== 'all' || catId !== 'all' || min !== '' || max !== '' || allMonths;

  const scope = allMonths ? myTxns : myTxns.filter((t) => inMonth(t, ym.y, ym.m));
  const list = scope
    .filter((t) => filter === 'all' || t.type === filter)
    .filter((t) => catId === 'all' || t.category === catId)
    .filter((t) => !!amountErr || ((lo === null || t.amount >= lo) && (hi === null || t.amount <= hi)))
    .filter((t) => {
      if (!q) return true;
      const cat = catOf(t.category);
      return (
        (t.note || '').toLowerCase().includes(q) ||
        cat.name.toLowerCase().includes(q) ||
        t.type.includes(q) ||
        (digits !== '' && String(t.amount).includes(digits))
      );
    })
    .sort((a, b) => +new Date(b.date) - +new Date(a.date));
  const sum = summarize(list);

  const clearAll = () => { setQuery(''); setFilter('all'); setCatId('all'); setMin(''); setMax(''); setAllMonths(false); };

  const groups = [];
  list.forEach((t) => {
    const k = dateKey(new Date(t.date));
    const g = groups.find((x) => x.k === k);
    g ? g.items.push(t) : groups.push({ k, date: t.date, items: [t] });
  });

  const askDelete = (t) =>
    confirm({ title: 'Delete transaction?', message: `${money(t.amount)} · ${t.note || 'No note'} will be removed permanently.`, confirmText: 'Delete', danger: true, onConfirm: () => deleteTxn(t.id) });

  // ----- export what is currently shown -----
  const doExport = async (kind) => {
    const period = allMonths ? 'All months' : `${MONTHS[ym.m]} ${ym.y}`;
    const filters = [filter !== 'all' && filter, catId !== 'all' && catOf(catId).name, q && `"${query.trim()}"`, lo !== null && `min ${money(lo)}`, hi !== null && `max ${money(hi)}`].filter(Boolean).join(', ');
    const csv = kind === 'csv';
    const r = await shareContent({
      title: csv ? 'Transactions CSV' : 'Transaction summary',
      message: csv ? buildCsv(list) : buildSummary(list, { name: user.name, period, filters }),
      filename: csv ? `transactions-${period.replace(/\s+/g, '-').toLowerCase()}.csv` : undefined,
    });
    const msg = { downloaded: 'CSV file downloaded.', copied: 'Summary copied to the clipboard.', failed: 'Sharing is not available on this device.' }[r];
    if (msg) showAlert({ type: r === 'failed' ? 'danger' : 'success', title: r === 'failed' ? 'Export failed' : 'Export ready', message: msg });
  };
  const askExport = () => {
    if (!list.length) return showAlert({ type: 'info', title: 'Nothing to export', message: 'There are no transactions matching the current view.' });
    showAlert({
      type: 'info',
      title: 'Export transactions',
      message: `${list.length} transaction${list.length === 1 ? '' : 's'} in the current view. Choose a format to share.`,
      actions: [
        { text: 'Text', style: 'primary', onPress: () => doExport('text') },
        { text: 'CSV', style: 'primary', onPress: () => doExport('csv') },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  };

  return (
    <Screen>
      <Header title="Transactions" subtitle={allMonths ? 'All months' : 'Month-wise history'} navigation={navigation}
        right={
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable style={s.ghost} onPress={askExport}><Ionicons name="share-outline" size={20} color={C.text} /></Pressable>
            <Pressable style={s.add} onPress={() => navigation.navigate('AddTransaction')}><Ionicons name="add" size={24} color="#fff" /></Pressable>
          </View>
        } />

      <Input icon="search" placeholder="Search note, category or amount" value={query} onChangeText={setQuery} style={{ marginBottom: 10 }} />
      {!allMonths && <MonthSwitcher year={ym.y} month={ym.m} onChange={(y, m) => setYm({ y, m })} />}
      <AnimatedIn delay={60}>
        <View style={s.sumRow}>
          <View style={s.sum}><Text style={s.sl}>Income</Text><Text style={[s.sv, { color: C.mint }]}>{money(sum.income)}</Text></View>
          <View style={s.sum}><Text style={s.sl}>Expenses</Text><Text style={[s.sv, { color: C.coral }]}>{money(sum.expense)}</Text></View>
          <View style={s.sum}><Text style={s.sl}>Balance</Text><Text style={s.sv}>{money(sum.balance)}</Text></View>
        </View>
        <Segmented options={FILTERS} value={filter} onChange={setFilter} style={{ marginBottom: 12 }} />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 4 }}>
          <Pressable onPress={() => setCatId('all')} style={[s.chip, catId === 'all' && { backgroundColor: C.primary, borderColor: C.primary }]}>
            <Text style={[s.chipT, catId === 'all' && { color: '#fff' }]}>All categories</Text>
          </Pressable>
          {CATEGORIES.map((c) => (
            <Pressable key={c.id} onPress={() => setCatId(catId === c.id ? 'all' : c.id)} style={[s.chip, catId === c.id && { borderColor: c.color, backgroundColor: c.color + '30' }]}>
              <Ionicons name={c.icon} size={14} color={c.color} />
              <Text style={[s.chipT, catId === c.id && { color: C.text }]}>{c.name}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={s.moreRow}>
          <Pressable onPress={() => setMore(!more)} style={s.moreBtn}>
            <Ionicons name="options" size={16} color={C.primary2} />
            <Text style={s.moreT}>Amount range & scope</Text>
            <Ionicons name={more ? 'chevron-up' : 'chevron-down'} size={14} color={C.primary2} />
          </Pressable>
          {active && (
            <Pressable onPress={clearAll} style={s.moreBtn}>
              <Ionicons name="close-circle" size={16} color={C.coral} />
              <Text style={[s.moreT, { color: C.coral }]}>Clear</Text>
            </Pressable>
          )}
        </View>
        {more && (
          <View style={s.panel}>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Input style={{ flex: 1, marginBottom: 6 }} label="Min (₹)" keyboardType="number-pad" placeholder="0" value={min} onChangeText={setMin} />
              <Input style={{ flex: 1, marginBottom: 6 }} label="Max (₹)" keyboardType="number-pad" placeholder="Any" value={max} onChangeText={setMax} />
            </View>
            {!!amountErr && <Text style={s.err}>{amountErr}</Text>}
            <Pressable onPress={() => setAllMonths(!allMonths)} style={s.check}>
              <Ionicons name={allMonths ? 'checkbox' : 'square-outline'} size={20} color={C.primary2} />
              <Text style={s.checkT}>Search across all months</Text>
            </Pressable>
          </View>
        )}
        {active && <Text style={s.count}>{list.length} result{list.length === 1 ? '' : 's'}</Text>}
      </AnimatedIn>

      {groups.length === 0 && <Empty text={active ? 'No transactions match your search or filters.' : 'No transactions for this month.'} />}
      {groups.map((g) => (
        <View key={g.k}>
          <Text style={s.gd}>{prettyDate(g.date)}</Text>
          {g.items.map((t, i) => (
            <TxItem key={t.id} t={t} index={i} onPress={() => navigation.navigate('AddTransaction', { txnId: t.id })} onDelete={() => askDelete(t)} />
          ))}
        </View>
      ))}
    </Screen>
  );
}

// ---------- Add / edit transaction ----------
export function AddTransactionScreen({ navigation, route }) {
  const { myTxns, addTxn, updateTxn, deleteTxn, confirm } = useApp();
  const editing = myTxns.find((t) => t.id === route.params?.txnId);
  const [type, setType] = useState(editing?.type || 'expense');
  const [amount, setAmount] = useState(editing ? String(editing.amount) : '');
  const [cat, setCat] = useState(editing?.category || route.params?.category || '');
  const [note, setNote] = useState(editing?.note || '');
  const [date, setDate] = useState(dateKey(editing ? new Date(editing.date) : new Date()));
  const [err, setErr] = useState({});

  const cats = type === 'expense' ? EXPENSE_CATS : INCOME_CATS;
  useEffect(() => { if (cat && !cats.some((c) => c.id === cat)) setCat(''); }, [type]);

  const quick = (daysAgo) => setDate(dateKey(new Date(Date.now() - daysAgo * 86400000)));

  const save = () => {
    const e = {};
    const amt = Number(amount);
    if (!amount.trim()) e.amount = 'Amount is required';
    else if (!/^\d+(\.\d{1,2})?$/.test(amount.trim()) || amt <= 0) e.amount = 'Enter a valid amount greater than 0';
    else if (amt > 10000000) e.amount = 'Amount is too large';
    if (!cat) e.cat = 'Please choose a category';
    if (note.length > 60) e.note = 'Note can be at most 60 characters';
    const d = parseDateInput(date);
    if (!d) e.date = 'Use a valid date (YYYY-MM-DD), not in the future';
    if (Object.keys(e).length) return setErr(e);
    const data = { type, amount: amt, category: cat, note: note.trim(), date: d.toISOString() };
    editing ? updateTxn(editing.id, data) : addTxn(data);
    navigation.goBack();
  };

  return (
    <Screen>
      <Header title={editing ? 'Edit transaction' : 'Add transaction'} subtitle="Every change triggers a personalised alert" navigation={navigation} back />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <AnimatedIn>
          <Segmented options={[{ label: 'Expense', value: 'expense' }, { label: 'Income', value: 'income' }]} value={type} onChange={setType} style={{ marginBottom: 18 }} />
          <Input label="Amount (₹)" icon="cash" placeholder="0.00" keyboardType="decimal-pad" value={amount} onChangeText={(v) => { setAmount(v); setErr({ ...err, amount: undefined }); }} error={err.amount} />
          <Text style={s.lbl}>Category</Text>
          <View style={s.chips}>
            {cats.map((c) => (
              <Pressable key={c.id} onPress={() => { setCat(c.id); setErr({ ...err, cat: undefined }); }} style={[s.chip, cat === c.id && { borderColor: c.color, backgroundColor: c.color + '22' }]}>
                <Ionicons name={c.icon} size={16} color={c.color} />
                <Text style={[s.chipText, cat === c.id && { color: C.text }]}>{c.name}</Text>
              </Pressable>
            ))}
          </View>
          {!!err.cat && <Text style={s.err}>{err.cat}</Text>}
          <Input style={{ marginTop: 16 }} label="Note (optional)" icon="create" placeholder="e.g. Dinner with friends" value={note} onChangeText={setNote} error={err.note} />
          <Input label="Date" icon="calendar" placeholder="YYYY-MM-DD" value={date} onChangeText={(v) => { setDate(v); setErr({ ...err, date: undefined }); }} error={err.date} style={{ marginBottom: 8 }} />
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 22 }}>
            <Pressable style={s.quick} onPress={() => quick(0)}><Text style={s.qt}>Today</Text></Pressable>
            <Pressable style={s.quick} onPress={() => quick(1)}><Text style={s.qt}>Yesterday</Text></Pressable>
            <Pressable style={s.quick} onPress={() => quick(7)}><Text style={s.qt}>Last week</Text></Pressable>
          </View>
          <Button title={editing ? 'Save changes' : 'Add transaction'} icon="checkmark-circle" onPress={save} />
          {editing && (
            <Button title="Delete transaction" icon="trash" variant="danger" style={{ marginTop: 12 }}
              onPress={() => confirm({ title: 'Delete transaction?', message: 'This cannot be undone.', confirmText: 'Delete', danger: true, onConfirm: () => { deleteTxn(editing.id); navigation.goBack(); } })} />
          )}
        </AnimatedIn>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const s = createStyles(() => ({
  ghost: { width: 40, height: 40, borderRadius: 14, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.card },
  chipT: { color: C.sub, fontSize: 12, fontWeight: '700' },
  moreRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  moreBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6 },
  moreT: { color: C.primary2, fontSize: 13, fontWeight: '700' },
  panel: { backgroundColor: C.card, borderRadius: R.md, borderWidth: 1, borderColor: C.border, padding: 14, marginTop: 4 },
  check: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 4 },
  checkT: { color: C.text, fontWeight: '600', fontSize: 13 },
  count: { color: C.sub, fontSize: 12, marginTop: 8, fontWeight: '600' },
  add: { width: 40, height: 40, borderRadius: 14, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
  sumRow: { flexDirection: 'row', gap: 10, marginVertical: 14 },
  sum: { flex: 1, backgroundColor: C.card, borderRadius: R.md, padding: 12, borderWidth: 1, borderColor: C.border },
  sl: { color: C.sub, fontSize: 11 },
  sv: { color: C.text, fontWeight: '800', fontSize: 15, marginTop: 3 },
  gd: { color: C.sub, fontWeight: '700', fontSize: 13, marginTop: 14, marginBottom: 8 },
  lbl: { color: C.sub, fontSize: 13, fontWeight: '600', marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 14, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.card },
  chipText: { color: C.sub, fontSize: 13, fontWeight: '600' },
  err: { color: C.coral, fontSize: 12, marginTop: 6 },
  quick: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, backgroundColor: C.card2 },
  qt: { color: C.text, fontSize: 12, fontWeight: '600' },
}));
