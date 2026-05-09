// surface/mercury-caduceus.tsx
// seven intertwining helix threads — organic S-curves with staggered flow
// depth layers: foreground (sharp), mid (soft), background (ghost)

import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

const { width, height: h } = Dimensions.get('window');

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface MercuryCaduceusProps {
  phaseColor: string;
  flowDuration?: number;
}

// ─── strand definitions ──────────────────────────────────────────
// Each strand: path template, depth layer, dash/gap, speed multiplier
// Depth: 0=foreground (bright, sharp), 1=mid, 2=background (ghost)
type Strand = {
  path: string;
  depth: 0 | 1 | 2;
  dash: number;
  gap: number;
  speed: number;
  width: number;
};

function buildStrands(): Strand[] {
  // Primary helixes — the main serpents
  const left = `M46 ${h} C 78 ${h * 0.88}, 74 ${h * 0.72}, 48 ${h * 0.57}
    S 18 ${h * 0.41}, 48 ${h * 0.26} S 78 ${h * 0.10}, 48 0`;
  const right = `M54 ${h} C 22 ${h * 0.88}, 26 ${h * 0.72}, 52 ${h * 0.57}
    S 82 ${h * 0.41}, 52 ${h * 0.26} S 22 ${h * 0.10}, 52 0`;

  // Secondary offset strands — depth and asymmetry
  const leftMid = `M43 ${h} C 72 ${h * 0.87}, 68 ${h * 0.71}, 44 ${h * 0.56}
    S 16 ${h * 0.40}, 44 ${h * 0.25} S 74 ${h * 0.11}, 46 2`;
  const rightMid = `M57 ${h} C 28 ${h * 0.87}, 32 ${h * 0.71}, 56 ${h * 0.56}
    S 84 ${h * 0.40}, 56 ${h * 0.25} S 26 ${h * 0.11}, 54 2`;

  // Ghost strands — very faint, slow, wide gaps
  const leftGhost = `M40 ${h} Q 50 ${h * 0.60} 46 ${h * 0.30} T 44 8`;
  const rightGhost = `M60 ${h} Q 50 ${h * 0.60} 54 ${h * 0.30} T 56 8`;

  return [
    { path: left,      depth: 0, dash: 18, gap: 28, speed: 1.00, width: 0.75 },
    { path: right,     depth: 0, dash: 18, gap: 28, speed: 1.00, width: 0.75 },
    { path: leftMid,   depth: 1, dash: 12, gap: 38, speed: 0.72, width: 0.55 },
    { path: rightMid,  depth: 1, dash: 12, gap: 38, speed: 0.72, width: 0.55 },
    { path: leftGhost, depth: 2, dash: 8,  gap: 56, speed: 0.45, width: 0.35 },
    { path: rightGhost,depth: 2, dash: 8,  gap: 56, speed: 0.45, width: 0.35 },
    // central spine — hairline, no dash
    { path: `M50 ${h} L50 0`, depth: 1, dash: 6, gap: 44, speed: 0.60, width: 0.30 },
  ];
}

const STRANDS = buildStrands();

const DEPTH_OPACITY = [0.55, 0.22, 0.08];

export function MercuryCaduceus({ phaseColor, flowDuration = 7000 }: MercuryCaduceusProps) {
  const flows = useRef(STRANDS.map(() => new Animated.Value(0))).current;
  const mountFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anims: Animated.CompositeAnimation[] = [];

    STRANDS.forEach((s, i) => {
      const period = s.dash + s.gap;
      flows[i].setValue(0);
      const anim = Animated.loop(
        Animated.timing(flows[i], {
          toValue: period,
          duration: flowDuration / s.speed,
          easing: Easing.linear,
          useNativeDriver: false,
        })
      );
      anim.start();
      anims.push(anim);
    });

    Animated.timing(mountFade, {
      toValue: 1,
      duration: 2600,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();

    return () => anims.forEach(a => a.stop());
  }, [flowDuration]);

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { opacity: mountFade }]} pointerEvents="none">
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg
          height={h}
          width={width}
          viewBox={`0 0 100 ${h}`}
          preserveAspectRatio="none"
        >
          <Defs>
            <LinearGradient id="mc-grad-0" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0"    stopColor={phaseColor} stopOpacity="0.38" />
              <Stop offset="0.28" stopColor={phaseColor} stopOpacity="0.14" />
              <Stop offset="0.58" stopColor={phaseColor} stopOpacity="0.04" />
              <Stop offset="1"    stopColor={phaseColor} stopOpacity="0"    />
            </LinearGradient>
            <LinearGradient id="mc-grad-1" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0"    stopColor={phaseColor} stopOpacity="0.16" />
              <Stop offset="0.32" stopColor={phaseColor} stopOpacity="0.06" />
              <Stop offset="1"    stopColor={phaseColor} stopOpacity="0"    />
            </LinearGradient>
            <LinearGradient id="mc-grad-2" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0"    stopColor={phaseColor} stopOpacity="0.07" />
              <Stop offset="0.40" stopColor={phaseColor} stopOpacity="0.025" />
              <Stop offset="1"    stopColor={phaseColor} stopOpacity="0"    />
            </LinearGradient>
          </Defs>

          {STRANDS.map((s, i) => {
            const gradId = `mc-grad-${s.depth}`;
            const period = s.dash + s.gap;
            return (
              <AnimatedPath
                key={i}
                d={s.path}
                stroke={`url(#${gradId})`}
                strokeWidth={s.width}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${s.dash} ${s.gap}`}
                strokeDashoffset={flows[i]}
                strokeOpacity={DEPTH_OPACITY[s.depth]}
              />
            );
          })}
        </Svg>
      </View>
    </Animated.View>
  );
}
