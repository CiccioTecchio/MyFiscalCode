import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("AboutPage.metadata");

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function AboutPage() {
  const t = await getTranslations("AboutPage");

  return (
    <div
      id="about"
      className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-6 py-12"
    >
      <h1 className="text-3xl font-bold">{t("title")}</h1>
      <p>{t("introduction")}</p>
      <p>{t("motivation")}</p>
      <p>{t("response")}</p>
      <div>
        <p>{t("howItWorks")}</p>
        <ol className="mt-2 list-decimal space-y-1 pl-6">
          <li>{t("steps.form")}</li>
          <li>{t("steps.calculation")}</li>
          <li>{t("steps.result")}</li>
        </ol>
      </div>
      <p>{t("processing")}</p>
      <p>{t("persistentData")}</p>
      <p>
        {t.rich("source", {
          repository: (chunks) => (
            <a
              href="https://github.com/CiccioTecchio/MyFiscalCode"
              target="_blank"
              rel="noreferrer"
              className="text-blue-800 underline decoration-blue-500 underline-offset-4 transition-colors hover:text-blue-600"
              aria-label={t("repositoryAriaLabel")}
            >
              {chunks}
            </a>
          ),
        })}
      </p>
    </div>
  );
}
