/** Third-party media used on the site. Mirrors public/media/CREDITS.md. */
export interface Credit {
  asset: string;
  usedIn: string;
  author: string;
  source: string;
  url: string;
  license: string;
  licenseUrl: string;
  notes?: string;
}

const mixkitLicense = { license: "Mixkit Stock Video Free License", licenseUrl: "https://mixkit.co/license/#videoFree" };

export const credits: Credit[] = [
  { asset: "Vídeo «Tennis player serving»", usedIn: "Inicio · Filosofía; foto de cabecera del Racket Finder (fotograma)", author: "Mixkit", source: "Mixkit", url: "https://mixkit.co/free-stock-video/tennis-player-serving-873/", ...mixkitLicense, notes: "Recortado a 8 s, 1280 px, sin audio." },
  { asset: "Vídeo «Tennis serve aerial view»", usedIn: "Inicio · hero (escena 1, versión 1080p con gradación propia) y Racket Finder; cabecera del catálogo (fotograma)", author: "Mixkit", source: "Mixkit", url: "https://mixkit.co/free-stock-video/tennis-serve-aerial-view-879/", ...mixkitLicense, notes: "Recortado a 8 s, 1280 px, sin audio." },
  { asset: "Vídeo «Two people playing tennis, aerial view»", usedIn: "Inicio · CTA final; página 404 (fotograma)", author: "Mixkit", source: "Mixkit", url: "https://mixkit.co/free-stock-video/two-people-playing-tennis-aerial-view-880/", ...mixkitLicense, notes: "Recortado a 8 s, 1280 px, sin audio." },
  { asset: "Vídeo «Tennis player during a match»", usedIn: "Contacto (fotograma)", author: "Mixkit", source: "Mixkit", url: "https://mixkit.co/free-stock-video/tennis-player-during-a-match-876/", ...mixkitLicense },
  { asset: "Vídeo «Man playing tennis»", usedIn: "Inicio · hero (escena 2, 1080p con gradación propia)", author: "Mixkit", source: "Mixkit", url: "https://mixkit.co/free-stock-video/man-playing-tennis-877/", ...mixkitLicense, notes: "Recortado a 8 s, sin audio." },
  { asset: "Vídeo «Tennis players at an outdoor court»", usedIn: "Inicio · hero (escena 3, 1080p con gradación propia); cabecera del Racket Finder (fotograma)", author: "Mixkit", source: "Mixkit", url: "https://mixkit.co/free-stock-video/tennis-players-at-an-outdoor-court-869/", ...mixkitLicense, notes: "Recortado a 8 s, sin audio." },
  {
    asset: "Fotografía «Elena Rybakina X Elise Mertens at the 2026 Wimbledon Championships (1)»",
    usedIn: "Inicio · capítulo «El templo de la hierba» (escena 3D)",
    author: "danielcooper850",
    source: "Wikimedia Commons",
    url: "https://commons.wikimedia.org/wiki/File:Elena_Rybakina_X_Elise_Mertens_at_the_2026_Wimbledon_Championships_(1).jpg",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    notes: "Redimensionada a 3840 y 1920 px y proyectada sobre una malla 3D con un mapa de profundidad propio; la obra derivada se comparte bajo la misma licencia.",
  },
  {
    asset: "Fotografía «Elena Rybakina X Elise Mertens at the 2026 Wimbledon Championships (2)»",
    usedIn: "Inicio · sección «Sobre hierba»",
    author: "Daniel Cooper",
    source: "Wikimedia Commons",
    url: "https://commons.wikimedia.org/wiki/File:Elena_Rybakina_X_Elise_Mertens_at_the_2026_Wimbledon_Championships_(2).jpg",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    notes: "Redimensionada a 1920 px.",
  },
  {
    asset: "Fotografía «Wimbledon Centre Court 2017 cropped»",
    usedIn: "Inicio · sección «Sobre hierba» (fachada de hiedra)",
    author: "Gabinho",
    source: "Wikimedia Commons",
    url: "https://commons.wikimedia.org/wiki/File:Wimbledon_Centre_Court_2017_cropped.jpg",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    notes: "Recortada (sin vehículos ni rótulos comerciales) y redimensionada a 2820 px; la versión adaptada se comparte bajo la misma licencia.",
  },
];
