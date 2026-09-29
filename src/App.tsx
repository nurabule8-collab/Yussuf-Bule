/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Header } from './components/Header';
import { HomeScreen } from './components/HomeScreen';
import { ChatTab } from './components/ChatTab';
import { NureinBusinessTab } from './components/NureinBusinessTab';
import { DesignSuiteTab } from './components/DesignSuiteTab';
import { VisionDocTab } from './components/VisionDocTab';
import { VoiceAssistantTab } from './components/VoiceAssistantTab';
import { CalculatorTab } from './components/CalculatorTab';
import { TutorTab } from './components/TutorTab';
import { RoadmapTab } from './components/RoadmapTab';
import { voiceManager } from './utils/speech';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [liteMode, setLiteMode] = useState<boolean>(() => {
    return localStorage.getItem('nurein_lite_mode') === 'true';
  });
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(false);
  const [appLanguage, setAppLanguage] = useState<string>('English');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Transient state passed when launching features from home
  const [featurePrompt, setFeaturePrompt] = useState<string>('');
  const [attachedMedia, setAttachedMedia] = useState<{ data: string; mimeType: string } | undefined>(undefined);

  useEffect(() => {
    localStorage.setItem('nurein_lite_mode', String(liteMode));
    if (liteMode) {
      document.documentElement.classList.add('lite-mode');
    } else {
      document.documentElement.classList.remove('lite-mode');
    }
  }, [liteMode]);

  const handleSpeak = (text: string, lang = 'en-US') => {
    setIsSpeaking(true);
    voiceManager.speakText(
      text,
      lang,
      () => setIsSpeaking(false),
      () => setIsSpeaking(false)
    );
  };

  const handleStopSpeaking = () => {
    voiceManager.stopSpeaking();
    setIsSpeaking(false);
  };

  const handleSelectFeatureFromHome = (
    tab: string,
    initialPrompt?: string,
    media?: { data: string; mimeType: string }
  ) => {
    if (initialPrompt) setFeaturePrompt(initialPrompt);
    if (media) setAttachedMedia(media);
    setActiveTab(tab);
  };

  return (
    <div className={`min-h-screen flex flex-col bg-slate-950 text-slate-100 ${liteMode ? 'lite-mode' : ''}`}>
      {/* Universal Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setFeaturePrompt('');
          setAttachedMedia(undefined);
          setActiveTab(tab);
        }}
        liteMode={liteMode}
        setLiteMode={setLiteMode}
        voiceEnabled={voiceEnabled}
        setVoiceEnabled={setVoiceEnabled}
        appLanguage={appLanguage}
        setAppLanguage={setAppLanguage}
        isSpeaking={isSpeaking}
        stopSpeaking={handleStopSpeaking}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={liteMode ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={liteMode ? undefined : { opacity: 0, y: -8 }}
            transition={liteMode ? { duration: 0 } : { duration: 0.2, ease: 'easeOut' }}
          >
            {activeTab === 'home' && (
              <HomeScreen
                onSelectFeature={handleSelectFeatureFromHome}
                appLanguage={appLanguage}
                setAppLanguage={setAppLanguage}
                onVoicePrompt={(prompt) => {
                  setFeaturePrompt(prompt);
                  setActiveTab('chat');
                }}
                liteMode={liteMode}
                setLiteMode={setLiteMode}
              />
            )}

            {activeTab === 'chat' && (
              <ChatTab
                initialPrompt={featurePrompt}
                appLanguage={appLanguage}
                liteMode={liteMode}
                onSpeak={handleSpeak}
                isSpeaking={isSpeaking}
              />
            )}

            {activeTab === 'business' && (
              <NureinBusinessTab
                initialPrompt={featurePrompt}
                onNavigateToDesign={() => setActiveTab('design')}
              />
            )}

            {activeTab === 'design' && <DesignSuiteTab />}

            {activeTab === 'vision' && (
              <VisionDocTab
                initialMedia={attachedMedia}
                initialMode="inspect"
                onSpeak={handleSpeak}
              />
            )}

            {activeTab === 'doc' && (
              <VisionDocTab
                initialMedia={attachedMedia}
                initialMode="document"
                onSpeak={handleSpeak}
              />
            )}

            {activeTab === 'voice' && (
              <VoiceAssistantTab
                appLanguage={appLanguage}
                onSpeak={handleSpeak}
                isSpeaking={isSpeaking}
                stopSpeaking={handleStopSpeaking}
              />
            )}

            {activeTab === 'calculator' && (
              <CalculatorTab
                onSendToQuote={(quotePrompt) => {
                  setFeaturePrompt(quotePrompt);
                  setActiveTab('business');
                }}
              />
            )}

            {activeTab === 'tutor' && (
              <TutorTab
                liteMode={liteMode}
                onSpeak={handleSpeak}
                isSpeaking={isSpeaking}
              />
            )}

            {activeTab === 'roadmap' && <RoadmapTab />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Simple, quiet footer */}
      <footer className="no-print border-t border-slate-900 bg-slate-950/80 text-slate-500 text-xs py-5">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">Nurein AI</span>
            <span>·</span>
            <span className="italic">“Help first. Money should never be the reason someone can't get basic assistance.”</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setActiveTab('roadmap')}
              className="hover:text-emerald-400 transition-colors"
            >
              Technology Roadmap & Business Model
            </button>
            <span>·</span>
            <button
              onClick={() => setLiteMode(!liteMode)}
              className="hover:text-emerald-400 transition-colors"
            >
              {liteMode ? 'Exit Lite Mode' : '2G/3G Lite Mode'}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
