"use client";

import { useEffect, useState } from "react";

/**
 * EPFL news widget for the dashboard.
 *
 * Fetches the latest news from the EPFL actu API (via the /api/epfl-news
 * proxy) and rotates through them as a full-bleed card: cover image, category,
 * title, subtitle and date. Fills its box, so it works at any grid size.
 *
 * Props (all optional, set from the admin "props" panel):
 *   - lang:     "fr" | "en" | "de"  (default "fr")
 *   - count:    number of news to cycle through   (default 6)
 *   - channel:  EPFL actu channel id to filter on  (default: all EPFL news)
 *   - interval: seconds between two news           (default 10)
 */
const STRINGS = {
  fr: { loading: "Chargement…", empty: "Aucune actualité" },
  en: { loading: "Loading…", empty: "No news" },
  de: { loading: "Laden…", empty: "Keine Nachrichten" },
};

function formatDate(iso, lang) {
  try {
    const locale = lang === "en" ? "en-GB" : lang === "de" ? "de-CH" : "fr-CH";
    return new Date(iso).toLocaleDateString(locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export default function EpflNews({ lang = "fr", count = 6, channel, interval = 10 }) {
  const [items, setItems] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const t = STRINGS[lang] || STRINGS.fr;
  const limit = Number(count) || 6;
  const rotateMs = (Number(interval) || 10) * 1000;

  // Load news on mount and refresh every 15 minutes.
  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const params = new URLSearchParams({ lang, limit: String(limit) });
        if (channel) params.set("channel", String(channel));
        const res = await fetch(`/api/epfl-news?${params.toString()}`);
        const data = await res.json();
        if (!active) return;
        setItems(Array.isArray(data.items) ? data.items : []);
        setIndex(0);
      } catch {
        if (active) setItems([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    const refresh = setInterval(load, 15 * 60 * 1000);
    return () => {
      active = false;
      clearInterval(refresh);
    };
  }, [lang, limit, channel]);

  // Rotate through the loaded news.
  useEffect(() => {
    if (items.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % items.length), rotateMs);
    return () => clearInterval(id);
  }, [items.length, rotateMs]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
        {t.loading}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
        {t.empty}
      </div>
    );
  }

  const news = items[index];

  return (
    <a
      href={news.url}
      target="_blank"
      rel="noopener noreferrer"
      className="relative block w-full h-full overflow-hidden text-white"
    >
      {news.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={news.image}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-neutral-800" />
      )}

      {/* Legibility gradient + EPFL red accent */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
      <div className="absolute top-0 left-0 h-full w-1.5 bg-[#FF0000]" />

      <div className="absolute inset-x-0 bottom-0 p-4 flex flex-col gap-1">
        {(news.category || news.channel) && (
          <span className="text-[0.7rem] uppercase tracking-wide font-semibold text-[#FF5555]">
            {news.category || news.channel}
          </span>
        )}
        <h3 className="font-bold leading-tight text-lg line-clamp-2">{news.title}</h3>
        {news.subtitle && (
          <p className="text-sm text-gray-200 line-clamp-2">{news.subtitle}</p>
        )}
        <div className="flex items-center justify-between mt-1 text-[0.7rem] text-gray-300">
          <span>{formatDate(news.date, lang)}</span>
          {items.length > 1 && (
            <span className="flex gap-1">
              {items.map((it, i) => (
                <span
                  key={it.id ?? i}
                  className={`w-1.5 h-1.5 rounded-full ${i === index ? "bg-white" : "bg-white/40"}`}
                />
              ))}
            </span>
          )}
        </div>
      </div>
    </a>
  );
}
