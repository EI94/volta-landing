// app/demo/page.tsx
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import DemoInterface from '../../components/DemoInterface';

export default function DemoPage(): JSX.Element {
  return (
    <>
      <Header />
      <main className="container mx-auto px-6 py-16 min-h-screen">
        <h1 className="text-5xl font-extrabold text-center mb-10">Interactive Demo</h1>
        <DemoInterface />
      </main>
      <Footer />
    </>
  );
}




