const Chat = require('../models/chat.model');
const User = require('../models/user.model');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join user to their personal room
    socket.on('user_connected', (userId) => {
      socket.join(`user_${userId}`);
      console.log(`User ${userId} joined room user_${userId}`);
    });

    // Join chat room
    socket.on('join_chat', (chatId) => {
      socket.join(`chat_${chatId}`);
      console.log(`User joined chat: ${chatId}`);
    });

    // Leave chat room
    socket.on('leave_chat', (chatId) => {
      socket.leave(`chat_${chatId}`);
    });

    // Send message
    socket.on('send_message', async (data) => {
      try {
        const { chatId, message, senderId, messageType, fileUrl, fileName } = data;

        const chat = await Chat.findById(chatId);
        if (!chat) {
          socket.emit('error', { message: 'Chat not found' });
          return;
        }

        // Add message to chat
        const newMessage = {
          sender: senderId,
          message,
          messageType: messageType || 'text',
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

        // Emit to all participants in the chat
        chat.participants.forEach(participant => {
          io.to(`user_${participant._id}`).emit('new_message', {
            chatId,
            message: savedMessage
          });
        });

        // Emit to everyone in the chat room
        io.to(`chat_${chatId}`).emit('message_sent', savedMessage);

      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Mark messages as read
    socket.on('mark_messages_read', async (data) => {
      try {
        const { chatId, userId } = data;

        const chat = await Chat.findById(chatId);
        if (!chat) return;

        let updated = false;
        chat.messages.forEach(message => {
          if (!message.isRead && message.sender.toString() !== userId) {
            message.isRead = true;
            message.readBy.push({
              user: userId,
              readAt: new Date()
            });
            updated = true;
          }
        });

        if (updated) {
          await chat.save();
          
          // Notify other participants
          chat.participants.forEach(participant => {
            if (participant._id.toString() !== userId) {
              io.to(`user_${participant._id}`).emit('messages_read', {
                chatId,
                userId
              });
            }
          });
        }

      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    // Order status updates
    socket.on('order_status_update', async (data) => {
      try {
        const { orderId, status, updatedBy } = data;

        // Emit to all interested parties (admin, manager, retailer)
        io.emit('order_updated', {
          orderId,
          status,
          updatedBy,
          timestamp: new Date()
        });

        // Notify specific retailer if needed
        // This would require fetching the order to get retailer ID

      } catch (error) {
        console.error('Error updating order status:', error);
      }
    });

    // Stock level alerts
    socket.on('stock_alert', (data) => {
      const { productId, productName, currentStock } = data;
      
      // Emit to admin and managers
      io.emit('low_stock_alert', {
        productId,
        productName,
        currentStock,
        timestamp: new Date()
      });
    });

    // User typing indicator
    socket.on('typing_start', (data) => {
      const { chatId, userId } = data;
      socket.to(`chat_${chatId}`).emit('user_typing', {
        userId,
        isTyping: true
      });
    });

    socket.on('typing_stop', (data) => {
      const { chatId, userId } = data;
      socket.to(`chat_${chatId}`).emit('user_typing', {
        userId,
        isTyping: false
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });

    // Error handling
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });
};