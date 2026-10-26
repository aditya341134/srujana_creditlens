import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  RefreshCw,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export function FloatingChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: "Hi! Need help understanding your ULAS score or Financial X-Ray findings? Ask me anything!",
      is_grounded: true
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e?.preventDefault();
    const text = inputText.trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { role: 'user', text }]);
    setInputText('');
    setLoading(true);

    try {
      const res = await api.sendChatMessage(text);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: res.response,
          is_grounded: res.is_grounded
        }
      ]);
      setLoading(false);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'Unable to reach the assistant service right now. Please try again.',
          is_error: true
        }
      ]);
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Open AI Finance Assistant"
        className="no-print"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '80px',
          height: '44px',
          padding: '0 16px',
          borderRadius: '22px',
          backgroundColor: '#173B57',
          color: '#FFFFFF',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 4px 16px rgba(23, 59, 87, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          zIndex: 85,
          fontSize: '13px',
          fontWeight: '700',
          transition: 'all 0.15s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#0F766E';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#173B57';
        }}
      >
        <Sparkles size={16} />
        <span>Ask AI Assistant</span>
      </button>

      {/* Floating Chat Modal Drawer */}
      {isOpen && (
        <div
          className="no-print"
          style={{
            position: 'fixed',
            bottom: '80px',
            right: '24px',
            width: '380px',
            maxWidth: 'calc(100vw - 32px)',
            height: '520px',
            maxHeight: 'calc(100vh - 120px)',
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #DCE3EA',
            boxShadow: '0 10px 30px rgba(23, 43, 58, 0.18)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 90,
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 16px',
              backgroundColor: '#173B57',
              color: '#FFFFFF',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: '#0F766E',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Bot size={16} color="#FFFFFF" />
              </div>
              <div>
                <strong style={{ fontSize: '13px', display: 'block' }}>CreditLens AI Assistant</strong>
                <span style={{ fontSize: '10px', color: '#99EFE5' }}>Grounded in your active data</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link
                to="/assistant"
                onClick={() => setIsOpen(false)}
                title="Expand to Full Page"
                style={{ color: '#FFFFFF', opacity: 0.8 }}
              >
                <ExternalLink size={15} />
              </Link>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer', opacity: 0.8 }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages List */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              backgroundColor: '#F8FAFC'
            }}
          >
            {messages.map((m, idx) => {
              const isUser = m.role === 'user';
              return (
                <div
                  key={idx}
                  style={{
                    alignSelf: isUser ? 'flex-end' : 'flex-start',
                    maxWidth: '88%',
                    padding: '10px 14px',
                    borderRadius: isUser ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                    backgroundColor: isUser ? '#173B57' : '#FFFFFF',
                    color: isUser ? '#FFFFFF' : '#172B3A',
                    border: isUser ? 'none' : '1px solid #DCE3EA',
                    fontSize: '12px',
                    lineHeight: 1.5,
                    whiteSpace: 'pre-wrap',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                  }}
                >
                  {m.text}
                </div>
              );
            })}
            {loading && (
              <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#5B6B79', backgroundColor: '#FFFFFF', padding: '8px 12px', borderRadius: '10px', border: '1px solid #DCE3EA' }}>
                <RefreshCw size={12} className="cl-spin" color="#0F766E" />
                <span>Thinking...</span>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Quick Prompts */}
          <div style={{ padding: '6px 12px', backgroundColor: '#FFFFFF', borderTop: '1px solid #F1F4F8', display: 'flex', gap: '6px', overflowX: 'auto', whiteSpace: 'nowrap' }}>
            {['ULAS Score?', 'Net Cash Flow?', 'Income Mismatch?'].map((q, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setInputText(q);
                  handleSend();
                }}
                style={{
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #DCE3EA',
                  borderRadius: '12px',
                  padding: '4px 8px',
                  fontSize: '10px',
                  color: '#173B57',
                  cursor: 'pointer'
                }}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <form
            onSubmit={handleSend}
            style={{
              padding: '10px 14px',
              backgroundColor: '#FFFFFF',
              borderTop: '1px solid #DCE3EA',
              display: 'flex',
              gap: '8px'
            }}
          >
            <input
              type="text"
              placeholder="Ask a question..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #DCE3EA',
                fontSize: '12px',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              style={{
                backgroundColor: inputText.trim() && !loading ? '#0F766E' : '#DCE3EA',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 12px',
                cursor: inputText.trim() && !loading ? 'pointer' : 'not-allowed'
              }}
            >
              <Send size={13} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
