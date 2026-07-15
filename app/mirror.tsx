// app/mirror.tsx
// physician mirror — wireframe vessel with real diagnostic data.
// vertical stack layout. no absolute scatter. everything fits.

import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  Animated,
  Dimensions,
  Easing,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import Svg, { Rect, Line, Polyline, Polygon } from 'react-native-svg'

import { useCircadian } from '../hooks/use-circadian'
import { getAttunement } from '../utils/storage'
import { getLatestMoodLog, getAllMoodLogs } from '../utils/sanctuary'
import { daysSince, timeAgo, moodTrend } from '../utils/insights'

const { height: H } = Dimensions.get('window')
const GREEN = '#00FF41'
const GREEN_DIM = '#22cc22'
const GREEN_FAINT = '#113311'
const BLACK = '#000000'

export default function MirrorScreen() {
  const router = useRouter()
  const { phase } = useCircadian()
  const [sobrietyDays, setSobrietyDays] = useState<number>(0)
  const [lastCheckin, setLastCheckin] = useState<string>('—')
  const [trend, setTrend] = useState<string>('—')
  const [userName, setUserName] = useState<string>('')
  const scanY = useRef(new Animated.Value(-120)).current
  const pulseAnim = useRef(new Animated.Value(0)).current

  const loadData = useCallback(async () => {
    const attunement = await getAttunement()
    if (attunement?.sobriety_date) {
      setSobrietyDays(daysSince(attunement.sobriety_date))
    }
    if (attunement?.name) {
      setUserName(attunement.name)
    }
    const latest = getLatestMoodLog()
    if (latest) {
      setLastCheckin(timeAgo(latest.logged_at))
    }
    const all = getAllMoodLogs(30)
    setTrend(moodTrend(all))
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(scanY, {
        toValue: H + 120,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    )
    anim.start()
    return () => anim.stop()
  }, [H])

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    )
    anim.start()
    return () => anim.stop()
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

  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  })

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.content} {...pan.panHandlers}>
        {/* scanline sweep */}
        <Animated.View
          style={[styles.scanline, { transform: [{ translateY: scanY }] }]}
          pointerEvents="none"
        />

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* header */}
          <View style={styles.header}>
            <Text style={styles.headerLabel}>[ sys_diagnostic ]</Text>
            <View style={styles.headerRight}>
              <Animated.View style={[styles.headerDot, { opacity: pulseOpacity }]} />
              <Text style={styles.headerStatus}>online</Text>
            </View>
          </View>

          {/* ── wireframe vessel ── */}
          <View style={styles.vesselSection}>
            <View style={styles.vesselContainer}>
              <View style={styles.vesselGlow} />
              <View style={styles.vesselGlowInner} />
              <Svg width={200} height={380} viewBox="0 0 280 520" style={styles.vesselSvg}>
                {/* head box */}
                <Rect x="120" y="30" width="40" height="50" fill="none" stroke={GREEN} strokeWidth="1" strokeDasharray="2 2" />
                {/* neck */}
                <Line x1="140" y1="80" x2="140" y2="105" stroke={GREEN} strokeWidth="1" />
                {/* shoulders */}
                <Line x1="80" y1="105" x2="200" y2="105" stroke={GREEN} strokeWidth="1" />
                {/* torso grid */}
                <Rect x="100" y="105" width="80" height="140" fill="none" stroke={GREEN} strokeWidth="1" />
                <Line x1="100" y1="145" x2="180" y2="145" stroke={GREEN} strokeWidth="1" strokeDasharray="2 4" />
                <Line x1="100" y1="185" x2="180" y2="185" stroke={GREEN} strokeWidth="1" strokeDasharray="2 4" />
                <Line x1="100" y1="225" x2="180" y2="225" stroke={GREEN} strokeWidth="1" strokeDasharray="2 4" />
                <Line x1="140" y1="105" x2="140" y2="245" stroke={GREEN} strokeWidth="1" />
                {/* arms */}
                <Polyline points="80,105 60,200 65,290" fill="none" stroke={GREEN} strokeWidth="1" strokeDasharray="4 4" />
                <Polyline points="200,105 220,200 215,290" fill="none" stroke={GREEN} strokeWidth="1" strokeDasharray="4 4" />
                {/* pelvis */}
                <Polygon points="100,245 180,245 160,275 120,275" fill="none" stroke={GREEN} strokeWidth="1" />
                {/* legs */}
                <Polyline points="120,275 110,400 115,500" fill="none" stroke={GREEN} strokeWidth="1" />
                <Polyline points="160,275 170,400 165,500" fill="none" stroke={GREEN} strokeWidth="1" />
                {/* joints */}
                <Rect x="138" y="53" width="4" height="4" fill={GREEN} />
                <Rect x="138" y="143" width="4" height="4" fill={GREEN} />
                <Rect x="138" y="243" width="4" height="4" fill={GREEN} />
                <Rect x="78" y="103" width="4" height="4" fill={GREEN} />
                <Rect x="198" y="103" width="4" height="4" fill={GREEN} />
                <Rect x="118" y="273" width="4" height="4" fill={GREEN} />
                <Rect x="158" y="273" width="4" height="4" fill={GREEN} />
              </Svg>
            </View>
          </View>

          {/* ── diagnostics grid ── */}
          <View style={styles.diagSection}>
            {/* row 1 */}
            <View style={styles.diagRow}>
              <View style={styles.diagCell}>
                <View style={styles.diagLabelRow}>
                  <View style={styles.diagDot} />
                  <Text style={styles.diagLabel}>[ days_sober ]</Text>
                </View>
                <Text style={styles.diagValue}>{sobrietyDays}</Text>
                <View style={styles.diagBar}>
                  <View style={[styles.diagBarFill, { width: `${Math.min(100, sobrietyDays / 3)}%` }]} />
                </View>
              </View>
              <View style={styles.diagCell}>
                <View style={styles.diagLabelRow}>
                  <View style={styles.diagDot} />
                  <Text style={styles.diagLabel}>[ phase ]</Text>
                </View>
                <Text style={styles.diagValue}>{phase}</Text>
                <View style={styles.diagPhaseBars}>
                  <View style={[styles.phaseBar, { opacity: phase === 'dawn' ? 1 : 0.2 }]} />
                  <View style={[styles.phaseBar, { opacity: phase === 'day' ? 1 : 0.2 }]} />
                  <View style={[styles.phaseBar, { opacity: phase === 'goldenHour' ? 1 : 0.2 }]} />
                  <View style={[styles.phaseBar, { opacity: phase === 'night' ? 1 : 0.2 }]} />
                </View>
              </View>
            </View>

            {/* row 2 */}
            <View style={styles.diagRow}>
              <View style={styles.diagCell}>
                <View style={styles.diagLabelRow}>
                  <View style={styles.diagDot} />
                  <Text style={styles.diagLabel}>[ mood_trend ]</Text>
                </View>
                <Text style={styles.diagValue}>{trend}</Text>
                <View style={styles.diagMiniBars}>
                  <View style={[styles.miniBar, { opacity: trend === 'critical' ? 1 : 0.3 }]} />
                  <View style={[styles.miniBar, { opacity: trend === 'unsettled' ? 1 : 0.3 }]} />
                  <View style={[styles.miniBar, { opacity: trend === 'stable' ? 1 : 0.3 }]} />
                  <View style={[styles.miniBar, { opacity: trend === 'ascendant' ? 1 : 0.3 }]} />
                </View>
              </View>
              <View style={styles.diagCell}>
                <View style={styles.diagLabelRow}>
                  <View style={styles.diagDot} />
                  <Text style={styles.diagLabel}>[ last_bridge ]</Text>
                </View>
                <Text style={styles.diagValue}>{lastCheckin}</Text>
                <View style={[styles.diagBar, { width: 48 }]}>
                  <View style={[styles.diagBarFill, { width: '60%' }]} />
                </View>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          {/* ── system logs ── */}
          <View style={styles.logs}>
            <Text style={styles.logTitle}>[ system_log ]</Text>
            <View style={styles.logRow}>
              <Text style={styles.logPrompt}>{'>'}</Text>
              <Text style={styles.logText}>vessel_aligned</Text>
            </View>
            <View style={styles.logRow}>
              <Text style={styles.logPrompt}>{'>'}</Text>
              <Text style={styles.logText}>phase_sync: {phase}</Text>
            </View>
            <View style={styles.logRow}>
              <Text style={styles.logPrompt}>{'>'}</Text>
              <Text style={[styles.logText, styles.logPulse]}>awaiting_input_</Text>
            </View>
          </View>

          {/* ── footer ── */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>{userName || '// awaiting attunement'}</Text>
            <Text style={styles.footerHint}>[ swipe right to return ]</Text>
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
  scanline: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 80,
    zIndex: 10,
    pointerEvents: 'none',
    backgroundColor: `${GREEN}08`,
  },
  scroll: {
    paddingTop: 16,
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 24,
  },

  // header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  headerLabel: {
    fontFamily: 'Courier Prime',
    fontSize: 12,
    color: `${GREEN}aa`,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: GREEN,
    shadowColor: GREEN,
    shadowRadius: 8,
    shadowOpacity: 0.8,
  },
  headerStatus: {
    fontFamily: 'Courier Prime',
    fontSize: 11,
    color: `${GREEN}aa`,
    letterSpacing: 2,
    textTransform: 'lowercase',
  },

  // vessel
  vesselSection: {
    alignItems: 'center',
  },
  vesselContainer: {
    width: 220,
    height: 400,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vesselGlow: {
    position: 'absolute',
    width: 240,
    height: 420,
    backgroundColor: `${GREEN}08`,
    borderRadius: 120,
    opacity: 0.6,
  },
  vesselGlowInner: {
    position: 'absolute',
    width: 180,
    height: 340,
    backgroundColor: `${GREEN}05`,
    borderRadius: 90,
    opacity: 0.8,
  },
  vesselSvg: {
    opacity: 0.85,
  },

  // diagnostics
  diagSection: {
    gap: 16,
  },
  diagRow: {
    flexDirection: 'row',
    gap: 16,
  },
  diagCell: {
    flex: 1,
    gap: 6,
  },
  diagLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  diagDot: {
    width: 4,
    height: 4,
    backgroundColor: GREEN,
    shadowColor: GREEN,
    shadowRadius: 6,
    shadowOpacity: 0.8,
  },
  diagLabel: {
    fontFamily: 'Courier Prime',
    fontSize: 10,
    color: `${GREEN}aa`,
    letterSpacing: 2,
    textTransform: 'lowercase',
  },
  diagValue: {
    fontFamily: 'Courier Prime',
    fontSize: 18,
    color: GREEN,
    marginTop: 2,
    marginLeft: 12,
  },
  diagBar: {
    width: 64,
    height: 2,
    backgroundColor: `${GREEN}30`,
    marginTop: 4,
    marginLeft: 12,
    overflow: 'hidden',
  },
  diagBarFill: {
    height: '100%',
    backgroundColor: `${GREEN}88`,
  },
  diagMiniBars: {
    flexDirection: 'row',
    gap: 3,
    marginTop: 4,
    marginLeft: 12,
  },
  miniBar: {
    width: 8,
    height: 8,
    borderWidth: 1,
    borderColor: GREEN,
    backgroundColor: GREEN,
  },
  diagPhaseBars: {
    flexDirection: 'row',
    gap: 3,
    marginTop: 4,
    marginLeft: 12,
  },
  phaseBar: {
    width: 6,
    height: 12,
    borderWidth: 1,
    borderColor: GREEN,
    backgroundColor: GREEN,
  },

  divider: {
    height: 1,
    backgroundColor: GREEN_FAINT,
    marginVertical: 4,
    opacity: 0.6,
  },

  // logs
  logs: {
    gap: 4,
  },
  logTitle: {
    fontFamily: 'Courier Prime',
    fontSize: 9,
    color: `${GREEN}50`,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: `${GREEN}20`,
    paddingBottom: 4,
    alignSelf: 'flex-start',
  },
  logRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  logPrompt: {
    fontFamily: 'Courier Prime',
    fontSize: 10,
    color: `${GREEN}50`,
  },
  logText: {
    fontFamily: 'Courier Prime',
    fontSize: 10,
    color: `${GREEN}99`,
    textTransform: 'lowercase',
  },
  logPulse: {
    color: GREEN,
  },

  // footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: `${GREEN}20`,
  },
  footerText: {
    fontFamily: 'Courier Prime',
    fontSize: 10,
    color: `${GREEN}40`,
    letterSpacing: 1,
    textTransform: 'lowercase',
  },
  footerHint: {
    fontFamily: 'Courier Prime',
    fontSize: 10,
    color: `${GREEN}55`,
    letterSpacing: 2,
    textTransform: 'lowercase',
  },
})
