import { AuthLog } from './auth_log';

// IndexedDB 数据库配置
const DB_NAME = 'BrinerAuthLogDB';
const DB_VERSION = 1;
const STORE_NAME = 'auth_logs';

// 认证日志管理器类
export class AuthLogManager {
    private db: IDBDatabase | null = null;
    private initialized: boolean = false;

    constructor() {
        this.initialize();
    }

    // 初始化 IndexedDB 数据库
    async initialize(): Promise<void> {
        if (this.initialized) return;

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => {
                console.error('Failed to open IndexedDB:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                this.initialized = true;
                console.log('AuthLogManager initialized successfully');
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;

                // 创建对象存储
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    const store = db.createObjectStore(STORE_NAME, {
                        keyPath: 'id',
                        autoIncrement: true
                    });

                    // 创建索引
                    store.createIndex('appCode', ['appCode', 'createdAt'], { unique: false });
                    store.createIndex('createdAt', 'createdAt', { unique: false });
                }
            };
        });
    }

    // 添加认证日志
    async addAuthLog(log: AuthLog): Promise<number> {
        if (!this.initialized) {
            await this.initialize();
        }

        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const transaction = this.db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);

            // 设置创建时间
            log.createdAt = Date.now();

            // 创建不包含 id 字段的对象副本，让数据库自动生成
            const { id, ...logWithoutId } = log;
            const request = store.add(logWithoutId);

            request.onsuccess = () => {
                console.log('AuthLog added successfully with ID:', request.result);
                resolve(request.result as number);
            };

            request.onerror = () => {
                console.error('Failed to add AuthLog:', request.error);
                reject(request.error);
            };
        });
    }

    // 根据 ID 获取认证日志
    async getAuthLogById(id: number): Promise<AuthLog | null> {
        if (!this.initialized) {
            await this.initialize();
        }

        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const transaction = this.db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(id);

            request.onsuccess = () => {
                resolve(request.result || null);
            };

            request.onerror = () => {
                console.error('Failed to get AuthLog:', request.error);
                reject(request.error);
            };
        });
    }

    // 获取所有认证日志
    async getAllAuthLogs(): Promise<AuthLog[]> {
        if (!this.initialized) {
            await this.initialize();
        }

        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const transaction = this.db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAll();

            request.onsuccess = () => {
                resolve(request.result || []);
            };

            request.onerror = () => {
                console.error('Failed to get all AuthLogs:', request.error);
                reject(request.error);
            };
        });
    }

    // 根据应用代码获取认证日志（带分页）
    async getAuthLogsByAppCode(appCode: number, page: number = 1, pageSize: number = 20): Promise<AuthLog[]> {
        if (!this.initialized) {
            await this.initialize();
        }

        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const transaction = this.db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const index = store.index('appCode');
            const request = index.openCursor(IDBKeyRange.only(appCode), 'prev'); // 按时间倒序

            const results: AuthLog[] = [];
            const startIndex = (page - 1) * pageSize;
            let currentIndex = 0;

            request.onsuccess = () => {
                const cursor = request.result;
                if (cursor) {
                    // 跳过前面的记录
                    if (currentIndex < startIndex) {
                        currentIndex++;
                        cursor.advance(startIndex - currentIndex + 1);
                        return;
                    }

                    // 收集当前页的记录
                    if (results.length < pageSize) {
                        results.push(cursor.value);
                        cursor.continue();
                    } else {
                        resolve(results);
                    }
                } else {
                    resolve(results);
                }
            };

            request.onerror = () => {
                console.error('Failed to get AuthLogs by appCode with pagination:', request.error);
                reject(request.error);
            };
        });
    }

    // 根据应用代码获取认证日志数量
    async getAuthLogsCountByAppCode(appCode: number): Promise<number> {
        if (!this.initialized) {
            await this.initialize();
        }

        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const transaction = this.db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const index = store.index('appCode');
            const request = index.count(IDBKeyRange.only(appCode));

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                console.error('Failed to get AuthLogs count by appCode:', request.error);
                reject(request.error);
            };
        });
    }

    // 获取最近 N 条认证日志（带分页）
    async getRecentAuthLogs(page: number = 1, pageSize: number = 20): Promise<AuthLog[]> {
        if (!this.initialized) {
            await this.initialize();
        }

        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const transaction = this.db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const index = store.index('createdAt');
            const request = index.openCursor(null, 'prev'); // 从最新开始

            const results: AuthLog[] = [];
            const startIndex = (page - 1) * pageSize;
            let currentIndex = 0;

            request.onsuccess = () => {
                const cursor = request.result;
                if (cursor) {
                    // 跳过前面的记录
                    if (currentIndex < startIndex) {
                        currentIndex++;
                        cursor.continue();
                        return;
                    }

                    // 收集当前页的记录
                    if (results.length < pageSize) {
                        results.push(cursor.value);
                        cursor.continue();
                    } else {
                        resolve(results);
                    }
                } else {
                    resolve(results);
                }
            };

            request.onerror = () => {
                console.error('Failed to get recent AuthLogs:', request.error);
                reject(request.error);
            };
        });
    }

    // 删除认证日志
    async deleteAuthLog(id: number): Promise<boolean> {
        if (!this.initialized) {
            await this.initialize();
        }

        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const transaction = this.db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete(id);

            request.onsuccess = () => {
                console.log('AuthLog deleted successfully:', id);
                resolve(true);
            };

            request.onerror = () => {
                console.error('Failed to delete AuthLog:', request.error);
                reject(request.error);
            };
        });
    }

    // 根据应用代码删除认证日志
    async deleteAuthLogsByAppCode(appCode: number): Promise<boolean> {
        if (!this.initialized) {
            await this.initialize();
        }

        return new Promise(async (resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }

            try {
                const logs = await this.getAuthLogsByAppCode(appCode);
                const deletePromises = logs.map(log =>
                    log.id ? this.deleteAuthLog(log.id) : Promise.resolve(false)
                );

                await Promise.all(deletePromises);
                console.log(`All AuthLogs for appCode ${appCode} deleted successfully`);
                resolve(true);
            } catch (error) {
                console.error('Failed to delete AuthLogs by appCode:', error);
                reject(error);
            }
        });
    }

    // 清空所有认证日志
    async clearAllAuthLogs(): Promise<boolean> {
        if (!this.initialized) {
            await this.initialize();
        }

        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const transaction = this.db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.clear();

            request.onsuccess = () => {
                console.log('All AuthLogs cleared successfully');
                resolve(true);
            };

            request.onerror = () => {
                console.error('Failed to clear all AuthLogs:', request.error);
                reject(request.error);
            };
        });
    }

    // 获取认证日志数量
    async getAuthLogCount(): Promise<number> {
        if (!this.initialized) {
            await this.initialize();
        }

        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const transaction = this.db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.count();

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                console.error('Failed to get AuthLog count:', request.error);
                reject(request.error);
            };
        });
    }

    // 关闭数据库连接
    close(): void {
        if (this.db) {
            this.db.close();
            this.db = null;
            this.initialized = false;
            console.log('AuthLogManager database closed');
        }
    }
}

