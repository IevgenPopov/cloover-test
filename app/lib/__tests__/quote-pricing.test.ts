import {
  OFFER_TERMS,
  aprForBand,
  calculateQuote,
  determineRiskBand,
  monthlyPayment,
  roundToCents,
} from "../quote-pricing";

describe("quote-pricing", () => {
  describe("roundToCents", () => {
    it("rounds to two decimal places", () => {
      expect(roundToCents(12.344)).toBe(12.34);
      expect(roundToCents(12.345)).toBe(12.35);
    });
  });

  describe("determineRiskBand", () => {
    it("returns band A for high consumption and small systems", () => {
      expect(determineRiskBand(400, 6)).toBe("A");
      expect(determineRiskBand(800, 5.5)).toBe("A");
    });

    it("returns band B when consumption is high but the A threshold is not met", () => {
      expect(determineRiskBand(400, 6.1)).toBe("B");
      expect(determineRiskBand(250, 12)).toBe("B");
    });

    it("returns band C for lower consumption", () => {
      expect(determineRiskBand(249.9, 4)).toBe("C");
    });
  });

  describe("aprForBand", () => {
    it("maps each band to the expected APR", () => {
      expect(aprForBand("A")).toBe(6.9);
      expect(aprForBand("B")).toBe(8.9);
      expect(aprForBand("C")).toBe(11.9);
    });
  });

  describe("monthlyPayment", () => {
    it("returns zero when the principal is not positive", () => {
      expect(monthlyPayment(0, 8.9, 10)).toBe(0);
      expect(monthlyPayment(-100, 8.9, 10)).toBe(0);
    });

    it("uses the simple division branch for a zero APR", () => {
      expect(monthlyPayment(1200, 0, 1)).toBe(100);
    });

    it("calculates amortized payments for a positive APR", () => {
      expect(monthlyPayment(4500, 6.9, 5)).toBeCloseTo(88.89, 2);
      expect(monthlyPayment(4500, 6.9, 10)).toBeCloseTo(52.02, 2);
      expect(monthlyPayment(4500, 6.9, 15)).toBeCloseTo(40.2, 2);
    });
  });

  describe("calculateQuote", () => {
    it("derives pricing and offers from the input", () => {
      const input = {
        fullName: "Demo User",
        email: "demo@example.com",
        address: "123 Main Street",
        monthlyConsumptionKwh: 450,
        systemSizeKw: 5,
        downPayment: 1500,
      };

      const result = calculateQuote(input);

      expect(result.id).toBe("");
      expect(result.inputs).toEqual(input);
      expect(result.derivedValues).toEqual({
        systemPrice: 6000,
        principalAmount: 4500,
        riskBand: "A",
        baseApr: 6.9,
      });
      expect(result.offers).toHaveLength(OFFER_TERMS.length);
      expect(result.offers.map((offer) => offer.termYears)).toEqual([...OFFER_TERMS]);
      expect(result.offers).toEqual([
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
      ]);
    });
  });
});
