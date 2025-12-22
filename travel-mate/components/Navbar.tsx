import Link from "next/link";

export default function Navbar() {
  return (
    <nav style={{ padding: "1rem", background: "#222", color: "#fff" }}>
      <Link href="/" style={{ marginRight: "1rem" }}>Home</Link>
      <Link href="/places" style={{ marginRight: "1rem" }}>Places</Link>
      <Link href="/dashboard">Dashboard</Link>
    </nav>
  );
}
