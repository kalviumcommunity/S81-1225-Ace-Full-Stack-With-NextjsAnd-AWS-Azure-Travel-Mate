export const revalidate = 60; // re-generate every 60 seconds

async function getPopularPlaces() {
  return [
    "Goa",
    "Jaipur",
    "Kerala",
    "Ladakh",
    "Pondicherry",
  ];
}

export default async function PlacesPage() {
  const places = await getPopularPlaces();

  return (
    <main>
      <h1>Popular Offline Maps</h1>
      <p>Updated every 60 seconds</p>

      <ul>
        {places.map((place) => (
          <li key={place}>{place}</li>
        ))}
      </ul>
    </main>
  );
}