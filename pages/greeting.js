import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";

export default function Greeting() {
  const { data: session } = useSession();
  const router = useRouter();
  const [username, setUsername] = useState("");

  useEffect(() => {
    if (session?.user?.name) {
      setUsername(session.user.name);
    } else {
      setUsername("User");
    }
    setTimeout(() => {
      router.push("/"); // Redirect to Landing Page
    }, 3000);
  }, [session, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold">Welcome, {username}!</h1>
        <p className="text-lg mt-3">Redirecting to the dashboard...</p>
      </motion.div>
    </div>
  );
}
