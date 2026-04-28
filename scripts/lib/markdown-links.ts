export function safeDecode(value: string | undefined): { ok: boolean; value: string } {
  if (value === undefined) return { ok: true, value: "" };
  try {
    return { ok: true, value: decodeURIComponent(value) };
  } catch {
    return { ok: false, value };
  }
}

export function shouldIgnoreTarget(target: string): boolean {
  if (!target || target.startsWith("#")) return false;
  if (/^(https?:|mailto:|app:|plugin:)/.test(target)) return true;
  if (target.includes("<") || target.includes(">")) return true;
  if (target.includes("$")) return true;
  if (target.includes("feature-slug") || target.includes("sprint-slug")) return true;
  if (target.includes("slug/") || target.includes("slug.md")) return true;
  return false;
}

export function collectAnchors(markdown: string): Set<string> {
  const anchors = new Set<string>();
  const used = new Map<string, number>();
  for (const line of markdown.split(/\r?\n/)) {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (!match) continue;
    for (const base of slugVariants(match[2])) {
      const count = used.get(base) || 0;
      used.set(base, count + 1);
      anchors.add(count === 0 ? base : `${base}-${count}`);
    }
  }
  return anchors;
}

export function slugVariants(heading: string): Set<string> {
  const cleaned = heading
    .trim()
    .replace(/<[^>]+>/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .toLowerCase();

  return new Set<string>([
    githubSlug(cleaned),
    githubSlug(cleaned.replace(/[‑‒–—―]/gu, "-")),
    githubSlug(cleaned.replace(/[‑‒–—―]/gu, "")),
  ]);
}

export function githubSlug(value: string): string {
  return value
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s/gu, "-");
}
