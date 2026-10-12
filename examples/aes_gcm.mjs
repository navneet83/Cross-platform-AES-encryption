// AES-256-GCM with a password, using WebCrypto. Runs in browsers and in Node 20+.
// Layout of the output, Base64: salt (16) || nonce (12) || ciphertext || tag (16).
// Key: PBKDF2-HMAC-SHA256, 600000 iterations, from the UTF-8 bytes of the password.

const ITERATIONS = 600000;
const SALT_BYTES = 16;
const NONCE_BYTES = 12;
const TAG_BITS = 128;

const subtle = globalThis.crypto.subtle;
const enc = new TextEncoder();
const dec = new TextDecoder();

async function deriveKey(password, salt, usage) {
    const material = await subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]);
    return subtle.deriveKey(
        { name: "PBKDF2", hash: "SHA-256", salt, iterations: ITERATIONS },
        material, { name: "AES-GCM", length: 256 }, false, [usage]);
}

export async function encrypt(password, plaintext, salt = null, nonce = null) {
    salt ??= crypto.getRandomValues(new Uint8Array(SALT_BYTES));
    nonce ??= crypto.getRandomValues(new Uint8Array(NONCE_BYTES));
    const key = await deriveKey(password, salt, "encrypt");
    const sealed = new Uint8Array(await subtle.encrypt({ name: "AES-GCM", iv: nonce, tagLength: TAG_BITS }, key, enc.encode(plaintext)));
    const out = new Uint8Array(salt.length + nonce.length + sealed.length);
    out.set(salt, 0); out.set(nonce, salt.length); out.set(sealed, salt.length + nonce.length);
    return btoa(String.fromCharCode(...out));
}

export async function decrypt(password, base64) {
    const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    const salt = bytes.subarray(0, SALT_BYTES);
    const nonce = bytes.subarray(SALT_BYTES, SALT_BYTES + NONCE_BYTES);
    const sealed = bytes.subarray(SALT_BYTES + NONCE_BYTES);
    const key = await deriveKey(password, salt, "decrypt");
    // A wrong password or a modified ciphertext fails here with an exception; there is no partial output.
    return dec.decode(await subtle.decrypt({ name: "AES-GCM", iv: nonce, tagLength: TAG_BITS }, key, sealed));
}

// Self-check against the shared test vector, then a round trip with fresh random salt and nonce.
if (process.argv[1] && process.argv[1].endsWith("aes_gcm.mjs")) {
    const vector = JSON.parse(await (await import("node:fs/promises")).readFile(new URL("./vector.json", import.meta.url), "utf8"));
    const hex = h => Uint8Array.from(h.match(/../g), b => parseInt(b, 16));
    const produced = await encrypt(vector.password, vector.plaintext, hex(vector.salt_hex), hex(vector.nonce_hex));
    if (produced !== vector.output_base64) throw new Error("vector mismatch: " + produced);
    if (await decrypt(vector.password, vector.output_base64) !== vector.plaintext) throw new Error("vector decrypt failed");
    const roundTrip = await decrypt("another password", await encrypt("another password", "round trip"));
    if (roundTrip !== "round trip") throw new Error("round trip failed");
    console.log("aes_gcm.mjs: vector and round trip OK");
}
