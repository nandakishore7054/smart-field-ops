const pptxgen = require('pptxgenjs');
const fs = require('fs');
const path = require('path');

const pptx = new pptxgen();

pptx.layout = 'LAYOUT_16x9';

// Add Master Slide
pptx.defineSlideMaster({
  title: 'MASTER_SLIDE',
  background: { color: 'FFFFFF' },
  objects: [
    { rect: { x: 0, y: 0, w: '100%', h: 0.8, fill: { color: '2B3A42' } } },
    { text: { text: 'Smart Field Operations', options: { x: 0.5, y: 0.1, w: 5, h: 0.6, color: 'FFFFFF', fontSize: 24, bold: true } } }
  ]
});

// Helper function to add slides
function createSlide(title, bullets, notes) {
  let slide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
  slide.addText(title, { x: 0.5, y: 1.0, w: '90%', h: 0.5, fontSize: 32, bold: true, color: '2B3A42' });
  
  const formattedBullets = bullets.map(b => ({ text: b, options: { bullet: true, color: '333333', fontSize: 18, breakLine: true } }));
  slide.addText(formattedBullets, { x: 0.5, y: 1.8, w: '90%', h: 4.5, valign: 'top', margin: 10 });
  
  if (notes) {
    slide.addNotes(notes);
  }
}

// Slide 1
let slide1 = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
slide1.addText('Smart Field Operations', { x: 0.5, y: 2, w: '90%', h: 1, fontSize: 44, bold: true, color: '2B3A42', align: 'center' });
slide1.addText('A Real-Time Spatial Intelligence and Workforce Management Platform\n\nFinal Year B.Tech Project', { x: 0.5, y: 3.2, w: '90%', h: 1, fontSize: 24, color: '555555', align: 'center' });
slide1.addNotes('Good morning respected jury and peers. Our final year project is Smart Field Operations...');

// Slide 2
createSlide('Abstract', [
  'Problem: Field operations suffer from a lack of real-time visibility and manual attendance fraud.',
  'Solution: A unified platform bridging task execution with real-time GIS telemetry.',
  'Technologies: MERN stack, Socket.IO, Turf.js, Leaflet.',
  'Methodology: Automated Geofencing, WebSocket telemetry, and algorithmic MAX_SPEED_KMH validation.',
  'Results: Automated Attendance, verified Customer Visits, Live Tracking Dashboards.'
], 'Field-service industries rely heavily on distributed teams, yet struggle with unverified work... We implemented a GPS filtering algorithm to sanitize location noise.');

// Slide 3
createSlide('Introduction', [
  'Context: Distributed workforces are inherently difficult to manage and verify.',
  'The Intelligence Gap: Managers need to know where workers are, when they arrive, and if tasks are completed.',
  'The Shift to BYOD: Bring Your Own Device reduces costs but challenges browser tracking reliability.',
  'Our Approach: A monolithic web application verifying actions against real-time coordinates using Geofencing.'
], 'The core challenge of managing distributed teams is the intelligence gap...');

// Slide 4
createSlide('Literature Survey (1/2)', [
  '1. A Real-Time Vehicle Tracking System based on GPS (Phalke et al., 2017)',
  '   - Limitation: Expensive hardware dependency.',
  '   - Improvement: Uses existing mobile browser Geolocation APIs.',
  '2. Workforce Management System using Geofencing (Patil et al., 2019)',
  '   - Limitation: High susceptibility to GPS bouncing.',
  '   - Improvement: Server-side MAX_SPEED_KMH validation rejects impossible jumps.',
  '3. Real-time Web Applications using WebSockets (Pimentel et al., 2012)',
  '   - Limitation: Focuses on transport layer only.',
  '   - Improvement: Couples WebSockets with Turf.js spatial logic.'
], 'In our literature review, we found traditional tracking systems rely on dedicated hardware...');

// Slide 5
createSlide('Literature Survey (2/2)', [
  '4. Spatial Computing in Location-Based Services (Zheng et al., 2014)',
  '   - Limitation: Lacks integration with dynamic task verification.',
  '   - Improvement: Uses Turf.js to map coordinates against Geofences in real-time.',
  '5. Analysis of GPS Data for Human Mobility Patterns (Zheng, 2015)',
  '   - Limitation: Post-processing analysis, not real-time filtering.',
  '   - Improvement: Real-time filtering within the Node.js data pipeline.'
], 'Further research by Zheng outlines spatial algorithms... We innovated by integrating real-time filtering.');

// Slide 6
createSlide('Identified Research Gaps', [
  'Fragmented Systems: Task Management, Attendance, and GPS Tracking are typically separate.',
  'Manual Verification: Work relies on honor system submissions rather than spatial proximity.',
  'GPS Noise Vulnerability: Standard web telemetry frequently bounces, corrupting distance metrics.',
  'Timezone Fragmentation: UTC timestamps corrupt local business-day aggregations (e.g., IST boundaries).'
], 'Our literature survey revealed massive gaps... Systems are too fragmented.');

