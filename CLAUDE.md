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

- Prioridad: fotografía profesional, vídeo, texturas fotográficas y modelos 3D (GLB/GLTF).
- Fuentes permitidas: Unsplash, Pexels, Pixabay, Mixkit, Wikimedia Commons, Poly Haven, ambientCG y repositorios 3D con licencia compatible.
- **Nunca inventar URLs.** Cada recurso se descarga, se comprueba que existe y se registra en `public/media/CREDITS.md` con autor, fuente, URL y licencia.
- Solo recursos que correspondan a la temática de la sección. Nada de imágenes de relleno.
- Los recursos se sirven desde `public/media/` (no hotlinking), optimizados:
  imágenes en AVIF/WebP con `next/image`; vídeo en MP4 (H.264) + WebM, `autoplay muted loop playsInline`, con póster y overlay.

## 3. Productos y honestidad

- Sin fotografía oficial licenciada de un producto, se usa un **render 3D representativo** generado a partir de sus especificaciones reales.
- Ese render **nunca se presenta como reproducción exacta** del producto: se etiqueta como «Render 3D representativo».
- No inventar especificaciones, precios ni disponibilidad (ver política de datos en `README.md`).

## 4. 3D de calidad profesional

- Three.js + React Three Fiber + Drei; modelos generados con Blender (`scripts/blender/`) y exportados a GLB.
- Materiales **PBR** (color, rugosidad, metalicidad, clearcoat, mapas normales), iluminación HDRI realista, sombras y reflejos.
- Geometría detallada (biseles, ojales, protector, encordado entrelazado, grip en espiral). Nada de primitivas que parezcan prototipos.
- Interacción con el ratón, movimientos de cámara y animaciones vinculadas al scroll (GSAP ScrollTrigger) cuando aporten valor.

## 5. Animación

- GSAP + ScrollTrigger para secuencias de scroll y cámara 3D; Motion (Framer Motion) para interfaz, reveals y transiciones.
- Respetar siempre `prefers-reduced-motion`.
- Evitar animaciones exageradas o que dificulten la navegación.

## 6. Dirección artística y calidad

- Identidad propia, paleta y tipografía coherentes, jerarquía clara y espaciado consistente.
- Prohibido: diseños genéricos de IA, tarjetas repetidas sin intención, gradientes aleatorios, emojis como diseño, secciones vacías.

## 7. Rendimiento

- Lazy loading y carga bajo demanda de 3D y vídeo; pausar WebGL fuera de pantalla.
- Modelos optimizados (geometría razonable, texturas comprimidas); imágenes AVIF/WebP.
- La experiencia móvil debe ser fluida: DPR limitado y escenas simplificadas en móvil.

## 8. Funcionalidad

- Nunca sacrificar funcionalidades, usabilidad, accesibilidad, responsive ni rendimiento por efectos visuales.
- No eliminar dependencias, cambiar versiones ni modificar configuración sin comprobar antes las consecuencias.

## 9. Verificación antes de terminar

1. `npm run lint`, `npm run typecheck`, `npm run test:engine`, `npm run build`.
2. Ejecutar la app y revisar en navegador todas las secciones (escritorio y móvil).
3. Comprobar que no hay errores de consola y que todas las imágenes, vídeos y modelos cargan.
4. Comprobar la regla de SVG (punto 1).
5. No se considera terminado sin revisión visual del resultado.

## 10. Git

- No hacer commits, pushes ni publicar cambios externos sin autorización explícita del usuario.