// 创建全局实例
export const defaultAuthLogManager = new AuthLogManager();

// 导出便捷函数（参考 app_manager 的接口设计）
export const authLogManager = {
    // 初始化
    initialize: () => defaultAuthLogManager.initialize(),

    // 添加日志
    add: (log: AuthLog) => defaultAuthLogManager.addAuthLog(log),

    // 查询日志
    getById: (id: number) => defaultAuthLogManager.getAuthLogById(id),
    getAll: () => defaultAuthLogManager.getAllAuthLogs(),
    getByAppCode: (appCode: number, page?: number, pageSize?: number) => defaultAuthLogManager.getAuthLogsByAppCode(appCode, page, pageSize),
    getRecent: (page: number = 1, pageSize: number = 20) => defaultAuthLogManager.getRecentAuthLogs(page, pageSize),

    // 删除日志
    delete: (id: number) => defaultAuthLogManager.deleteAuthLog(id),
    deleteByAppCode: (appCode: number) => defaultAuthLogManager.deleteAuthLogsByAppCode(appCode),
    clearAll: () => defaultAuthLogManager.clearAllAuthLogs(),

    // 工具函数
    getCount: () => defaultAuthLogManager.getAuthLogCount(),
    getCountByAppCode: (appCode: number) => defaultAuthLogManager.getAuthLogsCountByAppCode(appCode),

    // 关闭连接
    close: () => defaultAuthLogManager.close(),
};