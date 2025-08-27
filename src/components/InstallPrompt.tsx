import React, { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Detectar iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Detectar se já está instalado (standalone)
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);

    // Listener para o evento beforeinstallprompt (Android/Desktop)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Mostrar prompt após 30 segundos se não estiver instalado
      setTimeout(() => {
        if (!standalone) {
          setShowPrompt(true);
        }
      }, 30000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Para iOS, mostrar instruções após 45 segundos
    if (iOS && !standalone) {
      setTimeout(() => {
        setShowPrompt(true);
      }, 45000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowPrompt(false);
      }
    }
  };

  const handleClose = () => {
    setShowPrompt(false);
    // Não mostrar novamente por 24 horas
    localStorage.setItem('installPromptDismissed', new Date().getTime().toString());
  };

  // Não mostrar se já está instalado ou se foi dispensado recentemente
  const dismissedTime = localStorage.getItem('installPromptDismissed');
  if (isStandalone || (dismissedTime && Date.now() - parseInt(dismissedTime) < 24 * 60 * 60 * 1000)) {
    return null;
  }

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50 slide-up">
      <div className="glass-card bg-gradient-to-br from-blue-600/95 to-indigo-600/95 backdrop-blur-lg p-6 text-white border border-white/20">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mr-3">
              <Smartphone className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">📱 Instalar StudyFlow</h3>
              <p className="text-white/80 text-sm">Acesso rápido na tela inicial</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg hover:bg-white/20 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isIOS ? (
          <div className="space-y-3">
            <p className="text-white/90 text-sm leading-relaxed">
              Para instalar no iPhone:
            </p>
            <ol className="text-white/80 text-sm space-y-2">
              <li className="flex items-center">
                <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold mr-3">1</span>
                Toque no botão "Compartilhar" ⬆️
              </li>
              <li className="flex items-center">
                <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold mr-3">2</span>
                Selecione "Adicionar à Tela de Início" 📱
              </li>
              <li className="flex items-center">
                <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold mr-3">3</span>
                Confirme tocando em "Adicionar" ✅
              </li>
            </ol>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-white/90 text-sm leading-relaxed">
              Instale o StudyFlow para acesso rápido e experiência melhorada!
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleInstall}
                className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-3 text-white font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center"
              >
                <Download className="h-5 w-5 mr-2" />
                Instalar App
              </button>
              <button
                onClick={handleClose}
                className="px-4 py-3 text-white/80 hover:text-white transition-colors"
              >
                Depois
              </button>
            </div>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-white/20">
          <div className="flex items-center justify-center space-x-4 text-white/60 text-xs">
            <span>✨ Sem anúncios</span>
            <span>🚀 Mais rápido</span>
            <span>📱 Offline</span>
          </div>
        </div>
      </div>
    </div>
  );
}
