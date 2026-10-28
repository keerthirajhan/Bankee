import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, GRADIENT_HERO, createStyles } from '../theme';
import { AnimatedIn, Button, Input, Segmented } from '../ui';
import Illustration from '../illustrations';
import { useApp } from '../AppContext';
import { EMAIL_RE, PHONE_RE } from '../utils';

const ROLES = [{ label: 'Customer', value: 'customer' }, { label: 'Admin', value: 'admin' }];

// ---------- Home screen: options to Sign up & Sign in (Admin and Customer) ----------
export function WelcomeScreen({ navigation }) {
  const [role, setRole] = useState('customer');
  const float = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(float, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: Platform.OS !== 'web' }),
      ])
    ).start();
  }, []);
  return (
    <LinearGradient colors={GRADIENT_HERO} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, padding: 24, justifyContent: 'space-between' }}>
        <View style={{ alignItems: 'center', marginTop: 8 }}>
          <Animated.View style={{ transform: [{ translateY: float.interpolate({ inputRange: [0, 1], outputRange: [0, -12] }) }] }}>
            <LinearGradient colors={['#4A2F68', '#2F1C45']} style={s.logo}>
              <Ionicons name="wallet" size={56} color="#fff" />
            </LinearGradient>
          </Animated.View>
          <AnimatedIn delay={150}><Text style={s.title}>Bänkee</Text></AnimatedIn>
          <AnimatedIn delay={300}>
            <Text style={s.tag}>Track spending, understand your money{'\n'}and reach your savings goals.</Text>
          </AnimatedIn>
        </View>

        <AnimatedIn delay={350}>
          <Illustration variant="dashboard" height={200} />
        </AnimatedIn>

        <AnimatedIn delay={450}>
          <Text style={s.who}>I am an</Text>
          <Segmented options={ROLES} value={role} onChange={setRole} style={{ marginBottom: 18 }} />
          <Button title={`Sign In as ${role === 'admin' ? 'Admin' : 'Customer'}`} icon="log-in" onPress={() => navigation.navigate('SignIn', { role })} />
          <Button title={`Sign Up as ${role === 'admin' ? 'Admin' : 'Customer'}`} icon="person-add" variant="outline" style={{ marginTop: 12 }} onPress={() => navigation.navigate('SignUp', { role })} />
          <Text style={s.hint}>Demo → customer: demo@budget.app / demo123{'\n'}admin: admin@budget.app / admin123</Text>
        </AnimatedIn>
      </SafeAreaView>
    </LinearGradient>
  );
}

