import Image from "next/image";
import { signOut, useSession } from "next-auth/react";

const Navbar = () => {
  const { data: session } = useSession();

  return (
    <nav className="flex justify-between items-center p-4 bg-black text-white shadow-md">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <Image src="/GC_Logo.png" alt="Logo" width={250} height={100} />
      </div>

      {/* Logout Button */}
      {session && (
        <button
          onClick={() => signOut({ callbackUrl: "/" })} // Redirects to homepage after logout
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
        >
          Logout
        </button>
      )}
    </nav>
  );
};

export default Navbar;
