// app/terminal.tsx
// long-press on orb — phosphor noir engine room
// swipe right or tap close to return

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  PanResponder,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';

import { useCircadian } from '../hooks/use-circadian';
import {
  getBreathTechnique,
  setBreathTechnique,
  type BreathTechnique,
} from '../utils/storage';

const GREEN = '#33ff33';
const GREEN_DIM = '#22cc22';
const GREEN_FAINT = '#113311';
const BLACK = '#000000';

const TECHNIQUES: BreathTechnique[] = ['resonant', '4-7-8', 'box'];

const TECHNIQUE_LABEL: Record<BreathTechnique, string> = {
  resonant: 'resonant    // 11s · 5.5/5.5',
  '4-7-8':  '4-7-8       // 19s · 4/7/8',
  box:      'box         // 16s · 4/4/4/4',
};

export default function TerminalScreen() {
  const router = useRouter();
  const { phase, palette, hour, minute } = useCircadian();
  const [technique, setTechniqueState] = useState<BreathTechnique>('resonant');

  useEffect(() => {
    getBreathTechnique().then(setTechniqueState);
  }, []);

  async function cycleTechnique() {
    const next = TECHNIQUES[(TECHNIQUES.indexOf(technique) + 1) % TECHNIQUES.length];
    setTechniqueState(next);
    await setBreathTechnique(next);
  }

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, { dx, dy }) =>
        Math.abs(dx) > 12 || Math.abs(dy) > 12,
      onPanResponderRelease: (_, { dx, dy }) => {
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);
        if (absDx > 60 && absDx > absDy * 1.5 && dx > 0) {
          router.back();
        }
      },
    })
  ).current;

  const ts = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.boot}>KATALEYA OS v1.0.4</Text>
        <Text style={styles.origin}>// origin: thinkBad-doGood-sa.my</Text>
        <View style={styles.divider} />

        <Text style={styles.cmd}>$ status --circadian</Text>
        <Text style={styles.out}>  phase       : {phase}</Text>
        <Text style={styles.out}>  accent      : {palette.accent}</Text>
        <Text style={styles.out}>  existential : {palette.existential}</Text>
        <Text style={styles.out}>  time        : {ts}</Text>

        <View style={styles.divider} />

        <Text style={styles.cmd}>$ vault --status</Text>
        <Text style={styles.out}>  surface     : initialised</Text>
        <Text style={styles.out}>  sanctuary   : pending (milestone 3)</Text>
        <Text style={styles.out}>  fortress    : pending (milestone 5)</Text>

        <View style={styles.divider} />

        <Text style={styles.cmd}>$ breath --technique</Text>
        <TouchableOpacity
          onPress={cycleTechnique}
          style={styles.techniqueRow}
          activeOpacity={0.6}
        >
          <Text style={styles.techniqueMarker}>{'>'}</Text>
          <Text style={styles.techniqueActive}>{TECHNIQUE_LABEL[technique]}</Text>
        </TouchableOpacity>
        <Text style={styles.out}>  tap to cycle</Text>

        <View style={styles.divider} />

        <Text style={styles.cmd}>$ build --status</Text>
        <Text style={styles.out}>  milestone 0 : ✓ seed</Text>
        <Text style={styles.out}>  milestone 1 : ✓ gestures</Text>
        <Text style={styles.out}>  milestone 2 : ✓ engine room</Text>
        <Text style={styles.out}>  milestone 3 : · bridge check-in</Text>
        <Text style={styles.out}>  milestone 4 : · cover rain</Text>
        <Text style={styles.out}>  milestone 5 : · vaults</Text>
        <Text style={styles.out}>  milestone 6 : · physician mirror</Text>

        <View style={styles.divider} />

        <Text style={styles.blink}>█</Text>

        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Text style={styles.closeText}>$ exit</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BLACK,
    paddingTop: 56,
    paddingHorizontal: 20,
  },
  scroll: {
    paddingBottom: 48,
  },
  boot: {
    fontFamily: 'Courier Prime',
    fontSize: 13,
    color: GREEN,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  origin: {
    fontFamily: 'Courier Prime',
    fontSize: 9,
    color: GREEN,
    opacity: 0.55,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: GREEN_FAINT,
    marginVertical: 14,
    opacity: 0.6,
  },
  cmd: {
    fontFamily: 'Courier Prime',
    fontSize: 12,
    color: GREEN,
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  out: {
    fontFamily: 'Courier Prime',
    fontSize: 11,
    color: GREEN_DIM,
    opacity: 0.8,
    marginLeft: 4,
    marginBottom: 2,
    letterSpacing: 0.3,
  },
  techniqueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingLeft: 4,
  },
  techniqueMarker: {
    fontFamily: 'Courier Prime',
    fontSize: 11,
    color: GREEN_DIM,
    width: 14,
    opacity: 0.6,
  },
  techniqueLabel: {
    fontFamily: 'Courier Prime',
    fontSize: 11,
    color: GREEN_DIM,
    opacity: 0.7,
    width: 88,
    letterSpacing: 0.3,
  },
  techniqueDetail: {
    fontFamily: 'Courier Prime',
    fontSize: 10,
    color: GREEN_DIM,
    opacity: 0.45,
    letterSpacing: 0.2,
  },
  techniqueActive: {
    color: GREEN,
    opacity: 1,
  },
  blink: {
    fontFamily: 'Courier Prime',
    fontSize: 13,
    color: GREEN,
    opacity: 0.7,
    marginTop: 8,
  },
  closeBtn: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 4,
    alignSelf: 'flex-start',
  },
  closeText: {
    fontFamily: 'Courier Prime',
    fontSize: 12,
    color: GREEN,
    letterSpacing: 0.5,
  },
});
