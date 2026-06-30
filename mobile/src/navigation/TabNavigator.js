import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import TabBar from './TabBar';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import ChatInboxScreen from '../screens/ChatInboxScreen';
import AccountScreen from '../screens/AccountScreen';
// Note: the Post tab intercepts its press and routes to the root-stack PostAd modal.

const Tab = createBottomTabNavigator();

// Placeholder; the real Post flow lives in the root stack so it can be a full-screen
// multi-step modal. The tab press is intercepted in RootNavigator -> here we just need a screen.
function PostPlaceholder() {
  return null;
}

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <TabBar {...props} />}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen
        name="Post"
        component={PostPlaceholder}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('PostAd');
          },
        })}
      />
      <Tab.Screen name="Chat" component={ChatInboxScreen} />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
}
