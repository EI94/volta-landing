// app/schedule/page.tsx (se vuoi una pagina dedicata)
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function SchedulePage(): JSX.Element {
  return (
    <>
      <Header />
      <main className="container mx-auto px-6 py-16">
        <h1 className="text-5xl font-extrabold text-center mb-10">Schedule a Meeting</h1>
        <div className="flex justify-center">
          <iframe
            src=<!-- Calendly inline widget begin -->
            <div class="calendly-inline-widget" data-url="https://calendly.com/voltaenergy-info" style="min-width:320px;height:700px;"></div>
            <script type="text/javascript" src="https://assets.calendly.com/assets/external/widget.js" async></script>
            <!-- Calendly inline widget end -->  // Sostituisci con il tuo link Calendly
            width="100%"
            height="800"
            frameBorder="0"
            title="Schedule a Meeting"
          ></iframe>
        </div>
      </main>
      <Footer />
    </>
  );
}
