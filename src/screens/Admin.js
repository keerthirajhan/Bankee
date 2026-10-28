import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { C, createStyles } from '../theme';
import { AnimatedIn, Avatar, Card, Empty, Header, Input, Screen } from '../ui';
import { useApp } from '../AppContext';
import { money, summarize } from '../utils';

// Admin: list of registered customers with their activity
export default function AdminUsersScreen({ navigation }) {
  const { users, txns } = useApp();
  const [q, setQ] = useState('');
  const list = users
    .filter((u) => u.role === 'customer')
    .filter((u) => (u.name + u.email).toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <Screen>
      <Header title="Customers" subtitle={`${list.length} found`} navigation={navigation} />
      <Input icon="search" placeholder="Search by name or email" value={q} onChangeText={setQ} />
      {list.length === 0 && <Empty icon="people-outline" text="No customers match your search." />}
      {list.map((u, i) => {
        const mine = txns.filter((t) => t.userId === u.id);
        const sum = summarize(mine);
        return (
          <AnimatedIn key={u.id} delay={i * 60}>
            <Card style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Avatar name={u.name} size={46} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={s.n}>{u.name}</Text>
                  <Text style={s.e}>{u.email}</Text>
                </View>
                <Text style={s.e}>{mine.length} txns</Text>
              </View>
              <View style={s.stats}>
                <View><Text style={s.e}>Income</Text><Text style={[s.v, { color: C.mint }]}>{money(sum.income)}</Text></View>
                <View><Text style={s.e}>Expenses</Text><Text style={[s.v, { color: C.coral }]}>{money(sum.expense)}</Text></View>
                <View><Text style={s.e}>Balance</Text><Text style={s.v}>{money(sum.balance)}</Text></View>
              </View>
            </Card>
          </AnimatedIn>
        );
      })}
    </Screen>
  );
}

const s = createStyles(() => ({
  n: { color: C.text, fontWeight: '800', fontSize: 15 },
  e: { color: C.sub, fontSize: 12 },
  v: { color: C.text, fontWeight: '800', marginTop: 2 },
  stats: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: C.border },
}));
