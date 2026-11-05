/**
 * Normal (non-Zen) free models from OpenCode's own official model catalog.
 *
 * Generated from anomalyco/opencode dev
 * packages/core/src/models-dev/snapshot.txt (the bundled models.dev catalog),
 * then VALIDATED against the pinned @opencode/cli-linux-x64 v2.2.5 binary by
 * running `opencode --standalone models` with all provider env names present:
 * every id below is resolvable by the binary actually deployed on Vercel.
 *
 * Selection: type=chat, zero input AND output cost, tool-capable, not deprecated,
 * from ordinary providers with a declared credential env var. The OpenCode Zen
 * ("opencode" / "opencode-go") providers are deliberately EXCLUDED: those free
 * models are a promotional gateway and returned `provider.free-limit` (429).
 *
 * These are the normal free models OpenCode supports via `/connect`. Most need a
 * free provider API key (`envKeys`). Models under the `vercel` provider are
 * keyless on Vercel: OpenCode's vercel-ai-gateway provider accepts
 * `AI_GATEWAY_API_KEY` or the automatically injected `VERCEL_OIDC_TOKEN`
 * (verified in packages/ai/src/providers/vercel-ai-gateway.ts).
 *
 * No credentials or OpenCode source code are included here — only public
 * model metadata. No mock replies and no silent model switching.
 */

export type FreeModel = {
  provider: string;
  id: string;
  fullId: string;
  name: string;
  context: number;
  output: number;
  /** Zero input and zero output price in the official catalog. */
  cost: 0;
  /** Names only, never values. */
  envKeys: string[];
  /** Uses Vercel's automatic OIDC token instead of a user-supplied key. */
  keylessOnVercel: boolean;
  preferred: boolean;
};

/** Default: a normal free model that works on Vercel with no new API key. */
export const DEFAULT_FREE_MODEL = 'vercel/reflection/beam-free';

export const PREFERRED_FREE_IDS = [
  "vercel/reflection/beam-free",
  "vercel/poolside/laguna-s-2.1-free",
  "vercel/nvidia/nemotron-3.5-lightning-free",
  "vercel/stealth/glyph-cluster",
  "amd/DeepSeek-V4.1-Flash",
  "nvidia/deepseek-ai/deepseek-v4.1-flash",
  "openrouter/openrouter/free",
  "openrouter/google/gemma-4-31b-it:free",
  "openrouter/cohere/north-mini-code:free",
  "kilo/kilo-auto/free",
] as const;

