"use client";

import { ChangeEvent, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Database,
  FileSpreadsheet,
  FileUp,
  PackageCheck,
  Route,
  TableProperties,
  UploadCloud,
} from "lucide-react";
import { Sidebar } from "@/components/dashboard/sidebar";

type ImportKind = "deliveries" | "routes";
type ImportFileState = Record<ImportKind, File | null>;

const previewRows = {
  deliveries: [
    ["Numer zamówienia", "Klient", "Adres", "Towar", "Ilość", "Status"],
    ["KD/2026/001", "Nazwa klienta", "London, SW1A", "Palety mix", "12", "NEW"],
    ["KD/2026/002", "Nazwa klienta", "Manchester", "Kartony", "34", "NEW"],
  ],
  routes: [
    ["Trasa", "Data", "Kierowca", "Pojazd", "Kolejność", "Dostawa"],
    ["TR/2026/001", "2026-06-23", "Jan Kierowca", "WX12 ABC", "1", "KD/2026/001"],
    ["TR/2026/001", "2026-06-23", "Jan Kierowca", "WX12 ABC", "2", "KD/2026/002"],
  ],
} satisfies Record<ImportKind, string[][]>;

const importSections = [
  {
    kind: "deliveries" as const,
    title: "Import „Export Dostawy”",
    eyebrow: "Źródło zamówień",
    description:
      "Plik Export Dostawy będzie docelowo tworzył rekordy Order i pozostawi ręczne dodawanie zamówień jako opcję pomocniczą.",
    icon: PackageCheck,
    accent: "text-sky-300",
    glow: "bg-sky-400/10",
    imports: ["Order.orderNumber", "dane klienta i adres", "towar, ilość, palety, waga", "status początkowy NEW"],
  },
  {
    kind: "routes" as const,
    title: "Import „Trasówka”",
    eyebrow: "Źródło tras i dostaw",
    description:
      "Plik Trasówka będzie docelowo tworzył Route oraz powiązane Delivery na podstawie kolejności punktów i przypisania do kierowcy.",
    icon: Route,
    accent: "text-amber-300",
    glow: "bg-amber-400/10",
    imports: ["Route.routeNumber", "planowana data i kierowca", "Delivery.deliveryNumber", "kolejność dostaw w trasie"],
  },
];

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

