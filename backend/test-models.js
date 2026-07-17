const { GoogleGenAI } = require('@google/genai');
require('dotenv').config({ path: 'c:/Users/chinn/OneDrive/Documents/smart-field-ops/backend/.env' });

const modelsToTest = [
  'gemini-2.5-pro',
  'gemini-pro-latest',
  'gemini-2.0-flash',
  'gemini-3.5-flash',
  'gemini-3.1-pro-preview'
];

async function runTests() {
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({ apiKey });

  for (const model of modelsToTest) {
    console.log('\n--- Testing Model: ' + model + ' ---');
    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: 'Reply with only the word OK.'
      });
      console.log('Status: 200 (Success)');
      console.log('Result: SUCCESS');
      console.log('Response Text:', response.text);
    } catch (error) {
      console.log('Status:', error.status || 'Unknown API Error');
      console.log('Result: FAILURE');
      console.log('Error Message:', error.message);
      console.log('Error Object:', JSON.stringify(error, null, 2));
    }
  }
}
runTests();
