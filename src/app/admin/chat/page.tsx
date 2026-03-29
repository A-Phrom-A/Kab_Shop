'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Paperclip, Send, X, Image as ImageIcon, Video, Mic, Smile, Bot, Headset } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';

const STICKERS = [
  { id: 'Wecandoit', url: '/stickers/Wecandoit.png' },
  { id: 'receive', url: '/stickers/receive.png' },
  { id: 'wait', url: '/stickers/wait.png' },
  { id: 'in_progress', url: '/stickers/in%20progress.png' },
  { id: 'stun', url: '/stickers/stun.png' },
  { id: 'cry', url: '/stickers/cry.png' },
  { id: 'dizzy', url: '/stickers/dizzy.png' },
  { id: 'Happy', url: '/stickers/Happy.png' },
  { id: 'hello', url: '/stickers/hello.png' },
  { id: 'sad', url: '/stickers/sad.png' },
  { id: 'sorry', url: '/stickers/sorry.png' },
  { id: 'Thank_you', url: '/stickers/Thank%20you.png' }
];

type Profile = {
  id: string;
  name: string;
  avatar_url: string;
  role: string;
};

type Room = {
  id: string;
  type: string;
  participant1: Profile;
  participant2: Profile;
  created_at: string;
};

type Message = {
  id: string;
  room_id: string;
  sender_id: string;
  message_type: 'text' | 'image' | 'video' | 'audio' | 'sticker';
  content: string;
  created_at: string;
  sender?: Profile;
};

