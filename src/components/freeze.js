"use client";
import { useState, useEffect } from "react";

function datediff(first, second) {
  return Math.round((second - first) / (1000 * 60 * 60 * 24));
}

function normalize(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isInFreeze(today, period) {
  const start = normalize(new Date(period.start));
  const end = normalize(new Date(period.end));
  const now = normalize(today);
  return now >= start && now <= end;
}

function getNextFreezes(today, freezes) {
  const now = normalize(today);
  return freezes
    .filter(period => normalize(new Date(period.start)) > now)
    .sort((a, b) => new Date(a.start) - new Date(b.start));
}

export default function NextFreeze() {
  const [currentFreeze, setCurrentFreeze] = useState(null);
  const [nextFreeze, setNextFreeze] = useState(null);
  const [nextNextFreeze, setNextNextFreeze] = useState(null);
  const [daysUntilNextFreeze, setDaysUntilNextFreeze] = useState(null);

  useEffect(() => {
    const today = new Date();

    fetch('/freezeDates.json')
      .then(res => res.json())
      .then(data => {
        const current = data.find(period => isInFreeze(today, period)) || null;
        const upcomingFreezes = getNextFreezes(today, data); // fix ici

        const next = upcomingFreezes[0] || null;
        const nextNext = upcomingFreezes[1] || null;

        setCurrentFreeze(current);
        setNextFreeze(next);
        setNextNextFreeze(nextNext);

        if (next) {
          const startDate = normalize(new Date(next.start));
          const days = datediff(normalize(today), startDate);
          setDaysUntilNextFreeze(days);
        } else {
          setDaysUntilNextFreeze(null);
        }
      })
      .catch(err => console.error('Erreur chargement freezeDates.json:', err));
  }, []);

  return (
    <div
      className="flex flex-col justify-center items-start w-full h-full p-2 text-gray-300"
      style={{
        fontFamily: 'Arial, sans-serif',
        fontSize: '1rem',
        gap: '0.5rem',
        overflow: 'hidden',
        textAlign: 'left',
      }}
    >
      {currentFreeze && (
        <div className="w-full">
          <p className="text-lg font-bold m-0">En Freeze</p>
          <p className="text-sm m-0">
            jusqu’au <strong>{new Date(currentFreeze.end).toLocaleDateString('fr-CH')}</strong>
          </p>
          <p className="text-xs m-0 text-gray-400">{currentFreeze.description}</p>
        </div>
      )}

      {(nextFreeze || nextNextFreeze) && (
        <div className="w-full">
          {nextFreeze && (
            <>
              {currentFreeze ? (
                <p className="text-sm">
                  Prochain freeze :
                  <br />
                  <strong className="inline-block mt-2">
                    {new Date(nextFreeze.start).toLocaleDateString('fr-CH')}
                  </strong>{' '}
                  au{' '}
                  <strong>{new Date(nextFreeze.end).toLocaleDateString('fr-CH')}</strong>
                </p>
              ) : (
                <>
                  <p className="text-base mb-2">
                    Prochain freeze dans{' '}
                    <strong className="text-lg">{daysUntilNextFreeze}</strong>{' '}
                    jour{daysUntilNextFreeze > 1 ? 's' : ''}
                  </p>
                  <p className="text-sm m-0">
                    <strong>{new Date(nextFreeze.start).toLocaleDateString('fr-CH')}</strong> au{' '}
                    <strong>{new Date(nextFreeze.end).toLocaleDateString('fr-CH')}</strong>
                  </p>
                </>
              )}
              {nextFreeze.description && (
                <p className="italic text-gray-400 text-xs">{nextFreeze.description}</p>
              )}
            </>
          )}

          {nextNextFreeze && (
            <div>
              <p className="text-sm m-0">
                <span className="font-bold inline-block my-1">
                  {nextFreeze ? 'Et' : 'Prochain freeze'}
                </span>
                <br />
                <strong>{new Date(nextNextFreeze.start).toLocaleDateString('fr-CH')}</strong> au{' '}
                <strong>{new Date(nextNextFreeze.end).toLocaleDateString('fr-CH')}</strong>
                <br />
                <span className="text-xs text-gray-400">{nextNextFreeze.description}</span>
              </p>
            </div>
          )}
        </div>
      )}

      {!currentFreeze && !nextFreeze && !nextNextFreeze && (
        <p className="text-sm text-center w-full">Aucun freeze prévu prochainement.</p>
      )}
    </div>
  );
}
