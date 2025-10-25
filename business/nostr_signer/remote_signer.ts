import { getEventHash, type EventTemplate, type VerifiedEvent } from "nostr-tools";
import type { ISigner } from "./isigner";
import { BUNKER_REGEX, BunkerSigner, queryBunkerProfile, type BunkerPointer } from "nostr-tools/nip46";
import { hexToBytes } from "nostr-tools/utils";

export type ExtendBunkerPointer = BunkerPointer & {
    localSignerSecretKey: string | null,
    userPubkey: string | null,
}

export async function parseExtendBunkerInput(input: string): Promise<ExtendBunkerPointer | null> {
    let match = input.match(BUNKER_REGEX);
    if (match) {
        try {
            const pubkey = match[1];
            const qs = new URLSearchParams(match[2]);
            return {
                pubkey,
                relays: qs.getAll("relay"),
                secret: qs.get("secret"),
                localSignerSecretKey: qs.get("localSignerSecretKey"),
                userPubkey: qs.get("userPubkey")
            };
        } catch (_err) {
        }
    }
    let result = await queryBunkerProfile(input);
    if (result) {
        return {
            ...result,
            localSignerSecretKey: null,
            userPubkey: null,
        }
    }

    return null;
}

export function toExtendBunkerURL(bunkerPointer: ExtendBunkerPointer) {
    let bunkerURL = new URL(`bunker://${bunkerPointer.pubkey}`);
    bunkerPointer.relays.forEach((relay) => {
        bunkerURL.searchParams.append("relay", relay);
    });
    if (bunkerPointer.secret) {
        bunkerURL.searchParams.set("secret", bunkerPointer.secret);
    }
    if (bunkerPointer.localSignerSecretKey) {
        bunkerURL.searchParams.set("localSignerSecretKey", bunkerPointer.localSignerSecretKey);
    }
    if (bunkerPointer.userPubkey) {
        bunkerURL.searchParams.set("userPubkey", bunkerPointer.userPubkey);
    }
    return bunkerURL.toString();
}

export class RemoteSigner implements ISigner {

    private bunkerUrl: string;

    private bunkerSigner: BunkerSigner | null = null;

    constructor(bunkerUrl: string) {
        this.bunkerUrl = bunkerUrl;
    }

    async login(): Promise<boolean> {
        let bunkerPointer = await parseExtendBunkerInput(this.bunkerUrl);
        if (!bunkerPointer || !bunkerPointer.localSignerSecretKey) {
            throw new Error("parseBunkerInput failed");
        }

        let localSignerSecretKeyBytes = hexToBytes(bunkerPointer.localSignerSecretKey)
        this.bunkerSigner = BunkerSigner.fromBunker(localSignerSecretKeyBytes, bunkerPointer)
        await this.bunkerSigner.connect();
        let pubkey = await this.bunkerSigner.getPublicKey()
        if (pubkey) {
            return true;
        }
        return false;
    }

    async close() {
        await this.bunkerSigner?.close();
    }

    async getPublicKey(): Promise<string> {
        let result = await this.bunkerSigner?.getPublicKey();
        if (!result) {
            throw new Error("getPublicKey failed");
        }
        return result;
    }
    async signEvent(event: EventTemplate): Promise<VerifiedEvent> {
        const e = event as VerifiedEvent;
        e.pubkey = await this.getPublicKey();
        e.id = getEventHash(e);
        let result = await this.bunkerSigner?.signEvent(e);
        if (!result) {
            throw new Error("signEvent failed");
        }
        return result;
    }
    async nip04Encrypt(pubkey: string, plainText: string): Promise<string> {
        let result = await this.bunkerSigner?.nip04Encrypt(pubkey, plainText);
        if (!result) {
            throw new Error("nip04Encrypt failed");
        }
        return result;
    }
    async nip04Decrypt(pubkey: string, cipherText: string): Promise<string> {
        let result = await this.bunkerSigner?.nip04Decrypt(pubkey, cipherText);
        if (!result) {
            throw new Error("nip04Decrypt failed");
        }
        return result;
    }
    async nip44Encrypt(pubkey: string, plainText: string): Promise<string> {
        let result = await this.bunkerSigner?.nip44Encrypt(pubkey, plainText);
        if (!result) {
            throw new Error("nip44Encrypt failed");
        }
        return result;
    }
    async nip44Decrypt(pubkey: string, cipherText: string): Promise<string> {
        let result = await this.bunkerSigner?.nip44Decrypt(pubkey, cipherText);
        if (!result) {
            throw new Error("nip44Decrypt failed");
        }
        return result;
    }
}