import { MainTabs } from './MainTabs';

export type RootStackParamList = {
  MainTabs: undefined;
};

export function AppNavigator() {
  return <MainTabs />;
}