// app/settings.tsx
// system configuration — real settings, terminal aesthetic.
// no fake metrics. editable user params. data purge.

import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  Animated,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useCircadian } from '../hooks/use-circadian'
import {
  getAttunement,
  setAttunement,
  getBreathTechnique,
  setBreathTechnique,
  getHapticsEnabled,
  setHapticsEnabled,
  clearSurfaceVault,
  type BreathTechnique,
  type Attunement,
} from '../utils/storage'
import { clearSanctuary } from '../utils/sanctuary'

const GREEN = '#33ff33'
const GREEN_DIM = '#22cc22'
const RED = '#ff4444'
const BLACK = '#000000'

const TECHNIQUES: BreathTechnique[] = ['resonant', '4-7-8', 'box']

export default function SettingsScreen() {
  const router = useRouter()
  const { phase } = useCircadian()
  const [name, setName] = useState('')
  const [sobrietyDate, setSobrietyDate] = useState('')
  const [technique, setTechnique] = useState<BreathTechnique>('resonant')
  const [haptics, setHaptics] = useState(true)
  const [saved, setSaved] = useState(false)
  const [showCursor, setShowCursor] = useState(true)
  const fadeAnim = useRef(new Animated.Value(0)).current

  const loadData = useCallback(async () => {
    const attunement = await getAttunement()
    if (attunement) {
      setName(attunement.name)
      setSobrietyDate(attunement.sobriety_date)
    }
    const t = await getBreathTechnique()
    setTechnique(t)
    const h = await getHapticsEnabled()
    setHaptics(h)
  }, [])

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

  async function saveAttunement() {
    if (name && sobrietyDate) {
      await setAttunement({ name, sobriety_date: sobrietyDate })
      setSaved(true)
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.delay(1200),
        Animated.timing(fadeAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start(() => setSaved(false))
    }
  }

  async function cycleTechnique() {
    const next = TECHNIQUES[(TECHNIQUES.indexOf(technique) + 1) % TECHNIQUES.length]
    setTechnique(next)
    await setBreathTechnique(next)
  }

  async function toggleHaptics() {
    const next = !haptics
    setHaptics(next)
    await setHapticsEnabled(next)
  }

  async function handlePurge() {
    clearSanctuary()
    await clearSurfaceVault()
    router.replace('/onboarding')
  }

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

  const now = new Date()
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}_utc`

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.content} {...pan.panHandlers}>
        {/* header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>{'<'} back</Text>
          </TouchableOpacity>
          <View style={styles.progress}>
            <Text style={styles.progressText}>[ . . . ]</Text>
          </View>
          <View style={styles.backBtn} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* system config */}
          <View style={styles.panel}>
            <View style={styles.panelHeader}>
              <Text style={styles.panelTitle}>[ system_configuration ]</Text>
              <Text style={styles.panelVersion}>v.1.0.4</Text>
            </View>
            <View style={styles.panelBody}>
              <Text style={styles.panelLine}>{'>'} root_access: granted</Text>
              <Text style={styles.panelLine}>{'>'} last_login: {timeStr}</Text>
              <Text style={styles.panelLine}>{'>'} status: nominal</Text>
            </View>
          </View>

          {/* core diagnostics */}
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>[ core_diagnostics ]</Text>
            <View style={styles.panelBody}>
              <View style={styles.diagRow}>
                <View style={styles.diagLeft}>
                  <Text style={styles.diagPrompt}>{'>'}</Text>
                  <Text style={styles.diagLabel}>neural_link_status</Text>
                </View>
                <Text style={styles.diagValue}>active</Text>
              </View>
              <View style={styles.diagRow}>
                <View style={styles.diagLeft}>
                  <Text style={styles.diagPrompt}>{'>'}</Text>
                  <Text style={styles.diagLabel}>void_sensor_calibration</Text>
                </View>
                <Text style={[styles.diagValue, { color: RED }]}>req_update</Text>
              </View>
              <View style={styles.diagRow}>
                <View style={styles.diagLeft}>
                  <Text style={styles.diagPrompt}>{'>'}</Text>
                  <Text style={styles.diagLabel}>circadian_rhythm_sync</Text>
                </View>
                <Text style={styles.diagValue}>{phase}</Text>
              </View>
            </View>
          </View>

          {/* user parameters */}
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>[ user_parameters ]</Text>
            <View style={styles.panelBody}>
              {/* name */}
              <View style={styles.paramRow}>
                <View style={styles.paramLeft}>
                  <Text style={styles.paramPrompt}>{'>'}</Text>
                  <Text style={styles.paramLabel}>profile_identifier</Text>
                </View>
                <TextInput
                  style={styles.paramInput}
                  value={name}
                  onChangeText={setName}
                  placeholder="name"
                  placeholderTextColor={`${GREEN}30`}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* sobriety date */}
              <View style={styles.paramRow}>
                <View style={styles.paramLeft}>
                  <Text style={styles.paramPrompt}>{'>'}</Text>
                  <Text style={styles.paramLabel}>sobriety_origin</Text>
                </View>
                <TextInput
                  style={styles.paramInput}
                  value={sobrietyDate}
                  onChangeText={setSobrietyDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={`${GREEN}30`}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* save */}
              <TouchableOpacity onPress={saveAttunement} style={styles.saveBtn}>
                <Text style={styles.saveText}>{'>'} commit_changes</Text>
              </TouchableOpacity>

              {saved && (
                <Animated.View style={{ opacity: fadeAnim }}>
                  <Text style={styles.savedText}>[ ok ] parameters_updated</Text>
                </Animated.View>
              )}

              {/* breath technique */}
              <TouchableOpacity onPress={cycleTechnique} style={styles.paramRow}>
                <View style={styles.paramLeft}>
                  <Text style={styles.paramPrompt}>{'>'}</Text>
                  <Text style={styles.paramLabel}>breath_technique</Text>
                </View>
                <Text style={styles.paramValue}>{technique}</Text>
              </TouchableOpacity>

              {/* haptics */}
              <TouchableOpacity onPress={toggleHaptics} style={styles.paramRow}>
                <View style={styles.paramLeft}>
                  <Text style={styles.paramPrompt}>{'>'}</Text>
                  <Text style={styles.paramLabel}>haptic_feedback</Text>
                </View>
                <Text style={styles.paramValue}>{haptics ? '[ x ]' : '[   ]'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* security */}
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>[ sec_protocols ]</Text>
            <View style={styles.panelBody}>
              <View style={styles.paramRow}>
                <View style={styles.paramLeft}>
                  <Text style={styles.paramPrompt}>{'>'}</Text>
                  <Text style={styles.paramLabel}>biometric_lock</Text>
                </View>
                <Text style={styles.paramValue}>[ x ]</Text>
              </View>
              <View style={styles.paramRow}>
                <View style={styles.paramLeft}>
                  <Text style={styles.paramPrompt}>{'>'}</Text>
                  <Text style={styles.paramLabel}>encryption_level</Text>
                </View>
                <Text style={styles.paramValue}>aes-256</Text>
              </View>
            </View>
          </View>

          {/* execution */}
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>[ execution ]</Text>
            <View style={styles.panelBody}>
              <TouchableOpacity onPress={() => router.back()} style={styles.execRow}>
                <Text style={styles.execPrompt}>{'>'}</Text>
                <Text style={styles.execLabel}>execute_system_reboot</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handlePurge} style={styles.execRow}>
                <Text style={styles.execPrompt}>{'>'}</Text>
                <Text style={[styles.execLabel, { color: RED }]}>purge_local_memory</Text>
              </TouchableOpacity>
            </View>
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

  // header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: GREEN,
  },
  backBtn: {
    width: 64,
  },
  backText: {
    fontFamily: 'Courier Prime',
    fontSize: 12,
    color: GREEN,
    textTransform: 'lowercase',
  },
  progress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  progressText: {
    fontFamily: 'Courier Prime',
    fontSize: 13,
    color: GREEN,
  },

  scroll: {
    paddingTop: 32,
    paddingHorizontal: 22,
    paddingBottom: 48,
  },

  // panels
  panel: {
    borderWidth: 1,
    borderColor: GREEN,
    backgroundColor: BLACK,
    marginBottom: 28,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: GREEN,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  panelTitle: {
    fontFamily: 'Courier Prime',
    fontSize: 11,
    color: GREEN,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  panelVersion: {
    fontFamily: 'Courier Prime',
    fontSize: 10,
    color: GREEN,
    textTransform: 'uppercase',
  },
  panelBody: {
    padding: 14,
    gap: 10,
  },
  panelLine: {
    fontFamily: 'Courier Prime',
    fontSize: 11,
    color: `${GREEN}cc`,
    textTransform: 'lowercase',
  },

  // diagnostics
  diagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  diagLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  diagPrompt: {
    fontFamily: 'Courier Prime',
    fontSize: 12,
    color: GREEN,
  },
  diagLabel: {
    fontFamily: 'Courier Prime',
    fontSize: 12,
    color: `${GREEN}cc`,
    textTransform: 'lowercase',
  },
  diagValue: {
    fontFamily: 'Courier Prime',
    fontSize: 12,
    color: GREEN,
    fontWeight: 'bold',
  },

  // params
  paramRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  paramLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  paramPrompt: {
    fontFamily: 'Courier Prime',
    fontSize: 12,
    color: GREEN,
  },
  paramLabel: {
    fontFamily: 'Courier Prime',
    fontSize: 12,
    color: `${GREEN}cc`,
    textTransform: 'lowercase',
  },
  paramInput: {
    fontFamily: 'Courier Prime',
    fontSize: 12,
    color: GREEN,
    borderBottomWidth: 1,
    borderBottomColor: `${GREEN}40`,
    paddingVertical: 2,
    paddingHorizontal: 6,
    minWidth: 120,
    textAlign: 'right',
  },
  paramValue: {
    fontFamily: 'Courier Prime',
    fontSize: 12,
    color: GREEN,
    fontWeight: 'bold',
  },

  saveBtn: {
    marginTop: 4,
    marginBottom: 8,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  saveText: {
    fontFamily: 'Courier Prime',
    fontSize: 12,
    color: GREEN,
  },
  savedText: {
    fontFamily: 'Courier Prime',
    fontSize: 11,
    color: GREEN_DIM,
    marginBottom: 8,
  },

  // execution
  execRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  execPrompt: {
    fontFamily: 'Courier Prime',
    fontSize: 12,
    color: GREEN,
  },
  execLabel: {
    fontFamily: 'Courier Prime',
    fontSize: 12,
    color: `${GREEN}cc`,
    textTransform: 'lowercase',
  },
})
