const { Fee } = require('../models');
const { Op } = require('sequelize');

/**
 * Middleware to check if a student has paid their fees.
 * Restricts access to course content if fee is not paid.
 */
const checkPaymentStatus = async (req, res, next) => {
  try {
    // Only apply to students
    if (req.user.role !== 'student') {
      return next();
    }

    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    
    // Check for any unpaid fee for current or previous months
    const unpaidFee = await Fee.findOne({
      where: {
        student_id: req.user.id,
        status: { [Op.in]: ['pending', 'overdue'] },
        month: { [Op.lte]: currentMonth }
      }
    });

    if (unpaidFee) {
      return res.status(403).json({
        error: 'Access Restricted 🔒',
        message: 'Please clear your monthly fee (PKR 1000) to access course materials and live classes.',
        fee_details: {
          month: unpaidFee.month,
          amount: unpaidFee.amount,
          status: unpaidFee.status
        },
        restricted: true
      });
    }

    next();
  } catch (err) {
    console.error('Payment check middleware error:', err);
    res.status(500).json({ error: 'Internal server error during payment verification.' });
  }
};

module.exports = { checkPaymentStatus };
