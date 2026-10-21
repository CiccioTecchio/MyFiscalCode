"use client";

import {
  AppBar,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Toolbar,
  Typography,
} from "@mui/material";
import { useLocale } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const links = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
];

type LangType = (typeof routing.locales)[number];
type LangLabel = "IT" | "EN";
type ToggleValue = {
  value: LangType;
  label: LangLabel;
  currentLang: LangType;
};

const ToggleBtn = ({ value, label, currentLang }: ToggleValue) => {
  const checkCurrentLang = value === currentLang;
  return (
    <ToggleButton
      value={value}
      className={`${
        checkCurrentLang
          ? "!bg-white/15 !text-white"
          : "!text-slate-200 hover:!bg-white/10 hover:!text-white"
      } !min-w-0 !px-2 sm:!px-4`}
    >
      {label}
    </ToggleButton>
  );
};

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const lang = useLocale() as LangType;
  const langList: { value: LangType; label: LangLabel }[] = [
    { value: "it-IT", label: "IT" },
    { value: "en-US", label: "EN" },
  ];
  return (
    <AppBar
      position="static"
      elevation={0}
      className="!bg-slate-800/90 backdrop-blur-sm"
    >
      <Toolbar className="mx-auto w-full max-w-6xl">
        <Typography
          component="div"
          variant="h6"
          className="flex-1 font-bold max-sm:!text-base"
        >
          <Link href="/">My Fiscal Code</Link>
        </Typography>

        <nav
          aria-label="Navigazione principale"
          className="flex gap-0 sm:gap-2"
        >
          {links.map(({ label, href }) => {
            const isActive = pathname === href;

            return (
              <Button
                key={href}
                component={Link}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={`${
                  isActive
                    ? "!bg-white/15 !text-white"
                    : "!text-slate-200 hover:!bg-white/10 hover:!text-white"
                } !min-w-0 !px-2 sm:!px-4`}
              >
                {label}
              </Button>
            );
          })}
          <ToggleButtonGroup
            value={lang}
            exclusive
            onChange={(_, newLang: LangType) => {
              if (newLang !== lang) {
                router.replace(pathname, { locale: newLang });
              }
            }}
            aria-label="Lingua"
          >
            {langList.map((l) => {
              return (
                <ToggleBtn
                  value={l.value}
                  label={l.label}
                  currentLang={lang}
                  key={l.value}
                />
              );
            })}
          </ToggleButtonGroup>
        </nav>
      </Toolbar>
    </AppBar>
  );
}
