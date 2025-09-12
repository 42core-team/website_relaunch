import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Impressum",
  description: "Impressum for CORE Game",
};

export default function ImpressumPage() {
  return (
    <div className="container mx-auto max-w-4xl px-8 py-12">
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <h1 className="text-4xl font-bold mb-8">Impressum</h1>

        <div className="mb-6">
          <p>
            Paul Großmann
            <br />
            Dammstraße 5/1
            <br />
            74076 Heilbronn
          </p>
        </div>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Contact</h2>
        <div className="mb-6">
          <p>
            Phone: +49 (0) 175 9954144
            <br />
            Email: core@paulgrossmann.de
          </p>
        </div>
      </div>
    </div>
  );
}
