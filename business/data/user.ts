
export class User {
    pubkey: string;
    keyType: number;
    nesc: string | undefined;
    createdAt: number | undefined;
    updatedAt: number | undefined;

    constructor(pubkey: string, keyType: number, nesc?: string) {
        this.pubkey = pubkey;
        this.keyType = keyType;
        this.nesc = nesc;
    }
}