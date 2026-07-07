import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { getServerSession } from "next-auth";
import QuotesPage from "../page";
import QuoteDetailPage from "../[id]/page";
import { getQuotesForUser, getQuoteById } from "@/app/lib/quote-store";

jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
  notFound: jest.fn(),
}));

jest.mock("@/app/lib/auth", () => ({
  authOptions: {},
}));

jest.mock("@/app/lib/quote-store", () => ({
  getQuotesForUser: jest.fn(),
  getQuoteById: jest.fn(),
}));

jest.mock("@/app/components/Header", () => ({
  __esModule: true,
  default: () => React.createElement("header", { "data-testid": "header" }),
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) =>
    React.createElement("a", { href, ...props }, children),
}));

const getServerSessionMock = getServerSession as jest.MockedFunction<typeof getServerSession>;
const getQuotesForUserMock = getQuotesForUser as jest.MockedFunction<typeof getQuotesForUser>;
const getQuoteByIdMock = getQuoteById as jest.MockedFunction<typeof getQuoteById>;

describe("quotes pages", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("filters admin quotes by user and email and preserves the query on detail links", async () => {
    getServerSessionMock.mockResolvedValue({
      user: { id: "admin-1", role: "admin" },
    } as never);
    getQuotesForUserMock.mockResolvedValue([
      {
        id: "quote-1",
        userId: "user-1",
        userName: "Jane Doe",
        userEmail: "jane@example.com",
        date: "2026-07-07T10:00:00.000Z",
        systemSize: 5,
        price: 6000,
        downPayment: 1500,
        band: "A",
        description: "123 Main Street",
      },
      {
        id: "quote-2",
        userId: "user-2",
        userName: "John Smith",
        userEmail: "john@example.com",
        date: "2026-07-07T11:00:00.000Z",
        systemSize: 7,
        price: 8400,
        downPayment: null,
        band: "B",
        description: "456 Oak Avenue",
      },
    ] as never);

    const html = renderToStaticMarkup(
      await QuotesPage({
        searchParams: Promise.resolve({
          user: "Jane",
          email: "jane@example.com",
        }),
      }),
    );

    expect(getQuotesForUserMock).toHaveBeenCalledWith("admin-1", true);
    expect(html).toContain("User");
    expect(html).toContain("Email");
    expect(html).toContain("Clear filters");
    expect(html).toContain("Jane Doe");
    expect(html).not.toContain("John Smith");
    expect(html).toContain('href="/quotes/quote-1?user=Jane&amp;email=jane%40example.com"');
  });

  it("keeps the detail page back link pointed at the filtered list", async () => {
    getServerSessionMock.mockResolvedValue({
      user: { id: "admin-1", role: "admin" },
    } as never);
    getQuoteByIdMock.mockResolvedValue({
      id: "quote-1",
      userId: "user-1",
      user: { name: "Jane Doe", email: "jane@example.com" },
      date: "2026-07-07T10:00:00.000Z",
      systemSize: 5,
      price: 6000,
      downPayment: 1500,
      band: "A",
      description: "123 Main Street",
    } as never);

    const html = renderToStaticMarkup(
      await QuoteDetailPage({
        params: Promise.resolve({ id: "quote-1" }),
        searchParams: Promise.resolve({
          user: "Jane",
          email: "jane@example.com",
        }),
      }),
    );

    expect(getQuoteByIdMock).toHaveBeenCalledWith("quote-1");
    expect(html).toContain('href="/quotes?user=Jane&amp;email=jane%40example.com"');
  });
});
