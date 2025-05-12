const { estimateCalories } = require('../utils/calorieEstimator');

describe('Estimation des calories', () => {
  // Test de l'estimation basée sur des aliments connus
  it('devrait estimer correctement les calories pour une pomme', () => {
    // Simuler des concepts détectés par Clarifai pour une pomme
    const concepts = [
      { name: 'apple', value: 0.95 },
      { name: 'fruit', value: 0.90 },
      { name: 'red', value: 0.85 }
    ];

    // Tester l'estimation
    const result = estimateCalories(concepts);
    
    // Vérifications
    expect(result).toHaveProperty('foodName', 'apple');
    expect(result).toHaveProperty('calories');
    // Une pomme fait environ 72-95 calories
    expect(result.calories).toBeGreaterThanOrEqual(70);
    expect(result.calories).toBeLessThanOrEqual(100);
  });

  it('devrait estimer correctement les calories pour une pizza', () => {
    // Simuler des concepts détectés par Clarifai pour une pizza
    const concepts = [
      { name: 'pizza', value: 0.98 },
      { name: 'food', value: 0.95 },
      { name: 'cheese', value: 0.88 }
    ];

    // Tester l'estimation
    const result = estimateCalories(concepts);
    
    // Vérifications
    expect(result).toHaveProperty('foodName', 'pizza');
    expect(result).toHaveProperty('calories');
    // Une part de pizza fait environ 250-350 calories
    expect(result.calories).toBeGreaterThanOrEqual(250);
    expect(result.calories).toBeLessThanOrEqual(350);
  });

  it('devrait gérer les concepts inconnus', () => {
    // Simuler des concepts qui ne correspondent pas à des aliments connus
    const concepts = [
      { name: 'abstract', value: 0.90 },
      { name: 'texture', value: 0.85 },
      { name: 'pattern', value: 0.80 }
    ];

    // Tester l'estimation
    const result = estimateCalories(concepts);
    
    // Vérifications
    expect(result).toHaveProperty('foodName', 'unknown food');
    expect(result).toHaveProperty('calories');
    // Valeur par défaut pour un aliment inconnu
    expect(result.calories).toBe(250);
  });

  it('devrait gérer un tableau de concepts vide', () => {
    // Tester l'estimation avec un tableau vide
    const result = estimateCalories([]);
    
    // Vérifications
    expect(result).toHaveProperty('foodName', 'unknown food');
    expect(result).toHaveProperty('calories', 250);
  });

  it('devrait prioriser les concepts avec les valeurs les plus élevées', () => {
    // Tester avec des concepts où l'aliment n'est pas en première position
    const concepts = [
      { name: 'plate', value: 0.98 },
      { name: 'chicken', value: 0.97 },
      { name: 'food', value: 0.95 }
    ];

    // Tester l'estimation
    const result = estimateCalories(concepts);
    
    // Le concept 'chicken' devrait être prioritaire car c'est un aliment avec une valeur élevée
    expect(result).toHaveProperty('foodName', 'chicken');
    expect(result).toHaveProperty('calories');
    // Un morceau de poulet fait environ 150-250 calories
    expect(result.calories).toBeGreaterThanOrEqual(150);
    expect(result.calories).toBeLessThanOrEqual(250);
  });
});
