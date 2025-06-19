import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const AdminArticles = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Gestion des articles</h1>
            <p className="text-gray-600">Interface simplifiée de test</p>
          </div>
        </div>

        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Articles</h2>
          <div className="text-gray-600">
            Chargement des articles en cours...
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminArticles;