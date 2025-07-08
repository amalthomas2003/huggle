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

const deleteImageFromStorage = async (imageUrl) => {
  if (!imageUrl || typeof imageUrl !== "string") return;

  try {
    const match = imageUrl.match(/\/o\/(.*?)\?/);
    if (!match || !match[1]) throw new Error("Invalid image URL");

    const path = decodeURIComponent(match[1]);
    const imageRef = ref(storage, path);
    await deleteObject(imageRef);
    console.log("✅ Deleted image from Firebase Storage");
  } catch (err) {
    console.error("❌ Failed to delete image from Storage:", err);
  }
};


import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";
import cartoonBg from "../assets/cartoon-bg.jpg";
import Lottie from "lottie-react";
import petAnimation from "../assets/lottie/pet-id-card.json";
import { useNavigate } from "react-router-dom";
import imageCompression from 'browser-image-compression';
import loadingLottie from "../assets/lottie/loadingcat.json";
import { useSubscription } from "../context/SubscriptionContext";
import subscriptionPetLimits from "../config/SubscriptionLimits";


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
  const { subscriptionPlan } = useSubscription();
  const currentLimit = subscriptionPetLimits[subscriptionPlan] || subscriptionPetLimits.free;

  const formRef = useRef(null);

  const [user] = useAuthState(auth);
  const navigate = useNavigate(); // ← ✅ Add this line here

  const [pets, setPets] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formVisible, setFormVisible] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

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
  const [petCount, setPetCount] = useState(0);

useEffect(() => {
  const fetchPetCount = async () => {
    const petsSnapshot = await getDocs(
      collection(db, "users", user.uid, "pets")
    );
    setPetCount(petsSnapshot.size);
  };

  if (user?.uid) {
    fetchPetCount();
  }
}, [user]);

  const fetchPets = async () => {
  if (!user) return;

  // Session cache check
  const cached = sessionStorage.getItem(`pets-${user.uid}`);
  if (cached) {
    try {
      setPets(JSON.parse(cached));
    } catch (err) {
      console.error("Failed to parse cached data:", err);
    }
  }

  // Always fetch fresh data in background
  try {
    const snapshot = await getDocs(collection(db, "users", user.uid, "pets"));
    const petsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setPets(petsData);
    sessionStorage.setItem(`pets-${user.uid}`, JSON.stringify(petsData));
  } catch (err) {
    console.error("Failed to fetch from Firestore:", err);
  }
};


  useEffect(() => {
    fetchPets();
  }, [user]);
  useEffect(() => {
  if (formVisible && formRef.current) {
    formRef.current.scrollIntoView({ behavior: "smooth" });
  }
}, [formVisible]);


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
  try {
    // Compression options
    const options = {
      maxSizeMB: 0.1, // Max size in MB
      maxWidthOrHeight: 400, // Resize if either dimension is above this
      useWebWorker: true,
    };

    // Compress the image
    const compressedFile = await imageCompression(file, options);

    // Upload to Firebase Storage
    const fileRef = ref(storage, `pets/${user.uid}/${petName}-${Date.now()}`);
    const snapshot = await uploadBytes(fileRef, compressedFile);
    const url = await getDownloadURL(snapshot.ref);
    return url;
  } catch (error) {
    console.error("Image compression/upload failed:", error);
    throw error;
  }
};


  const handleSubmit = async e => {
  e.preventDefault();
  setLoading(true);
  if (!editingId && petCount >= currentLimit) {
  navigate("/plans");
  setLoading(false);
  return;
}

  let imageUrl = defaultImages[petData.type];
let oldImageUrl = null;

if (editingId) {
  const petToEdit = pets.find(p => p.id === editingId);
  oldImageUrl = petToEdit?.image;
}


  if (petData.image) {
    imageUrl = await uploadImage(petData.image, petData.name);
    // 🧹 Delete old image if it exists and a new image was uploaded
if (oldImageUrl && oldImageUrl.startsWith("https://firebasestorage.googleapis.com")) {
  try {
    const url = new URL(oldImageUrl);
    const path = decodeURIComponent(url.pathname.split("/o/")[1].split("?")[0]);
    const oldRef = ref(storage, path);
    await deleteObject(oldRef);
    console.log("Old image deleted from Firebase Storage.");
  } catch (err) {
    console.warn("Failed to delete previous image:", err);
  }
}

  }

  const enrichedVaccines = petData.vaccines.map(v => {
    const vInfo = vaccineCatalog[petData.type].find(obj => obj.name === v);
    return {
      name: v,
      priority: vInfo?.priority || "Unknown",
      recurring: vInfo?.recurring || false
    };
  });

  const dataToSave = {
    ...petData,
    image: imageUrl,
    vaccines: enrichedVaccines
  };

  if (editingId) {
    await updateDoc(doc(db, "users", user.uid, "pets", editingId), dataToSave);
  } else {
    const docRef = await addDoc(collection(db, "users", user.uid, "pets"), dataToSave);
    await updateDoc(docRef, { id: docRef.id }); // optional: store ID in Firestore
  }

  // ✅ Update session cache
  const updatedPets = editingId
    ? pets.map(p => p.id === editingId ? { ...dataToSave, id: editingId } : p)
    : [...pets, { ...dataToSave, id: "temp" }]; // optional: replace "temp" with docRef.id if needed

  sessionStorage.setItem(`pets-${user.uid}`, JSON.stringify(updatedPets));

  // Reset form
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

  // Fetch fresh from Firestore to stay in sync
  fetchPets();
  setLoading(false);

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
  <div className="min-h-screen bg-[#ffe5b4] p-4">
    <div className="max-w-xl mx-auto">
      {loading && (
  <div className="fixed inset-0 bg-white bg-opacity-70 z-50 flex items-center justify-center">
    <Lottie animationData={loadingLottie} loop autoplay className="w-28 h-28" />
  </div>
)}


      <div className="flex justify-between items-center mb-4">
<h1 className="text-3xl font-extrabold text-orange-600 tracking-wide drop-shadow-lg">
  My Pets
</h1>

        <div className="relative inline-block">
  <div className="absolute inset-0 rounded-full animate-siri-glow pointer-events-none z-[-1]" />
  <div className="flex justify-between items-center mb-4">
  <div className="flex items-center gap-2">
    <button
      onClick={() => setFormVisible(!formVisible)}
      className="relative overflow-hidden px-5 py-2 rounded-full text-white font-bold bg-orange-500 hover:bg-orange-600 transition-all"
    >
      <span className="relative z-10 flex items-center gap-1">
        <Plus size={20} />  Pet
      </span>
    </button>
    <button
      onClick={() => navigate("/dashboard")}
      className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold px-4 py-2 rounded-full shadow flex items-center gap-1"
    >
      <Home size={18} /> Home
    </button>
  </div>
</div>

</div>

      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  {pets.map(pet => (
    <div
      key={pet.id}
      className="relative w-full h-[340px] sm:h-auto sm:aspect-[4/5] rounded-xl shadow-md border overflow-hidden cursor-pointer transition-transform hover:scale-[1.01]"
      onClick={() => setSelectedPetId(pet.id)}
    >
      {/* Background Image */}
      <img
        src={cartoonBg}
        alt=""
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* Blurred Overlay with Large Content */}
<div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-4 py-4 backdrop-blur-sm bg-white/20">
        <img
          src={pet.image}
          alt="Pet"
          className="w-32 h-32 sm:w-36 sm:h-36 object-cover rounded-full border-4 border-white shadow mb-3"
        />
        <p className="font-extrabold text-gray-800 text-2xl sm:text-3xl mb-1">{pet.name}</p>
        <p className="text-lg sm:text-xl text-gray-700 font-medium">{pet.breed}</p>
        <p className="text-base sm:text-lg text-gray-600">{pet.vaccines?.length} vaccines</p>
      </div>
    </div>
  ))}
