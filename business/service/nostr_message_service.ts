import { AuthResult } from '../consts/auth_result'
import { AuthType } from '../consts/auth_type'
import { ConnectType, DEFAULT_PERMISSION } from '../consts/connect_type'
import { OtherMessageType } from '../consts/other_message_type'
import { App } from '../data/app'
import { appManager } from '../data/app_manager'
import { AuthLog } from '../data/auth_log'
import { authLogManager } from '../data/auth_log_manager'
import type { ISigner } from '../nostr_signer/isigner'

export class NostrMessageService {

    private handleConnectMessage: boolean = true

    // key - value : pubkey, ISigner
    private signers: Map<String, ISigner> = new Map()
    // 存储等待连接完成的Promise解析器
    private pendingConnections: Map<string, { resolve: (app: any) => void, reject: (error: string) => void }> = new Map()
    // 存储等待权限确认的Promise解析器
    private pendingPermissions: Map<string, { resolve: (allowed: boolean) => void, reject: (error: string) => void }> = new Map()
    // the penddingPermission
    private pendingAlways: Map<string, boolean> = new Map()

    constructor(handleConnectMessage: boolean) {
        this.handleConnectMessage = handleConnectMessage;
    }

    addSigner(pubkey: string, signer: ISigner) {
        this.signers.set(pubkey, signer)
    }

    shouldBeHandled(message: any): boolean {
        let messageType = message.type
        if ((this.handleConnectMessage && messageType == OtherMessageType.CONNECTION_RESULT)
            || messageType == OtherMessageType.PERMISSION_RESULT) {
            return true;
        }

        if (messageType > 0 && messageType < 10) {
            return true;
        }

        return false;
    }

    async handle(message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void): Promise<boolean> {
        if (message.type === OtherMessageType.CONNECTION_RESULT) {
            this.handleConnectionResult(message.requestId, message);
            sendResponse({ success: true });
            return true;
        } else if (message.type === OtherMessageType.PERMISSION_RESULT) {
            this.handlePermissionResult(message.requestId, message.allowed, message.always);
            sendResponse({ success: true });
            return true;
        }

        let origin = sender.origin
        let url = sender.url

        let id = message.id
        let authType = message.type
        let params = message.params

        if (!origin) {
            sendResponse({ id: id, error: 'Origin is required' });
            return false;
        }

        // 1. 检查app是否存在，如果不存在则等待连接
        let app = appManager.getByCode(origin);
        if (this.handleConnectMessage && (!app || !app.pubkey || !app.code)) {
            try {
                // 异步等待app连接完成
                app = await this.waitForAppConnection(origin, message, sender);
                console.log('App connected result:', app);
                if (!app || !app.pubkey || !app.code) {
                    sendResponse({ id: id, error: 'App connection failed: invalid app data' });
                    return true;
                }
            } catch (error) {
                console.error('App connection failed:', error);
                sendResponse({ id: id, error: error });
                return true;
            }
        }
        if (!app || !app.pubkey || !app.code) {
            sendResponse({ id: id, error: 'App connection failed: app is undefined' });
            return true;
        }

        let signer = this.signers.get(app.pubkey);
        if (!signer) {
            sendResponse({ id: id, error: 'No signer available for this app' });
            return false;
        }

        // 2. 检查权限
        let eventKind: number | undefined = undefined
        let permissionCheckPass = false
        let alwaysPermission: boolean | undefined = false
        if (app.connectType == ConnectType.FULLY_TRUST) {
            permissionCheckPass = true;
        } else if (app.connectType == ConnectType.ALWAY_REJECT) {
            permissionCheckPass = false;
        } else {
            if (authType == AuthType.SIGN_EVENT) {
                eventKind = params.kind
            }

            let authResult = appManager.checkPermission(app.code, authType, eventKind)
            if (authResult == AuthResult.OK) {
                permissionCheckPass = true
            } else if (authResult == AuthResult.REJECT) {
                permissionCheckPass = false
            } else if (authResult == AuthResult.ASK) {
                // 异步等待权限确认
                try {
                    const requestId = this.genRequestId()
                    permissionCheckPass = await this.waitForPermission(requestId, origin, authType, eventKind, message, sender)
                    console.log('Permission result:', permissionCheckPass)

                    alwaysPermission = this.pendingAlways.get(requestId)
                    this.pendingAlways.delete(requestId)
                } catch (error) {
                    console.error('Permission request failed:', error)
                    sendResponse({ id: id, error: error })
                    return true
                }
            }
        }

        try {
            let authContent = ''
            if (authType == AuthType.SIGN_EVENT) {
                authContent = JSON.stringify(params)
            } else if (authType == AuthType.SIGN_EVENT) {
                authContent = JSON.stringify(params)
            } else if (authType != AuthType.GET_PUBLIC_KEY && params.text) {
                authContent = params.text;
            }

            let authLog = new AuthLog()
            authLog.appCode = app.code
            authLog.authType = authType
            authLog.eventKind = eventKind
            authLog.content = authContent
            authLog.authResult = permissionCheckPass ? AuthResult.OK : AuthResult.REJECT
            authLogManager.add(authLog)
        } catch (e) {
            console.error('Add auth log failed:', e);
        }

        try {
            if (alwaysPermission === true && app.connectType == ConnectType.REASONABLE) {
                appManager.checkAndAddPermission(app, permissionCheckPass, authType, eventKind)
            }
        } catch (e) {
            console.error('App permission save fail:', e);
        }

        if (!permissionCheckPass) {
            sendResponse({ id: id, error: 'Permission denied' })
            return true;
        }

        // if (this.signers.size == 0) {
        //     return false
        // }
        // let signer = this.signers.values().next().value as ISigner

        // 3. 执行具体的操作
        try {
            await this.executeAuthOperation(authType, signer, params, sendResponse, id);
        } catch (error) {
            console.error('Auth operation failed:', error);
            sendResponse({ id: id, error: 'Auth operation failed' });
        }

        return true;
    }

