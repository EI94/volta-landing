// app/layout.tsx
import '../styles/globals.css';

export const metadata = {
  title: 'Volta Energy AI Agent',
  description: 'Optimizing the value of your renewable energy assets in real-time',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {/* Importa il font "Inter" da Google Fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans text-gray-900 bg-white">{children}</body>
    </html>
  );
}
