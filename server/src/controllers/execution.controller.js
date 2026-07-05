const Execution = require('../models/Execution');

// Get execution history for a room
exports.getExecutionHistory = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const executions = await Execution.find({ roomId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, executions });
  } catch (error) {
    next(error);
  }
};
