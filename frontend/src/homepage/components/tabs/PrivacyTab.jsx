export default function PrivacyTab() {
  return (
    <div className="p-5 max-w-4xl font-sans text-gray-700 leading-relaxed">
      <h2 className="mb-4 text-2xl font-bold text-black border-b pb-2">Privacy Policy</h2>

      <p className="mb-4">
        Osdag respects your privacy and is committed to protecting your personal data in accordance with the General Data Protection Regulation (GDPR) and other applicable privacy laws.
      </p>

      <h3 className="mb-2 text-lg font-semibold text-black">1. Information We Collect</h3>
      <p className="mb-4">
        We collect only the minimum necessary information to provide you with the cloud-based Osdag services:
      </p>
      <ul className="list-disc pl-6 mb-4 space-y-1">
        <li><strong>Account Information:</strong> When you register an account, we collect and store your email address and verification status.</li>
        <li><strong>Design and Project Data:</strong> We store the project details, inputs, design preferences, and outputs you create using the Osdag interface. This data is kept secure in our PostgreSQL database.</li>
      </ul>

      <h3 className="mb-2 text-lg font-semibold text-black">2. Purpose of Collection</h3>
      <p className="mb-4">
        We collect this data solely to allow you to save, load, export, and manage your engineering projects and design configurations online. We do not use trackers, display advertisements, or share your data with any third parties.
      </p>

      <h3 className="mb-2 text-lg font-semibold text-black">3. Your Data Rights (GDPR Compliance)</h3>
      <p className="mb-4">
        Under GDPR, you have the following rights regarding your personal data:
      </p>
      <ul className="list-disc pl-6 mb-4 space-y-1">
        <li><strong>Right to Portability (Data Export):</strong> You can export a copy of all your saved projects and account details at any time in a standard machine-readable JSON format. You can initiate this via your profile dropdown.</li>
        <li><strong>Right to Erasure (Account Deletion):</strong> You can request the deletion of your account and all associated data at any time via your profile dropdown.</li>
      </ul>

      <h3 className="mb-2 text-lg font-semibold text-black">4. Account Deletion & Permanent Purge</h3>
      <p className="mb-4">
        When you request account deletion, all your account records, user profile details, and design projects are immediately, permanently, and irreversibly purged from our databases. No grace period is provided, and the deletion cannot be undone.
      </p>

      <p className="mt-6 text-sm text-gray-500 italic">
        The Osdag developers' community does not condone unauthorized usage of private data and remains dedicated to user data safety and sovereignty.
      </p>
    </div>
  );
}