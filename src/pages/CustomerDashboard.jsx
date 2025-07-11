import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import {
  LogOut,
  PawPrint,
  Users,
  Sparkles,
  HeartPulse,
  Scissors,
  UtensilsCrossed,
  CalendarDays,
  ShoppingBag,
  Dog,
  Menu,
  CalendarClock,
  Share2,
  Info,
  Repeat,
  Pin
} from "lucide-react";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import { useState, useEffect } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { format, addWeeks, addYears, isAfter, compareAsc, parseISO } from "date-fns";
import vaccineBg from "../assets/vaccine-bg.png";

// Import your useSubscription hook
import { useSubscription } from "../context/SubscriptionContext"; 

function CustomerDashboard({ user, setUser }) {
  const navigate = useNavigate();
  // Fetch subscription data
  const { subscription, loadingSubscription } = useSubscription();

  const [showServices, setShowServices] = useState(false);
  const [showCare, setShowCare] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSocial, setShowSocial] = useState(false);
  const [calendarPreview, setCalendarPreview] = useState(
    JSON.parse(sessionStorage.getItem("calendarPreview")) || []
  );

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const username = user?.displayName?.split(" ")[0] || "User";
  const userPhoto =
    user?.photoURL ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      username
    )}&background=fff3e0&color=ff6f00`;

  const adImages = [
    "https://img.freepik.com/free-vector/hand-drawn-pet-shop-facebook-cover-template_23-2150383109.jpg",
    "https://img.pikbest.com/origin/06/17/98/79YpIkbEsTNbH.jpg!bw700",
    "https://i.pinimg.com/736x/22/24/70/222470d2199ab493f637ce5e6e315095.jpg",
  ];

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: false,
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "core":
        return "bg-red-600/70 text-white";
      case "important":
        return "bg-yellow-500/70 text-black";
      case "seasonal":
        return "bg-blue-500/70 text-white";
      case "rare":
        return "bg-gray-500/70 text-white";
      default:
        return "bg-white/30 text-white";
    }
  };

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

  useEffect(() => {
    if (calendarPreview.length > 0) return;
    const fetchAllPetSchedules = async () => {
      const auth = getAuth();
      const db = getFirestore();
      const user = auth.currentUser;
      if (!user) return;

      const petsRef = collection(db, "users", user.uid, "pets");
      const snapshot = await getDocs(petsRef);
      const petList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const today = new Date();
      let allSchedules = [];

      for (const pet of petList) {
        const dob = new Date(pet.dob);
        if (isNaN(dob)) continue;

        const givenVaccines = (pet.vaccines || []).map((v) => v.name);
        const catalog = vaccineCatalog[pet.type] || [];
        const medsList = meds[pet.type] || [];
        const schedule = [];

        const scheduleWithGroupConstraint = (targetDate, entry) => {
          schedule.push({
            ...entry,
            date: targetDate,
            petName: pet.name,
          });
        };

        for (const vac of catalog) {
          const baseDate = addWeeks(dob, vac.weeks || 0);
          if (vac.recurring) {
            for (let i = 0; i < 4; i++) {
              const recurringDate = addYears(baseDate, i);
              if (isAfter(recurringDate, today)) {
                scheduleWithGroupConstraint(recurringDate, vac);
                break;
              }
            }
          } else {
            if (!givenVaccines.includes(vac.name) && isAfter(baseDate, today)) {
              scheduleWithGroupConstraint(baseDate, vac);
            }
          }
        }

        medsList.forEach((med, i) => {
          const medDate = addWeeks(dob, 24 + i * 12);
          if (isAfter(medDate, today)) {
            scheduleWithGroupConstraint(medDate, {
              name: med,
              priority: "Important",
              recurring: true,
            });
          }
        });

        allSchedules.push(...schedule);
      }

      allSchedules.sort((a, b) => compareAsc(a.date, b.date));
      const preview = allSchedules.slice(0, 4);
      setCalendarPreview(preview);
      sessionStorage.setItem("calendarPreview", JSON.stringify(preview));
    };

    fetchAllPetSchedules();
  }, []);

  // --- DERIVE PLAN STATUS ---
  // Ensure that `displayPlanStatus` accurately reflects the current plan,
  // taking into account expiry as determined by the SubscriptionContext.
  const currentPlan = subscription?.plan;
  // `isSubscriptionActive` from context already reflects if it's currently active (not expired)
  const displayPlanStatus = currentPlan || "free"; // No need for explicit isAfter check here if context handles "expired" string
  // --- END DERIVE PLAN STATUS ---

  // --- Determine 'huggle' text color based on plan status ---
  const getHuggleTextColor = () => {
    if (loadingSubscription) {
      return "text-gray-500"; // Or any loading color
    }
    switch (displayPlanStatus) {
      case "pro":
        return "text-indigo-600"; // Example color for Pro
      case "pro_plus":
        return "text-teal-600"; // Example color for Pro Plus
      case "expired":
        return "text-gray-500"; // Greyed out for expired
      case "free":
      default:
        return "text-orange-800"; // Default for Free or other states
    }
  };
  // --- END HUGGLE TEXT COLOR ---


  return (
    <div className="min-h-screen flex flex-col bg-[#fff3e0] pb-20">
      {/* Header - APPLYING DYNAMIC COLOR HERE */}
      <div className="bg-white shadow-md text-center py-4 text-2xl font-extrabold tracking-wide">
        <span className={getHuggleTextColor()}>huggle 🐾</span>
      </div>

      {/* Top Greeting & Menu */}
      <div className="flex items-center justify-between px-4 py-4 bg-white shadow-sm relative">
        <div className="flex items-center gap-3">
          <img src={userPhoto} alt="User" className="w-10 h-10 rounded-full border" />
          <h2 className="text-lg font-bold text-gray-800">Hi, {username}</h2>
        </div>
        <button onClick={() => setMenuOpen(!menuOpen)} className="hover:text-orange-600 transition">
          <Menu />
        </button>

        {menuOpen && (
          <div className="absolute top-16 right-4 bg-white border border-orange-300 rounded-lg shadow-xl z-50 w-40">
            <button onClick={() => navigate("/profile")} className="w-full px-4 py-2 text-left hover:bg-orange-100 text-sm">Profile</button>

            <button onClick={() => navigate("/plans")} className="w-full px-4 py-2 text-left hover:bg-orange-100 text-sm">Subscription</button>
            <button onClick={() => navigate("/settings")} className="w-full px-4 py-2 text-left hover:bg-orange-100 text-sm">Settings</button>

            <button onClick={() => navigate("/contact")} className="w-full px-4 py-2 text-left hover:bg-orange-100 text-sm">Contact Us</button>

            <button onClick={handleLogout} className="w-full px-4 py-2 text-left hover:bg-orange-100 text-sm">Log Out</button>
          </div>
        )}
      </div>

      {/* NO SUBSCRIPTION STATUS BANNER HERE */}

      {/* Advertisement Carousel */}
      <div className="px-4 py-2">
        <Slider {...sliderSettings}>
          {adImages.map((src, index) => (
            <div className="rounded-xl overflow-hidden shadow-xl aspect-[16/9] w-full max-h-60" key={index}>
              <img src={src} alt={`Ad ${index}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </Slider>
      </div>

      {/* Vaccination Carousel Preview */}
{calendarPreview.length > 0 && (
  <div
    className="mx-4 mt-4 cursor-pointer"
    onClick={() => navigate("/calendar")}
  >
    <Slider
      dots={false}
      arrows={false}
      infinite={true}
      speed={500}
      slidesToShow={1}
      slidesToScroll={1}
      autoplay={true}
      autoplaySpeed={5000}
    >
      {calendarPreview.map((item, index) => (
        <div
          key={index}
          className="rounded-2xl overflow-hidden shadow-2xl relative h-auto"
        >
          <div
            className="h-full w-full flex flex-col px-4 py-6"
            style={{
              backgroundImage: `url(${vaccineBg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              color: "black",
            }}
          >
            <div
              className="w-[60%] sm:w-[55%] md:w-[50%] lg:w-[40%] bg-orange-400/40 backdrop-blur-md rounded-xl p-4 text-white shadow-lg"
              style={{ marginLeft: 0 }}
            >
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold font-cartoon ${getPriorityColor(item.priority)}`}
              >
                {item.priority || "--"}
              </span>


              <h3 className="text-2xl font-cartoon font-bold mt-2">
                {item.name}
              </h3>

              <p className="text-sm flex items-center gap-1 mt-1 font-cartoon">
                <CalendarDays size={16} />
                {format(new Date(item.date), "dd MMM yyyy")}
              </p>

              <p className="text-xs italic mt-1 flex items-center gap-1 font-cartoon">
                For{" "}
                <span className="ml-1 font-extrabold text-sm text-orange-100 tracking-wide drop-shadow-[1px_1px_1px_rgba(0,0,0,0.3)]">
                  {item.petName}
                </span>
              </p>
              <p className="text-xs italic mt-3 flex items-center gap-1 font-cartoon">
                <Info size={14} />
                Consult vet before vaccine
              </p>
            </div>
          </div>

        </div>
      ))}
    </Slider>
  </div>
)}


      {/* Services Popup */}
      {showServices && (
        <SubMenu>
          <ServiceCard label="Find Vets" icon={<HeartPulse />} onClick={() => navigate("/find-vet")} />
          <ServiceCard label="Groomers" icon={<Scissors />} onClick={() => navigate("/find-groomer")} />
        </SubMenu>
      )}

      {showCare && (
        <SubMenu>
          <ServiceCard label="Vaccination" icon={<CalendarDays />} onClick={() => navigate("/calendar")} />
          <ServiceCard label="Diet Plan" icon={<UtensilsCrossed />} onClick={() => navigate("/diet-plan")} />
        </SubMenu>
      )}

      {showSocial && (
        <SubMenu>
          {/* Conditional rendering for premium features */}
          <ServiceCard 
            label="Pet Parents Nearby" 
            icon={<Users />} 
            onClick={() => {
              // Ensure displayPlanStatus is correctly derived from SubscriptionContext
              if (displayPlanStatus === "pro" || displayPlanStatus === "pro_plus") {
                navigate("/pet-parents-nearby");
              } else {
                alert("This feature requires a premium plan. Please upgrade!");
                navigate("/plans");
              }
            }} 
          />
          <ServiceCard 
            label="Events" 
            icon={<CalendarClock />} 
            onClick={() => {
              // Ensure displayPlanStatus is correctly derived from SubscriptionContext
              if (displayPlanStatus === "pro" || displayPlanStatus === "pro_plus") {
                navigate("/events");
              } else {
                alert("This feature requires a premium plan. Please upgrade!");
                navigate("/plans");
              }
            }} 
          />
          <ServiceCard label="Social Media" icon={<Share2 />} onClick={() => navigate("/social-media")} />
        </SubMenu>
      )}

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 flex justify-around items-center py-5 sm:py-4 lg:py-3 bg-white shadow-inner border-t border-gray-200 text-xs font-semibold z-50">
        <BottomNavItem label="My Pets" icon={<PawPrint />} onClick={() => navigate("/add-pet")} />
        <BottomNavItem label="Shop" icon={<ShoppingBag />} onClick={() => navigate("/shop")} />
        <BottomNavItem label="Pet Care" icon={<Dog />} onClick={() => {
          setShowCare(!showCare);
          setShowServices(false);
          setShowSocial(false);
        }} />
        <BottomNavItem label="Socials" icon={<Users />} onClick={() => {
          setShowSocial(!showSocial);
          setShowCare(false);
          setShowServices(false);
        }} />
        <BottomNavItem label="Services" icon={<Sparkles />} onClick={() => {
          setShowServices(!showServices);
          setShowCare(false);
          setShowSocial(false);
        }} />
      </div>
    </div>
  );
}

function BottomNavItem({ label, icon, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center text-gray-600 hover:text-orange-700 transition duration-300"
    >
      <div className="p-3 sm:p-2 rounded-full hover:bg-orange-100 transition-all text-lg sm:text-base">
        {icon}
      </div>
      <span className="text-xs mt-1">{label}</span>
    </button>
  );
}

function SubMenu({ children }) {
  return (
    <div
      className="fixed bottom-20 left-0 right-0 w-full z-50 px-4 pointer-events-none"
      style={{ touchAction: "none" }}
    >
      <div
        className="bg-white border border-orange-300 rounded-xl shadow-2xl p-4 grid grid-cols-2 gap-4 w-full pointer-events-auto"
        style={{
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
}


function ServiceCard({ label, icon, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-orange-100 p-4 rounded-xl shadow-lg flex flex-col items-center justify-center hover:scale-105 transition-all border border-white"
    >
      <div className="text-orange-900 mb-2">{icon}</div>
      <p className="text-sm font-semibold text-gray-700">{label}</p>
    </button>
  );
}

export default CustomerDashboard;