// components/Footer.tsx
export default function Footer(): JSX.Element {
  return (
    <footer className="bg-gray-50 py-8">
      <div className="container mx-auto px-6 text-center">
        <p className="text-gray-600 text-sm">
          &copy; {new Date().getFullYear()} Volta. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

