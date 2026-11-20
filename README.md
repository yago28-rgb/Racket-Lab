# RACKET LAB

Tienda online premium de raquetas de tenis (España y UE) con catálogo verificado, **Racket Finder** con recomendación explicada, comparador técnico, fotografía y vídeo reales, y checkout preparado para Stripe.

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
| `npm run doctor:swc` | Diagnóstico del binario nativo de Next.js en Windows (solo lectura) |
| `npm run fotos` | Detecta las fotos guardadas en `public/fotos/` |

## Stack

Next.js 16 (App Router, Cache Components) · React 19 · TypeScript · Tailwind CSS 4 · GSAP + ScrollTrigger · Motion · Zustand · Stripe · Lucide.

**Decisiones:**
- **GSAP + ScrollTrigger** para las secuencias ligadas al scroll (vídeo del hero que se convierte en tarjeta, capítulos de tecnología); **Motion** para interfaz, reveals y transiciones.
- **Reglas visuales permanentes** en `CLAUDE.md`: solo fotografía y vídeo reales; nada de renders, 3D generado ni ilustraciones; SVG solo para logotipo e iconos funcionales.
- **Sin Supabase por ahora**: el catálogo es estático y versionado en `src/data/products.ts`. La capa `src/lib/catalog.ts` aísla el acceso, así que migrar a una base de datos no toca la UI.

## Arquitectura

```
src/
  app/                    Rutas (home, /raquetas, /raquetas/[slug], /racket-finder, /comparar,
                          /carrito, /checkout, /pedidos, /marcas, /contacto, legales, API, SEO)
  sections/home/          Secciones de la homepage
  components/             UI, layout, producto, catálogo, finder, carrito, checkout
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
    media.ts              Fotos locales (manifiesto) y vídeos
  store/                  Zustand: carrito, comparador, pedidos
  types/                  Modelo de dominio
scripts/engine.test.ts    Pruebas del motor
```

## Política de datos (importante)

- **Especificaciones**: verificadas el 18-11-2026 cruzando al menos dos fuentes (Tennis Warehouse Europe, Merchant of Tennis, Racquet Guys, Tennisnerd, fabricante). Cada producto lista sus fuentes y las discrepancias en `dataNotes`. Rigidez (RA) y swingweight son mediciones de tienda y varían entre unidades.
- **Datos no verificados** = `null` → se muestran como «Pendiente» y el motor los excluye (bajando la confianza del resultado).
- **Precios**: solo 3 modelos tienen un precio público en EUR localizado (Pure Drive 2025, Radical MP 2025, Gravity MP 2025). El resto figura como «Precio por confirmar» y **no se puede comprar** hasta que se fije en `products.ts`.
- **Generaciones**: algunos modelos (p. ej. VCORE 100 2023, CX 200 2024) tienen ya sucesor; revisar disponibilidad antes de vender.
- **Imágenes de producto**: fotografías reales guardadas en local por el propietario (ver «Fotos de las raquetas»). Nunca se generan imágenes sustitutas.
- **Fotografía y vídeo editorial**: clips de Mixkit con licencia gratuita comercial (verificada clip a clip) y fotogramas de esos clips. Créditos en `/creditos` y `public/media/CREDITS.md`.

## Fotos de las raquetas (solo en local)

Las fotos de producto tienen copyright de fabricantes y tiendas, así que **no están en el repositorio**.
Sigue [`FOTOS.md`](FOTOS.md): guarda 1–3 fotos por raqueta en `public/fotos/` con el nombre indicado (`<slug>-1.jpg`, `-2`, `-3`).

- `public/fotos/*` y el manifiesto `src/data/photos.generated.json` están en `.gitignore`.
- `scripts/scan-photos.mjs` detecta las fotos automáticamente antes de `npm run dev` y `npm run build` (o con `npm run fotos`).
- Sin foto, cada raqueta muestra un panel neutro de «Foto pendiente»; la tienda funciona igual.

## Solución de problemas (Windows)

**`next-swc.win32-x64-msvc.node no es una aplicación Win32 válida`** al ejecutar `npm run dev`:

1. Ejecuta `npm run doctor:swc` (solo lee archivos). Compara tamaño y huella SHA-256 con el paquete oficial y comprueba la arquitectura de Node.
2. Si el archivo está incompleto o alterado, reinstala solo ese paquete. No hace falta borrar todo:
   ```powershell
   Remove-Item -Recurse -Force node_modules\@next\swc-win32-x64-msvc
   npm install
   ```
3. Si vuelve a corromperse, revisa la cuarentena del antivirus (Seguridad de Windows → Historial de protección) o añade una exclusión para la carpeta del proyecto.
4. Si `doctor:swc` indica que Node no es x64 (p. ej. Windows ARM), instala Node.js para tu arquitectura.

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
