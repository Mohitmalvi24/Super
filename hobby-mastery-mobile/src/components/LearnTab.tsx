import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, Easing,
  FlatList, Dimensions, Share, TouchableWithoutFeedback,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';


const VISUALIZER_BAR_COUNT = 5;
const VISUALIZER_BAR_REST_HEIGHT = 10;
const SCREEN_DIMENSIONS = Dimensions.get('window');


const AudioVisualizer = ({ isPlaying }: { isPlaying: boolean }) => {
  const bars = useRef(
    Array.from({ length: VISUALIZER_BAR_COUNT }, () => new Animated.Value(VISUALIZER_BAR_REST_HEIGHT))
  ).current;

  useEffect(() => {
    if (isPlaying) {
      const animations = bars.map(bar =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(bar, {
              toValue: Math.random() * 40 + 20,
              duration: Math.random() * 200 + 200,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: false,
            }),
            Animated.timing(bar, {
              toValue: VISUALIZER_BAR_REST_HEIGHT,
              duration: Math.random() * 200 + 200,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: false,
            }),
          ])
        )
      );
      Animated.parallel(animations).start();
      return () => animations.forEach(a => a.stop());
    }

    bars.forEach(bar =>
      Animated.timing(bar, {
        toValue: VISUALIZER_BAR_REST_HEIGHT,
        duration: 300,
        useNativeDriver: false,
      }).start()
    );
  }, [isPlaying]);

  return (
    <View style={styles.visualizerContainer}>
      {bars.map((bar, i) => (
        <Animated.View key={i} style={[styles.visualizerBar, { height: bar }]} />
      ))}
    </View>
  );
};


interface LearnTabProps {
  proTips: string[];
  savedTips: string[];
  setSavedTips: React.Dispatch<React.SetStateAction<string[]>>;
}


export const LearnTab = ({ proTips, savedTips, setSavedTips }: LearnTabProps) => {
  const [playingIndex, setPlayingIndex] = useState(-1);
  const [likedIndices, setLikedIndices] = useState<Set<number>>(new Set());
  const [containerHeight, setContainerHeight] = useState(SCREEN_DIMENSIONS.height - 80);

  useEffect(() => {
    return () => { Speech.stop(); };
  }, []);

  const handleScrollBeginDrag = useCallback(() => {
    Speech.stop();
    setPlayingIndex(-1);
  }, []);

  const toggleAudio = useCallback((index: number, text: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (playingIndex === index) {
      Speech.stop();
      setPlayingIndex(-1);
      return;
    }

    Speech.stop();
    Speech.speak(text, {
      onDone: () => setPlayingIndex(-1),
      onStopped: () => setPlayingIndex(-1),
    });
    setPlayingIndex(index);
  }, [playingIndex]);

  const toggleLike = useCallback((index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLikedIndices(prev => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  }, []);

  const toggleSave = useCallback((tip: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSavedTips(prev =>
      prev.includes(tip) ? prev.filter(t => t !== tip) : [...prev, tip]
    );
  }, [setSavedTips]);

  const handleShare = useCallback(async (tip: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        message: `Check out this pro tip from Hobby Mastery:\n\n"${tip}"`,
      });
    } catch (err) {
      console.error('Share failed:', err);
    }
  }, []);

  if (proTips.length === 0) {
    return (
      <View style={[styles.container, styles.emptyContainer]}>
        <Feather name="headphones" size={48} color="#CBD5E1" />
        <Text style={styles.emptyText}>Start a lesson to unlock audio shorts.</Text>
      </View>
    );
  }

  return (
    <View
      style={styles.container}
      onLayout={e => setContainerHeight(e.nativeEvent.layout.height)}
    >
      <FlatList
        data={proTips}
        keyExtractor={(_, i) => String(i)}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={handleScrollBeginDrag}
        getItemLayout={(_, index) => ({
          length: containerHeight,
          offset: containerHeight * index,
          index,
        })}
        renderItem={({ item, index }) => {
          const isPlaying = playingIndex === index;
          const isLiked = likedIndices.has(index);
          const isSaved = savedTips.includes(item);

          return (
            <TouchableWithoutFeedback onPress={() => toggleAudio(index, item)}>
              <View style={{ width: SCREEN_DIMENSIONS.width, height: containerHeight }}>
                <LinearGradient
                  colors={['#1E293B', '#0F172A']}
                  style={StyleSheet.absoluteFill}
                />

                <View style={styles.overlay}>
                  <AudioVisualizer isPlaying={isPlaying} />

                  <View style={styles.contentArea}>
                    <View style={styles.badge}>
                      <Feather name="headphones" size={12} color="#FBBF24" />
                      <Text style={styles.badgeLabel}>PRO TIP AUDIO</Text>
                    </View>

                    <Text style={styles.tipText}>{item}</Text>

                    <TouchableOpacity
                      style={styles.playBtn}
                      onPress={() => toggleAudio(index, item)}
                    >
                      <Feather
                        name={isPlaying ? 'pause' : 'play'}
                        size={20}
                        color="#0F172A"
                      />
                      <Text style={styles.playBtnLabel}>
                        {isPlaying ? 'Playing...' : 'Play Audio Insight'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.sidebar}>
                    <TouchableOpacity
                      style={styles.sidebarItem}
                      onPress={() => toggleLike(index)}
                    >
                      <View style={styles.sidebarIconWrap}>
                        <Ionicons
                          name={isLiked ? 'heart' : 'heart-outline'}
                          size={26}
                          color={isLiked ? '#EF4444' : '#FFFFFF'}
                        />
                      </View>
                      <Text style={styles.sidebarLabel}>Like</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.sidebarItem}
                      onPress={() => toggleSave(item)}
                    >
                      <View style={styles.sidebarIconWrap}>
                        <Feather
                          name="bookmark"
                          size={24}
                          color={isSaved ? '#FBBF24' : '#FFFFFF'}
                        />
                      </View>
                      <Text style={styles.sidebarLabel}>
                        {isSaved ? 'Saved' : 'Save'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.sidebarItem}
                      onPress={() => handleShare(item)}
                    >
                      <View style={styles.sidebarIconWrap}>
                        <Feather name="share-2" size={24} color="#FFFFFF" />
                      </View>
                      <Text style={styles.sidebarLabel}>Share</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          );
        }}
      />
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#F8FAFC',
  },
  emptyText: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 16,
  },


  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 24,
    paddingBottom: 100,
  },
  contentArea: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingRight: 60,
  },

  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(251,191,36,0.1)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.2)',
  },
  badgeLabel: {
    color: '#FBBF24',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },

  tipText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 34,
    marginBottom: 24,
  },

  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#38BDF8',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  playBtnLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },


  sidebar: {
    position: 'absolute',
    right: 16,
    bottom: 120,
    alignItems: 'center',
    gap: 24,
  },
  sidebarItem: {
    alignItems: 'center',
    gap: 6,
  },
  sidebarIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sidebarLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },


  visualizerContainer: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    height: 100,
  },
  visualizerBar: {
    width: 6,
    backgroundColor: '#38BDF8',
    borderRadius: 3,
  },
});
