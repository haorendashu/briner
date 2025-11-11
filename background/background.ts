// import { getSerialPort } from 'js_nesigner_sdk'
import { nip19 } from 'nostr-tools';
import { KeyType, User } from '../business/data/user';
import { userManager } from '../business/data/user_manager';
import type { ISigner } from '../business/nostr_signer/isigner';
import { NsecSigner } from '../business/nostr_signer/nsec_signer';
import { NostrMessageService } from '../business/service/nostr_message_service';
import { NpubSigner } from '../business/nostr_signer/npub_signer';
import { hexToBytes } from 'nostr-tools/utils';
import { RemoteSigner } from '../business/nostr_signer/remote_signer';
import { appManager } from '../business/data/app_manager';

console.log('Hello from the background script!')

let nostrMessageService: NostrMessageService;

async function handleSigner() {
    let currentSignerPubkeys = nostrMessageService.getAllSignerPubkeys()
    let currentUsers = await userManager.getAll()

    // 移除不在 currentUsers 中的 signer
    for (let pubkey of currentSignerPubkeys) {
        if (!currentUsers.some(user => user.pubkey === pubkey)) {
            nostrMessageService.removeSigner(pubkey)
        }
    }

    let hasHardwareUser = false;
    for (let currentUser of currentUsers) {
        if (!currentSignerPubkeys.includes(currentUser.pubkey)) {
            hasHardwareUser = addSigner(currentUser);
        }
    }

    if (hasHardwareUser) {
        // open hardware login page
        let authUrl = chrome.runtime.getURL('/pages/hardware_signer_login.html')
        chrome.windows.create({ url: authUrl, type: 'normal' }) // the popup type windows can't getSerialPort
    }
}

function addSigner(user: User): boolean {
    let hasHardwareUser = false;
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

    return hasHardwareUser
}

userManager.initialize().then(() => {
    userManager.addStorageChangeListener(() => {
        handleSigner()
    })
    userManager.setupListener()

    nostrMessageService = new NostrMessageService(true)
    handleSigner()
})

appManager.initialize().then(() => {
    appManager.setupListener()
})

chrome.runtime.onInstalled.addListener((detail) => {
    if (detail.reason === 'install') chrome.runtime.openOptionsPage()
})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // message: 发送的消息内容
    // sender: 包含发送方信息（如 tab 信息、扩展 ID 等）
    // sendResponse: 用于回复消息的函数
    console.log("receive message:", message)
    console.log("sender:", sender)

    if (nostrMessageService.shouldBeHandled(message)) {
        nostrMessageService.handle(message, sender, sendResponse)
        return true;
    }

    return false;
});