import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Send, Search, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { chatAPI, userAPI } from '../../api/auth';
import { useAuthStore } from '../../stores/authStore';
import { socketService } from '../../sockets/socket';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const Chat = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuthStore();
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: chats } = useQuery('chats', () => chatAPI.getChats());
  const { data: users } = useQuery(
    ['users', 'chat'],
    () => userAPI.getUsersByRole(user?.role === 'retailer' ? 'producer' : 'retailer')
  );

  const { data: messages, refetch: refetchMessages } = useQuery(
    ['chat-messages', selectedChat?.id],
    () => selectedChat ? chatAPI.getChatMessages(selectedChat.id) : null,
    { enabled: !!selectedChat }
  );

  const sendMessageMutation = useMutation(
    ({ chatId, message }) => chatAPI.sendMessage(chatId, { message }),
    {
      onSuccess: () => {
        setMessage('');
        refetchMessages();
      },
      onError: (error) => {
        toast.error('Failed to send message');
      }
    }
  );

  const createChatMutation = useMutation(
    (participantId) => chatAPI.getOrCreateChat(participantId),
    {
      onSuccess: (response) => {
        setSelectedChat(response.data);
        queryClient.invalidateQueries('chats');
      }
    }
  );

  useEffect(() => {
    if (!user) return;

    // Connect to socket
    socketService.connect(localStorage.getItem('token'));

    // Listen for new messages
    socketService.on('new_message', (data) => {
      if (selectedChat && data.chatId === selectedChat.id) {
        refetchMessages();
      }
      queryClient.invalidateQueries('chats');
    });

    return () => {
      socketService.disconnect();
    };
  }, [user, selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedChat) return;

    sendMessageMutation.mutate({
      chatId: selectedChat.id,
      message: message.trim()
    });

    // Emit socket event
    socketService.emit('send_message', {
      chatId: selectedChat.id,
      message: message.trim(),
      senderId: user.id
    });
  };

  const handleStartChat = (participant) => {
    createChatMutation.mutate(participant._id);
  };

  const filteredUsers = users?.data?.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getOtherParticipant = (chat) => {
    return chat.participants.find(p => p._id !== user.id);
  };

  return (
    <div className="h-full flex bg-white rounded-lg border border-gray-200">
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Chats List */}
        <div className="flex-1 overflow-y-auto">
          {chats?.data?.map((chat) => {
            const otherParticipant = getOtherParticipant(chat);
            return (
              <button
                key={chat._id}
                onClick={() => setSelectedChat(chat)}
                className={`w-full p-4 text-left border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  selectedChat?._id === chat._id ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                    <Users size={20} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {otherParticipant?.name}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {otherParticipant?.company}
                    </p>
                    <p className="text-xs text-gray-400 truncate mt-1">
                      {chat.lastMessage}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}

          {/* Available Users */}
          {searchTerm && (
            <div className="border-t border-gray-200">
              <div className="p-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Start New Chat
              </div>
              {filteredUsers?.map((userItem) => (
                <button
                  key={userItem._id}
                  onClick={() => handleStartChat(userItem)}
                  className="w-full p-3 text-left border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <Users size={16} className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {userItem.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {userItem.company}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                  <Users size={20} className="text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {getOtherParticipant(selectedChat)?.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {getOtherParticipant(selectedChat)?.company}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages?.data?.map((msg) => (
                <div
                  key={msg._id}
                  className={`flex ${msg.sender._id === user.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      msg.sender._id === user.id
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{msg.message}</p>
                    <p
                      className={`text-xs mt-1 ${
                        msg.sender._id === user.id ? 'text-primary-200' : 'text-gray-500'
                      }`}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <form onSubmit={handleSendMessage} className="flex space-x-4">
                <Input
                  type="text"
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={!message.trim()}>
                  <Send size={20} />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Users size={48} className="mx-auto text-gray-300 mb-4" />
              <p>Select a chat to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;