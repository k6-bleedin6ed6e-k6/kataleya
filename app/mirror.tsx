// app/mirror.tsx
// physician mirror — temporal entity for shared clinical reflection.
// rebuilt to match wireframe proportions and readable text.

import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  Animated,
  Dimensions,
  Easing,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useCircadian } from '../hooks/use-circadian'
import { getAttunement } from '../utils/storage'
import { BASE } from '../constants/palettes'

const { height: H } = Dimensions.get('window')

const SCARS = [
  { text: 'STABLE', left: '12%', top: -14 },
  { text: 'RESONANCE', left: '38%', bottom: -18, opacity: 0.25 },
  { text: 'AURORA', right: '25%', top: -14 },
  { text: 'DAWN', right: '5%', bottom: -18, opacity: 0.25 },
]

function daysSince(iso: string): number {
  const start = new Date(iso)
  const now = new Date()
  const ms = now.getTime() - start.getTime()
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)))
}

export default function MirrorScreen() {
  const router = useRouter()
  const { phase, palette } = useCircadian()
  const [sobrietyDays, setSobrietyDays] = useState<number | null>(null)
  const [userName, setUserName] = useState<string>('')
  const scanY = useRef(new Animated.Value(-120)).current

  const loadData = useCallback(async () => {
    const attunement = await getAttunement()
    if (attunement?.sobriety_date) {
      setSobrietyDays(daysSince(attunement.sobriety_date))
    }
    if (attunement?.name) {
      setUserName(attunement.name)
    }
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

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.content} {...pan.panHandlers}>

        {/* subtle scanline sweep */}
        <Animated.View
          style={[styles.scanline, { transform: [{ translateY: scanY }] }]}
          pointerEvents="none"
        >
          <LinearGradient
            colors={[`${palette.accent}00`, `${palette.accent}08`, `${palette.accent}00`]}
            locations={[0, 0.5, 1]}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        {/* header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.headerDot, { backgroundColor: palette.accent }]} />
            <Text style={[styles.headerTitle, { color: palette.accent }]}>KATALEYA</Text>
          </View>
        </View>

        {/* ── SKY: above the horizon (~55%) ── */}
        <View style={styles.sky}>
          <View style={styles.markersRow}>
            {/* Seed */}
            <View style={styles.marker}>
              <View style={[styles.markerIconCircle, { borderColor: `${palette.accent}55` }]} />
              <View style={[styles.markerLine, { backgroundColor: `${palette.accent}55` }]} />
              <Text style={[styles.markerLabel, { color: `${palette.accent}99` }]}>
                Seed
              </Text>
            </View>

            {/* Root — active, dominant */}
            <View style={styles.marker}>
              <View style={[styles.markerGlow, { backgroundColor: `${palette.accent}20` }]} />
              <View style={[styles.markerIconCircleActive, { borderColor: palette.accent }]}>
                <View style={[styles.markerIconInner, { backgroundColor: palette.accent }]} />
              </View>
              <View style={[styles.markerLine, { backgroundColor: `${palette.accent}cc`, height: 48 }]} />
              <Text style={[styles.markerLabelActive, { color: palette.accent }]}>
                Root
              </Text>
            </View>

            {/* Bloom */}
            <View style={styles.marker}>
              <View style={[styles.markerIconCircle, { borderColor: `${palette.highlight}55` }]} />
              <View style={[styles.markerLine, { backgroundColor: `${palette.highlight}55` }]} />
              <Text style={[styles.markerLabel, { color: `${palette.highlight}99` }]}>
                Bloom
              </Text>
            </View>
          </View>
        </View>

        {/* ── HORIZON: the bright line ── */}
        <View style={styles.horizonWrap}>
          {/* "stay with me" — ABOVE the line */}
          <View style={styles.horizonPhrase}>
            <Text style={[styles.horizonPhraseText, { color: `${palette.accent}cc` }]}>
              stay with me
            </Text>
          </View>

          {/* the line itself */}
          <View
            style={[
              styles.horizonLine,
              {
                backgroundColor: `${palette.accent}80`,
                shadowColor: palette.accent,
              },
            ]}
          >
            {/* transmutation scars */}
            {SCARS.map((scar, i) => (
              <Text
                key={i}
                style={[
                  styles.scar,
                  {
                    color: `${palette.accent}99`,
                    left: scar.left ? scar.left : undefined,
                    right: scar.right ? scar.right : undefined,
                    top: scar.top,
                    bottom: scar.bottom,
                    opacity: scar.opacity ?? 0.4,
                  } as any,
                ]}
              >
                {scar.text}
              </Text>
            ))}

            {/* luminous nodes */}
            <View style={[styles.horizonNode, { left: '15%', backgroundColor: palette.rim }]} />
            <View style={[styles.horizonNode, { right: '15%', backgroundColor: palette.accent }]} />
          </View>
        </View>

        {/* ── TIDE: mercury river below (~35%) ── */}
        <View style={styles.tide}>
          {/* mercury gradient wash */}
          <LinearGradient
            colors={[
              `${palette.shadow}cc`,
              `${BASE.bg}99`,
              `${palette.accent}55`,
              `${palette.highlight}88`,
            ]}
            locations={[0, 0.25, 0.6, 1]}
            style={StyleSheet.absoluteFill}
          />
          {/* top-fade overlay to ground the river */}
          <LinearGradient
            colors={[`${BASE.bg}00`, `${BASE.bg}aa`]}
            locations={[0, 1]}
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.tideMarkers}>
            {/* Void — dim */}
            <View style={[styles.tideMarker, { opacity: 0.35 }]}>
              <View style={[styles.tideBar, { width: 72, backgroundColor: `${BASE.text}33` }]} />
              <Text style={[styles.tideLabel, { color: `${BASE.text}77` }]}>
                Void
              </Text>
            </View>

            {/* Stable — highlighted */}
            <View style={styles.tideMarker}>
              <View
                style={[
                  styles.tideBar,
                  styles.tideBarActive,
                  {
                    width: 112,
                    backgroundColor: `${palette.accent}44`,
                    shadowColor: palette.accent,
                  },
                ]}
              />
              <Text style={[styles.tideLabel, { color: palette.accent, fontWeight: '700' }]}>
                Stable
              </Text>
            </View>

            {/* Renewal — dim */}
            <View style={[styles.tideMarker, { opacity: 0.4 }]}>
              <View style={[styles.tideBar, { width: 72, backgroundColor: `${BASE.text}33` }]} />
              <Text style={[styles.tideLabel, { color: `${BASE.text}77` }]}>
                Renewal
              </Text>
            </View>
          </View>
        </View>

        {/* ── FOOTER: absolute overlay at bottom ── */}
        <View style={styles.footer} pointerEvents="box-none">
          <View style={styles.footerCol} pointerEvents="auto">
            <Text style={[styles.footerLabel, { color: `${BASE.text}55` }]}>
              DAYS SOBER
            </Text>
            <Text style={[styles.footerValue, { color: `${palette.accent}cc` }]}>
              {sobrietyDays !== null ? sobrietyDays : '—'}
            </Text>
          </View>

          <Pressable
            onPress={loadData}
            style={[styles.recalibrateBtn, { borderColor: `${palette.accent}33` }]}
          >
            <Text style={[styles.recalibrateText, { color: `${palette.accent}b3` }]}>
              REFRESH
            </Text>
          </Pressable>

          <View style={styles.footerColRight} pointerEvents="auto">
            <Text style={[styles.footerOrigin, { color: `${BASE.text}33` }]}>
              {userName || '// awaiting attunement'}
            </Text>
          </View>
        </View>

        {/* swipe hint */}
        <View style={styles.hint} pointerEvents="none">
          <Text style={[styles.hintText, { color: `${palette.rgb}18` }]}>
            swipe right to return
          </Text>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BASE.bg,
  },
  content: {
    flex: 1,
    flexDirection: 'column',
  },
  scanline: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 100,
    zIndex: 10,
    pointerEvents: 'none',
  },
  // header
  header: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 4,
    opacity: 0.55,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  headerTitle: {
    fontFamily: 'Courier Prime',
    fontSize: 13,
    letterSpacing: 5,
  },
  // sky
  sky: {
    flex: 5,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  markersRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
  },
  marker: {
    alignItems: 'center',
  },
  markerGlow: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    top: -22,
  },
  markerIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: 10,
  },
  markerIconCircleActive: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  markerIconInner: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  markerLine: {
    width: 1,
    height: 32,
    marginBottom: 10,
  },
  markerLabel: {
    fontFamily: 'Courier Prime',
    fontSize: 11,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  markerLabelActive: {
    fontFamily: 'Courier Prime',
    fontSize: 12,
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  // horizon
  horizonWrap: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  horizonPhrase: {
    marginBottom: 12,
  },
  horizonPhraseText: {
    fontFamily: 'Courier Prime',
    fontSize: 12,
    letterSpacing: 5,
    textTransform: 'uppercase',
  },
  horizonLine: {
    width: '100%',
    height: 2,
    shadowRadius: 16,
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 0 },
    position: 'relative',
  },
  scar: {
    position: 'absolute',
    fontFamily: 'Courier Prime',
    fontSize: 9,
    letterSpacing: 0.5,
  },
  horizonNode: {
    position: 'absolute',
    top: -2,
    width: 6,
    height: 6,
    borderRadius: 3,
    shadowRadius: 8,
    shadowOpacity: 0.8,
    shadowOffset: { width: 0, height: 0 },
  },
  // tide
  tide: {
    flex: 3,
    justifyContent: 'center',
    paddingHorizontal: 32,
    overflow: 'hidden',
    position: 'relative',
  },
  tideMarkers: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tideMarker: {
    alignItems: 'center',
  },
  tideBar: {
    height: 3,
    borderRadius: 2,
    marginBottom: 12,
  },
  tideBarActive: {
    height: 4,
    borderRadius: 2,
    shadowRadius: 12,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 0 },
  },
  tideLabel: {
    fontFamily: 'Courier Prime',
    fontSize: 10,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
  },
  // footer — absolute overlay
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    zIndex: 20,
  },
  footerCol: {
    gap: 6,
  },
  footerColRight: {
    alignItems: 'flex-end',
    maxWidth: 140,
  },
  footerLabel: {
    fontFamily: 'Courier Prime',
    fontSize: 10,
    letterSpacing: 3,
  },
  footerValue: {
    fontFamily: 'Courier Prime',
    fontSize: 24,
    fontWeight: '700',
  },
  recalibrateBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 2,
  },
  recalibrateText: {
    fontFamily: 'Courier Prime',
    fontSize: 11,
    letterSpacing: 2,
  },
  footerOrigin: {
    fontFamily: 'Courier Prime',
    fontSize: 10,
    letterSpacing: 1,
    textAlign: 'right',
  },
  hint: {
    position: 'absolute',
    bottom: 6,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 20,
  },
  hintText: {
    fontFamily: 'Courier Prime',
    fontSize: 9,
    letterSpacing: 1.5,
  },
})
