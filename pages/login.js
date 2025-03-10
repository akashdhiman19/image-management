import { signIn } from "next-auth/react";
import { useState } from "react";
import { motion } from "framer-motion";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid Credentials");
    } else {
      window.location.href = "/greeting"; // Redirect to Greeting Page
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen w-full">
      {/* Background Video */}
      <video autoPlay loop muted className="absolute top-0 left-0 w-full h-full object-cover">
        <source src="/GC Intro.mp4" type="video/mp4" />
      </video>

      {/* Dark Overlay */}
      <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50"></div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative bg-white bg-opacity-20 backdrop-blur-lg p-12 w-[400px] md:w-[500px] lg:w-[600px] rounded-3xl shadow-2xl text-center"
      >
        <h2 className="text-3xl font-bold text-white mb-6">Welcome Back! Greetings From Akash Dhiman</h2>
        {error && <p className="text-red-500 text-lg">{error}</p>}

        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          <motion.input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border border-white bg-transparent text-white text-lg px-5 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            whileFocus={{ scale: 1.05 }}
          />
          <motion.input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border border-white bg-transparent text-white text-lg px-5 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            whileFocus={{ scale: 1.05 }}
          />
          <motion.button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white text-lg px-6 py-3 rounded-xl shadow-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Sign In
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
