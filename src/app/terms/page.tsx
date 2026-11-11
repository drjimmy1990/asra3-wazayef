import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { FileText, CheckCircle2, ShieldAlert, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "الشروط والأحكام وضمان التنفيذ | Terms of Service",
  description:
    "الشروط والأحكام الرسمية لاستخدام منصة أسرع (Asra3.com) لتوزيع السيرة الذاتية في دول الخليج، وسياسة الدفع لمرة واحدة وضمان تنفيذ الحملات.",
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] dark:bg-[#09090B] text-zinc-950 dark:text-zinc-50 transition-colors">
      <Navbar />

      <main className="mx-auto max-w-4xl w-full px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] p-8 sm:p-12 space-y-10 shadow-sm">
          <div className="border-b border-zinc-200 dark:border-zinc-800 pb-6">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-[#09090B] px-3.5 py-1 text-xs font-bold text-[#D4AF37]">
              <FileText className="h-3.5 w-3.5 text-[#D4AF37]" />
              أسرع | Asra3.com — Service Terms & Fulfillment Policy
            </span>
            <h1 className="mt-4 text-2xl sm:text-4xl font-extrabold text-zinc-950 dark:text-zinc-50 tracking-tight">
              الشروط والأحكام وسياسة تنفيذ الحملات
            </h1>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Terms of Service & Campaign Fulfillment Guarantee — Last Updated:
              2026
            </p>
          </div>

          <section className="space-y-6 text-zinc-700 dark:text-zinc-300 leading-relaxed text-sm sm:text-base">
            <div className="space-y-2">
              <h2 className="text-lg font-extrabold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-[#D4AF37]" />
                1. طبيعة خدمة منصة أسرع (Asra3.com)
              </h2>
              <p>
                تقدم منصة أسرع خدمة تقنية تنفيذية تشمل تحليل السيرة الذاتية
                بنظام ATS، صياغة خطاب تقديم مخصص بالذكاء الاصطناعي، وتوزيع
                السيرة الذاتية عبر البريد الإلكتروني المباشر بنظام الإرسال
                المتدرج (Smart Drip) إلى مسؤولي الموارد البشرية والتوظيف في
                الشركات المعتمدة ضمن الدولة والقطاع المختارين.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-extrabold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-[#D4AF37]" />
                2. مسؤولية التوظيف وقرارات الشركات
              </h2>
              <p>
                تضمن منصة أسرع إيصال ملفك الاحترافي لصناديق بريد الموارد البشرية
                الحقيقية وتوفير لوحة تتبع شفافة برمز (ASR-)، إلا أن قرار إجراء
                المقابلات أو التعيين النهائي يخضع حصرياً لاحتياجات الشركات
                ومعايير الاختيار لديها ومؤهلات المرشح.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-extrabold text-zinc-950 dark:text-zinc-50">
                3. التسعير والدفع لمرة واحدة (بدون اشتراكات متكررة)
              </h2>
              <p>
                جميع باقات أسرع (انطلاقة أسرع 100 شركة، تيربو أسرع 300 شركة،
                هايبر أسرع 500+ شركة) تُدفع لمرة واحدة فقط بالعملة الموضحة أثناء
                الدفع دون أي اقتطاعات شهرية تلقائية.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-extrabold text-zinc-950 dark:text-zinc-50">
                4. سياسة الاسترجاع وضمان التنفيذ
              </h2>
              <p>
                في حال تعذر بدء حملة الإرسال لأي سبب تقني قبل انطلاق دفعات
                البريد الإلكتروني، يحق للمرشح استرداد كامل المبلغ المدفوع بنسبة
                100%. أما بعد بدء الإرسال الفعلي للشركات وتوليد مخرجات الذكاء
                الاصطناعي، فيتم تعويض أي عناوين مرتدة تلقائياً بشركات بديلة
                معتمدة في نفس القطاع لضمان اكتمال العدد المستهدف بالكامل.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-extrabold text-zinc-950 dark:text-zinc-50">
                5. صحة البيانات المرفوعة
              </h2>
              <p>
                يقر المستخدم بأن السيرة الذاتية وبيانات التواصل المرفوعة تخصه
                شخصياً أو يملك تفويضاً قانونياً باستخدامها، وأن المعلومات المهنية
                الواردة فيها صحيحة ودقيقة.
              </p>
            </div>
          </section>

          <section
            dir="ltr"
            className="border-t border-zinc-200 dark:border-zinc-800 pt-8 space-y-4 text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed text-left"
          >
            <h2 className="text-xl font-extrabold text-zinc-950 dark:text-zinc-50">
              English Summary — Terms of Service
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-zinc-950 dark:text-zinc-100">
                  Scope of Service:
                </strong>{" "}
                Asra3.com provides automated ATS CV analysis, tailored executive
                cover letter generation, and smart-drip direct email outreach to
                verified GCC employer HR contacts, tracked via your personal{" "}
                <code className="rounded bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 font-mono text-xs text-zinc-900 dark:text-[#D4AF37]">
                  ASR-
                </code>{" "}
                campaign portal.
              </li>
              <li>
                <strong className="text-zinc-950 dark:text-zinc-100">
                  No Employment Guarantee:
                </strong>{" "}
                While Asra3 guarantees verified outreach delivery and replaces
                any bounced HR contacts automatically, interview invitations and
                hiring decisions rest solely with prospective employers.
              </li>
              <li>
                <strong className="text-zinc-950 dark:text-zinc-100">
                  One-Time Billing & Refund Policy:
                </strong>{" "}
                All tiers (Asra3 Launch, Asra3 Turbo, Asra3 Hyper) are one-time
                payments with zero recurring charges. Full refunds are available
                prior to campaign dispatch initiation; once live email batches
                have started, fulfillment is guaranteed to reach 100% of your
                tier&apos;s verified company quota.
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
                href="/privacy"
                className="hover:underline underline-offset-4"
              >
                سياسة الخصوصية (Privacy)
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
