/**
 * Simple OpenAI API client for demos and examples
 * 
 * A lightweight JavaScript implementation of the OpenAIClient
 * for use in demos and examples. For production use, prefer
 * the more feature-complete TypeScript implementation in
 * src/core/multiagent/OpenAIClient.ts
 */

const axios = require('axios');

/**
 * Simple client for OpenAI API interactions
 */
class OpenAIClient {
  /**
   * Create a new OpenAIClient
   * @param {string} apiKey - OpenAI API key
   * @param {string} baseUrl - API base URL
   * @param {string} model - Default model to use
   */
  constructor(apiKey, baseUrl = 'https://api.openai.com/v1', model = 'gpt-3.5-turbo') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.defaultModel = model;
    
    if (!this.apiKey) {
      throw new Error('OpenAI API key not provided. Set OPENAI_API_KEY in your .env file');
    }
  }
  
  /**
   * Send a prompt to the OpenAI API
   * @param {string} prompt - The prompt to send
   * @param {Object} options - Request options
   * @returns {Promise<Object>} - The API response
   */
  async sendPrompt(prompt, options = {}) {
    const model = options.model || this.defaultModel;
    
    try {
      // Create a simple request with only required parameters
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model,
          messages: [
            {
              role: 'system',
              content: options.systemPrompt || 'You are a helpful assistant.'
            },
            {
              role: 'user',
              content: prompt
            }
          ]
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return {
        id: response.data.id,
        model: response.data.model,
        content: response.data.choices[0].message.content,
        usage: response.data.usage
      };
    } catch (error) {
      console.error('Error calling OpenAI API:', error.message);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Request:', error.config.data);
      }
      throw new Error(`OpenAI API error: ${error.message}`);
    }
  }
  
  /**
   * Get the default model being used
   * @returns {string} - The default model
   */
  getDefaultModel() {
    return this.defaultModel;
  }
  
  /**
   * Set a new default model
   * @param {string} model - New default model
   */
  setDefaultModel(model) {
    this.defaultModel = model;
  }
}

module.exports = OpenAIClient; 