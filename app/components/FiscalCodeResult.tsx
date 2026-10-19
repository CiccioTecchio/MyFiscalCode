"use client";

import {
  Box,
  Button,
  InputBase,
  Typography,
} from "@mui/material";
import { useState, type FocusEvent } from "react";

type FiscalCodeProps = {
  fiscalCode: string;
};

type CopyState = {
  fiscalCode: string;
  status: "copied" | "error";
};

const FiscalCodeResult = ({ fiscalCode }: FiscalCodeProps) => {
  const [copyState, setCopyState] = useState<CopyState | null>(null);
  const copyStatus =
    copyState?.fiscalCode === fiscalCode ? copyState.status : "idle";

  const copyFiscalCode = async () => {
    try {
      if (!navigator.clipboard) {
        throw new Error("Clipboard API unavailable");
      }

      await navigator.clipboard.writeText(fiscalCode);
      setCopyState({ fiscalCode, status: "copied" });
    } catch {
      setCopyState({ fiscalCode, status: "error" });
    }
  };

  return (
    <Box
      component="section"
      className="mt-2 border-t border-slate-700/20 pt-3 text-slate-900"
    >
      <Typography
        component="h2"
        variant="body2"
        className="mb-2 font-medium text-slate-700"
      >
        Codice fiscale calcolato
      </Typography>
      <Box className="flex flex-col gap-2 sm:flex-row">
        <InputBase
          fullWidth
          value={fiscalCode}
          readOnly
          onFocus={(event: FocusEvent<HTMLInputElement>) =>
            event.currentTarget.select()
          }
          className="rounded-md border border-slate-700/25 bg-slate-800/5 px-3 py-1"
          slotProps={{
            input: {
              "aria-label": "Il tuo codice fiscale",
              className:
                "font-mono text-center text-base font-semibold tracking-wider",
            },
          }}
        />
        <Button
          type="button"
          color="inherit"
          variant="outlined"
          onClick={copyFiscalCode}
          className="border-slate-700/40 text-slate-800 sm:min-w-28"
        >
          {copyStatus === "copied" ? "Copiato" : "Copia"}
        </Button>
      </Box>
      {copyStatus !== "idle" && (
        <Typography
          component="p"
          role="status"
          aria-live="polite"
          variant="caption"
          className={
            copyStatus === "error"
              ? "mt-1 text-red-800"
              : "mt-1 text-slate-700"
          }
        >
          {copyStatus === "copied"
            ? "Codice fiscale copiato negli appunti."
            : "Copia non riuscita: seleziona il codice manualmente."}
        </Typography>
      )}
    </Box>
  );
};

export default FiscalCodeResult;
