import React from "react";
import { HomeLandingClient } from "@/components/HomeLandingClient";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.NEXT_PUBLIC_APP_URL &&
  !process.env.NEXT_PUBLIC_APP_URL.includes("localhost")
    ? process.env.NEXT_PUBLIC_APP_URL
    : "https://asra3.com");

const homeStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      "@id": `${SITE_URL}/#service`,
      name: "أسرع | Asra3.com — التوزيع المباشر للسيرة الذاتية لأقسام الموارد البشرية في الخليج",
      serviceType: "AI ATS CV Optimization & Direct HR Email Distribution",
      provider: {
        "@id": `${SITE_URL}/#organization`,
      },
      areaServed: [
        { "@type": "Country", name: "United Arab Emirates" },
        { "@type": "Country", name: "Saudi Arabia" },
        { "@type": "Country", name: "Qatar" },
        { "@type": "Country", name: "Kuwait" },
      ],
      offers: {
        "@type": "AggregateOffer",
        priceCurrency: "AED",
        lowPrice: "149",
        highPrice: "399",
        offerCount: "3",
        offers: [
          {
            "@type": "Offer",
            name: "Asra3 Launch — انطلاقة أسرع (100 شركة)",
            price: "149",
            priceCurrency: "AED",
            availability: "https://schema.org/InStock",
          },
          {
            "@type": "Offer",
            name: "Asra3 Turbo — تيربو أسرع (300 شركة)",
            price: "249",
            priceCurrency: "AED",
            availability: "https://schema.org/InStock",
          },
          {
            "@type": "Offer",
            name: "Asra3 Hyper — هايبر أسرع (500+ شركة)",
            price: "399",
            priceCurrency: "AED",
            availability: "https://schema.org/InStock",
          },
        ],
      },
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE_URL}/#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "كيف تصل ردود الشركات ومسؤولي التوظيف إليّ عبر منصة أسرع (Asra3.com)؟",
          acceptedAnswer: {
            "@type": "Answer",
            text: "عند إرسال سيرتك الذاتية إلى أقسام الموارد البشرية (HR)، يتم ضبط عنوان الرد المباشر (Reply-To) ليكون بريدك الإلكتروني الشخصي مباشرة، مع إرفاق رقم هاتفك والواتساب في السيرة الذاتية وخطاب التقديم.",
          },
        },
        {
          "@type": "Question",
          name: "هل يمكنني استهداف أكثر من دولة خليجية في نفس الحملة؟",
          acceptedAnswer: {
            "@type": "Answer",
            text: "نعم، يمكنك اختيار دولتك الأساسية في الخطوة الأولى (مثل الإمارات أو السعودية)، ثم إضافة دول خليجية إضافية في الخطوة الثالثة بخصم فوري 50%.",
          },
        },
        {
          "@type": "Question",
          name: "كيف أضمن عدم وصول سيرتي الذاتية لشركتي الحالية؟",
          acceptedAnswer: {
            "@type": "Answer",
            text: "في الخطوة الرابعة (الدفع والتأكيد) يمكنك إدخال نطاق بريد شركتك الحالية في حقل استثناء جهة العمل الحالية، ليقوم محرك أسرع بحجبها تماماً بنسبة 100%.",
          },
        },
        {
          "@type": "Question",
          name: "ما هي طرق الدفع المتاحة عبر بوابة EasyKash؟",
          acceptedAnswer: {
            "@type": "Answer",
            text: "ندعم الدفع الآمن لمرة واحدة عبر بوابة EasyKash DirectPayV1 باستخدام البطاقات البنكية (Visa, Mastercard, Mada)، Apple Pay، والمحافظ الإلكترونية دون أي اشتراكات متكررة.",
          },
        },
        {
          "@type": "Question",
          name: "كيف أتابع الشركات التي استلمت سيرتي الذاتية بعد الدفع؟",
          acceptedAnswer: {
            "@type": "Answer",
            text: "فور الدفع تحصل على رمز تتبع خاص يبدأ بـ ASR- للوصول الفوري إلى لوحة التتبع الحية (/track) ومشاهدة تقدم الإرسال وجدول الشركات المستلمة وخطاب التقديم الذكي.",
          },
        },
      ],
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeStructuredData) }}
      />
      <HomeLandingClient />
    </>
  );
}
