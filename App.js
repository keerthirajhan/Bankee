import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider, useApp } from './src/AppContext';
import Navigation from './src/navigation';
import { AlertModal } from './src/ui';
import { C } from './src/theme';

function Shell() {
  const { mode } = useApp();
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: C.bg }}>
      <Navigation />
      <AlertModal key={mode} />
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
    </GestureHandlerRootView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <Shell />
      </AppProvider>
    </SafeAreaProvider>
  );
}
