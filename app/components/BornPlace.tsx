"use client";
import { useEffect, useState } from "react";
import { BirthPlaceOption } from "../lib/types/BirthPlaceOption";
import { Autocomplete, TextField } from "@mui/material";
import { IsBornInItaly } from "../lib/types/IsBornInItaly";

type BornPlaceProps = {
  isBornInItaly: IsBornInItaly;
};

const BornPlace = ({ isBornInItaly }: BornPlaceProps) => {
  const [birthPlaceInput, setBirthPlaceInput] = useState<string>("");
  const [birthPlaceOptions, setBirthPlaceOptions] = useState<
    BirthPlaceOption[]
  >([]);
  const [selectedBirthPlace, setSelectedBirthPlace] =
    useState<BirthPlaceOption | null>(null);
  const [isLoadingBirthPlaces, setIsLoadingBirthPlaces] =
    useState<boolean>(false);
  useEffect(() => {
    const query = birthPlaceInput.trim();
    if (isBornInItaly === "" || query.length < 2) {
      return;
    }

    const kind = isBornInItaly === "Y" ? "comune" : "stato";
    //debaunce
    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      const searchParam = new URLSearchParams({ query, kind });

      try {
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
      onInputChange={(_event, newInputValue) => {
        setBirthPlaceInput(newInputValue);
        if (newInputValue.trim().length < 2) {
          setBirthPlaceOptions([]);
          setIsLoadingBirthPlaces(false);
        }
      }}
      isOptionEqualToValue={(option, value) => option.code === value.code}
      onChange={(_event, newValue) => {
        setSelectedBirthPlace(newValue);
      }}
      renderInput={(params) =>
        isBornInItaly === "Y" ? (
          <TextField
            {...params}
            name="birthPlace"
            label="Luogo di nascita"
            placeholder="Inizia a digitare il Comune"
            required
            fullWidth
          />
        ) : (
          <TextField
            {...params}
            name="birthPlace"
            label="Sato di nascita"
            placeholder="Inizia a digitare lo Stato di nascita"
            required
            fullWidth
          />
        )
      }
    />
  );
};

export default BornPlace;
