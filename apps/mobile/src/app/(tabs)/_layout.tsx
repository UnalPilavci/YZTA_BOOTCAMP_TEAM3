import { TabList, TabSlot, TabTrigger, Tabs } from 'expo-router/ui';

import { ScanTabBar } from '@/components/navigation/scan-tab-bar';

export default function TabsLayout() {
  return (
    <Tabs>
      <TabSlot />
      <ScanTabBar />
      <TabList style={{ display: 'none' }}>
        <TabTrigger name="index" href="/" />
        <TabTrigger name="fitness" href="/fitness" />
        <TabTrigger name="insights" href="/insights" />
        <TabTrigger name="profile" href="/profile" />
      </TabList>
    </Tabs>
  );
}
