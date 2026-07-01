/**
 * Server-side CRUD for Grafana instance configurations.
 *
 * Tokens are stored encrypted with AES-256-GCM (see token-crypto.js).
 * Public-facing helpers (getInstances) never return the token field,
 * so credentials cannot leak to the client even by accident.
 *
 * On first read after an upgrade, any legacy plaintext "token" fields are
 * automatically re-encrypted and written back — no manual migration needed.
 * https://nodejs.org/api/fs.html#filehandlereadfileoptions
 */
import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { encrypt, decrypt } from "./token-crypto.js";

const FILE = join(process.cwd(), "data", "grafana-instances.json");

/** Reads raw records from disk, returns [] on any I/O or parse error. */
async function readRaw() {
  try {
    return JSON.parse(await readFile(FILE, "utf-8"));
  } catch {
    return [];
  }
}

/** Writes records to disk. */
async function persist(records) {
  await writeFile(FILE, JSON.stringify(records, null, 2));
}

/**
 * Encrypts any legacy plaintext "token" fields in place and persists.
 * Safe to call on every read — it is a no-op when all records are already encrypted.
 *
 * @param {Array} records raw records from disk
 * @returns {Array} records with all tokens encrypted
 */
async function migrateIfNeeded(records) {
  let dirty = false;
  const migrated = records.map((rec) => {
    if (!rec.encryptedToken && rec.token) {
      // Legacy record: encrypt the plaintext token and drop the old field
      dirty = true;
      const { token, ...rest } = rec;
      return { ...rest, encryptedToken: encrypt(token) };
    }
    return rec;
  });
  if (dirty) await persist(migrated);
  return migrated;
}

/**
 * Returns the public-safe list of instances: [{id, name, url}].
 * Tokens are deliberately excluded — call getInstanceById for proxy use.
 *
 * @returns {Promise<Array<{id: string, name: string, url: string}>>}
 */
export async function getInstances() {
  const records = await migrateIfNeeded(await readRaw());
  return records.map(({ id, name, url }) => ({ id, name, url }));
}

/**
 * Returns a single instance with its decrypted token, for use in proxy auth headers.
 * Returns null when the id is not found.
 *
 * @param {string} id
 * @returns {Promise<{id: string, name: string, url: string, token: string}|null>}
 */
export async function getInstanceById(id) {
  const records = await migrateIfNeeded(await readRaw());
  const rec = records.find((i) => i.id === id);
  if (!rec) return null;
  return {
    id: rec.id,
    name: rec.name,
    url: rec.url,
    token: decrypt(rec.encryptedToken),
  };
}

/**
 * Adds a new instance, encrypting the token before persisting.
 * Returns the public-safe record (no token).
 *
 * @param {{name: string, url: string, token: string}} param0
 * @returns {Promise<{id: string, name: string, url: string}>}
 */
export async function addInstance({ name, url, token }) {
  const records = await migrateIfNeeded(await readRaw());
  const record = {
    id: randomUUID(),
    name,
    url: url.replace(/\/$/, ""),
    encryptedToken: encrypt(token),
  };
  await persist([...records, record]);
  return { id: record.id, name: record.name, url: record.url };
}

/**
 * Deletes an instance by id.
 *
 * @param {string} id
 */
export async function deleteInstance(id) {
  const records = await migrateIfNeeded(await readRaw());
  await persist(records.filter((i) => i.id !== id));
}
