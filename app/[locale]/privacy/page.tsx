import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

const contactEmail = process.env.PRIVACY_CONTACT_EMAIL;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("PrivacyPage.metadata");

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function PrivacyPage() {
  const t = await getTranslations("PrivacyPage");
  const controllerName =
    process.env.PRIVACY_CONTROLLER_NAME ?? t("controller.defaultName");

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12 text-slate-900">
      <h1 className="mb-2 text-3xl font-bold">{t("title")}</h1>
      <p className="mb-8 text-sm text-slate-700">{t("lastUpdated")}</p>

      <div className="space-y-8 leading-7">
        <section>
          <h2 className="mb-2 text-xl font-semibold">
            {t("controller.title")}
          </h2>
          <p>{controllerName}</p>
          {contactEmail ? (
            <p>
              {t.rich("controller.contact", {
                address: contactEmail,
                email: (chunks) => (
                  <a className="underline" href={`mailto:${contactEmail}`}>
                    {chunks}
                  </a>
                ),
              })}
            </p>
          ) : (
            <p className="mt-2 rounded-md bg-amber-100 px-3 py-2 text-sm text-amber-950">
              {t.rich("controller.missingContact", {
                variable: (chunks) => <code>{chunks}</code>,
              })}
            </p>
          )}
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold">
            {t("dataProcessed.title")}
          </h2>
          <p>{t("dataProcessed.body")}</p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold">
            {t("purpose.title")}
          </h2>
          <p>{t("purpose.body")}</p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold">
            {t("storage.title")}
          </h2>
          <p>{t("storage.body")}</p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold">
            {t("recipients.title")}
          </h2>
          <p>{t("recipients.body")}</p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold">
            {t("cookies.title")}
          </h2>
          <p>{t("cookies.body")}</p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold">
            {t("rights.title")}
          </h2>
          <p>
            {t.rich("rights.body", {
              authority: (chunks) => (
                <a
                  className="underline"
                  href="https://www.garanteprivacy.it/"
                  rel="noreferrer"
                  target="_blank"
                >
                  {chunks}
                </a>
              ),
            })}
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold">
            {t("provision.title")}
          </h2>
          <p>{t("provision.body")}</p>
        </section>
      </div>
    </main>
  );
}
