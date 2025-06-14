
import { Article, Category, Tag } from "./types";

export const categories: Category[] = [
  {
    id: "1",
    name: "Hypnose Thérapeutique",
    description: "L'hypnose comme outil thérapeutique pour résoudre des problèmes spécifiques",
    created_at: new Date().toISOString(),
    slug: "hypnose-therapeutique"
  },
  {
    id: "2",
    name: "Développement Personnel",
    description: "Techniques et approches pour stimuler votre croissance personnelle",
    created_at: new Date().toISOString(),
    slug: "developpement-personnel"
  },
  {
    id: "3",
    name: "Bien-être",
    description: "Méthodes pour améliorer votre équilibre et votre qualité de vie",
    created_at: new Date().toISOString(),
    slug: "bien-etre"
  },
  {
    id: "4",
    name: "Témoignages",
    description: "Expériences et parcours de transformation avec l'hypnose",
    created_at: new Date().toISOString(),
    slug: "temoignages"
  }
];

export const tags: Tag[] = [
  { id: "1", name: "Stress", slug: "stress", created_at: new Date().toISOString() },
  { id: "2", name: "Anxiété", slug: "anxiete", created_at: new Date().toISOString() },
  { id: "3", name: "Sommeil", slug: "sommeil", created_at: new Date().toISOString() },
  { id: "4", name: "Confiance en soi", slug: "confiance-en-soi", created_at: new Date().toISOString() },
  { id: "5", name: "Méditation", slug: "meditation", created_at: new Date().toISOString() },
  { id: "6", name: "Peurs", slug: "peurs", created_at: new Date().toISOString() },
  { id: "7", name: "Techniques", slug: "techniques", created_at: new Date().toISOString() }
];

