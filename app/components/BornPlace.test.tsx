import { act, fireEvent, render, screen } from "@testing-library/react";

jest.mock("@mui/material", () => ({
  Autocomplete: ({
    options,
    inputValue,
    getOptionLabel,
    onInputChange,
    onChange,
    renderInput,
  }: {
    options: Array<{ label: string; province?: string; code: string }>;
    inputValue: string;
    getOptionLabel: (option: {
      label: string;
      province?: string;
      code: string;
    }) => string;
    onInputChange: (
      event: React.ChangeEvent<HTMLInputElement>,
      value: string,
      reason: string,
    ) => void;
    onChange: (
      event: React.MouseEvent<HTMLButtonElement>,
      value: { label: string; province?: string; code: string },
    ) => void;
    renderInput: (params: {
      inputProps: React.InputHTMLAttributes<HTMLInputElement>;
    }) => React.ReactNode;
  }) => (
    <div>
      {renderInput({
        inputProps: {
          value: inputValue,
          "aria-controls": "born-place-options",
          "aria-expanded": options.length > 0,
          onChange: (event) =>
            onInputChange(event, event.target.value, "input"),
        },
      })}
      <div id="born-place-options" role="listbox">
        {options.map((option) => (
          <button
            key={option.code}
            aria-selected="false"
            role="option"
            type="button"
            onClick={(event) => {
              onChange(event, option);
              onInputChange(
                event as unknown as React.ChangeEvent<HTMLInputElement>,
                getOptionLabel(option),
                "reset",
              );
            }}
          >
            {getOptionLabel(option)}
          </button>
        ))}
      </div>
    </div>
  ),
  TextField: ({
    label,
    name,
    placeholder,
    required,
    error,
    helperText,
    inputProps,
  }: {
    label: string;
    name: string;
    placeholder?: string;
    required?: boolean;
    error?: boolean;
    helperText?: React.ReactNode;
    inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  }) => (
    <label>
      {label}
      <input
        {...inputProps}
        aria-controls={inputProps?.["aria-controls"]}
        aria-expanded={inputProps?.["aria-expanded"]}
        aria-label={label}
        name={name}
        placeholder={placeholder}
        required={required}
        role="combobox"
      />
      {error && <span>{helperText}</span>}
    </label>
  ),
}));

import BornPlace from "./BornPlace";

const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;

function successfulResponse(options: unknown[]): Response {
  return {
    ok: true,
    json: jest.fn().mockResolvedValue({ options }),
  } as unknown as Response;
}

async function runDebounce() {
  await act(async () => {
    await new Promise((resolve) => window.setTimeout(resolve, 120));
  });
}

describe("BornPlace", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    Object.defineProperty(global, "fetch", {
      configurable: true,
      writable: true,
      value: mockFetch,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it.each([
    { isBornInItaly: "Y" as const, label: "Luogo di nascita" },
    { isBornInItaly: "N" as const, label: "Stato di nascita" },
  ])("mostra il campo $label", ({ isBornInItaly, label }) => {
    render(
      <BornPlace
        isBornInItaly={isBornInItaly}
        onValidityChange={jest.fn()}
      />,
    );

    expect(screen.getByRole("combobox", { name: label })).toBeInTheDocument();
  });

  it("non ricerca se sono stati inseriti meno di due caratteri", async () => {
    render(<BornPlace isBornInItaly="Y" onValidityChange={jest.fn()} />);

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "R" },
    });
    await runDebounce();

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("rifiuta un luogo contenente numeri senza chiamare l'API", async () => {
    render(<BornPlace isBornInItaly="Y" onValidityChange={jest.fn()} />);

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "Roma2" },
    });
    await runDebounce();

    expect(screen.getByText("Formato non valido")).toBeInTheDocument();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("cerca i comuni dopo il debounce e permette di selezionarli", async () => {
    const onValidityChange = jest.fn();
    mockFetch.mockResolvedValue(
      successfulResponse([
        { label: "Roma", province: "RM", code: "H501" },
      ]),
    );
    render(
      <BornPlace
        isBornInItaly="Y"
        onValidityChange={onValidityChange}
      />,
    );

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "Ro" },
    });
    expect(mockFetch).not.toHaveBeenCalled();

    await runDebounce();

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/birth-place?query=Ro&kind=comune",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    const option = await screen.findByRole("option", { name: "Roma - RM" });
    fireEvent.click(option);

    expect(onValidityChange).toHaveBeenLastCalledWith(true);
    expect(screen.getByRole("combobox")).toHaveValue("Roma - RM");
  });

  it("invalida la selezione quando l'utente modifica nuovamente il testo", async () => {
    const onValidityChange = jest.fn();
    mockFetch.mockResolvedValue(
      successfulResponse([
        { label: "Roma", province: "RM", code: "H501" },
      ]),
    );
    render(
      <BornPlace
        isBornInItaly="Y"
        onValidityChange={onValidityChange}
      />,
    );
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "Ro" } });
    await runDebounce();
    fireEvent.click(
      await screen.findByRole("option", { name: "Roma - RM" }),
    );

    fireEvent.change(input, { target: { value: "Rom" } });

    expect(onValidityChange).toHaveBeenLastCalledWith(false);
  });

  it("usa la ricerca degli Stati per chi è nato all'estero", async () => {
    mockFetch.mockResolvedValue(
      successfulResponse([{ label: "Francia", code: "Z110" }]),
    );
    render(<BornPlace isBornInItaly="N" onValidityChange={jest.fn()} />);

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "Fr" },
    });
    await runDebounce();

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/birth-place?query=Fr&kind=stato",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(
      await screen.findByRole("option", { name: "Francia" }),
    ).toBeInTheDocument();
  });

  it("gestisce una risposta HTTP fallita senza mostrare opzioni", async () => {
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    mockFetch.mockResolvedValue({ ok: false } as Response);
    render(<BornPlace isBornInItaly="Y" onValidityChange={jest.fn()} />);

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "Ro" },
    });
    await runDebounce();

    expect(consoleError).toHaveBeenCalled();
    expect(screen.queryByRole("option")).not.toBeInTheDocument();
  });

  it("annulla la ricerca precedente quando il testo cambia", async () => {
    mockFetch.mockResolvedValue(successfulResponse([]));
    render(<BornPlace isBornInItaly="Y" onValidityChange={jest.fn()} />);
    const input = screen.getByRole("combobox");

    fireEvent.change(input, { target: { value: "Ro" } });
    fireEvent.change(input, { target: { value: "Rom" } });
    await runDebounce();

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/birth-place?query=Rom&kind=comune",
      expect.any(Object),
    );
  });
});
