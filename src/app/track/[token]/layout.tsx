import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "لوحة التتبع الحية للحملة | Live Campaign Portal",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function TrackTokenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
