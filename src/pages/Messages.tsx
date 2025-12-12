import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, User } from 'lucide-react';
import { useStudent } from '@/context/StudentContext';
import { supabase } from '@/lib/supabaseClient';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface Message {
  id: string;
  student_id: string;
  faculty_id: string;
  message: string;
  sender_type: 'student' | 'faculty';
  is_read: boolean;
  created_at: string;
  faculty?: {
    full_name: string;
    email: string;
  };
}

interface Conversation {
  faculty_id: string;
  faculty_name: string;
  faculty_email: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

const Messages: React.FC = () => {
  const { student, isLoading: studentLoading } = useStudent();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (student?.id) {
      loadConversations();
    }
  }, [student?.id]);

  useEffect(() => {
    if (selectedFacultyId && student?.id) {
      loadMessages(selectedFacultyId);
    }
  }, [selectedFacultyId, student?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async () => {
    if (!student?.id) return;

    try {
      console.log('Loading conversations for student:', student.id);
      
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          faculty_id,
          message,
          created_at,
          sender_type,
          is_read,
          faculty:faculty_id (
            full_name,
            email
          )
        `)
        .eq('student_id', student.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Load conversations error:', error);
        throw error;
      }

      console.log('Conversations data:', data);

      // Group by faculty
      const conversationMap = new Map<string, Conversation>();
      data?.forEach((msg: any) => {
        const facultyId = msg.faculty_id;
        if (!conversationMap.has(facultyId)) {
          conversationMap.set(facultyId, {
            faculty_id: facultyId,
            faculty_name: msg.faculty?.full_name || 'Faculty',
            faculty_email: msg.faculty?.email || '',
            last_message: msg.message,
            last_message_time: msg.created_at,
            unread_count: msg.sender_type === 'faculty' && !msg.is_read ? 1 : 0,
          });
        } else {
          const conv = conversationMap.get(facultyId)!;
          if (msg.sender_type === 'faculty' && !msg.is_read) {
            conv.unread_count++;
          }
        }
      });

      setConversations(Array.from(conversationMap.values()));
    } catch (error: any) {
      console.error('Error loading conversations:', error);
      toast.error(`Failed to load conversations: ${error.message}`);
    }
  };

  const loadMessages = async (facultyId: string) => {
    if (!student?.id) return;

    setIsLoading(true);
    try {
      console.log('Loading messages for student:', student.id, 'faculty:', facultyId);
      
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          student_id,
          faculty_id,
          message,
          sender_type,
          is_read,
          created_at,
          faculty:faculty_id (
            full_name,
            email
          )
        `)
        .eq('student_id', student.id)
        .eq('faculty_id', facultyId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Load messages error:', error);
        throw error;
      }

      console.log('Messages data:', data);

      // Map data to fix faculty structure
      const mappedMessages = (data || []).map((msg: any) => ({
        ...msg,
        faculty: Array.isArray(msg.faculty) ? msg.faculty[0] : msg.faculty,
      }));
      setMessages(mappedMessages as unknown as Message[]);

      // Mark unread messages as read
      const unreadIds = data?.filter(m => m.sender_type === 'faculty' && !m.is_read).map(m => m.id) || [];
      if (unreadIds.length > 0) {
        await supabase
          .from('messages')
          .update({ is_read: true })
          .in('id', unreadIds);
        
        loadConversations(); // Refresh unread counts
      }
    } catch (error: any) {
      console.error('Error loading messages:', error);
      toast.error(`Failed to load messages: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedFacultyId || !student?.id) return;

    setIsSending(true);
    try {
      console.log('Sending message:', {
        student_id: student.id,
        faculty_id: selectedFacultyId,
        message: newMessage.trim(),
        sender_type: 'student',
      });

      const { data, error } = await supabase
        .from('messages')
        .insert({
          student_id: student.id,
          faculty_id: selectedFacultyId,
          message: newMessage.trim(),
          sender_type: 'student',
          is_read: false,
        });

      if (error) {
        console.error('Insert error:', error);
        throw error;
      }
      
      console.log('Message sent successfully:', data);
      setNewMessage('');
      await loadMessages(selectedFacultyId);
      await loadConversations();
      toast.success('Message sent');
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error(`Failed to send message: ${error.message}`);
    } finally {
      setIsSending(false);
    }
  };

  if (studentLoading || !student) {
    return <LoadingSkeleton variant="card" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center">
          <MessageSquare className="w-7 h-7 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Messages</h1>
          <p className="text-muted-foreground">Chat with your faculty</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Conversations List */}
        <div className="bg-card rounded-2xl p-4 card-shadow md:col-span-1">
          <h2 className="text-lg font-semibold text-foreground mb-4">Conversations</h2>
          <div className="space-y-2">
            {conversations.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed border-border bg-secondary/20 p-6 text-center">
                <MessageSquare className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground font-medium">No conversations yet</p>
                <p className="text-xs text-muted-foreground mt-1">Reach out to your faculty to start chatting</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.faculty_id}
                  onClick={() => setSelectedFacultyId(conv.faculty_id)}
                  className={`w-full text-left p-3 rounded-lg transition-all duration-300 ${
                    selectedFacultyId === conv.faculty_id
                      ? 'bg-primary/10 border-l-4 border-primary shadow-sm'
                      : 'hover:bg-accent/5 border-l-4 border-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{conv.faculty_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{conv.last_message}</p>
                    </div>
                    {conv.unread_count > 0 && (
                      <span className="ml-2 px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full animate-pulse">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(conv.last_message_time).toLocaleDateString()}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="bg-card rounded-2xl p-4 card-shadow md:col-span-2 flex flex-col h-[600px]">
          {!selectedFacultyId ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="p-4 rounded-2xl bg-primary/10 border-2 border-primary/20 w-fit mx-auto mb-4">
                  <MessageSquare className="w-12 h-12 text-primary/60" />
                </div>
                <p className="text-muted-foreground font-medium">Select a conversation to start chatting</p>
                <p className="text-xs text-muted-foreground mt-1">Choose a faculty member from the list</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="border-b border-border pb-3 mb-4">
                <h3 className="font-semibold text-foreground">
                  {conversations.find(c => c.faculty_id === selectedFacultyId)?.faculty_name || 'Faculty'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {conversations.find(c => c.faculty_id === selectedFacultyId)?.faculty_email}
                </p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {isLoading ? (
                  <LoadingSkeleton variant="card" />
                ) : messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <MessageSquare className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No messages yet</p>
                      <p className="text-xs text-muted-foreground mt-1">Start the conversation!</p>
                    </div>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender_type === 'student' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          msg.sender_type === 'student'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-accent/10 text-foreground'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                        <p className={`text-xs mt-1 ${
                          msg.sender_type === 'student' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        }`}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="flex gap-2">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="resize-none"
                  rows={2}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || isSending}
                  size="icon"
                  className="h-auto"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
