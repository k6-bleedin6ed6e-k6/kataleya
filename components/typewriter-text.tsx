// components/typewriter-text.tsx
// character-by-character phrase reveal with jitter

import React, { useState, useEffect, useRef } from 'react';
import { Text, StyleSheet } from 'react-native';

interface TypewriterTextProps {
  text: string;
  color?: string;
  speed?: number;
  onComplete?: () => void;
}

export function TypewriterText({
  text,
  color = '#e8e6f0',
  speed = 42,
  onComplete,
}: TypewriterTextProps) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    indexRef.current = 0;
    setDisplayed('');
    setDone(false);

    const tick = () => {
      if (indexRef.current >= text.length) {
        setDone(true);
        onComplete?.();
        return;
      }
      const char = text[indexRef.current];
      indexRef.current += 1;
      setDisplayed((prev) => prev + char);

      // Jitter: punctuation pauses longer
      const isPunctuation = /[.!?,:;]/.test(char);
      const delay = isPunctuation ? speed * 4 : speed + Math.random() * 18;
      timeoutRef.current = setTimeout(tick, delay);
    };

    const timeoutRef = { current: setTimeout(tick, speed * 2) };
    return () => clearTimeout(timeoutRef.current);
  }, [text, speed, onComplete]);

  return (
    <Text style={[styles.text, { color }]}>
      {displayed}
      {!done && <Text style={styles.cursor}>|</Text>}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontFamily: 'Courier Prime',
    fontSize: 15,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  cursor: {
    opacity: 0.5,
  },
});
