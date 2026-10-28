import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { C, GRADIENT, createStyles } from '../theme';
import { AnimatedIn, Bars, Card, CatIcon, Button, Empty, GradientCard, Header, MonthSwitcher, Press, ProgressBar, Screen, SectionTitle, TxItem, CountUp } from '../ui';
import { useApp } from '../AppContext';
import { CATEGORIES, EXPENSE_CATS, catOf, inMonth, money, summarize } from '../utils';

// ---------- Overall categories ----------
export function CategoriesScreen({ navigation }) {
  const { myTxns } = useApp();
  const now = new Date();
  const month = myTxns.filter((t) => inMonth(t, now.getFullYear(), now.getMonth()));
  const spent = (id) => month.filter((t) => t.category === id && t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const earned = (id) => month.filter((t) => t.category === id && t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const sum = summarize(month);
  const budget = EXPENSE_CATS.reduce((s, c) => s + c.budget, 0);

  return (
    <Screen>
      <Header title="Categories" subtitle="This month overview" navigation={navigation} />
      <AnimatedIn>
        <GradientCard>
          <Text style={{ color: C.onBand }}>Total spent this month</Text>
          <CountUp value={sum.expense} style={{ color: C.text, fontSize: 34, fontWeight: '900', marginVertical: 6 }} />
          <Text style={{ color: C.onBand, marginBottom: 10 }}>of {money(budget)} combined budget</Text>
          <ProgressBar pct={(sum.expense / budget) * 100} color={C.text} />
        </GradientCard>
      </AnimatedIn>

      <SectionTitle>Expense categories</SectionTitle>
      <View style={s.grid}>
        {EXPENSE_CATS.map((c, i) => {
          const v = spent(c.id);
          const pct = (v / c.budget) * 100;
          return (
            <AnimatedIn key={c.id} delay={i * 60} style={s.cell}>
              <Press onPress={() => navigation.navigate('CategoryDetails', { id: c.id })}>
                <Card>
                  <CatIcon cat={c} />
                  <Text style={s.name} numberOfLines={1}>{c.name}</Text>
                  <Text style={s.val}>{money(v)}</Text>
                  <Text style={[s.sub, pct > 100 && { color: C.coral }]}>{Math.round(pct)}% of {money(c.budget)}</Text>
                  <View style={{ marginTop: 8 }}><ProgressBar pct={pct} color={c.color} delay={i * 60} /></View>
                </Card>
              </Press>
            </AnimatedIn>
          );
        })}
      </View>

      <SectionTitle>Income sources</SectionTitle>
      <View style={s.grid}>
        {CATEGORIES.filter((c) => c.type === 'income').map((c, i) => (
          <AnimatedIn key={c.id} delay={i * 60} style={s.cell}>
            <Press onPress={() => navigation.navigate('CategoryDetails', { id: c.id })}>
              <Card>
                <CatIcon cat={c} />
                <Text style={s.name} numberOfLines={1}>{c.name}</Text>
                <Text style={[s.val, { color: C.mint }]}>{money(earned(c.id))}</Text>
                <Text style={s.sub}>this month</Text>
              </Card>
            </Press>
          </AnimatedIn>
        ))}
      </View>
    </Screen>
  );
}

// ---------- Category details ----------
export function CategoryDetailsScreen({ navigation, route }) {
  const { myTxns } = useApp();
  const cat = catOf(route.params.id);
  const now = new Date();
  const [ym, setYm] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const all = myTxns.filter((t) => t.category === cat.id);
  const month = all.filter((t) => inMonth(t, ym.y, ym.m)).sort((a, b) => +new Date(b.date) - +new Date(a.date));
  const total = month.reduce((s, t) => s + t.amount, 0);
  const pct = cat.budget ? (total / cat.budget) * 100 : 0;
  const avg = month.length ? total / month.length : 0;
  const biggest = month.reduce((m, t) => Math.max(m, t.amount), 0);

  const weeks = [0, 1, 2, 3, 4].map((w) => ({
    label: `W${w + 1}`,
    value: month.filter((t) => Math.min(Math.floor((new Date(t.date).getDate() - 1) / 7), 4) === w).reduce((s, t) => s + t.amount, 0),
  }));

  return (
    <Screen>
      <Header title={cat.name} subtitle={cat.type === 'expense' ? 'Category details' : 'Income source details'} navigation={navigation} back />
      <MonthSwitcher year={ym.y} month={ym.m} onChange={(y, m) => setYm({ y, m })} />
      <AnimatedIn delay={60}>
        <Card style={{ marginTop: 14, alignItems: 'center' }}>
          <CatIcon cat={cat} size={64} />
          <CountUp value={total} style={{ color: cat.type === 'income' ? C.mint : C.text, fontSize: 32, fontWeight: '900', marginTop: 12 }} />
          <Text style={{ color: C.sub, marginTop: 2 }}>{cat.type === 'income' ? 'earned' : 'spent'} in {month.length} transaction{month.length === 1 ? '' : 's'}</Text>
          {cat.budget > 0 && (
            <View style={{ width: '100%', marginTop: 16 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ color: C.sub, fontSize: 12 }}>Budget {money(cat.budget)}</Text>
                <Text style={{ color: pct > 100 ? C.coral : C.text, fontSize: 12, fontWeight: '700' }}>{pct > 100 ? `Over by ${money(total - cat.budget)}` : `${money(cat.budget - total)} left`}</Text>
              </View>
              <ProgressBar pct={pct} color={cat.color} />
            </View>
          )}
        </Card>
      </AnimatedIn>

      <AnimatedIn delay={140}>
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
          <Card style={{ flex: 1 }}><Text style={s.sub}>Average</Text><Text style={s.val}>{money(avg)}</Text></Card>
          <Card style={{ flex: 1 }}><Text style={s.sub}>Largest</Text><Text style={s.val}>{money(biggest)}</Text></Card>
        </View>
      </AnimatedIn>

      <SectionTitle>Weekly breakdown</SectionTitle>
      <Card><Bars data={weeks} color={cat.color} /></Card>

      <SectionTitle>Transactions</SectionTitle>
      {month.length === 0 ? <Empty text={`No ${cat.name} transactions this month.`} /> : month.map((t, i) => <TxItem key={t.id} t={t} index={i} onPress={() => navigation.getParent()?.navigate('TransactionsTab', { screen: 'AddTransaction', params: { txnId: t.id } })} />)}
      <Button title={`Add ${cat.type === 'income' ? 'income' : 'expense'}`} icon="add-circle" style={{ marginTop: 10 }}
        onPress={() => navigation.getParent()?.navigate('TransactionsTab', { screen: 'AddTransaction', params: { category: cat.id } })} />
    </Screen>
  );
}

const s = createStyles(() => ({
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 },
  cell: { width: '50%', padding: 6 },
  name: { color: C.text, fontWeight: '700', marginTop: 10 },
  val: { color: C.text, fontSize: 18, fontWeight: '900', marginTop: 4 },
  sub: { color: C.sub, fontSize: 12, marginTop: 2 },
}));
