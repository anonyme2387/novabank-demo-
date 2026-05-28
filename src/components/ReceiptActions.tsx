"use client";

export function ReceiptActions({ filename = "recu-novabank.txt" }: { filename?: string }) {
  function download() {
    const blob = new Blob([document.body.innerText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <button onClick={() => window.print()} className="rounded-lg bg-night px-5 py-3 font-black text-white">Imprimer</button>
      <button onClick={download} className="rounded-lg bg-mist px-5 py-3 font-black text-night">Télécharger</button>
    </>
  );
}