export const FREE_MODELS: FreeModel[] = [
  { provider: "vercel", id: "reflection/beam-free", fullId: "vercel/reflection/beam-free", name: "Beam 1.0 (Free)", context: 1048576, output: 131072, cost: 0, envKeys: ["AI_GATEWAY_API_KEY", "VERCEL_OIDC_TOKEN"], keylessOnVercel: true, preferred: true },
  { provider: "vercel", id: "poolside/laguna-s-2.1-free", fullId: "vercel/poolside/laguna-s-2.1-free", name: "Laguna S 2.1 Free", context: 256000, output: 32768, cost: 0, envKeys: ["AI_GATEWAY_API_KEY", "VERCEL_OIDC_TOKEN"], keylessOnVercel: true, preferred: true },
  { provider: "vercel", id: "nvidia/nemotron-3.5-lightning-free", fullId: "vercel/nvidia/nemotron-3.5-lightning-free", name: "Nemotron 3.5 Lightning Free", context: 1000000, output: 65000, cost: 0, envKeys: ["AI_GATEWAY_API_KEY", "VERCEL_OIDC_TOKEN"], keylessOnVercel: true, preferred: true },
  { provider: "vercel", id: "stealth/glyph-cluster", fullId: "vercel/stealth/glyph-cluster", name: "Glyph Cluster", context: 256000, output: 256000, cost: 0, envKeys: ["AI_GATEWAY_API_KEY", "VERCEL_OIDC_TOKEN"], keylessOnVercel: true, preferred: true },
  { provider: "amd", id: "DeepSeek-V4.1-Flash", fullId: "amd/DeepSeek-V4.1-Flash", name: "DeepSeek V4.1 Flash", context: 1048576, output: 384000, cost: 0, envKeys: ["AMD_API_KEY"], keylessOnVercel: false, preferred: true },
  { provider: "nvidia", id: "deepseek-ai/deepseek-v4.1-flash", fullId: "nvidia/deepseek-ai/deepseek-v4.1-flash", name: "DeepSeek V4.1 Flash", context: 1000000, output: 384000, cost: 0, envKeys: ["NVIDIA_API_KEY"], keylessOnVercel: false, preferred: true },
  { provider: "openrouter", id: "openrouter/free", fullId: "openrouter/openrouter/free", name: "Free Models Router", context: 200000, output: 8000, cost: 0, envKeys: ["OPENROUTER_API_KEY"], keylessOnVercel: false, preferred: true },
  { provider: "openrouter", id: "google/gemma-4-31b-it:free", fullId: "openrouter/google/gemma-4-31b-it:free", name: "Gemma 4 31B (free)", context: 262144, output: 32768, cost: 0, envKeys: ["OPENROUTER_API_KEY"], keylessOnVercel: false, preferred: true },
  { provider: "openrouter", id: "cohere/north-mini-code:free", fullId: "openrouter/cohere/north-mini-code:free", name: "North Mini Code (free)", context: 256000, output: 64000, cost: 0, envKeys: ["OPENROUTER_API_KEY"], keylessOnVercel: false, preferred: true },
  { provider: "kilo", id: "kilo-auto/free", fullId: "kilo/kilo-auto/free", name: "Auto Free", context: 256000, output: 32768, cost: 0, envKeys: ["KILO_API_KEY"], keylessOnVercel: false, preferred: true },
  { provider: "vercel", id: "reflection/beam", fullId: "vercel/reflection/beam", name: "Beam 1.0", context: 1048576, output: 131072, cost: 0, envKeys: ["AI_GATEWAY_API_KEY", "VERCEL_OIDC_TOKEN"], keylessOnVercel: true, preferred: false },
  { provider: "agnes", id: "agnes-2.5-flash", fullId: "agnes/agnes-2.5-flash", name: "Agnes 2.5 Flash", context: 512000, output: 65536, cost: 0, envKeys: ["AGNES_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "agnes", id: "agnes-3.0-flash", fullId: "agnes/agnes-3.0-flash", name: "Agnes 3.0 Flash", context: 512000, output: 65536, cost: 0, envKeys: ["AGNES_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "aihubmix", id: "coding-glm-5.1-free", fullId: "aihubmix/coding-glm-5.1-free", name: "Coding GLM 5.1 (free)", context: 200000, output: 131072, cost: 0, envKeys: ["AIHUBMIX_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "aihubmix", id: "coding-minimax-m2.7-free", fullId: "aihubmix/coding-minimax-m2.7-free", name: "Coding MiniMax M2.7 (Free)", context: 204800, output: 128100, cost: 0, envKeys: ["AIHUBMIX_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "aihubmix", id: "glm-4.7-flash-free", fullId: "aihubmix/glm-4.7-flash-free", name: "GLM-4.7-Flash (free)", context: 200000, output: 131072, cost: 0, envKeys: ["AIHUBMIX_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "aihubmix", id: "coding-glm-5.2-free", fullId: "aihubmix/coding-glm-5.2-free", name: "GLM-5.2 (Coding, free)", context: 1000000, output: 131072, cost: 0, envKeys: ["AIHUBMIX_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "aihubmix", id: "coding-glm-5.3-free", fullId: "aihubmix/coding-glm-5.3-free", name: "GLM-5.3 (Coding, free)", context: 1000000, output: 131072, cost: 0, envKeys: ["AIHUBMIX_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "aihubmix", id: "coding-glm-5.3-flash-free", fullId: "aihubmix/coding-glm-5.3-flash-free", name: "GLM-5.3-Flash (Coding, free)", context: 1000000, output: 131072, cost: 0, envKeys: ["AIHUBMIX_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "aihubmix", id: "ling-3.0-flash-free", fullId: "aihubmix/ling-3.0-flash-free", name: "Ling 3.0 Flash (free)", context: 262144, output: 32768, cost: 0, envKeys: ["AIHUBMIX_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "aihubmix", id: "nemotron-3-nano-omni-30b-a3b-reasoning-free", fullId: "aihubmix/nemotron-3-nano-omni-30b-a3b-reasoning-free", name: "Nemotron 3 Nano Omni 30B A3B Reasoning (free)", context: 256000, output: 65536, cost: 0, envKeys: ["AIHUBMIX_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "aihubmix", id: "nemotron-3-super-120b-a12b-free", fullId: "aihubmix/nemotron-3-super-120b-a12b-free", name: "Nemotron 3 Super 120B A12B (free)", context: 262144, output: 262144, cost: 0, envKeys: ["AIHUBMIX_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "aihubmix", id: "nemotron-3-ultra-550b-a55b-free", fullId: "aihubmix/nemotron-3-ultra-550b-a55b-free", name: "Nemotron 3 Ultra 550B A55B (free)", context: 1000000, output: 128000, cost: 0, envKeys: ["AIHUBMIX_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "aihubmix", id: "nemotron-3.5-lightning-free", fullId: "aihubmix/nemotron-3.5-lightning-free", name: "Nemotron 3.5 Lightning 30B A3B (free)", context: 262144, output: 262144, cost: 0, envKeys: ["AIHUBMIX_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "aihubmix", id: "qwen3.8-flash-free", fullId: "aihubmix/qwen3.8-flash-free", name: "Qwen3.8 Flash (free)", context: 1000000, output: 131072, cost: 0, envKeys: ["AIHUBMIX_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "aihubmix", id: "qwen3.8-max-free", fullId: "aihubmix/qwen3.8-max-free", name: "Qwen3.8 Max (free)", context: 1000000, output: 131072, cost: 0, envKeys: ["AIHUBMIX_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "amd", id: "DeepSeek-V4-Flash", fullId: "amd/DeepSeek-V4-Flash", name: "DeepSeek V4 Flash 0731", context: 1048576, output: 384000, cost: 0, envKeys: ["AMD_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "amd", id: "GLM-5.3-Flash", fullId: "amd/GLM-5.3-Flash", name: "GLM-5.3-Flash", context: 262144, output: 131072, cost: 0, envKeys: ["AMD_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "amd", id: "Gemma-4-31B-IT", fullId: "amd/Gemma-4-31B-IT", name: "Gemma 4 31B IT", context: 262144, output: 32768, cost: 0, envKeys: ["AMD_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "amd", id: "MiMo-V2.6-Flash", fullId: "amd/MiMo-V2.6-Flash", name: "MiMo-V2.6-Flash", context: 1048576, output: 131072, cost: 0, envKeys: ["AMD_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "amd", id: "MiniCPM-V-4.7-1B", fullId: "amd/MiniCPM-V-4.7-1B", name: "MiniCPM-V 4.7 1B", context: 262144, output: 262144, cost: 0, envKeys: ["AMD_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "amd", id: "MiniCPM-V-4.7-35B-A3B", fullId: "amd/MiniCPM-V-4.7-35B-A3B", name: "MiniCPM-V 4.7 35B-A3B", context: 262144, output: 262144, cost: 0, envKeys: ["AMD_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "amd", id: "MiniCPM5-2B", fullId: "amd/MiniCPM5-2B", name: "MiniCPM5-2B", context: 131072, output: 131072, cost: 0, envKeys: ["AMD_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "amd", id: "Qwen3.8-27B", fullId: "amd/Qwen3.8-27B", name: "Qwen3.8 27B", context: 262144, output: 32768, cost: 0, envKeys: ["AMD_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "amd", id: "Qwen3.8-Flash-Next", fullId: "amd/Qwen3.8-Flash-Next", name: "Qwen3.8 Flash Next", context: 262144, output: 131072, cost: 0, envKeys: ["AMD_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "atomic-chat", id: "Meta-Llama-3_1-8B-Instruct-GGUF", fullId: "atomic-chat/Meta-Llama-3_1-8B-Instruct-GGUF", name: "Meta Llama 3.1 8B Instruct (GGUF)", context: 131072, output: 4096, cost: 0, envKeys: ["ATOMIC_CHAT_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "atomic-chat", id: "Qwen3_5-9B-MLX-4bit", fullId: "atomic-chat/Qwen3_5-9B-MLX-4bit", name: "Qwen 3.5 9B (MLX 4-bit)", context: 32768, output: 8192, cost: 0, envKeys: ["ATOMIC_CHAT_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "atomic-chat", id: "Qwen3_5-9B-Q4_K_M", fullId: "atomic-chat/Qwen3_5-9B-Q4_K_M", name: "Qwen 3.5 9B (Q4_K_M)", context: 32768, output: 8192, cost: 0, envKeys: ["ATOMIC_CHAT_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "bothub", id: "gemma-4-31b-it:free", fullId: "bothub/gemma-4-31b-it:free", name: "Gemma 4 31B IT (free)", context: 262144, output: 32768, cost: 0, envKeys: ["BOTHUB_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "bothub", id: "nemotron-3-ultra-550b-a55b:free", fullId: "bothub/nemotron-3-ultra-550b-a55b:free", name: "Nemotron 3 Ultra (free)", context: 1000000, output: 128000, cost: 0, envKeys: ["BOTHUB_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "cloudflare-ai-gateway", id: "reflection-ai/beam-1.0-501b-a23b", fullId: "cloudflare-ai-gateway/reflection-ai/beam-1.0-501b-a23b", name: "Beam 1.0 501B A23B", context: 262144, output: 131072, cost: 0, envKeys: ["CLOUDFLARE_API_TOKEN", "CLOUDFLARE_ACCOUNT_ID", "CLOUDFLARE_GATEWAY_ID"], keylessOnVercel: false, preferred: false },
  { provider: "cohere", id: "north-mini-code-1-0", fullId: "cohere/north-mini-code-1-0", name: "North Mini Code", context: 256000, output: 64000, cost: 0, envKeys: ["COHERE_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "empiriolabs", id: "glm-4-5-flash", fullId: "empiriolabs/glm-4-5-flash", name: "GLM 4.5 Flash", context: 200000, output: 98304, cost: 0, envKeys: ["EMPIRIOLABS_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "empiriolabs", id: "glm-4-6v-flash", fullId: "empiriolabs/glm-4-6v-flash", name: "GLM 4.6V Flash", context: 128000, output: 32768, cost: 0, envKeys: ["EMPIRIOLABS_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "empiriolabs", id: "glm-4-7-flash", fullId: "empiriolabs/glm-4-7-flash", name: "GLM 4.7 Flash", context: 200000, output: 131072, cost: 0, envKeys: ["EMPIRIOLABS_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "gitlab", id: "duo-chat-fable-5", fullId: "gitlab/duo-chat-fable-5", name: "Agentic Chat (Claude Fable 5)", context: 1000000, output: 128000, cost: 0, envKeys: ["GITLAB_TOKEN"], keylessOnVercel: false, preferred: false },
  { provider: "gitlab", id: "duo-chat-fable-5-1", fullId: "gitlab/duo-chat-fable-5-1", name: "Agentic Chat (Claude Fable 5.1)", context: 1000000, output: 128000, cost: 0, envKeys: ["GITLAB_TOKEN"], keylessOnVercel: false, preferred: false },
  { provider: "gitlab", id: "duo-chat-haiku-4-5", fullId: "gitlab/duo-chat-haiku-4-5", name: "Agentic Chat (Claude Haiku 4.5)", context: 200000, output: 64000, cost: 0, envKeys: ["GITLAB_TOKEN"], keylessOnVercel: false, preferred: false },
  { provider: "gitlab", id: "duo-chat-haiku-5-5", fullId: "gitlab/duo-chat-haiku-5-5", name: "Agentic Chat (Claude Haiku 5.5)", context: 1000000, output: 128000, cost: 0, envKeys: ["GITLAB_TOKEN"], keylessOnVercel: false, preferred: false },
  { provider: "gitlab", id: "duo-chat-opus-4-5", fullId: "gitlab/duo-chat-opus-4-5", name: "Agentic Chat (Claude Opus 4.5)", context: 200000, output: 64000, cost: 0, envKeys: ["GITLAB_TOKEN"], keylessOnVercel: false, preferred: false },
  { provider: "gitlab", id: "duo-chat-opus-4-6", fullId: "gitlab/duo-chat-opus-4-6", name: "Agentic Chat (Claude Opus 4.6)", context: 1000000, output: 128000, cost: 0, envKeys: ["GITLAB_TOKEN"], keylessOnVercel: false, preferred: false },
  { provider: "gitlab", id: "duo-chat-opus-4-7", fullId: "gitlab/duo-chat-opus-4-7", name: "Agentic Chat (Claude Opus 4.7)", context: 1000000, output: 128000, cost: 0, envKeys: ["GITLAB_TOKEN"], keylessOnVercel: false, preferred: false },
  { provider: "gitlab", id: "duo-chat-opus-4-8", fullId: "gitlab/duo-chat-opus-4-8", name: "Agentic Chat (Claude Opus 4.8)", context: 1000000, output: 128000, cost: 0, envKeys: ["GITLAB_TOKEN"], keylessOnVercel: false, preferred: false },
  { provider: "gitlab", id: "duo-chat-opus-5", fullId: "gitlab/duo-chat-opus-5", name: "Agentic Chat (Claude Opus 5)", context: 1000000, output: 128000, cost: 0, envKeys: ["GITLAB_TOKEN"], keylessOnVercel: false, preferred: false },
  { provider: "gitlab", id: "duo-chat-opus-5-5", fullId: "gitlab/duo-chat-opus-5-5", name: "Agentic Chat (Claude Opus 5.5)", context: 1000000, output: 128000, cost: 0, envKeys: ["GITLAB_TOKEN"], keylessOnVercel: false, preferred: false },
  { provider: "gitlab", id: "duo-chat-sonnet-4-6", fullId: "gitlab/duo-chat-sonnet-4-6", name: "Agentic Chat (Claude Sonnet 4.6)", context: 1000000, output: 64000, cost: 0, envKeys: ["GITLAB_TOKEN"], keylessOnVercel: false, preferred: false },
  { provider: "gitlab", id: "duo-chat-sonnet-5", fullId: "gitlab/duo-chat-sonnet-5", name: "Agentic Chat (Claude Sonnet 5)", context: 1000000, output: 64000, cost: 0, envKeys: ["GITLAB_TOKEN"], keylessOnVercel: false, preferred: false },
  { provider: "gitlab", id: "duo-chat-sonnet-5-5", fullId: "gitlab/duo-chat-sonnet-5-5", name: "Agentic Chat (Claude Sonnet 5.5)", context: 1000000, output: 64000, cost: 0, envKeys: ["GITLAB_TOKEN"], keylessOnVercel: false, preferred: false },
  { provider: "gitlab", id: "duo-chat-gpt-5-2", fullId: "gitlab/duo-chat-gpt-5-2", name: "Agentic Chat (GPT-5.2)", context: 400000, output: 128000, cost: 0, envKeys: ["GITLAB_TOKEN"], keylessOnVercel: false, preferred: false },
  { provider: "gitlab", id: "duo-chat-gpt-5-4-mini", fullId: "gitlab/duo-chat-gpt-5-4-mini", name: "Agentic Chat (GPT-5.4 Mini)", context: 400000, output: 128000, cost: 0, envKeys: ["GITLAB_TOKEN"], keylessOnVercel: false, preferred: false },
  { provider: "gitlab", id: "duo-chat-gpt-5-4", fullId: "gitlab/duo-chat-gpt-5-4", name: "Agentic Chat (GPT-5.4)", context: 1050000, output: 128000, cost: 0, envKeys: ["GITLAB_TOKEN"], keylessOnVercel: false, preferred: false },
  { provider: "gitlab", id: "duo-chat-gpt-5-5", fullId: "gitlab/duo-chat-gpt-5-5", name: "Agentic Chat (GPT-5.5)", context: 1050000, output: 128000, cost: 0, envKeys: ["GITLAB_TOKEN"], keylessOnVercel: false, preferred: false },
  { provider: "gitlab", id: "duo-chat-gpt-5-6-luna", fullId: "gitlab/duo-chat-gpt-5-6-luna", name: "Agentic Chat (GPT-5.6 Luna)", context: 1050000, output: 128000, cost: 0, envKeys: ["GITLAB_TOKEN"], keylessOnVercel: false, preferred: false },
  { provider: "gitlab", id: "duo-chat-gpt-5-6-sol", fullId: "gitlab/duo-chat-gpt-5-6-sol", name: "Agentic Chat (GPT-5.6 Sol)", context: 1050000, output: 128000, cost: 0, envKeys: ["GITLAB_TOKEN"], keylessOnVercel: false, preferred: false },
  { provider: "gitlab", id: "duo-chat-gpt-5-6-terra", fullId: "gitlab/duo-chat-gpt-5-6-terra", name: "Agentic Chat (GPT-5.6 Terra)", context: 1050000, output: 128000, cost: 0, envKeys: ["GITLAB_TOKEN"], keylessOnVercel: false, preferred: false },
  { provider: "gitlab", id: "duo-chat-gpt-6-astra", fullId: "gitlab/duo-chat-gpt-6-astra", name: "Agentic Chat (GPT-6 Astra)", context: 1050000, output: 128000, cost: 0, envKeys: ["GITLAB_TOKEN"], keylessOnVercel: false, preferred: false },
  { provider: "gitlab", id: "duo-chat-gpt-6-luna", fullId: "gitlab/duo-chat-gpt-6-luna", name: "Agentic Chat (GPT-6 Luna)", context: 1050000, output: 128000, cost: 0, envKeys: ["GITLAB_TOKEN"], keylessOnVercel: false, preferred: false },
  { provider: "gitlab", id: "duo-chat-gpt-6-sol", fullId: "gitlab/duo-chat-gpt-6-sol", name: "Agentic Chat (GPT-6 Sol)", context: 1050000, output: 128000, cost: 0, envKeys: ["GITLAB_TOKEN"], keylessOnVercel: false, preferred: false },
  { provider: "gitlab", id: "duo-chat-gpt-6-1-sol", fullId: "gitlab/duo-chat-gpt-6-1-sol", name: "Agentic Chat (GPT-6.1 Sol)", context: 1050000, output: 128000, cost: 0, envKeys: ["GITLAB_TOKEN"], keylessOnVercel: false, preferred: false },
  { provider: "hetzner", id: "Qwen/Qwen3.6-35B-A3B-FP8", fullId: "hetzner/Qwen/Qwen3.6-35B-A3B-FP8", name: "Qwen3.6 35B A3B FP8", context: 262144, output: 262144, cost: 0, envKeys: ["HETZNER_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "hetzner", id: "Qwen3.8-27B", fullId: "hetzner/Qwen3.8-27B", name: "Qwen3.8-27B", context: 262144, output: 262144, cost: 0, envKeys: ["HETZNER_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "huggingface", id: "zai-org/GLM-4.7-Flash", fullId: "huggingface/zai-org/GLM-4.7-Flash", name: "GLM-4.7-Flash", context: 200000, output: 128000, cost: 0, envKeys: ["HF_TOKEN"], keylessOnVercel: false, preferred: false },
  { provider: "inferx", id: "Agents-A1", fullId: "inferx/Agents-A1", name: "Agents-A1", context: 262000, output: 100000, cost: 0, envKeys: ["INFERX_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "inferx", id: "Devstral-2-123B-Instruct-2512-int4-AutoRound", fullId: "inferx/Devstral-2-123B-Instruct-2512-int4-AutoRound", name: "Devstral-2-123B-Instruct-2512-int4-AutoRound", context: 128000, output: 128000, cost: 0, envKeys: ["INFERX_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "inferx", id: "gemma-4-31B-it-fp8", fullId: "inferx/gemma-4-31B-it-fp8", name: "Gemma 4 31B IT FP8", context: 262144, output: 32768, cost: 0, envKeys: ["INFERX_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "inferx", id: "Ornith-1.0-35B-FP8", fullId: "inferx/Ornith-1.0-35B-FP8", name: "Ornith-1.0-35B-FP8", context: 262000, output: 100000, cost: 0, envKeys: ["INFERX_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "inferx", id: "Qwen3-Coder-Next-FP8", fullId: "inferx/Qwen3-Coder-Next-FP8", name: "Qwen3 Coder Next FP8", context: 256144, output: 65536, cost: 0, envKeys: ["INFERX_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "inferx", id: "Qwen3-Coder-Next-FP8-no-thinking", fullId: "inferx/Qwen3-Coder-Next-FP8-no-thinking", name: "Qwen3-Coder-Next-FP8-no-thinking", context: 260000, output: 65536, cost: 0, envKeys: ["INFERX_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "inferx", id: "Qwen3.6-27B-FP8", fullId: "inferx/Qwen3.6-27B-FP8", name: "Qwen3.6 27B FP8", context: 262144, output: 65536, cost: 0, envKeys: ["INFERX_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "inferx", id: "Qwen3.6-35B-A3B-FP8", fullId: "inferx/Qwen3.6-35B-A3B-FP8", name: "Qwen3.6 35B A3B FP8", context: 262000, output: 65536, cost: 0, envKeys: ["INFERX_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "inferx", id: "Qwen3.6-35B-A3B-fp8-no-thinking", fullId: "inferx/Qwen3.6-35B-A3B-fp8-no-thinking", name: "Qwen3.6-35B-A3B-fp8-no-thinking", context: 262000, output: 65536, cost: 0, envKeys: ["INFERX_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "inferx", id: "deepseek-v4-flash", fullId: "inferx/deepseek-v4-flash", name: "deepseek-v4-flash", context: 1000000, output: 100000, cost: 0, envKeys: ["INFERX_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "inferx", id: "mimo-v25", fullId: "inferx/mimo-v25", name: "mimo-v25", context: 1000000, output: 100000, cost: 0, envKeys: ["INFERX_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "iteracompute", id: "qwen/qwen3.8-27b", fullId: "iteracompute/qwen/qwen3.8-27b", name: "Qwen3.8 27B", context: 131072, output: 8192, cost: 0, envKeys: ["ITERACOMPUTE_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "kenari", id: "glm-4-7-flash:free", fullId: "kenari/glm-4-7-flash:free", name: "GLM-4.7-Flash (Free)", context: 200000, output: 131072, cost: 0, envKeys: ["KENARI_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "kenari", id: "hy3:free", fullId: "kenari/hy3:free", name: "Hy3 (Free)", context: 256000, output: 128000, cost: 0, envKeys: ["KENARI_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "kenari", id: "nemotron-3-super-120b-a12b:free", fullId: "kenari/nemotron-3-super-120b-a12b:free", name: "Nemotron 3 Super 120B A12B (Free)", context: 262144, output: 262144, cost: 0, envKeys: ["KENARI_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "kilo", id: "openrouter/auto", fullId: "kilo/openrouter/auto", name: "Auto Router", context: 2000000, output: 32768, cost: 0, envKeys: ["KILO_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "kilo", id: "cohere/north-mini-code:free", fullId: "kilo/cohere/north-mini-code:free", name: "Cohere: North Mini Code (free)", context: 256000, output: 64000, cost: 0, envKeys: ["KILO_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "kilo", id: "dots-studio/dots-3-note-preview:free", fullId: "kilo/dots-studio/dots-3-note-preview:free", name: "Dots Studio: Dots3-Note Preview (free)", context: 512000, output: 460800, cost: 0, envKeys: ["KILO_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "kilo", id: "liquid/lfm-2.5-2.6b:free", fullId: "kilo/liquid/lfm-2.5-2.6b:free", name: "LiquidAI: LFM2.5-2.6B (free)", context: 65536, output: 8192, cost: 0, envKeys: ["KILO_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "kilo", id: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free", fullId: "kilo/nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free", name: "NVIDIA: Nemotron 3 Nano Omni (free)", context: 256000, output: 65536, cost: 0, envKeys: ["KILO_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "kilo", id: "nvidia/nemotron-3-ultra-550b-a55b:free", fullId: "kilo/nvidia/nemotron-3-ultra-550b-a55b:free", name: "NVIDIA: Nemotron 3 Ultra (free)", context: 1000000, output: 65536, cost: 0, envKeys: ["KILO_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "kilo", id: "nvidia/nemotron-3.5-lightning:free", fullId: "kilo/nvidia/nemotron-3.5-lightning:free", name: "NVIDIA: Nemotron 3.5 Lightning (free)", context: 1000000, output: 65536, cost: 0, envKeys: ["KILO_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "kilo", id: "nvidia/nemotron-3.5-super-vl:free", fullId: "kilo/nvidia/nemotron-3.5-super-vl:free", name: "NVIDIA: Nemotron 3.5 Super VL (free)", context: 1000000, output: 131072, cost: 0, envKeys: ["KILO_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "kilo", id: "openrouter/free", fullId: "kilo/openrouter/free", name: "OpenRouter Free Models Router", context: 200000, output: 32768, cost: 0, envKeys: ["KILO_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "kilo", id: "poolside/laguna-s-2.1:free", fullId: "kilo/poolside/laguna-s-2.1:free", name: "Poolside: Laguna S 2.1 (free)", context: 262144, output: 32768, cost: 0, envKeys: ["KILO_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "kilo", id: "poolside/laguna-xs-2.1:free", fullId: "kilo/poolside/laguna-xs-2.1:free", name: "Poolside: Laguna XS 2.1 (free)", context: 262144, output: 32768, cost: 0, envKeys: ["KILO_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "kilo", id: "recursive/flint-v1.0:free", fullId: "kilo/recursive/flint-v1.0:free", name: "Recursive: Flint (free)", context: 262144, output: 235929, cost: 0, envKeys: ["KILO_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "kilo", id: "reflection/beam-free", fullId: "kilo/reflection/beam-free", name: "Reflection: Beam 1.0 (free)", context: 1048576, output: 131072, cost: 0, envKeys: ["KILO_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "kilo", id: "stealth/glyph-cluster", fullId: "kilo/stealth/glyph-cluster", name: "Stealth: Glyph Cluster (free)", context: 256000, output: 256000, cost: 0, envKeys: ["KILO_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "kilo", id: "xingchen-agi/xing4.0-29b-a4b:free", fullId: "kilo/xingchen-agi/xing4.0-29b-a4b:free", name: "XingChen: Xing4.0 29B A4B (free)", context: 262144, output: 235929, cost: 0, envKeys: ["KILO_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "llmgateway", id: "auto", fullId: "llmgateway/auto", name: "Auto Route", context: 128000, output: 16384, cost: 0, envKeys: ["LLMGATEWAY_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "llmgateway", id: "custom", fullId: "llmgateway/custom", name: "Custom Model", context: 128000, output: 16384, cost: 0, envKeys: ["LLMGATEWAY_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "llmtr", id: "poolside/laguna-xs-2.1", fullId: "llmtr/poolside/laguna-xs-2.1", name: "Laguna XS 2.1", context: 262144, output: 32768, cost: 0, envKeys: ["LLMTR_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "lmstudio", id: "openai/gpt-oss-20b", fullId: "lmstudio/openai/gpt-oss-20b", name: "GPT OSS 20B", context: 131072, output: 32768, cost: 0, envKeys: ["LMSTUDIO_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "lmstudio", id: "qwen/qwen3-30b-a3b-2507", fullId: "lmstudio/qwen/qwen3-30b-a3b-2507", name: "Qwen3 30B A3B 2507", context: 262144, output: 16384, cost: 0, envKeys: ["LMSTUDIO_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "lmstudio", id: "qwen/qwen3-coder-30b", fullId: "lmstudio/qwen/qwen3-coder-30b", name: "Qwen3 Coder 30B", context: 262144, output: 65536, cost: 0, envKeys: ["LMSTUDIO_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "lynkr", id: "lynkr-auto", fullId: "lynkr/lynkr-auto", name: "Lynkr Auto (complexity routing)", context: 128000, output: 8192, cost: 0, envKeys: ["LYNKR_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "meganova", id: "mistralai/Mistral-Small-3.2-24B-Instruct-2506", fullId: "meganova/mistralai/Mistral-Small-3.2-24B-Instruct-2506", name: "Mistral Small 3.2 24B Instruct", context: 32768, output: 8192, cost: 0, envKeys: ["MEGANOVA_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "merge-gateway", id: "nvidia/nemotron-3.5-lightning-30b-a3b", fullId: "merge-gateway/nvidia/nemotron-3.5-lightning-30b-a3b", name: "Nemotron 3.5 Lightning 30B A3B", context: 1000000, output: 262144, cost: 0, envKeys: ["MERGE_GATEWAY_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "modelscope", id: "ZhipuAI/GLM-4.5", fullId: "modelscope/ZhipuAI/GLM-4.5", name: "GLM-4.5", context: 131072, output: 98304, cost: 0, envKeys: ["MODELSCOPE_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "modelscope", id: "ZhipuAI/GLM-4.6", fullId: "modelscope/ZhipuAI/GLM-4.6", name: "GLM-4.6", context: 202752, output: 98304, cost: 0, envKeys: ["MODELSCOPE_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "modelscope", id: "Qwen/Qwen3-235B-A22B-Instruct-2507", fullId: "modelscope/Qwen/Qwen3-235B-A22B-Instruct-2507", name: "Qwen3 235B A22B Instruct 2507", context: 262144, output: 131072, cost: 0, envKeys: ["MODELSCOPE_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "modelscope", id: "Qwen/Qwen3-30B-A3B-Instruct-2507", fullId: "modelscope/Qwen/Qwen3-30B-A3B-Instruct-2507", name: "Qwen3 30B A3B Instruct 2507", context: 262144, output: 16384, cost: 0, envKeys: ["MODELSCOPE_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "modelscope", id: "Qwen/Qwen3-30B-A3B-Thinking-2507", fullId: "modelscope/Qwen/Qwen3-30B-A3B-Thinking-2507", name: "Qwen3 30B A3B Thinking 2507", context: 262144, output: 32768, cost: 0, envKeys: ["MODELSCOPE_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "modelscope", id: "Qwen/Qwen3-Coder-30B-A3B-Instruct", fullId: "modelscope/Qwen/Qwen3-Coder-30B-A3B-Instruct", name: "Qwen3 Coder 30B A3B Instruct", context: 262144, output: 65536, cost: 0, envKeys: ["MODELSCOPE_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "modelscope", id: "Qwen/Qwen3-235B-A22B-Thinking-2507", fullId: "modelscope/Qwen/Qwen3-235B-A22B-Thinking-2507", name: "Qwen3-235B-A22B-Thinking-2507", context: 262144, output: 131072, cost: 0, envKeys: ["MODELSCOPE_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "nan", id: "deepseek-v4-flash", fullId: "nan/deepseek-v4-flash", name: "DeepSeek V4.1 Flash", context: 1000000, output: 384000, cost: 0, envKeys: ["NAN_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "nan", id: "glm5.3", fullId: "nan/glm5.3", name: "GLM-5.3", context: 1000000, output: 131072, cost: 0, envKeys: ["NAN_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "nan", id: "glm5.3-flash", fullId: "nan/glm5.3-flash", name: "GLM-5.3-Flash", context: 1000000, output: 131072, cost: 0, envKeys: ["NAN_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "nan", id: "gemma4", fullId: "nan/gemma4", name: "Gemma 4 26B A4B IT", context: 262144, output: 32768, cost: 0, envKeys: ["NAN_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "nan", id: "mimo-v2.6-flash", fullId: "nan/mimo-v2.6-flash", name: "MiMo-V2.6-Flash", context: 1048576, output: 131072, cost: 0, envKeys: ["NAN_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "nan", id: "qwen3.6", fullId: "nan/qwen3.6", name: "Qwen3.6 35B-A3B", context: 262144, output: 65536, cost: 0, envKeys: ["NAN_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "nan", id: "qwen3.8-flash", fullId: "nan/qwen3.8-flash", name: "Qwen3.8 Flash", context: 1048576, output: 131072, cost: 0, envKeys: ["NAN_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "nano-gpt", id: "auto-model", fullId: "nano-gpt/auto-model", name: "Auto model", context: 1000000, output: 1000000, cost: 0, envKeys: ["NANO_GPT_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "nova", id: "nova-2-lite-v1", fullId: "nova/nova-2-lite-v1", name: "Nova 2 Lite", context: 1000000, output: 64000, cost: 0, envKeys: ["NOVA_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "nova", id: "nova-2-pro-v1", fullId: "nova/nova-2-pro-v1", name: "Nova 2 Pro", context: 1000000, output: 64000, cost: 0, envKeys: ["NOVA_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "novita-ai", id: "apodex/apodex-1.1-mini", fullId: "novita-ai/apodex/apodex-1.1-mini", name: "Apodex 1.1 Mini", context: 262144, output: 262144, cost: 0, envKeys: ["NOVITA_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "nvidia", id: "google/diffusiongemma-26b-a4b-it", fullId: "nvidia/google/diffusiongemma-26b-a4b-it", name: "DiffusionGemma 26B A4B IT", context: 250000, output: 32768, cost: 0, envKeys: ["NVIDIA_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "nvidia", id: "z-ai/glm-5.3-flash", fullId: "nvidia/z-ai/glm-5.3-flash", name: "GLM-5.3-Flash", context: 1000000, output: 131072, cost: 0, envKeys: ["NVIDIA_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "nvidia", id: "openai/gpt-oss-20b", fullId: "nvidia/openai/gpt-oss-20b", name: "GPT OSS 20B", context: 131072, output: 32768, cost: 0, envKeys: ["NVIDIA_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "nvidia", id: "google/gemma-4-31b-it", fullId: "nvidia/google/gemma-4-31b-it", name: "Gemma-4-31B-IT", context: 256000, output: 16384, cost: 0, envKeys: ["NVIDIA_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "nvidia", id: "poolside/laguna-xs-2.1", fullId: "nvidia/poolside/laguna-xs-2.1", name: "Laguna XS 2.1", context: 262144, output: 16384, cost: 0, envKeys: ["NVIDIA_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "nvidia", id: "meta/llama-3.2-11b-vision-instruct", fullId: "nvidia/meta/llama-3.2-11b-vision-instruct", name: "Llama 3.2 11b Vision Instruct", context: 128000, output: 4096, cost: 0, envKeys: ["NVIDIA_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "nvidia", id: "meta/llama-3.2-90b-vision-instruct", fullId: "nvidia/meta/llama-3.2-90b-vision-instruct", name: "Llama-3.2-90B-Vision-Instruct", context: 128000, output: 8192, cost: 0, envKeys: ["NVIDIA_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "nvidia", id: "minimaxai/minimax-m3.1-flash", fullId: "nvidia/minimaxai/minimax-m3.1-flash", name: "MiniMax-M3.1-Flash", context: 262144, output: 262144, cost: 0, envKeys: ["NVIDIA_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "nvidia", id: "meta/muse-glimmer-30b", fullId: "nvidia/meta/muse-glimmer-30b", name: "Muse Glimmer 30B", context: 131072, output: 131072, cost: 0, envKeys: ["NVIDIA_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "nvidia", id: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning", fullId: "nvidia/nvidia/nemotron-3-nano-omni-30b-a3b-reasoning", name: "Nemotron 3 Nano Omni", context: 256000, output: 65536, cost: 0, envKeys: ["NVIDIA_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "nvidia", id: "nvidia/nemotron-3-ultra-550b-a55b", fullId: "nvidia/nvidia/nemotron-3-ultra-550b-a55b", name: "Nemotron 3 Ultra 550B A55B", context: 1000000, output: 65536, cost: 0, envKeys: ["NVIDIA_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "nvidia", id: "nvidia/nemotron-3.5-lightning-30b-a3b", fullId: "nvidia/nvidia/nemotron-3.5-lightning-30b-a3b", name: "Nemotron 3.5 Lightning 30B A3B", context: 262144, output: 262144, cost: 0, envKeys: ["NVIDIA_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "nvidia", id: "nvidia/nemotron-3.5-super-vl-120b-a12b", fullId: "nvidia/nvidia/nemotron-3.5-super-vl-120b-a12b", name: "Nemotron 3.5 Super VL 120B A12B", context: 1048576, output: 8192, cost: 0, envKeys: ["NVIDIA_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "nvidia", id: "stepfun-ai/step-5-preview", fullId: "nvidia/stepfun-ai/step-5-preview", name: "Step 5 Preview", context: 1048576, output: 1048576, cost: 0, envKeys: ["NVIDIA_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "nvidia", id: "nvidia/nemotron-voicechat", fullId: "nvidia/nvidia/nemotron-voicechat", name: "nemotron-voicechat", context: 128000, output: 8192, cost: 0, envKeys: ["NVIDIA_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "openrouter", id: "recursive/flint-v1.0:free", fullId: "openrouter/recursive/flint-v1.0:free", name: "Flint (free)", context: 262144, output: 235929, cost: 0, envKeys: ["OPENROUTER_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "openrouter", id: "google/gemma-4-26b-a4b-it:free", fullId: "openrouter/google/gemma-4-26b-a4b-it:free", name: "Gemma 4 26B A4B  (free)", context: 262144, output: 32768, cost: 0, envKeys: ["OPENROUTER_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "openrouter", id: "thinkingmachines/inkling:free", fullId: "openrouter/thinkingmachines/inkling:free", name: "Inkling (free)", context: 1048576, output: 262144, cost: 0, envKeys: ["OPENROUTER_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "openrouter", id: "thinkingmachines/inkling-small:free", fullId: "openrouter/thinkingmachines/inkling-small:free", name: "Inkling Small (free)", context: 1048576, output: 262144, cost: 0, envKeys: ["OPENROUTER_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "openrouter", id: "liquid/lfm-2.5-2.6b:free", fullId: "openrouter/liquid/lfm-2.5-2.6b:free", name: "LFM2.5-2.6B (free)", context: 65536, output: 8192, cost: 0, envKeys: ["OPENROUTER_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "openrouter", id: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free", fullId: "openrouter/nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free", name: "Nemotron 3 Nano Omni (free)", context: 256000, output: 65536, cost: 0, envKeys: ["OPENROUTER_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "openrouter", id: "nvidia/nemotron-3-ultra-550b-a55b:free", fullId: "openrouter/nvidia/nemotron-3-ultra-550b-a55b:free", name: "Nemotron 3 Ultra (free)", context: 1000000, output: 65536, cost: 0, envKeys: ["OPENROUTER_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "openrouter", id: "nvidia/nemotron-3.5-lightning:free", fullId: "openrouter/nvidia/nemotron-3.5-lightning:free", name: "Nemotron 3.5 Lightning (free)", context: 1000000, output: 65536, cost: 0, envKeys: ["OPENROUTER_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "openrouter", id: "nvidia/nemotron-3.5-super-vl:free", fullId: "openrouter/nvidia/nemotron-3.5-super-vl:free", name: "Nemotron 3.5 Super VL (free)", context: 1000000, output: 131072, cost: 0, envKeys: ["OPENROUTER_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "openrouter", id: "xingchen-agi/xing4.0-29b-a4b:free", fullId: "openrouter/xingchen-agi/xing4.0-29b-a4b:free", name: "Xing4.0 29B A4B (free)", context: 262144, output: 235929, cost: 0, envKeys: ["OPENROUTER_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "orcarouter", id: "deepseek/deepseek-v4-flash-free", fullId: "orcarouter/deepseek/deepseek-v4-flash-free", name: "DeepSeek V4 Flash (free)", context: 1000000, output: 384000, cost: 0, envKeys: ["ORCAROUTER_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "orcarouter", id: "z-ai/glm-5.3-flash-free", fullId: "orcarouter/z-ai/glm-5.3-flash-free", name: "GLM-5.3-Flash (free)", context: 1000000, output: 128000, cost: 0, envKeys: ["ORCAROUTER_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "orcarouter", id: "tencent/hy3-free", fullId: "orcarouter/tencent/hy3-free", name: "Hy3 (free)", context: 256000, output: 128000, cost: 0, envKeys: ["ORCAROUTER_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "orcarouter", id: "orcarouter/auto", fullId: "orcarouter/orcarouter/auto", name: "OrcaRouter Auto", context: 128000, output: 16384, cost: 0, envKeys: ["ORCAROUTER_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "orcarouter", id: "orcarouter/free", fullId: "orcarouter/orcarouter/free", name: "OrcaRouter Free", context: 65536, output: 32768, cost: 0, envKeys: ["ORCAROUTER_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "pendra", id: "deepseek-v4-flash", fullId: "pendra/deepseek-v4-flash", name: "DeepSeek V4 Flash", context: 1000000, output: 384000, cost: 0, envKeys: ["PENDRA_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "pendra", id: "glm-4.7-flash", fullId: "pendra/glm-4.7-flash", name: "GLM-4.7-Flash", context: 200000, output: 131072, cost: 0, envKeys: ["PENDRA_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "pendra", id: "gpt-oss:120b", fullId: "pendra/gpt-oss:120b", name: "GPT OSS 120B", context: 131072, output: 32768, cost: 0, envKeys: ["PENDRA_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "pendra", id: "llama3.3:70b", fullId: "pendra/llama3.3:70b", name: "Llama-3.3-70B-Instruct", context: 128000, output: 4096, cost: 0, envKeys: ["PENDRA_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "pendra", id: "qwen3-coder:30b", fullId: "pendra/qwen3-coder:30b", name: "Qwen3-Coder 30B-A3B Instruct", context: 262144, output: 65536, cost: 0, envKeys: ["PENDRA_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "pendra", id: "qwen3.6:27b", fullId: "pendra/qwen3.6:27b", name: "Qwen3.6 27B", context: 262144, output: 65536, cost: 0, envKeys: ["PENDRA_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "poe", id: "openai/gpt-5.3-codex-spark", fullId: "poe/openai/gpt-5.3-codex-spark", name: "GPT-5.3-Codex-Spark", context: 128000, output: 16384, cost: 0, envKeys: ["POE_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "poe", id: "google/gemma-4-31b", fullId: "poe/google/gemma-4-31b", name: "Gemma-4-31B", context: 262144, output: 8192, cost: 0, envKeys: ["POE_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "poolside", id: "poolside/laguna-m.1", fullId: "poolside/poolside/laguna-m.1", name: "Laguna M.1", context: 262144, output: 32768, cost: 0, envKeys: ["POOLSIDE_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "poolside", id: "poolside/laguna-s-2.1", fullId: "poolside/poolside/laguna-s-2.1", name: "Laguna S 2.1", context: 1048576, output: 32768, cost: 0, envKeys: ["POOLSIDE_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "poolside", id: "poolside/laguna-xs-2.1", fullId: "poolside/poolside/laguna-xs-2.1", name: "Laguna XS 2.1", context: 262144, output: 32768, cost: 0, envKeys: ["POOLSIDE_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "qvac", id: "gpt-oss-20b", fullId: "qvac/gpt-oss-20b", name: "GPT OSS 20B", context: 131072, output: 32768, cost: 0, envKeys: ["QVAC_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "qvac", id: "gemma4-31b", fullId: "qvac/gemma4-31b", name: "Gemma 4 31B IT", context: 262144, output: 32768, cost: 0, envKeys: ["QVAC_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "qvac", id: "qwen3.5-0.8b", fullId: "qvac/qwen3.5-0.8b", name: "Qwen3.5 0.8B", context: 32768, output: 8192, cost: 0, envKeys: ["QVAC_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "qvac", id: "qwen3.5-2b", fullId: "qvac/qwen3.5-2b", name: "Qwen3.5 2B", context: 32768, output: 8192, cost: 0, envKeys: ["QVAC_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "qvac", id: "qwen3.5-4b", fullId: "qvac/qwen3.5-4b", name: "Qwen3.5 4B", context: 32768, output: 8192, cost: 0, envKeys: ["QVAC_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "qvac", id: "qwen3.5-9b", fullId: "qvac/qwen3.5-9b", name: "Qwen3.5 9B", context: 32768, output: 8192, cost: 0, envKeys: ["QVAC_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "qvac", id: "qwen3.6-27b", fullId: "qvac/qwen3.6-27b", name: "Qwen3.6 27B", context: 262144, output: 65536, cost: 0, envKeys: ["QVAC_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "qvac", id: "qwen3.6-35b-a3b", fullId: "qvac/qwen3.6-35b-a3b", name: "Qwen3.6 35B-A3B", context: 262144, output: 65536, cost: 0, envKeys: ["QVAC_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "reflection", id: "Beam-1.0-501B-A23B", fullId: "reflection/Beam-1.0-501B-A23B", name: "Beam 1.0 501B A23B", context: 1048576, output: 131072, cost: 0, envKeys: ["REFLECTION_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "regolo-ai", id: "brick-v1-beta", fullId: "regolo-ai/brick-v1-beta", name: "Brick v1 Beta", context: 100000, output: 15000, cost: 0, envKeys: ["REGOLO_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "requesty", id: "gemma-4-31b-it", fullId: "requesty/gemma-4-31b-it", name: "Gemma 4 31B IT", context: 262144, output: 8192, cost: 0, envKeys: ["REQUESTY_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "requesty", id: "muse-glimmer-30b", fullId: "requesty/muse-glimmer-30b", name: "Muse Glimmer 30B", context: 131072, output: 20480, cost: 0, envKeys: ["REQUESTY_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "requesty", id: "nemotron-3-nano-omni-30b-a3b-reasoning", fullId: "requesty/nemotron-3-nano-omni-30b-a3b-reasoning", name: "Nemotron 3 Nano Omni 30B A3B Reasoning", context: 131072, output: 20480, cost: 0, envKeys: ["REQUESTY_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "requesty", id: "nemotron-3-super-120b-a12b", fullId: "requesty/nemotron-3-super-120b-a12b", name: "Nemotron 3 Super 120B A12B", context: 1048576, output: 65536, cost: 0, envKeys: ["REQUESTY_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "requesty", id: "nemotron-3-ultra-550b-a55b", fullId: "requesty/nemotron-3-ultra-550b-a55b", name: "Nemotron 3 Ultra 550B A55B", context: 1048576, output: 65536, cost: 0, envKeys: ["REQUESTY_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "requesty", id: "nemotron-3.5-lightning-30b-a3b", fullId: "requesty/nemotron-3.5-lightning-30b-a3b", name: "Nemotron 3.5 Lightning 30B A3B", context: 1048576, output: 65536, cost: 0, envKeys: ["REQUESTY_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "requesty", id: "leanstral-1-5", fullId: "requesty/leanstral-1-5", name: "leanstral-1-5", context: 262144, output: 32768, cost: 0, envKeys: ["REQUESTY_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "requesty", id: "leanstral-1-5@eu", fullId: "requesty/leanstral-1-5@eu", name: "leanstral-1-5@eu", context: 262144, output: 32768, cost: 0, envKeys: ["REQUESTY_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "requesty", id: "ling-3.0-tiny", fullId: "requesty/ling-3.0-tiny", name: "ling-3.0-tiny", context: 262144, output: 32768, cost: 0, envKeys: ["REQUESTY_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "sensenova", id: "deepseek-v4-flash", fullId: "sensenova/deepseek-v4-flash", name: "DeepSeek V4 Flash", context: 1000000, output: 65536, cost: 0, envKeys: ["SENSENOVA_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "sensenova", id: "deepseek-v4-pro", fullId: "sensenova/deepseek-v4-pro", name: "DeepSeek V4 Pro", context: 1048576, output: 65536, cost: 0, envKeys: ["SENSENOVA_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "sensenova", id: "deepseek-v4.1-flash", fullId: "sensenova/deepseek-v4.1-flash", name: "DeepSeek V4.1 Flash", context: 1048576, output: 65536, cost: 0, envKeys: ["SENSENOVA_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "sensenova", id: "glm-5.2", fullId: "sensenova/glm-5.2", name: "GLM-5.2", context: 1000000, output: 131072, cost: 0, envKeys: ["SENSENOVA_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "sensenova", id: "kimi-k3", fullId: "sensenova/kimi-k3", name: "Kimi K3", context: 1048576, output: 65536, cost: 0, envKeys: ["SENSENOVA_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "sensenova", id: "sensenova-6.8-flash-lite", fullId: "sensenova/sensenova-6.8-flash-lite", name: "SenseNova 6.8 Flash Lite", context: 262144, output: 65536, cost: 0, envKeys: ["SENSENOVA_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "siliconflow-cn", id: "Qwen/Qwen2.5-7B-Instruct", fullId: "siliconflow-cn/Qwen/Qwen2.5-7B-Instruct", name: "Qwen/Qwen2.5-7B-Instruct", context: 33000, output: 4000, cost: 0, envKeys: ["SILICONFLOW_CN_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "siliconflow-cn", id: "Qwen/Qwen3-8B", fullId: "siliconflow-cn/Qwen/Qwen3-8B", name: "Qwen/Qwen3-8B", context: 131000, output: 131000, cost: 0, envKeys: ["SILICONFLOW_CN_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "siliconflow-cn", id: "Qwen/Qwen3.5-4B", fullId: "siliconflow-cn/Qwen/Qwen3.5-4B", name: "Qwen/Qwen3.5-4B", context: 262144, output: 65536, cost: 0, envKeys: ["SILICONFLOW_CN_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "tempr", id: "zai/glm-4.5-flash", fullId: "tempr/zai/glm-4.5-flash", name: "GLM-4.5-Flash", context: 131072, output: 98304, cost: 0, envKeys: ["TEMPR_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "tempr", id: "zai/glm-4.6v-flash", fullId: "tempr/zai/glm-4.6v-flash", name: "GLM-4.6V-Flash", context: 128000, output: 32768, cost: 0, envKeys: ["TEMPR_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "tempr", id: "zai/glm-4.7-flash", fullId: "tempr/zai/glm-4.7-flash", name: "GLM-4.7-Flash", context: 200000, output: 131072, cost: 0, envKeys: ["TEMPR_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "unorouter", id: "glm-4.5-flash:free", fullId: "unorouter/glm-4.5-flash:free", name: "GLM-4.5-Flash", context: 131072, output: 98304, cost: 0, envKeys: ["UNOROUTER_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "unorouter", id: "gemma-4-31b-it:free", fullId: "unorouter/gemma-4-31b-it:free", name: "Gemma 4 31B IT", context: 262144, output: 32768, cost: 0, envKeys: ["UNOROUTER_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "unorouter", id: "minimax-m2.7:free", fullId: "unorouter/minimax-m2.7:free", name: "MiniMax-M2.7", context: 204800, output: 131072, cost: 0, envKeys: ["UNOROUTER_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "unorouter", id: "nemotron-3-ultra-550b-a55b:free", fullId: "unorouter/nemotron-3-ultra-550b-a55b:free", name: "Nemotron 3 Ultra 550B A55B", context: 1000000, output: 128000, cost: 0, envKeys: ["UNOROUTER_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "zai", id: "glm-4.5-flash", fullId: "zai/glm-4.5-flash", name: "GLM-4.5-Flash", context: 131072, output: 98304, cost: 0, envKeys: ["ZHIPU_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "zai", id: "glm-4.6v-flash", fullId: "zai/glm-4.6v-flash", name: "GLM-4.6V-Flash", context: 128000, output: 32768, cost: 0, envKeys: ["ZHIPU_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "zai", id: "glm-4.7-flash", fullId: "zai/glm-4.7-flash", name: "GLM-4.7-Flash", context: 200000, output: 131072, cost: 0, envKeys: ["ZHIPU_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "zeldoc", id: "zdev", fullId: "zeldoc/zdev", name: "ZDev", context: 1000000, output: 131072, cost: 0, envKeys: ["ZELDOC_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "zenmux", id: "z-ai/glm-4.6v-flash-free", fullId: "zenmux/z-ai/glm-4.6v-flash-free", name: "GLM 4.6V Flash (Free)", context: 200000, output: 128000, cost: 0, envKeys: ["ZENMUX_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "zenmux", id: "z-ai/glm-4.7-flash-free", fullId: "zenmux/z-ai/glm-4.7-flash-free", name: "GLM 4.7 Flash (Free)", context: 200000, output: 128000, cost: 0, envKeys: ["ZENMUX_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "zhipuai", id: "glm-4.5-flash", fullId: "zhipuai/glm-4.5-flash", name: "GLM-4.5-Flash", context: 131072, output: 98304, cost: 0, envKeys: ["ZHIPU_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "zhipuai", id: "glm-4.6v-flash", fullId: "zhipuai/glm-4.6v-flash", name: "GLM-4.6V-Flash", context: 128000, output: 32768, cost: 0, envKeys: ["ZHIPU_API_KEY"], keylessOnVercel: false, preferred: false },
  { provider: "zhipuai", id: "glm-4.7-flash", fullId: "zhipuai/glm-4.7-flash", name: "GLM-4.7-Flash", context: 200000, output: 131072, cost: 0, envKeys: ["ZHIPU_API_KEY"], keylessOnVercel: false, preferred: false },
];

export const FREE_MODEL_BY_ID = new Map(FREE_MODELS.map((model) => [model.fullId, model]));
export const FREE_MODEL_IDS = new Set(FREE_MODELS.map((model) => model.fullId));

/** Every normal-provider credential name the child process is allowed to see. */
export const NORMAL_PROVIDER_KEY_NAMES = [
  "AGNES_API_KEY",
  "AIHUBMIX_API_KEY",
  "AI_GATEWAY_API_KEY",
  "AMD_API_KEY",
  "ANTHROPIC_API_KEY",
  "ATOMIC_CHAT_API_KEY",
  "BOTHUB_API_KEY",
  "CLOUDFLARE_ACCOUNT_ID",
  "CLOUDFLARE_API_TOKEN",
  "CLOUDFLARE_GATEWAY_ID",
  "COHERE_API_KEY",
  "EMPIRIOLABS_API_KEY",
  "GEMINI_API_KEY",
  "GITLAB_TOKEN",
  "GOOGLE_GENERATIVE_AI_API_KEY",
  "HETZNER_API_KEY",
  "HF_TOKEN",
  "INFERX_API_KEY",
  "ITERACOMPUTE_API_KEY",
  "KENARI_API_KEY",
  "KILO_API_KEY",
  "LLMGATEWAY_API_KEY",
  "LLMTR_API_KEY",
  "LMSTUDIO_API_KEY",
  "LYNKR_API_KEY",
  "MEGANOVA_API_KEY",
  "MERGE_GATEWAY_API_KEY",
  "MODELSCOPE_API_KEY",
  "NANO_GPT_API_KEY",
  "NAN_API_KEY",
  "NOVA_API_KEY",
  "NOVITA_API_KEY",
  "NVIDIA_API_KEY",
  "OPENAI_API_KEY",
  "OPENCODE_GO_API_KEY",
  "OPENROUTER_API_KEY",
  "ORCAROUTER_API_KEY",
  "PENDRA_API_KEY",
  "POE_API_KEY",
  "POOLSIDE_API_KEY",
  "QVAC_API_KEY",
  "REFLECTION_API_KEY",
  "REGOLO_API_KEY",
  "REQUESTY_API_KEY",
  "SENSENOVA_API_KEY",
  "SILICONFLOW_CN_API_KEY",
  "TEMPR_API_KEY",
  "UNOROUTER_API_KEY",
  "VERCEL_OIDC_TOKEN",
  "ZELDOC_API_KEY",
  "ZENMUX_API_KEY",
  "ZHIPU_API_KEY",
] as const;

export function isFreeModel(model: string): boolean {
  return FREE_MODEL_IDS.has(model);
}

/** Env var names needed for a specific normal free model (names only). */
export function modelEnvKeys(model: string): string[] {
  return FREE_MODEL_BY_ID.get(model)?.envKeys ?? [];
}

export function isKeylessOnVercel(model: string): boolean {
  return FREE_MODEL_BY_ID.get(model)?.keylessOnVercel ?? false;
}

/**
 * Which credential env vars are still missing for this model. Vercel AI Gateway
 * models are satisfied by the platform's automatic OIDC token.
 */
export function missingEnvKeysFor(
  model: string,
  env: Record<string, string | undefined> = process.env,
): string[] {
  const entry = FREE_MODEL_BY_ID.get(model);
  if (!entry) return [];
  if (entry.keylessOnVercel && (env.VERCEL_OIDC_TOKEN || env.AI_GATEWAY_API_KEY)) return [];
  return entry.envKeys.filter((name) => !env[name]);
}

/**
 * Reject arbitrary model strings so a browser value cannot steer the CLI to a
 * different provider. Only normal-provider free ids (or the server-configured
 * model) are accepted. OpenCode Zen ids are intentionally not included.
 */
export function validateModel(model: unknown, configured: string): string {
  if (typeof model !== 'string' || model.length === 0) return configured;
  if (model.length > 160) throw new Error('model id is too long');
  if (!/^[A-Za-z0-9][A-Za-z0-9._/:-]{0,159}$/.test(model)) {
    throw new Error('model id contains unsafe characters');
  }
  if (FREE_MODEL_IDS.has(model)) return model;
  if (model === configured) return model;
  if (model.startsWith('opencode/') || model.startsWith('opencode-go/')) {
    throw new Error('OpenCode Zen models are disabled; choose a normal provider free model');
  }
  throw new Error('model is not a normal free OpenCode model or the configured model');
}

