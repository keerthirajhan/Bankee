import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, GRADIENT, GRADIENT_MINT, createStyles } from '../theme';
import { AnimatedIn, Bars, Card, Confetti, CountUp, Empty, Header, Press, ProgressBar, Screen, SectionTitle, Segmented, TxItem, Avatar } from '../ui';
import { useApp } from '../AppContext';
import { buildReport, inMonth, money, summarize } from '../utils';
import { LinearGradient } from 'expo-linear-gradient';

const PERIODS = [{ label: 'Daily', value: 'daily' }, { label: 'Weekly', value: 'weekly' }, { label: 'Monthly', value: 'monthly' }];

export default function HomeScreen({ navigation }) {
  const { user, myTxns, firstName, goals, updateGoals, showAlert } = useApp();
  const [period, setPeriod] = useState('daily');
  const [burst, setBurst] = useState(0);

  // monthly savings goal + spending limit
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${now.getMonth() + 1}`;
  const month = summarize(myTxns.filter((t) => inMonth(t, now.getFullYear(), now.getMonth())));
  const saved = Math.max(month.income - month.expense, 0);
  const savePct = (saved / goals.savings) * 100;
  const spendPct = (month.expense / goals.spend) * 100;
  const reached = saved >= goals.savings;

  // celebrate once per month when the savings goal is reached
  useEffect(() => {
    if (reached && goals.celebrated !== monthKey) {
      setBurst(Date.now());
      updateGoals({ celebrated: monthKey });
      setTimeout(() => showAlert({ type: 'success', title: `Goal reached, ${firstName}! 🎉`, message: `You have saved ${money(saved)} this month - your goal of ${money(goals.savings)} is complete. Great discipline!` }), 900);
    }
  }, [reached, goals.celebrated, monthKey]);

  const all = summarize(myTxns);
  const spentPct = all.income > 0 ? (all.expense / all.income) * 100 : 0;
  const rep = buildReport(myTxns, period);
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const recent = [...myTxns].sort((a, b) => +new Date(b.date) - +new Date(a.date)).slice(0, 4);

  return (
    <View style={{ flex: 1, backgroundColor: C.band }}>
      <Screen top={
        <AnimatedIn delay={80}>
          <View style={s.row}>
            <View style={{ flex: 1 }}>
              <Text style={s.cardLabel}><Ionicons name="wallet-outline" size={13} /> Total balance</Text>
              <CountUp value={all.balance} style={s.balance} />
            </View>
            <View style={s.divider} />
            <View style={{ flex: 1, paddingLeft: 16 }}>
              <Text style={s.cardLabel}><Ionicons name="trending-down" size={13} /> Total expense</Text>
              <CountUp value={all.expense} style={[s.balance, { color: C.expBand }]} />
            </View>
          </View>
          <View style={s.goal}>
            <Text style={s.goalPct}>{Math.min(Math.round(spentPct), 100)}%</Text>
            <View style={{ flex: 1, marginHorizontal: 10 }}><ProgressBar pct={spentPct} color={C.text} /></View>
            <Text style={s.goalAmt}>{money(all.income)}</Text>
          </View>
          <Text style={s.goalNote}><Ionicons name="checkbox" size={13} /> {spentPct > 80 ? 'Careful, you have spent most of your income' : `${Math.round(spentPct)}% of your income spent, looks good.`}</Text>
        </AnimatedIn>
      }>
        <Header title={`Hi, ${firstName} 👋`} subtitle={greet} navigation={navigation} right={<Pressable onPress={() => navigation.navigate('ProfileTab')}><Avatar name={user.name} size={40} /></Pressable>} />

        <SectionTitle right={<Pressable onPress={() => navigation.navigate('Goals')}><Text style={{ color: C.primary2, fontWeight: '700' }}>Edit goals</Text></Pressable>}>Monthly goals</SectionTitle>
        <AnimatedIn delay={120}>
          <Card>
            <Pressable onPress={() => reached && setBurst(Date.now())}>
              <View style={s.gHead}>
                <View style={s.gTitle}><Ionicons name={reached ? 'trophy' : 'flag'} size={16} color={reached ? C.amber : C.primary2} /><Text style={s.gName}>Savings goal{reached ? ' - reached! 🎉' : ''}</Text></View>
                <Text style={s.gVal}>{money(saved)} / {money(goals.savings)}</Text>
              </View>
              <ProgressBar pct={savePct} color={C.mint} warn={false} />
              <Text style={s.gNote}>{reached ? 'Goal complete - tap to celebrate again' : `${money(goals.savings - saved)} to go (${Math.round(savePct)}%)`}</Text>
            </Pressable>
            <View style={s.gSep} />
            <View style={s.gHead}>
              <View style={s.gTitle}><Ionicons name="speedometer" size={16} color={spendPct > 100 ? C.coral : C.primary2} /><Text style={s.gName}>Spending limit</Text></View>
              <Text style={s.gVal}>{money(month.expense)} / {money(goals.spend)}</Text>
            </View>
            <ProgressBar pct={spendPct} color={spendPct > 80 ? C.amber : C.primary2} />
            <Text style={[s.gNote, spendPct > 100 && { color: C.coral }]}>{spendPct > 100 ? `Over the limit by ${money(month.expense - goals.spend)}` : `${money(goals.spend - month.expense)} left this month`}</Text>
          </Card>
        </AnimatedIn>

        <SectionTitle>Reports</SectionTitle>
        <AnimatedIn delay={160}>
          <Segmented options={PERIODS} value={period} onChange={setPeriod} />
          <Card style={{ marginTop: 14 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <View><Text style={s.rl}>{rep.label} · Spent</Text><Text style={[s.rv, { color: C.coral }]}>{money(rep.expense)}</Text></View>
              <View style={{ alignItems: 'flex-end' }}><Text style={s.rl}>Earned</Text><Text style={[s.rv, { color: C.mint }]}>{money(rep.income)}</Text></View>
            </View>
            <Text style={s.rl}>Net {rep.balance >= 0 ? 'savings' : 'deficit'}: <Text style={{ color: C.text, fontWeight: '700' }}>{money(rep.balance)}</Text> · {rep.list.length} transaction{rep.list.length === 1 ? '' : 's'}</Text>
            <View style={{ marginTop: 16 }}>
              <Bars key={period} data={rep.bars} color={C.band} highlight={period === 'weekly' ? (new Date().getDay() + 6) % 7 : period === 'daily' ? Math.floor(new Date().getHours() / 4) : undefined} />
            </View>
          </Card>
        </AnimatedIn>

        <SectionTitle right={<Pressable onPress={() => navigation.navigate('TransactionsTab')}><Text style={{ color: C.primary2, fontWeight: '700' }}>See all</Text></Pressable>}>Recent transactions</SectionTitle>
        {recent.length === 0 ? <Empty text="No transactions yet. Tap + to add one." /> : recent.map((t, i) => <TxItem key={t.id} t={t} index={i} onPress={() => navigation.navigate('AddTransaction', { txnId: t.id })} />)}
      </Screen>

      <Confetti run={burst} />
      <AnimatedIn delay={500} style={s.fabWrap}>
        <Press onPress={() => navigation.navigate('AddTransaction')}>
          <LinearGradient colors={GRADIENT_MINT} style={s.fab}><Ionicons name="add" size={32} color="#fff" /></LinearGradient>
        </Press>
      </AnimatedIn>
    </View>
  );
}

const s = createStyles(() => ({
  gHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  gTitle: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 },
  gName: { color: C.text, fontWeight: '700', fontSize: 14 },
  gVal: { color: C.sub, fontSize: 12, fontWeight: '600' },
  gNote: { color: C.sub, fontSize: 12, marginTop: 6 },
  gSep: { height: 1, backgroundColor: C.border, marginVertical: 14 },
  cardLabel: { color: C.onBand, fontSize: 13, fontWeight: '600' },
  balance: { color: C.text, fontSize: 26, fontWeight: '900', marginTop: 4 },
  row: { flexDirection: 'row', alignItems: 'center' },
  divider: { width: 1, height: 46, backgroundColor: C.text + '55' },
  goal: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.text, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, marginTop: 16 },
  goalPct: { color: C.bg, fontWeight: '800', fontSize: 12 },
  goalAmt: { color: C.bg, fontWeight: '800', fontSize: 12 },
  goalNote: { color: C.text, fontSize: 12, marginTop: 10 },
  rl: { color: C.sub, fontSize: 12 },
  rv: { fontSize: 24, fontWeight: '900', marginTop: 2 },
  fabWrap: { position: 'absolute', right: 22, bottom: 24 },
  fab: { width: 62, height: 62, borderRadius: 31, alignItems: 'center', justifyContent: 'center', shadowColor: C.mint, shadowOpacity: 0.5, shadowRadius: 14, elevation: 8 },
}));
