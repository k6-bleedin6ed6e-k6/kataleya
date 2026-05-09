// app/mirror.tsx
// physician mirror — temporal entity for shared clinical reflection.
// landscape-agnostic: stacked sections instead of side-by-side.

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
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useCircadian } from '../hooks/use-circadian'
import { BASE } from '../constants/palettes'

const { width: W, height: H } = Dimensions.get('window')

const SCARS = [
  { text: '0XFF_STABLE', left: '12%', top: -8 },
  { text: '::RESONANCE_SCAN::', left: '38%', bottom: -12, opacity: 0.2 },
  { text: 'V_0.9.4_AURORA', right: '25%', top: -8 },
  { text: 'PHASE_DAWN', right: '5%', bottom: -12, opacity: 0.2 },
]

export default function MirrorScreen() {
  const router = useRouter()
  const { phase, palette } = useCircadian()
  const [integrity, setIntegrity] = useState(98.4)
  const scanY = useRef(new Animated.Value(-100)).current

  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(scanY, {
        toValue: H + 100,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    )
    anim.start()
    return () => anim.stop()
  }, [])

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

  // markers data
  const markers = [
    { icon: '○', label: 'Seed',  color: `${palette.accent}66`, size: 24 },
    { icon: '◎', label: 'Root',  color: `${palette.accent}cc`, size: 36, glow: true },
    { icon: '◉', label: 'Bloom', color: `${palette.highlight}66`, size: 24 },
  ]

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.content} {...pan.panHandlers}>

        {/* scanline */}
        <Animated.View
          style={[
            styles.scanline,
            { backgroundColor: `${palette.accent}0d` },
            { transform: [{ translateY: scanY }] },
          ]}
          pointerEvents="none"
        />

        {/* header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.headerDot, { color: palette.accent }]}>●</Text>
            <Text style={[styles.headerTitle, { color: palette.accent }]}>KATALEYA</Text>
          </View>
        </View>

        {/* ── above the line: presence heatmap ── */}
        <View style={styles.sky}>
          <View style={styles.markersRow}>
            {markers.map((m, i) => (
              <View key={i} style={styles.marker}>
                {m.glow && (
                  <View style={[styles.markerGlow, { backgroundColor: `${palette.accent}33` }]} />
                )}
                <Text style={[styles.markerIcon, { color: m.color, fontSize: m.size }]}>
                  {m.icon}
                </Text>
                <View style={[styles.markerLine, { backgroundColor: `${m.color}99` }]} />
                <Text style={[styles.markerLabel, { color: m.color }]}>{m.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── the horizon line: fortress ── */}
        <View style={styles.horizonWrap}>
          <View style={[styles.horizon, { backgroundColor: `${palette.accent}80`, shadowColor: palette.accent }]}>
            {SCARS.map((scar, i) => (
              <Text
                key={i}
                style={[
                  styles.scar,
                  {
                    color: `${palette.accent}99`,
                    ...(scar.left ? { left: parseFloat(scar.left) } : {}),
                    ...(scar.right ? { right: parseFloat(scar.right) } : {}),
                    ...(scar.top !== undefined ? { top: scar.top } : {}),
                    ...(scar.bottom !== undefined ? { bottom: scar.bottom } : {}),
                    opacity: scar.opacity ?? 0.3,
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
          <View style={styles.horizonPhrase}>
            <Text style={[styles.horizonPhraseText, { color: `${palette.accent}cc` }]}>
              stay with me
            </Text>
          </View>
        </View>

        {/* ── below the line: mercury tide ── */}
        <View style={styles.tide}>
          <View style={[styles.tideGrad, { backgroundColor: palette.shadow }]} />
          <View style={styles.tideMarkers}>
            <View style={styles.tideMarker}>
              <View style={[styles.tideBar, { width: 80, backgroundColor: `${BASE.text}33` }]} />
              <Text style={[styles.tideLabel, { color: `${BASE.text}66` }]}>(..: :..) Void</Text>
            </View>
            <View style={styles.tideMarker}>
              <View style={[styles.tideBar, { width: 120, backgroundColor: `${palette.accent}66`, shadowColor: palette.accent }]} />
              <Text style={[styles.tideLabel, { color: palette.accent }]}>Stable</Text>
            </View>
            <View style={styles.tideMarker}>
              <View style={[styles.tideBar, { width: 80, backgroundColor: `${BASE.text}33` }]} />
              <Text style={[styles.tideLabel, { color: `${BASE.text}66` }]}>Renewal</Text>
            </View>
          </View>
        </View>

        {/* ── footer controls ── */}
        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            <Text style={[styles.footerLabel, { color: `${BASE.text}66` }]}>INTEGRITY_INDEX</Text>
            <Text style={[styles.footerValue, { color: `${palette.accent}cc` }]}>{integrity}%</Text>
          </View>

          <Pressable
            onPress={recalibrate}
            style={[styles.recalibrateBtn, { borderColor: `${palette.accent}33` }]}
          >
            <Text style={[styles.recalibrateText, { color: `${palette.accent}b3` }]}>
              RECALIBRATE_MIRROR
            </Text>
          </Pressable>

          <Text style={[styles.footerOrigin, { color: `${BASE.text}33` }]}>
            // origin: thinkBad-doGood-sa.my
          </Text>
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
  },
  scanline: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 80,
    zIndex: 100,
    pointerEvents: 'none',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 8,
    zIndex: 10,
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
    letterSpacing: 4,
  },
  // sky section
  sky: {
    flex: 1.2,
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
    gap: 8,
  },
  markerGlow: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    transform: [{ scale: 1.5 }],
  },
  markerIcon: {
    fontFamily: 'Courier Prime',
  },
  markerLine: {
    width: 1,
    height: 24,
  },
  markerLabel: {
    fontFamily: 'Courier Prime',
    fontSize: 8,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  // horizon
  horizonWrap: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  horizon: {
    width: '100%',
    height: 2,
    shadowRadius: 12,
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 0 },
  },
  horizonPhrase: {
    marginTop: 12,
  },
  horizonPhraseText: {
    fontFamily: 'Courier Prime',
    fontSize: 10,
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  scar: {
    position: 'absolute',
    fontFamily: 'Courier Prime',
    fontSize: 7,
    letterSpacing: -0.5,
  },
  horizonNode: {
    position: 'absolute',
    top: -2,
    width: 5,
    height: 5,
    borderRadius: 3,
    shadowRadius: 6,
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 0 },
  },
  // tide
  tide: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    overflow: 'hidden',
  },
  tideGrad: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.15,
  },
  tideMarkers: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tideMarker: {
    alignItems: 'center',
    gap: 8,
  },
  tideBar: {
    height: 3,
    borderRadius: 2,
  },
  tideLabel: {
    fontFamily: 'Courier Prime',
    fontSize: 8,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  // footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 12,
  },
  footerLeft: {
    gap: 4,
  },
  footerLabel: {
    fontFamily: 'Courier Prime',
    fontSize: 8,
    letterSpacing: 2,
  },
  footerValue: {
    fontFamily: 'Courier Prime',
    fontSize: 20,
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
    fontSize: 9,
    letterSpacing: 2,
  },
  footerOrigin: {
    fontFamily: 'Courier Prime',
    fontSize: 7,
    letterSpacing: 1,
    maxWidth: 100,
    textAlign: 'right',
  },
  hint: {
    position: 'absolute',
    bottom: 8,
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
