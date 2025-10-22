import { User } from './user';

// 存储键名
const STORAGE_KEY = 'briner_users';

// 用户管理器类
export class UserManager {
    private users: Map<string, User> = new Map(); // 使用pubkey作为键
    private initialized: boolean = false;

    constructor() {
        this.initialize();
    }

    // 初始化 - 从存储中加载用户数据
    async initialize(): Promise<void> {
        if (this.initialized) return;

        try {
            const result = await chrome.storage.local.get([STORAGE_KEY]);
            const storedUsers = result[STORAGE_KEY];

            if (storedUsers && Array.isArray(storedUsers)) {
                this.users.clear();
                storedUsers.forEach((userData: any) => {
                    const user = new User(userData.pubkey, userData.keyType, userData.nesc);
                    Object.assign(user, userData);
                    if (user.pubkey) {
                        this.users.set(user.pubkey, user);
                    }
                });
            }

            this.initialized = true;
            console.log('UserManager initialized successfully');
        } catch (error) {
            console.error('Failed to initialize UserManager:', error);
            this.initialized = false;
        }
    }

    // 获取所有用户
    getAllUsers(): User[] {
        return Array.from(this.users.values());
    }

    // 根据 pubkey 获取用户（主键查询）
    getUserByPubkey(pubkey: string): User | undefined {
        return this.users.get(pubkey);
    }

    // 根据 keyType 获取用户（辅助查询）
    getUsersByKeyType(keyType: number): User[] {
        return Array.from(this.users.values()).filter(user => user.keyType === keyType);
    }

    // 添加或更新用户
    async saveUser(user: User): Promise<boolean> {
        if (!user.pubkey) {
            console.error('Cannot save user without pubkey');
            return false;
        }

        try {
            // 设置时间戳
            const now = Date.now();
            if (!user.createdAt) {
                user.createdAt = now;
            }
            user.updatedAt = now;

            // 保存到内存
            this.users.set(user.pubkey, user);

            // 保存到存储
            await this.saveToStorage();
            console.log('User saved successfully:', user.pubkey);
            return true;
        } catch (error) {
            console.error('Failed to save user:', error);
            return false;
        }
    }

    // 删除用户（基于pubkey）
    async deleteUser(pubkey: string): Promise<boolean> {
        try {
            const deleted = this.users.delete(pubkey);
            if (deleted) {
                await this.saveToStorage();
                console.log('User deleted successfully:', pubkey);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to delete user:', error);
            return false;
        }
    }

    // 检查用户是否存在（基于pubkey）
    hasUser(pubkey: string): boolean {
        return this.users.has(pubkey);
    }

    // 获取用户数量
    getUserCount(): number {
        return this.users.size;
    }

    // 清空所有用户
    async clearAllUsers(): Promise<boolean> {
        try {
            this.users.clear();
            await chrome.storage.local.remove([STORAGE_KEY]);
            console.log('All users cleared successfully');
            return true;
        } catch (error) {
            console.error('Failed to clear all users:', error);
            return false;
        }
    }

    // 保存到存储
    private async saveToStorage(): Promise<void> {
        const usersArray = Array.from(this.users.values());
        await chrome.storage.local.set({ [STORAGE_KEY]: usersArray });
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
            this.users.clear();
            change.newValue.forEach((userData: any) => {
                const user = new User(userData.pubkey, userData.keyType, userData.keyText);
                Object.assign(user, userData);
                if (user.pubkey) {
                    this.users.set(user.pubkey, user);
                }
            });
            console.log('Users updated from storage change');
        }
    }
}

// 创建全局实例
export const defaultUserManager = new UserManager();

// 导出便捷函数
export const userManager = {
    // 初始化
    initialize: () => defaultUserManager.initialize(),

    // 获取用户
    getAll: () => defaultUserManager.getAllUsers(),
    getByPubkey: (pubkey: string) => defaultUserManager.getUserByPubkey(pubkey), // 主查询
    getByKeyType: (keyType: number) => defaultUserManager.getUsersByKeyType(keyType), // 辅助查询

    // 管理用户（基于pubkey）
    save: (user: User) => defaultUserManager.saveUser(user),
    delete: (pubkey: string) => defaultUserManager.deleteUser(pubkey),
    has: (pubkey: string) => defaultUserManager.hasUser(pubkey),

    // 工具函数
    getCount: () => defaultUserManager.getUserCount(),
    clearAll: () => defaultUserManager.clearAllUsers(),

    // 设置监听器
    setupListener: () => defaultUserManager.setupStorageListener()
};