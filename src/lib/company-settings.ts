import prisma from "@/lib/prisma";

export const COMPANY_SETTINGS_KEY = "default" as const;

export async function getCompanySettings() {
  const row = await prisma.companySettings.findUnique({
    where: { key: COMPANY_SETTINGS_KEY },
  });
  if (row) return row;
  return prisma.companySettings.create({
    data: {
      key: COMPANY_SETTINGS_KEY,
      companyName: "Wearo India",
      metaTitle: "Wearo India — Fashion online",
      metaDescription:
        "Discover curated clothing and accessories across India. Quality fashion and a smooth shopping experience.",
      currencyCode: "INR",
      currencySymbol: "₹",
      currencyLocale: "en-IN",
      currencyDecimalPlaces: 2,
      payCod: true,
      payUpi: false,
      payCard: false,
      payWallet: false,
      payNetBanking: false,
      payTypeCodSelected: true,
      payTypeOnlineSelected: true,
      payOnlineEnabled: false,
      codFeeFlat: 0,
      codFeePercent: 0,
      onlineProviders: [],
    },
  });
}
