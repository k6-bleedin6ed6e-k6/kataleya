// app/scars.tsx
// biometric scars — a timeline of difficult moments from mood/urge logs.
// no fake metrics. real data from sanctuary.

import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  Animated,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg'

import { useCircadian } from '../hooks/use-circadian'
import {
  getAllMoodLogs,
  getAllUrgeLogs,
  type MoodLog,
  type UrgeLog,
} from '../utils/sanctuary'
import { timeAgoTerminal, moodLabel, moodColor as moodColorOf } from '../utils/insights'

const GREEN = '#33ff33'
const GREEN_DIM = '#22cc22'
const GREEN_FAINT = '#113311'
const BLACK = '#000000'

const timeAgo = timeAgoTerminal
const moodColor = (v: number): string => moodColorOf(v, GREEN)

type ScarItem =
  | { type: 'mood'; data: MoodLog }
  | { type: 'urge'; data: UrgeLog }

export default function ScarsScreen() {
  const router = useRouter()
  const { phase } = useCircadian()
  const [scars, setScars] = useState<ScarItem[]>([])
  const [showCursor, setShowCursor] = useState(true)
  const baseAnim = useRef(new Animated.Value(0)).current

  const loadData = useCallback(() => {
    const moods = getAllMoodLogs(20)
    const urges = getAllUrgeLogs(20)
    const combined: ScarItem[] = [
      ...moods.map((m) => ({ type: 'mood' as const, data: m })),
      ...urges.map((u) => ({ type: 'urge' as const, data: u })),
    ]
    combined.sort((a, b) => b.data.logged_at - a.data.logged_at)
    setScars(combined)

    baseAnim.setValue(0)
    Animated.timing(baseAnim, {
      toValue: 1,
      duration: 1200 + combined.length * 60,
      useNativeDriver: true,
    }).start()
  }, [baseAnim])

  useEffect(() => {
    loadData()
  }, [loadData])

  // cursor blink
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor((prev) => !prev)
    }, 530)
    return () => clearInterval(interval)
  }, [])

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 10 || Math.abs(g.dx) > 10,
      onPanResponderRelease: (_, g) => {
        const absDx = Math.abs(g.dx)
        const absDy = Math.abs(g.dy)
        if (absDx > 60 && absDx > absDy * 1.5 && g.dx > 0) {
          router.back()
        }
      },
    })
  ).current

  const scarCount = scars.filter((s) => {
    if (s.type === 'mood') return s.data.mood_value <= 2
    return s.type === 'urge'
  }).length

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.content} {...pan.panHandlers}>
        {/* header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>[ SCARS ]</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* system boot */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>[ SYSTEM BOOT ]</Text>
            <View style={styles.bootBox}>
              <View style={styles.bootRow}>
                <Text style={styles.bootKey}>init_sequence:</Text>
                <Text style={styles.bootVal}>complete</Text>
              </View>
              <View style={styles.bootRow}>
                <Text style={styles.bootKey}>bio_sync:</Text>
                <Text style={[styles.bootVal, styles.pulse]}>active</Text>
              </View>
              <View style={styles.bootRow}>
                <Text style={styles.bootKey}>scars_detected:</Text>
                <Text style={styles.bootVal}>{scarCount}</Text>
              </View>
            </View>
          </View>

          {/* biometric scars */}
          <View style={styles.section}>
            <View style={styles.sectionLabelRow}>
              <Text style={styles.sectionLabel}>[ BIOMETRIC SCARS ]</Text>
              <Text style={styles.sectionLabel}>[ {scarCount}_detected ]</Text>
            </View>

            {scars.length === 0 && (
              <Text style={styles.empty}>no scars recorded. the garden is quiet.</Text>
            )}

            {scars.map((scar, i) => {
              const isMood = scar.type === 'mood'
              const label = isMood
                ? `mood_${moodLabel(scar.data.mood_value)}`
                : `urge_intensity_${scar.data.intensity}`
              const color = isMood ? moodColor(scar.data.mood_value) : '#ff6644'
              const time = timeAgo(scar.data.logged_at)

              return (
                <Animated.View
                  key={`${scar.type}-${scar.data.id}`}
                  style={[
                    styles.scarRow,
                    {
                      opacity: baseAnim.interpolate({
                        inputRange: [i * 0.05, i * 0.05 + 0.15, 1],
                        outputRange: [0, 1, 1],
                        extrapolate: 'clamp',
                      }),
                    },
                  ]}
                >
                  {/* timeline dot */}
                  <View style={styles.scarDot}>
                    <View style={[styles.scarDotInner, { borderColor: color }]} />
                  </View>

                  <View style={styles.scarContent}>
                    <View style={styles.scarHeader}>
                      <Text style={[styles.scarLabel, { color }]}>{`> ${label}`}</Text>
                      <Text style={styles.scarTime}>{time}</Text>
                    </View>

                    {/* waveform */}
                    <View style={styles.waveform}>
                      <Svg width="100%" height={32} viewBox="0 0 100 32" preserveAspectRatio="none">
                        <Path
                          d={isMood
                            ? `M0,16 Q10,${scar.data.mood_value * 3} 20,16 T40,16 T60,16 T80,16 T100,16`
                            : 'M0,16 L20,16 L25,6 L30,26 L35,16 L100,16'}
                          fill="none"
                          stroke={color}
                          strokeWidth="1"
                          opacity={0.6}
                        />
                        {isMood && scar.data.mood_value <= 2 && (
                          <>
                            <Line x1="38" y1="14" x2="42" y2="18" stroke={color} strokeWidth="1" />
                            <Line x1="38" y1="18" x2="42" y2="14" stroke={color} strokeWidth="1" />
                          </>
                        )}
                        {!isMood && (
                          <Rect x="23" y="4" width="4" height="4" fill="none" stroke={color} strokeWidth="1" />
                        )}
                      </Svg>
                    </View>
                  </View>
                </Animated.View>
              )
            })}
          </View>

          {/* circuit recovery */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>[ CIRCUIT RECOVERY ]</Text>
            <View style={styles.recoveryBlock}>
              <View style={styles.recoveryRow}>
                <Text style={styles.recoveryPrompt}>{'>'}</Text>
                <Text style={styles.recoveryText}>extracting_mercury_trace...</Text>
              </View>
              <View style={[styles.recoveryRow, { paddingLeft: 16 }]}>
                <Text style={styles.recoveryOk}>[ ok ]</Text>
                <Text style={styles.recoverySub}>trace_isolated</Text>
              </View>
              <View style={styles.recoveryRow}>
                <Text style={styles.recoveryPrompt}>{'>'}</Text>
                <Text style={styles.recoveryText}>rebuilding_synapses...</Text>
              </View>
              <View style={[styles.recoveryRow, { paddingLeft: 16 }]}>
                <Text style={[styles.recoveryOk, styles.pulse]}>[ ... ]</Text>
                <Text style={styles.recoverySub}>processing_node_7</Text>
              </View>
            </View>
          </View>

          {/* terminal prompt */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>[ TERMINAL PROMPT ]</Text>
            <View style={styles.promptBox}>
              <Text style={styles.promptSymbol}>{'>'}</Text>
              <Text style={[styles.cursor, { opacity: showCursor ? 0.85 : 0 }]}>_</Text>
              <Text style={styles.promptHint}>awaiting_command</Text>
            </View>
          </View>

          {/* footer */}
          <View style={styles.footer}>
            <View style={styles.footerLeft}>
              <Text style={styles.footerText}>kataleya_os v.2.4</Text>
              <Text style={styles.footerText}>all_rights_reserved</Text>
            </View>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.footerExit}>[ exit_terminal ]</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BLACK,
  },
  content: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: `${GREEN}30`,
    backgroundColor: `${BLACK}f2`,
  },
  headerTitle: {
    fontFamily: 'Courier Prime',
    fontSize: 13,
    color: GREEN,
    letterSpacing: 5,
    textTransform: 'uppercase',
  },
  scroll: {
    paddingTop: 24,
    paddingHorizontal: 22,
    paddingBottom: 48,
  },

  // sections
  section: {
    marginBottom: 36,
  },
  sectionLabel: {
    fontFamily: 'Courier Prime',
    fontSize: 11,
    color: `${GREEN}60`,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  sectionLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  // boot
  bootBox: {
    borderWidth: 1,
    borderColor: `${GREEN}40`,
    backgroundColor: `${BLACK}80`,
    padding: 14,
  },
  bootRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 6,
  },
  bootKey: {
    fontFamily: 'Courier Prime',
    fontSize: 12,
    color: `${GREEN}70`,
    textTransform: 'lowercase',
  },
  bootVal: {
    fontFamily: 'Courier Prime',
    fontSize: 12,
    color: GREEN,
    textTransform: 'lowercase',
  },
  pulse: {
    opacity: 0.7,
  },

  // scars
  empty: {
    fontFamily: 'Courier Prime',
    fontSize: 12,
    color: `${GREEN}40`,
    fontStyle: 'italic',
    marginTop: 8,
  },
  scarRow: {
    flexDirection: 'row',
    marginBottom: 20,
    borderLeftWidth: 1,
    borderLeftColor: `${GREEN}30`,
    paddingLeft: 12,
  },
  scarDot: {
    position: 'absolute',
    left: -5,
    top: 4,
  },
  scarDotInner: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: BLACK,
    borderWidth: 1,
  },
  scarContent: {
    flex: 1,
  },
  scarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scarLabel: {
    fontFamily: 'Courier Prime',
    fontSize: 12,
    textTransform: 'lowercase',
    letterSpacing: 1,
  },
  scarTime: {
    fontFamily: 'Courier Prime',
    fontSize: 11,
    color: `${GREEN}50`,
    textTransform: 'lowercase',
  },
  waveform: {
    width: '100%',
    height: 32,
    marginTop: 8,
    opacity: 0.8,
  },

  // recovery
  recoveryBlock: {
    gap: 6,
  },
  recoveryRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  recoveryPrompt: {
    fontFamily: 'Courier Prime',
    fontSize: 12,
    color: GREEN,
    fontWeight: 'bold',
    marginTop: 2,
  },
  recoveryText: {
    fontFamily: 'Courier Prime',
    fontSize: 12,
    color: `${GREEN}cc`,
    textTransform: 'lowercase',
  },
  recoveryOk: {
    fontFamily: 'Courier Prime',
    fontSize: 11,
    color: `${GREEN}50`,
  },
  recoverySub: {
    fontFamily: 'Courier Prime',
    fontSize: 11,
    color: `${GREEN}60`,
    textTransform: 'lowercase',
  },

  // prompt
  promptBox: {
    borderWidth: 1,
    borderColor: `${GREEN}20`,
    backgroundColor: BLACK,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  promptSymbol: {
    fontFamily: 'Courier Prime',
    fontSize: 14,
    color: GREEN,
    fontWeight: 'bold',
  },
  cursor: {
    fontFamily: 'Courier Prime',
    fontSize: 14,
    color: GREEN,
  },
  promptHint: {
    fontFamily: 'Courier Prime',
    fontSize: 12,
    color: `${GREEN}40`,
    textTransform: 'lowercase',
    marginLeft: 8,
  },

  // footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: `${GREEN}20`,
  },
  footerLeft: {
    gap: 2,
  },
  footerText: {
    fontFamily: 'Courier Prime',
    fontSize: 10,
    color: `${GREEN}50`,
    textTransform: 'lowercase',
    letterSpacing: 2,
  },
  footerExit: {
    fontFamily: 'Courier Prime',
    fontSize: 11,
    color: `${GREEN}70`,
    textTransform: 'lowercase',
    letterSpacing: 2,
  },
})
