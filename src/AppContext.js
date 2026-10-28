import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { catOf, money, sampleTransactions, summarize, inMonth } from './utils';
import { applyTheme } from './theme';

const KEY = 'budget-tracker-v1';
const THEME_KEY = 'budget-theme-v1';
export const DEFAULT_GOALS = { savings: 20000, spend: 15000, celebrated: '' };
export const ADMIN_CODE = 'ADMIN2026';

const SEED_USERS = [
  { id: 'admin-1', role: 'admin', name: 'Admin User', email: 'admin@budget.app', phone: '9000000000', password: 'admin123', createdAt: new Date().toISOString() },
  { id: 'cust-demo', role: 'customer', name: 'Demo Customer', email: 'demo@budget.app', phone: '9876543210', password: 'demo123', createdAt: new Date().toISOString() },
];

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

export function AppProvider({ children }) {
  const [ready, setReady] = useState(false);
  const [users, setUsers] = useState(SEED_USERS);
  const [txns, setTxns] = useState(() => sampleTransactions('cust-demo'));
  const [sessionId, setSessionId] = useState(null);
  const [alertState, setAlertState] = useState(null);
  const [mode, setMode] = useState('light');
  const loaded = useRef(false);

  // load once
  useEffect(() => {
    (async () => {
      try {
        const m = await AsyncStorage.getItem(THEME_KEY);
        if (m === 'dark' || m === 'light') setMode(m);
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) {
          const d = JSON.parse(raw);
          if (d.users) setUsers(d.users);
          if (d.txns) setTxns(d.txns);
          if (d.sessionId) setSessionId(d.sessionId);
        }
      } catch (e) {}
      loaded.current = true;
      setReady(true);
    })();
  }, []);

  // persist on change (local storage only - no back end)
  useEffect(() => {
    if (!loaded.current) return;
    AsyncStorage.setItem(KEY, JSON.stringify({ users, txns, sessionId })).catch(() => {});
  }, [users, txns, sessionId]);

  const toggleTheme = useCallback(() => {
    setMode((m) => {
      const next = m === 'dark' ? 'light' : 'dark';
      AsyncStorage.setItem(THEME_KEY, next).catch(() => {});
      return next;
    });
  }, []);

  const user = useMemo(() => users.find((u) => u.id === sessionId) || null, [users, sessionId]);
  const myTxns = useMemo(() => (user ? txns.filter((t) => t.userId === user.id) : []), [txns, user]);

  // ---- savings / spending goals (per user) ----
  const goals = useMemo(() => ({ ...DEFAULT_GOALS, ...(user?.goals || {}) }), [user]);
  const updateGoals = useCallback(
    (patch) => {
      if (!user) return;
      setUsers((p) => p.map((u) => (u.id === user.id ? { ...u, goals: { ...DEFAULT_GOALS, ...(u.goals || {}), ...patch } } : u)));
    },
    [user]
  );

  // ---- alerts ----
  const showAlert = useCallback((a) => setAlertState({ type: 'info', ...a }), []);
  const hideAlert = useCallback(() => setAlertState(null), []);
  const confirm = useCallback(
    ({ title, message, confirmText = 'Yes', onConfirm, danger }) =>
      setAlertState({
        type: danger ? 'danger' : 'info',
        title,
        message,
        actions: [
          { text: 'Cancel', style: 'cancel' },
          { text: confirmText, style: danger ? 'danger' : 'primary', onPress: onConfirm },
        ],
      }),
    []
  );

  // ---- auth ----
  const signUp = useCallback(
    ({ role, name, email, phone, password, code }) => {
      const mail = email.trim().toLowerCase();
      if (users.some((u) => u.email === mail)) return { ok: false, field: 'email', error: 'An account with this email already exists' };
      if (role === 'admin' && code.trim() !== ADMIN_CODE) return { ok: false, field: 'code', error: 'Invalid admin access code' };
      const id = `${role}-${Date.now()}`;
      const nu = { id, role, name: name.trim(), email: mail, phone: phone.trim(), password, createdAt: new Date().toISOString() };
      setUsers((p) => [...p, nu]);
      if (role === 'customer') setTxns((p) => [...p, ...sampleTransactions(id)]);
      setSessionId(id);
      return { ok: true, user: nu };
    },
    [users]
  );

  const signIn = useCallback(
    ({ role, email, password }) => {
      const u = users.find((x) => x.email === email.trim().toLowerCase());
      if (!u) return { ok: false, field: 'email', error: 'No account found for this email' };
      if (u.role !== role) return { ok: false, field: 'email', error: `This account is a ${u.role}. Switch the role above.` };
      if (u.password !== password) return { ok: false, field: 'password', error: 'Incorrect password' };
      setSessionId(u.id);
      return { ok: true, user: u };
    },
    [users]
  );

  const signOut = useCallback(() => setSessionId(null), []);

  // ---- forgot password (email + phone must match the stored account) ----
  const findForReset = useCallback(
    ({ email, phone }) => users.find((u) => u.email === email.trim().toLowerCase() && u.phone === phone.trim()) || null,
    [users]
  );
  const resetPassword = useCallback((id, password) => {
    setUsers((p) => p.map((u) => (u.id === id ? { ...u, password } : u)));
  }, []);

  const updateProfile = useCallback(
    (patch) => {
      if (!user) return { ok: false, error: 'Not signed in' };
      if (patch.email && users.some((u) => u.id !== user.id && u.email === patch.email.toLowerCase()))
        return { ok: false, field: 'email', error: 'This email is used by another account' };
      setUsers((p) => p.map((u) => (u.id === user.id ? { ...u, ...patch, email: (patch.email || u.email).toLowerCase() } : u)));
      return { ok: true };
    },
    [user, users]
  );

  // ---- transactions + personalised alerts ----
  const firstName = user?.name?.split(' ')[0] || 'there';

  const budgetNote = (list, t) => {
    if (t.type !== 'expense') return '';
    const cat = catOf(t.category);
    const d = new Date(t.date);
    const spent = list
      .filter((x) => x.type === 'expense' && x.category === t.category && inMonth(x, d.getFullYear(), d.getMonth()))
      .reduce((s, x) => s + x.amount, 0);
    if (cat.budget && spent > cat.budget) return `\n\n⚠️ Heads up! You have crossed your ${cat.name} budget (${money(spent)} of ${money(cat.budget)}).`;
    if (cat.budget && spent > cat.budget * 0.8) return `\n\n⚠️ You have used ${Math.round((spent / cat.budget) * 100)}% of your ${cat.name} budget.`;
    return '';
  };

  const addTxn = useCallback(
    (data) => {
      const t = { id: `t-${Date.now()}`, userId: user.id, ...data };
      const next = [...txns, t];
      setTxns(next);
      const mine = next.filter((x) => x.userId === user.id);
      const bal = summarize(mine).balance;
      showAlert({
        type: t.type === 'income' ? 'success' : 'info',
        title: `Transaction added, ${firstName}!`,
        message: `Your ${t.type} of ${money(t.amount)} in ${catOf(t.category).name} was recorded. Your balance is now ${money(bal)}.${budgetNote(mine, t)}`,
      });
    },
    [txns, user, firstName, showAlert]
  );

  const updateTxn = useCallback(
    (id, data) => {
      const next = txns.map((t) => (t.id === id ? { ...t, ...data } : t));
      setTxns(next);
      const mine = next.filter((x) => x.userId === user.id);
      showAlert({
        type: 'info',
        title: `Transaction updated, ${firstName}`,
        message: `${catOf(data.category).name} is now ${money(data.amount)} (${data.type}). Your new balance is ${money(summarize(mine).balance)}.${budgetNote(mine, { ...data })}`,
      });
    },
    [txns, user, firstName, showAlert]
  );

  const deleteTxn = useCallback(
    (id) => {
      const t = txns.find((x) => x.id === id);
      if (!t) return;
      const next = txns.filter((x) => x.id !== id);
      setTxns(next);
      const mine = next.filter((x) => x.userId === user.id);
      showAlert({
        type: 'danger',
        title: `Transaction deleted, ${firstName}`,
        message: `The ${money(t.amount)} ${t.type} (${catOf(t.category).name}) has been removed. Your balance is now ${money(summarize(mine).balance)}.`,
      });
    },
    [txns, user, firstName, showAlert]
  );

  applyTheme(mode); // must run before children render

  const value = {
    mode, toggleTheme, goals, updateGoals,
    ready, users, txns, user, myTxns, firstName,
    signUp, signIn, signOut, updateProfile, findForReset, resetPassword,
    addTxn, updateTxn, deleteTxn,
    alertState, showAlert, hideAlert, confirm,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
