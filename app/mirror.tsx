// app/mirror.tsx
// physician mirror — temporal entity for shared clinical reflection.
// rebuilt to match wireframe: clinical, measured, atmospheric.

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
import { BASE } from '../constants/palettes'

const { height: H } = Dimensions.get('window')

const SCARS = [
  { text: '0XFF_STABLE', left: '12%', top: -4 },
  { text: '::RESONANCE_SCAN::', left: '38%', bottom: -16, opacity: 0.2 },
  { text: 'V_0.9.4_AURORA', right: '25%', top: -4 },
  { text: 'PHASE_DAWN', right: '5%', bottom: -16, opacity: 0.2 },
]

export default function MirrorScreen() {
  const router = useRouter()
  const { palette } = useCircadian()
  const [integrity, setIntegrity] = useState(98.4)
  const scanY = useRef(new Animated.Value(-120)).current

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

  const recalibrate = useCallback(() => {
    setIntegrity(prev => Math.min(100, +(prev + Math.random() * 1.5).toFixed(1)))
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

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.content} {...pan.panHandlers}>

        {/* subtle scanline sweep */}
        <Animated.View
          style={[
            styles.scanline,
            { transform: [{ translateY: scanY }] },
          ]}
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
            <Text style={[styles.headerDot, { color: palette.accent }]}>●</Text>
            <Text style={[styles.headerTitle, { color: palette.accent }]}>KATALEYA</Text>
          </View>
        </View>

        {/* ── SKY: above the horizon (~40%) ── */}
        <View style={styles.sky}>
          <View style={styles.markersRow}>
            {/* Seed */}
            <View style={styles.marker}>
              <Text style={[styles.markerIcon, { color: `${palette.accent}66`, fontSize: 28 }]}>
                ○
              </Text>
              <View style={[styles.markerLine, { backgroundColor: `${palette.accent}66` }]} />
              <Text style={[styles.markerLabel, { color: `${palette.accent}66` }]}>
                Seed
              </Text>
            </View>

            {/* Root — active, dominant */}
            <View style={styles.marker}>
              <View style={[styles.markerGlow, { backgroundColor: `${palette.accent}25` }]} />
              <Text style={[styles.markerIcon, { color: palette.accent, fontSize: 44 }]}>
                ◉
              </Text>
              <View style={[styles.markerLine, { backgroundColor: `${palette.accent}99`, height: 40 }]} />
              <Text style={[styles.markerLabel, { color: palette.accent, letterSpacing: 4 }]}>
                Root
              </Text>
            </View>

            {/* Bloom */}
            <View style={styles.marker}>
              <Text style={[styles.markerIcon, { color: `${palette.highlight}66`, fontSize: 28 }]}>
                ◎
              </Text>
              <View style={[styles.markerLine, { backgroundColor: `${palette.highlight}66` }]} />
              <Text style={[styles.markerLabel, { color: `${palette.highlight}66` }]}>
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
                    opacity: scar.opacity ?? 0.35,
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

        {/* ── TIDE: mercury river below (~40%) ── */}
        <View style={styles.tide}>
          {/* mercury gradient wash */}
          <LinearGradient
            colors={[
              `${palette.shadow}cc`,
              `${BASE.bg}99`,
              `${palette.accent}66`,
              `${palette.highlight}99`,
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
            <View style={[styles.tideMarker, { opacity: 0.3 }]}>
              <View style={[styles.tideBar, { width: 80, backgroundColor: `${BASE.text}33` }]} />
              <Text style={[styles.tideLabel, { color: `${BASE.text}88` }]}>
                (..: :..) Void
              </Text>
            </View>

            {/* Stable — highlighted */}
            <View style={[styles.tideMarker, { transform: [{ translateY: 4 }] }]}>
              <View
                style={[
                  styles.tideBar,
                  styles.tideBarActive,
                  {
                    width: 120,
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
              <View style={[styles.tideBar, { width: 80, backgroundColor: `${BASE.text}33` }]} />
              <Text style={[styles.tideLabel, { color: `${BASE.text}88` }]}>
                Renewal
              </Text>
            </View>
          </View>
        </View>

        {/* ── FOOTER: integrity, recalibrate, origin (~20%) ── */}
        <View style={styles.footer}>
          <View style={styles.footerCol}>
            <Text style={[styles.footerLabel, { color: `${BASE.text}66` }]}>
              INTEGRITY_INDEX
            </Text>
            <Text style={[styles.footerValue, { color: `${palette.accent}cc` }]}>
              {integrity}%
            </Text>
          </View>

          <Pressable
            onPress={recalibrate}
            style={[styles.recalibrateBtn, { borderColor: `${palette.accent}33` }]}
          >
            <Text style={[styles.recalibrateText, { color: `${palette.accent}b3` }]}>
              RECALIBRATE_MIRROR
            </Text>
          </Pressable>

          <View style={styles.footerColRight}>
            <Text style={[styles.footerOrigin, { color: `${BASE.text}33` }]}>
              // origin: thinkBad-doGood-sa.my
            </Text>
          </View>
        </View>

        {/* swipe hint */}
        <View style={styles.hint} pointerEvents="none">
          <Text style={[styles.hintText, { color: `${palette.rgb}12` }]}>
            → swipe right to return
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
    opacity: 0.4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerDot: {
    fontSize: 10,
  },
  headerTitle: {
    fontFamily: 'Courier Prime',
    fontSize: 12,
    letterSpacing: 6,
  },
  // sky
  sky: {
    flex: 4,
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
    gap: 10,
  },
  markerGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    top: -18,
  },
  markerIcon: {
    fontFamily: 'Courier Prime',
  },
  markerLine: {
    width: 1,
    height: 28,
  },
  markerLabel: {
    fontFamily: 'Courier Prime',
    fontSize: 10,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  // horizon
  horizonWrap: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
  },
  horizonPhrase: {
    marginBottom: 10,
  },
  horizonPhraseText: {
    fontFamily: 'Courier Prime',
    fontSize: 11,
    letterSpacing: 6,
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
    fontSize: 8,
    letterSpacing: -0.5,
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
    flex: 4,
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
    gap: 10,
  },
  tideBar: {
    height: 3,
    borderRadius: 2,
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
    fontSize: 9,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  // footer
  footer: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 20,
    gap: 12,
  },
  footerCol: {
    gap: 4,
  },
  footerColRight: {
    alignItems: 'flex-end',
    maxWidth: 120,
  },
  footerLabel: {
    fontFamily: 'Courier Prime',
    fontSize: 9,
    letterSpacing: 3,
  },
  footerValue: {
    fontFamily: 'Courier Prime',
    fontSize: 22,
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
    fontSize: 10,
    letterSpacing: 2,
  },
  footerOrigin: {
    fontFamily: 'Courier Prime',
    fontSize: 8,
    letterSpacing: 1,
    textAlign: 'right',
  },
  hint: {
    position: 'absolute',
    bottom: 4,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  hintText: {
    fontFamily: 'Courier Prime',
    fontSize: 8,
    letterSpacing: 1.5,
  },
})
