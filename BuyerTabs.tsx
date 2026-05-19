import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { colors } from '../design-system/tokens/colors';
import { AccountScreen } from '../features/account/screens/AccountScreen';
import { HomeScreen } from '../features/marketplace/screens/HomeScreen';
import { NotificationsScreen } from '../features/notifications/screens/NotificationsScreen';
import { MyOrdersScreen } from '../features/orders/buyer/screens/MyOrdersScreen';
import { SearchScreen } from '../features/search/screens/SearchScreen';

export type BuyerTabParamList = {
  Home: undefined;
  Search: undefined;
  Notifications: undefined;
  Orders: undefined;
  Account: undefined;
};

const Tab = createBottomTabNavigator<BuyerTabParamList>();

export function BuyerTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.brand.emerald[950]
        },
        headerTintColor: colors.neutral[0],
        headerTitleStyle: {
          fontWeight: '700'
        },
        tabBarActiveTintColor: colors.accent.gold[600],
        tabBarInactiveTintColor: colors.neutral[500],
        tabBarStyle: {
          backgroundColor: colors.neutral[0],
          borderTopColor: colors.neutral[200]
        }
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Shop' }} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Orders" component={MyOrdersScreen} options={{ title: 'My Orders' }} />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
}
