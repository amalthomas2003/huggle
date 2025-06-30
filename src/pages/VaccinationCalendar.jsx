// VaccinationCalendar.jsx
import React, { useEffect, useState } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { Tabs, Tab } from "../components/Tabs";
import { format, addWeeks, addDays, addYears, isAfter, compareAsc } from "date-fns";
import { motion } from "framer-motion";
import { Home, CalendarDays } from "lucide-react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import '../styles/calendar.css'; // Custom calendar styles

const vaccineCatalog = {
  Dog: [
    { name: "Parvovirus", priority: "Core", recurring: false, weeks: 6 },
    { name: "Distemper", priority: "Core", recurring: false, weeks: 8 },
    { name: "Hepatitis", priority: "Core", recurring: false, weeks: 10 },
    { name: "Parainfluenza", priority: "Core", recurring: false, weeks: 12 },
    { name: "Rabies", priority: "Core", recurring: true, weeks: 13 },
    { name: "Leptospirosis", priority: "Important", recurring: true, weeks: 14 },
    { name: "Bordetella", priority: "Seasonal", recurring: false, weeks: 16 },
    { name: "Canine Influenza", priority: "Seasonal", recurring: false, weeks: 18 },
    { name: "Coronavirus", priority: "Rare", recurring: false, weeks: 20 },
  ],
  Cat: [
    { name: "Panleukopenia", priority: "Core", recurring: false, weeks: 6 },
    { name: "Feline Herpesvirus", priority: "Core", recurring: false, weeks: 8 },
    { name: "Calicivirus", priority: "Core", recurring: false, weeks: 10 },
    { name: "Rabies", priority: "Core", recurring: true, weeks: 12 },
    { name: "Feline Leukemia", priority: "Important", recurring: false, weeks: 14 },
    { name: "FIV", priority: "Rare", recurring: false, weeks: 16 },
  ],
  Rabbit: [
    { name: "Myxomatosis", priority: "Core", recurring: true, weeks: 5 },
    { name: "VHD1", priority: "Core", recurring: false, weeks: 7 },
    { name: "VHD2", priority: "Core", recurring: false, weeks: 9 },
  ],
  Fish: [],
};

const meds = {
  Dog: ["Deworming Tablet", "Multivitamin Syrup", "Calcium Boost"],
  Cat: ["Hairball Remedy", "Deworming Syrup", "Vitamin B Complex"],
  Rabbit: ["Coccidiostat", "Probiotic Drops"],
  Fish: ["Anti-fungal Drops", "Water Conditioner"],
};

const badgeStyles = {
  Core: "bg-red-100 text-red-800 border border-red-300",
  Important: "bg-yellow-100 text-yellow-800 border border-yellow-300",
  Seasonal: "bg-blue-100 text-blue-800 border border-blue-300",
  Rare: "bg-purple-100 text-purple-800 border border-purple-300",
};

