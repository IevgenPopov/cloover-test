export const openApiSpec = {
  openapi: "3.1.0",
  info: {
    title: "Cloover API",
    version: "1.0.0",
    description: "Interactive API reference for the Cloover quote workflow.",
  },
  servers: [{ url: "/" }],
  paths: {
    "/api/health": {
      get: {
        summary: "Health check",
        operationId: "getHealth",
        responses: {
          "200": {
            description: "Service is healthy.",
          },
        },
      },
    },
    "/api/quotes": {
      post: {
        summary: "Create a quote",
        operationId: "createQuote",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  fullName: { type: "string" },
                  email: { type: "string", format: "email" },
                  address: { type: "string" },
                  monthlyConsumptionKwh: { type: "number", minimum: 0 },
                  systemSizeKw: { type: "number", minimum: 0 },
                  downPayment: { type: "number", minimum: 0 },
                },
                required: ["fullName", "email", "address", "monthlyConsumptionKwh", "systemSizeKw"],
              },
            },
          },
        },
        responses: {
          "201": { description: "Quote calculated successfully." },
          "400": { description: "Validation failed." },
          "401": { description: "Authentication required." },
        },
      },
    },
    "/api/quotes/{id}": {
      get: {
        summary: "Fetch a saved quote",
        operationId: "getQuoteById",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "200": { description: "Quote details." },
          "401": { description: "Authentication required." },
          "403": { description: "Access denied." },
          "404": { description: "Quote not found." },
        },
      },
    },
  },
} as const;
