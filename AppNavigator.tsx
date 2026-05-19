import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { HomeScreen } from '../screens/HomeScreen';
import { ListingDetailScreen } from '../screens/ListingDetailScreen';
import { ProfileScreen } from './ProfileScreen';

export type RootStackParamList = {
  Home: undefined;
  ListingDetail: {
    listingId: string;
    listing?: unknown;
  };
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          contentStyle: { backgroundColor: '#F8FAF9' },
          headerShown: false,
        }}
      >
        <Stack.Screen component={HomeScreen} name="Home" />
        <Stack.Screen component={ListingDetailScreen} name="ListingDetail" />
        <Stack.Screen component={ProfileScreen} name="Profile" />
      </Stack.Navigator>
    </NavigationContainer>
  );
}