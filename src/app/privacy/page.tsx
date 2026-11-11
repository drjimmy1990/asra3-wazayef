import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { ShieldCheck, Lock, EyeOff, FileCheck2, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "سياسة الخصوصية وحماية بيانات السيرة الذاتية | Privacy Policy",
  description:
    "تعرّف على كيفية حماية منصة أسرع (Asra3.com) لملفات السيرة الذاتية وبيانات المرشحين وميزة استثناء جهة العمل الحالية والتشفير الآمن للدفع عبر EasyKash.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] dark:bg-[#09090B] text-zinc-950 dark:text-zinc-50 transition-colors">
      <Navbar />

      <main className="mx-auto max-w-4xl w-full px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] p-8 sm:p-12 space-y-10 shadow-sm">
          <div className="border-b border-zinc-200 dark:border-zinc-800 pb-6">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-[#09090B] px-3.5 py-1 text-xs font-bold text-[#D4AF37]">
              <ShieldCheck className="h-3.5 w-3.5 text-[#D4AF37]" />
              أسرع | Asra3.com — Privacy & Data Governance
            </span>
            <h1 className="mt-4 text-2xl sm:text-4xl font-extrabold text-zinc-950 dark:text-zinc-50 tracking-tight">
              سياسة الخصوصية وحماية بيانات المرشحين
            </h1>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Privacy Policy & Candidate CV Confidentiality — Last Updated: 2026
            </p>
          </div>

          <section className="space-y-6 text-zinc-700 dark:text-zinc-300 leading-relaxed text-sm sm:text-base">
            <div className="rounded-xl border border-zinc-800 bg-[#09090B] p-5 flex items-start gap-3.5">
              <Lock className="h-5 w-5 text-[#D4AF37] shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-zinc-100 font-semibold leading-relaxed">
                تلتزم منصة أسرع (Asra3.com) بأعلى معايير السرية التنفيذية: لا
                نقوم بنشر سيرتك الذاتية في قواعد بيانات عامة مفتوحة للجمهور، بل
                يتم إيداعها حصرياً في صناديق بريد مسؤولي الموارد البشرية (HR) في
                الدولة والقطاع اللذين تحددهما بنفسك.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-extrabold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
                <FileCheck2 className="h-5 w-5 text-[#D4AF37]" />
                1. البيانات والملفات التي نعالجها
              </h2>
              <p>
                عند استخدامك لمنصة أسرع، نعالج فقط البيانات الضرورية لتنفيذ حملة
                التوزيع الخاصة بك، وتشمل: الاسم الكامل، البريد الإلكتروني الشخصي
                (الذي يُضبط كعنوان رد مباشر Reply-To)، رقم الجوال/الواتساب،
                المسمى الوظيفي، وملف السيرة الذاتية المرفوع بصيغة PDF أو DOCX
                لغرض تحليل توافق ATS وإرفاقه للشركات المستهدفة.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-extrabold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
                <EyeOff className="h-5 w-5 text-[#D4AF37]" />
                2. ضمان سرية الموظفين واستثناء جهة العمل الحالية
              </h2>
              <p>
                نوفّر في الخطوة الرابعة ميزة (استثناء نطاق جهة العمل الحالية).
                عند إدخال نطاق شركتك الحالية (مثال: company.ae)، يقوم محرك
                الفلترة في Asra3.com باستبعاد أي بريد إلكتروني تابع لذلك النطاق
                آلياً قبل إنشاء قائمة الإرسال.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-extrabold text-zinc-950 dark:text-zinc-50">
                3. أمان المدفوعات وعدم تخزين البطاقات البنكية
              </h2>
              <p>
                تتم معالجة جميع المدفوعات عبر بوابة EasyKash المعتمدة والمؤمّنة
                بتوقيع رقمي مشفر (HMAC-SHA512). لا تقوم منصة أسرع بتخزين أرقام
                البطاقات الائتمانية أو رموز التحقق السرية (CVV) على خوادمنا
                نهائياً.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-extrabold text-zinc-950 dark:text-zinc-50">
                4. الاحتفاظ بالملفات وحق الحذف الفوري
              </h2>
              <p>
                يتم حفظ ملف السيرة الذاتية عبر روابط محمية وموقعة رقمياً طوال
                فترة نشاط حملتك (30 يوماً) لتمكينك ومسؤولي التوظيف من استعراضه.
                يمكنك في أي وقت مراسلتنا لحذف ملفاتك وسجل حملتك بالكامل خلال 24
                ساعة.
              </p>
            </div>
          </section>

          <section
            dir="ltr"
            className="border-t border-zinc-200 dark:border-zinc-800 pt-8 space-y-4 text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed text-left"
          >
            <h2 className="text-xl font-extrabold text-zinc-950 dark:text-zinc-50">
              English Summary — Candidate Data & Privacy Commitment
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-zinc-950 dark:text-zinc-100">
                  No Public Resume Scraping:
                </strong>{" "}
                Asra3.com never lists your CV on public searchable directories.
                Your profile is dispatched strictly to verified HR inboxes
                matching your chosen GCC countries, cities, and industry.
              </li>
              <li>
                <strong className="text-zinc-950 dark:text-zinc-100">
                  Employer Domain Exclusion:
                </strong>{" "}
                Any domain entered in the Confidentiality Exclusion field during
                checkout is hard-blocked at the database dispatch layer.
              </li>
              <li>
                <strong className="text-zinc-950 dark:text-zinc-100">
                  Signed Storage & Encrypted Payments:
                </strong>{" "}
                Uploaded PDF/DOCX CVs are stored behind cryptographically signed
                access tokens, and all payments are processed externally via
                EasyKash DirectPayV1 (HMAC-SHA512) without storing card numbers
                on Asra3 servers.
              </li>
              <li>
                <strong className="text-zinc-950 dark:text-zinc-100">
                  Data Erasure Requests:
                </strong>{" "}
                Contact our privacy desk anytime at{" "}
                <a
                  href="mailto:support@asra3.com"
                  className="font-bold text-zinc-950 dark:text-[#D4AF37] underline underline-offset-4"
                >
                  support@asra3.com
                </a>{" "}
                for immediate campaign or CV deletion.
              </li>
            </ul>
          </section>

          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6 flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="inline-flex items-center gap-1.5 font-bold text-zinc-950 dark:text-zinc-100">
              <Mail className="h-4 w-4 text-[#D4AF37]" />
              support@asra3.com
            </span>
            <div className="flex items-center gap-4 font-bold text-zinc-900 dark:text-[#D4AF37]">
              <Link href="/" className="hover:underline underline-offset-4">
                العودة للرئيسية (Home)
              </Link>
              <Link
                href="/terms"
                className="hover:underline underline-offset-4"
              >
                الشروط والأحكام (Terms)
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