const VaccinationCalendar = () => {
  const db = getFirestore();
  const auth = getAuth();
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);
  const [selectedPetId, setSelectedPetId] = useState(null);
  const [vaccinationData, setVaccinationData] = useState([]);
  const [calendarValue, setCalendarValue] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    const fetchPets = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const petsRef = collection(db, "users", user.uid, "pets");
      const snapshot = await getDocs(petsRef);
      const petList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setPets(petList);
      if (petList.length > 0) {
        setSelectedPetId(petList[0].id);
      }
    };

    fetchPets();
  }, []);

  useEffect(() => {
    const selectedPet = pets.find(p => p.id === selectedPetId);
    if (!selectedPet) return;

    const dob = new Date(selectedPet.dob);
    if (isNaN(dob)) return;

    const givenVaccines = (selectedPet.vaccines || []).map(v => v.name);
    const medsList = meds[selectedPet.type] || [];
    const catalog = vaccineCatalog[selectedPet.type] || [];
    const vaccineSchedule = [];
    const dateMap = new Map();

    const scheduleWithGroupConstraint = (targetDate, entry) => {
      let scheduledDate = targetDate;
      let attempts = 0;
      while (attempts < 365) {
        const dateKey = format(scheduledDate, "yyyy-MM-dd");
        const count = dateMap.get(dateKey) || 0;
        const groupConflict = [...dateMap.keys()].some(d => {
          const diff = Math.abs(new Date(d) - scheduledDate) / (1000 * 3600 * 24);
          return diff < 7 && d !== dateKey && (dateMap.get(d) || 0) > 0;
        });
        if (count < 2 && !groupConflict) {
          dateMap.set(dateKey, count + 1);
          vaccineSchedule.push({ ...entry, date: scheduledDate });
          break;
        }
        scheduledDate = addDays(scheduledDate, 1);
        attempts++;
      }
    };

    catalog.forEach(vac => {
      if (!vac.recurring && givenVaccines.includes(vac.name)) return;
      const baseDate = addWeeks(dob, vac.weeks || 0);
      if (vac.recurring) {
        for (let i = 0; i < 4; i++) {
          const recurringDate = addYears(baseDate, i);
          if (isAfter(recurringDate, new Date())) {
            scheduleWithGroupConstraint(recurringDate, vac);
          }
        }
      } else {
        if (isAfter(baseDate, new Date())) {
          scheduleWithGroupConstraint(baseDate, vac);
        }
      }
    });

    medsList.forEach((med, i) => {
      const medDate = addWeeks(dob, 24 + i * 12);
      if (isAfter(medDate, new Date())) {
        scheduleWithGroupConstraint(medDate, {
          name: med,
          priority: "Important",
          recurring: true,
        });
      }
    });

    vaccineSchedule.sort((a, b) => compareAsc(a.date, b.date));
    setVaccinationData(vaccineSchedule);
  }, [selectedPetId, pets]);

  return (
    <div className="p-4 bg-gradient-to-b from-orange-100 to-yellow-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-brown-800">Vaccination Calendar</h1>
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-white hover:bg-gray-200 text-gray-800 font-semibold px-4 py-2 rounded-full shadow flex items-center gap-1"
          >
            <Home size={18} /> Home
          </button>
          <button
            onClick={() => setShowCalendar(prev => !prev)}
            className="bg-white hover:bg-blue-100 text-blue-800 font-semibold px-4 py-2 rounded-full shadow flex items-center gap-1"
          >
            <CalendarDays size={18} /> {showCalendar ? "Hide Calendar" : "Show Calendar"}
          </button>
        </div>
      </div>

      {pets.length > 0 ? (
        <>
          <div className="overflow-x-auto scrollbar-hide -mx-2 px-2">
            <Tabs value={selectedPetId} onValueChange={setSelectedPetId} className="whitespace-nowrap">
              {pets.map(pet => (
                <Tab key={pet.id} value={pet.id}>
                  {pet.name}
                </Tab>
              ))}
            </Tabs>
          </div>

          {showCalendar && (
            <div className="my-6 max-w-md mx-auto">
              <Calendar
                value={calendarValue}
                onChange={setCalendarValue}
                tileContent={({ date }) => {
                  const found = vaccinationData.find(v => format(v.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'));
                  return found ? <span className="text-sm">🔔</span> : null;
                }}
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {vaccinationData.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
              >
                <div className="rounded-2xl overflow-hidden shadow-xl bg-white">
                  <img src={`/assets/bg-${item.priority?.toLowerCase() || "core"}.png`} alt="bg" className="w-full h-40 object-cover" />
                  <div className="p-4">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full inline-block mb-2 ${badgeStyles[item.priority] || "bg-gray-200 text-gray-800"}`}>
                      {item.priority || "--"}
                    </span>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">{item.name}</h2>
                    <p className="text-sm font-medium text-gray-600">📅 {format(item.date, "dd MMM yyyy")}</p>
                    <p className="text-sm italic text-gray-600">
                      {item.recurring ? "🔁 Recurring yearly" : "📌 One-time"}
                    </p>
                    <p className="text-xs mt-2 text-gray-700">
                      💡 This helps protect your pet from common diseases. Ask your vet about safe brands like Zoetis, Virbac, MSD.
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      ) : (
        <p className="text-gray-500 mt-4">No pets found.</p>
      )}
    </div>
  );
};

export default VaccinationCalendar;
