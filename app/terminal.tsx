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
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, LinearGradient, Stop, Path } from 'react-native-svg';

import { useCircadian } from '../hooks/use-circadian';
import {
  getBreathTechnique,
  setBreathTechnique,
  type BreathTechnique,
} from '../utils/storage';
import { BASE } from '../constants/palettes';

const GREEN = '#33ff33';
const GREEN_DIM = '#22cc22';
const GREEN_FAINT = '#113311';
const BLACK = '#000000';

const { width: W } = Dimensions.get('window');
const RING_SIZE = Math.min(W * 0.55, 280);

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
  const [showSignal, setShowSignal] = useState(true);
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    getBreathTechnique().then(setTechniqueState);
  }, []);

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
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

  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.container} {...panResponder.panHandlers}>
        {/* sponsor signal overlay */}
        {showSignal && (
          <View style={styles.signalOverlay}>
            <View style={styles.signalHeader}>
              <Text style={styles.signalTitle}>KATALEYA</Text>
              <Text style={styles.signalPhase}>Circadian Phase: {phase}</Text>
            </View>

            <View style={styles.signalCenter}>
              <View style={styles.ringContainer}>
                <Svg width={RING_SIZE} height={RING_SIZE} viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}>
                  <Defs>
                    <LinearGradient id="signalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <Stop offset="0%" stopColor={palette.highlight} stopOpacity="0" />
                      <Stop offset="50%" stopColor={palette.highlight} stopOpacity="1" />
                      <Stop offset="100%" stopColor={palette.highlight} stopOpacity="0" />
                    </LinearGradient>
                  </Defs>
                  {/* base ring */}
                  <Circle
                    cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RING_SIZE * 0.46}
                    fill="none" stroke={palette.shadow} strokeOpacity={0.2} strokeWidth={0.5}
                  />
                  {/* handshake arc */}
                  <Path
                    d={`M ${RING_SIZE/2},${RING_SIZE*0.04} A ${RING_SIZE*0.46},${RING_SIZE*0.46} 0 0 1 ${RING_SIZE*0.96},${RING_SIZE/2}`}
                    fill="none" stroke="url(#signalGrad)" strokeLinecap="round" strokeWidth={1.5}
                  />
                </Svg>

                {/* central orb */}
                <Animated.View style={[styles.signalOrb, { opacity: pulseOpacity }]}>
                  <View style={[styles.signalOrbHaze, { backgroundColor: `${palette.highlight}0d` }]} />
                  <View style={[styles.signalOrbBody, { backgroundColor: `${palette.shadow}4d`, borderColor: `${palette.accent}33` }]} />
                  <View style={[styles.signalOrbCore, { backgroundColor: palette.rim }]} />
                </Animated.View>

                {/* signal label */}
                <View style={styles.signalLabel}>
                  <Text style={[styles.signalLabelMain, { color: palette.highlight }]}>Sponsor Signal</Text>
                  <Text style={[styles.signalLabelSub, { color: `${palette.rgb}66` }]}>X25519 HANDSHAKE ACTIVE</Text>
                </View>
              </View>

              {/* atmospheric message */}
              <Text style={[styles.signalMessage, { color: `${palette.highlight}33` }]}>
                stay with me.
              </Text>
            </View>

            <View style={styles.signalFooter}>
              <TouchableOpacity onPress={() => setShowSignal(false)} style={styles.signalBtn}>
                <Text style={[styles.signalBtnText, { color: palette.accent }]}>access terminal</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.back()} style={styles.signalBtn}>
                <Text style={[styles.signalBtnText, { color: palette.accent }]}>close</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* terminal content */}
        {!showSignal && (
          <>
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
              <Text style={styles.out}>  milestone 3 : ✓ bridge check-in</Text>
              <Text style={styles.out}>  milestone 4 : ✓ cover rain</Text>
              <Text style={styles.out}>  milestone 5 : · vaults</Text>
              <Text style={styles.out}>  milestone 6 : · physician mirror</Text>

              <View style={styles.divider} />

              <Text style={styles.blink}>█</Text>

              <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
                <Text style={styles.closeText}>$ exit</Text>
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.terminalFooter}>
              <TouchableOpacity onPress={() => setShowSignal(true)} style={styles.terminalFooterBtn}>
                <Text style={[styles.terminalFooterText, { color: GREEN_DIM }]}>◉ signal</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/mirror')} style={styles.terminalFooterBtn}>
                <Text style={[styles.terminalFooterText, { color: GREEN_DIM }]}>◉ mirror</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.back()} style={styles.terminalFooterBtn}>
                <Text style={[styles.terminalFooterText, { color: GREEN_DIM }]}>◉ close</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BLACK,
  },
  scroll: {
    paddingTop: 56,
    paddingHorizontal: 20,
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
  techniqueActive: {
    fontFamily: 'Courier Prime',
    fontSize: 11,
    color: GREEN,
    letterSpacing: 0.3,
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
  terminalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: GREEN_FAINT,
  },
  terminalFooterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  terminalFooterText: {
    fontFamily: 'Courier Prime',
    fontSize: 10,
    letterSpacing: 1,
  },
  // sponsor signal styles
  signalOverlay: {
    flex: 1,
    backgroundColor: BASE.bg,
    alignItems: 'center',
  },
  signalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  signalTitle: {
    fontFamily: 'Courier Prime',
    fontSize: 14,
    color: '#d4a574',
    letterSpacing: 4,
  },
  signalPhase: {
    fontFamily: 'Courier Prime',
    fontSize: 9,
    color: '#8a8a9e',
    letterSpacing: 1,
  },
  signalCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  ringContainer: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signalOrb: {
    position: 'absolute',
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signalOrbHaze: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    transform: [{ scale: 1.5 }],
  },
  signalOrbBody: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
  },
  signalOrbCore: {
    width: 16,
    height: 16,
    borderRadius: 8,
    shadowColor: '#d8e4f8',
    shadowRadius: 20,
    shadowOpacity: 0.8,
  },
  signalLabel: {
    position: 'absolute',
    bottom: -56,
    alignItems: 'center',
    gap: 4,
  },
  signalLabelMain: {
    fontFamily: 'Courier Prime',
    fontSize: 11,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  signalLabelSub: {
    fontFamily: 'Courier Prime',
    fontSize: 8,
    letterSpacing: 1,
  },
  signalMessage: {
    fontFamily: 'Courier Prime',
    fontSize: 28,
    letterSpacing: 8,
    marginTop: 80,
  },
  signalFooter: {
    flexDirection: 'row',
    gap: 24,
    paddingBottom: 48,
  },
  signalBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#1c1c28',
    borderRadius: 20,
  },
  signalBtnText: {
    fontFamily: 'Courier Prime',
    fontSize: 9,
    letterSpacing: 2,
    textTransform: 'lowercase',
  },
});
