"use client";

import { useState } from "react";
import type { TargetField } from "@/lib/datasource/fields";

type ColumnMapping = Record<string, string>;

interface PreviewResponse {
  headers: string[];
  fields: TargetField[];
  guessedMapping: ColumnMapping;
  previewRows: Record<string, string>[];
  rowCount: number;
}

interface ImportResult {
  imported: number;
  totalRows: number;
  errors: { ligne?: number; message: string }[];
}

const IGNORE = "";

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

export function ImportForm() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const [result, setResult] = useState<ImportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    setResult(null);
    setFileName(file.name);
    const base64 = arrayBufferToBase64(await file.arrayBuffer());
    setFileBase64(base64);
    setLoading(true);
    try {
      const res = await fetch("/api/import/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, fileBase64: base64 }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Impossible de lire ce fichier");
      }
      const data = (await res.json()) as PreviewResponse;
      setPreview(data);
      setMapping(data.guessedMapping);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inattendue");
      setPreview(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleImport() {
    if (!fileBase64 || !fileName) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName, fileBase64, mapping }),
      });
      const data = (await res.json()) as ImportResult;
      if (!res.ok) throw new Error((data as unknown as { error?: string }).error ?? "Échec de l'import");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inattendue");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setFileName(null);
    setFileBase64(null);
    setPreview(null);
    setMapping({});
    setResult(null);
    setError(null);
  }

  const missingRequired = preview?.fields.filter((f) => f.required && !mapping[f.key]) ?? [];

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <label className="block text-sm font-medium text-slate-700">Fichier Excel (.xlsx) ou CSV</label>
        <input
          type="file"
          accept=".xlsx,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
          className="mt-2 block w-full text-sm text-slate-600 file:mr-4 file:rounded-md file:border file:border-slate-300 file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-50"
        />
        {fileName && <p className="mt-2 text-xs text-slate-500">Fichier sélectionné : {fileName}</p>}
        <p className="mt-3 text-xs text-slate-500">
          Exemple de fichier :{" "}
          <a href="/sample-import.xlsx" download className="underline hover:text-slate-700">
            Excel
          </a>{" "}
          ·{" "}
          <a href="/sample-import.csv" download className="underline hover:text-slate-700">
            CSV
          </a>
        </p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {preview && !result && (
        <div className="space-y-6">
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="text-sm font-semibold text-slate-900">
              Mapping des colonnes <span className="font-normal text-slate-500">({preview.rowCount} ligne(s) détectée(s))</span>
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {preview.fields.map((field) => (
                <div key={field.key}>
                  <label className="block text-xs font-medium text-slate-600">
                    {field.label}
                    {field.required && <span className="text-red-600"> *</span>}
                  </label>
                  <select
                    value={mapping[field.key] ?? IGNORE}
                    onChange={(e) => setMapping((m) => ({ ...m, [field.key]: e.target.value }))}
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-slate-500 focus:outline-none"
                  >
                    <option value={IGNORE}>— Ignorer —</option>
                    {preview.headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900">Aperçu (5 premières lignes)</div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    {preview.headers.map((h) => (
                      <th key={h} className="px-3 py-2 text-left font-medium text-slate-600 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {preview.previewRows.map((row, i) => (
                    <tr key={i}>
                      {preview.headers.map((h) => (
                        <td key={h} className="px-3 py-2 whitespace-nowrap text-slate-700">
                          {row[h]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {missingRequired.length > 0 && (
            <p className="text-sm text-amber-700">
              Colonnes obligatoires non mappées : {missingRequired.map((f) => f.label).join(", ")}
            </p>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleImport}
              disabled={loading || missingRequired.length > 0}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {loading ? "Import en cours…" : "Importer les collaborateurs"}
            </button>
            <button onClick={reset} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Annuler
            </button>
          </div>
        </div>
      )}

      {result && (
        <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-6">
          <p className="text-sm font-medium text-slate-900">
            {result.imported} collaborateur(s) importé(s) sur {result.totalRows} ligne(s) lue(s).
          </p>
          {result.errors.length > 0 && (
            <div>
              <p className="text-sm font-medium text-red-700">Lignes ignorées ({result.errors.length}) :</p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-red-700">
                {result.errors.map((e, i) => (
                  <li key={i}>
                    {e.ligne ? `Ligne ${e.ligne} : ` : ""}
                    {e.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <button onClick={reset} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Importer un autre fichier
          </button>
        </div>
      )}
    </div>
  );
}
