import type { NesignerInterface } from "js_nesigner_sdk";
import type { ISigner } from "./isigner";
import { getEventHash, type EventTemplate, type VerifiedEvent } from "nostr-tools";

export class NesignerSigner implements ISigner {
    private nesigner: NesignerInterface;
    constructor(nesigner: NesignerInterface) {
        this.nesigner = nesigner;
    }
    async getPublicKey(): Promise<string> {
        let result = await this.nesigner.getPublicKey();
        if (!result) {
            throw new Error("getPublicKey failed");
        }
        return result;
    }
    async signEvent(event: EventTemplate): Promise<VerifiedEvent> {
        const e = event as VerifiedEvent;
        e.pubkey = await this.getPublicKey();
        e.id = getEventHash(e);
        let sig = await this.nesigner.sign(e.id);
        if (!sig) {
            throw new Error("signEvent failed");
        }
        e.sig = sig;
        return e;
    }
    async nip04Encrypt(pubkey: string, plainText: string): Promise<string> {
        let result = await this.nesigner.encrypt(pubkey, plainText);
        if (!result) {
            throw new Error("nip04Encrypt failed");
        }
        return result;
    }
    async nip04Decrypt(pubkey: string, cipherText: string): Promise<string> {
        let result = await this.nesigner.decrypt(pubkey, cipherText);
        if (!result) {
            throw new Error("nip04Decrypt failed");
        }
        return result;
    }
    async nip44Encrypt(pubkey: string, plainText: string): Promise<string> {
        let result = await this.nesigner.nip44Encrypt(pubkey, plainText);
        if (!result) {
            throw new Error("nip44Encrypt failed");
        }
        return result;
    }
    async nip44Decrypt(pubkey: string, cipherText: string): Promise<string> {
        let result = await this.nesigner.nip44Decrypt(pubkey, cipherText);
        if (!result) {
            throw new Error("nip44Decrypt failed");
        }
        return result;
    }
}