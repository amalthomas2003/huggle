import { useNavigate } from "react-router-dom";

const vaccines = [
  "DHPPi",
  "Anti-Rabies",
  "Leptospirosis",
  "Coronavirus"
];

export default function VaccinationForm({ user }) {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const petData = JSON.parse(localStorage.getItem("petData")) || {};
    petData.vaccines = vaccines.map((v) => ({
      name: v,
      taken: data.get(v) === "on"
    }));
    localStorage.setItem("petData", JSON.stringify(petData));
    navigate("/calendar");
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold">Vaccination Status</h2>
      {vaccines.map((vaccine) => (
        <label key={vaccine} className="flex items-center gap-2">
          <input type="checkbox" name={vaccine} />
          {vaccine}
        </label>
      ))}
      <button className="w-full bg-green-600 text-white py-2 rounded">Generate Calendar</button>
    </form>
  );
}
