'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Scale, AlertTriangle, FileText, DollarSign, Minimize2, Maximize2 } from 'lucide-react';
import { TaxResult } from '@/lib/types';

interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: Date;
}

interface TaxAttorneyChatProps {
  taxResult: TaxResult;
  stateName: string;
}

// Quick action buttons
const QUICK_ACTIONS = [
  { id: 'summary', label: '📊 Tax Summary', icon: FileText },
  { id: 'filing', label: '📝 How to File', icon: FileText },
  { id: 'penalties', label: '⚠️ Penalties', icon: AlertTriangle },
  { id: 'reduce', label: '💡 Reduce Taxes', icon: DollarSign },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(amount));
}

export default function TaxAttorneyChat({ taxResult, stateName }: TaxAttorneyChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { totalPnl, federalTax, stateTax, totalTax, tradeCount, isLoss } = taxResult;

  // Initial greeting when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting = getGreeting();
      addAssistantMessage(greeting);
    }
  }, [isOpen]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function getGreeting(): string {
    if (isLoss) {
      return `Hello! I'm your SecAI Tax Attorney assistant. 👋\n\nI see you have a **net loss of ${formatCurrency(totalPnl)}** from your ${tradeCount || 'crypto'} trades. Good news — you don't owe any taxes on losses!\n\nHowever, I can help you understand how to use these losses strategically. What would you like to know?`;
    }
    return `Hello! I'm your SecAI Tax Attorney assistant. 👋\n\nBased on your analysis, you have **${formatCurrency(totalPnl)} in realized gains** from ${tradeCount || 'your'} trades, with an estimated tax liability of **${formatCurrency(totalTax)}**.\n\nI'm here to help you understand your obligations and options. What would you like to know?`;
  }

  function getResponse(topic: string): string {
    const responses: Record<string, string> = {
      summary: isLoss 
        ? `📊 **Your Tax Summary**\n\n` +
          `• **Total PNL:** ${formatCurrency(totalPnl)} (Loss)\n` +
          `• **Federal Tax:** $0 (no tax on losses)\n` +
          `• **State Tax (${stateName}):** $0\n` +
          `• **Total Owed:** $0\n\n` +
          `**Key Point:** Your losses can be carried forward to offset future gains. You can also deduct up to $3,000 of capital losses against ordinary income per year.`
        : `📊 **Your Tax Summary**\n\n` +
          `• **Total PNL:** ${formatCurrency(totalPnl)}\n` +
          `• **Federal Tax (30%):** ${formatCurrency(federalTax)}\n` +
          `• **State Tax (${stateName}):** ${formatCurrency(stateTax)}\n` +
          `• **Total Estimated:** ${formatCurrency(totalTax)}\n\n` +
          `**Important:** This is based on short-term capital gains rates. Holding assets over 1 year may qualify for lower long-term rates (0-20%).`,

      filing: `📝 **How to File Crypto Taxes**\n\n` +
        `**1. Gather Documents:**\n` +
        `• Transaction history from exchanges\n` +
        `• Wallet transaction records\n` +
        `• Cost basis documentation\n\n` +
        `**2. Required Forms:**\n` +
        `• **Form 8949** - Report each transaction\n` +
        `• **Schedule D** - Summary of gains/losses\n` +
        `• **Form 1040** - Main tax return\n\n` +
        `**3. Deadline:**\n` +
        `April 15, 2026 (or October 15 with extension)\n\n` +
        `**Tip:** Consider using crypto tax software like Koinly, CoinTracker, or TaxBit for detailed reports.`,

      penalties: `⚠️ **IRS Penalties for Non-Compliance**\n\n` +
        `**Failure to File:**\n` +
        `• 5% of unpaid taxes per month\n` +
        `• Maximum: 25% of unpaid taxes\n\n` +
        `**Failure to Pay:**\n` +
        `• 0.5% of unpaid taxes per month\n` +
        `• Maximum: 25% of unpaid taxes\n\n` +
        `**Accuracy Penalties:**\n` +
        `• 20% for negligence\n` +
        `• 75% for fraud\n\n` +
        `**Criminal Penalties:**\n` +
        `• Up to $250,000 in fines\n` +
        `• Up to 5 years in prison\n\n` +
        `🚨 **The IRS is actively pursuing crypto tax evaders.** They have obtained records from major exchanges and are using blockchain analytics.`,

      reduce: isLoss
        ? `💡 **Using Your Losses Strategically**\n\n` +
          `**Tax Loss Harvesting:**\n` +
          `Your ${formatCurrency(totalPnl)} loss can offset:\n` +
          `• Future crypto gains (unlimited)\n` +
          `• Other capital gains (stocks, etc.)\n` +
          `• Up to $3,000 of ordinary income/year\n\n` +
          `**Carry Forward:**\n` +
          `Unused losses carry forward indefinitely until used.\n\n` +
          `**Example:** If you have $50K gains next year, your current loss can reduce that to ${formatCurrency(50000 + totalPnl)} in taxable gains.`
        : `💡 **Strategies to Reduce Your Tax Bill**\n\n` +
          `**1. Hold Longer (LTCG):**\n` +
          `Assets held >1 year qualify for 0-20% rates vs 10-37% short-term.\n\n` +
          `**2. Tax Loss Harvesting:**\n` +
          `Sell losing positions to offset gains. Watch wash sale rules!\n\n` +
          `**3. Retirement Accounts:**\n` +
          `Some IRAs allow crypto. Gains are tax-deferred.\n\n` +
          `**4. Charitable Donations:**\n` +
          `Donate appreciated crypto — deduct fair market value, avoid capital gains.\n\n` +
          `**5. Opportunity Zones:**\n` +
          `Invest gains in qualified OZ funds for deferral/reduction.\n\n` +
          `**Your Potential Savings:** If all gains were long-term, you could save approximately ${formatCurrency(totalTax * 0.4)}.`,

      deadline: `📅 **Important Tax Deadlines 2026**\n\n` +
        `• **January 15** - Q4 estimated tax payment\n` +
        `• **April 15** - Tax filing deadline\n` +
        `• **April 15** - Q1 estimated tax payment\n` +
        `• **June 15** - Q2 estimated tax payment\n` +
        `• **September 15** - Q3 estimated tax payment\n` +
        `• **October 15** - Extended filing deadline\n\n` +
        `**Estimated Taxes:** If you owe more than $1,000, you may need to make quarterly estimated payments to avoid penalties.`,

      help: `I can help you with:\n\n` +
        `• 📊 **Tax Summary** - Breakdown of your tax liability\n` +
        `• 📝 **Filing Guide** - How to report crypto taxes\n` +
        `• ⚠️ **Penalties** - Consequences of non-compliance\n` +
        `• 💡 **Tax Strategies** - Legal ways to reduce taxes\n` +
        `• 📅 **Deadlines** - Important dates to remember\n\n` +
        `Just click a button above or type your question!`,
    };

    return responses[topic] || responses.help;
  }

  function addAssistantMessage(content: string) {
    setIsTyping(true);
    
    // Simulate typing delay
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content,
        timestamp: new Date(),
      }]);
      setIsTyping(false);
    }, 500 + Math.random() * 500);
  }

  function handleQuickAction(actionId: string) {
    // Add user message
    const actionLabel = QUICK_ACTIONS.find(a => a.id === actionId)?.label || actionId;
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      content: actionLabel,
      timestamp: new Date(),
    }]);

    // Get response
    addAssistantMessage(getResponse(actionId));
  }

  function handleSendMessage() {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setInputValue('');

    // Add user message
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    }]);

    // Determine response based on keywords
    const lowerMessage = userMessage.toLowerCase();
    let responseKey = 'help';
    
    if (lowerMessage.includes('summar') || lowerMessage.includes('breakdown') || lowerMessage.includes('owe')) {
      responseKey = 'summary';
    } else if (lowerMessage.includes('file') || lowerMessage.includes('form') || lowerMessage.includes('report')) {
      responseKey = 'filing';
    } else if (lowerMessage.includes('penal') || lowerMessage.includes('fine') || lowerMessage.includes('jail') || lowerMessage.includes('irs')) {
      responseKey = 'penalties';
    } else if (lowerMessage.includes('reduc') || lowerMessage.includes('lower') || lowerMessage.includes('save') || lowerMessage.includes('strateg')) {
      responseKey = 'reduce';
    } else if (lowerMessage.includes('deadline') || lowerMessage.includes('when') || lowerMessage.includes('date')) {
      responseKey = 'deadline';
    }

    addAssistantMessage(getResponse(responseKey));
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        data-attorney-chat="true"
        className="fixed bottom-6 right-6 bg-usa-blue text-white p-4 rounded-full shadow-lg hover:bg-usa-navy transition-all hover:scale-110 z-50 group"
      >
        <img src="/logo.png" alt="SecAI" className="w-6 h-6 object-contain" />
        <span className="absolute -top-2 -right-2 bg-usa-red text-white text-xs px-2 py-0.5 rounded-full">
          Attorney
        </span>
        <div className="absolute bottom-full right-0 mb-2 w-48 bg-white text-gray-800 text-sm p-3 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          💼 Need tax advice? Chat with your AI Tax Attorney!
        </div>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
      isMinimized ? 'w-72' : 'w-96'
    }`}>
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="bg-usa-blue text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="SecAI" className="w-10 h-10 object-contain" />
            <div>
              <h3 className="font-bold">Tax Attorney</h3>
              <p className="text-xs text-white/70">AI Legal Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1.5 hover:bg-white/20 rounded transition-colors"
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/20 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="h-80 overflow-y-auto p-4 bg-gray-50 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-usa-blue text-white rounded-br-md'
                      : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-md'
                  }`}>
                    <div className="text-sm whitespace-pre-wrap">
                      {message.content.split('**').map((part, i) => 
                        i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-gray-100">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div className="p-3 bg-white border-t border-gray-100">
              <div className="flex flex-wrap gap-2 mb-3">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleQuickAction(action.id)}
                    className="text-xs bg-gray-100 hover:bg-usa-blue hover:text-white text-gray-700 px-3 py-1.5 rounded-full transition-colors"
                  >
                    {action.label}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask about your taxes..."
                  className="flex-1 px-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-usa-blue/50"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  className="p-2 bg-usa-blue text-white rounded-full hover:bg-usa-navy disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

          </>
        )}
      </div>
    </div>
  );
}