    // 异步等待app连接
    private waitForAppConnection(origin: string, message: any, sender: chrome.runtime.MessageSender): Promise<any> {
        return new Promise((resolve, reject) => {
            const requestId = this.genRequestId()

            // 存储Promise解析器
            this.pendingConnections.set(requestId, { resolve, reject });

            // 打开连接窗口
            const connectUrl = this.buildConnectUrl(origin, requestId);
            chrome.windows.create({
                url: connectUrl,
                type: 'popup',
                width: 400,
                height: 600
            }).then((window) => {
                console.log('Connection window opened:', window);
            }).catch((error) => {
                console.error('Failed to open connection window:', error);
                reject('Failed to open connection window');
                this.pendingConnections.delete(requestId);
            });
        });
    }

    // 异步等待权限确认
    private waitForPermission(requestId: string, origin: string, authType: AuthType, eventKind: number | undefined, message: any, sender: chrome.runtime.MessageSender): Promise<boolean> {
        return new Promise((resolve, reject) => {
            // 存储Promise解析器
            this.pendingPermissions.set(requestId, { resolve, reject })

            let params = message.params
            let paramsStr = JSON.stringify(params)

            // 打开权限确认窗口（这里需要你实现具体的权限确认界面）
            const permissionUrl = this.buildPermissionUrl(origin, authType, eventKind, requestId, paramsStr);
            chrome.windows.create({
                url: permissionUrl,
                type: 'popup',
                width: 400,
                height: 600
            }).then((window) => {
                console.log('Permission window opened:', window);
            }).catch((error) => {
                console.error('Failed to open permission window:', error);
                reject('Failed to open permission window');
                this.pendingPermissions.delete(requestId);
            });
        });
    }

    private genRequestId() {
        return `${Date.now()}${Math.floor(Math.random() * 10000)}`
    }

