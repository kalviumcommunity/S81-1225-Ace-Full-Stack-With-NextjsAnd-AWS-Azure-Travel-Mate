import { Place } from "@/types/place";

export default function PlaceCard({ place }: { place: Place }) {
  return (
    <div style={{ border: "1px solid #ccc", padding: "1rem" }}>
      <h3>{place.name}</h3>
      <p>{place.description}</p>
    </div>
  );
}
