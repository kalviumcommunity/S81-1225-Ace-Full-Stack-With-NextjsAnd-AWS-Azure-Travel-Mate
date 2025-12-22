export default function EnvCheckPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const env = process.env.NEXT_PUBLIC_ENV;

  return (
    <main>
      <h1>Environment Check</h1>

      <p>
        <strong>Current Environment:</strong> {env}
      </p>
      <p>
        <strong>API URL:</strong> {apiUrl}
      </p>
    </main>
  );
}
