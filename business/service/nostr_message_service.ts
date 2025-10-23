import { appManager } from '../data/app_manager'
import type { ISigner } from '../nostr_signer/isigner'

export class NostrMessageService {

    // key - value : pubkey, ISigner
    private signers: Map<String, ISigner> = new Map();

    addSigner(pubkey: string, signer: ISigner) {
        this.signers.set(pubkey, signer)
    }

    handle(message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void): boolean {
        let origin = sender.origin
        let url = sender.url

        let id = message.id
        let type = message.type
        let params = message.params

        if (!origin) {
            return false;
        }

        let app = appManager.getByCode(origin);
        if (!app || !app.pubkey) {
            return false;
        }

        let signer = this.signers.get(app.pubkey);
        if (!signer) {
            return false;
        }
        // if (this.signers.size == 0) {
        //     return false
        // }
        // let signer = this.signers.values().next().value

        switch (type) {
            case 'getPublicKey':
                {
                    signer?.getPublicKey().then((res) => {
                        console.log('getPublicKey:', res)
                        sendResponse({ id: id, response: res })
                    }).catch((err) => {
                        console.log('getPublicKey error:', err)
                        sendResponse({ id: id, error: err.message })
                    })
                    break;
                }
            case 'signEvent':
                signer?.signEvent(params).then((res) => {
                    sendResponse({ id: id, response: res })
                }).catch((err) => {
                    console.log('signEvent error:', err)
                    sendResponse({ id: id, error: err.message })
                })
                break;
            case 'nip04Decrypt':
                {
                    let pubkey = params.pubkey
                    let text = params.text
                    signer?.nip04Decrypt(pubkey, text).then((res) => {
                        sendResponse({ id: id, response: res })
                    }).catch((err) => {
                        console.log('nip04Decrypt error:', err)
                        sendResponse({ id: id, error: err.message })
                    })
                    break;
                }
            case 'nip04Encrypt':
                {
                    let pubkey = params.pubkey
                    let text = params.text
                    signer?.nip04Encrypt(pubkey, text).then((res) => {
                        sendResponse({ id: id, response: res })
                    }).catch((err) => {
                        console.log('nip04Encrypt error:', err)
                        sendResponse({ id: id, error: err.message })
                    })
                    break;
                }
            case 'nip44Decrypt':
                {
                    let pubkey = params.pubkey
                    let text = params.text
                    signer?.nip44Decrypt(pubkey, text).then((res) => {
                        sendResponse({ id: id, response: res })
                    }).catch((err) => {
                        console.log('nip44Decrypt error:', err)
                        sendResponse({ id: id, error: err.message })
                    })
                    break;
                }
            case 'nip44Encrypt':
                {
                    let pubkey = params.pubkey
                    let text = params.text
                    signer?.nip44Encrypt(pubkey, text).then((res) => {
                        sendResponse({ id: id, response: res })
                    }).catch((err) => {
                        console.log('nip44Encrypt error:', err)
                        sendResponse({ id: id, error: err.message })
                    })
                    break;
                }
        }

        return true;
    }

    saveAuthLog() { }

}