function AuthShell({ title, subtitle, navigation, children }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 24 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Pressable style={s.back} onPress={() => navigation.goBack()}><Ionicons name="chevron-back" size={22} color={C.text} /></Pressable>
          <AnimatedIn><Text style={s.h1}>{title}</Text><Text style={s.sub}>{subtitle}</Text></AnimatedIn>
          <AnimatedIn delay={150}>{children}</AnimatedIn>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ---------- Sign in ----------
export function SignInScreen({ navigation, route }) {
  const { signIn } = useApp();
  const role = route.params?.role || 'customer';
  const [f, setF] = useState({ email: '', password: '' });
  const [err, setErr] = useState({});
  const set = (k) => (v) => { setF({ ...f, [k]: v }); setErr({ ...err, [k]: undefined }); };

  const submit = () => {
    const e = {};
    if (!f.email.trim()) e.email = 'Email is required';
    else if (!EMAIL_RE.test(f.email.trim())) e.email = 'Enter a valid email address';
    if (!f.password) e.password = 'Password is required';
    else if (f.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (Object.keys(e).length) return setErr(e);
    const r = signIn({ role, ...f });
    if (!r.ok) setErr({ [r.field]: r.error });
  };

  return (
    <AuthShell navigation={navigation} title={`Welcome back, ${role === 'admin' ? 'Admin' : 'Customer'}`} subtitle="Sign in to continue to your dashboard">
      <Input label="Email" icon="mail" placeholder="you@example.com" keyboardType="email-address" value={f.email} onChangeText={set('email')} error={err.email} />
      <Input label="Password" icon="lock-closed" placeholder="••••••" secure value={f.password} onChangeText={set('password')} error={err.password} onSubmitEditing={submit} />
      <Pressable onPress={() => navigation.navigate('ForgotPassword', { role })} style={{ alignSelf: 'flex-end', marginTop: -4, marginBottom: 6 }}>
        <Text style={{ color: C.primary2, fontWeight: '700', fontSize: 13 }}>Forgot password?</Text>
      </Pressable>
      <Button title="Sign In" icon="log-in" onPress={submit} style={{ marginTop: 8 }} />
      <Pressable onPress={() => navigation.replace('SignUp', { role })}>
        <Text style={s.link}>New here? <Text style={{ color: C.primary2, fontWeight: '700' }}>Create an account</Text></Text>
      </Pressable>
    </AuthShell>
  );
}

// ---------- Sign up ----------
export function SignUpScreen({ navigation, route }) {
  const { signUp } = useApp();
  const role = route.params?.role || 'customer';
  const [f, setF] = useState({ name: '', email: '', phone: '', password: '', confirm: '', code: '' });
  const [err, setErr] = useState({});
  const set = (k) => (v) => { setF({ ...f, [k]: v }); setErr({ ...err, [k]: undefined }); };

  const submit = () => {
    const e = {};
    if (f.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    else if (!/^[A-Za-z .'-]+$/.test(f.name.trim())) e.name = 'Name can contain only letters';
    if (!EMAIL_RE.test(f.email.trim())) e.email = 'Enter a valid email address';
    if (!PHONE_RE.test(f.phone.trim())) e.phone = 'Enter a valid 10-digit mobile number';
    if (f.password.length < 6) e.password = 'Password must be at least 6 characters';
    else if (!/\d/.test(f.password)) e.password = 'Password must contain at least one number';
    if (f.confirm !== f.password) e.confirm = 'Passwords do not match';
    if (role === 'admin' && !f.code.trim()) e.code = 'Admin access code is required';
    if (Object.keys(e).length) return setErr(e);
    const r = signUp({ role, ...f });
    if (!r.ok) setErr({ [r.field]: r.error });
  };

  return (
    <AuthShell navigation={navigation} title={role === 'admin' ? 'Admin sign up' : 'Create account'} subtitle={role === 'admin' ? 'Use the access code issued by your institution' : 'Start tracking your money in a minute'}>
      <Illustration variant="signup" height={170} />
      <Input label="Full name" icon="person" placeholder="Your name" autoCapitalize="words" value={f.name} onChangeText={set('name')} error={err.name} />
      <Input label="Email" icon="mail" placeholder="you@example.com" keyboardType="email-address" value={f.email} onChangeText={set('email')} error={err.email} />
      <Input label="Mobile number" icon="call" placeholder="10-digit number" keyboardType="phone-pad" maxLength={10} value={f.phone} onChangeText={set('phone')} error={err.phone} />
      <Input label="Password" icon="lock-closed" placeholder="Min 6 chars with a number" secure value={f.password} onChangeText={set('password')} error={err.password} />
      <Input label="Confirm password" icon="shield-checkmark" placeholder="Repeat password" secure value={f.confirm} onChangeText={set('confirm')} error={err.confirm} />
      {role === 'admin' && <Input label="Admin access code" icon="key" placeholder="ADMIN2026" autoCapitalize="characters" value={f.code} onChangeText={set('code')} error={err.code} />}
      <Button title="Create Account" icon="person-add" onPress={submit} style={{ marginTop: 8 }} />
      <Pressable onPress={() => navigation.replace('SignIn', { role })}>
        <Text style={s.link}>Already registered? <Text style={{ color: C.primary2, fontWeight: '700' }}>Sign in</Text></Text>
      </Pressable>
    </AuthShell>
  );
}

// ---------- Forgot password: verify details -> simulated OTP -> new password ----------
const OTP_LIFE = 120; // seconds the code stays valid
const RESEND_AFTER = 30;

export function ForgotPasswordScreen({ navigation, route }) {
  const { findForReset, resetPassword, showAlert } = useApp();
  const [step, setStep] = useState('verify'); // verify | otp | new
  const [f, setF] = useState({ email: '', phone: '', otp: '', password: '', confirm: '' });
  const [err, setErr] = useState({});
  const [target, setTarget] = useState(null);
  const [otp, setOtp] = useState({ code: '', sentAt: 0, tries: 0 });
  const [now, setNow] = useState(Date.now());
  const set = (k) => (v) => { setF({ ...f, [k]: v }); setErr({ ...err, [k]: undefined }); };

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const sinceSent = Math.floor((now - otp.sentAt) / 1000);
  const resendIn = Math.max(RESEND_AFTER - sinceSent, 0);

  const sendCode = (user) => {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setOtp({ code, sentAt: Date.now(), tries: 0 });
    setNow(Date.now());
    showAlert({
      type: 'info',
      title: `Hi ${user.name.split(' ')[0]}, your verification code`,
      message: `${code}\n\nThis code is valid for 2 minutes. (Demo: shown here instead of being sent by SMS to ******${user.phone.slice(-4)}.)`,
    });
  };

  const verify = () => {
    const e = {};
    if (!EMAIL_RE.test(f.email.trim())) e.email = 'Enter a valid email address';
    if (!PHONE_RE.test(f.phone.trim())) e.phone = 'Enter a valid 10-digit mobile number';
    if (Object.keys(e).length) return setErr(e);
    const u = findForReset(f);
    if (!u) return setErr({ phone: 'Email and mobile number do not match any account' });
    setTarget(u);
    sendCode(u);
    setStep('otp');
  };

  const checkOtp = () => {
    if (!/^\d{6}$/.test(f.otp)) return setErr({ otp: 'Enter the 6-digit code' });
    if (sinceSent > OTP_LIFE) return setErr({ otp: 'Code expired. Please resend a new code.' });
    if (f.otp !== otp.code) {
      const tries = otp.tries + 1;
      if (tries >= 3) {
        setStep('verify');
        setF({ ...f, otp: '' });
        return setErr({ phone: 'Too many wrong attempts. Please start again.' });
      }
      setOtp({ ...otp, tries });
      return setErr({ otp: `Incorrect code. ${3 - tries} attempt${3 - tries === 1 ? '' : 's'} left` });
    }
    setStep('new');
  };

  const save = () => {
    const e = {};
    if (f.password.length < 6) e.password = 'Password must be at least 6 characters';
    else if (!/\d/.test(f.password)) e.password = 'Password must contain at least one number';
    if (f.confirm !== f.password) e.confirm = 'Passwords do not match';
    if (Object.keys(e).length) return setErr(e);
    resetPassword(target.id, f.password);
    showAlert({ type: 'success', title: 'Password updated', message: `All set, ${target.name.split(' ')[0]}! Sign in with your new password.` });
    navigation.replace('SignIn', { role: target.role });
  };

  const titles = {
    verify: ['Forgot password?', 'Enter the email and mobile number you registered with'],
    otp: ['Verification code', `Enter the 6-digit code for ${target?.email || ''}`],
    new: ['New password', 'Choose a new password for your account'],
  }[step];

  return (
    <AuthShell navigation={navigation} title={titles[0]} subtitle={titles[1]}>
      <Illustration variant="secure" height={170} />
      {step === 'verify' && (
        <>
          <Input label="Email" icon="mail" placeholder="you@example.com" keyboardType="email-address" value={f.email} onChangeText={set('email')} error={err.email} />
          <Input label="Registered mobile number" icon="call" placeholder="10-digit number" keyboardType="phone-pad" maxLength={10} value={f.phone} onChangeText={set('phone')} error={err.phone} />
          <Button title="Send code" icon="send" onPress={verify} style={{ marginTop: 8 }} />
        </>
      )}
      {step === 'otp' && (
        <>
          <Input label="6-digit code" icon="keypad" placeholder="••••••" keyboardType="number-pad" maxLength={6} value={f.otp} onChangeText={set('otp')} error={err.otp} onSubmitEditing={checkOtp} />
          <Text style={s.timer}>{sinceSent > OTP_LIFE ? 'Code expired' : `Expires in ${Math.max(OTP_LIFE - sinceSent, 0)}s`}</Text>
          <Button title="Verify" icon="checkmark-circle" onPress={checkOtp} />
          <Pressable disabled={resendIn > 0} onPress={() => { setErr({}); setF({ ...f, otp: '' }); sendCode(target); }}>
            <Text style={[s.link, resendIn > 0 && { opacity: 0.6 }]}>
              {resendIn > 0 ? `Resend code in ${resendIn}s` : <Text style={{ color: C.primary2, fontWeight: '700' }}>Resend code</Text>}
            </Text>
          </Pressable>
        </>
      )}
      {step === 'new' && (
        <>
          <Input label="New password" icon="lock-closed" placeholder="Min 6 chars with a number" secure value={f.password} onChangeText={set('password')} error={err.password} />
          <Input label="Confirm new password" icon="shield-checkmark" placeholder="Repeat password" secure value={f.confirm} onChangeText={set('confirm')} error={err.confirm} />
          <Button title="Update password" icon="key" onPress={save} style={{ marginTop: 8 }} />
        </>
      )}
    </AuthShell>
  );
}

const s = createStyles(() => ({
  timer: { color: C.sub, fontSize: 12, marginBottom: 16, marginTop: -6 },
  logo: { width: 88, height: 88, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  title: { color: C.text, fontSize: 36, fontWeight: '900', textAlign: 'center' },
  tag: { color: C.sub, fontSize: 15, textAlign: 'center', marginTop: 10, lineHeight: 22 },
  who: { color: C.sub, fontWeight: '600', marginBottom: 8 },
  hint: { color: C.sub, fontSize: 12, textAlign: 'center', marginTop: 18, lineHeight: 18 },
  back: { width: 40, height: 40, borderRadius: 14, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  h1: { color: C.text, fontSize: 28, fontWeight: '900' },
  sub: { color: C.sub, marginTop: 6, marginBottom: 24 },
  link: { color: C.sub, textAlign: 'center', marginTop: 20 },
}));
