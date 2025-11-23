// Root layout - minimal wrapper that passes through to [locale]/layout.tsx
// All actual layout logic (theme, i18n) is handled in the locale layout

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
