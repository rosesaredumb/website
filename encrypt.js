// (helper functions remain unchanged)

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

    // Fill boxes instead of showing in a JSON block
    document.getElementById("keyBox").value = keyBase64;
    document.getElementById("ivBox").value = ivBase64;
    document.getElementById("cipherBox").value = cipherBase64;

    // Optional: autofill for decryption section
    document.getElementById("keyInput").value = keyBase64;
    document.getElementById("ivInput").value = ivBase64;
    document.getElementById("cipherInput").value = cipherBase64;
}