export default function DispatcherImportPage() {
  const [files, setFiles] = useState<ImportFileState>({ deliveries: null, routes: null });
  const [checked, setChecked] = useState<Record<ImportKind, boolean>>({ deliveries: false, routes: false });

  const selectedCount = useMemo(
    () => Object.values(files).filter(Boolean).length,
    [files],
  );

  function updateFile(kind: ImportKind, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setFiles((current) => ({ ...current, [kind]: file }));
    setChecked((current) => ({ ...current, [kind]: false }));
  }

  function checkFile(kind: ImportKind) {
    if (!files[kind]) return;
    setChecked((current) => ({ ...current, [kind]: true }));
  }

  return (
    <main className="min-h-screen bg-[#020813] text-slate-100">
      <div className="flex min-h-screen">
        <Sidebar />

        <section className="flex-1 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.14),transparent_34%),linear-gradient(180deg,#061123_0%,#020813_44%,#020813_100%)]">
          <header className="border-b border-white/10 bg-[#020813]/90 px-4 py-5 shadow-2xl shadow-black/20 backdrop-blur sm:px-6 lg:px-9">
            <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-300">
                  Import danych
                </p>
                <h1 className="mt-2 text-2xl font-black text-white sm:text-3xl">
                  Import z plików Excel dla dyspozytora
                </h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                  Przygotowane miejsce pod profesjonalny import arkuszy „Export Dostawy” i „Trasówka”. Na tym etapie interfejs pozwala wybrać plik, sprawdzić go i zobaczyć docelowy zakres danych przed uruchomieniem właściwego parsera.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 shadow-xl shadow-black/20">
                <p className="text-3xl font-black text-white">{selectedCount}/2</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  wybrane pliki
                </p>
              </div>
            </div>
          </header>

          <div className="mx-auto w-full max-w-[1600px] space-y-6 px-4 py-5 sm:px-6 lg:p-8">
            <section className="grid gap-5 lg:grid-cols-3">
              <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/20 backdrop-blur">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
                  <Database className="h-6 w-6" />
                </div>
                <h2 className="mt-4 text-lg font-black text-white">Docelowy zapis do bazy</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  „Export Dostawy” zasili zamówienia, a „Trasówka” utworzy trasy oraz dostawy powiązane z zamówieniami.
                </p>
              </article>

              <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/20 backdrop-blur">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-400/10 text-amber-300">
                  <FileSpreadsheet className="h-6 w-6" />
                </div>
                <h2 className="mt-4 text-lg font-black text-white">Format arkuszy</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Interfejs akceptuje pliki arkuszy kalkulacyjnych. Pełne mapowanie kolumn zostanie podłączone w kolejnym kroku.
                </p>
              </article>

              <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/20 backdrop-blur">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-sky-400/20 bg-sky-400/10 text-sky-300">
                  <TableProperties className="h-6 w-6" />
                </div>
                <h2 className="mt-4 text-lg font-black text-white">Ręczne dodawanie zostaje</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Formularze ręcznego dodawania zamówień i tras nadal są opcją pomocniczą dla pojedynczych korekt.
                </p>
              </article>
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
              {importSections.map((section) => {
                const Icon = section.icon;
                const file = files[section.kind];
                const isChecked = checked[section.kind];

                return (
                  <article key={section.kind} className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/20 backdrop-blur sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
                          {section.eyebrow}
                        </p>
                        <h2 className="mt-2 text-2xl font-black text-white">{section.title}</h2>
                        <p className="mt-2 text-sm leading-6 text-slate-400">{section.description}</p>
                      </div>

                      <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 ${section.glow}`}>
                        <Icon className={`h-7 w-7 ${section.accent}`} />
                      </span>
                    </div>

                    <div className="mt-6 rounded-2xl border border-dashed border-white/15 bg-[#020813]/70 p-5 text-center">
                      <input
                        id={`${section.kind}-file`}
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={(event) => updateFile(section.kind, event)}
                        className="sr-only"
                      />
                      <label htmlFor={`${section.kind}-file`} className="mx-auto flex max-w-md cursor-pointer flex-col items-center rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-8 transition hover:border-amber-400/40 hover:bg-amber-400/10">
                        <UploadCloud className="h-10 w-10 text-amber-300" />
                        <span className="mt-3 text-sm font-black text-white">
                          {file ? file.name : "Wybierz plik Excel lub CSV"}
                        </span>
                        <span className="mt-1 text-xs text-slate-500">
                          {file ? formatFileSize(file.size) : "Obsługiwane rozszerzenia: .xlsx, .xls, .csv"}
                        </span>
                      </label>
                    </div>

                    <div className="mt-5 grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
                      <div className="rounded-2xl border border-white/10 bg-[#020813]/60 p-4">
                        <h3 className="text-sm font-black text-white">Dane importowane docelowo</h3>
                        <ul className="mt-3 space-y-2 text-sm text-slate-400">
                          {section.imports.map((item) => (
                            <li key={item} className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-[#020813]/60 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="text-sm font-black text-white">Podgląd danych</h3>
                          {isChecked && (
                            <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-200">
                              Plik sprawdzony
                            </span>
                          )}
                        </div>

                        {file ? (
                          <div className="mt-3 overflow-x-auto">
                            <table className="w-full min-w-[460px] text-left text-xs text-slate-300">
                              <tbody className="divide-y divide-white/10">
                                {previewRows[section.kind].map((row, index) => (
                                  <tr key={`${section.kind}-${index}`} className={index === 0 ? "text-slate-500" : "text-slate-300"}>
                                    {row.map((cell) => (
                                      <td key={cell} className="py-2 pr-3 font-semibold">
                                        {cell}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="mt-3 flex min-h-32 flex-col items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] px-4 py-8 text-center">
                            <AlertCircle className="h-8 w-8 text-slate-500" />
                            <p className="mt-3 text-sm font-semibold text-slate-400">Nie wybrano pliku.</p>
                            <p className="mt-1 text-xs text-slate-500">Po wyborze pliku pojawi się tu podgląd pierwszych wierszy.</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
                      <button
                        type="button"
                        disabled={!file}
                        onClick={() => checkFile(section.kind)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-400/20 bg-amber-400/10 px-5 py-3 text-sm font-black text-amber-200 transition hover:border-amber-300/40 hover:bg-amber-400/15 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <FileUp className="h-4 w-4" />
                        Sprawdź plik
                      </button>
                      <button
                        type="button"
                        disabled={!file || !isChecked}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-sm font-black text-slate-950 shadow-lg shadow-amber-400/10 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <UploadCloud className="h-4 w-4" />
                        Importuj dane
                      </button>
                    </div>
                  </article>
                );
              })}
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
