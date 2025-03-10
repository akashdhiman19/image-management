import { useSession, signIn } from "next-auth/react";
import ImageUploader from "../components/ImageUploader";
import ImageGallery from "../components/ImageGallery";
import Header from "@/components/Header";
import Navbar from "@/components/navbar";

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p className="text-center text-lg mt-20">Loading...</p>;
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white">
        <p className="text-xl">You are not authorized. Please login.</p>
        <button
          onClick={() => signIn()}
          className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <Header />
      <ImageUploader />
      <ImageGallery />
    </div>
  );
}
