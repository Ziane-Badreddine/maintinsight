import type {
  Equipment,
  Inspection,
  InspectionEquipment,
  Measurement,
} from "../../../prisma/generated/prisma/browser";

export type InspectionEquipmentWithRelations = InspectionEquipment & {
  equipment: Equipment;
  measurements: Measurement[];
};

export type InspectionWithRelations = Inspection & {
  equipments: InspectionEquipmentWithRelations[];
};
