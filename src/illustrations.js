import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, G, LinearGradient as SvgGradient, Path, Rect, Stop } from 'react-native-svg';

const PLUM = '#3A2352';
const PLUM2 = '#4A2F68';
const VIOLET = '#7B4FB0';
const LILAC = '#B88EDC';
const SOFT = '#D9C3EC';
const PALE = '#F3E8FB';
const GOLD = '#F2A33A';
const GREEN = '#2E9E6B';

const Backdrop = () => (
  <>
    <Circle cx="52" cy="44" r="64" fill="#fff" opacity="0.45" />
    <Circle cx="322" cy="178" r="78" fill={LILAC} opacity="0.35" />
    <Circle cx="300" cy="28" r="5" fill={VIOLET} opacity="0.5" />
    <Circle cx="34" cy="168" r="4" fill={VIOLET} opacity="0.5" />
    <Circle cx="96" cy="20" r="3" fill={GOLD} />
    <Circle cx="334" cy="110" r="3" fill={GOLD} />
  </>
);

const Coin = ({ cx: cxIn, cy: cyIn, r: rIn }) => {
  const cx = Number(cxIn);
  const cy = Number(cyIn);
  const r = Number(rIn);
  const k = r / 22;
  const n = (v) => v.toFixed(1);
  const x0 = cx - 6 * k;
  const x1 = cx + 6 * k;
  const d = [
    `M ${n(x0)} ${n(cy - 7 * k)} L ${n(x1)} ${n(cy - 7 * k)}`,
    `M ${n(x0)} ${n(cy - 2 * k)} L ${n(x1)} ${n(cy - 2 * k)}`,
    `M ${n(x0)} ${n(cy - 7 * k)} Q ${n(cx + 7 * k)} ${n(cy - 7 * k)} ${n(cx + 7 * k)} ${n(cy - 2 * k)}`,
    `M ${n(x0)} ${n(cy + 3 * k)} L ${n(cx + 7 * k)} ${n(cy - 2 * k)}`,
    `M ${n(x0)} ${n(cy + 3 * k)} L ${n(cx + 1 * k)} ${n(cy + 11 * k)}`,
  ].join(' ');
  return (
    <G>
      <Circle cx={cx} cy={cy} r={r} fill={GOLD} />
      <Circle cx={cx} cy={cy} r={r * 0.78} fill="none" stroke="#FFD27D" strokeWidth="2" />
      <Path d={d} stroke="#fff" strokeWidth={Math.max(2, r / 8)} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </G>
  );
};

const Card = ({ x, y, w, h }) => (
  <G>
    <Rect x={x + 2} y={y + 5} width={w} height={h} rx="14" fill={PLUM} opacity="0.12" />
    <Rect x={x} y={y} width={w} height={h} rx="14" fill="#fff" />
  </G>
);

// ---- Dashboard: phone with chart, bar card, coin and success card ----
const Dashboard = () => (
  <>
    <Backdrop />
    {/* left bar-chart card */}
    <Card x="18" y="62" w="96" h="76" />
    <Rect x="32" y="74" width="34" height="6" rx="3" fill={PLUM} />
    <Rect x="32" y="112" width="11" height="14" rx="3" fill={SOFT} />
    <Rect x="48" y="100" width="11" height="26" rx="3" fill={LILAC} />
    <Rect x="64" y="90" width="11" height="36" rx="3" fill={VIOLET} />
    <Rect x="80" y="104" width="11" height="22" rx="3" fill={LILAC} />
    {/* phone */}
    <Rect x="125" y="14" width="112" height="196" rx="20" fill={PLUM} />
    <Rect x="131" y="22" width="100" height="180" rx="14" fill="#fff" />
    <Rect x="161" y="26" width="40" height="5" rx="2.5" fill={PLUM} opacity="0.85" />
    <Rect x="140" y="40" width="38" height="5" rx="2.5" fill={LILAC} />
    <Rect x="140" y="51" width="64" height="11" rx="5.5" fill={PLUM} />
    <Rect x="140" y="72" width="82" height="56" rx="11" fill={PALE} />
    <Path d="M147 116 C157 92 165 116 175 100 S201 90 214 84" stroke={VIOLET} strokeWidth="3" fill="none" strokeLinecap="round" />
    <Circle cx="214" cy="84" r="4" fill={GOLD} />
    {[138, 158, 178].map((y, i) => (
      <G key={y}>
        <Circle cx="149" cy={y + 6} r="7" fill={[LILAC, GOLD, GREEN][i]} />
        <Rect x="161" y={y + 1} width="36" height="5" rx="2.5" fill={SOFT} />
        <Rect x="161" y={y + 10} width="24" height="4" rx="2" fill={PALE} />
        <Rect x="203" y={y + 3} width="19" height="5" rx="2.5" fill={PLUM} />
      </G>
    ))}
    {/* coins */}
    <Coin cx="274" cy="58" r="22" />
    <Coin cx="312" cy="96" r="13" />
    {/* success card */}
    <Card x="248" y="132" w="98" h="48" />
    <Circle cx="272" cy="156" r="12" fill={GREEN} />
    <Path d="M266 156 l4 4 l8 -8" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <Rect x="291" y="147" width="44" height="6" rx="3" fill={PLUM} />
    <Rect x="291" y="160" width="28" height="5" rx="2.5" fill={SOFT} />
  </>
);

