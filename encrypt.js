function strToBuf(str) {
    return new TextEncoder().encode(str);
}

function bufToBase64(buffer) {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

async function getAesKey(password) {
    const salt = strToBuf("static_salt_here"); // Replace with random salt and store it securely
    const keyMaterial = await window.crypto.subtle.importKey(
        "raw",
        strToBuf(password),
        "PBKDF2",
        false,
        ["deriveKey"]
    );

    return window.crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: salt,
            iterations: 100000,
            hash: "SHA-256"
        },
        keyMaterial,
        {
            name: "AES-GCM",
            length: 256
        },
        false,
        ["encrypt"]
    );
}

async function encryptText() {
    const text = document.getElementById("plaintext").value;
    const password = document.getElementById("key").value;

    if (!text || !password) {
        alert("Please enter both text and password.");
        return;
    }

    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const key = await getAesKey(password);

    try {
        const encrypted = await window.crypto.subtle.encrypt(
            {
                name: "AES-GCM",
                iv: iv
            },
            key,
            strToBuf(text)
        );

        const output = {
            iv: bufToBase64(iv),
            ciphertext: bufToBase64(encrypted)
        };

        document.getElementById("output").innerText = JSON.stringify(output, null, 2);
    } catch (e) {
        document.getElementById("output").innerText = "Encryption failed: " + e.message;
    }
}