// app/page.tsx
import Header from '../components/Header';
import Footer from '../components/Footer';
import Link from 'next/link';

export default function HomePage(): JSX.Element {
  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative flex flex-col items-center justify-center py-20 bg-gradient-to-r from-blue-50 to-blue-100 text-center">
          <h1 className="text-6xl md:text-7xl font-extrabold mb-6 leading-tight">
            We Optimize the Value of Your Energy Assets in Real-Time
          </h1>
          <p className="text-2xl md:text-3xl text-gray-700 mb-10 max-w-3xl">
            Our AI-based algorithms are trained to maximize your renewable assets’ lifetime returns.
          </p>
          <Link
            href="/demo"
            className="inline-block bg-blue-600 text-white px-10 py-4 rounded-full text-2xl font-semibold shadow-lg hover:bg-blue-700 transition duration-300"
          >
            Explore the Demo
          </Link>
        </section>

        {/* Video Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-xl">
              {/* Sostituisci "your-video.mp4" con il percorso reale del video o un embed */}
              <video autoPlay loop muted className="w-full h-full object-cover">
                <source src="/your-video.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
            <p className="mt-4 text-center text-lg text-gray-600">
              Watch how our solution transforms your energy assets.
            </p>
          </div>
        </section>

        {/* Solution Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold mb-6">Our Solution</h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Optimize the value of your energy assets in real-time. Our AI-based algorithms are trained to maximize your renewable assets’ lifetime returns, ensuring operational excellence and enhanced market participation.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
