import { AuthResult } from '../consts/auth_result';
import { AuthType } from '../consts/auth_type';
import { ConnectType } from '../consts/connect_type';
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
        let authType = message.type
        let params = message.params

        if (!origin) {
            return false;
        }

        let app = appManager.getByCode(origin);
        if (!app || !app.pubkey || !app.code) {
            // TODO app connect !
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

        // check permission
        let permissionCheckPass = false;
        if (app.connectType == ConnectType.FULLY_TRUST) {
            permissionCheckPass = true;
        } else if (app.connectType == ConnectType.ALWAY_REJECT) {
            permissionCheckPass = false;
        } else {
            let eventKind: number | undefined = undefined;
            // if (authType == AuthType.SIGN_EVENT || authType == AuthType.DECRYPT_ZAP_EVENT) {
            if (authType == AuthType.SIGN_EVENT) {
                eventKind = params.kind
            }

            let authResult = appManager.checkPermission(app.code, authType, eventKind)
            if (authResult == AuthResult.OK) {
                permissionCheckPass = true;
            } else if (authResult == AuthResult.REJECT) {
                permissionCheckPass = false;
            } else if (authResult == AuthResult.ASK) {
                // TODO ask for permission
            }
        }

        if (!permissionCheckPass) {
            sendResponse({ id: id, error: 'Permission denied' })
            return true;
        }

        switch (authType) {
            case AuthType.GET_PUBLIC_KEY:
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
            case AuthType.SIGN_EVENT:
                signer?.signEvent(params).then((res) => {
                    sendResponse({ id: id, response: res })
                }).catch((err) => {
                    console.log('signEvent error:', err)
                    sendResponse({ id: id, error: err.message })
                })
                break;
            case AuthType.NIP04_DECRYPT:
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
            case AuthType.NIP04_ENCRYPT:
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
            case AuthType.NIP44_DECRYPT:
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
            case AuthType.NIP44_ENCRYPT:
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
