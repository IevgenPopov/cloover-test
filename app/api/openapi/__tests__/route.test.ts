import { GET } from "../route";

describe("GET /api/openapi", () => {
  it("returns the OpenAPI spec", async () => {
    const response = await GET();

    expect(response.status).toBe(200);
    const body = await response.json();

    expect(body.openapi).toBe("3.1.0");
    expect(body.info.title).toBe("Cloover API");
    expect(body.paths["/api/quotes"]).toBeDefined();
    expect(body.paths["/api/quotes/{id}"]).toBeDefined();
  });
});
