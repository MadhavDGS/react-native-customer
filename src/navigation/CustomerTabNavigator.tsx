import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { getThemedColors } from '../constants/theme';

// Customer Screens
import HomeScreen from '../screens/customer/home/HomeScreen';
import ProductsScreen from '../screens/customer/products/ProductsScreen';
import OffersScreen from '../screens/customer/offers/OffersScreen';
import MyBusinessesScreen from '../screens/customer/myBusinesses/MyBusinessesScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function CustomerTabNavigator() {
    const { isDark } = useTheme();
    const Colors = getThemedColors(isDark);

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: keyof typeof Ionicons.glyphMap = 'home';

                    switch (route.name) {
                        case 'Home':
                            iconName = focused ? 'home' : 'home-outline';
                            break;
                        case 'Products':
                            iconName = focused ? 'grid' : 'grid-outline';
                            break;
                        case 'Offers':
                            iconName = focused ? 'pricetag' : 'pricetag-outline';
                            break;
                        case 'My Businesses':
                            iconName = focused ? 'business' : 'business-outline';
                            break;
                        case 'Profile':
                            iconName = focused ? 'person' : 'person-outline';
                            break;
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: Colors.primary,
                tabBarInactiveTintColor: Colors.textSecondary,
                tabBarStyle: {
                    backgroundColor: Colors.card,
                    borderTopColor: Colors.borderLight,
                    borderTopWidth: 1,
                    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
                    height: Platform.OS === 'ios' ? 68 : 56,
                },
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: '500',
                },
                headerStyle: {
                    backgroundColor: Colors.primary,
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
            })}
            initialRouteName="Home"
        >
            <Tab.Screen name="Products" component={ProductsScreen} />
            <Tab.Screen name="Offers" component={OffersScreen} />
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{ headerShown: false }}
            />
            <Tab.Screen name="My Businesses" component={MyBusinessesScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
}
