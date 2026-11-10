'use client';

import { useState, type FormEvent } from 'react';
import type { ConfigStatus, FreeModel, MeResponse, ProbeResult, Repo } from '@/lib/types';

type TerminalWindowProps = {
  osId: string;
  me: MeResponse | null;
  config: ConfigStatus | null;
  models: FreeModel[];
  repos: Repo[];
  probe: ProbeResult | null;
  onRefreshProbe: () => Promise<ProbeResult | null>;
  onTestModel: (model: string) => Promise<void>;
  onOpenOpenCode: () => void;
};

type TerminalLine = {
  id: number;
  kind: 'cmd' | 'out' | 'err';
  text: string;
};

const INSTALL_SNIPPET = 'curl -fsSL https://opencode.ai/v2/install | bash';

export function TerminalWindow({
  osId,
  me,
  config,
  models,
  repos,
  probe,
  onRefreshProbe,
  onTestModel,
  onOpenOpenCode,
}: TerminalWindowProps) {
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      id: 1,
      kind: 'out',
      text: `Winfy Ubuntu 22.04 amd64 (${osId}) · OpenCode Web Shell\nType "help" to run live Vercel/Supabase/OpenCode commands.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  const append = (kind: TerminalLine['kind'], text: string) => {
    setLines((prev) => [...prev.slice(-80), { id: Date.now() + Math.random(), kind, text }]);
  };

  const copyInstall = async () => {
    try {
      await navigator.clipboard.writeText(INSTALL_SNIPPET);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      append('err', 'Clipboard access denied by browser.');
    }
  };

  const execute = async (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    append('cmd', `user@winegui-ubuntu22:~$ ${trimmed}`);
    const [cmd, ...args] = trimmed.split(/\s+/);

    if (cmd === 'clear') {
      setLines([]);
      return;
    }

    if (cmd === 'help') {
      append(
        'out',
        [
          'Available live commands:',
          '  opencode --version      Probe real OpenCode binary on Vercel (/api/runtime/poc)',
          '  opencode status         Show live Vercel + Supabase + OAuth + Model status',
          '  opencode models [term]  Search the 214 normal free models catalog',
          '  opencode test <model>   Run real CLI smoke test (requires ENABLE_MODEL_TESTS=1)',
          '  opencode open           Launch the OpenCode Agent IDE window',
          '  whoami                  Show verified Supabase / GitHub user identity',
          '  ls                      Show workspace folders & authorized GitHub repos',
          '  uname -a                Show Winfy / runtime platform summary',
          '  clear                   Clear terminal buffer',
        ].join('\n'),
      );
      return;
    }

    if (cmd === 'uname') {
      append('out', `Linux winegui-ubuntu22 6.1.0-winfy #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux (${osId})`);
      return;
    }

    if (cmd === 'pwd') {
      append('out', '/home/user/workspace');
      return;
    }

    if (cmd === 'whoami') {
      if (!me?.user) {
        append('out', 'guest (anonymous) — Sign in with GitHub in the OpenCode window to unlock Supabase sessions & repos.');
      } else {
        append('out', `supabase_uid=${me.user.id}\ngithub_login=${me.user.githubLogin ?? 'none'}\nemail=${me.user.email ?? 'hidden'}`);
      }
      return;
    }

    if (cmd === 'ls') {
      const base = ['Desktop/', 'Documents/', 'Downloads/', '.wine/'];
      const repoLines = repos.length
        ? repos.map((repo) => `repos/${repo.full_name} (${repo.default_branch})`)
        : ['repos/ (sign in with GitHub to list authorized repositories)'];
      append('out', [...base, ...repoLines].join('\n'));
      return;
    }

    if (cmd === 'opencode') {
      const sub = args[0] ?? 'status';
      if (sub === 'open') {
        onOpenOpenCode();
        append('out', 'Focused OpenCode Agent window.');
        return;
      }
      if (sub === '--version' || sub === 'version') {
        setRunning(true);
        const latest = (await onRefreshProbe()) ?? probe;
        setRunning(false);
        if (latest?.available) {
          append('out', `${latest.versionOutput ?? 'opencode'}\nbinaryPath=${latest.binaryPath}\nephemeralWorkspace=true`);
        } else {
          append('err', latest?.error ?? 'OpenCode binary probe unavailable.');
        }
        return;
      }
      if (sub === 'status') {
        if (!config) {
          append('err', 'Configuration has not finished loading.');
          return;
        }
        append(
          'out',
          [
            `catalog: ${config.catalog} (${models.length} models)`,
            `defaultModel: ${config.model}`,
            `supabaseConfigured: ${config.supabaseConfigured}`,
            `githubOauthEnabled: ${String(config.githubOauthEnabled ?? 'unknown')}`,
            `githubMode: ${config.githubMode}`,
            `vercelOidcConfigured: ${config.vercelOidcConfigured}`,
            `modelKeyConfigured: ${config.modelKeyConfigured}`,
            `missing: ${config.missing.length ? config.missing.join(', ') : 'none'}`,
          ].join('\n'),
        );
        return;
      }
      if (sub === 'models') {
        const q = (args[1] ?? '').toLowerCase();
        const hits = (q ? models.filter((m) => m.fullId.toLowerCase().includes(q)) : models).slice(0, 15);
        append(
          'out',
          hits.length
            ? hits.map((m) => `${m.fullId}  [${m.keylessOnVercel ? 'OIDC' : m.envKeys.join('|')}]`).join('\n')
            : `No models matched "${q}".`,
        );
        return;
      }
      if (sub === 'test') {
        const target = args[1] || config?.model || 'vercel/reflection/beam-free';
        setRunning(true);
        append('out', `Running real smoke test for ${target} (check OpenCode window for result card)…`);
        await onTestModel(target);
        setRunning(false);
        return;
      }
    }

    append('err', `Unknown command: "${trimmed}". Type "help" to see supported commands.`);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const current = input;
    setInput('');
    void execute(current);
  };

  return (
    <div className="term-win">
      <div className="term-install-bar">
        <span>Standalone Linux / external Winfy container install:</span>
        <code>{INSTALL_SNIPPET}</code>
        <button type="button" className="win-btn small" onClick={() => void copyInstall()}>
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      <div className="term-output" role="log" aria-live="polite">
        {lines.map((line) => (
          <pre key={line.id} className={`term-line ${line.kind}`}>
            {line.text}
          </pre>
        ))}
      </div>

      <form className="term-input-row" onSubmit={handleSubmit}>
        <span className="term-prompt">user@winegui-ubuntu22:~$</span>
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Type 'help', 'opencode --version', 'opencode status', 'opencode models'…"
          disabled={running}
          aria-label="Shell command"
        />
        <button className="win-btn small primary" type="submit" disabled={running}>
          {running ? 'Running…' : 'Run'}
        </button>
      </form>
    </div>
  );
}
