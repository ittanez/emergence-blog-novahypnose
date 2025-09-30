import React, { useState } from 'react';
import { ChevronRight, RefreshCw, Copy, Check } from 'lucide-react';

const VEO3Generator = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [jsonOutput, setJsonOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const questions = [
    {
      id: 'concept',
      title: 'Quel est le concept principal de ta vidéo ?',
      subtitle: 'Décris en quelques mots ce que tu veux montrer',
      type: 'text',
      placeholder: 'Ex: Une sneaker qui se transforme, un parfum qui explose en particules, une voiture qui s\'assemble...'
    },
    {
      id: 'hasImage',
      title: 'As-tu une image de départ à intégrer ?',
      subtitle: 'VEO 3 peut partir d\'une image existante',
      type: 'choice',
      options: [
        { value: 'none', label: 'Non, génération pure' },
        { value: 'product', label: 'Oui, une photo de produit' },
        { value: 'logo', label: 'Oui, un logo/marque' },
        { value: 'packaging', label: 'Oui, un packaging fermé' },
        { value: 'person', label: 'Oui, une personne/silhouette' },
        { value: 'ingredients', label: 'Oui, des éléments épars' }
      ]
    },
    {
      id: 'transformation',
      title: 'Quel type de transformation veux-tu ?',
      subtitle: 'Comment les éléments vont-ils évoluer ?',
      type: 'choice',
      options: [
        { value: 'explosion', label: '💥 Explosion magique', desc: 'Éléments qui explosent puis se rassemblent' },
        { value: 'environment', label: '🌍 Transformation d\'environnement', desc: 'Le décor change autour de l\'objet' },
        { value: 'particles', label: '✨ Assemblage par particules', desc: 'Particules qui forment l\'objet' },
        { value: 'unboxing', label: '📦 Ouverture/Déballage', desc: 'Révélation depuis un contenant' },
        { value: 'mechanical', label: '⚙️ Construction mécanique', desc: 'Assemblage style Transformers' },
        { value: 'materialization', label: '👻 Matérialisation', desc: 'Apparition progressive depuis l\'image' }
      ]
    },
    {
      id: 'style',
      title: 'Quel style visuel préfères-tu ?',
      subtitle: 'L\'ambiance générale de ta vidéo',
      type: 'choice',
      options: [
        { value: 'photorealistic', label: '📸 Photoréaliste cinématique' },
        { value: 'minimalist', label: '⚪ Minimaliste premium (style Apple)' },
        { value: 'magical', label: '🔮 Réalisme magique' },
        { value: 'futuristic', label: '🚀 Futuriste dynamique' },
        { value: 'industrial', label: '🏭 Industriel mecha' },
        { value: 'luxury', label: '💎 Luxe élégant' },
        { value: 'cozy', label: '🏠 Chaleureux cosy' },
        { value: 'trendy', label: '📱 Tendance réseaux sociaux' }
      ]
    },
    {
      id: 'environment',
      title: 'Quel environnement pour ta scène ?',
      subtitle: 'Le décor de fond (adapté au format vertical)',
      type: 'choice',
      options: [
        { value: 'white_space', label: '⚪ Espace blanc infini' },
        { value: 'gradient', label: '🌈 Fond dégradé coloré' },
        { value: 'luxury_room', label: '🏛️ Showroom luxueux vertical' },
        { value: 'cozy_interior', label: '🏠 Intérieur cosy portrait' },
        { value: 'urban_street', label: '🏙️ Rue urbaine verticale' },
        { value: 'floating_dream', label: '☁️ Paysage flottant onirique' },
        { value: 'scandinavian', label: '🪑 Pièce scandinave haute' },
        { value: 'studio', label: '🎬 Studio cyclorama' }
      ]
    },
    {
      id: 'duration',
      title: 'Quelle durée pour ta vidéo ?',
      subtitle: 'Plus c\'est long, plus il y aura de transformations',
      type: 'choice',
      options: [
        { value: 'short', label: '⚡ Court (5 secondes)', desc: 'Impact rapide' },
        { value: 'medium', label: '⏱️ Moyen (8 secondes)', desc: 'Équilibré' },
        { value: 'long', label: '🎬 Long (10-15 secondes)', desc: 'Plus de détails' }
      ]
    },
    {
      id: 'effects',
      title: 'Effets visuels spéciaux souhaités ?',
      subtitle: 'Tu peux en choisir plusieurs (optionnel)',
      type: 'multiple',
      options: [
        { value: 'golden_particles', label: '✨ Particules dorées' },
        { value: 'liquid_explosion', label: '💧 Explosion liquide' },
        { value: 'holographic', label: '👻 Assemblage holographique' },
        { value: 'neon_transform', label: '💡 Transformation néon' },
        { value: 'slow_motion', label: '🐌 Effet slow motion' },
        { value: 'condensation', label: '💨 Condensation réaliste' },
        { value: 'metallic_reflections', label: '🪞 Reflets métalliques' },
        { value: 'dramatic_smoke', label: '💨 Fumée dramatique' }
      ]
    },
    {
      id: 'colors',
      title: 'Palette de couleurs principale ?',
      subtitle: 'Ambiance colorimétrique (optionnel)',
      type: 'text',
      placeholder: 'Ex: Bleu et or, Rouge vibrant, Noir et blanc, Pastels, etc.'
    }
  ];

  const handleAnswer = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const nextStep = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      generateJSON();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const reset = () => {
    setCurrentStep(0);
    setAnswers({});
    setJsonOutput('');
    setCopied(false);
  };

  const generateJSON = () => {
    const styleMap = {
      photorealistic: 'photorealistic cinematic vertical composition',
      minimalist: 'minimalist premium Apple aesthetic mobile-optimized',
      magical: 'magical realism ethereal vertical framing',
      futuristic: 'futuristic dynamic cyberpunk portrait mode',
      industrial: 'industrial mecha mechanical vertical composition',
      luxury: 'elegant luxury premium vertical showcase',
      cozy: 'warm cozy intimate portrait lighting',
      trendy: 'social media trendy vibrant mobile-first'
    };

    const environmentMap = {
      white_space: 'infinite white space with soft vertical gradient',
      gradient: 'smooth color gradient backdrop with ethereal depth',
      luxury_room: 'luxury showroom with vertical spotlight arrangement',
      cozy_interior: 'cozy interior with warm vertical lighting',
      urban_street: 'urban street scene optimized for portrait view',
      floating_dream: 'floating dreamscape with vertical cloud layers',
      scandinavian: 'scandinavian room with tall windows and natural light',
      studio: 'professional studio cyclorama with controlled lighting'
    };

    const transformationMap = {
      explosion: 'explosive magical transformation',
      environment: 'environment transformation sequence',
      particles: 'particle assembly animation',
      unboxing: 'unboxing reveal sequence',
      mechanical: 'mechanical construction assembly',
      materialization: 'progressive materialization'
    };

    const cameraMap = {
      explosion: 'vertical tracking shot with slight upward tilt as elements rise and converge',
      environment: 'portrait mode push-in with smooth vertical reveal of transformation',
      particles: 'steady vertical frame with subtle orbital drift around formation',
      unboxing: 'top-down transitioning to eye-level vertical reveal',
      mechanical: 'dynamic vertical tracking with controlled shake on mechanical impacts',
      materialization: 'static frame with focus pull from initial image to final materialized form'
    };

    const motionMap = {
      explosion: 'explodes outward then gracefully reassembles',
      environment: 'transforms fluidly around central focal point',
      particles: 'swirls elegantly into precise formation',
      unboxing: 'opens smoothly revealing internal universe',
      mechanical: 'snaps precisely into place with mechanical precision',
      materialization: 'materializes progressively with ethereal emergence'
    };

    const durationMap = {
      short: '5 seconds',
      medium: '8 seconds',
      long: '10-15 seconds'
    };

    const imageIntegration = answers.hasImage !== 'none' ?
      `Starting from the provided ${answers.hasImage} image, ` : 'In a vertical 9:16 composition, ';

    const effectsList = answers.effects ? answers.effects.join(', ') : 'smooth controlled effects';

    const json = {
      description: `${imageIntegration}${answers.concept} undergoes a ${transformationMap[answers.transformation]} in ${environmentMap[answers.environment]}. The sequence flows smoothly with ${effectsList}, creating a visually stunning ${durationMap[answers.duration]} experience optimized for mobile viewing.`,

      style: `${styleMap[answers.style]} with mobile-optimized framing. Never fast motion - smooth controlled pace with cinematic quality.`,

      camera: `${cameraMap[answers.transformation]}${answers.hasImage !== 'none' ? ', integrating seamlessly from source image' : ''}`,

      lighting: `Vertical lighting setup optimized for ${answers.style} style with dramatic shadows and highlights positioned for portrait orientation`,

      environment: environmentMap[answers.environment],

      elements: [
        `Central subject: ${answers.concept}`,
        answers.hasImage !== 'none' ? `Source image: ${answers.hasImage} integration` : 'Generated composition',
        '3-4 supporting elements optimized for vertical framing',
        '2 ambient elements enhancing the mobile viewing experience',
        `Visual effects: ${effectsList}`,
        'Signature finishing touches for premium feel'
      ],

      motion: `${answers.concept} ${motionMap[answers.transformation]} over ${durationMap[answers.duration]}. All movements are smooth and controlled, never rushed, with elegant vertical flow patterns.`,

      ending: `Final reveal of ${answers.concept} perfectly centered in vertical frame with premium presentation`,

      text: 'none',

      pacing: 'smooth controlled rhythm, deliberate timing, never fast motion',

      colors: answers.colors || 'natural cinematic color grading',

      keywords: [
        '9:16',
        'vertical format',
        'mobile optimized',
        transformationMap[answers.transformation],
        answers.style,
        '4K portrait',
        'hyper-realistic',
        'cinematic vertical',
        'no text',
        'smooth motion',
        answers.hasImage !== 'none' ? 'image integration' : 'pure generation',
        'premium quality'
      ]
    };

    setJsonOutput(JSON.stringify(json, null, 2));
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(jsonOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  if (jsonOutput) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-purple-50 to-blue-50 min-h-screen">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">🎉 Ton prompt VEO 3 est prêt !</h1>
            <p className="text-gray-600">Copie ce JSON et utilise-le dans VEO 3</p>
          </div>

          <div className="relative bg-gray-900 rounded-lg p-6 mb-6">
            <button
              onClick={copyToClipboard}
              className="absolute top-4 right-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copié !' : 'Copier'}
            </button>

            <pre className="text-green-400 text-sm overflow-x-auto pr-20">
              <code>{jsonOutput}</code>
            </pre>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={reset}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
            >
              <RefreshCw size={16} />
              Nouveau prompt
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gradient-to-br from-purple-50 to-blue-50 min-h-screen">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🎬 Générateur VEO 3</h1>
          <p className="text-gray-600">Format 9:16 • Questions interactives</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500 mt-2 text-center">
            Question {currentStep + 1} sur {questions.length}
          </p>
        </div>

        {/* Question */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">
            {currentQuestion.title}
          </h2>
          <p className="text-gray-600 mb-6">{currentQuestion.subtitle}</p>

          {/* Answer Input */}
          {currentQuestion.type === 'text' && (
            <textarea
              placeholder={currentQuestion.placeholder}
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
              className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none h-32 resize-none"
            />
          )}

          {currentQuestion.type === 'choice' && (
            <div className="space-y-3">
              {currentQuestion.options.map((option) => (
                <div
                  key={option.value}
                  onClick={() => handleAnswer(currentQuestion.id, option.value)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    answers[currentQuestion.id] === option.value
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-semibold text-gray-800">{option.label}</div>
                  {option.desc && <div className="text-sm text-gray-600 mt-1">{option.desc}</div>}
                </div>
              ))}
            </div>
          )}

          {currentQuestion.type === 'multiple' && (
            <div className="space-y-3">
              {currentQuestion.options.map((option) => {
                const selected = answers[currentQuestion.id] || [];
                const isSelected = selected.includes(option.value);

                return (
                  <div
                    key={option.value}
                    onClick={() => {
                      const newSelected = isSelected
                        ? selected.filter(v => v !== option.value)
                        : [...selected, option.value];
                      handleAnswer(currentQuestion.id, newSelected);
                    }}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-semibold text-gray-800">{option.label}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`px-6 py-3 rounded-lg transition-colors ${
              currentStep === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-600 hover:bg-gray-700 text-white'
            }`}
          >
            Précédent
          </button>

          <button
            onClick={nextStep}
            disabled={!answers[currentQuestion.id] || (currentQuestion.type === 'multiple' && (!answers[currentQuestion.id] || answers[currentQuestion.id].length === 0))}
            className={`px-6 py-3 rounded-lg flex items-center gap-2 transition-colors ${
              !answers[currentQuestion.id] || (currentQuestion.type === 'multiple' && (!answers[currentQuestion.id] || answers[currentQuestion.id].length === 0))
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg'
            }`}
          >
            {currentStep === questions.length - 1 ? 'Générer le JSON' : 'Suivant'}
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VEO3Generator;