"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppBar, Button, Toolbar, Typography } from "@mui/material";

const links = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
];

export default function Navbar() {
  const pathname = usePathname();

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
        </nav>
      </Toolbar>
    </AppBar>
  );
}
