export const dynamic = 'force-dynamic'; // SSR always

async function getUserData() {
  // simulate real-time user data
  return {
    user: "Raghava",
    savedMaps: ["Goa", "Manali", "Ooty"],
    lastSync: new Date().toISOString(),
  };
}

export default async function DashboardPage() {
  const data = await getUserData();

  return (
    <main>
      <h1>Dashboard</h1>
      <p>User: {data.user}</p>
      <p>Last Sync: {data.lastSync}</p>

      <h3>Saved Offline Maps</h3>
      <ul>
        {data.savedMaps.map((place) => (
          <li key={place}>{place}</li>
        ))}
      </ul>
    </main>
  );
}
