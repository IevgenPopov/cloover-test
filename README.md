This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).
Coding challenge

## Implemented Features

### techstack
nextjs 13, typescript, tailwindcss, prisma, sqlite, jest, playwright

### Features
- User registration and login with JWT authentication
- Admin and user roles with access control
- Quotes list page with filtering for admin users
- Quote detail page with access control for admin and user roles
- swagger docs page auto-rendered from OpenAPI spec
- unit tests
- e2e tests for sign-in, quote creation, and result panel rendering

## Getting Started

Install dependencies and create the Prisma SQLite database:

```bash
npx prisma migrate dev
```

The seed script creates demo user and admin credentials.
Run it using the command below. Check the `prisma/seed.js` file for the credentials.
```bash
npm run prisma:seed
```  
The seed script creates the demo user and demo admin account.

Then run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

API docs are available at [http://localhost:3000/docs](http://localhost:3000/docs).
The docs page is auto-rendered from the OpenAPI spec served at `/api/openapi`.

## Testing

Run the Jest suite with:

```bash
npm test
```

Run the Playwright end-to-end suite with:

```bash
npm run test:e2e
```

The E2E flow covers sign-in, quote creation, and the rendered result panel. `test:e2e` starts the
local dev server automatically and uses the seeded demo credentials.

Current unit tests coverage includes:

- `app/lib/quote-pricing.ts` helper functions and quote calculation logic
- `app/lib/quotes-validation.ts` client form validation rules
- `POST /api/quotes` request validation, unauthorized access, and success behavior
- `POST /api/auth/register` success and error handling
- `GET /api/openapi` OpenAPI spec output for the docs page
- `app/quotes/page.tsx` admin filtering, detail links, and empty state behavior
- `app/quotes/[id]/page.tsx` detail page access control and back-link behavior

