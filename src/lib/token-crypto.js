/**
 * AES-256-GCM symmetric encryption for Grafana service-account tokens.
 *
 * Why AES-256-GCM: authenticated encryption prevents both confidentiality
 * breach and silent tampering of stored tokens; 256-bit key satisfies
 * current NIST recommendations.
 * https://nodejs.org/api/crypto.html#cryptocreatedecipherivalgorithm-key-iv-options
 *
 * Key management: the raw key lives only in GRAFANA_ENCRYPTION_KEY (env var).
 * It never touches disk and is never sent to the client.
 * Stored format: "enc:<iv_hex>.<authTag_hex>.<ciphertext_hex>"
 */
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALG = "aes-256-gcm";
const IV_BYTES = 12;   // 96-bit IV — GCM recommended size
const KEY_HEX_LEN = 64; // 32 bytes = 64 hex chars

/**
 * Derives the 32-byte key from the GRAFANA_ENCRYPTION_KEY env var.
 * Throws with a actionable message when the var is absent or malformed.
 *
 * @returns {Buffer} 32-byte key
 */
function getKey() {
  const hex = process.env.GRAFANA_ENCRYPTION_KEY;
  if (!hex || hex.length !== KEY_HEX_LEN) {
    throw new Error(
      `GRAFANA_ENCRYPTION_KEY must be a ${KEY_HEX_LEN}-char hex string. ` +
      "Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
    );
  }
  return Buffer.from(hex, "hex");
}

/**
 * Encrypts a plaintext string.
 * A fresh random IV is generated for every call so repeated encryptions of
 * the same value produce different ciphertexts (semantic security).
 *
 * @param {string} plaintext
 * @returns {string} "enc:<iv_hex>.<authTag_hex>.<ciphertext_hex>"
 */
export function encrypt(plaintext) {
  const key = getKey();
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALG, key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `enc:${iv.toString("hex")}.${authTag.toString("hex")}.${ciphertext.toString("hex")}`;
}

/**
 * Decrypts a value produced by encrypt().
 * The GCM auth-tag check ensures the value has not been tampered with.
 *
 * @param {string} value
 * @returns {string} original plaintext
 * @throws if the key is wrong, the value is malformed, or authentication fails
 */
export function decrypt(value) {
  if (!value?.startsWith("enc:")) {
    throw new Error("decrypt: value is not in enc:<iv>.<tag>.<ct> format");
  }
  const parts = value.slice(4).split(".");
  if (parts.length !== 3) {
    throw new Error("decrypt: malformed encrypted token");
  }
  const [ivHex, authTagHex, ctHex] = parts;
  const key = getKey();
  const decipher = createDecipheriv(ALG, key, Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));
  return Buffer.concat([
    decipher.update(Buffer.from(ctHex, "hex")),
    decipher.final(),
  ]).toString("utf8");
}

/**
 * Returns true when a stored token value is already encrypted.
 * Used to distinguish legacy plaintext records from encrypted ones.
 *
 * @param {string} value
 * @returns {boolean}
 */
export function isEncrypted(value) {
  return typeof value === "string" && value.startsWith("enc:");
}
