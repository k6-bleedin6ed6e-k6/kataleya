// app/vault.tsx
// journal vault — encrypted entries from sanctuary.
// decrypt-flicker reveal animation. no fake data.

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

import {
  getAllJournalEntries,
  getAllMoodLogs,
  type JournalEntry,
  type MoodLog,
} from '../utils/sanctuary'

const GREEN = '#33ff33'
const GREEN_DIM = '#22cc22'
const BLACK = '#000000'

function formatEntryDate(ms: number): string {
  const d = new Date(ms)
  const day = d.getDate().toString().padStart(2, '0')
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  return `entry_${day}.${month}`
}

function formatEntryBody(body: string): string {
  if (body.length <= 28) return body
  return body.slice(0, 28) + '...'
}

function moodLabel(v: number): string {
  const map: Record<number, string> = {
    1: 'storm',
    2: 'rain',
    3: 'grey',
    4: 'clear',
    5: 'sun',
  }
  return map[v] ?? 'unknown'
}

type VaultItem =
  | { type: 'journal'; data: JournalEntry }
  | { type: 'mood'; data: MoodLog }

export default function VaultScreen() {
  const router = useRouter()
  const [entries, setEntries] = useState<VaultItem[]>([])
  const [showCursor, setShowCursor] = useState(true)
  const baseAnim = useRef(new Animated.Value(0)).current

  const loadData = useCallback(() => {
    const journals = getAllJournalEntries(20)
    const moods = getAllMoodLogs(20)
    const combined: VaultItem[] = [
      ...journals.map((j) => ({ type: 'journal' as const, data: j })),
      ...moods.map((m) => ({ type: 'mood' as const, data: m })),
    ]
    combined.sort((a, b) => b.data.logged_at - a.data.logged_at)
    setEntries(combined)

    baseAnim.setValue(0)
    Animated.timing(baseAnim, {
      toValue: 1,
      duration: 1500 + combined.length * 75,
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

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.content} {...pan.panHandlers}>
        {/* header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            [ vault_status: encrypted ]
            <Text style={[styles.cursor, { opacity: showCursor ? 1 : 0 }]}>_</Text>
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* circuit trace line */}
          <View style={styles.traceLine} />

          {/* entry list */}
          <View style={styles.list}>
            {entries.length === 0 && (
              <Text style={styles.empty}>vault empty. no entries found.</Text>
            )}

            {entries.map((entry, i) => {
              const isJournal = entry.type === 'journal'
              const label = isJournal
                ? formatEntryDate(entry.data.logged_at)
                : `mood_${moodLabel(entry.data.mood_value)}`
              const preview = isJournal
                ? formatEntryBody(entry.data.body)
                : `phase: ${entry.data.phase}`

              return (
                <Animated.View
                  key={`${entry.type}-${entry.data.id}`}
                  style={[
                    styles.entryRow,
                    {
                      opacity: baseAnim.interpolate({
                        inputRange: [i * 0.05, i * 0.05 + 0.2, 1],
                        outputRange: [0, 1, 1],
                        extrapolate: 'clamp',
                      }),
                    },
                  ]}
                >
                  {/* trace connector */}
                  <View style={styles.connector}>
                    <View style={styles.connectorLine} />
                    <View style={styles.connectorDot} />
                  </View>

                  <TouchableOpacity style={styles.entryContent} activeOpacity={0.6}>
                    <Text style={styles.entryLabel}>{`[ ${label} ]`}</Text>
                    <Text style={styles.entryPreview}>{preview}</Text>
                  </TouchableOpacity>
                </Animated.View>
              )
            })}
          </View>

          {/* footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {entries.length} entries decrypted
            </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.footerExit}>[ exit_vault ]</Text>
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
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: `${GREEN}20`,
  },
  headerTitle: {
    fontFamily: 'Courier Prime',
    fontSize: 13,
    color: GREEN,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  cursor: {
    fontFamily: 'Courier Prime',
    fontSize: 14,
    color: GREEN,
  },
  scroll: {
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 48,
    flexGrow: 1,
  },

  // trace line
  traceLine: {
    position: 'absolute',
    left: 31,
    top: 24,
    bottom: 80,
    width: 1,
    backgroundColor: `${GREEN}40`,
    zIndex: 0,
  },

  // list
  list: {
    gap: 20,
    zIndex: 1,
  },
  empty: {
    fontFamily: 'Courier Prime',
    fontSize: 12,
    color: `${GREEN}40`,
    fontStyle: 'italic',
    marginTop: 16,
  },

  // entry
  entryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  connector: {
    width: 24,
    alignItems: 'center',
    marginRight: 12,
    marginTop: 8,
  },
  connectorLine: {
    width: 15,
    height: 1,
    backgroundColor: `${GREEN}40`,
    position: 'relative',
  },
  connectorDot: {
    position: 'absolute',
    left: -2,
    top: -2,
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: BLACK,
    borderWidth: 1,
    borderColor: GREEN,
  },
  entryContent: {
    flex: 1,
    paddingVertical: 4,
  },
  entryLabel: {
    fontFamily: 'Courier Prime',
    fontSize: 12,
    color: GREEN,
    letterSpacing: 2,
    fontWeight: 'bold',
    textTransform: 'lowercase',
  },
  entryPreview: {
    fontFamily: 'Courier Prime',
    fontSize: 11,
    color: `${GREEN}60`,
    marginTop: 4,
    textTransform: 'lowercase',
  },

  // footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 32,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: `${GREEN}20`,
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
