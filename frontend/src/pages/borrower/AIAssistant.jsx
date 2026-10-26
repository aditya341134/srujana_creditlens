import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
  RefreshCw,
  Trash2,
  Copy,
  ChevronRight,
  Info,
  ArrowRight,
  Award,
  Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';
import BorrowerLayout from '../../components/layout/BorrowerLayout';
import api from '../../services/api';

export default function AIAssistant() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([
    'What does my ULAS score mean?',
    'Why did my Financial X-Ray identify an income discrepancy?',
    'What is net cash flow and how is it calculated?',
    'What steps should I take before disputing a bureau discrepancy?',
    'How do I upload and verify my bank statement?',
    'What does a thin credit history mean for my application?'
  ]);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    const fetchHistory = async () => {
      setInitialLoading(true);
      try {
        const histRes = await api.getChatHistory().catch(() => ({ history: [] }));
        const hist = histRes.history || [];
        if (hist.length > 0) {
          setMessages(hist);
        } else {
          // Welcome default message
          setMessages([
            {
              role: 'assistant',
              text: "Hello! I am your CreditLens AI Finance Assistant. I am directly grounded in your authorized ULAS credit score calculations, AI Financial X-Ray cash flow findings, and verified bank records. How can I assist you with your financial profile today?",
              provider: 'CreditLens Grounded Intelligence',
              is_grounded: true,
              timestamp: 'Just now'
            }
          ]);
        }
      } catch (err) {
        console.error('History fetch notice:', err);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputText).trim();
    if (!text || loading) return;

    const userMsg = {
      role: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const res = await api.sendChatMessage(text);
      const botMsg = {
        role: 'assistant',
        text: res.response,
        provider: res.provider || 'CreditLens Financial Intelligence',
        is_grounded: res.is_grounded,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, botMsg]);
      setLoading(false);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'I encountered an issue retrieving that information. Please check your connection or retry your question.',
          is_error: true,
          timestamp: 'Just now'
        }
      ]);
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      await api.clearChatHistory();
      setMessages([
        {
          role: 'assistant',
          text: "Chat history cleared. I'm ready for your next question regarding ULAS, Financial X-Ray, or loan documentation.",
          provider: 'CreditLens Grounded Intelligence',
          is_grounded: true,
          timestamp: 'Just now'
        }
      ]);
    } catch (err) {
      console.error('Clear history error:', err);
    }
  };

  const handleCopyMessage = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <BorrowerLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Page Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#5B6B79', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <span>Home</span>
              <span>/</span>
              <span style={{ color: '#173B57', fontWeight: '700' }}>AI Finance Assistant</span>
              <span style={{ fontSize: '10px', backgroundColor: '#E6F4F1', color: '#0F766E', padding: '1px 6px', borderRadius: '4px', fontWeight: '700' }}>
                Grounded Assistant
              </span>
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#173B57', margin: '6px 0 8px 0', letterSpacing: '-0.02em' }}>
              CreditLens AI Finance Assistant
            </h1>
            <p style={{ fontSize: '14px', color: '#5B6B79', margin: 0, maxWidth: '780px', lineHeight: 1.5 }}>
              Objective, conversational financial intelligence grounded strictly in your verified ULAS underwriting assessment and AI Financial X-Ray patterns.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={handleClearHistory}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #DCE3EA',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '12px',
                fontWeight: '600',
                color: '#5B6B79',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Trash2 size={14} />
              <span>Clear History</span>
            </button>
          </div>
        </div>

        {/* Quick Shortcut Navigation Pills */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link
            to="/ulas"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #DCE3EA',
              borderRadius: '20px',
              fontSize: '12px',
              color: '#173B57',
              textDecoration: 'none',
              fontWeight: '600'
            }}
          >
            <Award size={14} color="#0F766E" />
            <span>View Personal ULAS Score</span>
          </Link>
          <Link
            to="/financial-xray"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #DCE3EA',
              borderRadius: '20px',
              fontSize: '12px',
              color: '#173B57',
              textDecoration: 'none',
              fontWeight: '600'
            }}
          >
            <Activity size={14} color="#0F766E" />
            <span>Open AI Financial X-Ray</span>
          </Link>
        </div>

        {/* Chat Conversation Card Container */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #DCE3EA',
            display: 'flex',
            flexDirection: 'column',
            height: '620px',
            boxShadow: '0 4px 16px rgba(23,43,58,0.04)',
            overflow: 'hidden'
          }}
        >
          {/* Messages Scroll Area */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
              backgroundColor: '#F8FAFC'
            }}
          >
            {messages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isUser ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    alignSelf: isUser ? 'flex-end' : 'flex-start'
                  }}
                >
                  {/* Speaker Label */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', fontSize: '11px', color: '#748391' }}>
                    {isUser ? (
                      <>
                        <span>You</span>
                        <User size={12} />
                      </>
                    ) : (
                      <>
                        <Bot size={12} color="#0F766E" />
                        <strong style={{ color: '#173B57' }}>CreditLens Assistant</strong>
                        {msg.is_grounded && (
                          <span style={{ fontSize: '9px', fontWeight: '700', backgroundColor: '#E6F4F1', color: '#0F766E', padding: '1px 5px', borderRadius: '4px' }}>
                            Grounded Data
                          </span>
                        )}
                      </>
                    )}
                    <span>• {msg.timestamp || 'Recent'}</span>
                  </div>

                  {/* Message Bubble */}
                  <div
                    style={{
                      padding: '14px 18px',
                      borderRadius: isUser ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                      backgroundColor: isUser ? '#173B57' : '#FFFFFF',
                      color: isUser ? '#FFFFFF' : '#172B3A',
                      border: isUser ? 'none' : '1px solid #DCE3EA',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                      fontSize: '13px',
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap',
                      position: 'relative'
                    }}
                  >
                    {msg.text}

                    {/* Copy action for assistant response */}
                    {!isUser && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #F1F4F8', fontSize: '11px', color: '#748391' }}>
                        <span>Source: {msg.provider || 'CreditLens Intelligence'}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyMessage(msg.text, idx)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#0F766E',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '11px',
                            fontWeight: '600'
                          }}
                        >
                          <Copy size={12} />
                          <span>{copiedIndex === idx ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Loading Indicator Bubble */}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', alignSelf: 'flex-start', padding: '12px 16px', backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #DCE3EA' }}>
                <RefreshCw size={14} className="cl-spin" color="#0F766E" />
                <span style={{ fontSize: '12px', color: '#5B6B79' }}>Grounded financial analysis in progress...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions Carousel / Chips */}
          <div
            style={{
              padding: '10px 18px',
              backgroundColor: '#FFFFFF',
              borderTop: '1px solid #E2E8F0',
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              whiteSpace: 'nowrap'
            }}
          >
            {suggestions.map((sugg, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSendMessage(sugg)}
                style={{
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #DCE3EA',
                  borderRadius: '16px',
                  padding: '6px 12px',
                  fontSize: '11px',
                  color: '#173B57',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#E6F4F1';
                  e.currentTarget.style.borderColor = '#0F766E';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#F8FAFC';
                  e.currentTarget.style.borderColor = '#DCE3EA';
                }}
              >
                {sugg}
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            style={{
              padding: '14px 18px',
              backgroundColor: '#FFFFFF',
              borderTop: '1px solid #DCE3EA',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <input
              type="text"
              placeholder="Ask a question about your ULAS score, net cash flow, income mismatch, or loan documents..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={loading}
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid #DCE3EA',
                fontSize: '13px',
                color: '#172B3A',
                outline: 'none',
                fontFamily: "'Inter', system-ui, sans-serif"
              }}
            />

            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              style={{
                backgroundColor: inputText.trim() && !loading ? '#173B57' : '#DCE3EA',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 20px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: inputText.trim() && !loading ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'background-color 0.15s ease'
              }}
            >
              <span>Ask</span>
              <Send size={14} />
            </button>
          </form>
        </div>

        {/* Regulatory & Responsible AI Advisory Disclaimer */}
        <div style={{ padding: '12px 18px', backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #DCE3EA', fontSize: '11px', color: '#748391', lineHeight: 1.5 }}>
          <strong>Responsible Financial AI Disclaimer:</strong> Responses generated by the CreditLens AI Finance Assistant are designed strictly for financial education and explainability. The assistant grounds statements on applicant-supplied documents and deterministic rules. It does not guarantee loan approval or credit score enhancements, and does not replace the judgment of an authorized human credit officer.
        </div>
      </div>
    </BorrowerLayout>
  );
}
