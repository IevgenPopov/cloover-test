export type Band = "A" | "B" | "C";
export type UserRole = "user" | "admin";

export type Quote = {
    id: string;
    userId: string;
    date: string;
    systemSize: number;
    price: number;
    downPayment?: number | null;
    band: Band;
    description: string;
}

export type QuoteInput = {
    fullName: string;
    email: string;
    address: string;
    monthlyConsumptionKwh: number;
    systemSizeKw: number;
    downPayment: number;
};

export type QuoteDerivedValues = {
    systemPrice: number;
    principalAmount: number;
    riskBand: Band;
    baseApr: number;
};

export type QuoteOffer = {
    termYears: number;
    apr: number;
    principalUsed: number;
    monthlyPayment: number;
};

export type StoredUser = {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    salt: string;
    passwordHash: string;
};

export type PublicUser = {
    id: string;
    name: string;
    email: string;
    role: UserRole;
};

export type AuthStoreGlobal = typeof globalThis & {
    __clooverDemoSeeded?: Promise<void>;
};
export type QuoteResult = {
    id: string;
    inputs: QuoteInput;
    derivedValues: QuoteDerivedValues;
    offers: QuoteOffer[];
};

export type SessionUser = {
    name?: string | null;
    email?: string | null;
};

export type QuoteFormState = {
    fullName: string;
    email: string;
    address: string;
    monthlyConsumptionKwh: string;
    systemSizeKw: string;
    downPayment: string;
};
