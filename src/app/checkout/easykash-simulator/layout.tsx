import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "بوابة الدفع الآمن | Secure Payment Checkout",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function CheckoutSimulatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
