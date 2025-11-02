import LargeMedicationCard from "components/card/LargeMedicationCard";

const MedicalRecords = () => (
  <LargeMedicationCard
    medicationId={""}
    medicationName={"Ibuprofen"}
    medicationNotes={
      "Take this medication once a day by month. If taken late, take two in one day, but do not exceed three. "
    }
    lastRequested={new Date()}
    prescribedOn={new Date()}
    refillDetails={"84 Tablets"}
    pharmacyDetails={"This Hospital"}
  ></LargeMedicationCard>
);
export default MedicalRecords;
