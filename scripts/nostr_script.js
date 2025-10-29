window.nostr = {
    _requests: {},
    _pubkey: null,

    GET_PUBLIC_KEY: 1,
    SIGN_EVENT: 2,
    GET_RELAYS: 3,
    NIP04_ENCRYPT: 4,
    NIP04_DECRYPT: 5,
    NIP44_ENCRYPT: 6,
    NIP44_DECRYPT: 7,
    // DECRYPT_ZAP_EVENT: 8,

    async getPublicKey() {
        if (this._pubkey) return this._pubkey
        this._pubkey = await this._call(this.GET_PUBLIC_KEY, {})
        return this._pubkey
    },

    async signEvent(event) {
        return await this._call(this.SIGN_EVENT, event)
    },

    async getRelays() {
        return this._call(this.GET_RELAYS, {})
    },

    nip04: {
        async encrypt(pubkey, plaintext) {
            return window.nostr._call(this.NIP04_ENCRYPT, { 'pubkey': pubkey, 'text': plaintext })
        },

        async decrypt(pubkey, ciphertext) {
            return window.nostr._call(this.NIP04_DECRYPT, { 'pubkey': pubkey, 'text': ciphertext })
        }
    },

    nip44: {
        async encrypt(pubkey, plaintext) {
            return window.nostr._call(this.NIP44_ENCRYPT, { 'pubkey': pubkey, 'text': plaintext })
        },

        async decrypt(pubkey, ciphertext) {
            return window.nostr._call(this.NIP44_DECRYPT, { 'pubkey': pubkey, 'text': ciphertext })
        }
    },

    _call(type, params) {
        console.log("call:", type, params);
        return new Promise((resolve, reject) => {
            let id = Math.random().toString().slice(4)
            this._requests[id] = { resolve, reject }
            console.log("send message:", {
                id,
                ext: 'briner',
                type,
                params
            })
            window.postMessage(
                {
                    id,
                    ext: 'briner',
                    type,
                    params
                },
                '*'
            )
        })
    }
}

window.addEventListener('message', message => {

    if (
        !message.data ||
        (!message.data.response && !message.data.error) ||
        message.data.ext !== 'briner' ||
        !window.nostr._requests[message.data.id]
    )
        return

    console.log("nostr script receive message:", message);

    if (message.data.error) {
        let error = new Error('briner: ' + message.data.error)
        window.nostr._requests[message.data.id].reject(error)
    } else {
        window.nostr._requests[message.data.id].resolve(message.data.response)
    }

    delete window.nostr._requests[message.data.id]
})