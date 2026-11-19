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
| `npm run doctor:swc` | Diagnóstico del binario nativo de Next.js en Windows (solo lectura) |
| `npm run media:catalog` | Exporta las medidas del catálogo para Blender |
| `npm run media:optimize` | Comprime los GLB (Meshopt) |

## Stack

Next.js 16 (App Router, Cache Components) · React 19 · TypeScript · Tailwind CSS 4 · GSAP + ScrollTrigger · Motion · Three.js + React Three Fiber + Drei · Blender (generación de modelos) · Zustand · Stripe · Lucide.

**Decisiones:**
- **GSAP + ScrollTrigger** para las secuencias ligadas al scroll con cámara 3D (hero y tecnología); **Motion** para interfaz, reveals y transiciones. Cada uno tiene un papel distinto, sin duplicar.
- **Reglas visuales permanentes** en `CLAUDE.md`: sin SVG para ilustraciones, productos ni fondos (solo logotipo e iconos funcionales).
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
- **Imágenes de producto**: no hay fotografía oficial licenciada. Cada raqueta tiene **renders 3D representativos** (Blender/Cycles) generados a partir de su cabeza, perfil, longitud y patrón reales, etiquetados como tales. Si se consigue fotografía oficial, se añade a `public/` y se indica en `image` (tiene prioridad sobre el render).
- **3D**: modelos GLB representativos (no escaneos del fabricante, sin logotipos, colores aproximados).
- **Fotografía y vídeo editorial**: clips de Mixkit con licencia gratuita comercial (verificada clip a clip) y fotogramas de esos clips. Créditos en `/creditos` y `public/media/CREDITS.md`.

## Pipeline de medios 3D

```
npm run media:catalog                         # medidas reales → scripts/blender/catalog.json
python scripts/blender/build_rackets.py \
  --catalog scripts/blender/catalog.json \
  --assets <dir con studio_small_09_2k.hdr y texturas leather_white_*> \
  --out <dir de trabajo> --models public/models   # GLB + renders PNG (Cycles)
npm run media:optimize                        # Meshopt sobre public/models
node scripts/convert-renders.mjs <dir de trabajo>/renders   # → public/products/*.webp
```

- Requiere Blender 5.x como módulo de Python (`pip install bpy==5.3.0`, Python 3.13) o ejecutar el script con `blender -b -P`.
- Modelado: marco continuo con perfil de sección redondeada, puente, protector, ojales, encordado entrelazado (cada vertical alterna por encima y por debajo), grip octogonal con overgrip en espiral, tapón y collarín.
- Materiales PBR: pintura con clearcoat, grip de piel (Poly Haven, CC0) con normal y rugosidad, cuerdas de polímero, plásticos. El modelo «Studio» lleva un tejido de carbono generado proceduralmente.
- Iluminación: HDRI de estudio (Poly Haven, CC0) servido en local, luz principal con sombras y sombras de contacto.

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
