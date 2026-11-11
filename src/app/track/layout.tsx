import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "تتبع حملتك المباشرة | Track Your CV Campaign",
  description:
    "أدخل رمز التتبع الخاص بك (ASR-XXXXXX) أو بريدك الإلكتروني لمتابعة إرسال سيرتك الذاتية إلى أقسام الموارد البشرية في الخليج لحظة بلحظة.",
  alternates: {
    canonical: "/track",
  },
};

export default function TrackLookupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
