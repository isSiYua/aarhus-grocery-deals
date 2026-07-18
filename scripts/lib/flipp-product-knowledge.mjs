import fs from 'node:fs/promises';

export const ATLANTA_KNOWLEDGE_SCHEMA_VERSION = 1;

export function emptyAtlantaProductKnowledge() {
  return {
    schemaVersion: ATLANTA_KNOWLEDGE_SCHEMA_VERSION,
    maintainedBy: 'Codex',
    updatedAt: null,
    entries: {},
  };
}

export async function loadAtlantaProductKnowledge(fileUrl) {
  try {
    const parsed = JSON.parse(await fs.readFile(fileUrl, 'utf8'));
    if (parsed.schemaVersion !== ATLANTA_KNOWLEDGE_SCHEMA_VERSION || !parsed.entries || typeof parsed.entries !== 'object') {
      throw new Error('Unsupported Atlanta product knowledge shape');
    }
    return parsed;
  } catch (error) {
    if (error?.code === 'ENOENT') return emptyAtlantaProductKnowledge();
    throw error;
  }
}
