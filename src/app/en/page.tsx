import React from "react";
import type { Metadata } from "next";
import { HomeLandingClient } from "@/components/HomeLandingClient";
import { SeoGeoKnowledgeSection } from "@/components/SeoGeoKnowledgeSection";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.NEXT_PUBLIC_APP_URL &&
  !process.env.NEXT_PUBLIC_APP_URL.includes("localhost")
    ? process.env.NEXT_PUBLIC_APP_URL
    : "https://asra3.com");

export const metadata: Metadata = {
  title:
    "AI ATS CV Optimization & Direct GCC HR Distribution (UAE, Saudi, Qatar, Kuwait)",
  description:
    "Get hired 3x faster in the GCC: Asra3.com audits your CV against ATS standards, crafts an executive cover letter, and distributes your application directly into verified HR inboxes across the UAE, Saudi Arabia, Qatar, and Kuwait.",
  keywords: [
    "CV distribution UAE",
    "Send CV to Dubai companies",
    "CV distribution Saudi Arabia",
    "Send CV to Riyadh HR",
    "GCC HR email distribution",
    "ATS CV optimization Dubai",
    "Qatar HR email outreach",
    "Kuwait corporate recruitment distribution",
    "Asra3.com",
  ],
  alternates: {
    canonical: "/en",
    languages: {
      ar: "/",
      en: "/en",
      "x-default": "/",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_AE",
    alternateLocale: ["ar_AE", "ar_SA"],
    url: "/en",
    siteName: "Asra3.com | أسرع",
    title:
      "Asra3.com — AI ATS CV Optimization & Direct GCC HR Inbox Distribution",
    description:
      "Place your ATS-optimized CV and bespoke cover letter directly into verified HR decision-maker inboxes across Dubai, Abu Dhabi, Riyadh, Jeddah, Doha, and Kuwait City.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Asra3.com — Get Hired 3x Faster Across the GCC",
    description:
      "Direct CV placement into MX-verified corporate HR inboxes in UAE, Saudi Arabia, Qatar & Kuwait with live delivery tracking.",
  },
};

const englishStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      "@id": `${SITE_URL}/en#service`,
      name: "Asra3.com — AI ATS CV Optimization & Direct GCC HR Distribution",
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
            name: "Asra3 Launch (100 Verified Companies)",
            price: "149",
            priceCurrency: "AED",
            availability: "https://schema.org/InStock",
          },
          {
            "@type": "Offer",
            name: "Asra3 Turbo (300 Verified Companies + AI Cover Letter)",
            price: "249",
            priceCurrency: "AED",
            availability: "https://schema.org/InStock",
          },
          {
            "@type": "Offer",
            name: "Asra3 Hyper (500+ Verified Companies + Priority ATS Rewrite)",
            price: "399",
            priceCurrency: "AED",
            availability: "https://schema.org/InStock",
          },
        ],
      },
    },
    {
      "@type": "HowTo",
      "@id": `${SITE_URL}/en#howto`,
      name: "How to Distribute Your CV Directly to GCC HR Inboxes with Asra3.com",
      description:
        "Four steps to audit your CV against ATS filters and place it directly into verified corporate HR mailboxes across the UAE, Saudi Arabia, Qatar, and Kuwait.",
      step: [
        {
          "@type": "HowToStep",
          position: 1,
          name: "Run a Free Instant AI ATS CV Audit",
          text: "Upload your PDF or DOCX CV to extract skills, experience years, job title, and your baseline ATS score.",
        },
        {
          "@type": "HowToStep",
          position: 2,
          name: "Select GCC Market, Cities & Sector",
          text: "Choose UAE, Saudi Arabia, Qatar, or Kuwait along with preferred cities (such as Dubai, Abu Dhabi, Riyadh, Jeddah, Doha, or Kuwait City) and industry.",
        },
        {
          "@type": "HowToStep",
          position: 3,
          name: "Pick a One-Time Plan & Current-Employer Exclusion",
          text: "Select 100, 300, or 500+ target employers and block your current company domain for 100% confidentiality.",
        },
        {
          "@type": "HowToStep",
          position: 4,
          name: "Complete EasyKash Checkout & Track Real-Time Delivery",
          text: "Pay once via EasyKash DirectPayV1 and watch company-by-company HR placement inside /track while receiving HR replies straight to your inbox.",
        },
      ],
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE_URL}/en#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "How do HR managers and recruiters reply to me on Asra3.com?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Every outreach email sets the Reply-To header directly to your personal email address, alongside your phone and WhatsApp in the cover letter, so HR interview replies land straight in your inbox.",
          },
        },
        {
          "@type": "Question",
          name: "Can I target multiple GCC countries in one campaign?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Choose your primary GCC country in Step 1 and add extra Gulf markets in Step 3 at checkout.",
          },
        },
        {
          "@type": "Question",
          name: "Can I block my current employer from receiving my CV?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Enter your current employer domain in Step 4 and Asra3's Current-Employer Exclusion Shield blocks 100% of matching HR addresses.",
          },
        },
        {
          "@type": "Question",
          name: "Is Asra3 a subscription or a one-time payment?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "All Asra3 campaigns are one-time payments settled securely via EasyKash DirectPayV1 using Visa, Mastercard, Mada, Apple Pay, or regional mobile wallets.",
          },
        },
        {
          "@type": "Question",
          name: "How do I verify which employers received my CV?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Right after checkout you receive a private order code and live portal link at /track showing delivery timestamps, recipient companies, open counts, and CSV report export.",
          },
        },
      ],
    },
  ],
};

export default function EnglishHomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(englishStructuredData),
        }}
      />
      <HomeLandingClient
        initialLang="en"
        seoSection={<SeoGeoKnowledgeSection variant="gcc-en" />}
      />
    </>
  );
}
