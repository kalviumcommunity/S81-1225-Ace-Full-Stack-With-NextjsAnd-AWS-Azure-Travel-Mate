import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";

// Mock user database
const mockUsersDb: Record<
  string,
  {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar: string;
    bio: string;
    joinedDate: string;
    location: string;
    tripsCount: number;
    reviewsCount: number;
  }
> = {
  "1": {
    id: "1",
    name: "Alice Johnson",
    email: "alice@example.com",
    role: "USER",
    avatar: "A",
    bio: "Passionate traveler exploring the world one destination at a time. Love hiking, photography, and local cuisine.",
    joinedDate: "January 2024",
    location: "San Francisco, USA",
    tripsCount: 12,
    reviewsCount: 28,
  },
  "2": {
    id: "2",
    name: "Bob Smith",
    email: "bob@example.com",
    role: "ADMIN",
    avatar: "B",
    bio: "Travel Mate platform administrator. Ensuring the best experience for all travelers worldwide.",
    joinedDate: "December 2023",
    location: "New York, USA",
    tripsCount: 45,
    reviewsCount: 156,
  },
  "3": {
    id: "3",
    name: "Carol Williams",
    email: "carol@example.com",
    role: "MODERATOR",
    avatar: "C",
    bio: "Community moderator and adventure enthusiast. Always looking for hidden gems and off-the-beaten-path destinations.",
    joinedDate: "February 2024",
    location: "London, UK",
    tripsCount: 23,
    reviewsCount: 67,
  },
  "4": {
    id: "4",
    name: "David Brown",
    email: "david@example.com",
    role: "USER",
    avatar: "D",
    bio: "Digital nomad and backpacker. Currently exploring Southeast Asia while working remotely.",
    joinedDate: "March 2024",
    location: "Bali, Indonesia",
    tripsCount: 8,
    reviewsCount: 19,
  },
  "5": {
    id: "5",
    name: "Eva Martinez",
    email: "eva@example.com",
    role: "USER",
    avatar: "E",
    bio: "Luxury travel blogger and food critic. Documenting the finest experiences around the globe.",
    joinedDate: "April 2024",
    location: "Barcelona, Spain",
    tripsCount: 31,
    reviewsCount: 89,
  },
};

interface Props {
  params: Promise<{ id: string }>;
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const user = mockUsersDb[id];

  if (!user) {
    return {
      title: "User Not Found | Travel Mate",
      description: "The requested user profile could not be found.",
    };
  }

  return {
    title: `${user.name} - User Profile | Travel Mate`,
    description: user.bio,
    openGraph: {
      title: `${user.name} - Travel Mate`,
      description: user.bio,
      type: "profile",
    },
  };
}

// Generate static params for popular users (optional optimization)
export async function generateStaticParams() {
  return Object.keys(mockUsersDb).map((id) => ({ id }));
}

export default async function UserProfilePage({ params }: Props) {
  const { id } = await params;
  const user = mockUsersDb[id];

  // Handle user not found
  if (!user) {
    notFound();
  }

  return (
    <main className="p-6 max-w-3xl mx-auto">
      {/* Breadcrumbs for SEO and navigation */}
      <nav className="text-sm mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-gray-600">
          <li>
            <Link href="/" className="hover:text-blue-600 transition-colors">
              🏠 Home
            </Link>
          </li>
          <li className="text-gray-400">/</li>
          <li>
            <Link
              href="/users"
              className="hover:text-blue-600 transition-colors"
            >
              Users
            </Link>
          </li>
          <li className="text-gray-400">/</li>
          <li className="text-gray-900 font-medium">{user.name}</li>
        </ol>
      </nav>

      {/* User Profile Card */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {/* Header Banner */}
        <div className="h-32 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

        {/* Profile Content */}
        <div className="px-6 pb-6">
          {/* Avatar */}
          <div className="-mt-16 mb-4">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-purple-700 rounded-full flex items-center justify-center text-white font-bold text-5xl border-4 border-white shadow-lg">
              {user.avatar}
            </div>
          </div>

          {/* User Info */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              <span
                className={`px-3 py-1 text-xs font-medium rounded-full ${
                  user.role === "ADMIN"
                    ? "bg-red-100 text-red-700"
                    : user.role === "MODERATOR"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-700"
                }`}
              >
                {user.role}
              </span>
            </div>
            <p className="text-gray-600 mb-1">{user.email}</p>
            <p className="text-gray-500 text-sm">
              📍 {user.location} • Joined {user.joinedDate}
            </p>
          </div>

          {/* Bio */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">About</h2>
            <p className="text-gray-700 leading-relaxed">{user.bio}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-lg text-center">
              <p className="text-3xl font-bold text-blue-600">
                {user.tripsCount}
              </p>
              <p className="text-sm text-gray-600">Trips Completed</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg text-center">
              <p className="text-3xl font-bold text-purple-600">
                {user.reviewsCount}
              </p>
              <p className="text-sm text-gray-600">Reviews Written</p>
            </div>
          </div>

          {/* Dynamic Route Info */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>🔗 Dynamic Route Info:</strong>
              <br />
              This page uses Next.js dynamic routing with{" "}
              <code className="bg-gray-200 px-1 rounded">[id]</code> segment.
              <br />
              Current User ID:{" "}
              <code className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                {id}
              </code>
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-6 flex gap-4">
        <Link
          href="/users"
          className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg text-center transition-colors"
        >
          ← Back to Users
        </Link>
        <Link
          href="/dashboard"
          className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-center transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    </main>
  );
}
