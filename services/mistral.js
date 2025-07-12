import MistralClient from '@mistralai/mistralai';
import dotenv from 'dotenv';

dotenv.config();

class MistralService {
  constructor() {
    if (!process.env.MISTRAL_API_KEY) {
      throw new Error('MISTRAL_API_KEY is required');
    }
    
    this.client = new MistralClient(process.env.MISTRAL_API_KEY);
  }

  async generateSustainabilityScore(materials, productType = 'clothing') {
    try {
      const prompt = this.buildSustainabilityPrompt(materials, productType);
      
      const chatResponse = await this.client.chat({
        model: 'mistral-large-latest',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        maxTokens: 1000
      });

      const responseText = chatResponse.choices[0].message.content;
      const parsedResponse = this.parseSustainabilityResponse(responseText);
      
      return parsedResponse;

    } catch (error) {
      console.error('Mistral API Error:', error);
      throw new Error(`Sustainability scoring failed: ${error.message}`);
    }
  }

  buildSustainabilityPrompt(materials, productType) {
    return `
As a sustainability expert, analyze the environmental impact of these materials for a ${productType} product:

Materials: ${JSON.stringify(materials)}

Provide a comprehensive sustainability scorecard in this exact JSON format:

{
  "overall_score": 8.5,
  "grade": "A-",
  "categories": {
    "carbon_footprint": {
      "score": 8.2,
      "rating": "Excellent",
      "details": "Low CO2 emissions due to organic production",
      "co2_kg": 2.3
    },
    "water_usage": {
      "score": 7.8,
      "rating": "Good",
      "details": "Moderate water usage for organic cotton processing",
      "water_liters": 1500
    },
    "ethical_production": {
      "score": 9.1,
      "rating": "Excellent",
      "details": "Fair trade certified, ethical labor practices",
      "certifications": ["Fair Trade", "GOTS"]
    },
    "biodegradability": {
      "score": 8.9,
      "rating": "Excellent",
      "details": "100% biodegradable materials",
      "decomposition_time": "6 months"
    },
    "renewable_resources": {
      "score": 8.7,
      "rating": "Excellent",
      "details": "Materials from renewable sources",
      "renewable_percentage": 95
    }
  },
  "improvements": [
    "Consider using recycled packaging",
    "Explore solar-powered manufacturing",
    "Implement circular design principles"
  ],
  "certifications": ["GOTS", "Fair Trade", "OEKO-TEX"],
  "lifecycle_assessment": {
    "raw_materials": 8.5,
    "manufacturing": 7.8,
    "transportation": 8.0,
    "use_phase": 9.2,
    "end_of_life": 8.8
  },
  "compared_to_conventional": {
    "carbon_reduction": "65%",
    "water_reduction": "45%",
    "waste_reduction": "70%"
  }
}

Provide detailed analysis based on actual sustainability data and best practices.
`;
  }

  parseSustainabilityResponse(text) {
    try {
      // Extract JSON from the response
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}') + 1;
      
      if (jsonStart === -1 || jsonEnd === 0) {
        throw new Error('No JSON found in response');
      }

      const jsonText = text.substring(jsonStart, jsonEnd);
      const parsed = JSON.parse(jsonText);

      // Validate the response structure
      if (!parsed.overall_score || !parsed.categories) {
        throw new Error('Invalid sustainability response structure');
      }

      return {
        success: true,
        data: parsed,
        analyzed_at: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error parsing Mistral response:', error);
      
      // Return fallback sustainability score
      return {
        success: false,
        error: 'Failed to parse sustainability response',
        fallback_data: this.getFallbackSustainabilityScore()
      };
    }
  }

  getFallbackSustainabilityScore() {
    return {
      overall_score: 7.5,
      grade: "B+",
      categories: {
        carbon_footprint: {
          score: 7.5,
          rating: "Good",
          details: "Moderate carbon footprint",
          co2_kg: 3.2
        },
        water_usage: {
          score: 7.0,
          rating: "Good",
          details: "Standard water usage for production",
          water_liters: 2000
        },
        ethical_production: {
          score: 8.0,
          rating: "Very Good",
          details: "Ethically sourced materials",
          certifications: ["Basic Certification"]
        },
        biodegradability: {
          score: 7.8,
          rating: "Good",
          details: "Mostly biodegradable components",
          decomposition_time: "12 months"
        },
        renewable_resources: {
          score: 7.2,
          rating: "Good",
          details: "Partially renewable materials",
          renewable_percentage: 75
        }
      },
      improvements: [
        "Use more organic materials",
        "Reduce packaging waste",
        "Improve supply chain transparency"
      ],
      certifications: ["Standard Certification"],
      lifecycle_assessment: {
        raw_materials: 7.5,
        manufacturing: 7.0,
        transportation: 7.8,
        use_phase: 8.0,
        end_of_life: 7.5
      },
      compared_to_conventional: {
        carbon_reduction: "35%",
        water_reduction: "25%",
        waste_reduction: "40%"
      }
    };
  }
}

export default new MistralService();