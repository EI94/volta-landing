// app/schedule/page.tsx
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Script from 'next/script';

export default function SchedulePage(): JSX.Element {
  return (
    <>
      <Header />
      <main className="container mx-auto px-6 py-16">
        <h1 className="text-5xl font-extrabold text-center mb-10">
          Schedule a Meeting
        </h1>
        <div className="flex justify-center">
          <div
            className="calendly-inline-widget"
            data-url="https://calendly.com/voltaenergy-info"
            style={{ minWidth: "320px", height: "700px" }}
          ></div>
        </div>
        <Script
          src="https://assets.calendly.com/assets/external/widget.js"
          strategy="afterInteractive"
        />
      </main>
      <Footer />
    </>
  );
}
