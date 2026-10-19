export default function AboutPage() {
  return (
    <div
      id="about"
      className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-6 py-12"
    >
      <h1 className="text-3xl font-bold">Informazioni</h1>
      <p>
        Ho realizzato questo sito al fine di esercitarmi con Next.js e con il
        relativo deploy su Vercel.
      </p>
      <p>
        L&apos;idea mi è venuta quando avevo bisogno di calcolare un codice
        fiscale ed ho pensato: &quot;Perché devo mandare dei dati sensibili su
        un server chissà dove? Ed una volta che i dati sono giunti a
        destinazione, come vengono elaborati?&quot;
      </p>
      <p>
        Così mi sono detto: &quot;se vuoi una cosa fatta bene, fattela da
        solo&quot; ed ho fatto questo esercizio.
      </p>
      <div>
        <p>Il funzionamento è molto semplice:</p>
        <ol className="mt-2 list-decimal space-y-1 pl-6">
          <li>l&apos;utente compila la form</li>
          <li>una action lato server effettua il calcolo del codice fiscale</li>
          <li>
            se tutti i dati sono corretti restituisce codice fiscale elaborato;
            altrimenti errore.
          </li>
        </ol>
      </div>
      <p>
        I dati inseriti vengono inviati al server ed elaborati esclusivamente
        per calcolare il codice fiscale. L’applicazione non salva nella nel
        database né registra intenzionalmente i log.
      </p>
      <p>
        Gli unici dati persistenti in questo sistema sono la lista dei comuni e
        la lista degli Stati esteri. Queste liste vengono consultate per
        ottenere il codice alfanumerico di 4 cifre da associare al luogo di
        nascita.
      </p>
      <p>
        Inoltre, il codice sorgente è consulabile al link{" "}
        <a
          href="https://github.com/CiccioTecchio/MyFiscalCode"
          target="_blank"
          rel="noreferrer"
          className="text-blue-800 underline decoration-blue-500 underline-offset-4 transition-colors hover:text-blue-600"
          aria-label="Apri il repository MyFiscalCode su GitHub"
        >
          MyFiscalCode su GitHub
        </a>
        .
      </p>
    </div>
  );
}
