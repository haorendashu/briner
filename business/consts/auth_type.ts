export enum AuthType {
    GET_PUBLIC_KEY = 1,
    SIGN_EVENT = 2,
    GET_RELAYS = 3,
    NIP04_ENCRYPT = 4,
    NIP04_DECRYPT = 5,
    NIP44_ENCRYPT = 6,
    NIP44_DECRYPT = 7,
    DECRYPT_ZAP_EVENT = 8,
}

// 使用映射对象替代多个if-else
export const AuthTypeNames: Record<AuthType, string> = {
    [AuthType.GET_PUBLIC_KEY]: "Get Public Key",
    [AuthType.SIGN_EVENT]: "Sign Event",
    [AuthType.GET_RELAYS]: "Get Relays",
    [AuthType.NIP04_ENCRYPT]: "Encrypt (NIP-04)",
    [AuthType.NIP04_DECRYPT]: "Decrypt (NIP-04)",
    [AuthType.NIP44_ENCRYPT]: "Encrypt (NIP-44)",
    [AuthType.NIP44_DECRYPT]: "Decrypt (NIP-44)",
    [AuthType.DECRYPT_ZAP_EVENT]: "Decrypt zap event",
};

// 或者保持原方法但使用switch语句
export function getAuthName(authType: AuthType): string {
    return AuthTypeNames[authType] || "Unknown";
}