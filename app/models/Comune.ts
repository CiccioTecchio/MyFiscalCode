import mongoose, { Schema } from "mongoose";

export const ComuneSchema = new Schema({
  nomeComune: { type: String, required: true },
  codiceComune: { type: String, required: true },
});

export const ComuneModel =
  mongoose.models.Comune ||
  mongoose.model("Comune", ComuneSchema, "comuniItaliani");
