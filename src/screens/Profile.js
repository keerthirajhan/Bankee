import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, createStyles } from '../theme';
import { AnimatedIn, Avatar, Button, Card, Header, Input, Screen, SectionTitle } from '../ui';
import { useApp } from '../AppContext';
import { EMAIL_RE, MONTHS, PHONE_RE, money, summarize } from '../utils';

const Row = ({ icon, label, value }) => (
  <View style={s.row}>
    <View style={s.ri}><Ionicons name={icon} size={18} color={C.primary2} /></View>
    <View style={{ flex: 1 }}><Text style={s.rl}>{label}</Text><Text style={s.rv}>{value}</Text></View>
  </View>
);

// ---------- Profile (customer) ----------
export function ProfileScreen({ navigation }) {
  const { user, myTxns, signOut, confirm } = useApp();
  const sum = summarize(myTxns);
  const since = new Date(user.createdAt);
  return (
    <Screen>
      <Header title="My Profile" navigation={navigation} />
      <AnimatedIn>
        <View style={{ alignItems: 'center', marginVertical: 10 }}>
          <Avatar name={user.name} size={96} />
          <Text style={s.name}>{user.name}</Text>
          <View style={s.badge}><Text style={s.badgeT}>CUSTOMER</Text></View>
        </View>
      </AnimatedIn>
      <AnimatedIn delay={120}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Card style={s.stat}><Text style={s.sv}>{myTxns.length}</Text><Text style={s.sl}>Transactions</Text></Card>
          <Card style={s.stat}><Text style={[s.sv, { color: C.mint }]}>{money(sum.income)}</Text><Text style={s.sl}>Income</Text></Card>
          <Card style={s.stat}><Text style={[s.sv, { color: C.coral }]}>{money(sum.expense)}</Text><Text style={s.sl}>Spent</Text></Card>
        </View>
      </AnimatedIn>
      <SectionTitle>Account details</SectionTitle>
      <AnimatedIn delay={200}>
        <Card>
          <Row icon="mail" label="Email" value={user.email} />
          <Row icon="call" label="Mobile" value={user.phone} />
          <Row icon="calendar" label="Member since" value={`${MONTHS[since.getMonth()]} ${since.getFullYear()}`} />
        </Card>
      </AnimatedIn>
      <Button title="Edit Profile" icon="create" style={{ marginTop: 22 }} onPress={() => navigation.navigate('EditProfile')} />
      <Button title="Sign out" icon="log-out" variant="danger" style={{ marginTop: 12 }}
        onPress={() => confirm({ title: 'Sign out?', message: `See you soon, ${user.name.split(' ')[0]}!`, confirmText: 'Sign out', danger: true, onConfirm: signOut })} />
    </Screen>
  );
}

// ---------- Edit profile ----------
export function EditProfileScreen({ navigation }) {
  const { user, updateProfile, showAlert, firstName } = useApp();
  const [f, setF] = useState({ name: user.name, email: user.email, phone: user.phone, password: '', confirm: '' });
  const [err, setErr] = useState({});
  const set = (k) => (v) => { setF({ ...f, [k]: v }); setErr({ ...err, [k]: undefined }); };

  const save = () => {
    const e = {};
    if (f.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    else if (!/^[A-Za-z .'-]+$/.test(f.name.trim())) e.name = 'Name can contain only letters';
    if (!EMAIL_RE.test(f.email.trim())) e.email = 'Enter a valid email address';
    if (!PHONE_RE.test(f.phone.trim())) e.phone = 'Enter a valid 10-digit mobile number';
    if (f.password) {
      if (f.password.length < 6 || !/\d/.test(f.password)) e.password = 'Min 6 characters including a number';
      if (f.confirm !== f.password) e.confirm = 'Passwords do not match';
    }
    if (Object.keys(e).length) return setErr(e);
    const patch = { name: f.name.trim(), email: f.email.trim(), phone: f.phone.trim() };
    if (f.password) patch.password = f.password;
    const r = updateProfile(patch);
    if (!r.ok) return setErr({ [r.field]: r.error });
    showAlert({ type: 'success', title: 'Profile updated', message: `Looks good, ${patch.name.split(' ')[0]}! Your profile details have been saved.` });
    navigation.goBack();
  };

  return (
    <Screen>
      <Header title="Edit Profile" subtitle="Update your personal details" navigation={navigation} back />
      <AnimatedIn>
        <View style={{ alignItems: 'center', marginBottom: 22 }}><Avatar name={f.name || user.name} size={84} /></View>
        <Input label="Full name" icon="person" autoCapitalize="words" value={f.name} onChangeText={set('name')} error={err.name} />
        <Input label="Email" icon="mail" keyboardType="email-address" value={f.email} onChangeText={set('email')} error={err.email} />
        <Input label="Mobile number" icon="call" keyboardType="phone-pad" maxLength={10} value={f.phone} onChangeText={set('phone')} error={err.phone} />
        <Text style={s.hint}>Leave password blank to keep the current one</Text>
        <Input label="New password" icon="lock-closed" secure placeholder="Optional" value={f.password} onChangeText={set('password')} error={err.password} />
        <Input label="Confirm new password" icon="shield-checkmark" secure placeholder="Optional" value={f.confirm} onChangeText={set('confirm')} error={err.confirm} />
        <Button title="Save changes" icon="checkmark-circle" onPress={save} style={{ marginTop: 6 }} />
      </AnimatedIn>
    </Screen>
  );
}

const s = createStyles(() => ({
  name: { color: C.text, fontSize: 24, fontWeight: '900', marginTop: 12 },
  badge: { backgroundColor: C.primary + '33', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10, marginTop: 8 },
  badgeT: { color: C.primary2, fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  stat: { flex: 1, alignItems: 'center', paddingHorizontal: 6 },
  sv: { color: C.text, fontSize: 15, fontWeight: '900' },
  sl: { color: C.sub, fontSize: 11, marginTop: 3 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  ri: { width: 38, height: 38, borderRadius: 12, backgroundColor: C.card2, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  rl: { color: C.sub, fontSize: 12 },
  rv: { color: C.text, fontWeight: '600', marginTop: 1 },
  hint: { color: C.sub, fontSize: 12, marginBottom: 10 },
}));
