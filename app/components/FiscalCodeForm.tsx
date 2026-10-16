"use client";

import Link from "next/link";
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  Radio,
  RadioGroup,
  TextField,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { useActionState } from "react";
import { getFiscalCode, type FiscalCodeState } from "../action";

export default function FiscalCodeForm() {
  const initialState: FiscalCodeState = { fiscalCode: "", error: null };
  const [state, formAction, isPending] = useActionState(
    getFiscalCode,
    initialState,
  );

  return (
    <form action={formAction} className="flex w-full flex-col gap-3 sm:gap-4">
      <Box>
        <Grid container spacing={{ xs: 1.5, sm: 2 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Cognome"
              name="surname"
              fullWidth
              required
              value="Vicidomini"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Nome"
              name="name"
              fullWidth
              required
              value="Francesco"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <LocalizationProvider dateAdapter={AdapterMoment}>
              <DatePicker
                label="Data di nascita"
                name="dateOfBirth"
                format="DD/MM/YYYY"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                  },
                }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <div className="flex h-full items-center justify-center">
              <FormControl className="w-full" required>
                <FormLabel id="sex">Sesso</FormLabel>
                <RadioGroup
                  row
                  aria-labelledby="sex"
                  name="sex"
                  className="justify-center"
                >
                  <FormControlLabel value="M" control={<Radio />} label="M" />
                  <FormControlLabel value="F" control={<Radio />} label="F" />
                </RadioGroup>
              </FormControl>
            </div>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <TextField
              label="Luogo di nascita"
              name="birthPlace"
              placeholder="Inserisci Luogo o Paese di nascita"
              fullWidth
              required
            />
          </Grid>
          <Grid size={12} className="flex justify-center pt-1 sm:pt-2">
            <div className="flex flex-col items-center gap-2">
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isPending}
              >
                Calcola codice fiscale
              </Button>
              <p className="max-w-lg text-center text-xs text-slate-700">
                I dati vengono elaborati sul server per effettuare il calcolo e
                non vengono salvati nel database. Leggi l&apos;{" "}
                <Link className="underline" href="/privacy">
                  informativa privacy
                </Link>
                .
              </p>
            </div>
          </Grid>
        </Grid>
      </Box>
      <div aria-live="polite">
        {state.error && <p>{state.error}</p>}
        {state.fiscalCode && (
          <p>
            Codice fiscale: <strong>{state.fiscalCode}</strong>
          </p>
        )}
      </div>
    </form>
  );
}
