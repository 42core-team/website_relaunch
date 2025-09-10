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
          <p>Paul Mustermann<br />
          Musterstraße 111<br />
          Gebäude 44<br />
          90210 Musterstadt</p>
        </div>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Contact</h2>
        <div className="mb-6">
          <p>Phone: +49 (0) 123 44 55 66<br />
          Fax: +49 (0) 123 44 55 99<br />
          Email: mustermann@musterfirma.de</p>
        </div>
      </div>
    </div>
  );
}