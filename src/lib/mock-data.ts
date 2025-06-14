
import { Article, Tag } from '@/lib/types';

const hypnoseTags: Tag[] = [
  { id: '1', name: 'Hypnose', slug: 'hypnose', created_at: '2024-01-01T00:00:00Z' },
  { id: '2', name: 'Thérapie', slug: 'therapie', created_at: '2024-01-01T00:00:00Z' },
  { id: '3', name: 'Bien-être', slug: 'bien-etre', created_at: '2024-01-01T00:00:00Z' },
  { id: '4', name: 'Transformation', slug: 'transformation', created_at: '2024-01-01T00:00:00Z' },
  { id: '5', name: 'Confiance', slug: 'confiance', created_at: '2024-01-01T00:00:00Z' },
  { id: '6', name: 'Émotions', slug: 'emotions', created_at: '2024-01-01T00:00:00Z' },
  { id: '7', name: 'Inconscient', slug: 'inconscient', created_at: '2024-01-01T00:00:00Z' },
];

export const mockArticles: Article[] = [
  {
    id: '1',
    title: 'Les fondements de l\'hypnose ericksonienne',
    content: `
      <h2>Introduction à l'hypnose ericksonienne</h2>
      <p>L'hypnose ericksonienne, développée par Milton H. Erickson, révolutionne l'approche thérapeutique traditionnelle...</p>
      
      <h3>Les principes fondamentaux</h3>
      <p>Cette approche se base sur plusieurs principes clés qui la distinguent des autres formes d'hypnose...</p>
      
      <h3>Applications thérapeutiques</h3>
      <p>L'hypnose ericksonienne trouve ses applications dans de nombreux domaines...</p>
    `,
    excerpt: 'Découvrez les principes fondamentaux de l\'hypnose ericksonienne et ses applications thérapeutiques révolutionnaires.',
    image_url: 'https://akrlyzmfszumibwgocae.supabase.co/storage/v1/object/public/images/hypnose-ericksonienne.webp',
    seo_description: 'Explorez les fondements de l\'hypnose ericksonienne, ses principes révolutionnaires et ses applications thérapeutiques innovantes.',
    keywords: ['hypnose ericksonienne', 'Milton Erickson', 'thérapie', 'inconscient', 'changement'],
    categories: ['Hypnose', 'Thérapie'],
    author: 'Alain Zenatti',
    slug: 'fondements-hypnose-ericksonienne',
    read_time: 8,
    published: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    tags: [hypnoseTags[0], hypnoseTags[1]],
    featured: false,
    meta_description: 'Explorez les fondements de l\'hypnose ericksonienne, ses principes révolutionnaires et ses applications thérapeutiques innovantes.',
    storage_image_url: 'https://akrlyzmfszumibwgocae.supabase.co/storage/v1/object/public/images/hypnose-ericksonienne.webp',
  },
  {
    id: '2',
    title: 'Retrouver confiance en soi grâce à l\'hypnose',
    content: `
      <h2>Le pouvoir transformateur de l'hypnose pour la confiance</h2>
      <p>La confiance en soi est un pilier fondamental de notre bien-être psychologique...</p>
      
      <h3>Comprendre les blocages</h3>
      <p>Les origines du manque de confiance en soi sont multiples et souvent ancrées profondément...</p>
      
      <h3>L'approche hypnotique</h3>
      <p>L'hypnose permet d'accéder aux ressources inconscientes pour renforcer l'estime de soi...</p>
    `,
    excerpt: 'Comment l\'hypnose peut vous aider à développer une confiance en soi durable et authentique.',
    image_url: 'https://akrlyzmfszumibwgocae.supabase.co/storage/v1/object/public/images/confiance-en-soi.webp',
    seo_description: 'Découvrez comment l\'hypnose peut transformer votre confiance en soi et vous aider à surmonter vos blocages intérieurs.',
    keywords: ['confiance en soi', 'estime de soi', 'hypnose thérapeutique', 'développement personnel'],
    categories: ['Développement personnel', 'Confiance'],
    author: 'Alain Zenatti',
    slug: 'retrouver-confiance-en-soi-hypnose',
    read_time: 6,
    published: true,
    created_at: '2024-01-20T14:30:00Z',
    updated_at: '2024-01-20T14:30:00Z',
    tags: [hypnoseTags[4], hypnoseTags[1]],
    featured: false,
    meta_description: 'Découvrez comment l\'hypnose peut transformer votre confiance en soi et vous aider à surmonter vos blocages intérieurs.',
    storage_image_url: 'https://akrlyzmfszumibwgocae.supabase.co/storage/v1/object/public/images/confiance-en-soi.webp',
  },
  {
    id: '3',
    title: 'Gérer le stress et l\'anxiété par l\'hypnose',
    content: `
      <h2>L'hypnose face au stress moderne</h2>
      <p>Dans notre société contemporaine, le stress et l'anxiété sont devenus des compagnons quotidiens...</p>
      
      <h3>Mécanismes du stress</h3>
      <p>Comprendre comment fonctionne le stress dans notre organisme est essentiel...</p>
      
      <h3>Techniques hypnotiques</h3>
      <p>L'hypnose offre des outils puissants pour retrouver sérénité et équilibre...</p>
    `,
    excerpt: 'Apprenez à utiliser l\'hypnose pour gérer efficacement le stress et l\'anxiété du quotidien.',
    image_url: 'https://akrlyzmfszumibwgocae.supabase.co/storage/v1/object/public/images/gestion-stress.webp',
    seo_description: 'Maîtrisez votre stress et votre anxiété grâce aux techniques d\'hypnose. Retrouvez sérénité et équilibre intérieur.',
    keywords: ['gestion du stress', 'anxiété', 'relaxation', 'hypnose anti-stress', 'sérénité'],
    categories: ['Bien-être', 'Gestion émotionnelle'],
    author: 'Alain Zenatti',
    slug: 'gerer-stress-anxiete-hypnose',
    read_time: 7,
    published: true,
    created_at: '2024-02-01T09:15:00Z',
    updated_at: '2024-02-01T09:15:00Z',
    tags: [hypnoseTags[2], hypnoseTags[5]],
    featured: false,
    meta_description: 'Maîtrisez votre stress et votre anxiété grâce aux techniques d\'hypnose. Retrouvez sérénité et équilibre intérieur.',
    storage_image_url: 'https://akrlyzmfszumibwgocae.supabase.co/storage/v1/object/public/images/gestion-stress.webp',
  },
  {
    id: '4',
    title: 'L\'hypnose et la transformation personnelle',
    content: `
      <h2>Catalyseur de changement</h2>
      <p>L'hypnose est un formidable catalyseur de transformation personnelle...</p>
      
      <h3>Processus de changement</h3>
      <p>Le changement personnel nécessite une approche globale et bienveillante...</p>
      
      <h3>Accompagnement personnalisé</h3>
      <p>Chaque parcours de transformation est unique et mérite une attention particulière...</p>
    `,
    excerpt: 'Explorez le potentiel transformateur de l\'hypnose pour créer des changements durables dans votre vie.',
    image_url: 'https://akrlyzmfszumibwgocae.supabase.co/storage/v1/object/public/images/transformation-personnelle.webp',
    seo_description: 'Découvrez comment l\'hypnose peut catalyser votre transformation personnelle et vous guider vers la version de vous-même que vous aspirez à devenir.',
    keywords: ['transformation personnelle', 'changement', 'développement personnel', 'évolution', 'croissance'],
    categories: ['Développement personnel', 'Transformation'],
    author: 'Alain Zenatti',
    slug: 'hypnose-transformation-personnelle',
    read_time: 9,
    published: true,
    created_at: '2024-02-10T16:45:00Z',
    updated_at: '2024-02-10T16:45:00Z',
    tags: [hypnoseTags[3], hypnoseTags[0], hypnoseTags[6]],
    featured: false,
    meta_description: 'Découvrez comment l\'hypnose peut catalyser votre transformation personnelle et vous guider vers la version de vous-même que vous aspirez à devenir.',
    storage_image_url: 'https://akrlyzmfszumibwgocae.supabase.co/storage/v1/object/public/images/transformation-personnelle.webp',
  },
  {
    id: '5',
    title: 'Les émotions et l\'inconscient : une exploration guidée',
    content: `
      <h2>Voyage au cœur de l'inconscient</h2>
      <p>Nos émotions sont des messagers précieux qui nous renseignent sur nos besoins profonds...</p>
      
      <h3>Langage émotionnel</h3>
      <p>Apprendre à décoder le langage de nos émotions est une compétence essentielle...</p>
      
      <h3>Exploration hypnotique</h3>
      <p>L'hypnose nous offre un moyen privilégié d'explorer notre paysage émotionnel...</p>
    `,
    excerpt: 'Une exploration profonde du lien entre émotions et inconscient à travers le prisme de l\'hypnose.',
    image_url: 'https://akrlyzmfszumibwgocae.supabase.co/storage/v1/object/public/images/emotions-inconscient.webp',
    seo_description: 'Explorez la richesse de votre monde émotionnel et inconscient grâce à l\'hypnose. Un voyage de découverte intérieure.',
    keywords: ['émotions', 'inconscient', 'exploration intérieure', 'hypnose thérapeutique', 'psychologie'],
    categories: ['Psychologie', 'Émotions'],
    author: 'Alain Zenatti',
    slug: 'emotions-inconscient-exploration-guidee',
    read_time: 10,
    published: true,
    created_at: '2024-02-20T11:20:00Z',
    updated_at: '2024-02-20T11:20:00Z',
    tags: [hypnoseTags[5], hypnoseTags[6]],
    featured: false,
    meta_description: 'Explorez la richesse de votre monde émotionnel et inconscient grâce à l\'hypnose. Un voyage de découverte intérieure.',
    storage_image_url: 'https://akrlyzmfszumibwgocae.supabase.co/storage/v1/object/public/images/emotions-inconscient.webp',
  },
];
