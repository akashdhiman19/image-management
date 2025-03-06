import React from "react";
import { motion } from "framer-motion";

const Header = () => {
  return (
    <div className="relative w-full h-[400px] md:h-[500px] flex items-center justify-center overflow-hidden">
      {/* Background Image with Focal Gradient */}
      <div className="absolute inset-0 bg-[url('https://gcbuses.com/wp-content/uploads/2024/09/SLEEPER-ORANGE-2.jpg')] bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/60"></div>
      </div>

      {/* Animated Text */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative z-10 text-center text-white px-5"
      >
        <h1 className="text-3xl md:text-5xl font-bold drop-shadow-lg">
          Welcome to <span className="text-red-500">Gobind Coach Builders</span>
        </h1>
        <p className="text-lg md:text-xl mt-2 opacity-80">
          Image Management System and custom Database.
        </p>
      </motion.div>
    </div>
  );
};

export default Header;
