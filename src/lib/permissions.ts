import { createAccessControl } from "better-auth/plugins";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";

export const statements = {
  ...defaultStatements,

  dashboard: ["read"],

  equipment: ["create", "read", "update", "delete"],

  inspection: ["create", "read", "update", "delete", "validate"],

  report: ["read", "generate", "download"],

  plant: ["create", "read", "update", "delete"],

  workshop: ["create", "read", "update", "delete"],

  entity: ["create", "read", "update", "delete"],
} as const;

export const ac = createAccessControl(statements);

export const viewer = ac.newRole({
  dashboard: ["read"],

  equipment: ["read"],

  inspection: ["read"],

  report: ["read"],
});

export const inspector = ac.newRole({
  dashboard: ["read"],

  equipment: ["read"],

  inspection: ["create", "read", "update"],

  report: ["read"],
});

export const manager = ac.newRole({
  dashboard: ["read"],

  equipment: ["read"],

  inspection: ["read", "validate"],

  report: ["read", "generate", "download"],
});

export const admin = ac.newRole({
  ...adminAc.statements,

  dashboard: ["read"],

  equipment: ["create", "read", "update", "delete"],

  inspection: ["create", "read", "update", "delete", "validate"],

  report: ["read", "generate", "download"],

  plant: ["create", "read", "update", "delete"],

  workshop: ["create", "read", "update", "delete"],

  entity: ["create", "read", "update", "delete"],
});
