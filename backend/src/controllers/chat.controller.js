const Chat = require('../models/chat.model');

// @desc    Get or create chat
// @route   POST /api/v1/chat
// @access  Private
exports.getOrCreateChat = async (req, res) => {
  try {
    const { participantId } = req.body;

    if (!participantId) {
      return res.status(400).json({
        success: false,
        message: 'Participant ID is required'
      });
    }

    // Check if chat already exists
    let chat = await Chat.findOne({
      participants: { $all: [req.user.id, participantId] },
      isActive: true
    }).populate('participants', 'name email role company')
      .populate('messages.sender', 'name email');

    if (!chat) {
      // Create new chat
      chat = await Chat.create({
        participants: [req.user.id, participantId]
      });

      await chat.populate('participants', 'name email role company');
    }

    res.json({
      success: true,
      data: chat
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user's chats
// @route   GET /api/v1/chat
// @access  Private
exports.getUserChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user.id,
      isActive: true
    })
      .populate('participants', 'name email role company')
      .sort({ lastMessageAt: -1 });

    res.json({
      success: true,
      count: chats.length,
      data: chats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get chat messages
// @route   GET /api/v1/chat/:id/messages
// @access  Private
exports.getChatMessages = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id)
      .populate('participants', 'name email role company')
      .populate('messages.sender', 'name email');

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check if user is participant
    if (!chat.participants.some(p => p._id.toString() === req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this chat'
      });
    }

    res.json({
      success: true,
      data: chat.messages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Send message
// @route   POST /api/v1/chat/:id/messages
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { message, messageType = 'text', fileUrl, fileName } = req.body;

    if (!message && !fileUrl) {
      return res.status(400).json({
        success: false,
        message: 'Message content or file is required'
      });
    }

    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check if user is participant
    if (!chat.participants.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to send message in this chat'
      });
    }

    const newMessage = {
      sender: req.user.id,
      message: message || '',
      messageType,
      fileUrl,
      fileName,
      isRead: false,
      readBy: []
    };

    chat.messages.push(newMessage);
    chat.lastMessage = message || (fileName ? `Sent a file: ${fileName}` : 'Sent a message');
    chat.lastMessageAt = new Date();
    await chat.save();

    await chat.populate('participants', 'name email role company');
    await chat.populate('messages.sender', 'name email');

    const savedMessage = chat.messages[chat.messages.length - 1];

    res.json({
      success: true,
      message: 'Message sent successfully',
      data: savedMessage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Mark messages as read
// @route   PATCH /api/v1/chat/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Mark all unread messages as read by current user
    chat.messages.forEach(message => {
      if (!message.isRead && message.sender.toString() !== req.user.id) {
        message.isRead = true;
        message.readBy.push({
          user: req.user.id,
          readAt: new Date()
        });
      }
    });

    await chat.save();

    res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};