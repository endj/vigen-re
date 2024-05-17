const validateEncryptionParamters = (key, text) => {
    if (!key || typeof key !== "string") throw "invalid key"
    if (!text || typeof text !== "string") throw "invalid text"
    validateCharset(key)
    validateCharset(text)
}

const validateCharset = (text) => {
    for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i);
        if(charCode < 65 || charCode > 90) throw "Invalid key"
    }
}

const encrypt = (text, key) => {
    let encrypted = ''
    for (let i = 0; i < text.length; i++) {
        const keyNum = key[i % key.length].charCodeAt(0) - 65
        const textNum = text[i].charCodeAt(0) - 65
        const val = (keyNum + textNum) % 26
        encrypted += String.fromCharCode(val + 65)
    }
    return encrypted
}

const decrypt = (text, key) => {
    let decrypted = ''
    for(let i = 0; i  < text.length; i++) {
        const textNum = text[i].charCodeAt(0) - 65
        const keyNum = key[i % key.length].charCodeAt(0) - 65
        const val = (textNum - keyNum + 26) % 26
        decrypted += String.fromCharCode(val + 65)
    }

    return decrypted;
}

console.log("ORIGINAL", "ADGGADG")
console.log("encrypted", encrypt("HELLOWORLD", "ADGGADG"))
console.log("decrypted", decrypt("HELLOWORLD", encrypt("HELLOWORLD", "ADGGADG")))

