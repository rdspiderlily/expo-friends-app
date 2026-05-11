import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // 2. Set the bottom bar color (Android only)
    const setNavBarColor = async () => {
      // Use whatever blue hex code you prefer
      await NavigationBar.setBackgroundColorAsync("light"); 
      // Sets the Home/Back buttons to white so they're visible on blue
      await NavigationBar.setButtonStyleAsync("light"); 
    };

    setNavBarColor();
  }, []);

  useEffect(() => {

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Check if user is in the auth flow (Login or Register)
      const inAuthGroup = segments[0] === 'login' || segments[0] === 'register';

      if (!user && !inAuthGroup) {
        // Not logged in and not on an auth page? Boot to login.
        router.replace('/login');
      } else if (user && inAuthGroup) {
        // Logged in but trying to see login/register? Send to home.
        router.replace('/(tabs)');
      }
      // If logged out and on 'register', we stay there! 
      // This allows the back button to work without the bouncer kicking you out.
    });

    return unsubscribe;
  }, [segments]);

  return (
    <SafeAreaProvider>
      {/* 3. Set the top bar (Status Bar) to light so it matches the blue */}
      <StatusBar style="light" backgroundColor="#005b96" /> 
      
      <Stack screenOptions={{ 
        headerShown: false,
        contentStyle: { backgroundColor: '#fff' } // Soft blue for app background
      }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </SafeAreaProvider>
  );
}