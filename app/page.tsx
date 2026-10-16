import FiscalCodeForm from "./components/FiscalCodeForm";

export default function Home() {
  return (
    <div className="flex w-full flex-1 items-center justify-center overflow-hidden px-4">
      <main className="flex flex-col items-center gap-8">
        <h1 className="text-4xl font-bold">Calcola il tuo codice fiscale</h1>
        <FiscalCodeForm />
      </main>
    </div>
  );
}