</div>




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
                  <p className="text-center text-xs text-gray-500">Pet ID: {pet.id}</p>

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
                      setPetData({
                        ...pet,
                        image: null, // clear actual URL
                        vaccines: pet.vaccines.map(v => typeof v === "string" ? v : v.name), // ✅ Extract names only
                      });
                        setImagePreview(pet.image);
                        setFormVisible(true);
                        setEditingId(pet.id);
                        setSelectedPetId(null);
                      }}
                      className="w-full bg-blue-500 text-white py-2 rounded"
                    >Edit</button>
                    <button
                      onClick={async () => {
  try {
    const petToDelete = pets.find(p => p.id === pet.id);

    // 1. Delete image if custom
    if (petToDelete?.image && !petToDelete.image.includes("default")) {
      await deleteImageFromStorage(petToDelete.image);
    }

    // 2. Delete document
    await deleteDoc(doc(db, "users", user.uid, "pets", pet.id));

    // 3. Update UI and session
    const remainingPets = pets.filter(p => p.id !== pet.id);
    sessionStorage.setItem(`pets-${user.uid}`, JSON.stringify(remainingPets));
    setPets(remainingPets);
    setSelectedPetId(null);
  } catch (err) {
    console.error("Failed to delete pet and image:", err);
  }




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
  ref={formRef}
  onSubmit={handleSubmit}
  className="mt-4 bg-white border p-4 rounded-xl shadow space-y-4"
>

          <div className="text-center">
            <div
              className="w-24 h-24 mx-auto rounded-full border-4 border-dashed bg-cover bg-center relative cursor-pointer"
              style={{ backgroundImage: `url(${cartoonBg})` }}
              onClick={() => fileInputRef.current.click()}
            >
              {imagePreview ? (
  <div className="relative w-full h-full">
    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-full" />
    <button
      type="button"
      className="absolute -top-1 -right-1 bg-white text-red-600 rounded-full shadow p-1"
      onClick={() => {
        setImagePreview(null);
        setPetData(prev => ({ ...prev, image: null }));
        fileInputRef.current.value = "";
      }}
      title="Remove Image"
    >
      ✕
    </button>
  </div>
) : (
  <Camera className="text-gray-400 w-6 h-6 absolute top-9 left-9" />
)}

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
  </div>

  ); // End of return
} // End of AddPet component
