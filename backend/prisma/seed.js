/**
 * Script de seed Prisma pour initialiser la base de données
 * Crée des utilisateurs et programmes de test
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Utilisateurs de test avec leurs identifiants Firebase
const testUsers = [
  { 
    email: 'test@example.com',
    firebaseUid: 'test-user-123',
    profile: {
      age: 30,
      sex: 'Homme',
      currentActivityLevel: 'Intermédiaire',
      sportObjective: 'Renforcement musculaire',
      sportConstraints: ['Travail assis', 'Peu de temps libre'],
      availableEquipment: ['Haltères', 'Tapis de yoga'],
      availabilityDescription: '3 séances de 45 minutes par semaine'
    }
  },
  { 
    email: 'demo@example.com',
    firebaseUid: 'demo-user-456',
    profile: {
      age: 25,
      sex: 'Femme',
      currentActivityLevel: 'Débutant',
      sportObjective: 'Perte de poids',
      sportConstraints: ['Genoux sensibles'],
      availableEquipment: ['Bandes élastiques'],
      availabilityDescription: '2 séances de 30 minutes par semaine'
    }
  }
];

// Programme sportif de test
const exampleProgram = {
  name: "Programme de Test Livora UP",
  introduction: "Ce programme d'entraînement complet est conçu pour vous aider à progresser à votre rythme tout en respectant vos contraintes personnelles.",
  sessions: [
    {
      name: "Séance Haut du Corps",
      dayOfWeek: "Lundi",
      description: "Cette séance cible principalement les muscles du haut du corps pour un développement harmonieux.",
      exercises: [
        {
          name: "Pompes",
          sets: "3",
          reps: "10-12",
          restSeconds: 60,
          notes: "Adaptez la position en fonction de votre niveau (genoux au sol pour faciliter)"
        },
        {
          name: "Rowing avec haltères",
          sets: "3",
          reps: "12",
          restSeconds: 60,
          notes: "Maintenez le dos droit pendant tout l'exercice"
        },
        {
          name: "Élévations latérales",
          sets: "3",
          reps: "15",
          restSeconds: 45,
          notes: "Utilisez un poids léger et concentrez-vous sur la forme"
        }
      ]
    },
    {
      name: "Séance Bas du Corps",
      dayOfWeek: "Mercredi",
      description: "Séance axée sur le renforcement des jambes et des fessiers.",
      exercises: [
        {
          name: "Squats",
          sets: "4",
          reps: "15",
          restSeconds: 60,
          notes: "Descendez comme si vous vouliez vous asseoir sur une chaise"
        },
        {
          name: "Fentes avant",
          sets: "3",
          reps: "12 (chaque jambe)",
          restSeconds: 45,
          notes: "Gardez le torse droit et le genou arrière proche du sol"
        },
        {
          name: "Pont fessier",
          sets: "3",
          reps: "15",
          restSeconds: 30,
          notes: "Serrez bien les fessiers en haut du mouvement"
        }
      ]
    },
    {
      name: "Séance Cardio et Core",
      dayOfWeek: "Vendredi",
      description: "Améliore l'endurance cardiovasculaire et renforce les abdominaux.",
      exercises: [
        {
          name: "Jumping Jacks",
          sets: "3",
          reps: "30 secondes",
          restSeconds: 30,
          notes: "Restez dynamique mais contrôlé"
        },
        {
          name: "Planche",
          sets: "3",
          reps: "45 secondes",
          restSeconds: 30,
          notes: "Maintenez une ligne droite des épaules aux talons"
        },
        {
          name: "Mountain Climbers",
          sets: "3",
          reps: "30 secondes",
          restSeconds: 30,
          notes: "Gardez un rythme régulier"
        }
      ]
    }
  ]
};

/**
 * Fonction principale de seed
 */
async function main() {
  console.log('Démarrage du seed de la base de données...');

  // Créer les utilisateurs de test
  for (const userData of testUsers) {
    const { email, firebaseUid, profile } = userData;
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { firebaseUid }
    });

    if (!existingUser) {
      console.log(`Création de l'utilisateur test: ${email}`);
      
      // Créer l'utilisateur
      const user = await prisma.user.create({
        data: {
          email,
          firebaseUid,
          profile: {
            create: {
              age: profile.age,
              sex: profile.sex,
              currentActivityLevel: profile.currentActivityLevel,
              sportObjective: profile.sportObjective,
              sportConstraints: profile.sportConstraints,
              availableEquipment: profile.availableEquipment,
              availabilityDescription: profile.availabilityDescription
            }
          }
        }
      });

      // Créer un programme sportif de test pour cet utilisateur
      await prisma.sportProgram.create({
        data: {
          userId: user.id,
          name: exampleProgram.name,
          introduction: exampleProgram.introduction,
          aiGeneratedProgramJson: exampleProgram,
          isActive: true,
          version: 1
        }
      });

      console.log(`Programme de test créé pour l'utilisateur: ${email}`);
    } else {
      console.log(`L'utilisateur ${email} existe déjà, ignoré.`);
    }
  }

  console.log('Seed terminé avec succès!');
}

// Exécuter la fonction de seed
main()
  .catch((e) => {
    console.error('Erreur lors du seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    // Fermer la connexion Prisma à la fin
    await prisma.$disconnect();
  });
