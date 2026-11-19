import { NextRequest, NextResponse } from "next/server";
import { createSupportLead, getCatalogData } from "@/lib/store";
import { searchAndRankJobs } from "@/lib/jobs-store";
import {
  CountryCode,
  CurrencyCode,
  Language,
  SupportLeadTopic,
} from "@/lib/types";

interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

interface SupportChatResponse {
  reply: string;
  showLeadForm: boolean;
  suggestedActions: string[];
  leadSaved?: boolean;
  source: "n8n" | "fallback";
}

function buildFallbackReply(params: {
  message: string;
  lang: Language;
  countryCode: CountryCode;
  currency: CurrencyCode;
  packagesText: string;
  offerLine: string;
  activeJobsCount: number;
}): Omit<SupportChatResponse, "source"> {
  const q = params.message.toLowerCase();
  const isAr = params.lang === "ar" || /[\u0600-\u06FF]/.test(params.message);

  const wantsHuman =
    /(contact|support|human|agent|call|whatsapp|phone|email|refund|problem|issue|help me|تواصل|دعم|موظف|بشري|واتساب|رقم|اتصال|مشكلة|استرجاع|كلمني|تليفون|موبايل)/.test(
      q
    );
  const asksPricing =
    /(price|cost|package|plan|discount|coupon|offer|promo|pay|easykash|سعر|الأسعار|اسعار|باقة|باقات|خصم|كوبون|عرض|عروض|دفع|بكام|تكلفة)/.test(
      q
    );
  const asksEmployer =
    /(employer|hire|hiring|post a job|company|recruit|شركة|توظيف|نشر وظيفة|صاحب عمل|موارد بشرية|إعلان وظيفي)/.test(
      q
    );
  const asksTrack =
    /(track|status|where|campaign|asr-|تتبع|حملتي|حالة الحملة|وصلت|إرسال)/.test(
      q
    );
  const asksJobs =
    /(job|vacanc|career|وظيفة|وظائف|شواغر|تقديم)/.test(q);
  const asksShield =
    /(current company|current employer|secret|confidential|exclude|شركتي الحالية|سرية|استثناء|حجب)/.test(
      q
    );

  if (wantsHuman) {
    return {
      reply: isAr
        ? "يسعدنا التواصل معك مباشرة! اترك لنا اسمك ورقم الواتساب أو بريدك الإلكتروني في النموذج بالأسفل وسيتواصل معك فريق دعم أسرع في أقرب وقت."
        : "We'd be glad to connect you with our team directly! Please leave your name, WhatsApp/phone or email in the form below and an Asra3 specialist will reach out shortly.",
      showLeadForm: true,
      suggestedActions: isAr
        ? ["الأسعار والعروض الحالية", "كيف تعمل منصة أسرع؟"]
        : ["Pricing & Active Offers", "How Asra3 Works"],
    };
  }

  if (asksPricing) {
    return {
      reply: isAr
        ? `أسعار باقات أسرع الحالية (${params.currency}) دفعة واحدة بدون أي اشتراك شهري:\n${params.packagesText}\n${params.offerLine}\n\nالدفع آمن عبر EasyKash (فيزا، ماستركارد، مدى، Apple Pay، محافظ إلكترونية). هل ترغب بمساعدة في اختيار الباقة الأنسب لتخصصك؟`
        : `Here are Asra3's current one-time packages (${params.currency}) — zero recurring subscriptions:\n${params.packagesText}\n${params.offerLine}\n\nPayments are secured via EasyKash (Visa, Mastercard, Mada, Apple Pay, Wallets). Would you like help picking the right package?`,
      showLeadForm: false,
      suggestedActions: isAr
        ? ["أريد التواصل مع الدعم", "كيف أستثني شركتي الحالية؟", "تصفح وظائف الخليج"]
        : ["Talk to Human Support", "Exclude My Current Employer", "Browse GCC Jobs"],
    };
  }

  if (asksEmployer) {
    return {
      reply: isAr
        ? "يمكن لأصحاب العمل وإدارات الموارد البشرية نشر شواغرهم مجاناً عبر بوابة الشركات (/employers). عند التقديم ببريد شركتك الرسمي الموثق (DNS MX)، يُنشر الإعلان فوراً على الموقع وتُتاح بطاقة الوظيفة بكود QR للنشر."
        : "Employers and HR teams can post vacancies for free at /employers. Corporate emails passing live DNS MX verification publish immediately with a branded Asra3 QR job card and social distribution.",
      showLeadForm: true,
      suggestedActions: isAr
        ? ["الأسعار والعروض الحالية", "أريد التواصل مع فريق المبيعات"]
        : ["Pricing & Offers", "Contact Enterprise Desk"],
    };
  }

  if (asksShield) {
    return {
      reply: isAr
        ? "نعم 100%! في الخطوة الأخيرة قبل الدفع يوجد حقل (استثناء شركتك الحالية) — اكتب فقط اسم نطاق شركتك (مثل company.ae) وسيمنع محرك أسرع إرسال سيرتك الذاتية لأي بريد تابع لها بشكل نهائي."
        : "Yes, 100%! On the final checkout step, enter your current company's domain in the 'Exclude Current Employer' shield and Asra3 strictly blocks any HR address matching that domain.",
      showLeadForm: false,
      suggestedActions: isAr
        ? ["الأسعار والعروض الحالية", "أريد التواصل مع الدعم"]
        : ["Pricing & Offers", "Talk to Human Support"],
    };
  }

  if (asksTrack) {
    return {
      reply: isAr
        ? "فور إتمام الدفع تحصل على رابط تتبع حي (/track) ورسالة تأكيد على بريدك الإلكتروني لمتابعة عدد الشركات المستلمة ومعدل فتح الرسائل وتحميل تقرير CSV الشفاف. لو واجهت أي مشكلة في رمز التتبع، اترك لنا بريدك بالأسفل وسنساعدك فوراً."
        : "Right after payment you receive your live tracking portal (/track) link by email to follow deliveries, HR opens, and download your CSV report. If you need help recovering a campaign, leave your details below.",
      showLeadForm: true,
      suggestedActions: isAr
        ? ["الأسعار والعروض الحالية", "كيف تعمل منصة أسرع؟"]
        : ["Pricing & Offers", "How Asra3 Works"],
    };
  }

  if (asksJobs) {
    return {
      reply: isAr
        ? `لدينا حالياً ${params.activeJobsCount}+ وظيفة نشطة ومفحوصة في الإمارات والسعودية وقطر والكويت على صفحة الوظائف (/jobs) يمكنك التقديم عليها مباشرة لقسم الـ HR مجاناً، كما يمكنك إرسال سيرتك الذاتية تلقائياً لـ 100 إلى 500+ شركة موثقة في تخصصك عبر أسرع.`
        : `We currently list ${params.activeJobsCount}+ active verified GCC jobs across UAE, KSA, Qatar & Kuwait at /jobs where you can apply free to HR, or use Asra3's distribution engine to send your ATS-audited CV directly to 100–500+ verified employers.`,
      showLeadForm: false,
      suggestedActions: isAr
        ? ["الأسعار والعروض الحالية", "نشر وظيفة لشركتي", "أريد التواصل مع الدعم"]
        : ["Pricing & Offers", "Post a Company Job", "Talk to Human Support"],
    };
  }

  return {
    reply: isAr
      ? `أهلاً بك في أسرع (Asra3.com)! نحن نساعدك على التوظيف أسرع في الإمارات والسعودية وقطر والكويت عبر:\n1) فحص سيرتك الذاتية بنظام ATS مجاناً.\n2) توزيع سيرتك + خطاب تقديم ذكي مباشرة لصناديق بريد الـ HR في 100–500+ شركة موثقة مع لوحة تتبع حية.\n3) بوابة وظائف خليجية محدثة يومياً (/jobs).\n\nكيف أقدر أساعدك اليوم؟`
      : `Welcome to Asra3.com! We help you get hired faster across UAE, Saudi Arabia, Qatar & Kuwait through:\n1) Free instant AI ATS CV compatibility scan.\n2) Direct CV + executive cover letter distribution to 100–500+ verified HR inboxes with live tracking.\n3) Verified GCC Jobs Board (/jobs).\n\nHow can I help you today?`,
    showLeadForm: false,
    suggestedActions: isAr
      ? [
          "الأسعار والعروض الحالية",
          "كيف أستثني شركتي الحالية؟",
          "نشر وظيفة لشركتي",
          "أريد التواصل مع الدعم",
        ]
      : [
          "Pricing & Active Offers",
          "Exclude My Current Employer",
          "Post a Company Job",
          "Talk to Human Support",
        ],
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = String(body.message || "").trim().slice(0, 1200);
    const sessionId = String(body.sessionId || "web-session").slice(0, 64);
    const lang: Language = body.lang === "en" ? "en" : "ar";
    const countryCode: CountryCode = ["AE", "SA", "QA", "KW"].includes(
      String(body.countryCode || "").toUpperCase()
    )
      ? (String(body.countryCode).toUpperCase() as CountryCode)
      : "AE";
    const pageUrl = String(body.pageUrl || "/").slice(0, 300);
    const history: ChatTurn[] = Array.isArray(body.history)
      ? body.history
          .slice(-8)
          .filter(
            (t: unknown): t is ChatTurn =>
              Boolean(t) &&
              typeof t === "object" &&
              ((t as ChatTurn).role === "user" ||
                (t as ChatTurn).role === "assistant") &&
              typeof (t as ChatTurn).content === "string"
          )
          .map((t: ChatTurn) => ({
            role: t.role,
            content: t.content.slice(0, 600),
          }))
      : [];

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const [catalog, jobsMeta] = await Promise.all([
      getCatalogData(),
      searchAndRankJobs({ limit: 1 }),
    ]);

    const countryObj =
      catalog.countries.find((c) => c.code === countryCode) ||
      catalog.countries[0];
    const currency = countryObj.currency_code;

    const packagesSummary = catalog.packages.map((p) => ({
      id: p.id,
      name_en: p.name_en,
      name_ar: p.name_ar,
      company_limit: p.company_limit,
      price: p.prices_by_currency[currency] ?? p.prices_by_currency.AED,
      original_price:
        p.original_prices_by_currency?.[currency] ??
        p.original_prices_by_currency?.AED ??
        null,
      addon_extra_country:
        p.addon_country_price_by_currency[currency] ??
        p.addon_country_price_by_currency.AED,
      currency,
      includes_cover_letter: p.includes_cover_letter,
      includes_cv_rewrite: p.includes_cv_rewrite,
    }));

    const siteContext = {
      brand: "Asra3.com (أسرع)",
      website: "https://asra3.com",
      support_email: "hello@asra3.com",
      active_country: countryCode,
      currency,
      live_jobs_count: jobsMeta.totalActiveJobs,
      offer: catalog.offerSettings.enabled
        ? {
            badge_ar: catalog.offerSettings.badge_ar,
            badge_en: catalog.offerSettings.badge_en,
            headline_ar: catalog.offerSettings.headline_ar,
            headline_en: catalog.offerSettings.headline_en,
            ends_at: catalog.offerSettings.ends_at,
            evergreen_hours: catalog.offerSettings.evergreen_hours,
            public_coupon_code: catalog.offerSettings.highlight_coupon_code || null,
          }
        : null,
      packages: packagesSummary,
      key_features: [
        "Free instant AI ATS CV compatibility scan",
        "Direct HR inbox email delivery (Reply-To set to candidate personal email)",
        "Confidentiality Shield to exclude candidate's current employer domain",
        "One-time EasyKash payment (Visa, Mastercard, Mada, Apple Pay, Wallets) — no recurring subscriptions",
        "Live tracking portal (/track) with transparent delivery & HR open report + CSV export",
        "Free GCC Jobs Board (/jobs) & Employer Posting Portal (/employers) with DNS MX verification",
      ],
    };

    const webhookUrl = (process.env.N8N_SUPPORT_CHAT_WEBHOOK || "").trim();
    if (
      webhookUrl &&
      webhookUrl.startsWith("http") &&
      !webhookUrl.includes("your-")
    ) {
      try {
        const res = await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-webhook-secret":
              process.env.N8N_WEBHOOK_SECRET ||
              process.env.ADMIN_PASSCODE ||
              "asra3@2026",
          },
          body: JSON.stringify({
            sessionId,
            message,
            history,
            lang,
            countryCode,
            pageUrl,
            siteContext,
          }),
          signal: AbortSignal.timeout(18000),
        });

        if (res.ok) {
          const data = await res.json();
          const replyText = String(
            data?.reply || data?.output || data?.text || ""
          ).trim();

          if (replyText) {
            let leadSaved = false;
            const cap = data?.capturedLead;
            if (
              cap &&
              typeof cap === "object" &&
              (cap.email || cap.phone)
            ) {
              try {
                createSupportLead({
                  session_id: sessionId,
                  name: String(cap.name || "Chat Visitor"),
                  email: String(cap.email || ""),
                  phone: String(cap.phone || ""),
                  country_code: countryCode,
                  topic: (cap.topic || "general") as SupportLeadTopic,
                  message: String(cap.message || message),
                  page_url: pageUrl,
                });
                leadSaved = true;
              } catch {
                // Non-blocking
              }
            }

            const result: SupportChatResponse = {
              reply: replyText,
              showLeadForm: Boolean(data?.showLeadForm),
              suggestedActions: Array.isArray(data?.suggestedActions)
                ? data.suggestedActions
                    .map((s: unknown) => String(s || "").trim())
                    .filter(Boolean)
                    .slice(0, 4)
                : [],
              leadSaved,
              source: "n8n",
            };
            return NextResponse.json(result);
          }
        }
      } catch (err) {
        console.warn("n8n support chatbot fallback triggered:", err);
      }
    }

    // Resilient built-in bilingual fallback grounded in live siteContext
    const packagesText = packagesSummary
      .map((p) => {
        const title = lang === "ar" ? p.name_ar : p.name_en;
        const orig =
          catalog.offerSettings.enabled &&
          p.original_price &&
          p.original_price > p.price
            ? ` (بدلاً من ${p.original_price} ${currency})`
            : "";
        return `• ${title}: ${p.price} ${currency}${orig} — ${p.company_limit} ${
          lang === "ar" ? "شركة" : "companies"
        }`;
      })
      .join("\n");

    const offerLine =
      catalog.offerSettings.enabled && catalog.offerSettings.highlight_coupon_code
        ? lang === "ar"
          ? `✨ عرض محدود سارٍ الآن + استخدم كود الخصم (${catalog.offerSettings.highlight_coupon_code}) عند الدفع!`
          : `✨ Limited-time offer active now + use coupon code (${catalog.offerSettings.highlight_coupon_code}) at checkout!`
        : catalog.offerSettings.enabled
        ? lang === "ar"
          ? `✨ ${catalog.offerSettings.headline_ar}`
          : `✨ ${catalog.offerSettings.headline_en}`
        : "";

    const fallback = buildFallbackReply({
      message,
      lang,
      countryCode,
      currency,
      packagesText,
      offerLine,
      activeJobsCount: jobsMeta.totalActiveJobs,
    });

    return NextResponse.json({
      ...fallback,
      source: "fallback",
    } satisfies SupportChatResponse);
  } catch (error) {
    console.error("Support chat error:", error);
    return NextResponse.json(
      { error: "Support assistant unavailable right now." },
      { status: 500 }
    );
  }
}
