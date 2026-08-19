import { createLoader, parseAsInteger } from "nuqs/server";

export const alarmsOverviewSearchParams = {
  alarmPlantId: parseAsInteger,
};

export const loadAlarmsOverviewSearchParams = createLoader(
  alarmsOverviewSearchParams,
);
