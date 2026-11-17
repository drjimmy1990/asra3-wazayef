import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import {
  Building2,
  CheckCircle2,
  FileCheck2,
  Globe2,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.NEXT_PUBLIC_APP_URL &&
  !process.env.NEXT_PUBLIC_APP_URL.includes("localhost")
    ? process.env.NEXT_PUBLIC_APP_URL
    : "https://asra3.com");

export const metadata: Metadata = {
  title:
    "عن منصة أسرع ومنهجية التحقق والتوزيع المباشر للـ HR | About Asra3.com",
  description:
    "تعرّف على منهجية منصة أسرع (Asra3.com) المعتمدة في فحص السيرة الذاتية بنظام ATS، والتحقق من سجلات MX لبريد الموارد البشرية في الخليج، وضمان سرية المرشحين واستثناء جهة العمل الحالية.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "عن منصة أسرع (Asra3.com) — المنهجية والتوثيق في الخليج",
    description:
      "منصة أسرع للتحسين الذكي للسيرة الذاتية والتوزيع المباشر على إدارات الموارد البشرية في الإمارات والسعودية وقطر والكويت.",
    url: "/about",
    type: "website",
  },
};

const aboutStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "AboutPage",
      "@id": `${SITE_URL}/about#aboutpage`,
      url: `${SITE_URL}/about`,
      name: "عن منصة أسرع ومنهجية العمل | About Asra3.com",
      description:
        "Methodology, DNS MX HR verification standards, ATS scoring criteria, and official identity of Asra3.com (GCC AI ATS CV Optimization & Direct HR Distribution Platform).",
      isPartOf: { "@id": `${SITE_URL}/#website` },
      about: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "أسرع | Asra3.com",
          item: SITE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "عن المنصة والمنهجية | About",
          item: `${SITE_URL}/about`,
        },
      ],
    },
  ],
};

