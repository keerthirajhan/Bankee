import React, { useEffect, useRef, useState } from 'react';
import {
  Animated, Dimensions, Easing, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DrawerActions } from '@react-navigation/native';
import { C, GRADIENT, GRADIENT_BAND, R, createStyles } from './theme';
import { MONTHS, catOf, money, initials } from './utils';
import { useApp } from './AppContext';

const ND = Platform.OS !== 'web';

// ---------- animation helpers ----------
export function AnimatedIn({ children, delay = 0, from = 18, style }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration: 450, delay, easing: Easing.out(Easing.cubic), useNativeDriver: ND }).start();
  }, []);
  return (
    <Animated.View style={[{ opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [from, 0] }) }] }, style]}>
      {children}
    </Animated.View>
  );
}

export function Press({ onPress, children, style, disabled }) {
  const s = useRef(new Animated.Value(1)).current;
  const to = (x) => Animated.spring(s, { toValue: x, useNativeDriver: ND, speed: 40, bounciness: 6 }).start();
  return (
    <Pressable disabled={disabled} onPress={onPress} onPressIn={() => to(0.96)} onPressOut={() => to(1)}>
      <Animated.View style={[{ transform: [{ scale: s }] }, style]}>{children}</Animated.View>
    </Pressable>
  );
}

export function CountUp({ value, style, format = money }) {
  const v = useRef(new Animated.Value(0)).current;
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const id = v.addListener(({ value: x }) => setShown(x));
    Animated.timing(v, { toValue: value, duration: 800, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
    return () => v.removeListener(id);
  }, [value]);
  return <Text style={style}>{format(shown)}</Text>;
}

// ---------- layout ----------
// Header band on top, rounded light sheet below.
// The <Header/> child (if first) and the optional `top` node are rendered inside the green band.
export function Screen({ children, top, scroll = true, style, pad = true }) {
  const kids = React.Children.toArray(children);
  const hasHeader = kids[0]?.type === Header;
  const header = hasHeader ? kids[0] : null;
  const body = hasHeader ? kids.slice(1) : kids;
  const inner = scroll ? (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={[pad && { padding: 20, paddingTop: 24 }, { paddingBottom: 110 }, style]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      {body}
    </ScrollView>
  ) : (
    <View style={[{ flex: 1 }, pad && { padding: 20 }, style]}>{body}</View>
  );
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.band }} edges={['top']}>
      {header}
      {top && <View style={{ paddingHorizontal: 24, paddingBottom: 26 }}>{top}</View>}
      <View style={s.sheet}>{inner}</View>
    </SafeAreaView>
  );
}

export function Header({ title, subtitle, navigation, back, right }) {
  return (
    <View style={s.header}>
      <Pressable
        style={s.iconBtn}
        onPress={() => (back ? navigation.goBack() : navigation.dispatch(DrawerActions.openDrawer()))}
        hitSlop={8}
      >
        <Ionicons name={back ? 'chevron-back' : 'menu'} size={22} color={C.text} />
      </Pressable>
      <View style={{ flex: 1, marginHorizontal: 12 }}>
        <Text style={s.hTitle} numberOfLines={1}>{title}</Text>
        {!!subtitle && <Text style={s.hSub} numberOfLines={1}>{subtitle}</Text>}
      </View>
      {right || <View style={{ width: 40 }} />}
    </View>
  );
}

export const Card = ({ children, style }) => <View style={[s.card, style]}>{children}</View>;

export function GradientCard({ children, colors = GRADIENT_BAND, style }) {
  return (
    <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[{ borderRadius: R.lg, padding: 20 }, style]}>
      {children}
    </LinearGradient>
  );
}

// ---------- form controls ----------
export function Button({ title, onPress, icon, variant = 'primary', style, disabled }) {
  const inner = (
    <View style={s.btnRow}>
      {icon && <Ionicons name={icon} size={18} color={variant === 'primary' ? '#fff' : C.primary2} style={{ marginRight: 8 }} />}
      <Text style={[s.btnText, variant !== 'primary' && { color: variant === 'danger' ? C.coral : C.primary2 }]}>{title}</Text>
    </View>
  );
  return (
    <Press onPress={onPress} disabled={disabled} style={[{ opacity: disabled ? 0.5 : 1 }, style]}>
      {variant === 'primary' ? (
        <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.btn}>{inner}</LinearGradient>
      ) : (
        <View style={[s.btn, { borderWidth: 1.5, borderColor: variant === 'danger' ? C.coral : C.border, backgroundColor: C.card }]}>{inner}</View>
      )}
    </Press>
  );
}

