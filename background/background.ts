// import { getSerialPort } from 'js_nesigner_sdk'
import { nip19 } from 'nostr-tools';
import { KeyType } from '../business/data/user';
import { userManager } from '../business/data/user_manager';
import type { ISigner } from '../business/nostr_signer/isigner';
import { NsecSigner } from '../business/nostr_signer/nsec_signer';
import { NostrMessageService } from '../business/service/nostr_message_service';
import { NpubSigner } from '../business/nostr_signer/npub_signer';
import { hexToBytes } from 'nostr-tools/utils';
import { RemoteSigner } from '../business/nostr_signer/remote_signer';

console.log('Hello from the background script!')

let nostrMessageService: NostrMessageService;

userManager.initialize().then(() => {
    nostrMessageService = new NostrMessageService();

    let hasHardwareUser = false;
    let allUser = userManager.getAll()
    for (var user of allUser) {
        if (user.keyType == KeyType.NSEC && user.keyText) {
            if (user.keyText.startsWith('nsec')) {
                // nsec private key
                let decodedResult = nip19.decode(user.keyText);
                if (decodedResult.type == 'nsec') {
                    nostrMessageService!.addSigner(user.pubkey, new NsecSigner(decodedResult.data))
                }
            } else {
                // hex private key
                nostrMessageService!.addSigner(user.pubkey, new NsecSigner(hexToBytes(user.keyText)))
            }
        } else if (user.keyType == KeyType.NPUB) {
            nostrMessageService!.addSigner(user.pubkey, new NpubSigner(user.pubkey));
        } else if (user.keyType == KeyType.REMOTE && user.keyText) {
            let remoteSigner = new RemoteSigner(user.keyText)
            remoteSigner.login()
            nostrMessageService!.addSigner(user.pubkey, remoteSigner)
        } else if (user.keyType == KeyType.HARDWARE) {
            hasHardwareUser = true;
        }
    }

    if (hasHardwareUser) {
        // open hardware login page
        let oauthUrl = chrome.runtime.getURL('/pages/hardware_signer_login.html')
        chrome.windows.create({ url: oauthUrl, type: 'normal' }) // the popup type windows can't getSerialPort
    }
})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // message: 发送的消息内容
    // sender: 包含发送方信息（如 tab 信息、扩展 ID 等）
    // sendResponse: 用于回复消息的函数
    console.log("receive message:", message)
    console.log("sender:", sender)

    if (nostrMessageService.handle(message, sender, sendResponse)) {
        return true;
    }

    // TODO handle other message type

    // let origin = sender.origin
    // let url = sender.url

    // let id = message.id
    // let type = message.type
    // let params = message.params

    // switch (type) {
    //     case 'getPublicKey':
    //         {
    //             signer?.getPublicKey().then((res) => {
    //                 console.log('getPublicKey:', res)
    //                 sendResponse({ id: id, response: res })
    //             })
    //             break;
    //         }
    // }

    // sendResponse({ id: id, response: "Hello from background script!" });
    // chrome.action.openPopup()
    return true;
});