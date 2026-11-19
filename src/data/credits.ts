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
  { asset: "Vídeo «Tennis serve aerial view»", usedIn: "Inicio · Racket Finder; foto de cabecera del catálogo (fotograma)", author: "Mixkit", source: "Mixkit", url: "https://mixkit.co/free-stock-video/tennis-serve-aerial-view-879/", ...mixkitLicense, notes: "Recortado a 8 s, 1280 px, sin audio." },
  { asset: "Vídeo «Two people playing tennis, aerial view»", usedIn: "Inicio · CTA final; página 404 (fotograma)", author: "Mixkit", source: "Mixkit", url: "https://mixkit.co/free-stock-video/two-people-playing-tennis-aerial-view-880/", ...mixkitLicense, notes: "Recortado a 8 s, 1280 px, sin audio." },
  { asset: "Vídeo «Tennis player during a match»", usedIn: "Contacto (fotograma)", author: "Mixkit", source: "Mixkit", url: "https://mixkit.co/free-stock-video/tennis-player-during-a-match-876/", ...mixkitLicense },
  { asset: "HDRI «Studio Small 09»", usedIn: "Iluminación y reflejos de todas las escenas y renders 3D", author: "Sergej Majboroda", source: "Poly Haven", url: "https://polyhaven.com/a/studio_small_09", license: "CC0 1.0", licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/" },
  { asset: "Textura «Leather White» (color, normal, rugosidad)", usedIn: "Material PBR del grip de los modelos 3D", author: "Rob Tuytel", source: "Poly Haven", url: "https://polyhaven.com/a/leather_white", license: "CC0 1.0", licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/" },
];
