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
        fiscale e ho pensato &quot;Perché devo mandare i miei dati sensibili su
        un server chissà dove ed una volta arrivati i miei dati sul server
        chissà come vengono elaborati.&quot;
      </p>
      <p>
        Così mi sono detto &quot;se vuoi una cosa fatta bene, fattela da
        solo&quot; e quindi ho fatto questo esercizio.
      </p>
      <p>
        {" "}
        Il funzionamento è molto semplice, l&apos;utente compila la form, una
        action lato server effettua il calcolo del codice fiscale e se tutti i
        dati sono corretti lo restituisce all&apos;utente altrimenti errore.
      </p>
      <p>
        I dati inseriti vengono inviati al server ed elaborati esclusivamente
        per calcolare il codice fiscale. L’applicazione non li salva nel
        database né li registra intenzionalmente nei log.
      </p>
      <p>
        L&apos;unico dato persistente di questo sistema è la lista dei comuni
        italiani che uso per far l&apos;associazione luogo di nascita → codice
        del luogo di nascita.
      </p>
      <p>
        Inoltre, puoi consultare tutto il codice sorgente nel repository{" "}
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
