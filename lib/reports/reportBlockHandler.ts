import type { MarkdownPostProcessorContext } from "obsidian";
// @ts-ignore (no default export detected by vscode's typescript language server)
import TogglReportBlock from "../ui/views/TogglReportBlock.svelte";

import { settingsStore } from "lib/util/stores";
import { get } from "svelte/store";

const lastRenderAt = new Map<string, number>();
const DEFAULT_TTL_MS = 60_000;

export default function reportBlockHandler(
  source: string,
  el: HTMLElement,
  ctx: MarkdownPostProcessorContext,
) {
  if (!source) return;

  const settings = get(settingsStore);
  const manualMode: boolean = settings?.reducedPolling?.manualMode ?? false;
  const ttlMs: number = manualMode ? 0 : (settings?.reportBlockTtlMs ?? DEFAULT_TTL_MS);

  const cacheKey = source.trim();
  const now = Date.now();
  const lastAt = lastRenderAt.get(cacheKey);
  const isRecent = !!lastAt && now - lastAt < ttlMs;
  const hasContent = el.childElementCount > 0;

  if (!manualMode && isRecent && hasContent) return;

  new TogglReportBlock({
    target: el,
    props: { source, manualMode },
  });

  lastRenderAt.set(cacheKey, now);
}
