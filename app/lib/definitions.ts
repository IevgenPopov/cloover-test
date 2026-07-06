export type  Quote = {
    userId: number;
    date: string;
    systemSize: number;
    price: number;
    band: 'A' | 'B' | 'C';
}

export type User = {
    id: number;
    username: string;
    email: string;
    password: string;
}