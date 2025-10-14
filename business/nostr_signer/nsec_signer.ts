import { finalizeEvent, getPublicKey, type EventTemplate, type VerifiedEvent } from "nostr-tools";
import type { ISigner } from "./isigner";
import { hexToBytes } from "nostr-tools/utils";
import { decrypt, encrypt } from "nostr-tools/nip04";
import { getConversationKey, decrypt as nip44Decrypt, encrypt as nip44Encrypt } from "nostr-tools/nip44";

export class NsecSigner implements ISigner {
    private secretKey: Uint8Array;

    private nsec: string;

    private pubkey: string;

    constructor(nsec: string) {
        this.nsec = nsec;
        this.secretKey = hexToBytes(nsec);
        this.pubkey = getPublicKey(this.secretKey);
    }

    async getPublicKey(): Promise<string> {
        return this.pubkey;
    }

    async signEvent(event: EventTemplate): Promise<VerifiedEvent> {
        return finalizeEvent(event, this.secretKey);
    }

    async nip04Encrypt(pubkey: string, plainText: string): Promise<string> {
        return encrypt(this.secretKey, pubkey, plainText);
    }

    async nip04Decrypt(pubkey: string, cipherText: string): Promise<string> {
        return decrypt(this.secretKey, pubkey, cipherText);
    }

    async nip44Encrypt(pubkey: string, plainText: string): Promise<string> {
        const conversationKey = getConversationKey(this.secretKey, pubkey);
        return nip44Encrypt(plainText, conversationKey);
    }

    async nip44Decrypt(pubkey: string, cipherText: string): Promise<string> {
        const conversationKey = getConversationKey(this.secretKey, pubkey);
        return nip44Decrypt(cipherText, conversationKey);
    }
}