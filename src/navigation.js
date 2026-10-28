import React from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { C, GRADIENT_BAND, createStyles } from './theme';
import { useApp } from './AppContext';
import { Avatar } from './ui';
import { WelcomeScreen, SignInScreen, SignUpScreen, ForgotPasswordScreen } from './screens/Auth';
import HomeScreen from './screens/Home';
import AnalysisScreen from './screens/Analysis';
import { TransactionsScreen, AddTransactionScreen } from './screens/Transactions';
import { CategoriesScreen, CategoryDetailsScreen } from './screens/Categories';
import { ProfileScreen, EditProfileScreen } from './screens/Profile';
import AdminUsersScreen from './screens/Admin';
import GoalsScreen from './screens/Goals';

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// colours are read lazily so a light/dark switch (which remounts Navigation) picks them up
const makeTheme = () => ({ ...DefaultTheme, colors: { ...DefaultTheme.colors, background: C.bg, card: C.card, text: C.text, border: C.border, primary: C.primary } });
const stackOpts = () => ({ headerShown: false, animation: 'slide_from_right', contentStyle: { backgroundColor: C.bg } });

// ---------- Stack navigators nested inside each tab ----------
const HomeStack = () => (
  <Stack.Navigator screenOptions={stackOpts()}>
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="AddTransaction" component={AddTransactionScreen} />
    <Stack.Screen name="Goals" component={GoalsScreen} />
  </Stack.Navigator>
);
const TransactionsStack = () => (
  <Stack.Navigator screenOptions={stackOpts()}>
    <Stack.Screen name="Transactions" component={TransactionsScreen} />
    <Stack.Screen name="AddTransaction" component={AddTransactionScreen} />
  </Stack.Navigator>
);
const CategoriesStack = () => (
  <Stack.Navigator screenOptions={stackOpts()}>
    <Stack.Screen name="Categories" component={CategoriesScreen} />
    <Stack.Screen name="CategoryDetails" component={CategoryDetailsScreen} />
  </Stack.Navigator>
);
const ProfileStack = () => (
  <Stack.Navigator screenOptions={stackOpts()}>
    <Stack.Screen name="Profile" component={ProfileScreen} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
  </Stack.Navigator>
);

// ---------- Tabs ----------
const tabOpts = (icons) => ({ route }) => ({
  headerShown: false,
  tabBarActiveTintColor: C.text,
  tabBarInactiveTintColor: C.sub,
  tabBarStyle: { backgroundColor: C.card, borderTopColor: C.border, height: 72, paddingBottom: 12, paddingTop: 8 },
  tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
  tabBarIcon: ({ color, focused, size }) => <Ionicons name={focused ? icons[route.name] : icons[route.name] + '-outline'} size={size} color={color} />,
});

const CustomerTabs = () => (
  <Tabs.Navigator screenOptions={tabOpts({ HomeTab: 'home', AnalysisTab: 'pie-chart', TransactionsTab: 'swap-horizontal', CategoriesTab: 'grid', ProfileTab: 'person' })}>
    <Tabs.Screen name="HomeTab" component={HomeStack} options={{ title: 'Home' }} />
    <Tabs.Screen name="AnalysisTab" component={AnalysisScreen} options={{ title: 'Analysis' }} />
    <Tabs.Screen name="TransactionsTab" component={TransactionsStack} options={{ title: 'Transactions' }} />
    <Tabs.Screen name="CategoriesTab" component={CategoriesStack} options={{ title: 'Categories' }} />
    <Tabs.Screen name="ProfileTab" component={ProfileStack} options={{ title: 'Profile' }} />
  </Tabs.Navigator>
);

const AdminTabs = () => (
  <Tabs.Navigator screenOptions={tabOpts({ AdminAnalysis: 'pie-chart', AdminCustomers: 'people' })}>
    <Tabs.Screen name="AdminAnalysis" component={AnalysisScreen} options={{ title: 'Analysis' }} />
    <Tabs.Screen name="AdminCustomers" component={AdminUsersScreen} options={{ title: 'Customers' }} />
  </Tabs.Navigator>
);

