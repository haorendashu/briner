import { AuthResult } from '../consts/auth_result';
import type { AuthType } from '../consts/auth_type';
import { App } from './app';

// 存储键名
const STORAGE_KEY = 'briner_apps';

// 应用管理器类
export class AppManager {
    private apps: Map<string, App> = new Map(); // 使用code作为键
    private initialized: boolean = false;
    private permissionMaps: Map<string, Map<string, number>> = new Map(); // code -> permission map

    constructor() {
        this.initialize();
    }

    // 初始化 - 从存储中加载应用数据
    async initialize(): Promise<void> {
        if (this.initialized) return;

        try {
            const result = await chrome.storage.local.get([STORAGE_KEY]);
            const storedApps = result[STORAGE_KEY];

            if (storedApps && Array.isArray(storedApps)) {
                this.apps.clear();
                storedApps.forEach((appData: any) => {
                    const app = new App();
                    Object.assign(app, appData);
                    if (app.code) {
                        this.apps.set(app.code, app);
                        this.handleAppPermissionMap(app);
                    }
                });
            }

            this.initialized = true;
            console.log('AppManager initialized successfully');
        } catch (error) {
            console.error('Failed to initialize AppManager:', error);
            this.initialized = false;
        }
    }

    // 获取所有应用
    getAllApps(): App[] {
        return Array.from(this.apps.values());
    }

    // 根据 code 获取应用（主键查询）
    getAppByCode(code: string): App | undefined {
        return this.apps.get(code);
    }

    // 根据 pubkey 获取应用（辅助查询）
    getAppByPubkey(pubkey: string): App | undefined {
        return Array.from(this.apps.values()).find(app => app.pubkey === pubkey);
    }

    // 添加或更新应用
    async saveApp(app: App): Promise<boolean> {
        if (!app.code) { // 改为检查code
            console.error('Cannot save app without code');
            return false;
        }

        try {
            // 设置时间戳
            const now = Date.now();
            if (!app.createdAt) {
                app.createdAt = now;
            }
            app.updatedAt = now;

            // 保存到内存（使用code作为键）
            this.apps.set(app.code, app);

            // 保存到存储
            await this.saveToStorage();
            console.log('App saved successfully:', app.code);
            return true;
        } catch (error) {
            console.error('Failed to save app:', error);
            return false;
        }
    }

