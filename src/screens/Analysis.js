import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { C, createStyles } from '../theme';
import { AnimatedIn, Bars, Card, CatIcon, Empty, Header, MonthSwitcher, ProgressBar, Screen, SectionTitle } from '../ui';
import { useApp } from '../AppContext';
import { MONTHS, byCategory, inMonth, money, summarize } from '../utils';

// Shared by Admin (all customers' data) and Customer (own data)
export default function AnalysisScreen({ navigation }) {
  const { user, txns, myTxns, users } = useApp();
  const admin = user.role === 'admin';
  const now = new Date();
  const [ym, setYm] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const data = admin ? txns : myTxns;
  const month = data.filter((t) => inMonth(t, ym.y, ym.m));
  const sum = summarize(month);
  const cats = byCategory(month);
  const totalSpent = cats.reduce((s, c) => s + c.total, 0);
  const rate = sum.income > 0 ? Math.round(((sum.income - sum.expense) / sum.income) * 100) : 0;

  const trend = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(ym.y, ym.m - 5 + i, 1);
    const ts = data.filter((t) => inMonth(t, d.getFullYear(), d.getMonth()));
    const x = summarize(ts);
    return { label: MONTHS[d.getMonth()].slice(0, 3), income: x.income, expense: x.expense };
  });

  const customers = users.filter((u) => u.role === 'customer');
  const top = customers
    .map((u) => ({ u, exp: summarize(txns.filter((t) => t.userId === u.id && inMonth(t, ym.y, ym.m))).expense }))
    .sort((a, b) => b.exp - a.exp)
    .slice(0, 3);

  return (
    <Screen>
      <Header title="Analysis" subtitle={admin ? 'All customers combined' : 'Where your money goes'} navigation={navigation} />
      <MonthSwitcher year={ym.y} month={ym.m} onChange={(y, m) => setYm({ y, m })} />

      <AnimatedIn delay={80}>
        <View style={s.row}>
          <Card style={s.kpi}><Text style={s.kl}>Income</Text><Text style={[s.kv, { color: C.mint }]}>{money(sum.income)}</Text></Card>
          <Card style={s.kpi}><Text style={s.kl}>Expenses</Text><Text style={[s.kv, { color: C.coral }]}>{money(sum.expense)}</Text></Card>
        </View>
        <View style={s.row}>
          <Card style={s.kpi}><Text style={s.kl}>Net savings</Text><Text style={[s.kv, { color: sum.balance >= 0 ? C.text : C.coral }]}>{money(sum.balance)}</Text></Card>
          <Card style={s.kpi}><Text style={s.kl}>Savings rate</Text><Text style={[s.kv, { color: C.amber }]}>{rate}%</Text></Card>
        </View>
      </AnimatedIn>

      <SectionTitle>6-month spending trend</SectionTitle>
      <AnimatedIn delay={160}>
        <Card><Bars data={trend.map((t) => ({ label: t.label, value: t.expense }))} highlight={5} /></Card>
      </AnimatedIn>

      <SectionTitle>Spending by category</SectionTitle>
      {cats.length === 0 ? (
        <Empty text="No expenses recorded for this month." />
      ) : (
        cats.map((c, i) => (
          <AnimatedIn key={c.cat.id} delay={i * 70}>
            <Card style={{ marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <CatIcon cat={c.cat} size={38} />
                <Text style={s.cn}>{c.cat.name}</Text>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={s.cv}>{money(c.total)}</Text>
                  <Text style={s.cp}>{Math.round((c.total / totalSpent) * 100)}%</Text>
                </View>
              </View>
              <ProgressBar pct={(c.total / totalSpent) * 100} color={c.cat.color} delay={i * 70} />
            </Card>
          </AnimatedIn>
        ))
      )}

      {admin && (
        <>
          <SectionTitle>Top spenders this month</SectionTitle>
          {top.map((t, i) => (
            <Card key={t.u.id} style={{ marginBottom: 10, flexDirection: 'row', alignItems: 'center' }}>
              <Text style={s.rank}>{i + 1}</Text>
              <View style={{ flex: 1 }}><Text style={s.cn2}>{t.u.name}</Text><Text style={s.cp}>{t.u.email}</Text></View>
              <Text style={s.cv}>{money(t.exp)}</Text>
            </Card>
          ))}
          <Text style={[s.cp, { textAlign: 'center', marginTop: 6 }]}>{customers.length} registered customer{customers.length === 1 ? '' : 's'}</Text>
        </>
      )}
    </Screen>
  );
}

const s = createStyles(() => ({
  row: { flexDirection: 'row', gap: 12, marginTop: 12 },
  kpi: { flex: 1 },
  kl: { color: C.sub, fontSize: 12 },
  kv: { color: C.text, fontSize: 20, fontWeight: '900', marginTop: 4 },
  cn: { flex: 1, color: C.text, fontWeight: '700', marginLeft: 12 },
  cn2: { color: C.text, fontWeight: '700' },
  cv: { color: C.text, fontWeight: '800' },
  cp: { color: C.sub, fontSize: 12 },
  rank: { color: C.primary2, fontSize: 22, fontWeight: '900', width: 34 },
}));
