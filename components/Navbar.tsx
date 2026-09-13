import React from "react";
import Link from "next/link";
import Image from "next/image";

const Navbar = () => {
  return (
    <header className="flex justify-between p-4">
      <Link href="/" className="logo">
        <Image src="/icons/logo.png" alt="logo" width={24} height={24} />

        <p>DevEvent</p>
      </Link>

      <ul>
        <Link href="/">Home</Link>
        <Link href="/">Events</Link>
        <Link href="/">Create Event</Link>
      </ul>
    </header>
  );
};

export default Navbar;