export function Input({ label, error, icon, secure, style, ...rest }) {
  const [hide, setHide] = useState(!!secure);
  const [focus, setFocus] = useState(false);
  return (
    <View style={[{ marginBottom: 14 }, style]}>
      {!!label && <Text style={s.label}>{label}</Text>}
      <View style={[s.inputBox, focus && { borderColor: C.primary }, !!error && { borderColor: C.coral }]}>
        {icon && <Ionicons name={icon} size={18} color={C.sub} style={{ marginRight: 10 }} />}
        <TextInput
          style={s.input}
          placeholderTextColor="#5E6A9A"
          secureTextEntry={hide}
          autoCapitalize="none"
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          {...rest}
        />
        {secure && (
          <Pressable onPress={() => setHide(!hide)} hitSlop={8}>
            <Ionicons name={hide ? 'eye-off' : 'eye'} size={18} color={C.sub} />
          </Pressable>
        )}
      </View>
      {!!error && <Text style={s.error}>{error}</Text>}
    </View>
  );
}

export function Segmented({ options, value, onChange, style }) {
  return (
    <View style={[s.seg, style]}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable key={o.value} onPress={() => onChange(o.value)} style={{ flex: 1 }}>
            {on ? (
              <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.segItem}>
                <Text style={[s.segText, { color: '#fff' }]}>{o.label}</Text>
              </LinearGradient>
            ) : (
              <View style={s.segItem}><Text style={s.segText}>{o.label}</Text></View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

export function MonthSwitcher({ year, month, onChange }) {
  const shift = (d) => {
    const dt = new Date(year, month + d, 1);
    onChange(dt.getFullYear(), dt.getMonth());
  };
  const now = new Date();
  const atNow = year === now.getFullYear() && month === now.getMonth();
  return (
    <View style={s.month}>
      <Pressable onPress={() => shift(-1)} style={s.monthBtn} hitSlop={8}><Ionicons name="chevron-back" size={18} color={C.text} /></Pressable>
      <Text style={s.monthText}>{MONTHS[month]} {year}</Text>
      <Pressable onPress={() => shift(1)} disabled={atNow} style={[s.monthBtn, atNow && { opacity: 0.3 }]} hitSlop={8}><Ionicons name="chevron-forward" size={18} color={C.text} /></Pressable>
    </View>
  );
}

// ---------- data display ----------
export function Bars({ data, height = 120, color = C.band, highlight }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: height + 40, justifyContent: 'space-between' }}>
      {data.map((d, i) => (
        <Bar key={d.label + i} d={d} max={max} height={height} color={color} hl={highlight === i} i={i} />
      ))}
    </View>
  );
}
function Bar({ d, max, height, color, hl, i }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    v.setValue(0);
    Animated.timing(v, { toValue: (d.value / max) * height, duration: 700, delay: i * 60, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [d.value, max]);
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text style={s.barVal} numberOfLines={1}>{d.value ? (d.value >= 1000 ? (d.value / 1000).toFixed(1) + 'k' : d.value) : ''}</Text>
      <View style={{ height, justifyContent: 'flex-end' }}>
        <Animated.View style={{ width: 22, minHeight: 4, height: v, borderRadius: 8, backgroundColor: hl ? C.primary : color, opacity: d.value ? 1 : 0.25 }} />
      </View>
      <Text style={s.barLabel}>{d.label}</Text>
    </View>
  );
}

export function ProgressBar({ pct, color = C.primary, delay = 0, warn = true }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, { toValue: Math.min(pct, 100), duration: 800, delay, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [pct]);
  return (
    <View style={s.track}>
      <Animated.View style={{ height: '100%', borderRadius: 6, backgroundColor: warn && pct > 100 ? C.coral : color, width: v.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) }} />
    </View>
  );
}

