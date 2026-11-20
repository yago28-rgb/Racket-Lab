# Fotos de las raquetas (solo en tu ordenador)

Las fotos de producto tienen copyright de las tiendas y los fabricantes. Por eso **no se guardan en el repositorio**:
la carpeta `public/fotos/` está excluida de git y las fotos nunca salen de tu ordenador.

## Opción rápida: descarga automática (recomendada)

En la terminal, dentro del proyecto:

```powershell
npm run fotos:descargar
```

Descarga **47 fotos oficiales de 16 raquetas** (Merchant of Tennis) a `public/fotos/` y las activa. Después reinicia la web (`Ctrl + C` y `npm run dev`).
Las URLs están comprobadas en `scripts/photo-sources.json`. Si una foto ya existe, no se vuelve a descargar.

**Sin fuente automática** (no están en esa tienda o solo tienen una imagen genérica): Pure Strike 98 16×19 2024, Pro Staff 97 v14,
Prestige MP 2023, TF-X1 300 V2 y Phantom 100X 305. Para esas, usa la opción manual.

## Opción manual

1. Abre el enlace de la raqueta en la tabla (o la web oficial de la marca).
2. Abre la foto en grande, **clic derecho → «Guardar imagen como…»**.
3. Guárdala en `public/fotos/` con el nombre exacto de la tabla:
   - `-1` → **la raqueta completa de frente** (foto principal).
   - `-2` → otro ángulo (lateral o tres cuartos). Opcional.
   - `-3` → un detalle (garganta, encordado o grip). Opcional.
4. Vale `.jpg`, `.jpeg`, `.png`, `.webp` o `.avif`.
5. Reinicia la web (`Ctrl + C` y `npm run dev`). Para comprobar cuántas detecta: `npm run fotos`.

Las raquetas sin foto muestran un recuadro de «Foto pendiente»; la tienda funciona igual.

## Lista