// Slide 7
createSlide('Problem Statement', [
  'To design and develop a robust, hardware-agnostic workforce management platform that securely integrates task execution with real-time spatial intelligence.',
  '',
  'The system must actively filter GPS inaccuracies, automate spatial verification (Geofencing), and provide highly accurate, timezone-safe business analytics.'
], 'Therefore, our problem statement is to build a robust platform...');

// Slide 8
createSlide('Project Objectives', [
  '1. Real-time worker monitoring via Leaflet maps.',
  '2. Attendance automation using shift-based logic.',
  '3. Live GPS tracking using Socket.IO telemetry.',
  '4. Customer visit verification via background geofencing.',
  '5. Analytics dashboard using Recharts.',
  '6. Worker availability and leave requests.',
  '7. Task management and proof-of-work submissions.',
  '8. Data integrity via GPS Bounce Protection and Timezone-safe aggregation.'
], 'We broke down our problem into ten core objectives...');

// Slide 9
createSlide('Proposed Methodology: Workflow', [
  '1. Authentication: Worker logs in via JWT.',
  '2. Attendance: Worker checks in for their Shift.',
  '3. Telemetry: Device begins streaming coordinates via Socket.IO.',
  '4. Spatial Processing: Node.js + Turf.js validates proximity to Geofences.',
  '5. Detection: Server auto-logs Customer Visits upon Geofence entry/exit.',
  '6. Data Pipeline: calculateTotalDistance filters anomalies (> 150 km/h).',
  '7. Analytics: Mongoose aggregates safe metrics for the React Dashboard.'
], 'The complete workflow operates seamlessly: A worker checks in, and the browser begins streaming telemetry...');

// Slide 10
createSlide('System Architecture', [
  '[ Client Tier ]                      [ Application Tier ]                   [ Data Tier ]',
  'React.js PWA       (HTTP/REST)       Node.js + Express.js                 MongoDB',
  'Leaflet Maps     <-------------->    Auth & Task Services   <---------->  User / Tasks',
  '                      (WSS)          ',
  'Socket.IO Client <-------------->    Socket.IO Server                     Location / Visits',
  '(GPS Emitter)                        Turf.js Geofence Engine <--------->  Geofences'
], 'Architecturally, we operate a classic three-tier system heavily enhanced by WebSockets...');

// Slide 11
createSlide('Technology Stack', [
  'Frontend:',
  '- Framework: React.js + Vite',
  '- Styling: Tailwind CSS',
  '- Maps: React-Leaflet',
  '- Analytics: Recharts',
  '',
  'Backend & Database:',
  '- Server: Node.js + Express.js',
  '- Real-Time: Socket.IO',
  '- Spatial Computing: Turf.js',
  '- Timezone Safety: date-fns-tz',
  '- Database: MongoDB (Mongoose)'
], 'We utilized the MERN stack. We specifically chose Tailwind for rapid UI development...');

// Slide 12
createSlide('Results: Implementation Status', [
  '✅ Fully Implemented:',
  '- Authentication & Security',
  '- Attendance & Shifts',
  '- Live GPS Tracking',
  '- Geofence Management',
  '- Auto Customer Visits',
  '- Dashboard KPIs & Charts',
  '- Task Management',
  '',
  '❌ Future Work:',
  '- CSV Export',
  '- AI Dispatch Algorithms',
  '- Payroll Integration'
], 'We successfully implemented all core operational features...');

// Slide 13
createSlide('Results: Technical Optimizations', [
  'GPS Bounce Protection:',
  '- Successfully implemented distance.util.js to protect analytics.',
  '- Explicitly rejects impossible travel segments via MAX_SPEED_KMH validation.',
  '',
  'Timezone Centralization:',
  '- Implemented date.util.js as a Single Source of Truth.',
  '- Resolves database inconsistencies using MongoDB range queries.',
  '',
  'Real-Time Simulation Tooling:',
  '- Built SocketTest.jsx for rigorous geographical stress-testing.'
], 'Beyond simply building features, we solved deep architectural bugs...');

// Slide 14
createSlide('Conclusion', [
  'The Smart Field Operations platform bridges the gap between task execution and real-time spatial intelligence.',
  'By utilizing modern web APIs and server-side spatial computing, we eliminated the need for proprietary tracking hardware.',
  'The implementation of robust data pipelines—GPS bounce protection and strict timezone aggregation—proves enterprise-grade reliability in a standard web browser.',
  'The platform provides a scalable foundation ready for future AI enhancements.'
], 'In conclusion, we proved that robust, real-time spatial intelligence doesn\'t require expensive hardware...');

// Save File
const outPath = path.join(__dirname, 'docs', 'Smart_Field_Ops_Presentation.pptx');

// Create docs dir if not exists
if (!fs.existsSync(path.join(__dirname, 'docs'))) {
  fs.mkdirSync(path.join(__dirname, 'docs'));
}

pptx.writeFile({ fileName: outPath }).then(() => {
  console.log(`Successfully generated presentation at ${outPath}`);
}).catch(err => {
  console.error(err);
});
