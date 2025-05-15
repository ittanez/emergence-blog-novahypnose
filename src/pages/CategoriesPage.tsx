
import { Link } from "react-router-dom";
import { categories, articles } from "@/lib/mock-data";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const CategoriesPage = () => {
  // Count articles in each category
  const categoryArticleCounts = categories.map(category => {
    const count = articles.filter(article => article.category === category.id).length;
    return { ...category, count };
  });
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 pt-8 pb-12">
        <div className="mb-12 text-center">
          <h1 className="font-serif mb-4">Catégories</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explorez nos articles par thématique
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoryArticleCounts.map(category => (
            <Link to={`/category/${category.id}`} key={category.id} className="block group">
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader>
                  <CardTitle className="group-hover:text-nova-700 transition-colors">
                    {category.name}
                  </CardTitle>
                  <CardDescription>
                    {category.count} {category.count > 1 ? "articles" : "article"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    {category.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CategoriesPage;
