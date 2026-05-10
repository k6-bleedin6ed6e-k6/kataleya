// app/mirror.tsx
// physician mirror — wireframe vessel with real diagnostic data.
// rebuilt from uxpilot wireframe. no fake metrics.

import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  Animated,
  Dimensions,
  Easing,
  PanResponder,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import Svg, { Rect, Line, Polyline, Polygon } from 'react-native-svg'

import { useCircadian } from '../hooks/use-circadian'
import { getAttunement } from '../utils/storage'
import {
  getLatestMoodLog,
  getAllMoodLogs,
  type MoodLog,
} from '../utils/sanctuary'

const { height: H, width: W } = Dimensions.get('window')
const GREEN = '#33ff33'
const GREEN_DIM = '#22cc22'
const GREEN_FAINT = '#113311'
const BLACK = '#000000'

function daysSince(iso: string): number {
  const start = new Date(iso)
  const now = new Date()
  const ms = now.getTime() - start.getTime()
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)))
}

function timeAgo(ms: number): string {
  const mins = Math.floor((Date.now() - ms) / 60000)
  if (mins < 1) return 'now'
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  const days = Math.floor(hrs / 24)
  return `${days}d`
}

function moodTrend(logs: MoodLog[]): string {
  if (logs.length === 0) return '—'
  const avg = logs.reduce((s, l) => s + l.mood_value, 0) / logs.length
  if (avg >= 4.5) return 'ascendant'
  if (avg >= 3.5) return 'stable'
  if (avg >= 2.5) return 'unsettled'
  return 'critical'
}

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

        {/* header */}
        <View style={styles.header}>
          <Text style={styles.headerLabel}>[ sys_diagnostic ]</Text>
          <View style={styles.headerRight}>
            <Animated.View style={[styles.headerDot, { opacity: pulseOpacity }]} />
            <Text style={styles.headerStatus}>online</Text>
          </View>
        </View>

        {/* ── wireframe vessel ── */}
        <View style={styles.vesselContainer}>
          {/* outer glow layers */}
          <View style={styles.vesselGlow} />
          <View style={styles.vesselGlowInner} />

          {/* wireframe SVG */}
          <Svg width={260} height={480} viewBox="0 0 280 520" style={styles.vesselSvg}>
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

        {/* ── diagnostic overlays ── */}
        {/* days sober — top left */}
        <View style={[styles.dataPoint, { top: '16%', left: '6%' }]}>
          <View style={styles.dataLabelRow}>
            <View style={styles.dataDot} />
            <Text style={styles.dataLabel}>[ days_sober ]</Text>
          </View>
          <Text style={styles.dataValue}>{sobrietyDays}</Text>
          <View style={styles.dataBar}>
            <View style={[styles.dataBarFill, { width: `${Math.min(100, sobrietyDays / 3)}%` }]} />
          </View>
        </View>

        {/* mood trend — mid left */}
        <View style={[styles.dataPoint, { top: '34%', left: '5%' }]}>
          <View style={styles.dataLabelRow}>
            <View style={styles.dataDot} />
            <Text style={styles.dataLabel}>[ mood_trend ]</Text>
          </View>
          <Text style={styles.dataValue}>{trend}</Text>
          <View style={styles.dataMiniBars}>
            <View style={[styles.miniBar, { opacity: trend === 'critical' ? 1 : 0.3 }]} />
            <View style={[styles.miniBar, { opacity: trend === 'unsettled' ? 1 : 0.3 }]} />
            <View style={[styles.miniBar, { opacity: trend === 'stable' ? 1 : 0.3 }]} />
            <View style={[styles.miniBar, { opacity: trend === 'ascendant' ? 1 : 0.3 }]} />
          </View>
        </View>

        {/* phase — top right */}
        <View style={[styles.dataPoint, { top: '22%', right: '6%', alignItems: 'flex-end' }]}>
          <View style={[styles.dataLabelRow, { flexDirection: 'row-reverse' }]}>
            <View style={styles.dataDot} />
            <Text style={styles.dataLabel}>[ phase ]</Text>
          </View>
          <Text style={styles.dataValue}>{phase}</Text>
          <View style={[styles.dataPhaseBars, { alignSelf: 'flex-end' }]}>
            <View style={[styles.phaseBar, { opacity: phase === 'dawn' ? 1 : 0.2 }]} />
            <View style={[styles.phaseBar, { opacity: phase === 'day' ? 1 : 0.2 }]} />
            <View style={[styles.phaseBar, { opacity: phase === 'goldenHour' ? 1 : 0.2 }]} />
            <View style={[styles.phaseBar, { opacity: phase === 'night' ? 1 : 0.2 }]} />
          </View>
        </View>

        {/* last checkin — mid right */}
        <View style={[styles.dataPoint, { top: '46%', right: '5%', alignItems: 'flex-end' }]}>
          <View style={[styles.dataLabelRow, { flexDirection: 'row-reverse' }]}>
            <View style={styles.dataDot} />
            <Text style={styles.dataLabel}>[ last_bridge ]</Text>
          </View>
          <Text style={styles.dataValue}>{lastCheckin}</Text>
          <View style={[styles.dataBar, { width: 48, alignSelf: 'flex-end' }]}>
            <View style={[styles.dataBarFill, { width: '60%' }]} />
          </View>
        </View>

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

        {/* ── footer hint ── */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>[ swipe right to return ]</Text>
        </View>
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

  // header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    zIndex: 20,
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
  vesselContainer: {
    position: 'absolute',
    top: H * 0.12,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    height: H * 0.6,
    pointerEvents: 'none',
  },
  vesselGlow: {
    position: 'absolute',
    width: 320,
    height: 560,
    backgroundColor: `${GREEN}08`,
    borderRadius: 160,
    opacity: 0.6,
  },
  vesselSvg: {
    opacity: 0.85,
  },
  vesselGlowInner: {
    position: 'absolute',
    width: 240,
    height: 440,
    backgroundColor: `${GREEN}05`,
    borderRadius: 120,
    opacity: 0.8,
  },

  // data points
  dataPoint: {
    position: 'absolute',
    zIndex: 20,
  },
  dataLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dataDot: {
    width: 4,
    height: 4,
    backgroundColor: GREEN,
    shadowColor: GREEN,
    shadowRadius: 6,
    shadowOpacity: 0.8,
  },
  dataLabel: {
    fontFamily: 'Courier Prime',
    fontSize: 10,
    color: `${GREEN}aa`,
    letterSpacing: 2,
    textTransform: 'lowercase',
  },
  dataValue: {
    fontFamily: 'Courier Prime',
    fontSize: 16,
    color: GREEN,
    marginTop: 4,
    marginLeft: 12,
  },
  dataBar: {
    width: 64,
    height: 2,
    backgroundColor: `${GREEN}30`,
    marginTop: 6,
    marginLeft: 12,
    overflow: 'hidden',
  },
  dataBarFill: {
    height: '100%',
    backgroundColor: `${GREEN}88`,
  },
  dataMiniBars: {
    flexDirection: 'row',
    gap: 3,
    marginTop: 6,
    marginLeft: 12,
  },
  miniBar: {
    width: 8,
    height: 8,
    borderWidth: 1,
    borderColor: GREEN,
    backgroundColor: GREEN,
  },
  dataPhaseBars: {
    flexDirection: 'row',
    gap: 3,
    marginTop: 6,
    marginLeft: 12,
  },
  phaseBar: {
    width: 6,
    height: 12,
    borderWidth: 1,
    borderColor: GREEN,
    backgroundColor: GREEN,
  },

  // logs
  logs: {
    position: 'absolute',
    bottom: 72,
    left: 24,
    maxWidth: '55%',
    zIndex: 20,
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
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 20,
  },
  footerText: {
    fontFamily: 'Courier Prime',
    fontSize: 10,
    color: `${GREEN}55`,
    letterSpacing: 3,
    textTransform: 'lowercase',
  },
})
