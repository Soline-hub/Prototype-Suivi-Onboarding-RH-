import { ImportForm } from "@/components/ImportForm";

export default function ImportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Import de collaborateurs</h1>
        <p className="mt-1 text-sm text-slate-500">
          Importez un fichier CSV depuis Boond ou tout autre export RH. Les 4 points de suivi (S+1, M+2, M+4, M+6)
          sont générés automatiquement pour chaque collaborateur importé.
        </p>
      </div>
      <ImportForm />
    </div>
  );
}
