import SmallInfoCard from "components/card/SmallInfoCard";
import { Calendar } from "phosphor-react";

const Appointments = () => (
  <SmallInfoCard
    icon={Calendar}
    title={"Appointment Type"}
    value={"Surgery"}
    backgroundWhite={true}
  ></SmallInfoCard>
);
export default Appointments;