// ---- Sign up: wallet with cards, growth bars, avatar badge ----
const Signup = () => (
  <>
    <Backdrop />
    {/* growth card */}
    <Card x="236" y="40" w="104" h="88" />
    <Rect x="250" y="52" width="36" height="6" rx="3" fill={PLUM} />
    <Rect x="250" y="102" width="12" height="14" rx="3" fill={SOFT} />
    <Rect x="268" y="90" width="12" height="26" rx="3" fill={LILAC} />
    <Rect x="286" y="80" width="12" height="36" rx="3" fill={VIOLET} />
    <Rect x="304" y="68" width="12" height="48" rx="3" fill={PLUM} />
    <Path d="M252 86 L272 74 L290 80 L318 56" stroke={GOLD} strokeWidth="3" fill="none" strokeLinecap="round" />
    {/* avatar card */}
    <Card x="22" y="42" w="104" h="56" />
    <Circle cx="50" cy="70" r="14" fill={LILAC} />
    <Circle cx="50" cy="66" r="5" fill="#fff" />
    <Path d="M41 78 C43 71 57 71 59 78" fill="#fff" />
    <Rect x="72" y="60" width="44" height="6" rx="3" fill={PLUM} />
    <Rect x="72" y="73" width="30" height="5" rx="2.5" fill={SOFT} />
    {/* wallet */}
    <G transform="rotate(-8 150 90)">
      <Rect x="118" y="62" width="100" height="44" rx="10" fill={LILAC} />
    </G>
    <G transform="rotate(6 170 90)">
      <Rect x="130" y="52" width="100" height="44" rx="10" fill="#fff" />
      <Rect x="140" y="64" width="30" height="6" rx="3" fill={PLUM} />
      <Rect x="140" y="76" width="50" height="5" rx="2.5" fill={SOFT} />
    </G>
    <Rect x="92" y="98" width="170" height="104" rx="22" fill={PLUM} />
    <Rect x="92" y="98" width="170" height="38" rx="22" fill={PLUM2} />
    <Rect x="206" y="138" width="64" height="36" rx="14" fill={LILAC} />
    <Circle cx="226" cy="156" r="6" fill="#fff" />
    <Coin cx="62" cy="150" r="20" />
    <Coin cx="96" cy="188" r="11" />
    {/* plus badge */}
    <Circle cx="318" cy="168" r="18" fill={GREEN} />
    <Path d="M318 160 v16 M310 168 h16" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" />
  </>
);

// ---- Secure: shield with lock, OTP card, success badge ----
const Secure = () => (
  <>
    <Backdrop />
    <Defs>
      <SvgGradient id="shield" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor={PLUM2} />
        <Stop offset="1" stopColor={PLUM} />
      </SvgGradient>
    </Defs>
    {/* otp card */}
    <Card x="16" y="62" w="104" h="56" />
    <Rect x="28" y="72" width="40" height="5" rx="2.5" fill={SOFT} />
    {[36, 56, 76, 96].map((x) => <Circle key={x} cx={x} cy="98" r="5" fill={PLUM} />)}
    {/* shield */}
    <Path d="M180 14 L252 40 V104 C252 148 220 178 180 196 C140 178 108 148 108 104 V40 Z" fill="url(#shield)" />
    <Path d="M180 28 L240 49 V104 C240 140 214 166 180 182 C146 166 120 140 120 104 V49 Z" fill="none" stroke={LILAC} strokeWidth="2" opacity="0.7" />
    <Path d="M164 96 v-14 a16 16 0 0 1 32 0 v14" stroke="#fff" strokeWidth="7" fill="none" strokeLinecap="round" />
    <Rect x="156" y="94" width="48" height="40" rx="10" fill="#fff" />
    <Circle cx="180" cy="110" r="6" fill={PLUM} />
    <Rect x="177.5" y="112" width="5" height="14" rx="2.5" fill={PLUM} />
    {/* success badge + coin */}
    <Card x="262" y="116" w="82" h="46" />
    <Circle cx="284" cy="139" r="12" fill={GREEN} />
    <Path d="M278 139 l4 4 l8 -8" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <Rect x="302" y="132" width="30" height="6" rx="3" fill={PLUM} />
    <Rect x="302" y="144" width="20" height="5" rx="2.5" fill={SOFT} />
    <Coin cx="300" cy="70" r="18" />
  </>
);

const ART = { dashboard: Dashboard, signup: Signup, secure: Secure };

export default function Illustration({ variant = 'dashboard', height = 200 }) {
  const float = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const ND = Platform.OS !== 'web';
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: 2400, easing: Easing.inOut(Easing.sin), useNativeDriver: ND }),
        Animated.timing(float, { toValue: 0, duration: 2400, easing: Easing.inOut(Easing.sin), useNativeDriver: ND }),
      ])
    ).start();
  }, []);
  const Art = ART[variant] || Dashboard;
  return (
    <LinearGradient colors={['#F0E3FA', '#E3CFF3']} style={{ borderRadius: 28, overflow: 'hidden', marginBottom: 22 }}>
      <Animated.View style={{ transform: [{ translateY: float.interpolate({ inputRange: [0, 1], outputRange: [0, -5] }) }] }}>
        <Svg width="100%" height={height} viewBox="0 0 360 220" preserveAspectRatio="xMidYMid meet">
          <Art />
        </Svg>
      </Animated.View>
    </LinearGradient>
  );
}
