import { useState, useEffect, useRef } from "react";
import { Dog, Cat, Rabbit, Fish, Camera, Trash2, Pencil, Home } from "lucide-react";

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

export default function AddPet() {
  const [pets, setPets] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formVisible, setFormVisible] = useState(false);

  const fileInputRef = useRef();

  const [petData, setPetData] = useState({
    name: "",
    dob: "",
    sex: "Male",
    type: "Dog",
    breed: "",
    allergies: "",
    image: null
  });

  useEffect(() => {
    const stored = localStorage.getItem("pets");
    if (stored) setPets(JSON.parse(stored));
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPetData({ ...petData, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleChange = (e) => {
    setPetData({ ...petData, [e.target.name]: e.target.value });
  };

  const handleTypeChange = (type) => {
    setPetData((prev) => ({
      ...prev,
      type,
      breed: "", // reset breed on type change
    }));
  };

  const handleSexToggle = (sex) => {
    setPetData({ ...petData, sex });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const image = petData.image
      ? URL.createObjectURL(petData.image)
      : defaultImages[petData.type];

    const updatedPet = { ...petData, image };

    let updatedPets;
    if (editingIndex !== null) {
      updatedPets = [...pets];
      updatedPets[editingIndex] = updatedPet;
      setEditingIndex(null);
    } else {
      updatedPets = [...pets, updatedPet];
    }

    setPets(updatedPets);
    localStorage.setItem("pets", JSON.stringify(updatedPets));

    // Reset
    setPetData({
      name: "",
      dob: "",
      sex: "Male",
      type: "Dog",
      breed: "",
      allergies: "",
      image: null
    });
    setImagePreview(null);
    fileInputRef.current.value = "";
    setFormVisible(false);
  };

  const handleDelete = (index) => {
    const filtered = pets.filter((_, i) => i !== index);
    setPets(filtered);
    localStorage.setItem("pets", JSON.stringify(filtered));
  };

  const handleEdit = (index) => {
    const pet = pets[index];
    setPetData({
      ...pet,
      image: null
    });
    setImagePreview(pet.image);
    setEditingIndex(index);
    setFormVisible(true);
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-6">
      {/* Header with Home button */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Your Pets</h1>
        <a href="http://localhost:5173/" className="text-blue-600 flex items-center gap-1">
          <Home size={18} />
          <span className="text-sm">Home</span>
        </a>
      </div>

      {/* List of Pets */}
      {pets.map((pet, index) => (
        <div key={index} className="flex items-center justify-between border p-2 rounded-lg bg-gray-50">
          <div className="flex items-center gap-3">
            <img src={pet.image} alt="pet" className="w-12 h-12 rounded-full object-cover" />
            <div>
              <p className="font-semibold">{pet.name}</p>
              <p className="text-sm text-gray-500">{pet.breed}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => handleEdit(index)} className="text-blue-500"><Pencil size={16} /></button>
            <button onClick={() => handleDelete(index)} className="text-red-500"><Trash2 size={16} /></button>
          </div>
        </div>
      ))}

      <hr />

      {/* Toggle Add/Edit Form */}
      {!formVisible && (
        <button
          onClick={() => setFormVisible(true)}
          className="w-full bg-green-600 text-white py-2 rounded"
        >
          Add Pet
        </button>
      )}

      {formVisible && (
        <form onSubmit={handleSubmit} className="space-y-4 border-t pt-4">
          <h2 className="text-lg font-semibold">{editingIndex !== null ? "Edit Pet" : "Add Pet"}</h2>

          {/* Image Upload */}
          <div className="flex justify-center">
            <div
              onClick={() => fileInputRef.current.click()}
              className="relative w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed flex items-center justify-center cursor-pointer"
            >
              {imagePreview ? (
                <img src={imagePreview} alt="preview" className="w-full h-full object-cover rounded-full" />
              ) : (
                <Camera className="text-gray-400 w-6 h-6" />
              )}
            </div>
          </div>
          <input
            type="file"
            accept="image/*"
            hidden
            ref={fileInputRef}
            onChange={handleImageChange}
          />
          <p className="text-center text-sm text-gray-400">Upload profile picture</p>

          <input
            type="text"
            name="name"
            value={petData.name}
            onChange={handleChange}
            placeholder="Pet Name"
            required
            className="w-full border p-2 rounded"
          />

          <div className="flex justify-between">
            <div className="w-1/2 pr-2">
              <label className="block text-sm text-gray-500">Date of birth</label>
              <input
                type="date"
                name="dob"
                value={petData.dob}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                required
              />
            </div>
            <div className="w-1/2 pl-2">
              <label className="block text-sm text-gray-500">Sex</label>
              <div className="flex mt-1">
                {["Male", "Female"].map((sex) => (
                  <button
                    key={sex}
                    type="button"
                    className={`flex-1 border rounded p-2 mx-1 ${
                      petData.sex === sex ? "bg-blue-100 border-blue-500 font-semibold" : "bg-white"
                    }`}
                    onClick={() => handleSexToggle(sex)}
                  >
                    {sex}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Type Selection */}
          <div>
            <label className="text-sm text-gray-500 mb-1 block">Pet Type</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { type: "Dog", icon: <Dog className="w-5 h-5" /> },
                { type: "Cat", icon: <Cat className="w-5 h-5" /> },
                { type: "Rabbit", icon: <Rabbit className="w-5 h-5" /> },
                { type: "Fish", icon: <Fish className="w-5 h-5" /> }
              ].map(({ type, icon }) => (
                <button
                  key={type}
                  type="button"
                  className={`flex flex-col items-center justify-center p-2 rounded border ${
                    petData.type === type ? "bg-blue-100 border-blue-500 font-semibold" : "bg-white"
                  }`}
                  onClick={() => handleTypeChange(type)}
                >
                  {icon}
                  <span className="text-xs mt-1">{type}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Breed Dropdown */}
          <div>
            <label className="block text-sm text-gray-500 mb-1">Breed</label>
            <input
              list="breed-options"
              name="breed"
              value={petData.breed}
              onChange={handleChange}
              placeholder={`Search ${petData.type} breeds...`}
              className="w-full border p-2 rounded"
              required
            />
            <datalist id="breed-options">
              {breeds[petData.type]?.map((breed) => (
                <option key={breed} value={breed} />
              ))}
            </datalist>
          </div>

          {/* Allergies */}
          <input
            type="text"
            name="allergies"
            value={petData.allergies}
            onChange={handleChange}
            placeholder="Known Allergies (optional)"
            className="w-full border p-2 rounded"
          />

          <div className="flex gap-2">
            <button type="submit" className="w-full bg-green-600 text-white py-2 rounded">
              {editingIndex !== null ? "Update Pet" : "Save & Continue"}
            </button>
            <button
              type="button"
              className="w-full bg-gray-300 text-gray-700 py-2 rounded"
              onClick={() => {
                setFormVisible(false);
                setEditingIndex(null);
                setPetData({
                  name: "",
                  dob: "",
                  sex: "Male",
                  type: "Dog",
                  breed: "",
                  allergies: "",
                  image: null
                });
                setImagePreview(null);
                fileInputRef.current.value = "";
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
