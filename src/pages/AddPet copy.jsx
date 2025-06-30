import { useState, useEffect, useRef } from "react";
import {
  Dog,
  Cat,
  Rabbit,
  Fish,
  Camera,
  Trash2,
  Pencil,
  Home,
  Plus,
  Info,
  ShieldAlert
} from "lucide-react";
import { db, storage } from "../firebase";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";
import cartoonBg from "../assets/cartoon-bg.jpg";
import Lottie from "lottie-react";
import petAnimation from "../assets/lottie/pet-id-card.json";

const defaultImages = {
  Dog: "/default-dog.jpg",
  Cat: "/default-cat.jpg",
  Rabbit: "/default-rabbit.jpg",
  Fish: "/default-fish.jpg"
};

const breeds = {
  Dog: ["Labrador", "Beagle", "Pug", "Golden Retriever", "Bulldog"],
  Cat: ["Persian", "Siamese", "Bengal", "Sphynx", "Maine Coon"],
  Rabbit: ["Holland Lop", "Lionhead", "Dutch", "Flemish Giant"],
  Fish: ["Goldfish", "Betta", "Guppy", "Angelfish"]
};

const vaccineCatalog = {
  Dog: [
    { name: "Rabies", priority: "Core", recurring: true },
    { name: "Parvovirus", priority: "Core", recurring: false },
    { name: "Distemper", priority: "Core", recurring: false },
    { name: "Hepatitis", priority: "Core", recurring: false },
    { name: "Parainfluenza", priority: "Core", recurring: false },
    { name: "Leptospirosis", priority: "Important", recurring: true },
    { name: "Bordetella", priority: "Seasonal", recurring: false },
    { name: "Canine Influenza", priority: "Seasonal", recurring: false },
    { name: "Coronavirus", priority: "Rare", recurring: false }
  ],
  Cat: [
    { name: "Rabies", priority: "Core", recurring: true },
    { name: "Feline Herpesvirus", priority: "Core", recurring: false },
    { name: "Calicivirus", priority: "Core", recurring: false },
    { name: "Panleukopenia", priority: "Core", recurring: false },
    { name: "Feline Leukemia", priority: "Important", recurring: false },
    { name: "FIV", priority: "Rare", recurring: false }
  ],
  Rabbit: [
    { name: "Myxomatosis", priority: "Core", recurring: true },
    { name: "VHD1", priority: "Core", recurring: false },
    { name: "VHD2", priority: "Core", recurring: false }
  ],
  Fish: []
};

const meds = {
  Dog: ["Deworming Tablet", "Multivitamin Syrup", "Calcium Boost"],
  Cat: ["Hairball Remedy", "Deworming Syrup", "Vitamin B Complex"],
  Rabbit: ["Coccidiostat", "Probiotic Drops"],
  Fish: ["Anti-fungal Drops", "Water Conditioner"]
};