// ---------- Drawer ----------
function DrawerContent({ navigation, items }) {
  const { user, signOut, confirm, mode, toggleTheme } = useApp();
  return (
    <DrawerContentScrollView contentContainerStyle={{ padding: 18 }} style={{ backgroundColor: C.bg }}>
      <LinearGradient colors={GRADIENT_BAND} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.dh}>
        <Avatar name={user.name} size={58} />
        <Text style={s.dn}>{user.name}</Text>
        <Text style={s.de}>{user.email}</Text>
        <View style={s.badge}><Text style={s.badgeT}>{user.role.toUpperCase()}</Text></View>
      </LinearGradient>
      <View style={{ marginTop: 18 }}>
        {items.map((it) => (
          <Pressable key={it.label} style={s.item} onPress={() => { navigation.closeDrawer(); navigation.navigate('Main', it.screen ? { screen: it.tab, params: { screen: it.screen } } : { screen: it.tab }); }}>
            <Ionicons name={it.icon} size={20} color={C.primary2} />
            <Text style={s.itemT}>{it.label}</Text>
          </Pressable>
        ))}
        <View style={[s.item, { justifyContent: 'space-between', marginTop: 6 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name={mode === 'dark' ? 'moon' : 'sunny'} size={20} color={C.primary2} />
            <Text style={s.itemT}>{mode === 'dark' ? 'Dark mode' : 'Light mode'}</Text>
          </View>
          <Switch value={mode === 'dark'} onValueChange={() => { navigation.closeDrawer(); toggleTheme(); }} trackColor={{ false: C.border, true: C.primary }} thumbColor="#fff" />
        </View>
        <Pressable style={[s.item, { marginTop: 14 }]} onPress={() => { navigation.closeDrawer(); confirm({ title: 'Sign out?', message: `See you soon, ${user.name.split(' ')[0]}!`, confirmText: 'Sign out', danger: true, onConfirm: signOut }); }}>
          <Ionicons name="log-out" size={20} color={C.coral} />
          <Text style={[s.itemT, { color: C.coral }]}>Sign out</Text>
        </Pressable>
      </View>
    </DrawerContentScrollView>
  );
}

const drawerOpts = () => ({ headerShown: false, drawerStyle: { backgroundColor: C.bg, width: 290 }, drawerType: 'slide', overlayColor: 'rgba(5,8,20,0.6)' });

const CUSTOMER_ITEMS = [
  { label: 'Home & Reports', icon: 'home', tab: 'HomeTab' },
  { label: 'Goals & Savings', icon: 'trophy', tab: 'HomeTab', screen: 'Goals' },
  { label: 'Analysis', icon: 'pie-chart', tab: 'AnalysisTab' },
  { label: 'Transactions', icon: 'swap-horizontal', tab: 'TransactionsTab' },
  { label: 'Categories', icon: 'grid', tab: 'CategoriesTab' },
  { label: 'My Profile', icon: 'person', tab: 'ProfileTab' },
];
const ADMIN_ITEMS = [
  { label: 'Analysis', icon: 'pie-chart', tab: 'AdminAnalysis' },
  { label: 'Customers', icon: 'people', tab: 'AdminCustomers' },
];

const CustomerDrawer = () => (
  <Drawer.Navigator screenOptions={drawerOpts()} drawerContent={(p) => <DrawerContent {...p} items={CUSTOMER_ITEMS} />}>
    <Drawer.Screen name="Main" component={CustomerTabs} />
  </Drawer.Navigator>
);
const AdminDrawer = () => (
  <Drawer.Navigator screenOptions={drawerOpts()} drawerContent={(p) => <DrawerContent {...p} items={ADMIN_ITEMS} />}>
    <Drawer.Screen name="Main" component={AdminTabs} />
  </Drawer.Navigator>
);

// ---------- Root: auth stack vs. role based app ----------
export default function Navigation() {
  const { user, ready, mode } = useApp();
  if (!ready) return <View style={{ flex: 1, backgroundColor: C.bg }} />;
  return (
    <NavigationContainer key={mode} theme={makeTheme()}>
      <Stack.Navigator screenOptions={{ ...stackOpts(), animation: 'fade_from_bottom' }}>
        {!user ? (
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="SignIn" component={SignInScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        ) : user.role === 'admin' ? (
          <Stack.Screen name="AdminApp" component={AdminDrawer} />
        ) : (
          <Stack.Screen name="CustomerApp" component={CustomerDrawer} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const s = createStyles(() => ({
  dh: { borderRadius: 22, padding: 18, marginTop: 10 },
  dn: { color: C.text, fontSize: 18, fontWeight: '800', marginTop: 12 },
  de: { color: C.onBand, fontSize: 12, marginTop: 2 },
  badge: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.55)', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8, marginTop: 10 },
  badgeT: { color: C.text, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 14, borderRadius: 14, backgroundColor: C.card, marginBottom: 8 },
  itemT: { color: C.text, fontWeight: '700', marginLeft: 14 },
}));
