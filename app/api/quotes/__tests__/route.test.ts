import crypto from "node:crypto";
import { getServerSession } from "next-auth";
import { POST } from "../route";
import { createQuote } from "@/app/lib/quote-store";

jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));

jest.mock("@/app/lib/auth", () => ({
  authOptions: {},
}));

jest.mock("@/app/lib/quote-store", () => ({
  createQuote: jest.fn(),
}));

const getServerSessionMock = getServerSession as jest.MockedFunction<typeof getServerSession>;
const createQuoteMock = createQuote as jest.MockedFunction<typeof createQuote>;

describe("POST /api/quotes", () => {
  const randomUUIDSpy = jest.spyOn(crypto, "randomUUID");

  beforeEach(() => {
    jest.clearAllMocks();
    // @ts-ignore
    randomUUIDSpy.mockReturnValue("quote-id");
  });

  afterAll(() => {
    randomUUIDSpy.mockRestore();
  });

  it("returns 401 when the user is not authenticated", async () => {
    getServerSessionMock.mockResolvedValue(null);

    const response = await POST(
      new Request("http://localhost/api/quotes", {
        method: "POST",
        body: JSON.stringify({}),
      }),
    );

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ message: "Unauthorized" });
    expect(createQuoteMock).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid input", async () => {
    getServerSessionMock.mockResolvedValue({
      user: { id: "user-1", role: "user" },
    } as never);

    const response = await POST(
      new Request("http://localhost/api/quotes", {
        method: "POST",
        body: JSON.stringify({
          fullName: "",
          email: "invalid-email",
          address: "",
          monthlyConsumptionKwh: 0,
          systemSizeKw: 0,
          downPayment: -1,
        }),
      }),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ message: "Full name is required." });
    expect(createQuoteMock).not.toHaveBeenCalled();
  });

  it("creates a quote and returns the calculated response", async () => {
    getServerSessionMock.mockResolvedValue({
      user: { id: "user-1", role: "user" },
    } as never);
    createQuoteMock.mockResolvedValue({} as never);

    const body = {
      fullName: "Demo User",
      email: "demo@example.com",
      address: "123 Main Street",
      monthlyConsumptionKwh: 450,
      systemSizeKw: 5,
      downPayment: 1500,
    };

    const response = await POST(
      new Request("http://localhost/api/quotes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }),
    );

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({
      id: "quote-id",
      inputs: body,
      derivedValues: {
        systemPrice: 6000,
        principalAmount: 4500,
        riskBand: "A",
        baseApr: 6.9,
      },
      offers: [
        {
          termYears: 5,
          apr: 6.9,
          principalUsed: 4500,
          monthlyPayment: 88.89,
        },
        {
          termYears: 10,
          apr: 6.9,
          principalUsed: 4500,
          monthlyPayment: 52.02,
        },
        {
          termYears: 15,
          apr: 6.9,
          principalUsed: 4500,
          monthlyPayment: 40.2,
        },
      ],
    });

    expect(createQuoteMock).toHaveBeenCalledTimes(1);
    expect(createQuoteMock).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "quote-id",
        userId: "user-1",
        date: expect.any(Date),
        systemSize: 5,
        price: 6000,
        downPayment: 1500,
        band: "A",
        description: "123 Main Street",
      }),
    );
  });
});
