import WinfyApp, { type WinfyViewMode } from '@/components/WinfyApp';
import { DEFAULT_WINFY_OS } from '@/lib/winfy/catalog';

export const dynamic = 'force-dynamic';

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined): string | null {
  return typeof value === 'string' ? value : Array.isArray(value) ? (value[0] ?? null) : null;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const os = firstParam(params.os) ?? DEFAULT_WINFY_OS;
  const rawView = firstParam(params.view);
  const initialView: WinfyViewMode =
    rawView === 'portal' || rawView === 'desktop' || rawView === 'wine-online' || rawView === 'runwine'
      ? rawView
      : 'runwine';
  const desktopParam = firstParam(params.desktop);
  const initialDesktop = desktopParam === '1' || desktopParam === 'true';
  const initialWindow = firstParam(params.window) ?? firstParam(params.app);

  return (
    <WinfyApp
      initialOs={os}
      initialView={initialView}
      initialWindow={initialWindow}
      initialDesktop={initialDesktop}
    />
  );
}
