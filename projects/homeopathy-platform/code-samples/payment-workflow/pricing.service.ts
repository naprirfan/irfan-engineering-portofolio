const buildEngine = (
  shippingRules: ShippingRulesDTO[],
  payload: LocalCartState
): PriceEngine => {
  const { threshold } = shippingRules.find(
    (s) => s.ruleType === "MIN_ORDER_AMOUNT" && s.isActive
  )?.config as any;
  const shippingRates = shippingRules.find(
    (s) => s.ruleType === "MULTI_ORIGIN_ZIPCODE_SHIPPING_COST" && s.isActive
  )?.config as unknown as ZipcodeShippingConfig;

  if (!threshold || !shippingRates) {
    throw new Error("Invalid shipping rule config");
  }

  return new PriceEngine(
    [
      new HydrateAndValidateItemsRule(payload.orderToken),
      new MinOrderRule(threshold),
      new VoucherValidationRule(payload.voucher?.code || ""),
    ],
    new ShippingCalculator(shippingRates),
    new TaxCalculator(),
    new ResponseBuilder()
  );
};