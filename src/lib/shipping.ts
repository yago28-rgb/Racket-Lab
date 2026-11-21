/**
 * Shipping configuration (EUR). Edit to match your logistics contracts.
 * Values are store policy, not product data.
 */
export const shippingConfig = {
  zones: {
    ES: { label: "España peninsular", cost: 4.95, freeFrom: 150, eta: "24–48 h" },
    EU: { label: "Unión Europea", cost: 12.95, freeFrom: 250, eta: "3–5 días laborables" },
  },
  stringingService: { label: "Encordado profesional", price: 15 },
} as const;

export type ShippingZone = keyof typeof shippingConfig.zones;

export function shippingCost(subtotal: number, zone: ShippingZone): number {
  if (subtotal <= 0) return 0;
  const z = shippingConfig.zones[zone];
  return subtotal >= z.freeFrom ? 0 : z.cost;
}
