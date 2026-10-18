"use client";
import { useEffect, useState } from "react";
import { BirthPlaceOption } from "../lib/types/BirthPlaceOption";
import { Autocomplete, TextField } from "@mui/material";
import { IsBornInItaly } from "../lib/types/IsBornInItaly";

type BornPlaceProps = {
  isBornInItaly: IsBornInItaly;
  onValidityChange: (isValid: boolean) => void;
};

const NO_DIGITS_PATTERN = "[^0-9]*";

const BornPlace = ({ isBornInItaly, onValidityChange }: BornPlaceProps) => {
  const [birthPlaceInput, setBirthPlaceInput] = useState<string>("");
  const [birthPlaceOptions, setBirthPlaceOptions] = useState<
    BirthPlaceOption[]
  >([]);
  const [selectedBirthPlace, setSelectedBirthPlace] =
    useState<BirthPlaceOption | null>(null);
  const [isLoadingBirthPlaces, setIsLoadingBirthPlaces] =
    useState<boolean>(false);
  const [isBirthPlaceDirty, setIsBirthPlaceDirty] = useState(false);
  const [hasInvalidFormat, setHasInvalidFormat] = useState(false);
  const birthPlaceHasError = isBirthPlaceDirty && hasInvalidFormat;

  useEffect(() => {
    const query = birthPlaceInput.trim();
    if (isBornInItaly === "" || query.length < 2 || /\d/.test(query)) {
      return;
    }

    const kind = isBornInItaly === "Y" ? "comune" : "stato";
    //debaunce
    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      const searchParam = new URLSearchParams({ query, kind });

      try {
        setIsLoadingBirthPlaces(true);
        const response = await fetch(`/api/birth-place?${searchParam}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw Error(
            "Something went wrong during the researching of the birth place",
          );
        }
        const data = (await response.json()) as {
          options: BirthPlaceOption[];
        };
        setBirthPlaceOptions(data.options);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError")
          return;
        console.error(
          "Something went wrong during the researching of the birth place",
          error,
        );
        setBirthPlaceOptions([]);
      } finally {
        if (!controller.signal.aborted) setIsLoadingBirthPlaces(false);
      }
    }, 100);
    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [birthPlaceInput, isBornInItaly]);

  return (
    <Autocomplete
      options={birthPlaceOptions}
      value={selectedBirthPlace}
      inputValue={birthPlaceInput}
      loading={isLoadingBirthPlaces}
      getOptionLabel={(option) =>
        isBornInItaly === "Y"
          ? option.label + " - " + option.province
          : option.label
      }
      filterOptions={(options) => options}
      onInputChange={(_event, newInputValue, reason) => {
        setBirthPlaceInput(newInputValue);

        if (reason === "input") {
          setIsBirthPlaceDirty(true);
          setHasInvalidFormat(/\d/.test(newInputValue));
          setSelectedBirthPlace(null);
          onValidityChange(false);
        }

        if (reason === "clear") {
          setIsBirthPlaceDirty(true);
          setHasInvalidFormat(false);
        }

        if (newInputValue.trim().length < 2 || /\d/.test(newInputValue)) {
          setBirthPlaceOptions([]);
          setIsLoadingBirthPlaces(false);
        }
      }}
      isOptionEqualToValue={(option, value) => option.code === value.code}
      onChange={(_event, newValue) => {
        setIsBirthPlaceDirty(true);
        if (newValue !== null) {
          setHasInvalidFormat(false);
        }
        setSelectedBirthPlace(newValue);
        onValidityChange(newValue !== null);
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          name="birthPlace"
          label={
            isBornInItaly === "Y" ? "Luogo di nascita" : "Stato di nascita"
          }
          placeholder={
            isBornInItaly === "Y"
              ? "Inizia a digitare il Comune"
              : "Inizia a digitare lo Stato di nascita"
          }
          required
          fullWidth
          error={birthPlaceHasError}
          helperText={birthPlaceHasError ? "Formato non valido" : undefined}
          inputProps={{
            ...params.inputProps,
            pattern: NO_DIGITS_PATTERN,
          }}
        />
      )}
    />
  );
};

export default BornPlace;
