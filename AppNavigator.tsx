import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { MainTabs } from './MainTabs';
import { ProfileScreen } from '../screens/ProfileScreen';

export type RootStackParamList = {
  MainTabs: undefined;
  Profile: undefined;
  ListingDetail: {
    listingId: string;
    listing?: unknown;
  };
};

const RootStack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <RootStack.Navigator
        initialRouteName="MainTabs"
        screenOptions={{
          contentStyle: { backgroundColor: '#F8FAF9' },
          headerShown: false,
        }}
      >
        <RootStack.Screen component={MainTabs} name="MainTabs" />
        <RootStack.Screen component={ProfileScreen} name="Profile" />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}