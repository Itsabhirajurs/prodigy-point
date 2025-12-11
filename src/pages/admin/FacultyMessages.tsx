import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageSquare, Send, User, Search } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface Message {
  id: string;
  student_id: string;
  faculty_id: string;
  message: string;
  sender_type: 'student' | 'faculty';
  is_read: boolean;
  created_at: string;
  student?: {
    full_name: string;
    student_id: string;
    email: string;
  };
}

interface Conversation {
  student_id: string;
  student_name: string;
  student_code: string;
  student_email: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

interface Student {
  id: string;
  student_id: string;
  full_name: string;
  email: string;
  department: string;
}

const FacultyMessages: React.FC = () => {
  const location = useLocation();
  const initialStudentId = (location.state as any)?.studentId;
  
  const [facultyId, setFacultyId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(initialStudentId || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    loadFacultyId();
  }, []);

  useEffect(() => {
    if (facultyId) {
      loadConversations();
      loadStudents();
    }
  }, [facultyId]);

  useEffect(() => {
    if (selectedStudentId && facultyId) {
      // If selectedStudentId looks like a student code (STU###), resolve it to UUID first
      if (selectedStudentId.startsWith('STU')) {
        resolveStudentIdAndLoadMessages(selectedStudentId);
      } else {
        loadMessages(selectedStudentId);
      }
    }
  }, [selectedStudentId, facultyId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadFacultyId = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('faculty')
          .select('id')
          .eq('email', user.email)
          .single();
        
        if (error) throw error;
        setFacultyId(data.id);
      }
    } catch (error) {
      console.error('Error loading faculty ID:', error);
    }
  };

  const loadStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('id, student_id, full_name, email, department')
        .order('full_name');

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const resolveStudentIdAndLoadMessages = async (studentCode: string) => {
    try {
      console.log('Resolving student code to UUID:', studentCode);
      
      // Query students table to find the UUID for this student code
      const { data, error } = await supabase
        .from('students')
        .select('id')
        .eq('student_id', studentCode)
        .single();

      if (error) {
        console.error('Student code not found:', error);
        throw error;
      }

      if (data?.id) {
        console.log('Resolved student code', studentCode, 'to UUID:', data.id);
        setSelectedStudentId(data.id);
        // loadMessages will be called by the useEffect
      }
    } catch (error) {
      console.error('Error resolving student ID:', error);
      toast.error('Failed to load student conversation');
    }
  };

  const loadConversations = async () => {
    if (!facultyId) return;

    try {
      console.log('Loading conversations for faculty:', facultyId);
      
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          student_id,
          message,
          created_at,
          sender_type,
          is_read,
          student:student_id (
            id,
            student_id,
            full_name,
            email
          )
        `)
        .eq('faculty_id', facultyId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Load conversations error:', error);
        throw error;
      }

      console.log('Conversations data:', data);

      // Group by student
      const conversationMap = new Map<string, Conversation>();
      data?.forEach((msg: any) => {
        const studentId = msg.student_id;
        if (!conversationMap.has(studentId)) {
          conversationMap.set(studentId, {
            student_id: studentId,
            student_name: msg.student?.full_name || 'Student',
            student_code: msg.student?.student_id || '',
            student_email: msg.student?.email || '',
            last_message: msg.message,
            last_message_time: msg.created_at,
            unread_count: msg.sender_type === 'student' && !msg.is_read ? 1 : 0,
          });
        } else {
          const conv = conversationMap.get(studentId)!;
          if (msg.sender_type === 'student' && !msg.is_read) {
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

  const loadMessages = async (studentId: string) => {
    if (!facultyId) return;

    setIsLoading(true);
    try {
      console.log('Loading messages for faculty:', facultyId, 'student:', studentId);
      
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
          student:student_id (
            full_name,
            student_id,
            email
          )
        `)
        .eq('student_id', studentId)
        .eq('faculty_id', facultyId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Load messages error:', error);
        throw error;
      }

      console.log('Messages data:', data);

      // Map data to fix student structure
      const mappedMessages = (data || []).map((msg: any) => ({
        ...msg,
        student: Array.isArray(msg.student) ? msg.student[0] : msg.student,
      }));
      setMessages(mappedMessages as unknown as Message[]);

      // Mark unread messages as read
      const unreadIds = data?.filter(m => m.sender_type === 'student' && !m.is_read).map(m => m.id) || [];
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
    if (!newMessage.trim() || !selectedStudentId || !facultyId) return;

    setIsSending(true);
    try {
      console.log('Sending message:', {
        student_id: selectedStudentId,
        faculty_id: facultyId,
        message: newMessage.trim(),
        sender_type: 'faculty',
      });

      const { data, error } = await supabase
        .from('messages')
        .insert({
          student_id: selectedStudentId,
          faculty_id: facultyId,
          message: newMessage.trim(),
          sender_type: 'faculty',
          is_read: false,
        });

      if (error) {
        console.error('Insert error:', error);
        throw error;
      }

      console.log('Message sent successfully:', data);
      setNewMessage('');
      await loadMessages(selectedStudentId);
      await loadConversations();
      toast.success('Message sent');
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error(`Failed to send message: ${error.message}`);
    } finally {
      setIsSending(false);
    }
  };

