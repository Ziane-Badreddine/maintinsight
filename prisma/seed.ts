import { EquipmentStatus, EquipmentScope } from "./generated/prisma/client";
import * as XLSX from "xlsx";
import path from "path";
import { prisma } from "@/lib/prisma";

import { auth } from "@/lib/auth";

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? "admin@ocp.local";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? "admin123";
const ADMIN_NAME = process.env.SEED_ADMIN_NAME ?? "Admin";

const FILE_PATH = path.join(
  process.cwd(),
  "prisma",
  "seed-data",
  "fichier_source.xlsx",
);

const SHEET_TO_CITY: Record<string, { name: string; code: string }> = {
  jorf: { name: "Jorf Lasfar", code: "jorf" },
  safi: { name: "Safi", code: "safi" },
};

const STATUS_MAP: Record<string, EquipmentStatus> = {
  BON: "GOOD",
  ACCEPTABLE: "ACCEPTABLE",
  ALERTE: "ALERT",
  ALARME: "ALARM",
  ARRET: "STOPPED",
  "NON SURVEILLE": "NOT_MONITORED",
};

function normalize(s: string): string {
  return s
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // retire les accents
    .trim();
}

function mapStatus(raw: string | null): EquipmentStatus | null {
  if (!raw) return null;
  return STATUS_MAP[normalize(raw)] ?? null;
}

function cleanText(raw: string | null): string | null {
  if (!raw || raw.trim() === "_") return null;
  return raw.trim();
}

interface Row {
  usine: string;
  atelier: string;
  equipement: string;
  etat1: string | null;
  diagnostic1: string | null;
  preco1: string | null;
  etat2: string | null;
  diagnostic2: string | null;
  preco2: string | null;
  zone: string | null;
  points: string | null;
}

function parseSheet(ws: XLSX.WorkSheet) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1, defval: null });
  const header = data[0];

  const dateLabel1 = String(header[3]).replace(/ETAT/i, "").trim(); // "06/03"
  const dateLabel2 = String(header[6]).replace(/ETAT/i, "").trim(); // "03/08"

  const rows: Row[] = data
    .slice(1)
    .filter((r) => r[0] && r[1] && r[2])
    .map((r) => ({
      usine: String(r[0]).trim(),
      atelier: String(r[1]).trim(),
      equipement: String(r[2]).trim(),
      etat1: r[3] ? String(r[3]).trim() : null,
      diagnostic1: r[4] ? String(r[4]).trim() : null,
      preco1: r[5] ? String(r[5]).trim() : null,
      etat2: r[6] ? String(r[6]).trim() : null,
      diagnostic2: r[7] ? String(r[7]).trim() : null,
      preco2: r[8] ? String(r[8]).trim() : null,
      zone: r[9] ? String(r[9]).trim() : null,
      points: r[10] ? String(r[10]).trim() : null,
    }));

  return { dateLabel1, dateLabel2, rows };
}

function parseCampaignDate(label: string): Date {
  // format source "06/03" = jour/mois, année absente -> on assume l'année en cours
  const [day, month] = label.split("/").map(Number);
  return new Date(new Date().getFullYear(), (month || 1) - 1, day || 1);
}

async function ensureSeedUser() {
  // auth.api.createUser (plugin admin) appelle directement la logique interne
  // de better-auth côté serveur : hash du mot de passe géré correctement,
  // et ça ne passe PAS par la route HTTP publique /sign-up (donc pas bloqué
  // même si tu as désactivé le signup public).
  const result = await auth.api.createUser({
    body: {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      name: ADMIN_NAME,
      role: "admin", // nécessite le plugin admin configuré côté auth.ts
      data: {
        emailVerified: true,
      },
    },
  });

  return result.user;
}

async function upsertInspection(
  reference: string,
  dateLabel: string,
  userId: string,
) {
  return prisma.inspection.upsert({
    where: { reference },
    update: {},
    create: {
      reference,
      status: "VALIDATED",
      inspectionDate: parseCampaignDate(dateLabel),
      performedById: userId,
    },
  });
}

async function main() {
  const seedUser = await ensureSeedUser();
  const workbook = XLSX.readFile(FILE_PATH);

  for (const sheetName of Object.keys(SHEET_TO_CITY)) {
    const cityInfo = SHEET_TO_CITY[sheetName];
    const ws = workbook.Sheets[sheetName];
    if (!ws) continue;

    console.log(`\n=== ${cityInfo.name} ===`);

    const city = await prisma.city.upsert({
      where: { code: cityInfo.code },
      update: {},
      create: { name: cityInfo.name, code: cityInfo.code },
    });

    const { dateLabel1, dateLabel2, rows } = parseSheet(ws);

    const inspection1 = await upsertInspection(
      `${cityInfo.code}-${dateLabel1}`,
      dateLabel1,
      seedUser.id,
    );
    const inspection2 = await upsertInspection(
      `${cityInfo.code}-${dateLabel2}`,
      dateLabel2,
      seedUser.id,
    );

    let count = 0;

    for (const row of rows) {
      const plant = await prisma.plant.upsert({
        where: { code: row.usine },
        update: { cityId: city.id },
        create: { code: row.usine, cityId: city.id },
      });

      const workshop = await prisma.workshop.upsert({
        where: { plantId_name: { plantId: plant.id, name: row.atelier } },
        update: {},
        create: { name: row.atelier, plantId: plant.id },
      });

      const scope: EquipmentScope =
        row.zone && normalize(row.zone) === "SITE" ? "SITE" : "ENTITY";

      const equipment = await prisma.equipment.upsert({
        where: {
          workshopId_name: { workshopId: workshop.id, name: row.equipement },
        },
        update: { scope },
        create: { name: row.equipement, workshopId: workshop.id, scope },
      });

      const points = row.points ? row.points.split(/\s+/).filter(Boolean) : [];

      // --- Campagne 1 (ancienne) ---
      const status1 = mapStatus(row.etat1);
      if (status1) {
        await prisma.inspectionEquipment.upsert({
          where: {
            inspectionId_equipmentId: {
              inspectionId: inspection1.id,
              equipmentId: equipment.id,
            },
          },
          update: {
            status: status1,
            diagnosis: cleanText(row.diagnostic1),
            recommendation: cleanText(row.preco1),
          },
          create: {
            inspectionId: inspection1.id,
            equipmentId: equipment.id,
            status: status1,
            diagnosis: cleanText(row.diagnostic1),
            recommendation: cleanText(row.preco1),
          },
        });
      }

      // --- Campagne 2 (récente) + points de mesure ---
      const status2 = mapStatus(row.etat2);
      if (status2) {
        const ie2 = await prisma.inspectionEquipment.upsert({
          where: {
            inspectionId_equipmentId: {
              inspectionId: inspection2.id,
              equipmentId: equipment.id,
            },
          },
          update: {
            status: status2,
            diagnosis: cleanText(row.diagnostic2),
            recommendation: cleanText(row.preco2),
          },
          create: {
            inspectionId: inspection2.id,
            equipmentId: equipment.id,
            status: status2,
            diagnosis: cleanText(row.diagnostic2),
            recommendation: cleanText(row.preco2),
          },
        });

        if (points.length > 0) {
          await prisma.measurement.deleteMany({
            where: { inspectionEquipmentId: ie2.id },
          });
          await prisma.measurement.createMany({
            data: points.map((point) => ({
              inspectionEquipmentId: ie2.id,
              type: "VIBRATION" as const,
              point,
            })),
          });
        }
      }

      count++;
    }

    console.log(`${count} équipements traités pour ${cityInfo.name}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
