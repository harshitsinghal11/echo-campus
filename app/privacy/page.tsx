export const metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-12 text-gray-900">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <div className="space-y-4 text-sm leading-6 text-gray-700">
        <p>
          EchoCampus stores only the minimum account and feature data required to
          provide campus services like announcements, marketplace listings,
          complaints, and lost-and-found posts.
        </p>
        <p>
          Anonymous features are designed to avoid exposing personally
          identifiable information publicly. Access to protected resources is
          role-based and requires authentication.
        </p>
        <p>
          By using the platform, you agree that your submitted content may be
          processed for moderation, abuse prevention, and service reliability.
        </p>
      </div>
    </main>
  );
}
