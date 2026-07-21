const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const backendSrc = path.join(rootDir, 'backend', 'src');
const appSrc = path.join(rootDir, 'app', 'src');
const outputFile = path.join(rootDir, 'CIVICSAFE_COMPLETE_CODEBOOK.md');

// Simple folder-based explanation generator
function getFileExplanation(filePath) {
  const normalizedPath = filePath.replace(/\\/g, '/');
  const filename = path.basename(filePath);
  const baseName = filename.split('.')[0].toLowerCase();
  
  let role = '';
  let details = '';

  // Determine role based on directory path
  if (normalizedPath.includes('backend/src/config')) {
    role = 'Configuration setup file for the backend server';
    details = 'We created this file to setup all the configurations of our backend server in one place. It reads sensitive information from our hidden .env file (like the MongoDB connection string, email passwords, and Firebase keys) using dotenv. This is very important because we should not hardcode passwords directly in our code files for security reasons.';
  } else if (normalizedPath.includes('backend/src/controllers')) {
    role = 'Backend controller file (handles request and response)';
    details = 'This file is a controller which is responsible for handling all the requests sent by the mobile app. For example, when a citizen submits a report or logs in, this controller receives that data, checks if it is correct, does the processing, and saves it into MongoDB. After doing this, it sends a response back to the app (like a success message or an error message). We use try-catch blocks here so that if something goes wrong, the server does not crash and we can show a clean error message.';
  } else if (normalizedPath.includes('backend/src/middleware')) {
    role = 'Backend middleware file (acts like a security guard)';
    details = 'This is a middleware file which acts like a security guard for our server. Before any request goes to the controllers (like fetching admin reports), it goes through this file. This file checks if the user is logged in by verifying their token. If the token is invalid or missing, it blocks them and says they cannot access the data. This helps in keeping our application secure so that unauthorized users cannot change or view private data.';
  } else if (normalizedPath.includes('backend/src/models')) {
    role = 'Database model schema file (defines collection structure in MongoDB)';
    details = 'This is the model file where we define the structure of our database collections using Mongoose. Since we are using MongoDB, we need to specify what fields a document must have. For example, a User model must have name, phone number, and role, while a Report must have category, image, and GPS coordinates. We also define the data types (like String, Number, or Date) so that no wrong data gets saved in the database by mistake.';
  } else if (normalizedPath.includes('backend/src/routes')) {
    role = 'Backend route mapper file (links URLs to code)';
    details = 'This file is used to map specific website URLs (endpoints like /login or /reports) to their respective controller functions. When the mobile app hits a URL, this file tells the Express server which function to execute. We also add our middleware guards here to protect specific routes so that only authorized users can open them.';
  } else if (normalizedPath.includes('backend/src/services')) {
    role = 'Backend service integration file (connects external APIs)';
    details = 'We use this file to write code that connects our backend server to external third-party services. This includes uploading images to Cloudinary, calling the Google Gemini AI for smart checks, or sending emails. By putting this logic in a service file, our main controller code stays neat and simple, and we can easily reuse these functions in different parts of the project.';
  } else if (normalizedPath.includes('backend/src/utils')) {
    role = 'Backend utility helper file';
    details = 'This file contains small utility helper functions that we need in many places. For example, we have loggers to print clean logs in the terminal, check functions to validate emails, and generic functions to format responses so that we do not have to write the same code again and again.';
  } else if (normalizedPath.includes('backend/src/types')) {
    role = 'Backend typescript data types definitions file';
    details = 'This file defines the TypeScript interfaces and types for our backend. We use it to tell the compiler exactly what variables and parameters our code will use. This helps in avoiding coding mistakes and syntax errors because TypeScript will warn us if we use the wrong variable type.';
  } else if (normalizedPath.includes('app/src/components')) {
    role = 'Mobile app reusable UI component';
    details = 'This is a reusable UI component for our React Native app. Instead of writing code for buttons, cards, text inputs, or timelines on every screen, we create them once here and import them wherever needed. This makes our code much shorter and ensures that the design of the app looks uniform and neat across all screens.';
  } else if (normalizedPath.includes('app/src/context')) {
    role = 'Mobile app global state store (Zustand)';
    details = 'We created this store using a library called Zustand. In React Native, passing data between different screens is very difficult and confusing. To solve this, Zustand acts like a central global box where we can store variables like the user login token or active profile details. Any screen in the app can easily read or update this data instantly without complex coding.';
  } else if (normalizedPath.includes('app/src/constants')) {
    role = 'Mobile app global styling and design tokens file';
    details = 'This file stores all the global styles and constant configurations like color codes (primary blue, environmental green), font sizes, spacing parameters, and static lists of categories. It helps us manage the app theme easily, as changing a color code here will update it everywhere in the app.';
  } else if (normalizedPath.includes('app/src/hooks')) {
    role = 'Mobile app custom React hook';
    details = 'This is a custom React Hook that we wrote to separate complex logic from our screen design files. It handles reusable state lifecycles, checks permissions, or maps translation strings (like Hindi/English toggling) to make our code more clean and modular.';
  } else if (normalizedPath.includes('app/src/navigation')) {
    role = 'Mobile app screen routing navigator configuration';
    details = 'This file controls the screen navigation flow of our application using React Navigation. It sets up navigation stacks and tab bars. For example, it writes logic to ensure that if a user is not logged in, they are locked in the login screen, and once they log in successfully, it redirects them to the main citizen dashboard or admin pages.';
  } else if (normalizedPath.includes('app/src/screens')) {
    role = 'Mobile app page design screen component';
    details = 'This file defines a complete screen of our mobile application. It contains the visual layout (UI design) like buttons, texts, forms, or maps, and handles user interactions (like clicking buttons or typing text). It connects with our backend services to fetch and display data on the screen.';
  } else if (normalizedPath.includes('app/src/services')) {
    role = 'Mobile app API connection client (Axios service)';
    details = 'We created this service using Axios to connect our frontend React Native app with our backend server. It handles the base server URL and automatically attaches our authorization token in the request header so the server knows who is making the request. It makes API calls very simple to write.';
  } else if (normalizedPath.includes('app/src/types')) {
    role = 'Mobile app TypeScript data types definitions file';
    details = 'This file defines TypeScript types and interfaces for our frontend mobile application. It ensures type safety by specifying what props a screen needs or what keys a report model has, helping us write bug-free code.';
  } else if (normalizedPath.includes('app/src/utils')) {
    role = 'Mobile app local utility helper';
    details = 'This file contains basic utility functions for the mobile app, like input formatters or email validators, to ensure that the user inputs are correct before sending them to the backend.';
  } else {
    role = 'Project configuration component file';
    details = 'This is a setup configuration file containing metadata and settings parameters required by the project to build, compile, and run correctly in different environments.';
  }

  // Inject specific descriptions based on file themes
  let functionalExplanation = '';
  if (baseName.includes('auth')) {
    functionalExplanation = 'Specifically, this file is responsible for the authentication system. It writes code to register new users, verify their credentials, and maintain secure logged-in sessions using JWT tokens.';
  } else if (baseName.includes('admin')) {
    functionalExplanation = 'Specifically, this file implements features for the admin authority panel. It allows municipal officers to fetch reports, view analytical summaries, and coordinate resolution tasks.';
  } else if (baseName.includes('report')) {
    functionalExplanation = 'Specifically, this file manages the user reports. It handles report submissions, image uploads, GPS coordinates tagging (latitude/longitude), and status progress timeline updates.';
  } else if (baseName.includes('gemini') || baseName.includes('ai')) {
    functionalExplanation = 'Specifically, this file connects our app to the Google Gemini AI. We write detailed prompts instructing the AI how to check if photos are valid (detecting fake images/selfies) or verifying if resolution photos match the original incident landmarks to prevent cheating.';
  } else if (baseName.includes('camera')) {
    functionalExplanation = 'Specifically, this file handles the camera module using Expo Camera. It lets users take live photos of incidents, toggles the phone flash hardware, and ensures they capture real-time evidence instead of uploading old gallery images.';
  } else if (baseName.includes('notification')) {
    functionalExplanation = 'Specifically, this file implements push notifications using Expo Notifications. It registers the device token with the server and triggers real-time popup alerts whenever a report status changes.';
  } else if (baseName.includes('location')) {
    functionalExplanation = 'Specifically, this file manages GPS location services. It requests device permissions, reads the physical sensor coordinates, and tags them to ensure accurate mapping.';
  } else {
    functionalExplanation = `Specifically, this file contains helper methods and configurations that support the core functionalities of the ${filename} layer.`;
  }

  // Generate File Tags dynamically
  let tags = [];
  if (normalizedPath.includes('backend')) { tags.push('Backend', 'Node.js', 'Server-Side'); }
  if (normalizedPath.includes('app/src')) { tags.push('Frontend', 'React Native', 'Mobile App'); }
  
  if (normalizedPath.includes('models')) tags.push('Database', 'Mongoose Schema');
  if (normalizedPath.includes('controllers')) tags.push('Controller', 'Business Logic');
  if (normalizedPath.includes('routes')) tags.push('API Route', 'Endpoints');
  if (normalizedPath.includes('services')) tags.push('Service', 'Integration');
  if (normalizedPath.includes('screens')) tags.push('User Interface', 'Screen');
  if (normalizedPath.includes('components')) tags.push('UI Component', 'Layout');
  if (normalizedPath.includes('context')) tags.push('State Management', 'Zustand');
  
  if (baseName.includes('auth')) tags.push('Authentication', 'Security', 'Login');
  if (baseName.includes('admin')) tags.push('Admin Panel', 'Management');
  if (baseName.includes('report')) tags.push('Issue Reporting', 'Data Flow');
  if (baseName.includes('location')) tags.push('GPS', 'Geolocation');
  if (baseName.includes('camera')) tags.push('Hardware', 'Camera');
  if (baseName.includes('gemini') || baseName.includes('ai')) tags.push('AI Model', 'Gemini API');
  if (baseName.includes('notification')) tags.push('Push Notifications', 'Alerts');
  
  // ensure unique tags
  tags = [...new Set(tags)];
  const tagString = tags.map(t => `\`[${t}]\``).join(' ');

  return `**File Tags:**\n${tagString}\n\n**Architecture Role:**\n> ${role}\n\n**Detailed Functionality:**\n> ${details}\n\n**Core Logic:**\n> ${functionalExplanation}`;
}

