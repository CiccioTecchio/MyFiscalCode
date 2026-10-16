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
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { useActionState } from "react";
import { getFiscalCode, type FiscalCodeState } from "../action";

export default function FiscalCodeForm() {
  const initialState: FiscalCodeState = { fiscalCode: "", error: null };
  const [state, formAction, isPending] = useActionState(
    getFiscalCode,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Box>
        <Grid container spacing={2}>
          <Grid size={6}>
            <TextField
              label="Cognome"
              name="surname"
              fullWidth
              required
              value="Vicidomini"
            />
          </Grid>
          <Grid size={6}>
            <TextField
              label="Nome"
              name="name"
              fullWidth
              required
              value="Francesco"
            />
          </Grid>
          <Grid size={4}>
            <LocalizationProvider dateAdapter={AdapterMoment}>
              <DemoContainer components={["DatePicker"]}>
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
              </DemoContainer>
            </LocalizationProvider>
          </Grid>
          <Grid size={3}>
            <div className="flex justify-center">
              <FormControl>
                <FormLabel id="sex">Sesso</FormLabel>
                <RadioGroup row aria-labelledby="sex" name="sex">
                  <FormControlLabel
                    value="M"
                    control={<Radio />}
                    label="Maschio"
                    defaultChecked
                  />
                  <FormControlLabel
                    value="F"
                    control={<Radio />}
                    label="Femmina"
                  />
                </RadioGroup>
              </FormControl>
            </div>
          </Grid>
          <Grid size={5}>
            <TextField
              label="Luogo di nascita"
              name="birthPlace"
              fullWidth
              required
              value="Salerno"
            />
          </Grid>
          <Grid size={12} className="flex justify-center">
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