  const startNewChat = (studentId: string) => {
    setSelectedStudentId(studentId);
    setShowNewChat(false);
    setSearchQuery('');
  };

  const filteredStudents = students.filter(s =>
    s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.student_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!facultyId) {
    return <LoadingSkeleton variant="card" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center">
            <MessageSquare className="w-7 h-7 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Messages</h1>
            <p className="text-muted-foreground">Chat with your students</p>
          </div>
        </div>
        <Button onClick={() => setShowNewChat(!showNewChat)}>
          New Chat
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Conversations List */}
        <div className="bg-card rounded-2xl p-4 card-shadow md:col-span-1">
          <h2 className="text-lg font-semibold text-foreground mb-4">Conversations</h2>
          
          {showNewChat && (
            <div className="mb-4 space-y-2">
              <Input
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mb-2"
              />
              <div className="max-h-60 overflow-y-auto space-y-1">
                {filteredStudents.map((student) => (
                  <button
                    key={student.id}
                    onClick={() => startNewChat(student.id)}
                    className="w-full text-left p-2 rounded-lg hover:bg-accent/5 transition-colors"
                  >
                    <p className="font-medium text-sm text-foreground">{student.full_name}</p>
                    <p className="text-xs text-muted-foreground">{student.student_id}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            {conversations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No conversations yet</p>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.student_id}
                  onClick={() => setSelectedStudentId(conv.student_id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedStudentId === conv.student_id
                      ? 'bg-primary/10 border-l-4 border-primary'
                      : 'hover:bg-accent/5'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">{conv.student_name}</p>
                      <p className="text-xs text-muted-foreground">{conv.student_code}</p>
                      <p className="text-xs text-muted-foreground truncate mt-1">{conv.last_message}</p>
                    </div>
                    {conv.unread_count > 0 && (
                      <span className="ml-2 px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
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
          {!selectedStudentId ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Select a conversation or start a new chat</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="border-b border-border pb-3 mb-4">
                <h3 className="font-semibold text-foreground">
                  {conversations.find(c => c.student_id === selectedStudentId)?.student_name || 
                   students.find(s => s.id === selectedStudentId)?.full_name || 'Student'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {conversations.find(c => c.student_id === selectedStudentId)?.student_code ||
                   students.find(s => s.id === selectedStudentId)?.student_id}
                </p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {isLoading ? (
                  <LoadingSkeleton variant="card" />
                ) : messages.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No messages yet. Start the conversation!</p>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender_type === 'faculty' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          msg.sender_type === 'faculty'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-accent/10 text-foreground'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                        <p className={`text-xs mt-1 ${
                          msg.sender_type === 'faculty' ? 'text-primary-foreground/70' : 'text-muted-foreground'
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

export default FacultyMessages;