| # | Raqueta | Dónde encontrar las fotos | Nombres de archivo |
| --- | --- | --- | --- |
| 1 | **Babolat Pure Aero 2023** | [Merchant of Tennis](https://merchantoftennis.com/products/babolat-pure-aero-2023) | `babolat-pure-aero-2023-1.jpg` · `babolat-pure-aero-2023-2.jpg` · `babolat-pure-aero-2023-3.jpg` |
| 2 | **Babolat Pure Drive 2025** | [Tennis Warehouse Europe](https://www.tenniswarehouse-europe.com/descpage-BPD25R.html) | `babolat-pure-drive-2025-1.jpg` · `babolat-pure-drive-2025-2.jpg` · `babolat-pure-drive-2025-3.jpg` |
| 3 | **Babolat Pure Strike 98 2024** | [Tennis Warehouse Europe](https://www.tenniswarehouse-europe.com/descpageRCQBA-PSRKT-EN.html) | `babolat-pure-strike-98-16x19-2024-1.jpg` · `babolat-pure-strike-98-16x19-2024-2.jpg` · `babolat-pure-strike-98-16x19-2024-3.jpg` |
| 4 | **Wilson Blade 98 v9** | [Tennis Warehouse Europe](https://www.tenniswarehouse-europe.com/Wilson_Blade_98_16x19_v9_Racket/descpageRCWILSON-WB9816-EN.html) | `wilson-blade-98-16x19-v9-1.jpg` · `wilson-blade-98-16x19-v9-2.jpg` · `wilson-blade-98-16x19-v9-3.jpg` |
| 5 | **Wilson Pro Staff 97 v14** | [Tennis Warehouse Europe](https://www.tenniswarehouse-europe.com/Wilson_Pro_Staff_97_V140_Racket/descpageRCWILSON-W97V14-EN.html) | `wilson-pro-staff-97-v14-1.jpg` · `wilson-pro-staff-97-v14-2.jpg` · `wilson-pro-staff-97-v14-3.jpg` |
| 6 | **Wilson Clash 100 v3** | [Merchant of Tennis](https://www.merchantoftennis.com/products/wilson-clash-100-v3) | `wilson-clash-100-v3-1.jpg` · `wilson-clash-100-v3-2.jpg` · `wilson-clash-100-v3-3.jpg` |
| 7 | **Wilson Ultra 100 v5** | [Merchant of Tennis](https://www.merchantoftennis.com/products/wilson-ultra-100-v5) | `wilson-ultra-100-v5-1.jpg` · `wilson-ultra-100-v5-2.jpg` · `wilson-ultra-100-v5-3.jpg` |
| 8 | **HEAD Speed MP 2024** | [Tennis Warehouse Europe](https://www.tenniswarehouse-europe.com/Head_Speed_MP_2024_Racket/descpageRCHEAD-HSPDM-EN.html) | `head-speed-mp-2024-1.jpg` · `head-speed-mp-2024-2.jpg` · `head-speed-mp-2024-3.jpg` |
| 9 | **HEAD Radical MP 2025** | [Tennis Warehouse Europe](https://www.tenniswarehouse-europe.com/Head_Radical_MP_2025_Racket/descpageRCHEAD-HRMP-EN.html) | `head-radical-mp-2025-1.jpg` · `head-radical-mp-2025-2.jpg` · `head-radical-mp-2025-3.jpg` |
| 10 | **HEAD Gravity MP 2025** | [Tennis Warehouse Europe](https://www.tenniswarehouse-europe.com/descpageRCHEAD-HRMPG-EN.html) | `head-gravity-mp-2025-1.jpg` · `head-gravity-mp-2025-2.jpg` · `head-gravity-mp-2025-3.jpg` |
| 11 | **HEAD Boom MP 2024** | [Tennis Warehouse Europe](https://www.tenniswarehouse-europe.com/Head_Boom_MP_2024_Racket/descpageRCHEAD-HBOOMM-EN.html) | `head-boom-mp-2024-1.jpg` · `head-boom-mp-2024-2.jpg` · `head-boom-mp-2024-3.jpg` |
| 12 | **HEAD Prestige MP 2023** | [Tennis Warehouse Europe](https://www.tenniswarehouse-europe.com/Head_Prestige_MP_2023_Racket/descpageRCHEAD-HPRMP-EN.html) | `head-prestige-mp-2023-1.jpg` · `head-prestige-mp-2023-2.jpg` · `head-prestige-mp-2023-3.jpg` |
| 13 | **Yonex EZONE 100 8.ª gen. (2025)** | [Merchant of Tennis](https://merchantoftennis.com/products/yonex-ezone-100-8th-gen-blast-blue) | `yonex-ezone-100-2025-1.jpg` · `yonex-ezone-100-2025-2.jpg` · `yonex-ezone-100-2025-3.jpg` |
| 14 | **Yonex VCORE 100 7.ª gen. (2023)** | [Playyourcourt](https://shop.playyourcourt.com/collections/racquets/products/yonex-vcore-100-2023) | `yonex-vcore-100-2023-1.jpg` · `yonex-vcore-100-2023-2.jpg` · `yonex-vcore-100-2023-3.jpg` |
| 15 | **Yonex PERCEPT 97 2023** | [Tennis Warehouse Europe](https://www.tenniswarehouse-europe.com/Yonex_Percept_97_Racket/descpageRCYONEX-PERC9-EN.html) | `yonex-percept-97-1.jpg` · `yonex-percept-97-2.jpg` · `yonex-percept-97-3.jpg` |
| 16 | **Tecnifibre TF40 305 V3** | [Merchant of Tennis](https://www.merchantoftennis.com/products/tecnifibre-tf40-305-16x19-v3) | `tecnifibre-tf40-305-16x19-v3-1.jpg` · `tecnifibre-tf40-305-16x19-v3-2.jpg` · `tecnifibre-tf40-305-16x19-v3-3.jpg` |
| 17 | **Tecnifibre T-Fight 300 2025** | [Tecnifibre](https://www.tecnifibre.com/en/collections/bestsellers-tennis/products/t-fight-300) | `tecnifibre-t-fight-300-2025-1.jpg` · `tecnifibre-t-fight-300-2025-2.jpg` · `tecnifibre-t-fight-300-2025-3.jpg` |
| 18 | **Tecnifibre TF-X1 300 V2** | [Tennis Warehouse Europe](https://www.tenniswarehouse-europe.com/Tecnifibre_TF-X1_300_V2_Racket/descpage-TFX132.html) | `tecnifibre-tf-x1-300-v2-1.jpg` · `tecnifibre-tf-x1-300-v2-2.jpg` · `tecnifibre-tf-x1-300-v2-3.jpg` |
| 19 | **Dunlop SX 300 2025** | [Tennis Warehouse Europe](https://www.tenniswarehouse-europe.com/descpage-DSX3R.html) | `dunlop-sx-300-2025-1.jpg` · `dunlop-sx-300-2025-2.jpg` · `dunlop-sx-300-2025-3.jpg` |
| 20 | **Dunlop CX 200 2024** | [Tennis Warehouse Europe](https://www.tenniswarehouse-europe.com/Dunlop_CX_200_305g_Rackets/descpageRCDUNHGER-DCX2S-EN.html) | `dunlop-cx-200-2024-1.jpg` · `dunlop-cx-200-2024-2.jpg` · `dunlop-cx-200-2024-3.jpg` |
| 21 | **Prince Phantom 100X 2024** | [Tennis Warehouse Europe](https://www.tenniswarehouse-europe.com/Prince_Phantom_100X_305g_2024_Racket/descpageRCPRINCEH-PHNX5-EN.html) | `prince-phantom-100x-305-2024-1.jpg` · `prince-phantom-100x-305-2024-2.jpg` · `prince-phantom-100x-305-2024-3.jpg` |
