import Image from 'next/image';

const Navbar = () => {
  return (
    <nav className="flex justify-between items-center p-4 bg-black text-white shadow-md">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <Image src="/GC_Logo.png" alt="Logo" width={250} height={100} />
      </div>
      
      {/* Description */}
      <div className="text-sm text-gray-300">
        Software Developed by Akash Dhiman
      </div>
    </nav>
  );
};

export default Navbar;
