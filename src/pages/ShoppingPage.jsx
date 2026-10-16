import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { TabChips } from '@/components/ui/TabChips';
import GiftList from '@/features/gifts/GiftList';
import ShoppingList from '@/features/shopping/ShoppingList';

const TABS = [
  { value: 'shopping', label: 'קניות', Section: ShoppingList },
  { value: 'gifts', label: 'מתנות', Section: GiftList },
];

export default function ShoppingPage() {
  const [params, setParams] = useSearchParams();
  const tab = TABS.find((t) => t.value === params.get('tab')) || TABS[0];
  return (
    <div className="space-y-4">
      <PageHeader title="קניות ומתנות" />
      <TabChips tabs={TABS} value={tab.value} onChange={(v) => setParams({ tab: v }, { replace: true })} tone="bg-accent" />
      <tab.Section />
    </div>
  );
}
