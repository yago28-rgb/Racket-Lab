# RACKET LAB

Tienda online premium de raquetas de tenis (España y UE) con catálogo verificado, **Racket Finder** con recomendación explicada, comparador técnico, visor 3D y checkout preparado para Stripe.

## Inicio rápido

```bash
npm install
cp .env.example .env.local   # opcional: sin claves, el checkout funciona en modo demostración
npm run dev                  # http://localhost:3000
```

| Script | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo (Turbopack) |
| `npm run build` / `npm start` | Build y servidor de producción |
| `npm run typecheck` | Genera tipos de rutas y ejecuta `tsc` |
| `npm run lint` | ESLint |
| `npm run test:engine` | Pruebas del motor de recomendación |

## Stack

Next.js 16 (App Router, Cache Components) · React 19 · TypeScript · Tailwind CSS 4 · Motion · Three.js + React Three Fiber + Drei · Zustand · Stripe · Lucide.

**Decisiones:**
- **Solo Motion para animación** (no GSAP): cubre scroll-linked (`useScroll`), reveals, layout y transiciones. Mantener dos sistemas duplicaría peso y lógica.
- **Sin Supabase por ahora**: el catálogo es estático y versionado en `src/data/products.ts`. La capa `src/lib/catalog.ts` aísla el acceso, así que migrar a una base de datos no toca la UI.
- **Sin descarga de HDR**: la iluminación 3D se construye con `Lightformer`, sin dependencias de red.

## Arquitectura

```
src/
  app/                    Rutas (home, /raquetas, /raquetas/[slug], /racket-finder, /comparar,
                          /carrito, /checkout, /pedidos, /marcas, /contacto, legales, API, SEO)
  sections/home/          Secciones de la homepage
  components/             UI, layout, producto, catálogo, finder, carrito, checkout, 3D
  data/                   products.ts (catálogo + fuentes), brands.ts
  lib/
    catalog.ts            Consultas y filtros
    recommendation/       Motor del Racket Finder (puro, sin React)
      questions.ts        Cuestionario declarativo
      profile.ts          Specs → índices de juego
      engine.ts           Filtros duros, scoring ponderado, alternativas, explicaciones
      weights.ts          Pesos configurables
      strings.ts          Consejo de cuerda/tensión/empuñadura
    pricing.ts            Cálculo de carrito (cliente y servidor)
    shipping.ts           Tarifas de envío
    racket-geometry.ts    Geometría paramétrica compartida (SVG + 3D)
  store/                  Zustand: carrito, comparador, pedidos
  types/                  Modelo de dominio
scripts/engine.test.ts    Pruebas del motor
```

## Política de datos (importante)

- **Especificaciones**: verificadas el 18-11-2026 cruzando al menos dos fuentes (Tennis Warehouse Europe, Merchant of Tennis, Racquet Guys, Tennisnerd, fabricante). Cada producto lista sus fuentes y las discrepancias en `dataNotes`. Rigidez (RA) y swingweight son mediciones de tienda y varían entre unidades.
- **Datos no verificados** = `null` → se muestran como «Pendiente» y el motor los excluye (bajando la confianza del resultado).
- **Precios**: solo 3 modelos tienen un precio público en EUR localizado (Pure Drive 2025, Radical MP 2025, Gravity MP 2025). El resto figura como «Precio por confirmar» y **no se puede comprar** hasta que se fije en `products.ts`.
- **Generaciones**: algunos modelos (p. ej. VCORE 100 2023, CX 200 2024) tienen ya sucesor; revisar disponibilidad antes de vender.
- **Imágenes**: no hay fotografía oficial licenciada. Se usa una **ilustración generada a escala** a partir de cabeza, perfil y patrón reales de cada modelo, etiquetada como ilustración. Para usar fotos: añadirlas a `public/products/` y rellenar `image`/`gallery`.
- **3D**: el modelo es **paramétrico** (cabeza, perfil y patrón a escala), no un escaneo del fabricante. Si hay un GLB licenciado, `ProductViewer` acepta `glbUrl`.

## Racket Finder

11 preguntas → 10 factores ponderados (peso, nivel, estilo, potencia/control, sensaciones, cabeza, comodidad, balance, patrón, superficie).

1. Filtros duros (p. ej. principiantes: nada ≥ 310 g ni < 98 in²), con relajación automática si quedan menos de 3.
2. Cada factor aplicable puntúa 0–1 contra las specs; los que no aplican a las respuestas no cuentan.
3. Compatibilidad = media ponderada × (0,9 + 0,1 × confianza). Es una puntuación del modelo, no una probabilidad.
4. Alternativa «más económica» solo si ambos precios están confirmados; «más rendimiento» = más estabilidad dentro de un margen de 12 puntos.
5. Las explicaciones se generan a partir de los factores, con los números reales.

## Pagos y pedidos

- **Sin `STRIPE_SECRET_KEY`**: modo demostración explícito. El pedido se guarda en el navegador y la UI indica que no hay cobro.
- **Con `sk_test_…`**: Stripe Checkout real en modo test (tarjeta `4242 4242 4242 4242`). Los precios se recalculan en el servidor.
- **Webhook**: `POST /api/stripe/webhook` verifica la firma (`STRIPE_WEBHOOK_SECRET`) y llama a `persistOrder`, punto de enganche para la base de datos. Prueba local: `stripe listen --forward-to localhost:3000/api/stripe/webhook`.
- **Contacto**: `/api/contact` valida y registra el mensaje en el log; conectar un proveedor de email en `deliver`.

## Pendiente para producción

- Fijar precios y stock reales; fotografía licenciada; revisión legal de privacidad y envíos; base de datos de pedidos; proveedor de email; perfiles de redes sociales.