    // 删除应用（基于code）
    async deleteApp(code: string): Promise<boolean> {
        try {
            const deleted = this.apps.delete(code);
            if (deleted) {
                await this.saveToStorage();
                console.log('App deleted successfully:', code);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to delete app:', error);
            return false;
        }
    }

    // 检查应用是否存在（基于code）
    hasApp(code: string): boolean {
        return this.apps.has(code);
    }

    // 获取应用数量
    getAppCount(): number {
        return this.apps.size;
    }

    // 清空所有应用
    async clearAllApps(): Promise<boolean> {
        try {
            this.apps.clear();
            await chrome.storage.local.remove([STORAGE_KEY]);
            console.log('All apps cleared successfully');
            return true;
        } catch (error) {
            console.error('Failed to clear all apps:', error);
            return false;
        }
    }

    // 保存到存储
    private async saveToStorage(): Promise<void> {
        const appsArray = Array.from(this.apps.values());
        await chrome.storage.local.set({ [STORAGE_KEY]: appsArray });
    }

    // 监听存储变化（用于多标签页同步）
    setupStorageListener(): void {
        chrome.storage.onChanged.addListener((changes, namespace) => {
            if (namespace === 'local' && changes[STORAGE_KEY]) {
                this.handleStorageChange(changes[STORAGE_KEY]);
            }
        });
    }

    // 处理存储变化
    private handleStorageChange(change: chrome.storage.StorageChange): void {
        if (change.newValue && Array.isArray(change.newValue)) {
            this.apps.clear();
            change.newValue.forEach((appData: any) => {
                const app = new App();
                Object.assign(app, appData);
                if (app.code) { // 改为检查code
                    this.apps.set(app.code, app);
                    this.handleAppPermissionMap(app);
                }
            });
            console.log('Apps updated from storage change');
        }
    }

    checkPermission(code: string, authType: AuthType, eventKind?: number): AuthResult {
        const permissionMap = this.getAppPermissionMap(code);
        if (!permissionMap) {
            return AuthResult.REJECT;
        }

        let key = authType.toString();
        if (eventKind) {
            key += `-${eventKind}`;
        }

        const authResult = permissionMap.get(key) || AuthResult.ASK;
        return authResult;
    }

    updatePermissionsToApp(permissionMap: Map<string, number>, app: App) {
        const alwaysAllowItems: string[] = [];
        const alwaysRejectItems: string[] = [];

        // 按权限类型分组
        const okPermissions = new Map<string, Set<string>>();
        const rejectPermissions = new Map<string, Set<string>>();

        // 遍历权限映射，按权限类型分组
        for (const [key, value] of permissionMap) {
            const parts = key.split('-');
            const kind = parts[0];
            const eventKind = parts.length > 1 ? parts[1] : null;

            let perssionsMap = okPermissions;
            if (value == AuthResult.REJECT) {
                perssionsMap = rejectPermissions;
            }

            if (!perssionsMap.has(kind)) {
                perssionsMap.set(kind, new Set());
            }

            if (eventKind) {
                perssionsMap.get(kind)!.add(eventKind);
            }
        }

        // 设置应用的权限字符串
        app.alwaysAllow = this.singlePermissionsMapToStr(okPermissions);
        app.alwaysReject = this.singlePermissionsMapToStr(rejectPermissions);
    }

    private singlePermissionsMapToStr(map: Map<string, Set<string>>) {
        let permissionStrs = [];
        for (const [kind, eventKinds] of map) {
            let permissionStr = kind;
            if (eventKinds.size > 0) {
                permissionStr += `-${Array.from(eventKinds).join(',')}`;
            }

            permissionStrs.push(permissionStr);
        }

        return permissionStrs.join(';')
    }

    getAppPermissionMap(code: string): Map<string, number> | undefined {
        return this.permissionMaps.get(code);
    }

    private handleAppPermissionMap(app: App) {
        if (app.code) {
            this.permissionMaps.set(app.code, this.genPermissionMap(app));
        }
    }

    // 获取权限映射
    private genPermissionMap(app: App): Map<string, number> {
        const m = new Map<string, number>();
        this._putPermissionMapValue(m, app.alwaysAllow, AuthResult.OK);
        this._putPermissionMapValue(m, app.alwaysReject, AuthResult.REJECT);
        return m;
    }

    // 添加权限映射值
    private _putPermissionMapValue(
        m: Map<string, number>,
        permissionText: string | undefined,
        value: number
    ): void {
        if (this._isNotBlank(permissionText)) {
            const permissionStrs = permissionText!.split(";");
            for (const permissionStr of permissionStrs) {
                const strs = permissionStr.split("-");

                const kindStr = strs[0];
                if (strs.length === 1) {
                    m.set(kindStr, value);
                } else if (strs.length > 1) {
                    const eventKindsStr = strs[1];
                    const eventKindStrs = eventKindsStr.split(",");
                    for (const eventKindStr of eventKindStrs) {
                        const key = `${kindStr}-${eventKindStr}`;
                        m.set(key, value);
                    }
                }
            }
        }
    }

    // 检查字符串是否非空
    private _isNotBlank(text: string | undefined): boolean {
        return text !== undefined && text !== null && text.trim() !== '';
    }
}

// 创建全局实例
export const defaultAppManager = new AppManager();

// 导出便捷函数（更新接口以code为主键）
export const appManager = {
    // 初始化
    initialize: () => defaultAppManager.initialize(),

    // 获取应用
    getAll: () => defaultAppManager.getAllApps(),
    getByCode: (code: string) => defaultAppManager.getAppByCode(code), // 主查询
    getByPubkey: (pubkey: string) => defaultAppManager.getAppByPubkey(pubkey), // 辅助查询

    // 管理应用（基于code）
    save: (app: App) => defaultAppManager.saveApp(app),
    delete: (code: string) => defaultAppManager.deleteApp(code), // 改为code参数
    has: (code: string) => defaultAppManager.hasApp(code), // 改为code参数

    // 工具函数
    getCount: () => defaultAppManager.getAppCount(),
    clearAll: () => defaultAppManager.clearAllApps(),

    // 设置监听器
    setupListener: () => defaultAppManager.setupStorageListener(),

    updatePermissionsToApp: (permissionMap: Map<string, number>, app: App) => defaultAppManager.updatePermissionsToApp(permissionMap, app),

    getAppPermissionMap: (code: string) => defaultAppManager.getAppPermissionMap(code),

    checkPermission: (code: string, authType: AuthType, eventKind?: number) => defaultAppManager.checkPermission(code, authType, eventKind),
};