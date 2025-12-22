import Navbar from "@/components/Navbar";
import EnvCheck from "./env-check";

export default function Home() {
  return (
    <>
      <Navbar />
      <main style={{ padding: "2rem" }}>
        <h1>🌍 Travel Mate</h1>
        <p>Your smart travel companion.</p>
        <EnvCheck />
      </main>
    </>
  );
}
