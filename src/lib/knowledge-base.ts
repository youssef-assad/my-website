import fs from "node:fs/promises";
import path from "node:path";

const cache = new Map<string, string>();

export async function loadKnowledgeBase(
  projectId: string
): Promise<string | null> {
  if (!/^[a-z0-9-]+$/.test(projectId)) return null;

  const cached = cache.get(projectId);
  if (cached !== undefined) return cached;

  const filePath = path.join(
    process.cwd(),
    "src",
    "content",
    "projects",
    `${projectId}.md`
  );

  try {
    const content = await fs.readFile(filePath, "utf-8");
    cache.set(projectId, content);
    return content;
  } catch {
    return null;
  }
}
