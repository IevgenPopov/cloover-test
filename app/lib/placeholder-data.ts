import { User, Quote } from "@/app/lib/definitions";

export const users: User[] = [
    {
        id: 1,
        username: 'user',
        email: 'user@example.com',
        password: 'testpassword'
    },
    {
        id: 2,
        username: 'admin',
        email: 'admin@example.com',
        password: 'testpassword'
    },
    {
        id: 3,
        username: 'test',
        email: 'test@example.com',
        password: 'testpassword'
    }
];

export const quotes: Quote[] = [
    {
        userId: users[0].id,
        date:  '10/10/2023',
        systemSize: 100,
        price: 120000,
        band: "A"
    },
    {
        userId: users[3].id,
        date:  '05/11/2024',
        systemSize: 200,
        price: 240000,
        band: "B"
    }
];