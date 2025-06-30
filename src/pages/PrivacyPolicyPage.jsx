// PRIVACY POLICY PAGE
export function PrivacyPolicyPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto text-gray-800">
      <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-6">Last updated: June 29, 2025</p>

      <p className="mb-4">
        PetPal Technologies ("we", "us", "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and protect your data.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">1. Information We Collect</h2>
      <ul className="list-disc list-inside mb-4">
        <li>Email and authentication data (used for login via Google, Apple, or Email)</li>
        <li>Pet details (type, breed, name, gender, birthdate, weight, vaccination info)</li>
        <li>Location data (only with permission) to show nearby services</li>
        <li>Usage data such as features accessed and calendar interactions</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">2. Use of Information</h2>
      <p className="mb-4">
        We use the collected data to:
      </p>
      <ul className="list-disc list-inside mb-4">
        <li>Provide personalized pet care recommendations</li>
        <li>Send vaccination reminders and notifications</li>
        <li>Improve the platform's features and performance</li>
        <li>Assist users in discovering pet-related services nearby</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">3. Data Storage and Security</h2>
      <p className="mb-4">
        Your data is stored securely using Firebase and encrypted protocols. While we take all reasonable steps to protect it, no system can guarantee 100% security. Users are encouraged to log out after use and not share their credentials.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">4. Sharing of Information</h2>
      <p className="mb-4">
        We do not sell your data. We may share limited data with service providers (e.g., Firebase, Google Maps) solely to enhance your app experience. These providers are required to protect your data under strict confidentiality agreements.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">5. Disclaimers</h2>
      <p className="mb-4">
        The app’s suggestions—such as vaccination timelines and dietary advice—are based on reputable veterinary sources. However, users are advised to consult a licensed veterinarian before making any medical or dietary decisions. PetPal is a support tool and is not a substitute for expert veterinary care.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">6. Your Rights</h2>
      <p className="mb-4">
        You may request access to or deletion of your personal data by contacting support@petpal.in. We comply with relevant data protection laws to honor such requests.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">7. Changes to Policy</h2>
      <p className="mb-4">
        This policy may be revised periodically. The date of the latest revision will always be displayed. Your continued use of the Service constitutes your agreement to the updated policy.
      </p>

      <p className="mt-8 text-sm text-gray-500">
        Questions? Contact: support@petpal.in
      </p>
    </div>
  );
}
