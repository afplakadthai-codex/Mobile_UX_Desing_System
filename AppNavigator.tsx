import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { HomeScreen } from '../screens/HomeScreen';
import { ListingDetailScreen } from '../screens/ListingDetailScreen';

export type RootStackParamList = {
  Home: undefined;
  ListingDetail: {
    listingId: string;
    listing?: unknown;
  };
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
