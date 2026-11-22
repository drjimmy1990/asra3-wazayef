"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { SupportLeadTopic } from "@/lib/types";
import {
  CheckCircle2,
  Headphones,
  Loader2,
  MessageCircle,
  Send,
  Sparkles,
  UserCheck,
  X,
} from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  suggestedActions?: string[];
}

const STORAGE_KEY = "asra3_support_chat_v1";

function getOrCreateSessionId(): string {
  try {
    const existing = sessionStorage.getItem("asra3_chat_sid");
    if (existing) return existing;
    const sid = `chat-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
    sessionStorage.setItem("asra3_chat_sid", sid);
    return sid;
  } catch {
    return `chat-${Date.now().toString(36)}`;
  }
}

export function SupportChatWidget() {
  const pathname = usePathname();
  const { lang, selectedCountryCode } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  // Lead / Contact Collection Drawer state
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadTopic, setLeadTopic] = useState<SupportLeadTopic>("general");
  const [leadMessage, setLeadMessage] = useState("");
  const [submittingLead, setSubmittingLead] = useState(false);
  const [leadFeedback, setLeadFeedback] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);

  const listEndRef = useRef<HTMLDivElement | null>(null);
  const sessionIdRef = useRef<string>("web-session");
  const [wizardInView, setWizardInView] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setWizardInView(document.body.dataset.wizardInView === "true");
    const onWizardVis = (e: Event) => {
      const detail = (e as CustomEvent<{ inView?: boolean }>).detail;
      setWizardInView(Boolean(detail?.inView));
    };
    window.addEventListener("asra3:wizard-visibility", onWizardVis);
    return () =>
      window.removeEventListener("asra3:wizard-visibility", onWizardVis);
  }, []);

  // Hide floating chat on Admin Dashboard
  const isAdminRoute = pathname?.startsWith("/admin");
  // Lift floating chat button above the 64px mobile sticky bottom CTA bar on landing pages
  const hasMobileStickyBar =
    pathname === "/" ||
    pathname === "/en" ||
    /^\/(ae|sa|qa|kw)\/?$/i.test(pathname || "");

  useEffect(() => {
    if (isAdminRoute) return;
    sessionIdRef.current = getOrCreateSessionId();
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as ChatMessage[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      }
    } catch {
      // Ignore storage failures
    }
  }, [isAdminRoute]);

  useEffect(() => {
    if (messages.length > 0) {
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-24)));
      } catch {
        // Ignore
      }
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      listEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, showLeadForm]);

  if (isAdminRoute) return null;

  const welcomeMessage: ChatMessage = {
    id: "welcome",
    role: "assistant",
    content:
      lang === "ar"
        ? "أهلاً بك في دعم أسرع (Asra3.com)! 👋\nاسألني عن الأسعار والعروض الحالية، طريقة توزيع سيرتك الذاتية، أو اترك بياناتك ليتواصل معك فريقنا مباشرة."
        : "Welcome to Asra3.com Support! 👋\nAsk me about live GCC pricing, active offers, how CV distribution works, or leave your contact details for our team.",
    suggestedActions:
      lang === "ar"
        ? [
            "ما هي الأسعار والعروض الحالية؟",
            "كيف تعمل منصة أسرع؟",
            "كيف أستثني شركتي الحالية؟",
            "أريد التواصل مع الدعم",
          ]
        : [
            "What are the current prices & offers?",
            "How does Asra3 work?",
            "Can I exclude my current employer?",
            "Contact Human Support",
          ],
  };

  const renderedMessages =
    messages.length > 0 ? messages : [welcomeMessage];

  const sendMessage = async (textOverride?: string) => {
    const text = (textOverride ?? input).trim();
    if (!text || sending) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text,
    };

    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    if (!textOverride) setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          message: text,
          history: nextHistory.slice(-8).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          lang,
          countryCode: selectedCountryCode,
          pageUrl: pathname || "/",
        }),
      });

      const data = await res.json();
      const replyContent =
        data?.reply ||
        (lang === "ar"
          ? "حدث خطأ بسيط في الاتصال، يمكنك ترك بياناتك بالأسفل وسيتواصل معك فريقنا فوراً."
          : "Connection hiccup — please leave your details below and our support team will reach out.");

      const botMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: replyContent,
        suggestedActions: Array.isArray(data?.suggestedActions)
          ? data.suggestedActions
          : undefined,
      };
      setMessages((prev) => [...prev, botMsg]);

      if (data?.showLeadForm) {
        setShowLeadForm(true);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content:
            lang === "ar"
              ? "تعذّر الوصول للمساعد حالياً. يمكنك ترك رقم الواتساب أو بريدك عبر زر التواصل وسنرد عليك فوراً."
              : "Assistant is temporarily busy. Please leave your WhatsApp or email using the contact form and we'll reply right away.",
        },
      ]);
      setShowLeadForm(true);
    } finally {
      setSending(false);
    }
  };

  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setLeadFeedback(null);
    setSubmittingLead(true);
    try {
      const res = await fetch("/api/support/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionIdRef.current,
          name: leadName,
          email: leadEmail,
          phone: leadPhone,
          country_code: selectedCountryCode,
          topic: leadTopic,
          message: leadMessage,
          page_url: pathname || "/",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLeadFeedback({
          ok: false,
          text:
            data?.error ||
            (lang === "ar"
              ? "يرجى إدخال الاسم ورقم واتساب أو بريد إلكتروني صحيح."
              : "Please enter your name and valid email or WhatsApp number."),
        });
      } else {
        setLeadFeedback({
          ok: true,
          text:
            lang === "ar"
              ? "تم استلام طلبك بنجاح! سيتواصل معك فريق أسرع في أقرب وقت."
              : "Request received! Our Asra3 support desk will contact you shortly.",
        });
        setMessages((prev) => [
          ...prev,
          {
            id: `lead-ok-${Date.now()}`,
            role: "assistant",
            content:
              lang === "ar"
                ? `شكراً يا ${leadName.trim()}! تم تسجيل بيانات تواصلك بنجاح وسيقوم فريق دعم أسرع بالرد عليك قريباً. ✓`
                : `Thank you ${leadName.trim()}! Your details have been logged and our Asra3 support team will reach out shortly. ✓`,
          },
        ]);
        setLeadName("");
        setLeadEmail("");
        setLeadPhone("");
        setLeadMessage("");
        setTimeout(() => {
          setShowLeadForm(false);
          setLeadFeedback(null);
        }, 1800);
      }
    } catch {
      setLeadFeedback({
        ok: false,
        text:
          lang === "ar"
            ? "تعذّر إرسال البيانات، حاول مرة أخرى."
            : "Could not submit right now, please retry.",
      });
    } finally {
      setSubmittingLead(false);
    }
  };

  return (
    <div
      dir={lang === "ar" ? "rtl" : "ltr"}
      className={`fixed z-50 flex flex-col items-end gap-3 ${
        hasMobileStickyBar
          ? "bottom-20 end-3 sm:bottom-6 sm:end-6"
          : "bottom-4 end-4 sm:bottom-6 sm:end-6"
      }`}
    >
      {/* Expanded Support Chat Window */}
      {isOpen && (
        <div className="w-[calc(100vw-2rem)] sm:w-[390px] max-h-[78vh] flex flex-col rounded-2xl border-2 border-[#D4AF37]/70 bg-white dark:bg-[#111114] text-zinc-950 dark:text-zinc-50 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-[#09090B] px-4 py-3.5 text-white flex items-center justify-between gap-2 border-b border-zinc-800">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#18181B] border border-[#D4AF37]/70 text-[#D4AF37]">
                <Headphones className="h-4 w-4" />
                <span className="absolute -top-0.5 -end-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#09090B]" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-extrabold truncate flex items-center gap-1.5">
                  <span>
                    {lang === "ar" ? "دعم أسرع الذكي" : "Asra3 Live Support"}
                  </span>
                  <Sparkles className="h-3 w-3 text-[#D4AF37]" />
                </p>
                <p className="text-[11px] text-zinc-400 truncate">
                  {lang === "ar"
                    ? "أسعار، عروض، وظائف، وتواصل مباشر"
                    : "Pricing, offers, jobs & human callback"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setShowLeadForm((v) => !v)}
                title={
                  lang === "ar" ? "اترك بياناتك للتواصل" : "Leave contact info"
                }
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition-colors cursor-pointer ${
                  showLeadForm
                    ? "bg-[#D4AF37] text-[#09090B]"
                    : "bg-zinc-900 border border-zinc-700 text-zinc-200 hover:border-[#D4AF37]"
                }`}
              >
                <UserCheck className="h-3.5 w-3.5" />
                <span>{lang === "ar" ? "تواصل معنا" : "Contact"}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close support chat"
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Embedded Contact / Lead Capture Form */}
          {showLeadForm ? (
            <form
              onSubmit={handleSubmitLead}
              className="p-4 space-y-3 overflow-y-auto bg-zinc-50 dark:bg-[#0D0D10]"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-extrabold text-zinc-900 dark:text-[#D4AF37]">
                  {lang === "ar"
                    ? "اترك بياناتك وسيتواصل معك فريق أسرع:"
                    : "Leave your details for our support team:"}
                </p>
                <button
                  type="button"
                  onClick={() => setShowLeadForm(false)}
                  className="text-[11px] font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
                >
                  {lang === "ar" ? "عودة للمحادثة" : "Back to Chat"}
                </button>
              </div>

              <input
                type="text"
                required
                value={leadName}
                onChange={(e) => setLeadName(e.target.value)}
                placeholder={lang === "ar" ? "الاسم الكامل *" : "Full Name *"}
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#141418] px-3 py-2 text-base sm:text-xs font-medium text-zinc-950 dark:text-zinc-100 focus:border-[#D4AF37] focus:outline-none"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="tel"
                  dir="ltr"
                  value={leadPhone}
                  onChange={(e) => setLeadPhone(e.target.value)}
                  placeholder={
                    lang === "ar" ? "رقم واتساب / هاتف" : "WhatsApp / Phone"
                  }
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#141418] px-3 py-2 text-base sm:text-xs font-medium text-zinc-950 dark:text-zinc-100 focus:border-[#D4AF37] focus:outline-none"
                />
                <input
                  type="email"
                  dir="ltr"
                  value={leadEmail}
                  onChange={(e) => setLeadEmail(e.target.value)}
                  placeholder={
                    lang === "ar" ? "البريد الإلكتروني" : "Email Address"
                  }
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#141418] px-3 py-2 text-base sm:text-xs font-medium text-zinc-950 dark:text-zinc-100 focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <select
                value={leadTopic}
                onChange={(e) =>
                  setLeadTopic(e.target.value as SupportLeadTopic)
                }
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#141418] px-3 py-2 text-base sm:text-xs font-semibold text-zinc-950 dark:text-zinc-100 focus:border-[#D4AF37] focus:outline-none"
              >
                <option value="pricing">
                  {lang === "ar" ? "استفسار عن الباقات والخصومات" : "Pricing & Discounts"}
                </option>
                <option value="campaign_help">
                  {lang === "ar" ? "متابعة حملة توزيع نشطة" : "Active Campaign Support"}
                </option>
                <option value="payment">
                  {lang === "ar" ? "مساعدة في الدفع عبر EasyKash" : "EasyKash Payment Help"}
                </option>
                <option value="employer_hr">
                  {lang === "ar" ? "شركة / نشر وظائف (HR)" : "Employer / HR Job Posting"}
                </option>
                <option value="general">
                  {lang === "ar" ? "استفسار عام" : "General Inquiry"}
                </option>
              </select>

              <textarea
                rows={3}
                required
                value={leadMessage}
                onChange={(e) => setLeadMessage(e.target.value)}
                placeholder={
                  lang === "ar"
                    ? "اكتب استفسارك باختصار... *"
                    : "How can our team help you? *"
                }
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#141418] px-3 py-2 text-base sm:text-xs font-medium text-zinc-950 dark:text-zinc-100 focus:border-[#D4AF37] focus:outline-none resize-none"
              />

              {leadFeedback && (
                <p
                  className={`text-xs font-bold flex items-center gap-1.5 ${
                    leadFeedback.ok
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {leadFeedback.ok && <CheckCircle2 className="h-3.5 w-3.5" />}
                  <span>{leadFeedback.text}</span>
                </p>
              )}

              <button
                type="submit"
                disabled={submittingLead}
                className="btn-gold w-full rounded-xl py-2.5 text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {submittingLead ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                <span>
                  {lang === "ar" ? "إرسال طلب التواصل" : "Send Contact Request"}
                </span>
              </button>
            </form>
          ) : (
            <>
              {/* Messages Thread */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-50 dark:bg-[#0D0D10] min-h-[260px]">
                {renderedMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.role === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`max-w-[86%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-line ${
                        msg.role === "user"
                          ? "bg-[#09090B] text-white dark:bg-[#D4AF37] dark:text-[#09090B] font-semibold"
                          : "bg-white dark:bg-[#18181D] border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-100"
                      }`}
                    >
                      {msg.content}
                    </div>

                    {msg.role === "assistant" &&
                      msg.suggestedActions &&
                      msg.suggestedActions.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5 max-w-[95%]">
                          {msg.suggestedActions.map((chip) => (
                            <button
                              key={chip}
                              type="button"
                              disabled={sending}
                              onClick={() => {
                                if (
                                  /(تواصل مع الدعم|Contact Human Support)/i.test(
                                    chip
                                  )
                                ) {
                                  setShowLeadForm(true);
                                } else {
                                  void sendMessage(chip);
                                }
                              }}
                              className="rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#141418] px-2.5 py-1 text-[11px] font-bold text-zinc-700 dark:text-zinc-200 hover:border-[#D4AF37] hover:text-zinc-950 dark:hover:text-[#D4AF37] transition-colors cursor-pointer"
                            >
                              {chip}
                            </button>
                          ))}
                        </div>
                      )}
                  </div>
                ))}

                {sending && (
                  <div className="flex items-start">
                    <div className="rounded-2xl bg-white dark:bg-[#18181D] border border-zinc-200 dark:border-zinc-800 px-3.5 py-2.5 text-xs text-zinc-500 flex items-center gap-2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-[#D4AF37]" />
                      <span>
                        {lang === "ar" ? "جارٍ الكتابة..." : "Typing..."}
                      </span>
                    </div>
                  </div>
                )}
                <div ref={listEndRef} />
              </div>

              {/* Composer */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void sendMessage();
                }}
                className="p-3 bg-white dark:bg-[#111114] border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    lang === "ar"
                      ? "اكتب سؤالك عن الأسعار أو الخدمة..."
                      : "Ask about pricing, offers, or jobs..."
                  }
                  className="flex-1 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-[#18181D] px-3.5 py-2.5 text-base sm:text-xs font-medium text-zinc-950 dark:text-zinc-100 focus:border-[#D4AF37] focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={sending || !input.trim()}
                  aria-label="Send message"
                  className="btn-gold rounded-xl p-2.5 shrink-0 cursor-pointer disabled:opacity-50 touch-manipulation"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </>
          )}
        </div>
      )}

      {/* Floating Support Launcher Button (compact circle when Wizard is in view on mobile) */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-label={lang === "ar" ? "فتح دعم أسرع" : "Open Asra3 Support"}
        className={`group relative inline-flex items-center justify-center gap-2.5 rounded-full bg-[#09090B] text-white border-2 border-[#D4AF37] shadow-xl hover:bg-zinc-900 transition-transform active:scale-95 cursor-pointer touch-manipulation ${
          wizardInView && !isOpen
            ? "h-11 w-11 p-0 sm:h-auto sm:w-auto sm:px-4 sm:py-3"
            : "px-4 py-3"
        }`}
      >
        <span className="relative flex h-6 w-6 items-center justify-center rounded-full bg-[#D4AF37] text-[#09090B]">
          {isOpen ? (
            <X className="h-3.5 w-3.5" />
          ) : (
            <MessageCircle className="h-3.5 w-3.5" />
          )}
          {!isOpen && (
            <span className="absolute -top-0.5 -end-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#09090B]" />
          )}
        </span>
        <span
          className={`text-xs font-extrabold tracking-tight ${
            wizardInView && !isOpen ? "hidden sm:inline" : "inline"
          }`}
        >
          {isOpen
            ? lang === "ar"
              ? "إغلاق الدعم"
              : "Close Support"
            : lang === "ar"
            ? "دعم أسرع • اسألنا"
            : "Asra3 Support"}
        </span>
      </button>
    </div>
  );
}
