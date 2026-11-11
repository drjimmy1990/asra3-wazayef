import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "أسرع | Asra3.com — توظَّف أسرع في الخليج",
    short_name: "Asra3 | أسرع",
    description:
      "توظَّف أسرع — المنصة التنفيذية لتوزيع السيرة الذاتية مباشرة لأقسام الموارد البشرية (HR) في الإمارات والسعودية وقطر والكويت.",
    start_url: "/",
    display: "standalone",
    background_color: "#FAFAFA",
    theme_color: "#09090B",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
