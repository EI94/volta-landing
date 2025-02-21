// components/Header.tsx
import Link from 'next/link';
import Image from 'next/image';

export default function Header(): JSX.Element {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo: usa il file PNG dalla cartella public */}
        <Link href="/" className="flex items-center">
          <Image
            src="/Volta-logo-RGB-Black.png"
            alt="Volta Logo"
            width={150}
            height={50}
            className="object-contain"
          />
        </Link>
        {/* Navigazione principale */}
        <nav className="hidden md:flex space-x-8">
          <Link href="/" className="text-gray-700 hover:text-blue-600">
            Home
          </Link>
          <Link href="/demo" className="text-gray-700 hover:text-blue-600">
            Demo
          </Link>
        </nav>
        {/* Pulsante "Talk to us" che reindirizza a Calendly o al sito */}
        <Link
          href="https://calendly.com/volta-energy"  // Sostituisci con il link reale
          className="bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 transition"
        >
          Talk to us
        </Link>
      </div>
    </header>
  );
}



