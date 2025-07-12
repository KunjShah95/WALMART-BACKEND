import mistralService from '../services/mistral.js';
import { DatabaseService } from '../services/supabase.js';
import { validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';

export const scoreMaterials = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { materials, product_type, design_id } = req.body;
    const userId = req.user?.id;

    // Generate sustainability score using Mistral AI
    const scoreResponse = await mistralService.generateSustainabilityScore(
      materials, 
      product_type || 'clothing'
    );

    if (!scoreResponse.success) {
      return res.status(500).json({
        error: 'Sustainability scoring failed',
        message: scoreResponse.error,
        fallback_data: scoreResponse.fallback_data
      });
    }

    // Save material score to database if user is authenticated
    let savedScore = null;
    if (userId) {
      try {
        savedScore = await DatabaseService.saveMaterialScore({
          id: uuidv4(),
          user_id: userId,
          design_id: design_id || null,
          materials: materials,
          product_type: product_type || 'clothing',
          sustainability_score: scoreResponse.data,
          overall_score: scoreResponse.data.overall_score,
          grade: scoreResponse.data.grade,
          created_at: new Date().toISOString()
        });
      } catch (dbError) {
        console.error('Failed to save material score:', dbError);
        // Continue without saving - don't fail the request
      }
    }

    res.status(200).json({
      message: 'Sustainability score generated successfully',
      score: scoreResponse.data,
      score_id: savedScore?.id || null,
      analyzed_at: scoreResponse.analyzed_at,
      meta: {
        materials_count: materials.length,
        product_type: product_type || 'clothing',
        design_id: design_id || null
      }
    });

  } catch (error) {
    console.error('Material scoring error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to generate sustainability score',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getMaterialScoreHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const { data, error, count } = await supabase
      .from('material_scores')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) {
      throw error;
    }

    res.status(200).json({
      scores: data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error('Get material score history error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch material score history'
    });
  }
};

export const compareMaterials = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { material_sets, product_type } = req.body;

    if (!Array.isArray(material_sets) || material_sets.length < 2) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'At least 2 material sets are required for comparison'
      });
    }

    // Generate scores for each material set
    const comparisonResults = await Promise.all(
      material_sets.map(async (materials, index) => {
        try {
          const scoreResponse = await mistralService.generateSustainabilityScore(
            materials, 
            product_type || 'clothing'
          );
          
          return {
            set_index: index,
            materials: materials,
            score: scoreResponse.success ? scoreResponse.data : scoreResponse.fallback_data,
            success: scoreResponse.success
          };
        } catch (error) {
          return {
            set_index: index,
            materials: materials,
            error: error.message,
            success: false
          };
        }
      })
    );

    // Find the best performing set
    const validResults = comparisonResults.filter(result => result.success);
    const bestSet = validResults.reduce((best, current) => 
      current.score.overall_score > best.score.overall_score ? current : best
    );

    res.status(200).json({
      message: 'Material comparison completed',
      comparison_results: comparisonResults,
      best_option: bestSet,
      summary: {
        total_sets: material_sets.length,
        successful_analyses: validResults.length,
        best_score: bestSet?.score?.overall_score || null
      },
      analyzed_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Material comparison error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to compare materials'
    });
  }
};