import type { EventTemplate, VerifiedEvent } from "nostr-tools";
import type { ISigner } from "./isigner"

export class NpubSigner implements ISigner {

    private pubkey: string;

    constructor(pubkey: string) {
        this.pubkey = pubkey;
    }

    async getPublicKey() {
        return this.pubkey;
    }

    async signEvent(event: EventTemplate): Promise<VerifiedEvent> {
        throw Error('not login');
    }

    async nip04Encrypt(pubkey: string, plainText: string): Promise<string> {
        throw Error('not login');
    }

    async nip04Decrypt(pubkey: string, cipherText: string): Promise<string> {
        throw Error('not login');
    }

    async nip44Encrypt(pubkey: string, plainText: string): Promise<string> {
        throw Error('not login');
    }

    async nip44Decrypt(pubkey: string, cipherText: string): Promise<string> {
        throw Error('not login');
    }
}