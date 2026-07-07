export type  Quote = {
    userId: number;
    date: string;
    systemSize: number;
    price: number;
    band: 'A' | 'B' | 'C';
}

export type StoredUser = {
    id: string;
    name: string;
    email: string;
    salt: string;
    passwordHash: string;
};

export type PublicUser = {
    id: string;
    name: string;
    email: string;
};

export type AuthStoreGlobal = typeof globalThis & {
    __clooverDemoSeeded?: Promise<void>;
};