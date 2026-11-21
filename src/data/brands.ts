import type { Brand, BrandId } from "@/types/product";

export const brands: Record<BrandId, Brand> = {
  wilson: { id: "wilson", name: "Wilson", country: "EE. UU.", website: "https://www.wilson.com" },
  babolat: { id: "babolat", name: "Babolat", country: "Francia", website: "https://www.babolat.com" },
  head: { id: "head", name: "HEAD", country: "Austria", website: "https://www.head.com" },
  yonex: { id: "yonex", name: "Yonex", country: "Japón", website: "https://www.yonex.com" },
  tecnifibre: { id: "tecnifibre", name: "Tecnifibre", country: "Francia", website: "https://www.tecnifibre.com" },
  dunlop: { id: "dunlop", name: "Dunlop", country: "Reino Unido", website: "https://www.dunlopsports.com" },
  prince: { id: "prince", name: "Prince", country: "EE. UU.", website: "https://www.princetennis.com" },
};

export const brandList = Object.values(brands);
