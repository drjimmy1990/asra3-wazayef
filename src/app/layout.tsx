import type { Metadata } from "next";
import {
  IBM_Plex_Sans_Arabic,
  Plus_Jakarta_Sans,
  Cormorant_Garamond,
} from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";

const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-arabic",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["600", "700"],
  style: ["normal", "italic"],
  variable: "--font-editorial",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.NEXT_PUBLIC_APP_URL &&
  !process.env.NEXT_PUBLIC_APP_URL.includes("localhost")
    ? process.env.NEXT_PUBLIC_APP_URL
    : "https://asra3.com");

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:
      "أسرع | Asra3.com — توظَّف أسرع في الإمارات والسعودية وقطر والكويت",
    template: "%s | أسرع Asra3.com",
  },
  description:
    "توظَّف أسرع بـ 3 أضعاف في الخليج: منصة أسرع (Asra3.com) تحلّل سيرتك الذاتية بنظام ATS وتوصلها مع خطاب تقديم ذكي مباشرة إلى صناديق بريد مسؤولي الموارد البشرية (HR) في آلاف الشركات المعتمدة في الإمارات، السعودية، قطر، والكويت.",
  applicationName: "Asra3.com | أسرع",
  keywords: [
    "توظف أسرع",
    "أسرع للتوظيف",
    "Asra3",
    "asra3.com",
    "توزيع السيرة الذاتية في الإمارات",
    "توزيع السيرة الذاتية في السعودية",
    "إرسال السي في لشركات دبي",
    "إرسال السيرة الذاتية لشركات الرياض",
    "وظائف الخليج",
    "وظائف دبي",
    "وظائف السعودية",
    "وظائف قطر",
    "وظائف الكويت",
    "CV distribution UAE",
    "CV distribution Saudi Arabia",
    "GCC HR email distribution",
    "ATS CV optimization GCC",
    "Get hired faster UAE KSA",
  ],
  authors: [{ name: "Asra3.com", url: SITE_URL }],
  creator: "Asra3.com",
  publisher: "Asra3.com",
  alternates: {
    canonical: "/",
    languages: {
      ar: "/",
      en: "/?lang=en",
      "x-default": "/",
    },
  },
  openGraph: {
    type: "website",
    locale: "ar_AE",
    alternateLocale: ["en_AE", "ar_SA"],
    url: "/",
    siteName: "أسرع | Asra3.com",
    title: "أسرع | Asra3.com — توظَّف أسرع بـ 3 أضعاف في الخليج",
    description:
      "وصِّل سيرتك الذاتية المحسنة بنظام ATS وخطاب التقديم الذكي مباشرة إلى صناديق بريد مسؤولي التوظيف (HR) في الإمارات، السعودية، قطر، والكويت.",
  },
  twitter: {
    card: "summary_large_image",
    title: "أسرع | Asra3.com — توظَّف أسرع في الخليج (Get Hired 3x Faster)",
    description:
      "توزيع مباشر للسيرة الذاتية لصناديق بريد الموارد البشرية (HR) في الإمارات، السعودية، قطر، والكويت مع لوحة تتبع حية.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

const globalJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "أسرع | Asra3",
      alternateName: ["Asra3.com", "منصة أسرع للتوظيف الذكي"],
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.svg`,
      },
      slogan: "توظَّف أسرع — Get Hired Faster",
      areaServed: [
        { "@type": "Country", name: "United Arab Emirates" },
        { "@type": "Country", name: "Saudi Arabia" },
        { "@type": "Country", name: "Qatar" },
        { "@type": "Country", name: "Kuwait" },
      ],
      contactPoint: [
        {
          "@type": "ContactPoint",
          email: "support@asra3.com",
          telephone: "+971-50-408-1478",
          contactType: "customer support",
          availableLanguage: ["Arabic", "English"],
        },
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "أسرع | Asra3.com",
      description:
        "منصة التوزيع المباشر للسيرة الذاتية لصناديق بريد الموارد البشرية (HR) في دول الخليج.",
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: ["ar", "en"],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${plexArabic.variable} ${jakarta.variable} ${cormorant.variable} antialiased selection:bg-[#D4AF37] selection:text-[#09090B]`}
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('asra3_theme');if(t==='dark'){document.documentElement.classList.add('dark');document.documentElement.dataset.theme='dark';}else{document.documentElement.classList.remove('dark');document.documentElement.dataset.theme='light';}}catch(e){}`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(globalJsonLd) }}
        />
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
