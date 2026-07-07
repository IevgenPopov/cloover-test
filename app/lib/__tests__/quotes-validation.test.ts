import { validateQuoteForm } from "@/app/lib/quotes-validation";

describe("validateQuoteForm", () => {
  const baseForm = {
    fullName: "Demo User",
    email: "demo@example.com",
    address: "123 Main Street",
    monthlyConsumptionKwh: "450",
    systemSizeKw: "5",
    downPayment: "1500",
  };

  it("returns no errors for valid input", () => {
    expect(
      validateQuoteForm(baseForm, {
        monthlyConsumptionKwh: 450,
        systemSizeKw: 5,
        downPayment: 1500,
      }),
    ).toEqual({});
  });

  it("returns required-field errors for empty input", () => {
    expect(
      validateQuoteForm(
        {
          fullName: "",
          email: "",
          address: "",
          monthlyConsumptionKwh: "",
          systemSizeKw: "",
          downPayment: "",
        },
        {
          monthlyConsumptionKwh: Number.NaN,
          systemSizeKw: Number.NaN,
          downPayment: Number.NaN,
        },
      ),
    ).toEqual({
      fullName: "Full name is required.",
      email: "Email is required.",
      address: "Address is required.",
      monthlyConsumptionKwh: "Monthly consumption is required.",
      systemSizeKw: "System size is required.",
    });
  });

  it("returns format and numeric validation errors", () => {
    expect(
      validateQuoteForm(
        {
          ...baseForm,
          email: "invalid-email",
          monthlyConsumptionKwh: "-1",
          systemSizeKw: "0",
          downPayment: "-10",
        },
        {
          monthlyConsumptionKwh: -1,
          systemSizeKw: 0,
          downPayment: -10,
        },
      ),
    ).toEqual({
      email: "Enter a valid email address.",
      monthlyConsumptionKwh: "Enter a positive number.",
      systemSizeKw: "Enter a positive number.",
      downPayment: "Enter a valid non-negative number.",
    });
  });

  it("does not require down payment and ignores empty optional values", () => {
    expect(
      validateQuoteForm(
        {
          ...baseForm,
          downPayment: "",
        },
        {
          monthlyConsumptionKwh: 450,
          systemSizeKw: 5,
          downPayment: 0,
        },
      ),
    ).toEqual({});
  });
});