export default function AdminChatPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [inputText, setInputText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (activeRoomId) {
      fetchMessages(activeRoomId);
      
      const channel = supabase
        .channel(`room:${activeRoomId}`)
        .on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'chat_messages',
            filter: `room_id=eq.${activeRoomId}`
        }, (payload) => {
          const newMessage = payload.new as Message;
          // Fetch sender info for new message
          supabase.from('profiles').select('*').eq('id', newMessage.sender_id).single()
            .then(({ data }) => {
              if (data) {
                setMessages(prev => [...prev, { ...newMessage, sender: data }]);
                scrollToBottom();
              }
            });
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [activeRoomId]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const fetchInitialData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    setCurrentUser(profile);

    // Fetch rooms (For admin, fetch all rooms where they are participants, or all support rooms)
    const { data: roomsData } = await supabase
      .from('chat_rooms')
      .select(`
        id, type, created_at,
        participant1:profiles!chat_rooms_participant1_id_fkey(*),
        participant2:profiles!chat_rooms_participant2_id_fkey(*)
      `)
      .order('created_at', { ascending: false });

    // Format room data and optionally filter if necessary based on RLS
    if (roomsData) {
      setRooms(roomsData as any);
      if (roomsData.length > 0) setActiveRoomId(roomsData[0].id);
    }
  };

  const fetchMessages = async (roomId: string) => {
    const { data } = await supabase
      .from('chat_messages')
      .select('*, sender:profiles!chat_messages_sender_id_fkey(*)')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true });
    
    if (data) {
      setMessages(data as any);
      scrollToBottom();
    }
  };

  const sendMessage = async (type: 'text' | 'image' | 'video' | 'audio' | 'sticker', content: string) => {
    if (!activeRoomId || !currentUser) return;
    if (type === 'text' && !content.trim()) return;

    await supabase.from('chat_messages').insert({
      room_id: activeRoomId,
      sender_id: currentUser.id,
      sender_role: 'admin',
      message_type: type,
      content: content
    });

    if (type === 'text') setInputText('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'audio') => {
    if (!e.target.files || e.target.files.length === 0 || !activeRoomId || !currentUser) return;
    const file = e.target.files[0];
    
    // Check sizes (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert("File is too large. Maximum size is 10MB.");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${activeRoomId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('chat-media')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('chat-media')
        .getPublicUrl(fileName);

      await sendMessage(type, publicUrl);
    } catch (err: any) {
      alert("Error uploading file: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const getOtherParticipant = (room: Room) => {
    if (!currentUser) return room.participant1;
    return room.participant1.id === currentUser.id ? room.participant2 : room.participant1;
  };

  const renderMessageContent = (msg: Message) => {
    switch (msg.message_type) {
      case 'image':
        return <img src={msg.content} alt="Image attachment" className="rounded-lg max-w-[250px] cursor-pointer hover:opacity-90" onClick={() => window.open(msg.content, '_blank')} />;
      case 'video':
        return <video src={msg.content} controls className="rounded-lg max-w-[250px]" />;
      case 'audio':
        return <audio src={msg.content} controls className="max-w-[250px]" />;
      case 'sticker':
        return <img src={msg.content} alt="Sticker" className="w-32 h-32 object-contain drop-shadow-md bg-transparent" />;
      default:
        return <p className="whitespace-pre-wrap break-words">{msg.content}</p>;
    }
  };

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6">
      {/* Sidebar - Room List */}
      <Card className="w-1/3 flex flex-col overflow-hidden h-full p-0">
        <div className="p-4 border-b border-white/10 glass-dark">
          <h2 className="text-xl font-serif text-gold font-bold flex items-center gap-2">
            <MessageSquare size={20} /> Conversations
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {rooms.length === 0 ? (
            <div className="p-6 text-center text-white/50">No conversations yet</div>
          ) : (
            rooms.map(room => {
              const other = getOtherParticipant(room);
              return (
                <div 
                  key={room.id} 
                  onClick={() => setActiveRoomId(room.id)}
                  className={`p-4 border-b border-white/5 cursor-pointer transition-colors flex items-center gap-3 ${activeRoomId === room.id ? 'bg-gold/10 border-l-4 border-l-gold' : 'hover:bg-white/5 border-l-4 border-l-transparent'}`}
                >
                  <div className="w-10 h-10 rounded-full bg-gold/20 flex-shrink-0 flex items-center justify-center text-gold overflow-hidden">
                    {other?.avatar_url ? <img src={other.avatar_url} alt="A" className="w-full h-full object-cover"/> : other?.name?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="font-bold text-sm text-white truncate">{other?.name || 'Unknown User'}</p>
                    <p className="text-xs text-white/50 truncate flex items-center gap-1 mt-0.5">
                      {room.type === 'support' ? <><Headset size={12}/> Customer Support</> : 
                       room.type === 'ai_recommender' ? <><Bot size={12}/> AI Recommender</> : 'Direct Message'}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* Main Chat Area */}
      <Card className="w-2/3 flex flex-col h-full p-0 overflow-hidden relative">
        {activeRoomId ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-white/10 glass-dark flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold overflow-hidden">
                  {getOtherParticipant(rooms.find(r => r.id === activeRoomId)!)?.avatar_url ? 
                    <img src={getOtherParticipant(rooms.find(r => r.id === activeRoomId)!)?.avatar_url} alt="A" className="w-full h-full object-cover"/> : 
                    getOtherParticipant(rooms.find(r => r.id === activeRoomId)!)?.name?.charAt(0) || '?'}
                </div>
                <div>
                  <h3 className="font-bold text-gold">
                    {getOtherParticipant(rooms.find(r => r.id === activeRoomId)!)?.name || 'Unknown User'}
                  </h3>
                  <p className="text-xs text-white/50 flex items-center gap-1 mt-0.5">
                    {rooms.find(r => r.id === activeRoomId)?.type === 'support' ? <><Headset size={12}/> Customer Support</> :
                     rooms.find(r => r.id === activeRoomId)?.type === 'ai_recommender' ? <><Bot size={12}/> AI Recommender</> : 'Direct Message'}
                  </p>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map(msg => {
                const isMine = msg.sender_id === currentUser?.id;
                return (
                  <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl p-3 ${
                      isMine ? 'bg-gold text-black rounded-tr-sm' : 'bg-black/40 border border-white/10 rounded-tl-sm'
                    }`}>
                      {!isMine && <p className="text-xs font-bold mb-1 opacity-70">{msg.sender?.name}</p>}
                      {renderMessageContent(msg)}
                      <p className={`text-[10px] text-right mt-1 ${isMine ? 'text-black/60' : 'text-white/40'}`}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="relative p-4 border-t border-white/10 glass-dark flex gap-2 items-end">
              
              {/* Stickers Drawer */}
              {showStickers && (
                <div className="absolute bottom-full left-4 mb-2 w-[400px] bg-neutral-900 border border-white/20 rounded-xl p-3 shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex justify-between items-center mb-2 px-1">
                    <span className="text-xs font-bold text-white/50 uppercase tracking-wider">Stickers</span>
                    <button onClick={() => setShowStickers(false)} className="text-white/40 hover:text-white"><X size={14}/></button>
                  </div>
                  <div className="grid grid-cols-4 gap-2 max-h-[200px] overflow-y-auto p-1 custom-scrollbar">
                    {STICKERS.map(s => (
                      <button 
                        key={s.id} 
                        onClick={() => {
                          sendMessage('sticker', s.url);
                          setShowStickers(false);
                        }}
                        className="hover:scale-110 hover:bg-white/5 transition-all p-2 rounded-lg flex items-center justify-center pointer-events-auto"
                      >
                        <img src={s.url} alt={s.id} className="w-20 h-20 object-contain" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Media Uploaders */}
              <div className="flex gap-1 mb-1">
                <label className="p-2 text-white/50 hover:text-gold hover:bg-white/5 rounded-full cursor-pointer transition-colors" title="Upload Image">
                  <ImageIcon size={20} />
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'image')} disabled={uploading} />
                </label>
                <label className="p-2 text-white/50 hover:text-gold hover:bg-white/5 rounded-full cursor-pointer transition-colors" title="Upload Video">
                  <Video size={20} />
                  <input type="file" accept="video/mp4,video/quicktime,video/webm" className="hidden" onChange={(e) => handleFileUpload(e, 'video')} disabled={uploading} />
                </label>
                <label className="p-2 text-white/50 hover:text-gold hover:bg-white/5 rounded-full cursor-pointer transition-colors" title="Upload Audio">
                  <Mic size={20} />
                  <input type="file" accept="audio/*" className="hidden" onChange={(e) => handleFileUpload(e, 'audio')} disabled={uploading} />
                </label>
                <button onClick={() => setShowStickers(!showStickers)} className={`p-2 rounded-full transition-colors ${showStickers ? 'text-gold bg-white/10' : 'text-white/50 hover:text-gold hover:bg-white/5'}`} title="Sticker">
                  <Smile size={20} />
                </button>
              </div>

              <div className="flex-1">
                <textarea 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage('text', inputText);
                    }
                  }}
                  placeholder="Type your message..."
                  className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-sm focus:border-gold outline-none resize-none max-h-[120px]"
                  rows={2}
                  disabled={uploading}
                />
              </div>

              <button 
                onClick={() => sendMessage('text', inputText)}
                disabled={!inputText.trim() || uploading}
                className="p-3 bg-gold text-black rounded-lg hover:bg-gold/80 disabled:opacity-50 transition-colors mb-1"
              >
                {uploading ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"/> : <Send size={20} />}
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-white/50">
            <MessageSquare size={48} className="mb-4 opacity-20" />
            <p>Select a conversation to start messaging</p>
          </div>
        )}
      </Card>
    </div>
  );
}
