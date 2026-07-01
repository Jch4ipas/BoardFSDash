import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import './globals.css';

// Suisse Intl — official EPFL brand typeface (https://github.com/epfl-si/next-starterkit).
// Loaded locally to match the EPFL visual identity; Geist is kept as a mono fallback.
const suisse = localFont({
  src: [
    { path: "../fonts/SuisseIntl-Regular-WebS.woff2", weight: "400", style: "normal" },
    { path: "../fonts/SuisseIntl-SemiBold-WebS.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-suisse",
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "BoardFSDash — EPFL FSD",
  description: "Tableau de bord modulaire pour l'équipe FSD de l'EPFL. Gestion de conteneurs, widgets Grafana et affichage temps réel.",
  icons: {
    icon: "https://web2018.epfl.ch/5.1.0/icons/favicon.ico",
    apple: "https://web2018.epfl.ch/5.1.0/icons/apple-touch-icon.png",
  },
  openGraph: {
    title: "BoardFSDash — EPFL FSD",
    description: "Tableau de bord modulaire pour l'équipe FSD de l'EPFL.",
    siteName: "BoardFSDash",
    locale: "fr_CH",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${suisse.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
