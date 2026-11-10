import WinfyApp from '@/components/WinfyApp';
import { DEFAULT_WINFY_OS } from '@/lib/winfy/catalog';

export const dynamic = 'force-dynamic';

type WorkspacePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined): string | null {
  return typeof value === 'string' ? value : Array.isArray(value) ? (value[0] ?? null) : null;
}

export default async function WorkspacePage({ searchParams }: WorkspacePageProps) {
  const params = await searchParams;
  const os = firstParam(params.os) ?? DEFAULT_WINFY_OS;
  const desktopParam = firstParam(params.desktop);
  const initialDesktop = desktopParam === '1' || desktopParam === 'true';
  const initialWindow = firstParam(params.window) ?? firstParam(params.app);

  return (
    <WinfyApp
      initialOs={os}
      initialView="runwine"
      initialWindow={initialWindow}
      initialDesktop={initialDesktop}
    />
  );
}
