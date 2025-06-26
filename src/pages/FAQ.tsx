import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import NewsletterForm from "@/components/NewsletterForm";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  // Données FAQ pour Schema.org
  const faqData = [
    {
      question: "Qu'est-ce que l'hypnose ericksonienne ?",
      answer: "L'hypnose ericksonienne est une approche thérapeutique douce et respectueuse développée par Milton Erickson. Elle utilise des techniques indirectes et s'adapte à chaque personne pour accéder aux ressources inconscientes et créer des changements positifs durables."
    },
    {
      question: "Suis-je hypnotisable ?",
      answer: "Oui, la grande majorité des personnes peuvent bénéficier de l'hypnose. L'hypnose ericksonienne s'adapte à votre fonctionnement personnel et ne nécessite pas de capacités particulières. Votre motivation et votre confiance sont les éléments les plus importants."
    },
    {
      question: "Combien de séances sont nécessaires ?",
      answer: "Le nombre de séances varie selon votre objectif et votre situation. En moyenne, 3 à 6 séances suffisent pour la plupart des accompagnements. Lors de notre premier entretien, nous établirons ensemble un programme personnalisé."
    },
    {
      question: "L'hypnose est-elle dangereuse ?",
      answer: "Non, l'hypnose thérapeutique pratiquée par un professionnel qualifié est sans danger. Vous gardez toujours le contrôle et ne ferez rien contre vos valeurs. C'est un état naturel que nous expérimentons quotidiennement."
    },
    {
      question: "Comment se déroule une séance d'hypnose ?",
      answer: "Une séance dure environ 1h et se décompose en trois phases : un entretien pour comprendre vos besoins, la séance d'hypnose proprement dite, et un temps d'échange pour intégrer l'expérience. Vous restez conscient et acteur de votre changement."
    },
    {
      question: "Pour quels problèmes l'hypnose est-elle efficace ?",
      answer: "L'hypnose aide efficacement pour la gestion du stress, l'anxiété, les phobies, les troubles du sommeil, l'arrêt du tabac, la confiance en soi, la gestion de la douleur, et de nombreux autres objectifs de développement personnel."
    },
    {
      question: "Quel est le tarif d'une séance ?",
      answer: "Le tarif d'une séance d'hypnothérapie est de 90€. La première consultation, plus longue, est également à 90€. Certaines mutuelles proposent des remboursements pour les thérapies complémentaires."
    },
    {
      question: "Où se trouve le cabinet à Paris ?",
      answer: "Le cabinet NovaHypnose est situé au 16 rue Saint-Antoine dans le 4ème arrondissement de Paris, proche des métros Bastille et Saint-Paul. L'accès est facile et l'environnement calme favorise la détente."
    },
    {
      question: "Comment prendre rendez-vous ?",
      answer: "Vous pouvez prendre rendez-vous directement en ligne sur Resalib en cliquant sur le bouton 'Rendez-vous' dans le menu. Toutes les informations pratiques et réponses à vos questions sont disponibles sur ma page Resalib : https://www.resalib.fr/praticien/47325-alain-zenatti-hypnotherapeute-paris"
    },
    {
      question: "L'hypnose fonctionne-t-elle pour tout le monde ?",
      answer: "L'hypnose ericksonienne s'adapte à chaque personne et obtient d'excellents résultats dans la majorité des cas. Votre motivation, votre confiance en le processus et la qualité de notre relation thérapeutique sont les clés du succès."
    }
  ];

  // Schema.org FAQPage
  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqData.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="FAQ - Questions fréquentes sur l'hypnose et l'hypnothérapie"
        description="Réponses aux questions sur l'hypnose ericksonienne et les séances d'hypnothérapie avec Alain Zenatti à Paris. Guide complet de l'hypnose."
        keywords={["FAQ hypnose", "questions hypnothérapie", "hypnose ericksonienne", "séance hypnose Paris", "Alain Zenatti FAQ"]}
        structuredData={faqStructuredData}
      />
      
      <Header />
      
      <main className="flex-grow">
        {/* Hero section */}
        <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-serif mb-6">
                Questions fréquentes
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Tout ce que vous devez savoir sur l'hypnose ericksonienne et l'hypnothérapie
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              
              {/* Introduction */}
              <div className="mb-12 text-center">
                <p className="text-lg text-gray-700 leading-relaxed">
                  Vous vous posez des questions sur l'hypnose thérapeutique ? 
                  Voici les réponses aux interrogations les plus courantes concernant 
                  l'hypnose ericksonienne et les séances d'hypnothérapie.
                </p>
              </div>

              {/* FAQ Accordion */}
              <div className="mb-16">
                <Accordion type="single" collapsible className="w-full space-y-4">
                  {faqData.map((faq, index) => (
                    <AccordionItem 
                      key={index} 
                      value={`item-${index}`}
                      className="border rounded-lg px-6 py-2 bg-white shadow-sm"
                    >
                      <AccordionTrigger className="text-left font-medium text-lg hover:text-nova-700">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-700 pt-4 pb-2 leading-relaxed">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>

              {/* Contact section */}
              <div className="bg-gray-50 p-8 rounded-lg mb-16">
                <div className="text-center">
                  <h2 className="text-3xl font-serif mb-4">Une autre question ?</h2>
                  <p className="text-lg text-gray-700 mb-6">
                    N'hésitez pas à me contacter pour toute question spécifique. 
                    Je serai ravi de vous renseigner personnellement.
                  </p>
                  <div className="space-y-2 text-gray-700">
                    <p><strong>Téléphone :</strong> 06 49 35 80 89</p>
                    <p><strong>Email :</strong> contact@novahypnose.fr</p>
                  </div>
                  <div className="mt-6">
                    <a
                      href="https://www.resalib.fr/praticien/47325-alain-zenatti-hypnotherapeute-paris"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-nova-600 text-white px-6 py-3 rounded-lg hover:bg-nova-700 transition-colors font-medium"
                    >
                      Prendre rendez-vous
                    </a>
                  </div>
                </div>
              </div>

              {/* Related topics */}
              <div className="mb-16">
                <h2 className="text-3xl font-serif mb-8 text-center">Pour aller plus loin</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-md border text-center">
                    <h3 className="text-xl font-medium mb-3 text-nova-700">L'hypnose ericksonienne</h3>
                    <p className="text-gray-700 text-sm">
                      Découvrez cette approche thérapeutique respectueuse et efficace
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-md border text-center">
                    <h3 className="text-xl font-medium mb-3 text-nova-700">Les domaines d'application</h3>
                    <p className="text-gray-700 text-sm">
                      Stress, phobies, confiance en soi, sommeil et bien plus
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-md border text-center">
                    <h3 className="text-xl font-medium mb-3 text-nova-700">Le déroulement</h3>
                    <p className="text-gray-700 text-sm">
                      Comment se déroule concrètement une séance d'hypnothérapie
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation vers autres pages */}
              <div className="mb-16 bg-gray-50 p-8 rounded-lg">
                <h2 className="text-3xl font-serif mb-6 text-center">En savoir plus</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="text-center">
                    <h3 className="text-lg font-medium mb-2">À propos d'Alain Zenatti</h3>
                    <p className="text-gray-600 mb-4 text-sm">
                      Découvrez le parcours et l'approche d'Alain Zenatti, 
                      Maître Hypnologue certifié spécialisé en hypnose ericksonienne.
                    </p>
                    <Link
                      to="/about"
                      className="inline-block bg-nova-600 text-white px-4 py-2 rounded hover:bg-nova-700 transition-colors"
                    >
                      En savoir plus
                    </Link>
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-medium mb-2">Articles du blog</h3>
                    <p className="text-gray-600 mb-4 text-sm">
                      Explorez les articles sur l'hypnose, la transformation intérieure 
                      et les techniques thérapeutiques.
                    </p>
                    <Link
                      to="/"
                      className="inline-block bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
                    >
                      Lire les articles
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

export default FAQ;