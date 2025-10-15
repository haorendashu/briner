
export class App {
    pubkey: string | undefined;
    code: string | undefined;
    name: string | undefined;
    connectType: number | undefined;
    alwaysAllow: string | undefined;
    alwaysReject: string | undefined;
    createdAt: number | undefined;
    updatedAt: number | undefined;

    constructor() {
        this.pubkey = undefined;
        this.code = undefined;
        this.name = undefined;
        this.connectType = undefined;
        this.alwaysAllow = undefined;
        this.alwaysReject = undefined;
        this.createdAt = undefined;
        this.updatedAt = undefined;
    }

}