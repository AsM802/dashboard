import ContactForm from './components/ContactForm';
import ProfileCard from './components/ProfileCard';

export default function Home() {
  return (
    <div className="text-white bg-black min-h-screen">
      {/* Hero Section with Profile */}
      <section className="flex flex-col items-center justify-center h-screen text-center bg-gradient-to-r from-indigo-600 to-purple-800 p-6">
        <img
          src="/myphoto.jpg"
          alt="Agnives"
          className="w-36 h-36 rounded-full border-4 border-white shadow-lg mb-4"
        />
        <h1 className="text-4xl md:text-5xl font-bold mb-2">Agnives S M</h1>
        <p className="text-lg md:text-xl text-gray-200">I am Awesome 💥</p>
        
        <div className="mt-8 space-x-4">
          <a 
            href="#contact" 
            className="bg-white text-purple-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Contact Me
          </a>
          <a 
            href="/messages" 
            className="border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-purple-800 transition-colors"
          >
            View Messages
          </a>
        </div>
      </section>

      {/* About */}
      <section className="p-8 md:p-16 bg-gray-900">
        <h2 className="text-3xl font-semibold mb-4">About</h2>
        <p className="text-gray-300 max-w-2xl">
          I'm a beginner learning full-stack development. This site is built using Next.js,
          TailwindCSS, TypeScript, and MongoDB. It's my journey from 0 to 100 in tech 🚀.
        </p>
      </section>

      {/* Features */}
      <section className="bg-gray-800 p-8 md:p-16 grid gap-6 md:grid-cols-3">
        {[
          ["🚀 Fast Hosting", "Deployed on Vercel for speed and ease."],
          ["🧠 Smart Stack", "Next.js + Tailwind + TS + MongoDB."],
          ["🔧 Full Stack", "Working contact forms with database storage."],
        ].map(([title, desc]) => (
          <div key={title} className="bg-gray-700 p-6 rounded-xl shadow-lg">
            <h3 className="text-2xl font-bold mb-2">{title}</h3>
            <p className="text-gray-300">{desc}</p>
          </div>
        ))}
      </section>

      {/* Contact Form Section */}
      <section id="contact" className="bg-gray-900 p-8 md:p-16">
        <h2 className="text-3xl font-semibold mb-8 text-center">Contact Me</h2>
        <ContactForm />
      </section>

      {/* Footer */}
      <footer className="bg-black text-center py-4 text-sm text-gray-500">
        © 2025 Agnives S M. Built with 💙 using Next.js, TypeScript & MongoDB.
      </footer>
    </div>
  );
}