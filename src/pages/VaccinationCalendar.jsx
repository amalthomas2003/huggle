import { CalendarDays } from "lucide-react";

export default function VaccinationCalendar({ user }) {
  const pet = JSON.parse(localStorage.getItem("petData"));

  const nextDates = pet?.vaccines?.filter((v) => !v.taken).map((v, i) => ({
    name: v.name,
    due: new Date(Date.now() + (i + 1) * 14 * 24 * 60 * 60 * 1000).toDateString()
  })) || [];

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Upcoming Vaccinations</h2>
      {nextDates.length === 0 ? (
        <p className="text-green-600">All core vaccines are up to date! 🎉</p>
      ) : (
        <ul className="space-y-2">
          {nextDates.map((v) => (
            <li key={v.name} className="bg-blue-100 p-3 rounded shadow flex items-center justify-between">
              <span>{v.name}</span>
              <span className="text-sm text-gray-600">{v.due}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 flex gap-4">
        <button className="bg-indigo-500 text-white px-4 py-2 rounded">Find Vets Nearby</button>
        <button className="bg-yellow-500 text-white px-4 py-2 rounded">Diet Plan</button>
      </div>
    </div>
  );
}