export const Avatar = ({ name, size = 64 }) => (
  <LinearGradient colors={GRADIENT_BAND} style={{ width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center' }}>
    <Text style={{ color: C.text, fontSize: size / 2.6, fontWeight: '800' }}>{initials(name)}</Text>
  </LinearGradient>
);

export const CatIcon = ({ cat, size = 44 }) => (
  <View style={{ width: size, height: size, borderRadius: size / 3, backgroundColor: cat.color + '26', alignItems: 'center', justifyContent: 'center' }}>
    <Ionicons name={cat.icon} size={size / 2} color={cat.color} />
  </View>
);

export function TxItem({ t, onPress, onDelete, index = 0 }) {
  const cat = catOf(t.category);
  const inc = t.type === 'income';
  return (
    <AnimatedIn delay={Math.min(index, 8) * 50} from={12}>
      <Press onPress={onPress}>
        <View style={s.tx}>
          <CatIcon cat={cat} />
          <View style={{ flex: 1, marginHorizontal: 12 }}>
            <Text style={s.txTitle} numberOfLines={1}>{t.note || cat.name}</Text>
            <Text style={s.txSub}>{cat.name} · {new Date(t.date).getDate()} {MONTHS[new Date(t.date).getMonth()].slice(0, 3)}</Text>
          </View>
          <Text style={[s.txAmt, { color: inc ? C.mint : C.coral }]}>{inc ? '+' : '-'}{money(t.amount)}</Text>
          {onDelete && (
            <Pressable onPress={onDelete} hitSlop={10} style={{ marginLeft: 10 }}>
              <Ionicons name="trash-outline" size={18} color={C.sub} />
            </Pressable>
          )}
        </View>
      </Press>
    </AnimatedIn>
  );
}

export const Empty = ({ icon = 'file-tray-outline', text }) => (
  <View style={{ alignItems: 'center', padding: 32 }}>
    <Ionicons name={icon} size={44} color={C.border} />
    <Text style={{ color: C.sub, marginTop: 10, textAlign: 'center' }}>{text}</Text>
  </View>
);

export const SectionTitle = ({ children, right }) => (
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 22, marginBottom: 12 }}>
    <Text style={{ color: C.text, fontSize: 17, fontWeight: '700' }}>{children}</Text>
    {right}
  </View>
);

