"use client";

import { useState, useEffect } from "react";

/**
 * Self-contained Grafana dashboard picker.
 *
 * Layout: two columns side-by-side inside a fixed-height panel.
 *   Left  — list of configured Grafana instances; "+" expands an inline add-form.
 *   Right — dashboards auto-loaded when an instance is selected.
 *
 * @param {Function} onSelect - Called with (instanceId, dashboard) when the user picks a dashboard.
 */
export default function GrafanaPicker({ onSelect }) {
  const [instances, setInstances] = useState([]);
  const [selected, setSelected] = useState(null);   // currently highlighted instance
  const [dashboards, setDashboards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dashError, setDashError] = useState("");

  // Id of the instance waiting for delete confirmation, or null
  const [pendingDelete, setPendingDelete] = useState(null);

  // Add-form state
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [token, setToken] = useState("");
  const [addError, setAddError] = useState("");
  const [adding, setAdding] = useState(false);

  // Load instances once on mount
  useEffect(() => { fetchInstances(); }, []);

  // Auto-load dashboards whenever the selected instance changes
  useEffect(() => {
    if (!selected) return;
    fetchDashboards(selected.id);
  }, [selected]);

  async function fetchInstances() {
    const res = await fetch("/api/grafana-instances");
    if (!res.ok) return;
    const data = await res.json();
    setInstances(data);
    // Pre-select the first instance so the right panel is never empty
    if (data.length > 0 && !selected) setSelected(data[0]);
  }

  async function fetchDashboards(instanceId) {
    setLoading(true);
    setDashError("");
    setDashboards([]);
    const res = await fetch(`/api/grafana-instances/${instanceId}/dashboards`);
    if (res.ok) {
      setDashboards(await res.json());
    } else {
      const body = await res.json().catch(() => ({}));
      setDashError(body.error || "Erreur lors du chargement");
    }
    setLoading(false);
  }

  async function handleAdd() {
    if (!name.trim() || !url.trim() || !token.trim()) {
      setAddError("Tous les champs sont requis.");
      return;
    }
    setAdding(true);
    setAddError("");
    const res = await fetch("/api/grafana-instances", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), url: url.trim(), token: token.trim() }),
    });
    if (res.ok) {
      const inst = await res.json();
      setName(""); setUrl(""); setToken("");
      setShowForm(false);
      await fetchInstances();
      setSelected(inst);
    } else {
      const body = await res.json().catch(() => ({}));
      setAddError(body.error || "Erreur");
    }
    setAdding(false);
  }

  async function handleDelete(id) {
    await fetch(`/api/grafana-instances/${id}`, { method: "DELETE" });
    if (selected?.id === id) { setSelected(null); setDashboards([]); }
    setPendingDelete(null);
    await fetchInstances();
  }

  return (
    <div className="flex gap-3 h-80">
      {/* Left column — instances */}
      <div className="w-44 flex flex-col gap-1 overflow-y-auto shrink-0">
        {instances.map((inst) => (
          <div key={inst.id} className="flex items-center gap-1">
            {pendingDelete === inst.id ? (
              /* Confirmation row — replaces the instance button while pending */
              <div className="flex items-center gap-1 flex-1">
                <span className="text-xs text-error flex-1 truncate">Êtes-vous sûr ?</span>
                <button
                  className="btn btn-error btn-xs"
                  onClick={() => handleDelete(inst.id)}
                >
                  Oui
                </button>
                <button
                  className="btn btn-ghost btn-xs"
                  onClick={() => setPendingDelete(null)}
                >
                  Non
                </button>
              </div>
            ) : (
              <>
                <button
                  className={`btn btn-sm flex-1 justify-start truncate ${selected?.id === inst.id ? "btn-primary" : "btn-ghost"}`}
                  onClick={() => setSelected(inst)}
                >
                  {inst.name}
                </button>
                <button
                  className="btn btn-ghost btn-xs text-error"
                  aria-label="Supprimer"
                  onClick={(e) => { e.stopPropagation(); setPendingDelete(inst.id); }}
                >
                  ✕
                </button>
              </>
            )}
          </div>
        ))}

        {/* Add-instance button */}
        <button
          className="btn btn-outline btn-sm gap-1 mt-1"
          onClick={() => setShowForm((v) => !v)}
        >
          <span className="text-lg leading-none">+</span>
          Ajouter
        </button>

        {showForm && (
          <div className="flex flex-col gap-1 mt-1 p-2 bg-base-200 rounded-lg">
            <input
              className="input input-bordered input-xs w-full"
              placeholder="Nom"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="input input-bordered input-xs w-full"
              placeholder="URL Grafana"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <input
              className="input input-bordered input-xs w-full"
              type="password"
              placeholder="Token (glsa_...)"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
            {addError && <p className="text-error text-xs">{addError}</p>}
            <button
              className="btn btn-primary btn-xs w-full"
              onClick={handleAdd}
              disabled={adding}
            >
              {adding ? "..." : "Confirmer"}
            </button>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="w-px bg-base-300 shrink-0" />

      {/* Right column — dashboards */}
      <div className="flex-1 overflow-y-auto">
        {!selected && (
          <p className="text-sm text-gray-400 mt-2">Sélectionnez une instance à gauche.</p>
        )}
        {selected && loading && (
          <p className="text-sm text-gray-400 mt-2">Chargement...</p>
        )}
        {selected && dashError && (
          <p className="text-error text-sm mt-2">{dashError}</p>
        )}
        {dashboards.map((d) => (
          <button
            key={d.uid}
            className="btn btn-ghost btn-sm w-full justify-start truncate"
            onClick={() => onSelect(selected.id, d)}
          >
            {d.title}
          </button>
        ))}
        {selected && !loading && !dashError && dashboards.length === 0 && (
          <p className="text-sm text-gray-400 mt-2">Aucun dashboard trouvé.</p>
        )}
      </div>
    </div>
  );
}
