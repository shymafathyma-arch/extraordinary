const fs = require('fs');
const path = require('path');

const projectRoot = 'D:\\shaima project rent a car';
const outputFile = path.join(projectRoot, 'Complete_Project_Code.txt');

const filesToInclude = [
    'index.html',
    'package.json',
    'vite.config.js',
    'eslint.config.js',
    'vercel.json',
    'src/App.jsx',
    'src/App.css',
    'src/index.css',
    'src/main.jsx',
    'src/supabaseClient.js',
    'src/context/AuthContext.jsx',
    'src/context/DataContext.jsx',
    'src/context/ThemeContext.jsx',
    'src/components/ProtectedRoute.jsx',
    'src/components/Navbar.jsx',
    'src/components/Navbar.css',
    'src/components/Hero.jsx',
    'src/components/Hero.css',
    'src/components/CarGrid.jsx',
    'src/components/CarGrid.css',
    'src/components/BookingModal.jsx',
    'src/components/BookingModal.css',
    'src/components/ScrollAnimation.jsx',
    'src/components/ScrollAnimation.css',
    'src/components/AdminRoute.jsx',
    'src/components/Footer.jsx',
    'src/components/Footer.css',
    'src/components/AIConcierge.jsx',
    'src/components/AIConcierge.css',
    'src/components/ReviewModal.jsx',
    'src/components/ReviewModal.css',
    'src/pages/AuthPage.jsx',
    'src/pages/AuthPage.css',
    'src/pages/Dashboard.jsx',
    'src/pages/AdminPage.jsx',
    'src/pages/AdminPage.css',
    'src/pages/AdminLoginPage.jsx',
    'src/pages/ProfileDashboard.jsx',
    'src/pages/ProfileDashboard.css',
    'src/pages/ComparisonPage.jsx',
    'src/pages/ComparisonPage.css'
];

let finalContent = '================================================================================\n';
finalContent += 'SHAIMA RENT A CAR - COMPLETE PROJECT CODE\n';
finalContent += '================================================================================\n\n';

filesToInclude.forEach(file => {
    const filePath = path.join(projectRoot, file);
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        finalContent += `\n\n// FILE: ${file}\n`;
        finalContent += '--------------------------------------------------------------------------------\n';
        finalContent += content;
        finalContent += '\n--------------------------------------------------------------------------------\n';
    } else {
        console.warn(`File not found: ${filePath}`);
    }
});

fs.writeFileSync(outputFile, finalContent);
console.log(`Successfully created ${outputFile}`);
