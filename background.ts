// import { getSerialPort } from 'js_nesigner_sdk'
import type { ISigner } from './business/nostr_signer/isigner';
import { NsecSigner } from './business/nostr_signer/nsec_signer';

console.log('Hello from the background script!')

let signer: ISigner | null;

signer = new NsecSigner('');

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // message: 发送的消息内容
    // sender: 包含发送方信息（如 tab 信息、扩展 ID 等）
    // sendResponse: 用于回复消息的函数
    console.log("receive message:", message)
    console.log("sender:", sender)

    let origin = sender.origin
    let url = sender.url

    let id = message.id
    let type = message.type
    let params = message.params

    switch (type) {
        case 'getPublicKey':
            {
                signer?.getPublicKey().then((res) => {
                    console.log('getPublicKey:', res)
                    sendResponse({ id: id, response: res })
                })
                break;
            }
        case 'signEvent':
            signer?.signEvent(params).then((res) => {
                sendResponse({ id: id, response: res })
            })
            break;
        case 'nip04Decrypt':
            {
                let pubkey = params.pubkey
                let text = params.text
                signer?.nip04Decrypt(pubkey, text).then((res) => {
                    sendResponse({ id: id, response: res })
                })
                break;
            }
        case 'nip04Encrypt':
            {
                let pubkey = params.pubkey
                let text = params.text
                signer?.nip04Encrypt(pubkey, text).then((res) => {
                    sendResponse({ id: id, response: res })
                })
                break;
            }
        case 'nip44Decrypt':
            {
                let pubkey = params.pubkey
                let text = params.text
                signer?.nip44Decrypt(pubkey, text).then((res) => {
                    sendResponse({ id: id, response: res })
                })
                break;
            }
        case 'nip44Encrypt':
            {
                let pubkey = params.pubkey
                let text = params.text
                signer?.nip44Encrypt(pubkey, text).then((res) => {
                    sendResponse({ id: id, response: res })
                })
                break;
            }
    }

    // sendResponse({ id: id, response: "Hello from background script!" });
    // chrome.action.openPopup()
    return true;
});