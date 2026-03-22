export const metadata = {
  title: "Terms of Service",
};

export default function TermsPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-12 text-gray-900">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <div className="space-y-4 text-sm leading-6 text-gray-700">
        <p>
          EchoCampus is intended for respectful campus use. Users are
          responsible for content they post, including marketplace and
          lost-and-found details.
        </p>
        <p>
          Abuse, harassment, spam, impersonation, and attempts to bypass usage
          limits are prohibited and may lead to account restrictions.
        </p>
        <p>
          The platform may update features and policies over time to improve
          safety, fairness, and service quality.
        </p>
      </div>
    </main>
  );
}
