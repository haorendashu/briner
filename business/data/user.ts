
export enum KeyType {
    NSEC = 0,
    NPUB = 1,
    REMOTE = 2,
    HARDWARE = 3,
}

export class User {
    pubkey: string;
    keyType: number;
    keyText: string | undefined;
    createdAt: number | undefined;
    updatedAt: number | undefined;

    constructor(pubkey: string, keyType: number, keyText?: string) {
        this.pubkey = pubkey;
        this.keyType = keyType;
        this.keyText = keyText;
    }
}