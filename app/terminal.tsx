// app/terminal.tsx
// phosphor noir engine room — the terminal IS the terminal.
// sponsor signal is a separate overlay, not a replacement.
// swipe right or tap exit to return.

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
  clearSurfaceVault,
  type BreathTechnique,
} from '../utils/storage';

const GREEN = '#33ff33';
const GREEN_DIM = '#22cc22';
const GREEN_FAINT = '#113311';
const BLACK = '#000000';
const CYAN = '#a8bcd4';
const CYAN_DIM = '#8090b0';

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
  const [showSignal, setShowSignal] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    getBreathTechnique().then(setTechniqueState);
  }, []);

  // cursor blink
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);
    return () => clearInterval(interval);
  }, []);

  // sponsor signal pulse
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

  async function handleOnboardingReset() {
    await clearSurfaceVault();
    router.replace('/onboarding');
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
        {/* phase bridge — subtle top glow */}
        <View style={[styles.phaseBridge, { borderTopColor: `${palette.accent}30` }]} />

        {/* ── PHOSPHOR NOIR TERMINAL (always rendered) ── */}
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* boot header */}
          <Text style={styles.boot}>KATALEYA OS v1.0.4</Text>
          <Text style={styles.origin}>// origin: thinkBad-doGood-sa.my</Text>
          <View style={styles.divider} />

          {/* status section */}
          <View style={styles.section}>
            <View style={styles.cmdRow}>
              <Text style={styles.prompt}>$</Text>
              <Text style={styles.cmd}>status --circadian</Text>
            </View>
            <View style={styles.outBlock}>
              <Text style={styles.out}>  phase       : {phase}</Text>
              <Text style={styles.out}>  accent      : {palette.accent}</Text>
              <Text style={styles.out}>  existential : {palette.existential}</Text>
              <Text style={styles.out}>  time        : {ts}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* vault section */}
          <View style={styles.section}>
            <View style={styles.cmdRow}>
              <Text style={styles.prompt}>$</Text>
              <Text style={styles.cmd}>vault --status</Text>
            </View>
            <View style={styles.outBlock}>
              <Text style={styles.out}>  surface     : initialised</Text>
              <Text style={styles.out}>  sanctuary   : pending (milestone 3)</Text>
              <Text style={styles.out}>  fortress    : pending (milestone 5)</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* breath section */}
          <View style={styles.section}>
            <View style={styles.cmdRow}>
              <Text style={styles.prompt}>$</Text>
              <Text style={styles.cmd}>breath --technique</Text>
            </View>
            <TouchableOpacity
              onPress={cycleTechnique}
              style={styles.techniqueRow}
              activeOpacity={0.6}
            >
              <Text style={styles.techniqueMarker}>{'>'}</Text>
              <Text style={styles.techniqueActive}>{TECHNIQUE_LABEL[technique]}</Text>
            </TouchableOpacity>
            <Text style={styles.hint}>  tap to cycle</Text>
          </View>

          <View style={styles.divider} />

          {/* build section */}
          <View style={styles.section}>
            <View style={styles.cmdRow}>
              <Text style={styles.prompt}>$</Text>
              <Text style={styles.cmd}>build --status</Text>
            </View>
            <View style={styles.outBlock}>
              <Text style={styles.out}>  milestone 0 : ✓ seed</Text>
              <Text style={styles.out}>  milestone 1 : ✓ gestures</Text>
              <Text style={styles.out}>  milestone 2 : ✓ engine room</Text>
              <Text style={styles.out}>  milestone 3 : ✓ bridge check-in</Text>
              <Text style={styles.out}>  milestone 4 : ✓ cover rain</Text>
              <Text style={styles.out}>  milestone 5 : · vaults</Text>
              <Text style={styles.out}>  milestone 6 : · physician mirror</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* navigation commands */}
          <View style={styles.section}>
            <View style={styles.cmdRow}>
              <Text style={styles.prompt}>$</Text>
              <Text style={styles.cmd}>nav --available</Text>
            </View>
            <View style={styles.outBlock}>
              {/* safe nav */}
              <TouchableOpacity onPress={() => router.push('/mirror')} style={styles.navRow}>
                <Text style={styles.out}>  /mirror     </Text>
                <Text style={styles.outAccent}>physician mirror</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/scars')} style={styles.navRow}>
                <Text style={styles.out}>  /scars      </Text>
                <Text style={styles.outAccent}>biometric scars</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/vault')} style={styles.navRow}>
                <Text style={styles.out}>  /vault      </Text>
                <Text style={styles.outAccent}>journal vault</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/settings')} style={styles.navRow}>
                <Text style={styles.out}>  /settings   </Text>
                <Text style={styles.outAccent}>system configuration</Text>
              </TouchableOpacity>

              <View style={styles.navDivider} />

              {/* caution */}
              <TouchableOpacity onPress={() => setShowSignal(true)} style={styles.navRow}>
                <Text style={styles.out}>  /signal     </Text>
                <Text style={styles.outCaution}>sponsor signal</Text>
              </TouchableOpacity>

              <View style={styles.navDivider} />

              {/* danger */}
              <TouchableOpacity onPress={handleOnboardingReset} style={styles.navRow}>
                <Text style={styles.out}>  /reset      </Text>
                <Text style={styles.outDanger}>onboarding --reset</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.divider} />

          {/* blinking cursor */}
          <Text style={[styles.cursor, { opacity: showCursor ? 0.85 : 0 }]}>█</Text>

          {/* exit */}
          <TouchableOpacity onPress={() => router.back()} style={styles.exitBtn}>
            <Text style={styles.exitText}>$ exit</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* terminal footer nav */}
        <View style={styles.terminalFooter}>
          <TouchableOpacity onPress={() => router.push('/vault')} style={styles.terminalFooterBtn}>
            <Text style={styles.terminalFooterText}>vault</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/scars')} style={styles.terminalFooterBtn}>
            <Text style={styles.terminalFooterText}>scars</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/mirror')} style={styles.terminalFooterBtn}>
            <Text style={styles.terminalFooterText}>mirror</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/settings')} style={styles.terminalFooterBtn}>
            <Text style={styles.terminalFooterText}>config</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()} style={styles.terminalFooterBtn}>
            <Text style={styles.terminalFooterText}>close</Text>
          </TouchableOpacity>
        </View>

        {/* ── SPONSOR SIGNAL OVERLAY (modal) ── */}
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
    paddingTop: 48,
    paddingHorizontal: 22,
    paddingBottom: 48,
  },

  // ── typography ──
  boot: {
    fontFamily: 'Courier Prime',
    fontSize: 14,
    color: GREEN,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  origin: {
    fontFamily: 'Courier Prime',
    fontSize: 12,
    color: CYAN_DIM,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: GREEN_FAINT,
    marginVertical: 16,
    opacity: 0.6,
  },

  // ── command sections ──
  section: {
    marginBottom: 4,
  },
  cmdRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 8,
  },
  prompt: {
    fontFamily: 'Courier Prime',
    fontSize: 13,
    color: CYAN_DIM,
    opacity: 0.55,
    width: 14,
  },
  cmd: {
    fontFamily: 'Courier Prime',
    fontSize: 13,
    color: GREEN,
    letterSpacing: 0.3,
  },
  outBlock: {
    marginTop: 2,
  },
  out: {
    fontFamily: 'Courier Prime',
    fontSize: 12,
    color: GREEN_DIM,
    opacity: 0.85,
    marginLeft: 4,
    marginBottom: 3,
    letterSpacing: 0.3,
    lineHeight: 18,
  },
  outAccent: {
    fontFamily: 'Courier Prime',
    fontSize: 12,
    color: CYAN,
    opacity: 0.75,
    letterSpacing: 0.3,
    lineHeight: 18,
  },
  hint: {
    fontFamily: 'Courier Prime',
    fontSize: 11,
    color: GREEN_DIM,
    opacity: 0.5,
    marginLeft: 4,
    marginTop: 4,
    letterSpacing: 0.3,
  },

  // ── interactive rows ──
  techniqueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingLeft: 4,
  },
  techniqueMarker: {
    fontFamily: 'Courier Prime',
    fontSize: 12,
    color: GREEN_DIM,
    width: 16,
    opacity: 0.6,
  },
  techniqueActive: {
    fontFamily: 'Courier Prime',
    fontSize: 12,
    color: GREEN,
    letterSpacing: 0.3,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
  },

  // ── cursor & exit ──
  cursor: {
    fontFamily: 'Courier Prime',
    fontSize: 14,
    color: GREEN,
    marginTop: 8,
    marginBottom: 4,
  },
  exitBtn: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 4,
    alignSelf: 'flex-start',
  },
  exitText: {
    fontFamily: 'Courier Prime',
    fontSize: 13,
    color: GREEN,
    letterSpacing: 0.5,
  },

  // ── footer ──
  terminalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: GREEN_FAINT,
    backgroundColor: BLACK,
  },
  terminalFooterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  terminalFooterText: {
    fontFamily: 'Courier Prime',
    fontSize: 12,
    color: GREEN_DIM,
    letterSpacing: 1.2,
  },

  // phase bridge
  phaseBridge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    borderTopWidth: 1,
    zIndex: 50,
    pointerEvents: 'none',
  },

  // nav hierarchy
  navDivider: {
    height: 1,
    backgroundColor: GREEN_FAINT,
    marginVertical: 8,
    opacity: 0.4,
  },
  outCaution: {
    fontFamily: 'Courier Prime',
    fontSize: 12,
    color: '#ccaa22',
    opacity: 0.85,
    letterSpacing: 0.3,
    lineHeight: 18,
  },
  outDanger: {
    fontFamily: 'Courier Prime',
    fontSize: 12,
    color: '#cc4444',
    opacity: 0.85,
    letterSpacing: 0.3,
    lineHeight: 18,
  },

  // ── sponsor signal overlay ──
  signalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#050508',
    alignItems: 'center',
    zIndex: 100,
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
    fontSize: 11,
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
    fontSize: 9,
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
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'lowercase',
  },
});
