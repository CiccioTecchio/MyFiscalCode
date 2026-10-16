import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Informativa privacy | My Fiscal Code",
  description: "Informazioni sul trattamento dei dati personali.",
};

const controllerName =
  process.env.PRIVACY_CONTROLLER_NAME ?? "Gestore di My Fiscal Code";
const contactEmail = process.env.PRIVACY_CONTACT_EMAIL;

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12 text-slate-900">
      <h1 className="mb-2 text-3xl font-bold">Informativa privacy</h1>
      <p className="mb-8 text-sm text-slate-700">
        Ultimo aggiornamento: 16 ottobre 2026
      </p>

      <div className="space-y-8 leading-7">
        <section>
          <h2 className="mb-2 text-xl font-semibold">Titolare del trattamento</h2>
          <p>{controllerName}</p>
          {contactEmail ? (
            <p>
              Contatto: {" "}
              <a className="underline" href={`mailto:${contactEmail}`}>
                {contactEmail}
              </a>
            </p>
          ) : (
            <p className="mt-2 rounded-md bg-amber-100 px-3 py-2 text-sm text-amber-950">
              Prima della pubblicazione configura un indirizzo di contatto con
              la variabile <code>PRIVACY_CONTACT_EMAIL</code>.
            </p>
          )}
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold">Dati trattati</h2>
          <p>
            Per calcolare il codice fiscale, l&apos;applicazione tratta nome,
            cognome, data di nascita, sesso e luogo di nascita. Durante la
            navigazione il fornitore dell&apos;infrastruttura può inoltre trattare
            dati tecnici, come indirizzo IP, user agent e informazioni sulla
            richiesta.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold">
            Finalità e base giuridica
          </h2>
          <p>
            I dati inseriti nel form vengono utilizzati esclusivamente per
            calcolare e restituire il codice fiscale richiesto. Il trattamento
            è necessario per fornire il servizio richiesto dall&apos;utente. Gli
            eventuali dati tecnici sono trattati per erogare e proteggere il
            sito.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold">
            Modalità e conservazione
          </h2>
          <p>
            Il calcolo avviene sul server. L&apos;applicazione non salva nel
            database i dati inseriti nel form e non li registra intenzionalmente
            nei log. I dati restano in memoria per il tempo necessario a
            elaborare la richiesta. I fornitori tecnici possono conservare log
            secondo le proprie configurazioni e politiche di conservazione.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold">
            Destinatari e fornitori
          </h2>
          <p>
            Il sito è ospitato su Vercel. La ricerca del codice catastale viene
            effettuata nel database MongoDB configurato dal titolare. Questi
            fornitori possono trattare i dati tecnici necessari a erogare i
            rispettivi servizi. Eventuali trasferimenti fuori dallo Spazio
            economico europeo avvengono secondo le garanzie previste dai
            fornitori e dalla normativa applicabile.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold">
            Cookie e strumenti di tracciamento
          </h2>
          <p>
            Il codice dell&apos;applicazione non utilizza cookie di profilazione,
            pubblicità comportamentale o strumenti di analytics. Se in futuro
            verranno introdotti strumenti non tecnici, questa informativa e le
            modalità di raccolta del consenso saranno aggiornate prima della
            loro attivazione.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold">Diritti dell&apos;utente</h2>
          <p>
            Nei casi previsti dalla normativa, l&apos;utente può chiedere accesso,
            rettifica, cancellazione, limitazione o opposizione al trattamento
            dei propri dati. Può inoltre proporre reclamo al {" "}
            <a
              className="underline"
              href="https://www.garanteprivacy.it/"
              rel="noreferrer"
              target="_blank"
            >
              Garante per la protezione dei dati personali
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold">
            Conferimento dei dati
          </h2>
          <p>
            Il conferimento dei dati richiesti dal form è facoltativo, ma senza
            tali informazioni non è possibile calcolare il codice fiscale.
          </p>
        </section>
      </div>
    </main>
  );
}
