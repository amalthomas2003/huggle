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
  Dog
} from "lucide-react";
import Lottie from "lottie-react";
import pawAnimation from "../assets/lottie/paw.json";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import { useState } from "react";

function CustomerDashboard({ user, setUser }) {
  const navigate = useNavigate();
  const [showServices, setShowServices] = useState(false);
  const [showCare, setShowCare] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const username = user?.displayName?.split(" ")[0] || "User";
  const userPhoto = user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=fff3e0&color=ff6f00`;


  const adImages = [
  "https://img.freepik.com/free-vector/hand-drawn-pet-shop-facebook-cover-template_23-2150383109.jpg", // peeking pets banner :contentReference[oaicite:3]{index=3}
  "https://img.pikbest.com/origin/06/17/98/79YpIkbEsTNbH.jpg!bw700", // puppy in grass :contentReference[oaicite:4]{index=4}
  "https://i.pinimg.com/736x/22/24/70/222470d2199ab493f637ce5e6e315095.jpg" // cute pet banner :contentReference[oaicite:5]{index=5}
];


  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: false
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#fff3e0' }}>
      {/* Header */}
      <div className="bg-white shadow-md text-center py-4 text-2xl font-extrabold tracking-wide text-orange-800">
        huggle 🐾
      </div>

      {/* Top Greeting & Logout */}
      <div className="flex items-center justify-between px-4 py-4 sm:py-3 lg:py-2 xl:py-1 bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <img src={userPhoto} alt="User" className="w-10 h-10 rounded-full border" />
          <h2 className="text-lg font-bold text-gray-800">Hi {username}</h2>
        </div>
        <button onClick={handleLogout} className="hover:text-red-600 transition">
          <LogOut />
        </button>
      </div>

      {/* Advertisement Carousel */}
      <div className="px-4 py-2">
        <Slider {...sliderSettings}>
          {adImages.map((src, index) => (
           <div className="rounded-xl overflow-hidden shadow-xl aspect-[16/9] w-full max-h-60">
  <img
    src={src}
    alt={`Ad ${index}`}
    className="w-full h-full object-cover"
  />
</div>

          ))}
        </Slider>
      </div>

      {/* Vaccination Info */}
      <div className="bg-white mx-4 mt-4 p-4 rounded-2xl shadow-lg flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">Vaccination Calendar</p>
          <h3 className="text-lg font-bold text-gray-800">Next: July 10, 2025</h3>
        </div>
        <Lottie animationData={pawAnimation} className="w-20 h-20" loop={true} />
      </div>

      {/* Spacer to push bottom nav */}
      <div className="flex-grow"></div>

      {/* Services Popup */}
      {showServices && (
        <SubMenu>
          <ServiceCard label="Find Vets" icon={<HeartPulse />} onClick={() => navigate("/services?type=vet")} />
          <ServiceCard label="Groomers" icon={<Scissors />} onClick={() => navigate("/services?type=groomer")} />
        </SubMenu>
      )}

      {showCare && (
        <SubMenu>
          <ServiceCard label="Vaccination" icon={<CalendarDays />} onClick={() => navigate("/calendar")} />
          <ServiceCard label="Diet Plan" icon={<UtensilsCrossed />} onClick={() => navigate("/services?type=diet")} />
        </SubMenu>
      )}

      {/* Bottom Nav */}
      <div className="flex justify-around items-center py-5 sm:py-4 lg:py-3 bg-white shadow-inner border-t border-gray-200 text-xs font-semibold">
        <BottomNavItem label="My Pets" icon={<PawPrint />} onClick={() => navigate("/add-pet")} />
        <BottomNavItem label="Shop" icon={<ShoppingBag />} onClick={() => navigate("/services?type=shop")} />
        <BottomNavItem label="Pet Care" icon={<Dog />} onClick={() => {
          setShowCare(!showCare);
          setShowServices(false);
        }} />
        <BottomNavItem label="Socials" icon={<Users />} onClick={() => navigate("/services?type=social")} />
        <BottomNavItem label="Services" icon={<Sparkles />} onClick={() => {
          setShowServices(!showServices);
          setShowCare(false);
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
    <div className="absolute bottom-20 left-0 right-0 mx-auto w-full px-4 z-50">
      <div className="bg-white border border-orange-300 rounded-xl shadow-2xl p-4 grid grid-cols-2 gap-4 animate-fade-in-up transition-transform duration-500">
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