// ---------- confetti burst (pure Animated, no extra library) ----------
const CONFETTI_COLORS = ['#B88EDC', '#7B4FB0', '#F2A33A', '#2E9E6B', '#D36FB5', '#4DA3FF'];
function Piece({ i, w, h, run }) {
  const v = useRef(new Animated.Value(0)).current;
  const cfg = useRef({
    x: Math.random() * w,
    drift: (Math.random() - 0.5) * 120,
    delay: Math.random() * 500,
    dur: 1800 + Math.random() * 1400,
    spin: 360 + Math.random() * 720,
    size: 8 + Math.random() * 8,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    round: i % 3 === 0,
  }).current;
  useEffect(() => {
    v.setValue(0);
    Animated.timing(v, { toValue: 1, duration: cfg.dur, delay: cfg.delay, easing: Easing.in(Easing.quad), useNativeDriver: ND }).start();
  }, [run]);
  return (
    <Animated.View
      style={{
        position: 'absolute', left: cfg.x, top: -20, width: cfg.size, height: cfg.size * (cfg.round ? 1 : 0.5),
        borderRadius: cfg.round ? cfg.size : 2, backgroundColor: cfg.color, opacity: v.interpolate({ inputRange: [0, 0.1, 0.85, 1], outputRange: [0, 1, 1, 0] }),
        transform: [
          { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, h + 40] }) },
          { translateX: v.interpolate({ inputRange: [0, 1], outputRange: [0, cfg.drift] }) },
          { rotate: v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${cfg.spin}deg`] }) },
        ],
      }}
    />
  );
}
export function Confetti({ run }) {
  const { width, height } = Dimensions.get('window');
  if (!run) return null;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, overflow: 'hidden' }}>
      {Array.from({ length: 60 }, (_, i) => <Piece key={`${run}-${i}`} i={i} w={width} h={height} run={run} />)}
    </View>
  );
}

// ---------- personalised alert modal (works on all platforms) ----------
export function AlertModal() {
  const { alertState, hideAlert } = useApp();
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (alertState) { v.setValue(0); Animated.spring(v, { toValue: 1, useNativeDriver: ND, bounciness: 10 }).start(); }
  }, [alertState]);
  if (!alertState) return null;
  const meta = { success: ['checkmark-circle', C.mint], danger: ['alert-circle', C.coral], info: ['notifications', C.primary2] }[alertState.type] || ['notifications', C.primary2];
  const actions = alertState.actions || [{ text: 'Got it', style: 'primary' }];
  return (
    <Modal transparent visible animationType="fade" onRequestClose={hideAlert}>
      <View style={s.overlay}>
        <Animated.View style={[s.alertBox, { opacity: v, transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }] }]}>
          <View style={[s.alertIcon, { backgroundColor: meta[1] + '22' }]}>
            <Ionicons name={meta[0]} size={34} color={meta[1]} />
          </View>
          <Text style={s.alertTitle}>{alertState.title}</Text>
          <Text style={s.alertMsg}>{alertState.message}</Text>
          <View style={{ flexDirection: 'row', marginTop: 20, gap: 10 }}>
            {actions.map((a, i) => (
              <Pressable
                key={i}
                style={{ flex: 1 }}
                onPress={() => { hideAlert(); a.onPress && setTimeout(a.onPress, 50); }}
              >
                <View style={[s.alertBtn, a.style === 'primary' && { backgroundColor: C.primary }, a.style === 'danger' && { backgroundColor: C.coral }, a.style === 'cancel' && { backgroundColor: C.card2 }]}>
                  <Text style={[s.alertBtnText, a.style === 'cancel' && { color: C.text }]}>{a.text}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const s = createStyles(() => ({
  sheet: { flex: 1, backgroundColor: C.bg, borderTopLeftRadius: 40, borderTopRightRadius: 40, overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14 },
  iconBtn: { width: 40, height: 40, borderRadius: 14, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
  hTitle: { color: C.text, fontSize: 20, fontWeight: '800' },
  hSub: { color: C.onBand, fontSize: 12, marginTop: 1 },
  card: { backgroundColor: C.card, borderRadius: R.md, padding: 16, borderWidth: 1, borderColor: C.border },
  btn: { height: 52, borderRadius: R.md, alignItems: 'center', justifyContent: 'center' },
  btnRow: { flexDirection: 'row', alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  label: { color: C.sub, fontSize: 13, marginBottom: 6, fontWeight: '600' },
  inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: R.md, borderWidth: 1.5, borderColor: C.border, paddingHorizontal: 14, height: 52 },
  input: { flex: 1, color: C.text, fontSize: 15, height: '100%', outlineStyle: 'none' },  error: { color: C.coral, fontSize: 12, marginTop: 5 },
  seg: { flexDirection: 'row', backgroundColor: C.card, borderRadius: R.md, padding: 4, borderWidth: 1, borderColor: C.border },
  segItem: { height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  segText: { color: C.sub, fontWeight: '700', fontSize: 13 },
  month: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: C.card, borderRadius: R.md, padding: 8, borderWidth: 1, borderColor: C.border },
  monthBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: C.card2, alignItems: 'center', justifyContent: 'center' },
  monthText: { color: C.text, fontWeight: '700', fontSize: 15 },
  barVal: { color: C.sub, fontSize: 10, marginBottom: 4, height: 14 },
  barLabel: { color: C.sub, fontSize: 11, marginTop: 6 },
  track: { height: 8, backgroundColor: C.card2, borderRadius: 6, overflow: 'hidden' },
  tx: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: R.md, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: C.border },
  txTitle: { color: C.text, fontWeight: '700', fontSize: 15 },
  txSub: { color: C.sub, fontSize: 12, marginTop: 2 },
  txAmt: { fontWeight: '800', fontSize: 15 },
  overlay: { flex: 1, backgroundColor: 'rgba(5,8,20,0.75)', alignItems: 'center', justifyContent: 'center', padding: 28 },
  alertBox: { width: '100%', maxWidth: 380, backgroundColor: C.card, borderRadius: R.lg, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: C.border },
  alertIcon: { width: 68, height: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  alertTitle: { color: C.text, fontSize: 18, fontWeight: '800', textAlign: 'center' },
  alertMsg: { color: C.sub, fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 8 },
  alertBtn: { height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: C.primary },
  alertBtnText: { color: '#fff', fontWeight: '700' },
}));
