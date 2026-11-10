import WinfyApp from '@/components/WinfyApp';

export const dynamic = 'force-dynamic';

export default function WineOnlinePage() {
  return (
    <WinfyApp
      initialOs="winfy-windows11-basic-22.04.3-desktop-amd64"
      initialView="wine-online"
      initialWindow="winegui"
    />
  );
}
