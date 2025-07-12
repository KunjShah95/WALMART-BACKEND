import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

class GeminiService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is required');
    }
    
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
  }

  async generateProductDesigns(userPrompt, preferences = {}) {
    try {
      const prompt = this.buildDesignPrompt(userPrompt, preferences);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse the JSON response from Gemini
      const parsedResponse = this.parseDesignResponse(text);
      return parsedResponse;

    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error(`Design generation failed: ${error.message}`);
    }
  }

  buildDesignPrompt(userPrompt, preferences) {
    const sustainabilityFocus = `
Focus on sustainable design principles:
- Use eco-friendly materials (organic cotton, bamboo, recycled materials)
- Consider minimal waste production methods
- Suggest natural dyes and eco-friendly printing techniques
- Include local manufacturing considerations
`;

    const responseFormat = `
Return your response as a valid JSON object with this exact structure:
{
  "designs": [
    {
      "id": "design_1",
      "name": "Design Name",
      "description": "Detailed description of the design",
      "category": "clothing/accessories/home",
      "materials": [
        {
          "name": "Material Name",
          "type": "organic/recycled/sustainable",
          "description": "Material description",
          "sustainability_score": 8.5
        }
      ],
      "manufacturing": {
        "method": "Manufacturing method",
        "local_options": ["Location 1", "Location 2"],
        "estimated_time": "2-3 weeks"
      },
      "sustainability_highlights": ["Eco-friendly feature 1", "Eco-friendly feature 2"],
      "estimated_price": "$XX-XX"
    }
  ],
  "sustainability_tips": ["Tip 1", "Tip 2", "Tip 3"]
}

Generate 2-3 unique design variations.
`;

    return `
${sustainabilityFocus}

User Request: "${userPrompt}"

User Preferences: ${JSON.stringify(preferences)}

${responseFormat}
`;
  }

  parseDesignResponse(text) {
    try {
      // Clean the response text to extract JSON
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}') + 1;
      
      if (jsonStart === -1 || jsonEnd === 0) {
        throw new Error('No JSON found in response');
      }

      const jsonText = text.substring(jsonStart, jsonEnd);
      const parsed = JSON.parse(jsonText);

      // Validate the response structure
      if (!parsed.designs || !Array.isArray(parsed.designs)) {
        throw new Error('Invalid response structure');
      }

      return {
        success: true,
        data: parsed,
        generated_at: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      
      // Return fallback response
      return {
        success: false,
        error: 'Failed to parse design response',
        fallback_data: this.getFallbackDesigns(userPrompt)
      };
    }
  }

  getFallbackDesigns(userPrompt) {
    return {
      designs: [
        {
          id: "fallback_design_1",
          name: "Sustainable Cotton T-Shirt",
          description: "A minimalist design using organic cotton with eco-friendly printing",
          category: "clothing",
          materials: [
            {
              name: "Organic Cotton",
              type: "organic",
              description: "GOTS certified organic cotton",
              sustainability_score: 9.0
            }
          ],
          manufacturing: {
            method: "Local textile production",
            local_options: ["Local Workshop A", "Local Workshop B"],
            estimated_time: "2-3 weeks"
          },
          sustainability_highlights: ["100% organic cotton", "Natural dyes", "Local production"],
          estimated_price: "$25-35"
        }
      ],
      sustainability_tips: [
        "Choose organic materials when possible",
        "Support local manufacturing",
        "Consider the full lifecycle of the product"
      ]
    };
  }
}

export default new GeminiService();