'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessageSquare, Send, X, Image as ImageIcon, Video, Mic, ChevronDown, Smile, Bot, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { usePathname } from 'next/navigation';
import { ProductCarousel } from './ProductCarousel';

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

export function UserChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [session, setSession] = useState<any>(null);
  
  // 'menu', 'support' (human), 'ai_recommender'
  const [selectedRoomType, setSelectedRoomType] = useState<string>('menu');
  const [roomId, setRoomId] = useState<string | null>(null);
  
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [isReceivingAI, setIsReceivingAI] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => setSession(session));
    return () => listener.subscription.unsubscribe();
  }, []);

  // When selectedRoomType changes (and it's not menu), attach to the correct room
  useEffect(() => {
    if (selectedRoomType !== 'menu' && session?.user?.id) {
      checkOrCreateRoom(session.user.id, selectedRoomType);
    }
  }, [selectedRoomType, session]);

  useEffect(() => {
    if (roomId && selectedRoomType !== 'menu') {
      const channel = supabase
        .channel(`room:${roomId}`)
        .on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'chat_messages',
            filter: `room_id=eq.${roomId}`
        }, (payload) => {
          // Add message to state
          setMessages(prev => {
            // Check if it already exists (optimistic updates)
            if (prev.find(m => m.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
          
          if (payload.new.sender_role === 'ai') {
             setIsReceivingAI(false);
          }
          
          scrollToBottom();
        })
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    }
  }, [roomId, selectedRoomType]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const checkOrCreateRoom = async (userId: string, type: string) => {
    setMessages([]);
    setRoomId(null);
    
    // Check if user already has a room of this type
    const { data: existingRoom } = await supabase
      .from('chat_rooms')
      .select('id')
      .eq('type', type)
      .eq('participant1_id', userId)
      .single();

    if (existingRoom) {
      setRoomId(existingRoom.id);
      fetchMessages(existingRoom.id);
    } else {
      // Create new room
      const { data: newRoom } = await supabase
        .from('chat_rooms')
        .insert({
          type: type,
          participant1_id: userId,
        })
        .select('id')
        .single();
        
      if (newRoom) setRoomId(newRoom.id);
    }
  };

  const fetchMessages = async (id: string) => {
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('room_id', id)
      .order('created_at', { ascending: true });
    
    if (data) {
      setMessages(data);
      scrollToBottom();
    }
  };

  const sendMessage = async (type: 'text' | 'image' | 'video' | 'audio' | 'sticker', content: string) => {
    if (!roomId || !session?.user) return;
    if (type === 'text' && !content.trim()) return;

    // Save to database
    const { data: newMsg, error } = await supabase.from('chat_messages').insert({
      room_id: roomId,
      sender_id: session.user.id,
      sender_role: 'user', // Note: we assume SQL migration added this
      message_type: type,
      content: content
    }).select().single();

    if (error) {
       console.error("Insert error:", error);
       return;
    }

    if (type === 'text') setInputText('');

    // If this is an AI room, we fire a request to the API
    if (selectedRoomType === 'ai_recommender') {
       setIsReceivingAI(true);
       
       // Format conversation for the AI API
       const conversationContext = [...messages, newMsg].map(m => ({
          role: m.sender_role === 'ai' ? 'assistant' : 'user',
          content: m.content
       }));

       const showErrorInChat = async (msg: string) => {
          await supabase.from('chat_messages').insert({
            room_id: roomId,
            sender_id: null,
            sender_role: 'ai',
            message_type: 'text',
            content: msg
          });
       };

       try {
           const res = await fetch('/api/chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                 roomId,
                 roomType: selectedRoomType,
                 messages: conversationContext
              })
           });
           
           if (!res.ok) {
              const errorData = await res.json().catch(() => ({}));
              const errMsg: string = errorData?.error || '';
              if (errMsg.includes('quota') || errMsg.includes('Quota') || errMsg.includes('limit')) {
                await showErrorInChat('⚠️ ขออภัยครับ ขณะนี้ระบบ AI ใช้งาน API เกิน Quota ฟรีที่มีอยู่แล้ว กรุณารอสักครู่แล้วลองใหม่อีกครั้งครับ (หรือผู้ดูแลระบบต้องเพิ่ม Billing ใน Google AI Studio)');
              } else {
                await showErrorInChat('⚠️ ขออภัยครับ เกิดข้อผิดพลาดจากระบบ AI กรุณาลองใหม่อีกครั้งครับ');
              }
           }
       } catch (e) {
           console.error("AI fetch error:", e);
           await showErrorInChat('⚠️ ไม่สามารถเชื่อมต่อกับระบบ AI ได้ขณะนี้ครับ');
       } finally {
           setIsReceivingAI(false);
       }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'audio') => {
    if (!e.target.files || e.target.files.length === 0 || !roomId || !session?.user) return;
    const file = e.target.files[0];
    e.target.value = '';

    if (file.size > 10 * 1024 * 1024) {
      alert('ไฟล์ใหญ่เกิน 10MB');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${roomId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-media')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('chat-media')
        .getPublicUrl(fileName);

      await sendMessage(type, publicUrl);
    } catch (err: any) {
      alert('เกิดข้อผิดพลาดในการอัปโหลดไฟล์: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const renderMessageContent = (msg: any) => {
    switch (msg.message_type) {
      case 'image':
        return <img src={msg.content} alt="รูปภาพ" className="rounded-lg max-w-full cursor-pointer hover:opacity-90" onClick={() => window.open(msg.content, '_blank')} />;
      case 'video':
        return <video src={msg.content} controls className="rounded-lg max-w-full" />;
      case 'audio':
        return <audio src={msg.content} controls className="max-w-full" />;
      case 'sticker':
        return <img src={msg.content} alt="สติกเกอร์" className="w-24 h-24 object-contain" />;
      default:
        return <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{msg.content}</p>;
    }
  };

  if (pathname.startsWith('/admin')) return null;

  if (!session) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <a href="/auth/login" className="w-14 h-14 rounded-full bg-gold text-black flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:scale-110 transition-transform cursor-pointer">
          <MessageSquare size={24} />
        </a>
      </div>
    );
  }

  const handleMenuSelect = (type: string) => {
     setSelectedRoomType(type);
  };

  const handleBackToMenu = () => {
     setSelectedRoomType('menu');
     setRoomId(null);
     setMessages([]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[350px] h-[550px] max-h-[75vh] glass-dark rounded-2xl border border-white/20 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
          
          {/* Header */}
          <div className="p-4 bg-black/60 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {selectedRoomType !== 'menu' && (
                 <button onClick={handleBackToMenu} className="text-white/50 hover:text-white transition-colors mr-1">
                   <ArrowLeft size={18} />
                 </button>
              )}
              <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-black font-bold">
                {selectedRoomType === 'menu' ? 'K' : selectedRoomType === 'support' ? 'H' : <Bot size={18} />}
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">
                   {selectedRoomType === 'menu' ? 'KabShop Support' :
                    selectedRoomType === 'support' ? 'Talk to Admin' : 'AI Recommender'}
                </h3>
                <p className="text-[10px] text-green-400 font-medium">Online</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white transition-colors">
              <ChevronDown size={20} />
            </button>
          </div>

          {/* MENU VIEW */}
          {selectedRoomType === 'menu' && (
             <div className="flex-1 flex flex-col p-6 items-center justify-center gap-4 bg-gradient-to-b from-black/20 to-transparent">
                <div className="text-center mb-4">
                   <MessageSquare className="w-12 h-12 text-gold mx-auto mb-2 opacity-50" />
                   <h2 className="text-white font-bold text-lg">How can we help?</h2>
                   <p className="text-white/50 text-xs mt-1">Select an option below to get started</p>
                </div>

                <button 
                  onClick={() => handleMenuSelect('support')}
                  className="w-full bg-white/5 hover:bg-white/10 border border-white/10 p-4 rounded-xl flex items-center gap-4 text-left transition-all hover:scale-105"
                >
                  <div className="bg-blue-500/20 text-blue-400 p-2 rounded-lg">
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">Talk to Admin</p>
                    <p className="text-white/40 text-xs">Reach a human support agent</p>
                  </div>
                </button>

                <button 
                  onClick={() => handleMenuSelect('ai_recommender')}
                  className="w-full bg-white/5 hover:bg-white/10 border border-white/10 p-4 rounded-xl flex items-center gap-4 text-left transition-all hover:scale-105"
                >
                  <div className="bg-gold/20 text-gold p-2 rounded-lg">
                    <Bot size={20} />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">AI Recommender</p>
                    <p className="text-white/40 text-xs">Let AI find the perfect product</p>
                  </div>
                </button>

             </div>
          )}

          {/* CHAT VIEW */}
          {selectedRoomType !== 'menu' && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-white/50 text-sm mt-10">
                    Send a message to start chatting in this room.
                  </div>
                ) : (
                  messages.map(msg => {
                    // ใช้ sender_id (สำหรับ history) และ sender_role เป็นหลัก
                    const isMine = msg.sender_id === session?.user?.id || msg.sender_role === 'user';
                    
                    // Parse Generative UI tags (e.g., $$PRODUCT_IDS: id1,id2$$)
                    let displayContent = msg.content;
                    let productIds: string[] = [];
                    
                    if (msg.message_type === 'text' || !msg.message_type) {
                      const productMatch = displayContent?.match(/\$\$PRODUCT_IDS:\s*([a-zA-Z0-9\-_,]+)\$\$/);
                      if (productMatch) {
                        productIds = productMatch[1].split(',').filter(Boolean);
                        displayContent = displayContent.replace(productMatch[0], '').trim();
                      }
                    }

                    return (
                      <div key={msg.id} className={`flex flex-col gap-1 ${isMine ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl px-3 py-2 ${
                          isMine
                            ? 'bg-gold text-black rounded-tr-sm'
                            : 'bg-white/10 border border-white/10 text-white rounded-tl-sm'
                        }`}>
                          {!isMine && msg.sender_role === 'admin' && (
                            <p className="text-[10px] font-bold text-gold/80 mb-1">Admin</p>
                          )}
                          {(msg.message_type === 'text' || !msg.message_type) ? (
                            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{displayContent}</p>
                          ) : (
                            renderMessageContent(msg)
                          )}
                          <p className={`text-[10px] text-right mt-1 ${isMine ? 'text-black/60' : 'text-white/40'}`}>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        
                        {/* Generative UI for product recommendations */}
                        {productIds.length > 0 && !isMine && (
                          <div className="w-full max-w-[320px]">
                            <ProductCarousel ids={productIds} />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
                {isReceivingAI && (
                   <div className="flex justify-start">
                     <div className="max-w-[85%] rounded-2xl p-3 bg-black/60 border border-white/10 rounded-tl-sm flex items-center gap-2">
                       <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" />
                       <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce [animation-delay:0.2s]" />
                       <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce [animation-delay:0.4s]" />
                     </div>
                   </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="relative p-3 bg-black/40 border-t border-white/10">
                
                {/* Stickers Drawer */}
                {selectedRoomType === 'support' && showStickers && (
                  <div className="absolute bottom-full left-0 mb-2 w-[320px] bg-neutral-900 border border-white/20 rounded-xl p-3 shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2">
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
                          <img src={s.url} alt={s.id} className="w-16 h-16 object-contain" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Media buttons row (only for support room) */}
                {selectedRoomType === 'support' && (
                  <div className="flex gap-1 mb-2">
                    <label className="p-1.5 text-white/50 hover:text-gold hover:bg-white/5 rounded-full cursor-pointer transition-colors" title="อัปโหลดรูปภาพ">
                      <ImageIcon size={18} />
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'image')} disabled={uploading || isReceivingAI} />
                    </label>
                    <label className="p-1.5 text-white/50 hover:text-gold hover:bg-white/5 rounded-full cursor-pointer transition-colors" title="อัปโหลดวิดีโอ">
                      <Video size={18} />
                      <input type="file" accept="video/mp4,video/quicktime,video/webm" className="hidden" onChange={(e) => handleFileUpload(e, 'video')} disabled={uploading || isReceivingAI} />
                    </label>
                    <label className="p-1.5 text-white/50 hover:text-gold hover:bg-white/5 rounded-full cursor-pointer transition-colors" title="อัปโหลดเสียง">
                      <Mic size={18} />
                      <input type="file" accept="audio/*" className="hidden" onChange={(e) => handleFileUpload(e, 'audio')} disabled={uploading || isReceivingAI} />
                    </label>
                    <button onClick={() => setShowStickers(!showStickers)} className={`p-1.5 rounded-full transition-colors ${showStickers ? 'text-gold bg-white/10' : 'text-white/50 hover:text-gold hover:bg-white/5'}`} title="ส่งสติกเกอร์">
                      <Smile size={18} />
                    </button>
                    {uploading && <span className="text-xs text-gold/70 self-center ml-1 animate-pulse">กำลังอัปโหลด...</span>}
                  </div>
                )}

                <div className="flex bg-black/40 border border-white/10 rounded-xl overflow-hidden focus-within:border-gold transition-colors">
                  <input 
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') sendMessage('text', inputText);
                    }}
                    disabled={uploading || isReceivingAI}
                    placeholder="พิมพ์ข้อความ..."
                    className="flex-1 bg-transparent px-3 py-3 text-sm outline-none w-full text-white placeholder-white/40"
                  />
                  <button 
                    onClick={() => sendMessage('text', inputText)}
                    disabled={!inputText.trim() || uploading || isReceivingAI}
                    className="px-4 text-gold hover:bg-white/5 disabled:opacity-50 transition-colors"
                  >
                    {uploading ? <div className="w-4 h-4 border-2 border-gold border-t-transparent rounded-full animate-spin"/> : <Send size={18} />}
                  </button>
                </div>
              </div>
            </>
          )}

        </div>
      )}

      {/* Bubble Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:scale-110 transition-transform ${isOpen ? 'bg-black border border-white/20 text-white' : 'bg-gold text-black'}`}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

    </div>
  );
}