export default function AddPet() {
  const [user] = useAuthState(auth);
  const [pets, setPets] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formVisible, setFormVisible] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef();

  const [petData, setPetData] = useState({
    name: "",
    dob: "",
    sex: "Male",
    type: "Dog",
    breed: "",
    allergies: "",
    image: null,
    vaccines: [],
    meds: []
  });

  const fetchPets = async () => {
    if (!user) return;
    const snapshot = await getDocs(collection(db, "users", user.uid, "pets"));
    const petsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setPets(petsData);
  };

  useEffect(() => {
    fetchPets();
  }, [user]);

  const handleChange = e => {
    setPetData({ ...petData, [e.target.name]: e.target.value });
  };

  const handleTypeChange = type => {
    setPetData(prev => ({ ...prev, type, breed: "", vaccines: [], meds: [] }));
  };

  const handleCheckbox = (field, value) => {
    setPetData(prev => {
      const list = prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value];
      return { ...prev, [field]: list };
    });
  };

  const handleImageChange = e => {
    const file = e.target.files[0];
    if (file) {
      setPetData({ ...petData, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (file, petName) => {
    const fileRef = ref(storage, `pets/${user.uid}/${petName}-${Date.now()}`);
    await uploadBytes(fileRef, file);
    return await getDownloadURL(fileRef);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    let imageUrl = defaultImages[petData.type];

    if (petData.image) {
      imageUrl = await uploadImage(petData.image, petData.name);
    }

    const enrichedVaccines = petData.vaccines.map(v => {
      const vInfo = vaccineCatalog[petData.type].find(obj => obj.name === v);
      return { name: v, priority: vInfo?.priority || "Unknown", recurring: vInfo?.recurring || false };
    });

    const dataToSave = {
      ...petData,
      image: imageUrl,
      vaccines: enrichedVaccines
    };

    if (editingId) {
      await updateDoc(doc(db, "users", user.uid, "pets", editingId), dataToSave);
    } else {
      await addDoc(collection(db, "users", user.uid, "pets"), dataToSave);
    }

    setPetData({
      name: "",
      dob: "",
      sex: "Male",
      type: "Dog",
      breed: "",
      allergies: "",
      image: null,
      vaccines: [],
      meds: []
    });
    fileInputRef.current.value = "";
    setImagePreview(null);
    setFormVisible(false);
    setEditingId(null);
    fetchPets();
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Core": return "bg-red-100 text-red-800 border-red-300";
      case "Important": return "bg-orange-100 text-orange-800 border-orange-300";
      case "Seasonal": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "Rare": return "bg-purple-100 text-purple-800 border-purple-300";
      default: return "bg-gray-100 text-gray-600 border-gray-300";
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-orange-700">🐾 My Pets</h1>
        <button
          onClick={() => setFormVisible(!formVisible)}
          className="animate-pulse bg-gradient-to-r from-orange-400 to-pink-500 hover:scale-105 transition-transform px-4 py-2 rounded-full text-white font-bold shadow-lg flex items-center gap-2"
        >
          <Plus size={18} /> Add Pet
        </button>
      </div>

      {pets.map(pet => (
        <div
          key={pet.id}
          className="p-3 bg-white rounded-xl shadow border cursor-pointer hover:scale-[1.02] transition-transform"
          onClick={() => setSelectedPetId(pet.id)}
        >
          <div className="flex items-center gap-3">
            <img src={pet.image} className="w-14 h-14 rounded-full object-cover" />
            <div>
              <p className="font-semibold text-gray-800">{pet.name}</p>
              <p className="text-xs text-gray-500">{pet.breed}</p>
              <p className="text-xs text-gray-400">{pet.vaccines?.length} vaccines</p>
            </div>
          </div>
        </div>
      ))}

      {selectedPetId && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center">
          <div className="bg-white max-w-sm w-full p-6 rounded-xl relative shadow-xl">
            <Lottie animationData={petAnimation} className="w-20 mx-auto" />
            <button
              className="absolute top-2 right-3 text-red-500 font-bold"
              onClick={() => setSelectedPetId(null)}
            >✕</button>
            {(() => {
              const pet = pets.find(p => p.id === selectedPetId);
              return (
                <div className="space-y-2">
                  <img src={pet.image} className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-orange-300" />
                  <h2 className="text-center text-xl font-bold text-gray-800">{pet.name}</h2>
                  <p className="text-center text-sm text-gray-500">{pet.type} • {pet.breed}</p>
                  <p className="text-center text-sm text-gray-400">DOB: {pet.dob}</p>
                  <div className="mt-3">
                    <h4 className="text-sm font-semibold mb-1">Vaccinations:</h4>
                    <div className="flex flex-wrap gap-2">
                      {pet.vaccines?.map(v => (
                        <span
                          key={v.name}
                          className={`px-2 py-1 rounded-full text-xs border ${getPriorityColor(v.priority)}`}
                        >
                          {v.name}{v.recurring && " ⭐"}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => {
                        setPetData({ ...pet, image: null });
                        setImagePreview(pet.image);
                        setFormVisible(true);
                        setEditingId(pet.id);
                        setSelectedPetId(null);
                      }}
                      className="w-full bg-blue-500 text-white py-2 rounded"
                    >Edit</button>
                    <button
                      onClick={async () => {
                        await deleteDoc(doc(db, "users", user.uid, "pets", pet.id));
                        fetchPets();
                        setSelectedPetId(null);
                      }}
                      className="w-full bg-red-500 text-white py-2 rounded"
                    >Delete</button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {formVisible && (
        <form
          onSubmit={handleSubmit}
          className="mt-4 bg-white border p-4 rounded-xl shadow space-y-4"
        >
          <div className="text-center">
            <div
              className="w-24 h-24 mx-auto rounded-full border-4 border-dashed bg-cover bg-center relative cursor-pointer"
              style={{ backgroundImage: `url(${cartoonBg})` }}
              onClick={() => fileInputRef.current.click()}
            >
              {imagePreview && <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-full" />}
              {!imagePreview && <Camera className="text-gray-400 w-6 h-6 absolute top-9 left-9" />}
            </div>
            <input type="file" accept="image/*" hidden ref={fileInputRef} onChange={handleImageChange} />
            <p className="text-sm text-gray-500 mt-1">Tap to upload pet image</p>
          </div>

          <input name="name" value={petData.name} onChange={handleChange} placeholder="Pet Name" className="w-full border p-2 rounded" required />

          <div className="flex gap-2">
            <input name="dob" type="date" value={petData.dob} onChange={handleChange} className="w-full border p-2 rounded" required />
            <select name="sex" value={petData.sex} onChange={handleChange} className="w-full border p-2 rounded">
              <option>Male</option>
              <option>Female</option>
            </select>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {Object.entries({ Dog, Cat, Rabbit, Fish }).map(([type, Icon]) => (
              <button
                key={type}
                type="button"
                className={`p-2 border rounded flex flex-col items-center ${petData.type === type ? "bg-orange-100 border-orange-500" : ""}`}
                onClick={() => handleTypeChange(type)}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{type}</span>
              </button>
            ))}
          </div>

          <input
            list="breed-options"
            name="breed"
            value={petData.breed}
            onChange={handleChange}
            placeholder="Search Breed"
            className="w-full border p-2 rounded"
            required
          />
          <datalist id="breed-options">
            {breeds[petData.type]?.map(b => <option key={b} value={b} />)}
          </datalist>

          <input
            name="allergies"
            value={petData.allergies}
            onChange={handleChange}
            placeholder="Allergies (optional)"
            className="w-full border p-2 rounded"
          />

          <div>
            <p className="text-sm font-semibold text-gray-600">Select Vaccines Given</p>
            <div className="grid grid-cols-2 gap-1">
              {vaccineCatalog[petData.type]?.map(v => (
                <label key={v.name} className="flex gap-2 text-sm items-center">
                  <input type="checkbox" checked={petData.vaccines.includes(v.name)} onChange={() => handleCheckbox("vaccines", v.name)} />
                  <span className={`px-2 py-1 rounded-full text-xs border ${getPriorityColor(v.priority)}`}>{v.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-600">Other Medications</p>
            <div className="grid grid-cols-2 gap-1">
              {meds[petData.type]?.map(m => (
                <label key={m} className="flex gap-2 text-sm">
                  <input type="checkbox" checked={petData.meds.includes(m)} onChange={() => handleCheckbox("meds", m)} /> {m}
                </label>
              ))}
            </div>
          </div>

          <div className="text-xs text-gray-500 flex items-center gap-1">
            <ShieldAlert className="w-4 h-4 text-yellow-500" />
            <span>⭐ = Recurring. Colors: Red = Core, Orange = Important, Yellow = Seasonal, Purple = Rare.</span>
          </div>

          <div className="flex gap-2">
            <button type="submit" className="w-full bg-green-600 text-white py-2 rounded font-semibold">{editingId ? "Update" : "Save & Continue"}</button>
            <button
              type="button"
                            onClick={() => {
                setFormVisible(false);
                setPetData({
                  name: "",
                  dob: "",
                  sex: "Male",
                  type: "Dog",
                  breed: "",
                  allergies: "",
                  image: null,
                  vaccines: [],
                  meds: []
                });
                setImagePreview(null);
                setEditingId(null);
              }}
              className="w-full bg-gray-200 text-gray-800 py-2 rounded font-semibold hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>

          {/* Legend for color codes */}
          <div className="mt-4 p-3 bg-gray-50 rounded text-xs text-gray-600">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="w-3 h-3 bg-red-300 rounded-full" /> Core
              <span className="w-3 h-3 bg-orange-300 rounded-full ml-3" /> Important
              <span className="w-3 h-3 bg-yellow-300 rounded-full ml-3" /> Seasonal
              <span className="w-3 h-3 bg-purple-300 rounded-full ml-3" /> Rare
            </div>
            <p>⭐ = Recurring vaccines or medications (they repeat)</p>
          </div>
        </form>
      )} {/* End of formVisible block */}

    </div>
  ); // End of return
} // End of AddPet component
