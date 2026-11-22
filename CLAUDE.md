@AGENTS.md

# Reglas permanentes de desarrollo visual

Estas reglas son obligatorias en todo el trabajo de este proyecto y prevalecen sobre cualquier preferencia por defecto.

## 1. SVG: uso restringido

**Prohibido** usar SVG (inline, archivos `.svg`, data URIs o librerías que generen SVG) para:

- ilustraciones, personajes, productos u objetos;
- fondos, texturas, paisajes o patrones decorativos;
- diagramas o gráficos que representen objetos reales;
- iconos decorativos o elementos gráficos principales;
- animaciones visuales que deberían ser objetos reales (3D, foto o vídeo).

**Permitido** únicamente:

- **logotipos** (p. ej. `src/components/ui/Logo.tsx`);
- **iconos funcionales** de interfaz (Lucide React o equivalente: buscar, carrito, cerrar, flechas…), nunca como sustituto de un elemento visual real.

Antes de terminar cualquier tarea: `grep -rn "<svg" src` y verificar que solo aparecen el logotipo o iconos funcionales.

## 2. Recursos visuales reales

- Prioridad: fotografía profesional y vídeo real.
- Fuentes permitidas para material editorial: Unsplash, Pexels, Pixabay, Mixkit, Wikimedia Commons (con licencia verificada).
- **Nunca inventar URLs.** Cada recurso se descarga, se comprueba que existe y se registra en `public/media/CREDITS.md` con autor, fuente, URL y licencia.
- Solo recursos que correspondan a la temática de la sección. Nada de imágenes de relleno.
- Los recursos se sirven desde `public/media/` (no hotlinking), optimizados:
  imágenes en AVIF/WebP con `next/image`; vídeo en MP4 (H.264) + WebM, `autoplay muted loop playsInline`, con póster y overlay.

## 3. Productos: solo fotografía real

- **Nada artificial**: prohibidos los renders, modelos 3D generados, ilustraciones o imágenes creadas por IA de los productos.
- Las raquetas se muestran **solo con fotografías reales** del modelo exacto, guardadas por el propietario en `public/fotos/`
  según `FOTOS.md`. Esa carpeta está excluida de git (copyright de fabricantes y tiendas): nunca se suben ni se publican.
- Sin foto, se muestra un panel tipográfico neutro de «Foto pendiente», nunca una imagen sustituta.
- No inventar especificaciones, precios ni disponibilidad (ver política de datos en `README.md`).

## 4. Fotografía, vídeo y animación real

- Vídeo y fotografía real de tenis (Mixkit con licencia comercial verificada clip a clip; créditos en `/creditos`).
- Animaciones sobre material real: GSAP + ScrollTrigger para secuencias de scroll (p. ej. el vídeo del hero que se convierte en tarjeta);
  Motion (Framer Motion) para interfaz, reveals y transiciones.
- Visualizaciones de datos en HTML/CSS con datos reales del catálogo (sin SVG).
- Hero de inicio: historia en tres planos de vídeo real (Mixkit, licencia libre verificada clip a clip, gradación propia):
  saque cenital → derecha a contraluz → saque en estadio. Transiciones distintas (iris, cortinilla), deriva de cámara continua,
  parallax con el puntero y titulares letra a letra; al final el encuadre se pliega en tarjeta. Solo decodifica el plano visible.
- Capítulo «El templo de la hierba»: escena WebGL (`src/components/hero/court-scene.ts`, Three.js) sobre una foto real del
  Centre Court a 3840 px (CC BY-SA), malla con mapa de profundidad propio; la cámara avanza con el scroll. Sin imágenes generadas.
- Identidad: blanco roto (#f6f5f1), negro carbón (#1c1c1a / #121211), verde oscuro (#1f4a36), gris piedra (#8f8a80) y plata
  (#b9bcbf). Sin grises azulados ni lavanda. Titulares Geist seminegrita con acentos en Instrument Serif cursiva.
- Producto con protagonismo absoluto: raqueta en diagonal ocupando la tarjeta, fondo piedra, inclinación 3D al pasar el ratón,
  detalle de material con otra foto real del mismo modelo. Dobles páginas editoriales en la home.
- Especificaciones con `SpecVisual` (HTML/CSS, escalas = mínimo y máximo reales del catálogo): peso, balance sobre la longitud,
  cabeza, patrón, nivel, rigidez y swingweight.
- Mezcla `multiply` de las fotos de producto: cualquier capa con transform, sticky o filter aísla la mezcla; poner el color de
  fondo dentro de esa capa.
- Cada sección con su propia animación (no un fade-in genérico); navegación que se oculta al bajar y vuelve al subir.

## 4b. SEO

- H1 con palabra clave en cada página indexable («Raquetas de tenis», «Raquetas {Marca}», «Comparador de raquetas»…).
- Páginas de marca estáticas `/marcas/[brand]` (no filtros con query) enlazadas desde home, footer y fichas.
- Datos estructurados con `src/lib/seo.tsx`: Organization y WebSite (SearchAction) en el layout; Product + BreadcrumbList en
  la ficha; ItemList en catálogo y marcas. Solo datos verificados (sin precio si está pendiente).
- Migas de pan visibles con `Breadcrumbs`; imagen OG estática a partir de la foto real del hero (sin `ImageResponse`).
- Carrito, checkout y pedidos con `noindex`; sitemap con marcas y fichas.

## 5. Accesibilidad del movimiento

- Respetar siempre `prefers-reduced-motion`.
- Evitar animaciones exageradas o que dificulten la navegación.

## 6. Dirección artística y calidad

- Identidad propia, paleta y tipografía coherentes, jerarquía clara y espaciado consistente.
- Prohibido: diseños genéricos de IA, tarjetas repetidas sin intención, gradientes aleatorios, emojis como diseño, secciones vacías.

## 7. Rendimiento

- Lazy loading y carga bajo demanda del vídeo; pausar vídeos fuera de pantalla.
- Imágenes servidas en AVIF/WebP con `next/image`.
- La experiencia móvil debe ser fluida.

## 8. Funcionalidad

- Nunca sacrificar funcionalidades, usabilidad, accesibilidad, responsive ni rendimiento por efectos visuales.
- No eliminar dependencias, cambiar versiones ni modificar configuración sin comprobar antes las consecuencias.

## 9. Verificación antes de terminar

1. `npm run lint`, `npm run typecheck`, `npm run test:engine`, `npm run build`.
2. Ejecutar la app y revisar en navegador todas las secciones (escritorio y móvil).
3. Comprobar que no hay errores de consola y que todas las imágenes y vídeos cargan, con y sin fotos en `public/fotos/`.
4. Comprobar la regla de SVG (punto 1).
5. No se considera terminado sin revisión visual del resultado.

## 10. Git

- No hacer commits, pushes ni publicar cambios externos sin autorización explícita del usuario.
