import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import Category from '../models/Category';
import Quiz from '../models/Quiz';
import Question from '../models/Question';
import User from '../models/User';

dotenv.config();

const seedSE = async () => {
  try {
    // 1. Connect to DB
    const dbUri = process.env.MONGODB_URI;
    if (!dbUri) {
      throw new Error('MONGODB_URI is not defined in env.');
    }
    console.log(`Connecting to MongoDB at: ${dbUri}`);
    await mongoose.connect(dbUri);
    console.log('MongoDB connection established successfully.');

    // 1.5 Find or create a default Admin user to assign as quiz creator
    console.log('Finding or creating a default Admin user...');
    let admin = await User.findOne({ role: { $in: ['Admin', 'SuperAdmin'] } });
    if (!admin) {
      console.log('No Admin user found. Seeding default Admin "system_admin"...');
      const passwordHash = await bcrypt.hash('admin123', 10);
      admin = new User({
        username: 'system_admin',
        email: 'admin@quizapp.com',
        passwordHash,
        role: 'SuperAdmin',
        isVerified: true
      });
      await admin.save();
      console.log('Default Admin user "system_admin" created.');
    } else {
      console.log(`Using existing Admin user "${admin.username}" as creator.`);
    }

    // 2. Upsert Category
    console.log('Upserting Software Engineering Category...');
    let seCategory = await Category.findOne({ name: 'Software Engineering' });
    if (!seCategory) {
      seCategory = new Category({
        name: 'Software Engineering',
        description: 'Topics related to Agile development, Scrum, design patterns, testing, and system architecture.'
      });
      await seCategory.save();
      console.log('Category "Software Engineering" created.');
    } else {
      console.log('Category "Software Engineering" already exists.');
    }

    const categoryId = seCategory._id;

    // Define seed datasets
    const quizzesToSeed = [
      {
        title: 'Agile Software Development & Scrum',
        description: 'Test your understanding of the Agile manifesto, values, roles, Scrum artifacts, and standup meetings.',
        timeLimit: 600, // 10 minutes
        questions: [
          {
            questionText: 'What does the Agile Manifesto prioritize over processes and tools?',
            points: 5,
            options: [
              { optionText: 'Individuals and interactions', isCorrect: true },
              { optionText: 'Comprehensive documentation', isCorrect: false },
              { optionText: 'Contract negotiation', isCorrect: false },
              { optionText: 'Following a plan', isCorrect: false }
            ]
          },
          {
            questionText: 'What is the typical duration of a Sprint in Scrum methodologies?',
            points: 5,
            options: [
              { optionText: '1 to 4 weeks', isCorrect: true },
              { optionText: '3 to 6 months', isCorrect: false },
              { optionText: '1 year', isCorrect: false },
              { optionText: '1 day', isCorrect: false }
            ]
          },
          {
            questionText: 'Who is solely responsible for managing and prioritizing items in the Product Backlog?',
            points: 5,
            options: [
              { optionText: 'Product Owner', isCorrect: true },
              { optionText: 'Scrum Master', isCorrect: false },
              { optionText: 'Lead Developer', isCorrect: false },
              { optionText: 'Project Manager', isCorrect: false }
            ]
          },
          {
            questionText: 'What is the primary objective of the Daily Standup (Daily Scrum) meeting?',
            points: 5,
            options: [
              { optionText: 'To synchronize daily team activities and identify impediments', isCorrect: true },
              { optionText: 'To demonstrate the working product increment to stakeholders', isCorrect: false },
              { optionText: 'To conduct performance evaluations of developers', isCorrect: false },
              { optionText: 'To assign specific bugs to dev team members', isCorrect: false }
            ]
          },
          {
            questionText: 'Which Scrum artifact captures the set of Product Backlog items selected for the current cycle?',
            points: 5,
            options: [
              { optionText: 'Sprint Backlog', isCorrect: true },
              { optionText: 'Product Backlog', isCorrect: false },
              { optionText: 'Burnup Chart', isCorrect: false },
              { optionText: 'Sprint Retrospective', isCorrect: false }
            ]
          }
        ]
      },
      {
        title: 'Software Design Patterns',
        description: 'Challenge your knowledge of creational, structural, and behavioral OOP patterns.',
        timeLimit: 900, // 15 minutes
        questions: [
          {
            questionText: 'Which design pattern restricts a class instantiation to one single static instance?',
            points: 5,
            options: [
              { optionText: 'Singleton Pattern', isCorrect: true },
              { optionText: 'Factory Pattern', isCorrect: false },
              { optionText: 'Observer Pattern', isCorrect: false },
              { optionText: 'Decorator Pattern', isCorrect: false }
            ]
          },
          {
            questionText: 'Which design pattern defines a one-to-many relationship so that when one object changes state, dependents are notified?',
            points: 5,
            options: [
              { optionText: 'Observer Pattern', isCorrect: true },
              { optionText: 'Strategy Pattern', isCorrect: false },
              { optionText: 'Adapter Pattern', isCorrect: false },
              { optionText: 'Facade Pattern', isCorrect: false }
            ]
          },
          {
            questionText: 'Which pattern allows objects with incompatible interfaces to collaborate effectively together?',
            points: 5,
            options: [
              { optionText: 'Adapter Pattern', isCorrect: true },
              { optionText: 'Bridge Pattern', isCorrect: false },
              { optionText: 'Proxy Pattern', isCorrect: false },
              { optionText: 'Builder Pattern', isCorrect: false }
            ]
          },
          {
            questionText: 'Which pattern separates the construction steps of a complex object from its representation logic?',
            points: 5,
            options: [
              { optionText: 'Builder Pattern', isCorrect: true },
              { optionText: 'Prototype Pattern', isCorrect: false },
              { optionText: 'Abstract Factory', isCorrect: false },
              { optionText: 'Composite Pattern', isCorrect: false }
            ]
          },
          {
            questionText: 'What is the main goal of the Strategy Pattern?',
            points: 5,
            options: [
              { optionText: 'Define a family of interchangeable algorithms and encapsulate each one', isCorrect: true },
              { optionText: 'Provide a simplified unified interface to a complex subsystem', isCorrect: false },
              { optionText: 'Dynamically add responsibilities and behaviors to an object', isCorrect: false },
              { optionText: 'Manage object access credentials securely', isCorrect: false }
            ]
          }
        ]
      },
      {
        title: 'Software Architecture & SOLID Principles',
        description: 'Test your understanding of SOLID design principles and standard architecture paradigms.',
        timeLimit: 600, // 10 minutes
        questions: [
          {
            questionText: 'What does the Open-Closed Principle (OCP) in SOLID state?',
            points: 5,
            options: [
              { optionText: 'Classes should be open for extension but closed for modification', isCorrect: true },
              { optionText: 'Modules should be open to imports but closed to internal changes', isCorrect: false },
              { optionText: 'Databases should be open to reads but closed to writes', isCorrect: false },
              { optionText: 'APIs should be open to students but closed to public domains', isCorrect: false }
            ]
          },
          {
            questionText: 'What architectural style consists of independent, decoupled, micro-deployable services?',
            points: 5,
            options: [
              { optionText: 'Microservices Architecture', isCorrect: true },
              { optionText: 'Monolithic Architecture', isCorrect: false },
              { optionText: 'Layered (N-Tier) Architecture', isCorrect: false },
              { optionText: 'Client-Server Architecture', isCorrect: false }
            ]
          },
          {
            questionText: 'Which SOLID principle states that subclasses must be substitutable for their parent class without altering code correctness?',
            points: 5,
            options: [
              { optionText: 'Liskov Substitution Principle', isCorrect: true },
              { optionText: 'Interface Segregation Principle', isCorrect: false },
              { optionText: 'Dependency Inversion Principle', isCorrect: false },
              { optionText: 'Single Responsibility Principle', isCorrect: false }
            ]
          },
          {
            questionText: 'What does the Single Responsibility Principle state?',
            points: 5,
            options: [
              { optionText: 'A class should have only one reason to change', isCorrect: true },
              { optionText: 'A project should have only one developer in charge', isCorrect: false },
              { optionText: 'A function should have exactly one parameter', isCorrect: false },
              { optionText: 'A database should have only one index table', isCorrect: false }
            ]
          },
          {
            questionText: 'What is a primary advantage of loose coupling in software architecture?',
            points: 5,
            options: [
              { optionText: 'Modifying one module does not impact or require modifications in other modules', isCorrect: true },
              { optionText: 'It ensures maximum compilation speeds during builds', isCorrect: false },
              { optionText: 'It eliminates the need to carry out automated tests', isCorrect: false },
              { optionText: 'It merges all components into a single executable binary', isCorrect: false }
            ]
          }
        ]
      }
    ];

    // Clean and seed quizzes
    for (const quizData of quizzesToSeed) {
      console.log(`Processing seed for quiz: "${quizData.title}"...`);
      
      // Look for existing quiz by title and category
      let existingQuiz = await Quiz.findOne({ title: quizData.title, categoryId });
      
      if (existingQuiz) {
        console.log(`Deleting existing version of "${quizData.title}" and its questions...`);
        // Remove existing questions for this quiz
        await Question.deleteMany({ quizId: existingQuiz._id });
        // Remove the quiz itself
        await Quiz.findByIdAndDelete(existingQuiz._id);
      }

      // Create new quiz
      const newQuiz = new Quiz({
        categoryId,
        title: quizData.title,
        description: quizData.description,
        timeLimit: quizData.timeLimit,
        creatorId: admin._id
      });
      await newQuiz.save();
      console.log(`Quiz "${quizData.title}" registered successfully.`);

      // Seed questions for the quiz
      for (const q of quizData.questions) {
        const newQuestion = new Question({
          quizId: newQuiz._id,
          questionText: q.questionText,
          points: q.points,
          options: q.options
        });
        await newQuestion.save();
      }
      console.log(`Successfully seeded ${quizData.questions.length} questions for "${quizData.title}".`);
    }

    console.log('\nSoftware Engineering seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration Seeding failed:', error);
    process.exit(1);
  }
};

seedSE();
