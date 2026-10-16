import mongoose, { Schema } from "mongoose";

export const StatoSchema = new Schema({
  nomeStato: { type: String, require: true },
  codice: { type: String, require: true },
});

export const StatoModel =
  mongoose.models.Stato || mongoose.model("Stato", StatoSchema, "codiciEsteri");
