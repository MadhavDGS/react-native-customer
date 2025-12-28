/**
 * Ekthaa Customer - Native React Native App
 * Beautiful native mobile experience with dark mode support
 */

import React, { useEffect, useState } from 'react';
import { Platform, ActivityIndicator, View, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';

// Context
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

// Screens
import LoginScreen from './src/screens/Auth/LoginScreen';
import RegisterScreen from './src/screens/Auth/RegisterScreen';
import CustomerTabNavigator from './src/navigation/CustomerTabNavigator';
import BusinessDetailsScreen from './src/screens/customer/myBusinesses/BusinessDetailsScreen';
import AddTransactionScreen from './src/screens/customer/transactions/AddTransactionScreen';
import EditProfileScreen from './src/screens/profile/EditProfileScreen';
import ChangePasswordScreen from './src/screens/profile/ChangePasswordScreen';
import PrivacySecurityScreen from './src/screens/profile/PrivacySecurityScreen';
import ProductDetailScreen from './src/screens/customer/products/ProductDetailScreen';
import OfferDetailScreen from './src/screens/customer/offers/OfferDetailScreen';
import TransactionsScreen from './src/screens/Transactions/TransactionsScreen';
import QRScannerScreen from './src/screens/customer/qr/QRScannerScreen';
import BusinessProfileScreen from './src/screens/customer/business/BusinessProfileScreen';

// Theme
import { getThemedColors, Typography } from './src/constants/theme';

import { AuthProvider, useAuth } from './src/context/AuthContext';

const Stack = createNativeStackNavigator();

function AppContent() {
  const { isDark } = useTheme();
  const Colors = getThemedColors(isDark);
  const { isAuthenticated, isLoading } = useAuth();

  // Load Inter fonts
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  if (isLoading || !fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.primary }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar 
        style={isDark ? 'light' : 'light'} 
        backgroundColor="#5A9A8E"
        translucent={false}
      />
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: Colors.primary,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontFamily: Typography.fonts.bold,
            fontSize: 20,
          },
          animation: Platform.OS === 'ios' ? 'default' : 'slide_from_right',
        }}
      >
        {!isAuthenticated ? (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ headerShown: false }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Main"
              component={CustomerTabNavigator}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="BusinessDetails"
              component={BusinessDetailsScreen}
              options={{
                headerShown: true,
                title: 'Business Details'
              }}
            />
            <Stack.Screen
              name="AddTransaction"
              component={AddTransactionScreen}
              options={{
                headerShown: true,
                title: 'Add Transaction'
              }}
            />
            <Stack.Screen
              name="EditProfile"
              component={EditProfileScreen}
              options={{
                headerShown: true,
                title: 'Edit Profile'
              }}
            />
            <Stack.Screen
              name="ChangePassword"
              component={ChangePasswordScreen}
              options={{
                headerShown: true,
                title: 'Change Password'
              }}
            />
            <Stack.Screen
              name="PrivacySecurity"
              component={PrivacySecurityScreen}
              options={{
                headerShown: true,
                title: 'Privacy & Security'
              }}
            />
            <Stack.Screen
              name="ProductDetail"
              component={ProductDetailScreen}
              options={{
                headerShown: true,
                title: 'Product Details'
              }}
            />
            <Stack.Screen
              name="OfferDetail"
              component={OfferDetailScreen}
              options={{
                headerShown: true,
                title: 'Offer Details'
              }}
            />
            <Stack.Screen
              name="Transactions"
              component={TransactionsScreen}
              options={{
                headerShown: true,
                title: 'All Transactions'
              }}
            />
            <Stack.Screen
              name="QRScanner"
              component={QRScannerScreen}
              options={{
                headerShown: true,
                title: 'Scan QR Code'
              }}
            />
            <Stack.Screen
              name="BusinessProfile"
              component={BusinessProfileScreen}
              options={{
                headerShown: true,
                title: 'Business Profile'
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
