import { DatabaseService } from '../services/supabase.js';
import { validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';

export const submitOrder = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { 
      design_id, 
      material_score_id, 
      selected_materials, 
      customizations, 
      quantity, 
      shipping_address,
      manufacturing_preferences,
      estimated_price
    } = req.body;

    const userId = req.user.id;

    // Create order record
    const orderData = {
      id: uuidv4(),
      user_id: userId,
      design_id: design_id,
      material_score_id: material_score_id,
      selected_materials: selected_materials,
      customizations: customizations || {},
      quantity: quantity || 1,
      shipping_address: shipping_address,
      manufacturing_preferences: manufacturing_preferences || {},
      estimated_price: estimated_price,
      status: 'pending',
      order_number: generateOrderNumber(),
      created_at: new Date().toISOString()
    };

    const savedOrder = await DatabaseService.createOrder(orderData);

    res.status(201).json({
      message: 'Order submitted successfully',
      order: {
        id: savedOrder.id,
        order_number: savedOrder.order_number,
        status: savedOrder.status,
        estimated_price: savedOrder.estimated_price,
        quantity: savedOrder.quantity,
        created_at: savedOrder.created_at
      },
      next_steps: [
        'Design review and optimization',
        'Material sourcing and verification', 
        'Manufacturing partner assignment',
        'Production scheduling',
        'Quality assurance and shipping'
      ],
      estimated_delivery: calculateEstimatedDelivery(manufacturing_preferences)
    });

  } catch (error) {
    console.error('Order submission error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to submit order',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getOrderHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    let query = supabase
      .from('orders')
      .select(`
        *,
        designs(*),
        material_scores(*)
      `, { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    res.status(200).json({
      orders: data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error('Get order history error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch order history'
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        designs(*),
        material_scores(*)
      `)
      .eq('id', orderId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          error: 'Order not found',
          message: 'The requested order does not exist or you do not have access to it'
        });
      }
      throw error;
    }

    res.status(200).json({
      order: data
    });

  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch order'
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, notes } = req.body;
    const userId = req.user.id;

    // In a real implementation, this would be restricted to admin users
    // For now, we'll allow users to cancel their own orders
    const allowedStatuses = ['cancelled'];
    
    if (!allowedStatuses.includes(status)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You are not authorized to update to this status'
      });
    }

    const { data, error } = await supabase
      .from('orders')
      .update({ 
        status: status,
        notes: notes || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          error: 'Order not found',
          message: 'The requested order does not exist or you do not have access to it'
        });
      }
      throw error;
    }

    res.status(200).json({
      message: 'Order status updated successfully',
      order: data
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update order status'
    });
  }
};

// Helper functions
function generateOrderNumber() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `SPO-${timestamp}-${random}`.toUpperCase();
}

function calculateEstimatedDelivery(manufacturingPreferences) {
  const baseDeliveryDays = 14; // 2 weeks base
  const localMultiplier = manufacturingPreferences?.prefer_local ? 0.7 : 1;
  const rushMultiplier = manufacturingPreferences?.rush_order ? 0.5 : 1;
  
  const estimatedDays = Math.ceil(baseDeliveryDays * localMultiplier * rushMultiplier);
  
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + estimatedDays);
  
  return {
    estimated_days: estimatedDays,
    estimated_date: deliveryDate.toISOString().split('T')[0],
    factors: {
      base_days: baseDeliveryDays,
      local_manufacturing: manufacturingPreferences?.prefer_local || false,
      rush_order: manufacturingPreferences?.rush_order || false
    }
  };
}