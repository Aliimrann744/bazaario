import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import ResultsScreen from '../screens/ResultsScreen';
import ListingDetailScreen from '../screens/ListingDetailScreen';
import SellerProfileScreen from '../screens/SellerProfileScreen';
import ChatThreadScreen from '../screens/ChatThreadScreen';
import PostAdScreen from '../screens/PostAdScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import FavouritesScreen from '../screens/FavouritesScreen';
import MyListingsScreen from '../screens/MyListingsScreen';
import { colors, typography } from '../theme/tokens';

const Stack = createNativeStackNavigator();

const baseHeader = {
  headerStyle: { backgroundColor: colors.surface },
  headerTintColor: colors.ink,
  headerTitleStyle: { fontWeight: typography.weight.bold, fontSize: typography.sizes.md },
  headerShadowVisible: false,
  headerBackTitleVisible: false,
  contentStyle: { backgroundColor: colors.bg },
};

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={baseHeader}>
      <Stack.Screen name="Tabs" component={TabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="Results" component={ResultsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ListingDetail" component={ListingDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SellerProfile" component={SellerProfileScreen} options={{ title: 'Seller' }} />
      <Stack.Screen name="ChatThread" component={ChatThreadScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="PostAd"
        component={PostAdScreen}
        options={{ headerShown: false, presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false, presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit profile' }} />
      <Stack.Screen name="Favourites" component={FavouritesScreen} options={{ title: 'Favourites' }} />
      <Stack.Screen name="MyListings" component={MyListingsScreen} options={{ title: 'My listings' }} />
    </Stack.Navigator>
  );
}