    // 处理连接结果
    private async handleConnectionResult(requestId: string, message: any): Promise<void> {
        const pendingConnection = this.pendingConnections.get(requestId);
        if (!pendingConnection) {
            console.warn('No pending connection found for:', requestId);
            return;
        }

        // 清理pending连接
        this.pendingConnections.delete(requestId);

        if (message != null && message.origin && message.pubkey && message.connectType) {
            let origin = message.origin
            let connectType = message.connectType
            let pubkey = message.pubkey

            if (connectType == ConnectType.FULLY_TRUST || connectType == ConnectType.REASONABLE || connectType == ConnectType.ALWAY_REJECT) {
                let app = new App()
                app.pubkey = pubkey
                app.code = origin
                app.connectType = connectType

                if (connectType == ConnectType.REASONABLE) {
                    // config default permission
                    app.alwaysAllow = DEFAULT_PERMISSION
                }

                let saveResult = await appManager.save(app)
                if (saveResult) {
                    appManager.handleAppPermissionMap(app)
                    pendingConnection.resolve(app);
                    return;
                }
            }
        }

        // 连接失败
        pendingConnection.reject('App connection failed or was cancelled');
    }

    // 处理权限结果
    private handlePermissionResult(requestId: string, allowed: boolean, always: boolean): void {
        const pendingPermission = this.pendingPermissions.get(requestId);
        if (!pendingPermission) {
            return;
        }

        if (always === true) {
            this.pendingAlways.set(requestId, true)
        }

        pendingPermission.resolve(allowed);
        this.pendingPermissions.delete(requestId);
    }

    // 构建连接URL
    private buildConnectUrl(origin: string, requestId: string): string {
        return chrome.runtime.getURL(`/pages/connect.html?origin=${encodeURIComponent(origin)}&requestId=${requestId}`);
    }

    // 构建权限确认URL
    private buildPermissionUrl(origin: string, authType: AuthType, eventKind: number | undefined, requestId: string, paramsStr: string): string {
        return chrome.runtime.getURL(`/pages/auth.html?origin=${encodeURIComponent(origin)}&authType=${authType}&eventKind=${eventKind || ''}&requestId=${requestId}&params=${paramsStr}`);
    }

    // 执行具体的认证操作
    private async executeAuthOperation(authType: AuthType, signer: ISigner, params: any, sendResponse: (response?: any) => void, id: string): Promise<void> {
        switch (authType) {
            case AuthType.GET_PUBLIC_KEY:
                {
                    const res = await signer.getPublicKey();
                    console.log('getPublicKey:', res);
                    sendResponse({ id: id, response: res });
                    break;
                }
            case AuthType.SIGN_EVENT:
                {
                    const res = await signer.signEvent(params);
                    sendResponse({ id: id, response: res });
                    break;
                }
            case AuthType.NIP04_DECRYPT:
                {
                    const pubkey = params.pubkey;
                    const text = params.text;
                    const res = await signer.nip04Decrypt(pubkey, text);
                    sendResponse({ id: id, response: res });
                    break;
                }
            case AuthType.NIP04_ENCRYPT:
                {
                    const pubkey = params.pubkey;
                    const text = params.text;
                    const res = await signer.nip04Encrypt(pubkey, text);
                    sendResponse({ id: id, response: res });
                    break;
                }
            case AuthType.NIP44_DECRYPT:
                {
                    const pubkey = params.pubkey;
                    const text = params.text;
                    const res = await signer.nip44Decrypt(pubkey, text);
                    sendResponse({ id: id, response: res });
                    break;
                }
            case AuthType.NIP44_ENCRYPT:
                {
                    const pubkey = params.pubkey;
                    const text = params.text;
                    const res = await signer.nip44Encrypt(pubkey, text);
                    sendResponse({ id: id, response: res });
                    break;
                }
            default:
                throw new Error(`Unsupported auth type: ${authType}`);
        }
    }

}