import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Player } from '@lottiefiles/react-lottie-player';
import { FaUserCircle, FaCreditCard, FaPaw, FaChevronLeft, FaChevronRight, FaCheckCircle, FaTimesCircle, FaGift, FaEnvelope, FaCalendarAlt, FaHome, FaMapMarkerAlt, FaPhoneAlt, FaRegAddressCard } from 'react-icons/fa';
import { MdAccountCircle, MdEdit } from 'react-icons/md';

// Import your Firebase instances and Firestore functions
import { db, auth } from '../firebase'; // <--- IMPORTANT: Adjust the path to your firebaseConfig.js
import { doc, getDoc, collection, getDocs, updateDoc } from 'firebase/firestore';

// Import useNavigate for navigation
import { useNavigate } from 'react-router-dom';

// Lottie animation data (replace with your actual Lottie JSON)
import LottiePetBackground from '../assets/lottie/lottie-pet-background.json'; // <--- IMPORTANT: Ensure this path is correct

const CustomerProfile = () => {
  const [customerData, setCustomerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPetIndex, setCurrentPetIndex] = useState(0);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressInput, setAddressInput] = useState({
    houseFlatNo: '',    // New mandatory field
    streetLocality: '', // New mandatory field
    city: '',
    state: '',
    zipCode: '',        // Mandatory
    phone: ''           // Mandatory
  });
  const [addressSaveLoading, setAddressSaveLoading] = useState(false);
  const [addressSaveError, setAddressSaveError] = useState(null);

  const navigate = useNavigate(); // Initialize useNavigate

  // Fetch data
  useEffect(() => {
    const fetchCustomerData = async () => {
      setLoading(true);
      setError(null);

      const currentUser = auth.currentUser;

      if (!currentUser) {
        setError("No authenticated user found. Please log in.");
        setLoading(false);
        return;
      }

      try {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          
          const petsCollectionRef = collection(userDocRef, "pets");
          const petsSnapshot = await getDocs(petsCollectionRef);
          const petsData = petsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

          setCustomerData({
            uid: currentUser.uid,
            ...userData,
            pets: petsData,
          });

          // Initialize address form if data exists
          if (userData.address) {
            setAddressInput({
              houseFlatNo: userData.address.houseFlatNo || '',
              streetLocality: userData.address.streetLocality || '',
              city: userData.address.city || '',
              state: userData.address.state || '',
              zipCode: userData.address.zipCode || '',
              phone: userData.address.phone || ''
            });
          }
        } else {
          setError("Customer profile not found. Please ensure your user data exists in Firestore.");
        }
      } catch (err) {
        console.error("Error fetching customer data:", err);
        setError("Failed to load profile data. " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, []);

  // Handle pet slider navigation
  const handleNextPet = () => {
    if (customerData && customerData.pets && customerData.pets.length > 1) {
      setCurrentPetIndex((prevIndex) => (prevIndex + 1) % customerData.pets.length);
    }
  };

  const handlePrevPet = () => {
    if (customerData && customerData.pets && customerData.pets.length > 1) {
      setCurrentPetIndex((prevIndex) => (prevIndex - 1 + customerData.pets.length) % customerData.pets.length);
    }
  };

  // Handle address input changes
  const handleAddressInputChange = (e) => {
    const { name, value } = e.target;
    setAddressInput(prev => ({ ...prev, [name]: value }));
  };

  // Save/Update address
  const handleSaveAddress = async () => {
    setAddressSaveLoading(true);
    setAddressSaveError(null);

    // Validate all mandatory fields
    if (
      !addressInput.houseFlatNo ||
      !addressInput.streetLocality ||
      !addressInput.city ||
      !addressInput.state ||
      !addressInput.zipCode ||
      !addressInput.phone
    ) {
      setAddressSaveError("All address fields are mandatory!");
      setAddressSaveLoading(false);
      return;
    }
    
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setAddressSaveError("No authenticated user. Cannot save address.");
      setAddressSaveLoading(false);
      return;
    }

    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, {
        address: addressInput
      });
      setCustomerData(prev => ({ ...prev, address: addressInput }));
      setShowAddressForm(false); // Hide form on success
    } catch (err) {
      console.error("Error saving address:", err);
      setAddressSaveError("Failed to save address. " + err.message);
    } finally {
      setAddressSaveLoading(false);
    }
  };

  // Function to determine pet image source, handling /default-dog.jpg
  const getPetImageSrc = (imagePath, petName) => {
    if (imagePath && imagePath.startsWith('/')) {
        // Assuming /default-dog.jpg is in your public/images/ folder
        return `/images${imagePath}`; // <--- ADJUST THIS LINE if your public images are in public/assets or elsewhere
    }
    return imagePath || `https://via.placeholder.com/100/FFDAB9/D2691E?text=${petName.substring(0,1).toUpperCase()}`;
  };

  // Loading, Error, No Data states
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-creamy-orange font-sans">
        <div className="text-primary-orange text-3xl font-bold animate-pulse">
          <FaPaw className="inline-block mr-3 text-4xl" /> Fetching Fun...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-card-light-orange text-text-dark font-sans p-6 rounded-lg shadow-xl">
        <FaTimesCircle className="text-6xl text-dark-orange mb-6 animate-bounceIn" />
        <p className="text-xl font-semibold mb-3">Oops! Something went wrong.</p>
        <p className="text-lg text-center leading-relaxed">{error}</p>
        <p className="text-sm mt-4 text-gray-600">Please wag your tail and try again later!</p>
      </div>
    );
  }

  if (!customerData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-creamy-orange font-sans p-4">
        <p className="text-xl text-text-dark font-medium">No customer data available. Please ensure you are logged in.</p>
      </div>
    );
  }

  const { name, photoURL, uid, email, createdAt, subscription, pets, address } = customerData;
  const currentPet = pets[currentPetIndex];
  const isSubscriptionActive = subscription?.active;
  const subscriptionExpiryDate = subscription?.expiryDate ? new Date(subscription.expiryDate).toLocaleDateString() : 'N/A';
  const subscriptionPlan = subscription?.plan || 'Free';

  return (
    <div className="relative min-h-screen bg-bg-creamy-orange font-sans overflow-hidden flex flex-col items-center pt-4 pb-8 px-2 sm:px-4 lg:px-6">
      {/* Background Lottie Animation */}
      <div className="absolute inset-0 w-full h-full opacity-40 z-0 pointer-events-none">
        <Player
          autoplay
          loop
          src={LottiePetBackground}
          style={{ height: '100%', width: '100%' }}
        />
      </div>

      {/* Home Button */}
      <motion.button
        onClick={() => navigate('/dashboard')}
        className="absolute top-4 left-4 sm:top-6 sm:left-6 bg-primary-orange text-text-light p-3 rounded-full shadow-lg hover:bg-dark-orange transition-all duration-300 transform active:scale-90 z-20 flex items-center gap-2 text-sm font-semibold"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <FaHome className="text-xl" /> <span className="hidden sm:inline">Home</span>
      </motion.button>

      {/* Main Content Container */}
      <motion.div
        className="relative z-10 w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 p-4 md:p-6 mt-12 md:mt-4" // Adjusted mt for home button
        initial={{ opacity: 0, y: 30 }} // Less initial Y-offset
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        {/* Profile Card */}
        <motion.div
          className="md:col-span-1 bg-card-light-orange rounded-3xl p-5 shadow-xl flex flex-col items-center justify-center border-4 border-primary-orange animate-bounceIn"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2, type: "spring", stiffness: 100 }}
        >
          <motion.div
            className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-dark-orange shadow-lg mb-4 transform -rotate-3"
            whileHover={{ scale: 1.05, rotate: 3 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <img src={photoURL || 'https://via.placeholder.com/120/FFA07A/D2691E?text=You'} alt="Profile" className="w-full h-full object-cover" />
          </motion.div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-text-dark text-center mb-2 leading-tight drop-shadow-md">
            {name}
          </h2>
          <div className="text-text-dark text-center text-sm">
            <p className="flex items-center justify-center mb-1">
              <MdAccountCircle className="mr-2 text-primary-orange text-lg" /> <span className="font-semibold">UID:</span> <span className="font-mono text-xs ml-1 px-2 py-1 rounded-full bg-primary-orange text-text-light">{uid.substring(0, 10)}...</span>
            </p>
            <p className="flex items-center justify-center mb-1">
              <FaEnvelope className="mr-2 text-primary-orange text-lg" /> {email}
            </p>
            <p className="flex items-center justify-center">
              <FaCalendarAlt className="mr-2 text-primary-orange text-lg" /> Joined: {new Date(createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* Address Section */}
          <div className="mt-4 w-full text-center">
            {address && !showAddressForm ? (
              <motion.div
                className="bg-primary-orange/20 border border-primary-orange rounded-lg p-3 text-sm text-text-dark relative"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h4 className="font-bold mb-1 flex items-center justify-center"><FaRegAddressCard className="mr-2" /> Your Address:</h4>
                <p>{address.houseFlatNo}</p>
                <p>{address.streetLocality}</p>
                <p>{address.city}, {address.state}</p>
                <p>PIN: {address.zipCode}</p>
                <p>Phone: {address.phone}</p>
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="absolute top-1 right-1 p-1 bg-primary-orange text-white rounded-full hover:bg-dark-orange transition-colors"
                  aria-label="Edit Address"
                >
                  <MdEdit className="text-sm" />
                </button>
              </motion.div>
            ) : (
              <button
                onClick={() => setShowAddressForm(true)}
                className="mt-4 bg-primary-orange text-white py-2 px-4 rounded-full shadow-md hover:bg-dark-orange transition-colors font-semibold flex items-center justify-center mx-auto"
              >
                <FaMapMarkerAlt className="mr-2" /> Add Address
              </button>
            )}

            {showAddressForm && (
              <AnimatePresence> {/* Add AnimatePresence for exit animations */}
                <motion.div
                  className="mt-4 bg-primary-orange/20 border border-primary-orange rounded-lg p-3 w-full"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <h4 className="font-bold text-text-dark mb-3 text-lg">
                    {address ? 'Edit Address' : 'Add New Address'}
                  </h4>
                  <div className="grid grid-cols-1 gap-2 text-left text-sm">
                    <input
                      type="text"
                      name="houseFlatNo"
                      placeholder="House/Flat No."
                      value={addressInput.houseFlatNo}
                      onChange={handleAddressInputChange}
                      className="p-2 border border-primary-orange rounded-md focus:outline-none focus:ring-2 focus:ring-dark-orange bg-white/70 text-text-dark"
                      required
                    />
                    <input
                      type="text"
                      name="streetLocality"
                      placeholder="Street, Locality"
                      value={addressInput.streetLocality}
                      onChange={handleAddressInputChange}
                      className="p-2 border border-primary-orange rounded-md focus:outline-none focus:ring-2 focus:ring-dark-orange bg-white/70 text-text-dark"
                      required
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        name="city"
                        placeholder="City"
                        value={addressInput.city}
                        onChange={handleAddressInputChange}
                        className="p-2 border border-primary-orange rounded-md focus:outline-none focus:ring-2 focus:ring-dark-orange bg-white/70 text-text-dark"
                        required
                      />
                      <input
                        type="text"
                        name="state"
                        placeholder="State"
                        value={addressInput.state}
                        onChange={handleAddressInputChange}
                        className="p-2 border border-primary-orange rounded-md focus:outline-none focus:ring-2 focus:ring-dark-orange bg-white/70 text-text-dark"
                        required
                      />
                    </div>
                    <input
                      type="text"
                      name="zipCode"
                      placeholder="PIN Code"
                      value={addressInput.zipCode}
                      onChange={handleAddressInputChange}
                      className="p-2 border border-primary-orange rounded-md focus:outline-none focus:ring-2 focus:ring-dark-orange bg-white/70 text-text-dark"
                      required
                    />
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Phone Number"
                      value={addressInput.phone}
                      onChange={handleAddressInputChange}
                      className="p-2 border border-primary-orange rounded-md focus:outline-none focus:ring-2 focus:ring-dark-orange bg-white/70 text-text-dark"
                      required
                    />
                  </div>
                  {addressSaveError && (
                    <p className="text-red-600 text-xs mt-2">{addressSaveError}</p>
                  )}
                  <div className="flex justify-end gap-2 mt-3">
                    <button
                      onClick={() => {
                        setShowAddressForm(false);
                        setAddressSaveError(null); // Clear error if canceling
                        // Reset form to current address if available, or empty
                        setAddressInput(customerData.address ? customerData.address : {
                          houseFlatNo: '', streetLocality: '', city: '', state: '', zipCode: '', phone: ''
                        });
                      }}
                      className="bg-gray-400 text-white py-1 px-3 rounded-full hover:bg-gray-500 transition-colors text-sm"
                      disabled={addressSaveLoading}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveAddress}
                      className="bg-dark-orange text-white py-1 px-3 rounded-full hover:bg-primary-orange transition-colors text-sm"
                      disabled={addressSaveLoading}
                    >
                      {addressSaveLoading ? 'Saving...' : 'Save Address'}
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </motion.div>

        {/* Pet Details & Subscription Details (Swapped positions) */}
        <div className="md:col-span-2 grid grid-rows-2 gap-6"> {/* Adjusted gap */}
          {/* Pet Details Card */}
          <motion.div
            className="bg-card-light-orange rounded-3xl p-5 shadow-xl border-4 border-primary-orange animate-bounceIn"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4, type: "spring", stiffness: 100 }}
          >
            <div className="flex items-center mb-4">
              <FaPaw className="text-4xl text-dark-orange mr-3 drop-shadow-md" />
              <h3 className="text-2xl sm:text-3xl font-bold text-text-dark">My Furry Friends!</h3>
            </div>

            {pets && pets.length > 0 ? (
              <AnimatePresence mode='popLayout'> {/* Changed to popLayout for potentially smoother feel */}
                <motion.div
                  key={currentPet.id}
                  initial={{ opacity: 0, x: 30 }} // Smaller x-offset for compactness
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.3, type: "spring", stiffness: 250, damping: 20 }} // Snappier spring
                  className="relative flex flex-col sm:flex-row items-center bg-bg-creamy-orange rounded-2xl p-4 shadow-inner border-2 border-primary-orange"
                >
                  <motion.div
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-dark-orange shadow-md flex-shrink-0 mb-3 sm:mb-0 sm:mr-4 transform rotate-6"
                    whileHover={{ scale: 1.05, rotate: -6 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <img src={getPetImageSrc(currentPet.image, currentPet.name)} alt={currentPet.name} className="w-full h-full object-cover" />
                  </motion.div>
                  <div className="text-center sm:text-left flex-grow">
                    <h4 className="text-2xl sm:text-3xl font-extrabold text-primary-orange mb-1 leading-tight">{currentPet.name}!</h4>
                    <p className="text-md text-text-dark mb-1 capitalize">{currentPet.breed} {currentPet.type} ({currentPet.sex})</p>
                    {currentPet.allergies && currentPet.allergies !== "" && <p className="text-sm text-red-600 italic">Allergies: {currentPet.allergies}</p>}
                    {currentPet.meds && currentPet.meds.length > 0 && (
                      <p className="text-sm text-purple-700 mt-1">Meds: {currentPet.meds.join(', ')}</p>
                    )}
                    {currentPet.vaccines && currentPet.vaccines.length > 0 && (
                        <p className="text-sm text-green-700 mt-1">Vaccines: {currentPet.vaccines.map(v => v.name).join(', ')}</p>
                    )}
                  </div>
                  {pets.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevPet}
                        className="absolute left-0 top-1/2 -translate-y-1/2 p-2 bg-dark-orange text-white rounded-full shadow-lg hover:bg-primary-orange transition-all duration-300 transform -translate-x-1/2 active:scale-95 z-20"
                        aria-label="Previous pet"
                      >
                        <FaChevronLeft className="text-lg" />
                      </button>
                      <button
                        onClick={handleNextPet}
                        className="absolute right-0 top-1/2 -translate-y-1/2 p-2 bg-dark-orange text-white rounded-full shadow-lg hover:bg-primary-orange transition-all duration-300 transform translate-x-1/2 active:scale-95 z-20"
                        aria-label="Next pet"
                      >
                        <FaChevronRight className="text-lg" />
                      </button>
                    </>
                  )}
                  {pets.length > 1 && (
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1.5"> {/* Smaller dots */}
                        {pets.map((_, index) => (
                            <div
                                key={index}
                                className={`w-2 h-2 rounded-full ${index === currentPetIndex ? 'bg-primary-orange' : 'bg-gray-400'}`}
                            ></div>
                        ))}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="text-center text-text-dark py-6">
                <FaPaw className="text-6xl text-primary-orange mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium">No furry friends yet. Time to add one!</p>
              </div>
            )}
          </motion.div>

          {/* Subscription Card */}
          <motion.div
            className={`bg-card-light-orange rounded-3xl p-5 shadow-xl border-4 ${isSubscriptionActive ? 'border-active-green' : 'border-inactive-gray'} relative overflow-hidden animate-bounceIn`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6, type: "spring", stiffness: 100 }}
          >
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-dark-orange rounded-full opacity-20 blur-lg"></div>
            <div className="flex items-center mb-4">
              <FaCreditCard className="text-4xl text-primary-orange mr-3 drop-shadow-md" />
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold text-text-dark mb-1">Your Fun Plan!</h3>
                <p className="text-lg text-text-dark">Plan: <span className="font-extrabold text-dark-orange uppercase">{subscriptionPlan}</span></p>
              </div>
            </div>
            <div className="flex justify-between items-center text-md sm:text-lg">
              <div className="flex items-center">
                {isSubscriptionActive ? (
                  <>
                    <FaCheckCircle className="text-active-green mr-2 text-2xl animate-pulseShine" />
                    <span className="font-semibold text-active-green">Active & Awesome!</span>
                  </>
                ) : (
                  <>
                    <FaTimesCircle className="text-inactive-gray mr-2 text-2xl" />
                    <span className="font-semibold text-inactive-gray">Inactive (Oh no!)</span>
                  </>
                )}
              </div>
              <div className="text-text-dark font-medium">
                Expires: {subscriptionExpiryDate}
              </div>
            </div>
            {isSubscriptionActive && (
                <motion.div
                    className="mt-3 text-xs text-gray-600 flex items-center justify-end"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                >
                    <FaGift className="mr-1 text-accent-pink" /> Keep the treats coming!
                </motion.div>
            )}
            <div className="absolute bottom-3 left-3 text-xs text-gray-500 font-mono">
                Order: {subscription?.razorpayOrderId ? subscription.razorpayOrderId.substring(0, 10) + '...' : 'N/A'}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default CustomerProfile;