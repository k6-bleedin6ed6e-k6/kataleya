// components/error-boundary.tsx
// root-level safety net — a render exception should never white-screen
// the app, especially not at 2am. local-only logging, no remote reporting
// (no-spying principle applies here too).

import { Component, type ReactNode } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    if (__DEV__) {
      console.error('[kataleya] uncaught render error:', error);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.text}>something broke. breathe.</Text>
          <Text style={styles.subtext}>the garden is still here.</Text>
          <Pressable
            onPress={() => this.setState({ hasError: false })}
            style={styles.button}
          >
            <Text style={styles.buttonText}>[ return ]</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050508',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  text: {
    fontFamily: 'Courier Prime',
    fontSize: 14,
    color: '#8090b0',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtext: {
    fontFamily: 'Courier Prime',
    fontSize: 11,
    color: 'rgba(128,144,176,0.4)',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    borderWidth: 1,
    borderColor: 'rgba(128,144,176,0.3)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 2,
  },
  buttonText: {
    fontFamily: 'Courier Prime',
    fontSize: 12,
    color: '#8090b0',
  },
});
