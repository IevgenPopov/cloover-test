import { POST } from "../route";
import { createUser } from "@/app/lib/auth-store";

jest.mock("@/app/lib/auth-store", () => ({
  createUser: jest.fn(),
}));

const createUserMock = createUser as jest.MockedFunction<typeof createUser>;

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates a user and returns it", async () => {
    createUserMock.mockResolvedValue({
      id: "user-1",
      name: "Demo User",
      email: "demo@example.com",
      role: "user",
    });

    const response = await POST(
      new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Demo User",
          email: "demo@example.com",
          password: "secret123",
        }),
      }),
    );

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({
      user: {
        id: "user-1",
        name: "Demo User",
        email: "demo@example.com",
        role: "user",
      },
    });
    expect(createUserMock).toHaveBeenCalledWith({
      name: "Demo User",
      email: "demo@example.com",
      password: "secret123",
    });
  });

  it("returns 400 when user creation fails", async () => {
    createUserMock.mockRejectedValue(new Error("An account with that email already exists."));

    const response = await POST(
      new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Demo User",
          email: "demo@example.com",
          password: "secret123",
        }),
      }),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      message: "An account with that email already exists.",
    });
  });
});
