const BaseProvider = require('./base.provider');
const { environment } = require('../../../config/environment');

class GeminiProvider extends BaseProvider {
  async generateSummary(systemPrompt, userPrompt) {
    if (!environment.geminiApiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${environment.geminiApiKey}`;

    const payload = {
      system_instruction: {
        parts: [{ text: systemPrompt }]
      },
      contents: [{
        parts: [{ text: userPrompt }]
      }],
      generationConfig: {
        temperature: 0.2,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[GeminiProvider] API Error:', errorText);
      throw new Error(`Gemini API returned status ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('Gemini API returned no candidates');
    }

    const textOutput = data.candidates[0].content?.parts?.[0]?.text || '';
    
    return this.parseJsonResponse(textOutput);
  }
}

module.exports = GeminiProvider;
