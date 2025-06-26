import React from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import NewsletterForm from "@/components/NewsletterForm";
import OptimizedImage from "@/components/OptimizedImage";
import { useStructuredData } from "@/hooks/useStructuredData";

const About = () => {
  const { generateOrganizationStructuredData } = useStructuredData();
  
  // Données structurées pour la page À propos
  const personStructuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": "https://novahypnose.fr/#person",
    "name": "Alain Zenatti",
    "jobTitle": "Hypnothérapeute certifié",
    "description": "Maître Hypnologue spécialisé en hypnose ericksonienne à Paris. Expert en transformation personnelle et accompagnement thérapeutique.",
    "url": "https://novahypnose.fr",
    "sameAs": [
      "https://www.instagram.com/novahypnose/",
      "https://www.resalib.fr/praticien/47325-alain-zenatti-hypnotherapeute-paris"
    ],
    "worksFor": {
      "@type": "Organization",
      "name": "NovaHypnose",
      "url": "https://novahypnose.fr"
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "16 rue St Antoine",
      "addressLocality": "Paris",
      "postalCode": "75004",
      "addressCountry": "FR"
    },
    "telephone": "+33649358089",
    "email": "contact@novahypnose.fr",
    "knowsAbout": [
      "Hypnose ericksonienne",
      "Hypnothérapie",
      "Gestion du stress",
      "Confiance en soi",
      "Transformation personnelle",
      "Accompagnement thérapeutique"
    ]
  };

  const organizationData = generateOrganizationStructuredData();

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="À propos d'Alain Zenatti - Hypnothérapeute à Paris"
        description="Alain Zenatti, Maître Hypnologue certifié à Paris. Découvrez son parcours et son approche en hypnose ericksonienne pour votre transformation."
        keywords={["Alain Zenatti", "hypnothérapeute Paris", "hypnose ericksonienne", "maître hypnologue", "thérapie hypnose Paris", "cabinet hypnose"]}
        structuredData={[personStructuredData, organizationData]}
      />
      
      <Header />
      
      <main className="flex-grow">
        {/* Hero section avec image d'Alain */}
        <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-serif mb-6">
                À propos d'Alain Zenatti
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Maître Hypnologue certifié et praticien en hypnose ericksonienne à Paris
              </p>
            </div>
          </div>
        </section>

        {/* Contenu principal */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
                <div>
                  <OptimizedImage
                    src="https://akrlyzmfszumibwgocae.supabase.co/storage/v1/object/public/images/PORTRAITALAINZENATTI.webp"
                    alt="Alain Zenatti, hypnothérapeute certifié à Paris"
                    className="rounded-lg shadow-lg w-full"
                    loading="eager"
                    fetchPriority="high"
                  />
                </div>
                <div>
                  <h2 className="text-3xl font-serif mb-6">Un parcours dédié à l'accompagnement</h2>
                  <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                    Depuis plus de 10 ans, j'accompagne mes patients dans leur transformation personnelle 
                    grâce à l'hypnose ericksonienne. Mon approche bienveillante et personnalisée permet 
                    à chacun de retrouver confiance, équilibre et vitalité.
                  </p>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    Formé aux techniques les plus avancées de l'hypnothérapie, je mets mon expertise 
                    au service de votre bien-être dans mon cabinet parisien situé au cœur du Marais.
                  </p>
                </div>
              </div>

              {/* Formation et expertise */}
              <div className="mb-16">
                <h2 className="text-3xl font-serif mb-8 text-center">Formation et expertise</h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-white p-6 rounded-lg shadow-md border">
                    <h3 className="text-xl font-medium mb-4 text-nova-700">Certifications</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Maître Hypnologue certifié</li>
                      <li>• Spécialiste en hypnose ericksonienne</li>
                      <li>• Formation continue en thérapies brèves</li>
                      <li>• Membre de l'Association Française d'Hypnose</li>
                    </ul>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-md border">
                    <h3 className="text-xl font-medium mb-4 text-nova-700">Domaines d'expertise</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Gestion du stress et de l'anxiété</li>
                      <li>• Confiance en soi et estime personnelle</li>
                      <li>• Phobies et peurs limitantes</li>
                      <li>• Accompagnement au changement</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Philosophie */}
              <div className="mb-16 bg-gray-50 p-8 rounded-lg">
                <h2 className="text-3xl font-serif mb-6 text-center">Ma philosophie</h2>
                <div className="prose prose-lg mx-auto text-gray-700">
                  <p className="text-center italic text-xl mb-6">
                    "Chaque personne porte en elle les ressources nécessaires à sa transformation. 
                    Mon rôle est de vous aider à les révéler."
                  </p>
                  <p>
                    L'hypnose ericksonienne que je pratique respecte votre unicité et s'adapte à vos besoins 
                    spécifiques. Cette approche douce et non directive permet d'accéder à vos ressources 
                    inconscientes pour créer des changements durables et positifs.
                  </p>
                  <p>
                    Dans mon cabinet du 4ème arrondissement de Paris, je vous accueille dans un espace 
                    sécurisant et bienveillant, propice à la détente et à l'introspection.
                  </p>
                </div>
              </div>

              {/* Cabinet et localisation */}
              <div className="mb-16">
                <h2 className="text-3xl font-serif mb-8 text-center">Le cabinet NovaHypnose</h2>
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="text-xl font-medium mb-4">Un espace dédié à votre bien-être</h3>
                    <p className="text-gray-700 mb-4">
                      Situé au 16 rue Saint-Antoine dans le 4ème arrondissement de Paris, 
                      le cabinet NovaHypnose vous accueille dans un environnement calme et rassurant.
                    </p>
                    <div className="space-y-2 text-gray-700">
                      <p><strong>Adresse :</strong> 16 rue Saint-Antoine, 75004 Paris</p>
                      <p><strong>Métro :</strong> Bastille, Saint-Paul</p>
                      <p><strong>Téléphone :</strong> 06 49 35 80 89</p>
                      <p><strong>Email :</strong> contact@novahypnose.fr</p>
                    </div>
                  </div>
                  <div className="bg-gray-100 p-6 rounded-lg">
                    <h4 className="font-medium mb-3">Horaires de consultation</h4>
                    <div className="space-y-1 text-sm text-gray-700">
                      <p>Lundi - Vendredi : 11h00 - 20h00</p>
                      <p>Week-end : Fermé</p>
                    </div>
                    <div className="mt-4">
                      <Link
                        to="https://www.resalib.fr/praticien/47325-alain-zenatti-hypnotherapeute-paris"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-nova-600 text-white px-4 py-2 rounded hover:bg-nova-700 transition-colors"
                      >
                        Prendre rendez-vous
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Articles connexes */}
              <div className="mb-16 bg-blue-50 p-8 rounded-lg">
                <h2 className="text-3xl font-serif mb-6 text-center">Découvrir mes articles</h2>
                <p className="text-center text-gray-700 mb-6">
                  Explorez mes réflexions sur l'hypnose ericksonienne, la transformation personnelle 
                  et les techniques thérapeutiques dans le blog Émergences.
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="text-center">
                    <h3 className="text-lg font-medium mb-2">Articles récents</h3>
                    <p className="text-gray-600 mb-4 text-sm">
                      Découvrez les dernières publications sur l'hypnothérapie, 
                      les techniques de relaxation et l'accompagnement thérapeutique.
                    </p>
                    <Link
                      to="/"
                      className="inline-block bg-nova-600 text-white px-4 py-2 rounded hover:bg-nova-700 transition-colors"
                    >
                      Voir tous les articles
                    </Link>
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-medium mb-2">Questions fréquentes</h3>
                    <p className="text-gray-600 mb-4 text-sm">
                      Consultez les réponses aux questions les plus courantes 
                      sur l'hypnose ericksonienne et les séances d'hypnothérapie.
                    </p>
                    <Link
                      to="/faq"
                      className="inline-block bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
                    >
                      Voir la FAQ
                    </Link>
                  </div>
                </div>
              </div>

              {/* Newsletter */}
              <div className="max-w-2xl mx-auto">
                <NewsletterForm />
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;