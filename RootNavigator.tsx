import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AppNavigator } from './AppNavigator';

const Stack = createNativeStackNavigator();

export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen component={AppNavigator} name="MainTabs" />
    </Stack.Navigator>
  );
}