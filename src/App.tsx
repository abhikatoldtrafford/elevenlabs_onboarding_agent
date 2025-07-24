import React, { useState, useEffect, useRef } from 'react';
import { useConversation } from '@elevenlabs/react';
import './App.css';

const AGENT_ID = 'agent_1401k0xe16ree10bp35fs692mhn7';

// Define types
interface ToolCall {
  timestamp: Date;
  parameters: any;
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface ProfileData {
  firstName?: string;
  lastName?: string;
  occupation?: string;
  location?: string;
  interests?: string[];
  learningStyle?: string;
  studyTime?: string;
  shortTermGoals?: string[];
  longTermGoals?: string[];
  overallUserPersona?: string;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [toolCalls, setToolCalls] = useState<ToolCall[]>([]);
  const [profileData, setProfileData] = useState<ProfileData>({});
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [duration, setDuration] = useState<string>('0:00');
  const [profileUpdateCount, setProfileUpdateCount] = useState<number>(0);
  const [totalFieldsExtracted, setTotalFieldsExtracted] = useState<number>(0);
  const [isBlinking, setIsBlinking] = useState<boolean>(false);
  const [showHearts, setShowHearts] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Add blinking effect
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 200);
    }, 4000 + Math.random() * 2000); // Blink every 4-6 seconds

    return () => clearInterval(blinkInterval);
  }, []);

  const conversation = useConversation({
    clientTools: {
      UPDATE_PROFILE: (parameters: any) => {
        console.log('UPDATE_PROFILE called with:', parameters);
        
        // Add tool call to history
        const newToolCall: ToolCall = {
          timestamp: new Date(),
          parameters
        };
        setToolCalls(prev => [...prev, newToolCall]);
        setProfileUpdateCount(prev => prev + 1);
        
        // Update profile data - handle the ElevenLabs format
        setProfileData(prev => {
          const updated: ProfileData = { ...prev };
          
          // Extract fields from the parameters
          Object.entries(parameters).forEach(([key, value]) => {
            if (key === 'interests' && Array.isArray(value)) {
              updated.interests = value;
            } else if (key === 'shortTermGoals' && Array.isArray(value)) {
              updated.shortTermGoals = value;
            } else if (key === 'longTermGoals' && Array.isArray(value)) {
              updated.longTermGoals = value;
            } else {
              (updated as any)[key] = value;
            }
          });
          
          return updated;
        });
        
        // Count fields
        const fieldCount = Object.keys(parameters).length;
        setTotalFieldsExtracted(prev => prev + fieldCount);
        
        // Show hearts animation briefly
        setShowHearts(true);
        setTimeout(() => setShowHearts(false), 2000);
        
        // Check for milestones
        const oldScore = calculateCompletionScore();
        const newScore = calculateCompletionScoreWithNewData(profileData, parameters);
        
        // Celebrate milestones at 30%, 50%, 70%, and 100%
        if (newScore >= 30 && oldScore < 30) {
          celebrateMilestone(30);
        } else if (newScore >= 50 && oldScore < 50) {
          celebrateMilestone(50);
        } else if (newScore >= 70 && oldScore < 70) {
          celebrateMilestone(70);
        } else if (newScore === 100 && oldScore < 100) {
          celebrateMilestone(100);
        }
        
        // Add subtle system message
        const fieldNames = Object.keys(parameters).join(', ');
        // Don't show system message for every update - too noisy
        
        return "Profile information captured successfully";
      }
    },
    onConnect: () => {
      console.log('Connected to RIATA');
      setIsConnecting(false);
      addMessage('assistant', "Hey there! 😊 I'm RIATA, your personal learning companion! I'm SO excited to meet you! What should I call you?");
      setStartTime(new Date());
    },
    onDisconnect: () => {
      console.log('Disconnected from RIATA');
      setIsStarted(false);
      setIsConnecting(false);
    },
    onMessage: (message: any) => {
      console.log('Message received:', message);
      
      if (message.message) {
        if (message.source === 'user') {
          addMessage('user', message.message);
        } else if (message.source !== 'user' && message.message && 
                   !message.message.includes("Hey there!")) {
          addMessage('assistant', message.message);
        }
      }
    },
    onError: (error: any) => {
      console.error('Conversation error:', error);
      addMessage('system', `❌ Error: ${error.message || 'Unknown error'}`);
    }
  });

  const addMessage = (role: 'user' | 'assistant' | 'system', content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const startConversation = async () => {
    try {
      setIsConnecting(true);
      
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Start conversation
      await conversation.startSession({
        agentId: AGENT_ID,
        connectionType: 'webrtc'
      });
      
      setIsStarted(true);
    } catch (error: any) {
      console.error('Failed to start conversation:', error);
      addMessage('system', `❌ Error: ${error.message || 'Failed to start conversation'}`);
      setIsConnecting(false);
    }
  };

  const endConversation = async () => {
    try {
      await conversation.endSession();
      showSummary();
    } catch (error: any) {
      console.error('Failed to end conversation:', error);
    }
  };

  const showSummary = () => {
    addMessage('system', `
🎉 Great conversation! Here's what I learned:
• Name: ${profileData.firstName || 'Not shared'}
• Location: ${profileData.location || 'Not shared'}
• Occupation: ${profileData.occupation || 'Not shared'}
• Interests: ${profileData.interests?.join(', ') || 'Not shared'}
Thanks for chatting with me!
    `);
  };

  // Update duration
  useEffect(() => {
    if (!startTime) return;
    
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000);
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;
      setDuration(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [startTime]);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatFieldValue = (value: any): string => {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    return value || '-';
  };

  const calculateCompletionScore = (): number => {
    // Total 10 fields to track
    let filledFields = 0;
    const totalFields = 10;
    
    // Check each field
    if (profileData.firstName) filledFields++;
    if (profileData.lastName) filledFields++;
    if (profileData.occupation) filledFields++;
    if (profileData.location) filledFields++;
    if (profileData.interests && profileData.interests.length > 0) filledFields++;
    if (profileData.learningStyle) filledFields++;
    if (profileData.studyTime) filledFields++;
    if (profileData.shortTermGoals && profileData.shortTermGoals.length > 0) filledFields++;
    if (profileData.longTermGoals && profileData.longTermGoals.length > 0) filledFields++;
    if (profileData.overallUserPersona) filledFields++;
    
    // Calculate percentage
    return Math.round((filledFields / totalFields) * 100);
  };

  const calculateCompletionScoreWithNewData = (currentData: ProfileData, newData: any): number => {
    const mergedData = { ...currentData };
    
    // Merge new data
    Object.entries(newData).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        (mergedData as any)[key] = value;
      } else {
        (mergedData as any)[key] = value;
      }
    });
    
    // Calculate score with merged data
    let filledFields = 0;
    const totalFields = 10;
    
    if (mergedData.firstName) filledFields++;
    if (mergedData.lastName) filledFields++;
    if (mergedData.occupation) filledFields++;
    if (mergedData.location) filledFields++;
    if (mergedData.interests && mergedData.interests.length > 0) filledFields++;
    if (mergedData.learningStyle) filledFields++;
    if (mergedData.studyTime) filledFields++;
    if (mergedData.shortTermGoals && mergedData.shortTermGoals.length > 0) filledFields++;
    if (mergedData.longTermGoals && mergedData.longTermGoals.length > 0) filledFields++;
    if (mergedData.overallUserPersona) filledFields++;
    
    return Math.round((filledFields / totalFields) * 100);
  };

  const celebrateMilestone = (percentage: number) => {
    const messages: { [key: number]: string } = {
      30: '🌟 Nice progress! Your profile is 30% complete!',
      50: '🎉 Halfway there! Your profile is 50% complete!',
      70: '🚀 Amazing! Your profile is 70% complete!',
      100: '🎊 CONGRATULATIONS! Your profile is 100% complete! You did it!'
    };
    
    addMessage('system', messages[percentage] || `Great job! ${percentage}% complete!`);
    
    // Extra celebration for 100%
    if (percentage === 100) {
      setShowHearts(true);
      setTimeout(() => setShowHearts(false), 3000);
    }
  };

  const getFieldsRemaining = (): number => {
    let filledFields = 0;
    if (profileData.firstName) filledFields++;
    if (profileData.lastName) filledFields++;
    if (profileData.occupation) filledFields++;
    if (profileData.location) filledFields++;
    if (profileData.interests && profileData.interests.length > 0) filledFields++;
    if (profileData.learningStyle) filledFields++;
    if (profileData.studyTime) filledFields++;
    if (profileData.shortTermGoals && profileData.shortTermGoals.length > 0) filledFields++;
    if (profileData.longTermGoals && profileData.longTermGoals.length > 0) filledFields++;
    if (profileData.overallUserPersona) filledFields++;
    
    return 10 - filledFields;
  };

  const getMissingFields = (): string[] => {
    const missing: string[] = [];
    if (!profileData.firstName) missing.push('First Name');
    if (!profileData.lastName) missing.push('Last Name');
    if (!profileData.occupation) missing.push('Occupation');
    if (!profileData.location) missing.push('Location');
    if (!profileData.interests || profileData.interests.length === 0) missing.push('Interests');
    if (!profileData.learningStyle) missing.push('Learning Style');
    if (!profileData.studyTime) missing.push('Study Time');
    if (!profileData.shortTermGoals || profileData.shortTermGoals.length === 0) missing.push('Short-term Goals');
    if (!profileData.longTermGoals || profileData.longTermGoals.length === 0) missing.push('Long-term Goals');
    if (!profileData.overallUserPersona) missing.push('Persona Summary');
    return missing;
  };

  const completionScore = calculateCompletionScore();

  return (
    <div className="app">
      <div className="container">
        {/* Main Chat Panel */}
        <div className="main-panel">
          <div className="header">
            <div className="header-content">
              <h1>RIATA Onboarding</h1>
              <p>Your AI Learning Companion</p>
            </div>
            {conversation.status === 'connected' && (
              <div className="connection-info">
                <div className={`speaking-indicator ${conversation.isSpeaking ? 'speaking' : 'listening'}`}>
                  <div className="speaking-dot"></div>
                  <span>{conversation.isSpeaking ? 'Speaking' : 'Listening'}</span>
                </div>
                <div className="duration">{duration}</div>
              </div>
            )}
          </div>
          
          <div className="conversation-area">
            <div className="transcript">
              {messages.length === 0 && !isStarted && (
                <div className="welcome-message">
                  <div className="welcome-avatar">
                    <div className="avatar-circle static">
                      <div className="avatar-emoji">😊</div>
                      {showHearts && (
                        <>
                          <div className="heart heart-1">❤️</div>
                          <div className="heart heart-2">💖</div>
                          <div className="heart heart-3">💕</div>
                        </>
                      )}
                    </div>
                  </div>
                  <h2>Ready to meet RIATA?</h2>
                  <p>Your personalized AI learning companion is waiting to get to know you!</p>
                </div>
              )}
              
              {conversation.status === 'connected' && (
                <div className="riata-avatar-container">
                  <div className={`riata-avatar ${conversation.isSpeaking ? 'speaking' : 'listening'}`}>
                    <div className="avatar-circle">
                      <div className="avatar-emoji">{isBlinking ? '😌' : '😊'}</div>
                      {conversation.isSpeaking && (
                        <>
                          <div className="sound-wave wave-1"></div>
                          <div className="sound-wave wave-2"></div>
                          <div className="sound-wave wave-3"></div>
                          <div className="sparkle sparkle-1">✨</div>
                          <div className="sparkle sparkle-2">✨</div>
                          <div className="sparkle sparkle-3">✨</div>
                        </>
                      )}
                      {showHearts && (
                        <>
                          <div className="heart heart-1">❤️</div>
                          <div className="heart heart-2">💖</div>
                          <div className="heart heart-3">💕</div>
                        </>
                      )}
                    </div>
                    <div className="avatar-status">
                      {conversation.isSpeaking ? "I'm sharing something with you! 💬" : "I'm all ears! 👂"}
                    </div>
                  </div>
                </div>
              )}
              
              {messages.map(message => (
                <div key={message.id} className={`message ${message.role}`}>
                  {message.role === 'system' ? (
                    <div className="system-message">{message.content}</div>
                  ) : (
                    <>
                      <div className="message-avatar">
                        {message.role === 'user' ? '👤' : '😊'}
                      </div>
                      <div className="message-content">
                        <div className="message-text">{message.content}</div>
                      </div>
                    </>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="controls">
              {!isStarted ? (
                <button className="call-button" onClick={startConversation}>
                  <div className="call-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" fill="currentColor"/>
                    </svg>
                  </div>
                  <span>Start Call with RIATA</span>
                </button>
              ) : (
                <button className="end-button" onClick={endConversation}>
                  <div className="call-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M10.68 13.31a16 16 0 003.41 2.6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7 2 2 0 011.72 2v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.42 19.42 0 01-3.33-2.67m-2.67-3.34a19.79 19.79 0 01-3.07-8.63A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91M22 2L2 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <span>End Call</span>
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Side Panel */}
        <div className="side-panel">
          {/* Progress Card */}
          <div className={`panel-card ${completionScore === 100 ? 'complete' : ''}`}>
            <div className="card-header">
              <h3>Profile Completion</h3>
              <div className="completion-info">
                <span className="completion-percentage">{completionScore}%</span>
                <span className="fields-remaining">
                  {completionScore === 100 ? '✅ Complete!' : `${getFieldsRemaining()} fields left`}
                </span>
              </div>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${completionScore}%` }}></div>
            </div>
            <div className="stats-grid">
              <div className="stat">
                <div className="stat-value">{profileUpdateCount}</div>
                <div className="stat-label">Updates</div>
              </div>
              <div className="stat">
                <div className="stat-value">{10 - getFieldsRemaining()}/10</div>
                <div className="stat-label">Fields Filled</div>
              </div>
              <div className="stat">
                <div className="stat-value">{messages.filter(m => m.role === 'user').length}</div>
                <div className="stat-label">Messages</div>
              </div>
            </div>
          </div>
          
          {/* Profile Data Card */}
          <div className="panel-card">
            <h3>Extracted Profile</h3>
            <div className="profile-content">
              {Object.keys(profileData).length === 0 ? (
                <p className="empty-state">Share information with RIATA to build your profile</p>
              ) : (
                <div className="profile-fields">
                  {profileData.firstName && (
                    <div className="profile-item">
                      <span className="profile-label">Name</span>
                      <span className="profile-value">{profileData.firstName} {profileData.lastName || ''}</span>
                    </div>
                  )}
                  {profileData.location && (
                    <div className="profile-item">
                      <span className="profile-label">Location</span>
                      <span className="profile-value">{profileData.location}</span>
                    </div>
                  )}
                  {profileData.occupation && (
                    <div className="profile-item">
                      <span className="profile-label">Occupation</span>
                      <span className="profile-value">{profileData.occupation}</span>
                    </div>
                  )}
                  {profileData.interests && profileData.interests.length > 0 && (
                    <div className="profile-item">
                      <span className="profile-label">Interests</span>
                      <div className="profile-tags">
                        {profileData.interests.map((interest, i) => (
                          <span key={i} className="tag">{interest}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {profileData.learningStyle && (
                    <div className="profile-item">
                      <span className="profile-label">Learning Style</span>
                      <span className="profile-value">{profileData.learningStyle}</span>
                    </div>
                  )}
                  {profileData.studyTime && (
                    <div className="profile-item">
                      <span className="profile-label">Study Time</span>
                      <span className="profile-value">{profileData.studyTime}</span>
                    </div>
                  )}
                  {profileData.shortTermGoals && profileData.shortTermGoals.length > 0 && (
                    <div className="profile-item">
                      <span className="profile-label">Short-term Goals</span>
                      <div className="profile-tags">
                        {profileData.shortTermGoals.map((goal, i) => (
                          <span key={i} className="tag">{goal}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {profileData.longTermGoals && profileData.longTermGoals.length > 0 && (
                    <div className="profile-item">
                      <span className="profile-label">Long-term Goals</span>
                      <div className="profile-tags">
                        {profileData.longTermGoals.map((goal, i) => (
                          <span key={i} className="tag">{goal}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {getMissingFields().length > 0 && getMissingFields().length < 10 && (
                <div className="missing-fields">
                  <p className="missing-label">Still to discover:</p>
                  <div className="missing-tags">
                    {getMissingFields().slice(0, 3).map((field, i) => (
                      <span key={i} className="missing-tag">{field}</span>
                    ))}
                    {getMissingFields().length > 3 && (
                      <span className="missing-tag">+{getMissingFields().length - 3} more</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Recent Updates Card */}
          <div className="panel-card">
            <h3>Recent Updates</h3>
            <div className="updates-list">
              {toolCalls.length === 0 ? (
                <p className="empty-state">Tool calls will appear here</p>
              ) : (
                [...toolCalls].slice(-5).reverse().map((call, index) => (
                  <div key={index} className="update-item">
                    <div className="update-time">
                      {call.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="update-content">
                      {Object.keys(call.parameters).join(', ')} updated
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;