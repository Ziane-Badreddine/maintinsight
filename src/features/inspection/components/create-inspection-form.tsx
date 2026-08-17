import React from "react";

interface CreateInspectionFormProps {
  defaultCityId: number | undefined;
  defaultPlantId: number | undefined;
  onSuccess: () => void;
}

export default function CreateInspectionForm({}: CreateInspectionFormProps) {
  return <div>CreateInspectionForm</div>;
}
