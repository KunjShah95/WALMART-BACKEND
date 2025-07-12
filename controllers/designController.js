import geminiService from '../services/gemini.js';
import { DatabaseService } from '../services/supabase.js';
import { validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';

export const generateDesigns = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { prompt, preferences, category } = req.body;
    const userId = req.user?.id;

    // Generate designs using Gemini AI
    const designResponse = await geminiService.generateProductDesigns(prompt, {
      ...preferences,
      category: category || 'clothing'
    });

    if (!designResponse.success) {
      return res.status(500).json({
        error: 'Design generation failed',
        message: designResponse.error,
        fallback_data: designResponse.fallback_data
      });
    }

    // Save design session to database if user is authenticated
    let designSession = null;
    if (userId) {
      try {
        designSession = await DatabaseService.saveDesign({
          id: uuidv4(),
          user_id: userId,
          prompt: prompt,
          preferences: preferences || {},
          generated_designs: designResponse.data.designs,
          status: 'generated',
          created_at: new Date().toISOString()
        });
      } catch (dbError) {
        console.error('Failed to save design session:', dbError);
        // Continue without saving - don't fail the request
      }
    }

    res.status(200).json({
      message: 'Designs generated successfully',
      designs: designResponse.data.designs,
      sustainability_tips: designResponse.data.sustainability_tips,
      session_id: designSession?.id || null,
      generated_at: designResponse.generated_at,
      meta: {
        prompt: prompt,
        category: category || 'clothing',
        total_designs: designResponse.data.designs.length
      }
    });

  } catch (error) {
    console.error('Design generation error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to generate product designs',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getDesignHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const { data, error, count } = await supabase
      .from('designs')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) {
      throw error;
    }

    res.status(200).json({
      designs: data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error('Get design history error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch design history'
    });
  }
};

export const getDesignById = async (req, res) => {
  try {
    const { designId } = req.params;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('designs')
      .select('*')
      .eq('id', designId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          error: 'Design not found',
          message: 'The requested design does not exist or you do not have access to it'
        });
      }
      throw error;
    }

    res.status(200).json({
      design: data
    });

  } catch (error) {
    console.error('Get design by ID error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch design'
    });
  }
};