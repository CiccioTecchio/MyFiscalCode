import mongoose from "mongoose";

const databaseName = process.env.MONGODB_DB_NAME ?? "myfiscalcode-e2e";
const databaseUri =
  process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/myfiscalcode-e2e";

if (!databaseName.endsWith("-e2e")) {
  throw new Error(
    `Refusing to seed database "${databaseName}": its name must end with "-e2e".`,
  );
}

try {
  await mongoose.connect(databaseUri, { dbName: databaseName });

  await mongoose.connection.collection("comuniItaliani").updateOne(
    { nomeComune: "Roma" },
    {
      $set: {
        nomeComune: "Roma",
        provincia: "RM",
        codiceComune: "H501",
      },
    },
    { upsert: true },
  );

  await mongoose.connection.collection("codiciEsteri").updateOne(
    { nomeStato: "Francia" },
    {
      $set: {
        nomeStato: "Francia",
        codice: "Z110",
      },
    },
    { upsert: true },
  );

  console.log(`Seeded Playwright data in database "${databaseName}".`);
} finally {
  await mongoose.disconnect();
}