export const articles: Article[] = [
  {
    id: "1",
    title: "Les fondements de l'hypnose ericksonienne",
    content: `
      <p>L'hypnose ericksonienne, développée par Milton H. Erickson, est une approche qui se distingue par sa flexibilité et son adaptation au patient. Contrairement à l'hypnose traditionnelle, cette méthode utilise le langage indirect et les métaphores pour faciliter les changements thérapeutiques.</p>
      
      <h2>Les principes fondamentaux</h2>
      
      <p>L'approche ericksonienne repose sur plusieurs principes essentiels :</p>
      
      <ul>
        <li>Chaque individu possède ses propres ressources pour résoudre ses problèmes</li>
        <li>L'inconscient est un réservoir de ressources positives</li>
        <li>La résistance du patient est respectée et utilisée de façon constructive</li>
        <li>Le thérapeute s'adapte au patient plutôt que l'inverse</li>
      </ul>
      
      <p>Cette méthode utilise particulièrement le langage métaphorique qui permet de contourner les résistances conscientes et d'accéder directement aux ressources inconscientes.</p>
      
      <h2>Applications thérapeutiques</h2>
      
      <p>L'hypnose ericksonienne s'avère efficace dans le traitement de nombreuses problématiques :</p>
      
      <ul>
        <li>Gestion du stress et de l'anxiété</li>
        <li>Traitement des phobies</li>
        <li>Accompagnement des douleurs chroniques</li>
        <li>Amélioration des troubles du sommeil</li>
        <li>Renforcement de la confiance en soi</li>
      </ul>
      
      <p>Cette approche se caractérise par sa douceur et son respect du rythme propre à chaque individu.</p>
    `,
    excerpt: "Découvrez les principes et applications de l'hypnose ericksonienne, une approche thérapeutique flexible centrée sur les ressources du patient.",
    image_url: "/placeholder.svg",
    seo_description: "Tout savoir sur l'hypnose ericksonienne: principes, techniques et applications thérapeutiques pour le bien-être et la transformation personnelle.",
    keywords: ["hypnose", "erickson", "thérapie", "inconscient"],
    categories: ["Hypnose Thérapeutique"],
    author: "Alain Zenatti",
    slug: "fondements-hypnose-ericksonienne",
    read_time: 8,
    published: true,
    created_at: "2025-05-01T10:00:00Z",
    updated_at: "2025-05-01T10:00:00Z",
    tags: [tags[0], tags[6]],
    featured: false
  },
  {
    id: "2",
    title: "Comment l'hypnose peut améliorer la qualité du sommeil",
    content: `
      <p>Le sommeil est un pilier fondamental de notre santé physique et mentale. Pourtant, de nombreuses personnes souffrent de troubles du sommeil qui affectent considérablement leur qualité de vie.</p>
      
      <h2>L'hypnose comme solution naturelle</h2>
      
      <p>L'hypnothérapie offre une approche non-médicamenteuse particulièrement efficace pour traiter l'insomnie et d'autres problèmes de sommeil. Elle agit en:</p>
      
      <ul>
        <li>Apaisant le système nerveux et réduisant l'hyperactivité mentale</li>
        <li>Reprogrammant les habitudes de sommeil au niveau inconscient</li>
        <li>Résolvant les causes psychologiques sous-jacentes aux troubles du sommeil</li>
        <li>Renforçant les cycles naturels de sommeil</li>
      </ul>
      
      <h2>Techniques hypnotiques pour mieux dormir</h2>
      
      <p>Plusieurs techniques peuvent être utilisées en séance ou en auto-hypnose:</p>
      
      <ul>
        <li>La relaxation progressive pour détendre le corps</li>
        <li>La visualisation d'un lieu sécurisant et apaisant</li>
        <li>L'ancrage d'états propices au sommeil</li>
        <li>La restructuration des pensées négatives liées au sommeil</li>
      </ul>
      
      <p>Ces méthodes permettent de restaurer un sommeil réparateur et d'améliorer significativement la qualité de vie.</p>
    `,
    excerpt: "L'hypnose thérapeutique offre des solutions efficaces pour combattre l'insomnie et retrouver un sommeil naturel et réparateur.",
    image_url: "/placeholder.svg",
    seo_description: "Découvrez comment l'hypnose peut aider à résoudre les troubles du sommeil et l'insomnie grâce à des techniques naturelles et efficaces.",
    keywords: ["sommeil", "insomnie", "hypnose", "bien-être"],
    categories: ["Bien-être"],
    author: "Alain Zenatti",
    slug: "hypnose-amelioration-sommeil",
    read_time: 6,
    published: true,
    created_at: "2025-04-25T14:30:00Z",
    updated_at: "2025-04-25T14:30:00Z",
    tags: [tags[2], tags[0]],
    featured: false
  },
  {
    id: "3",
    title: "Vaincre ses peurs grâce à l'hypnothérapie",
    content: `
      <p>Les peurs et les phobies peuvent considérablement limiter notre vie quotidienne et notre épanouissement personnel. Qu'il s'agisse de la peur de l'avion, des espaces confinés, des araignées ou de parler en public, ces craintes peuvent devenir invalidantes.</p>
      
      <h2>Comprendre le mécanisme des peurs</h2>
      
      <p>Les peurs sont souvent des réactions apprises et ancrées dans l'inconscient suite à des expériences particulières. Le cerveau a associé certains stimuli à un danger potentiel, même lorsque cette association n'est plus justifiée dans le présent.</p>
      
      <h2>L'approche hypnothérapeutique</h2>
      
      <p>L'hypnose permet de :</p>
      
      <ul>
        <li>Accéder aux origines inconscientes de la peur</li>
        <li>Restructurer l'expérience émotionnelle associée</li>
        <li>Créer de nouvelles associations mentales positives</li>
        <li>Renforcer les ressources intérieures face aux situations redoutées</li>
      </ul>
      
      <h2>Un processus en douceur</h2>
      
      <p>Le travail se fait progressivement, en respectant le rythme de la personne et sans jamais la confronter brutalement à sa peur. C'est cette approche respectueuse qui permet des transformations profondes et durables.</p>
      
      <p>De nombreux patients témoignent d'une libération rapide de peurs parfois anciennes, leur permettant de reprendre pleinement possession de leur vie.</p>
    `,
    excerpt: "Découvrez comment l'hypnothérapie offre une approche douce et efficace pour surmonter les peurs et phobies qui limitent votre quotidien.",
    image_url: "/placeholder.svg",
    seo_description: "L'hypnothérapie comme solution efficace pour vaincre les phobies et les peurs - Méthodes et résultats concrets pour retrouver sa liberté.",
    keywords: ["peurs", "phobies", "hypnothérapie", "thérapie"],
    categories: ["Hypnose Thérapeutique"],
    author: "Alain Zenatti",
    slug: "vaincre-peurs-hypnotherapie",
    read_time: 7,
    published: true,
    created_at: "2025-04-18T09:15:00Z",
    updated_at: "2025-04-18T09:15:00Z",
    tags: [tags[5], tags[3]],
    featured: false
  },
  {
    id: "4",
    title: "Auto-hypnose : comment pratiquer au quotidien",
    content: `
      <p>L'auto-hypnose est une compétence précieuse qui permet d'accéder par soi-même aux ressources de son inconscient. Contrairement à une idée reçue, il s'agit d'un état naturel que nous expérimentons tous régulièrement sans nécessairement le reconnaître.</p>
      
      <h2>Les bases de l'auto-hypnose</h2>
      
      <p>Pour pratiquer efficacement, quelques principes fondamentaux :</p>
      
      <ul>
        <li>Choisir un moment et un lieu calme</li>
        <li>Adopter une position confortable</li>
        <li>Fixer une intention claire avant de commencer</li>
        <li>Utiliser la respiration comme ancrage</li>
      </ul>
      
      <h2>Une technique simple pour débuter</h2>
      
      <ol>
        <li>Installez-vous confortablement et fixez un point devant vous</li>
        <li>Respirez profondément trois fois</li>
        <li>Commencez à compter à rebours de 10 à 1 en vous sentant de plus en plus détendu</li>
        <li>Visualisez un escalier et descendez-le marche par marche</li>
        <li>À la dernière marche, imaginez-vous dans un lieu ressourçant</li>
        <li>Formulez vos suggestions positives</li>
        <li>Pour revenir, comptez de 1 à 5 en vous sentant de plus en plus alerte</li>
      </ol>
      
      <h2>Applications pratiques</h2>
      
      <p>L'auto-hypnose peut être utilisée pour :</p>
      
      <ul>
        <li>Gérer le stress au quotidien</li>
        <li>Améliorer la concentration</li>
        <li>Renforcer la confiance en soi</li>
        <li>Faciliter l'endormissement</li>
        <li>Apaiser des douleurs légères</li>
      </ul>
      
      <p>Une pratique régulière, même de courte durée (5-10 minutes), permet d'obtenir des résultats significatifs.</p>
    `,
    excerpt: "Apprenez les techniques fondamentales d'auto-hypnose à pratiquer quotidiennement pour améliorer votre bien-être et développer votre potentiel.",
    image_url: "/placeholder.svg",
    seo_description: "Guide pratique d'auto-hypnose : techniques simples et efficaces pour gérer le stress, améliorer le sommeil et renforcer la confiance en soi.",
    keywords: ["auto-hypnose", "bien-être", "pratique", "technique"],
    categories: ["Développement Personnel"],
    author: "Alain Zenatti",
    slug: "auto-hypnose-pratique-quotidienne",
    read_time: 9,
    published: true,
    created_at: "2025-04-10T11:45:00Z",
    updated_at: "2025-04-10T11:45:00Z",
    tags: [tags[4], tags[3], tags[6]],
    featured: false
  },
  {
    id: "5",
    title: "Mon expérience avec l'hypnose pour vaincre l'anxiété",
    content: `
      <p>Je m'appelle Marie, j'ai 34 ans, et pendant plus de dix ans, j'ai vécu avec une anxiété chronique qui limitait considérablement ma vie quotidienne.</p>
      
      <h2>Le cercle vicieux de l'anxiété</h2>
      
      <p>Mon anxiété se manifestait par des crises de panique imprévisibles, une sensation constante d'inquiétude et une tendance à catastrophiser la moindre situation. Les médicaments m'aidaient temporairement mais créaient une dépendance dont j'avais du mal à me défaire.</p>
      
      <h2>Ma rencontre avec l'hypnothérapie</h2>
      
      <p>C'est sur recommandation d'une amie que j'ai décidé de consulter un hypnothérapeute. Sceptique au début, j'ai néanmoins été surprise par l'approche bienveillante et pragmatique qui m'a été proposée.</p>
      
      <p>Dès la première séance, j'ai ressenti un profond sentiment de calme que je n'avais pas éprouvé depuis longtemps. Les séances suivantes ont permis de :</p>
      
      <ul>
        <li>Identifier les sources profondes de mon anxiété</li>
        <li>Désactiver les déclencheurs automatiques de mes crises</li>
        <li>Ancrer des ressources de confiance et de sérénité</li>
        <li>Apprendre à pratiquer l'auto-hypnose au quotidien</li>
      </ul>
      
      <h2>Des résultats durables</h2>
      
      <p>Après seulement six séances, les changements étaient remarquables. Un an plus tard, je peux affirmer que l'hypnothérapie a transformé ma relation à l'anxiété. Les crises de panique ont disparu et j'ai développé des outils efficaces pour gérer mon stress au quotidien.</p>
      
      <p>Cette expérience m'a appris que nos plus grandes difficultés peuvent se transformer en opportunités de croissance personnelle, avec le bon accompagnement.</p>
    `,
    excerpt: "Marie partage son parcours personnel et comment l'hypnothérapie lui a permis de surmonter une anxiété chronique qui limitait sa vie depuis plus de dix ans.",
    image_url: "/placeholder.svg",
    seo_description: "Témoignage sur l'efficacité de l'hypnose thérapeutique dans le traitement de l'anxiété chronique - Un parcours de guérison inspirant.",
    keywords: ["témoignage", "anxiété", "hypnose", "guérison"],
    categories: ["Témoignages"],
    author: "Alain Zenatti",
    slug: "temoignage-hypnose-anxiete",
    read_time: 5,
    published: true,
    created_at: "2025-04-05T16:20:00Z",
    updated_at: "2025-04-05T16:20:00Z",
    tags: [tags[1], tags[0]],
    featured: false
  },
];

export const sortOptions = [
  { label: "Plus récent", value: "newest" },
  { label: "Plus ancien", value: "oldest" },
  { label: "Alphabétique A-Z", value: "az" },
  { label: "Alphabétique Z-A", value: "za" },
];
