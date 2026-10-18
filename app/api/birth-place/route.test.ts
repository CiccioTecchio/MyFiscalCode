/** @jest-environment node */

import type { NextRequest } from "next/server";

jest.mock("@/app/lib/utils/mongodb", () => ({
  dbConnect: jest.fn(),
}));
jest.mock("@/app/models/Comune", () => ({
  ComuneModel: { find: jest.fn() },
}));
jest.mock("@/app/models/Stato", () => ({
  StatoModel: { find: jest.fn() },
}));

import { dbConnect } from "@/app/lib/utils/mongodb";
import { ComuneModel } from "@/app/models/Comune";
import { StatoModel } from "@/app/models/Stato";
import { GET } from "./route";

const mockDbConnect = jest.mocked(dbConnect);
const mockComuneFind = ComuneModel.find as unknown as jest.Mock;
const mockStatoFind = StatoModel.find as unknown as jest.Mock;

function createRequest(search: string): NextRequest {
  return {
    nextUrl: new URL(`http://localhost/api/birth-place${search}`),
  } as NextRequest;
}

function createQuery<T>(result: T[]) {
  const query = {
    select: jest.fn(),
    sort: jest.fn(),
    limit: jest.fn(),
    lean: jest.fn().mockResolvedValue(result),
  };
  query.select.mockReturnValue(query);
  query.sort.mockReturnValue(query);
  query.limit.mockReturnValue(query);
  return query;
}

describe("GET /api/birth-place", () => {
  beforeEach(() => {
    mockDbConnect.mockReset();
    mockComuneFind.mockReset();
    mockStatoFind.mockReset();
  });

  it("restituisce una lista vuota se la query è troppo corta", async () => {
    const response = await GET(createRequest("?query=R&kind=comune"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ options: [] });
    expect(mockDbConnect).not.toHaveBeenCalled();
  });

  it("restituisce 400 se il tipo di ricerca non è valido", async () => {
    const response = await GET(createRequest("?query=Roma&kind=provincia"));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "The kind must be 'comune' or 'stato'",
    });
    expect(mockDbConnect).not.toHaveBeenCalled();
  });

  it("cerca e converte i comuni italiani", async () => {
    const query = createQuery([
      { nomeComune: "Roma", provincia: "RM", codiceComune: "H501" },
    ]);
    mockComuneFind.mockReturnValue(query);

    const response = await GET(createRequest("?query=Ro&kind=comune"));

    await expect(response.json()).resolves.toEqual({
      options: [{ label: "Roma", province: "RM", code: "H501" }],
    });
    expect(mockDbConnect).toHaveBeenCalledTimes(1);
    expect(mockComuneFind).toHaveBeenCalledTimes(1);
    const filter = mockComuneFind.mock.calls[0][0] as { nomeComune: RegExp };
    expect(filter.nomeComune).toEqual(/^Ro/i);
    expect(query.select).toHaveBeenCalledWith(
      "nomeComune codiceComune provincia -_id",
    );
    expect(query.sort).toHaveBeenCalledWith({ nomeComune: 1 });
    expect(query.limit).toHaveBeenCalledWith(10);
    expect(query.lean).toHaveBeenCalledTimes(1);
    expect(mockStatoFind).not.toHaveBeenCalled();
  });

  it("cerca e converte gli Stati esteri", async () => {
    const query = createQuery([{ nomeStato: "Francia", codice: "Z110" }]);
    mockStatoFind.mockReturnValue(query);

    const response = await GET(createRequest("?query=Fr&kind=stato"));

    await expect(response.json()).resolves.toEqual({
      options: [{ label: "Francia", code: "Z110" }],
    });
    expect(mockDbConnect).toHaveBeenCalledTimes(1);
    expect(mockStatoFind).toHaveBeenCalledTimes(1);
    const filter = mockStatoFind.mock.calls[0][0] as { nomeStato: RegExp };
    expect(filter.nomeStato).toEqual(/^Fr/i);
    expect(query.select).toHaveBeenCalledWith("nomeStato codice -_id");
    expect(query.sort).toHaveBeenCalledWith({ nomeStato: 1 });
    expect(query.limit).toHaveBeenCalledWith(10);
    expect(query.lean).toHaveBeenCalledTimes(1);
    expect(mockComuneFind).not.toHaveBeenCalled();
  });

  it("tratta i caratteri speciali della query come testo letterale", async () => {
    const query = createQuery([]);
    mockComuneFind.mockReturnValue(query);

    await GET(createRequest("?query=Ro.&kind=comune"));

    const filter = mockComuneFind.mock.calls[0][0] as { nomeComune: RegExp };
    expect(filter.nomeComune.source).toBe("^Ro\\.");
    expect(filter.nomeComune.flags).toContain("i");
  });
});
