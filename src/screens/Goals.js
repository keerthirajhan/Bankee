import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { C, createStyles } from '../theme';
import { AnimatedIn, Button, Card, Header, Input, ProgressBar, Screen } from '../ui';
import { useApp } from '../AppContext';
import { inMonth, money, summarize } from '../utils';

// Set the monthly savings goal and monthly spending limit
export default function GoalsScreen({ navigation }) {
  const { goals, updateGoals, myTxns, showAlert, firstName } = useApp();
  const now = new Date();
  const sum = summarize(myTxns.filter((t) => inMonth(t, now.getFullYear(), now.getMonth())));
  const saved = Math.max(sum.income - sum.expense, 0);
  const [f, setF] = useState({ savings: String(goals.savings), spend: String(goals.spend) });
  const [err, setErr] = useState({});
  const set = (k) => (v) => { setF({ ...f, [k]: v }); setErr({ ...err, [k]: undefined }); };

  const save = () => {
    const e = {};
    const chk = (k, label) => {
      if (!f[k].trim()) e[k] = `${label} is required`;
      else if (!/^\d+$/.test(f[k].trim()) || Number(f[k]) <= 0) e[k] = 'Enter a whole number greater than 0';
      else if (Number(f[k]) > 10000000) e[k] = 'Amount is too large';
    };
    chk('savings', 'Savings goal');
    chk('spend', 'Spending limit');
    if (Object.keys(e).length) return setErr(e);
    // a changed target can be celebrated again this month
    updateGoals({ savings: Number(f.savings), spend: Number(f.spend), celebrated: '' });
    showAlert({ type: 'success', title: `Goals saved, ${firstName}!`, message: `You aim to save ${money(f.savings)} and keep spending under ${money(f.spend)} every month.` });
    navigation.goBack();
  };

  return (
    <Screen>
      <Header title="Goals & Savings" subtitle="Plan your month" navigation={navigation} back />
      <AnimatedIn>
        <Card style={{ marginBottom: 20 }}>
          <Text style={s.l}>Saved so far this month</Text>
          <Text style={s.v}>{money(saved)}</Text>
          <View style={{ marginTop: 10 }}><ProgressBar pct={(saved / (Number(f.savings) || goals.savings)) * 100} color={C.mint} warn={false} /></View>
        </Card>
        <Input label="Monthly savings goal (₹)" icon="trophy" keyboardType="number-pad" value={f.savings} onChangeText={set('savings')} error={err.savings} />
        <Input label="Monthly spending limit (₹)" icon="speedometer" keyboardType="number-pad" value={f.spend} onChangeText={set('spend')} error={err.spend} />
        <Text style={s.hint}>Savings = income minus expenses for the month. Reach your goal to unlock a little celebration on the Home screen.</Text>
        <Button title="Save goals" icon="checkmark-circle" onPress={save} />
      </AnimatedIn>
    </Screen>
  );
}

const s = createStyles(() => ({
  l: { color: C.sub, fontSize: 12 },
  v: { color: C.text, fontSize: 28, fontWeight: '900', marginTop: 4 },
  hint: { color: C.sub, fontSize: 12, lineHeight: 18, marginBottom: 18, marginTop: -4 },
}));
