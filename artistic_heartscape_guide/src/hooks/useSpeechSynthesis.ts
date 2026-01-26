import { useState, useEffect, useCallback, useRef } from 'react';

interface UseSpeechSynthesisReturn {
  isReading: boolean;
  selectedVoice: SpeechSynthesisVoice | null;
  speak: (text: string) => void;
  stop: () => void;
  toggle: (text: string) => void;
}

export function useSpeechSynthesis(): UseSpeechSynthesisReturn {
  const [isReading, setIsReading] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // OSに応じて音声を選択
  useEffect(() => {
    const selectVoiceByOS = () => {
      const voices = window.speechSynthesis.getVoices();
      const japaneseVoices = voices.filter(v => v.lang.startsWith('ja'));

      // OS検出
      const userAgent = navigator.userAgent.toLowerCase();
      const platform = navigator.platform.toLowerCase();
      const isMac = platform.includes('mac') || userAgent.includes('mac');
      const isWindows = platform.includes('win') || userAgent.includes('windows');

      let targetVoiceName = '';
      if (isMac) {
        targetVoiceName = 'Kyoko';
      } else if (isWindows) {
        targetVoiceName = 'Microsoft Haruka';
      }

      // 指定された音声を探す
      let selected = japaneseVoices.find(v => v.name.includes(targetVoiceName));

      // 見つからない場合は、日本語のデフォルト音声を探す
      if (!selected && japaneseVoices.length > 0) {
        selected = japaneseVoices.find(v => v.default) || japaneseVoices[0];
      }

      if (selected) {
        setSelectedVoice(selected);
      }
    };

    // 初回読み込み
    selectVoiceByOS();

    // 音声リストが非同期で読み込まれる場合
    window.speechSynthesis.onvoiceschanged = selectVoiceByOS;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // コンポーネントアンマウント時に読み上げを停止
  useEffect(() => {
    return () => {
      if (utteranceRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // 読み上げ開始
  const speak = useCallback(
    (text: string) => {
      if (!text || text.trim() === '') return;

      // 既存の読み上げを停止
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onend = () => {
        setIsReading(false);
        utteranceRef.current = null;
      };

      utterance.onerror = (error) => {
        console.error('Speech synthesis error:', error);
        setIsReading(false);
        utteranceRef.current = null;
      };

      window.speechSynthesis.speak(utterance);
      setIsReading(true);
      utteranceRef.current = utterance;
    },
    [selectedVoice]
  );

  // 読み上げ停止
  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsReading(false);
    utteranceRef.current = null;
  }, []);

  // トグル（読み上げ中なら停止、停止中なら開始）
  const toggle = useCallback(
    (text: string) => {
      if (isReading) {
        stop();
      } else {
        speak(text);
      }
    },
    [isReading, speak, stop]
  );

  return {
    isReading,
    selectedVoice,
    speak,
    stop,
    toggle,
  };
}
