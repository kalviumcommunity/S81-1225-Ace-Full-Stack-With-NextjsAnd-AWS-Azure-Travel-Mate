// app/about/page.tsx

export const revalidate = false; // fully static

export default function AboutPage() {
  return (
    <main>
      <h1>Travel Mate</h1>
      <p>
        Travel Mate helps travelers explore destinations with offline-friendly maps,
        ensuring seamless navigation even without internet access.
      </p>
    </main>
  );
}
