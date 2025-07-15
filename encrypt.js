function strToBuf(str) {
    return new TextEncoder().encode(str);
}

function bufToStr(buf) {
    return new TextDecoder().decode(buf);
}

function bufToBase64(buffer) {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

function base64ToBuf(base64) {
    return Uint8Array.from(atob(base64), c => c.charCodeAt(0));
}

async function generateKey() {
    return await window.crypto.subtle.generateKey(
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
    );
}

async function exportKey(key) {
    const raw = await window.crypto.subtle.exportKey("raw", key);
    return bufToBase64(raw);
}

async function importKey(base64Key) {
    const raw = base64ToBuf(base64Key);
    return await window.crypto.subtle.importKey(
        "raw",
        raw,
        "AES-GCM",
        true,
        ["encrypt", "decrypt"]
    );
}

async function encrypt() {
    const plaintext = document.getElementById("plaintext").value;
    if (!plaintext) return alert("Enter some text to encrypt!");

    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const key = await generateKey();
    const encrypted = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        strToBuf(plaintext)
    );

    const keyBase64 = await exportKey(key);
    const ivBase64 = bufToBase64(iv);
    const cipherBase64 = bufToBase64(encrypted);

    alert("🔑 Your Encryption Key (save it to decrypt):\n" + keyBase64);

    document.getElementById("encryptedOutput").textContent = JSON.stringify({
        iv: ivBase64,
        ciphertext: cipherBase64
    }, null, 2);
}

async function decrypt() {
    const keyBase64 = document.getElementById("keyInput").value.trim();
    const ivBase64 = document.getElementById("ivInput").value.trim();
    const cipherBase64 = document.getElementById("cipherInput").value.trim();

    if (!keyBase64 || !ivBase64 || !cipherBase64)
        return alert("Please paste the key, IV, and ciphertext!");

    try {
        const key = await importKey(keyBase64);
        const iv = base64ToBuf(ivBase64);
        const ciphertext = base64ToBuf(cipherBase64);

        const decrypted = await window.crypto.subtle.decrypt(
            { name: "AES-GCM", iv },
            key,
            ciphertext
        );

        document.getElementById("decryptedOutput").textContent = bufToStr(decrypted);
    } catch (err) {
        document.getElementById("decryptedOutput").textContent = "❌ Decryption failed: " + err.message;
    }
}