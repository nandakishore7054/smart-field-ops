const BaseProvider = require('./base.provider');
const Groq = require('groq-sdk');

class GroqProvider extends BaseProvider {
  async generateSummary(systemPrompt, userPrompt) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('GROQ_API_KEY is not configured');
    }

    const groq = new Groq({ apiKey: apiKey });

    try {
      const response = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.2,
        max_tokens: 1024,
        top_p: 0.95
      });
      
      const textOutput = response.choices?.[0]?.message?.content || '';
      return this.parseJsonResponse(textOutput);
    } catch (error) {
      console.error('[GroqProvider] SDK Error:', error);
      throw error;
    }
  }
}

module.exports = GroqProvider;
