import FiscalCodeForm from "./components/FiscalCodeForm";

export default function Home() {
  return (
    <div className="flex w-full flex-1 items-start justify-center px-4 py-6 sm:items-center sm:px-6 sm:py-8">
      <main className="flex w-full max-w-4xl flex-col items-center gap-5 sm:gap-8">
        <h1 className="text-center text-3xl leading-tight font-bold sm:text-4xl">
          Calcola il tuo codice fiscale
        </h1>
        <FiscalCodeForm />
      </main>
    </div>
  );
}
