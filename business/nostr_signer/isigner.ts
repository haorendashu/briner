
import type { EventTemplate, VerifiedEvent } from 'nostr-tools'

export interface ISigner {
    getPublicKey: () => Promise<string>
    signEvent: (event: EventTemplate) => Promise<VerifiedEvent>
    nip04Encrypt: (pubkey: string, plainText: string) => Promise<string>
    nip04Decrypt: (pubkey: string, cipherText: string) => Promise<string>
    nip44Encrypt: (pubkey: string, plainText: string) => Promise<string>
    nip44Decrypt: (pubkey: string, cipherText: string) => Promise<string>
}