export default function AboutMethodologyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] dark:bg-[#09090B] text-zinc-950 dark:text-zinc-50 transition-colors">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(aboutStructuredData),
        }}
      />
      <Navbar />

      <main className="mx-auto max-w-4xl w-full px-4 py-12 sm:px-6 lg:px-8 space-y-8">
        <article className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] p-8 sm:p-12 space-y-10 shadow-sm">
          <header className="border-b border-zinc-200 dark:border-zinc-800 pb-6">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-[#09090B] px-3.5 py-1 text-xs font-bold text-[#D4AF37]">
              <Sparkles className="h-3.5 w-3.5 text-[#D4AF37]" />
              أسرع | Asra3.com — Platform Methodology &amp; Official Identity
            </span>
            <h1 className="mt-4 text-2xl sm:text-4xl font-extrabold text-zinc-950 dark:text-zinc-50 tracking-tight">
              عن منصة أسرع (Asra3.com): منهجية التوظيف المباشر في الخليج
            </h1>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              AI ATS CV Optimization &amp; MX-Verified GCC Corporate HR Distribution — UAE, Saudi Arabia, Qatar &amp; Kuwait
            </p>
          </header>

          {/* Official Entity Disambiguation Notice */}
          <div className="rounded-xl border border-zinc-800 bg-[#09090B] p-5 flex items-start gap-3.5">
            <ShieldCheck className="h-5 w-5 text-[#D4AF37] shrink-0 mt-0.5" />
            <div className="space-y-1.5 text-xs sm:text-sm text-zinc-100 leading-relaxed">
              <p className="font-bold text-[#D4AF37]">
                تحديث الهوية الرسمية لنطاق Asra3.com (2026) — Official Domain Notice
              </p>
              <p>
                تعمل منصة <strong>أسرع (Asra3.com)</strong> حصرياً كمنصة ذكية لتحسين السير الذاتية (ATS) وتوزيعها مباشرة إلى صناديق بريد مسؤولي الموارد البشرية (HR) في الإمارات والسعودية وقطر والكويت. وقد تم إيقاف وأرشفة كافة خدمات إدارة علاقات العملاء (CRM) القديمة التي كانت تستخدم هذا النطاق سابقاً بشكل نهائي.
              </p>
            </div>
          </div>

          <section className="space-y-4 text-zinc-700 dark:text-zinc-300 text-sm sm:text-base leading-relaxed">
            <h2 className="text-lg font-extrabold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
              <FileCheck2 className="h-5 w-5 text-[#D4AF37]" />
              1. الفحص الذكي للسيرة الذاتية (AI ATS Audit)
            </h2>
            <p>
              يقرأ محرك أسرع ملف السيرة الذاتية المرفوع بصيغتي PDF أو DOCX بدقة، ويستخلص المهارات القيادية والتقنية والمسمى الوظيفي وسنوات الخبرة، ثم يمنح المرشح تقييم توافق مع أنظمة فرز المتقدمين (ATS) وصياغة خطاب تقديم تنفيذي مخصص باللغتين العربية والإنجليزية.
            </p>
          </section>

          <section className="space-y-4 text-zinc-700 dark:text-zinc-300 text-sm sm:text-base leading-relaxed">
            <h2 className="text-lg font-extrabold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[#D4AF37]" />
              2. جودة قاعدة بيانات الموارد البشرية والتحقق عبر DNS MX
            </h2>
            <p>
              يخضع دليل الشركات الخليجية لفحص دوري بسجلات البريد الإلكتروني (DNS MX Verification) وتعطيل أي عنوان يرتد منه بريد (Hard Bounce) تلقائياً. يتم ترتيب استهداف الشركات وفق تطابق التخصص الوظيفي، والدولة والمدن المختارة، وأقل الشركات تشبّعاً بالرسائل حديثاً لضمان أعلى معدل فتح واستجابة.
            </p>
          </section>

          <section className="space-y-4 text-zinc-700 dark:text-zinc-300 text-sm sm:text-base leading-relaxed">
            <h2 className="text-lg font-extrabold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-[#D4AF37]" />
              3. الشفافية، السرية، والتحكم الكامل للمرشح
            </h2>
            <ul className="space-y-2 text-sm list-disc list-inside">
              <li>
                <strong>الرد المباشر للمرشح (Reply-To):</strong> جميع ردود مدراء التوظيف تصل لبريد المرشح الشخصي مباشرة دون أي وسيط.
              </li>
              <li>
                <strong>درع استثناء جهة العمل الحالية:</strong> يمنع وصول السيرة الذاتية لنطاق الشركة التي يعمل بها المرشح حالياً بنسبة 100%.
              </li>
              <li>
                <strong>دفع آمن لمرة واحدة:</strong> بدون اشتراكات متكررة عبر بوابة EasyKash DirectPayV1 مع التزام بتوثيق كل إيداع في بوابة التتبع الحية (/track).
              </li>
            </ul>
          </section>

          <section className="space-y-4 text-zinc-700 dark:text-zinc-300 text-sm sm:text-base leading-relaxed">
            <h2 className="text-lg font-extrabold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
              <Globe2 className="h-5 w-5 text-[#D4AF37]" />
              4. بوابات الأسواق الخليجية والتواصل الرسمي
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs font-bold">
              <Link href="/ae" className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-[#FAFAFA] dark:bg-[#09090B] px-3 py-2.5 text-center hover:border-[#D4AF37] transition-colors">
                الإمارات
              </Link>
              <Link href="/sa" className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-[#FAFAFA] dark:bg-[#09090B] px-3 py-2.5 text-center hover:border-[#D4AF37] transition-colors">
                السعودية
              </Link>
              <Link href="/qa" className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-[#FAFAFA] dark:bg-[#09090B] px-3 py-2.5 text-center hover:border-[#D4AF37] transition-colors">
                قطر
              </Link>
              <Link href="/kw" className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-[#FAFAFA] dark:bg-[#09090B] px-3 py-2.5 text-center hover:border-[#D4AF37] transition-colors">
                الكويت
              </Link>
              <Link href="/en" className="rounded-lg border border-zinc-800 bg-[#09090B] text-[#D4AF37] px-3 py-2.5 text-center hover:bg-zinc-900 transition-colors">
                English Hub
              </Link>
            </div>
            <div className="pt-3 flex flex-wrap items-center gap-4 text-xs text-zinc-600 dark:text-zinc-400">
              <span className="inline-flex items-center gap-1.5 font-semibold">
                <Mail className="h-4 w-4 text-[#9A7B1C] dark:text-[#D4AF37]" />
                <span dir="ltr" className="font-mono">hello@asra3.com</span>
              </span>
              <Link href="/privacy" className="underline hover:text-[#9A7B1C] dark:hover:text-[#D4AF37]">
                سياسة الخصوصية
              </Link>
              <Link href="/terms" className="underline hover:text-[#9A7B1C] dark:hover:text-[#D4AF37]">
                الشروط والأحكام
              </Link>
            </div>
          </section>
        </article>
      </main>
    </div>
  );
}
