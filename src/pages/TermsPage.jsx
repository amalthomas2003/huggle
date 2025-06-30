// TERMS OF SERVICE PAGE
export function TermsPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto text-gray-800">
      <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
      <p className="text-sm text-gray-500 mb-6">Last updated: June 29, 2025</p>

      <p className="mb-4">
        These Terms of Service ("Terms") govern your use of the PetPal app and website ("Service"), operated by PetPal Technologies ("we", "our", "us"). By using the Service, you agree to these Terms. If you do not agree, do not use the Service.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">1. Scope of Service</h2>
      <p className="mb-4">
        PetPal is a digital platform designed to assist pet owners with care tasks including:
      </p>
      <ul className="list-disc list-inside mb-4">
        <li>Tracking vaccination schedules based on Indian and global veterinary guidelines</li>
        <li>Providing diet plans tailored to pet type, breed, age, and weight</li>
        <li>Enabling search for nearby veterinarians, groomers, and pet services</li>
        <li>Managing pet profiles and storing medical history data</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">2. Medical Disclaimer</h2>
      <p className="mb-4">
        The Service provides informational content for general pet wellness only. It is not intended to replace professional veterinary consultation, diagnosis, or treatment. Always consult a licensed veterinarian before acting on information presented by PetPal. PetPal is a tool for guidance and reminders—not a substitute for expert medical care.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">3. Accuracy and Limitations</h2>
      <p className="mb-4">
        While we strive to ensure that all information is accurate and updated regularly, we do not guarantee the completeness, reliability, or suitability of any data provided. Vaccination schedules, breed-specific diet plans, and pet health recommendations are based on public and veterinary sources but may not apply to your specific pet’s condition.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">4. User Obligations</h2>
      <p className="mb-4">
        Users must:
      </p>
      <ul className="list-disc list-inside mb-4">
        <li>Provide true, accurate, and complete information about their pets</li>
        <li>Maintain confidentiality of their login credentials</li>
        <li>Use the platform in compliance with applicable laws and these Terms</li>
        <li>Refrain from using the platform for any unlawful or malicious purpose</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">5. Data Handling</h2>
      <p className="mb-4">
        We collect and process user data as outlined in our Privacy Policy. Use of the Service indicates your consent to such data processing.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">6. Intellectual Property</h2>
      <p className="mb-4">
        All content, branding, and features of the PetPal platform are owned by or licensed to PetPal Technologies. Unauthorized use, reproduction, or distribution is prohibited.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">7. Termination</h2>
      <p className="mb-4">
        We reserve the right to suspend or terminate access to the Service if a user violates these Terms or engages in harmful behavior.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">8. Modifications</h2>
      <p className="mb-4">
        These Terms may be updated periodically. Continued use of the Service constitutes acceptance of revised Terms.
      </p>

      <p className="mt-8 text-sm text-gray-500">
        For questions, contact us at: support@petpal.in
      </p>
    </div>
  );
}