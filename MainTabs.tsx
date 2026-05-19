import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { HomeScreen } from '../screens/HomeScreen';
import { ListingDetailScreen } from '../screens/ListingDetailScreen';
import { AccountScreen } from '../screens/account/AccountScreen';
import { CartScreen } from '../screens/cart/CartScreen';
import { OffersScreen } from '../screens/offers/OffersScreen';
import { SearchScreen } from '../screens/search/SearchScreen';

export type HomeStackParamList = {
  Home: undefined;
  ListingDetail: {
    listingId: string;
    listing?: unknown;
  };
};

export type MainTabParamList = {
  Browse: undefined;
  Search: undefined;
  Cart: undefined;
  Offers: undefined;
  Account: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator
      initialRouteName="Home"
      screenOptions={{
        contentStyle: { backgroundColor: '#F8FAF9' },
        headerShown: false,
      }}
    >
      <HomeStack.Screen component={HomeScreen} name="Home" />
      <HomeStack.Screen component={ListingDetailScreen} name="ListingDetail" />
    </HomeStack.Navigator>
  );
}

export function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Browse"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen component={HomeStackNavigator} name="Browse" options={{ title: 'Home' }} />
      <Tab.Screen component={SearchScreen} name="Search" />
      <Tab.Screen component={CartScreen} name="Cart" />
      <Tab.Screen component={OffersScreen} name="Offers" />
      <Tab.Screen component={AccountScreen} name="Account" />
    </Tab.Navigator>
  );
}
