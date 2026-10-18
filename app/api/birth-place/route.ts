import { BirthPlaceOption } from "@/app/lib/types/BirthPlaceOption";
import { Comune } from "@/app/lib/types/Comune";
import { dbConnect } from "@/app/lib/utils/mongodb";
import { ComuneModel } from "@/app/models/Comune";
import { StatoModel } from "@/app/models/Stato";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query")?.trim() ?? "";
  const kind = request.nextUrl.searchParams.get("kind");

  if (query.length < 2) {
    return Response.json({ options: [] });
  }

  if (kind !== "comune" && kind !== "stato") {
    return Response.json(
      {
        error: "The kind must be 'comune' or 'stato'",
      },
      {
        status: 400,
      },
    );
  }

  await dbConnect();
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const startsWithQuery = new RegExp(`^${escapedQuery}`, "i");
  let options: Array<BirthPlaceOption> = [];
  if (kind === "comune") {
    const comuni = await ComuneModel.find({ nomeComune: startsWithQuery })
      .select("nomeComune codiceComune provincia -_id")
      .sort({ nomeComune: 1 })
      .limit(10)
      .lean();
    options = comuni.map((comune: Comune) => ({
      label: comune.nomeComune,
      province: comune.provincia,
      code: comune.codiceComune,
    }));
  } else {
    if (kind === "stato") {
      const stati = await StatoModel.find({ nomeStato: startsWithQuery })
        .select("nomeStato codice -_id")
        .sort({ nomeStato: 1 })
        .limit(10)
        .lean();
      options = stati.map((stati) => ({
        label: stati.nomeStato,
        code: stati.codice,
      }));
    }
  }
  return Response.json({ options });
}