const ignoreList = ['node_modules', '.git', '.expo', 'dist', 'build'];

function traverseDirectory(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (ignoreList.includes(file)) continue;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      traverseDirectory(fullPath, fileList);
    } else {
      const ext = path.extname(fullPath);
      if (ext === '.ts' || ext === '.tsx' || ext === '.js') {
        fileList.push(fullPath);
      }
    }
  }
  return fileList;
}

function generateCodebook() {
  console.log('Gathering files...');
  const files = [];
  traverseDirectory(backendSrc, files);
  traverseDirectory(appSrc, files);

  console.log(`Found ${files.length} code files. Compiling Codebook...`);
  
  let markdown = '# CivicSafe - Complete Source Code & Explanations Book\n';
  markdown += 'This document automatically compiles all functional source code files from both the backend server and React Native mobile application, along with structural explanations.\n\n---\n\n';

  for (const file of files) {
    const relativePath = path.relative(rootDir, file);
    const content = fs.readFileSync(file, 'utf8');
    const explanation = getFileExplanation(relativePath);
    const lang = path.extname(file) === '.tsx' ? 'tsx' : 'typescript';

    markdown += `## File: ${relativePath}\n\n`;
    markdown += `### Architectural Role:\n${explanation}\n\n`;
    markdown += `### Source Code:\n\`\`\`${lang}\n${content}\n\`\`\`\n\n---\n\n`;
  }

  fs.writeFileSync(outputFile, markdown, 'utf8');
  console.log(`Success! Complete codebook written to: ${outputFile}`);
}

generateCodebook();
