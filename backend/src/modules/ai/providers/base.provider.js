class BaseProvider {
  /**
   * Generates a summary using the specific AI provider.
   * @param {string} systemPrompt 
   * @param {string} userPrompt 
   * @returns {Promise<Object>} Parsed JSON response from AI
   */
  async generateSummary(systemPrompt, userPrompt) {
    throw new Error('generateSummary must be implemented by subclass');
  }

  /**
   * Safe JSON parser that handles potential markdown wrapping
   */
  parseJsonResponse(text) {
    try {
      let cleanText = text.trim();
      // Remove markdown code block wrapping if present
      if (cleanText.startsWith('\`\`\`json')) {
        cleanText = cleanText.substring(7);
      } else if (cleanText.startsWith('\`\`\`')) {
        cleanText = cleanText.substring(3);
      }
      if (cleanText.endsWith('\`\`\`')) {
        cleanText = cleanText.substring(0, cleanText.length - 3);
      }
      return JSON.parse(cleanText);
    } catch (e) {
      console.error('[BaseProvider] Failed to parse JSON from AI response:', text);
      throw new Error('AI response was not valid JSON');
    }
  }
}

module.exports = BaseProvider;
