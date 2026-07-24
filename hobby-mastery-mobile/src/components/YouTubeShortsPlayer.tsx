import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
  Dimensions, FlatList, Image, ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Feather } from '@expo/vector-icons';
import { Theme } from '../utils/theme';
import { YouTubeShortsService, YouTubeShort } from '../services/YouTubeShortsService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.42;
const CARD_HEIGHT = CARD_WIDTH * 1.6;

interface YouTubeShortsPlayerProps {
  query: string;
  visible: boolean;
}

export const YouTubeShortsPlayer = ({ query, visible }: YouTubeShortsPlayerProps) => {
  const [shorts, setShorts] = useState<YouTubeShort[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible || !query) return;

    const load = async () => {
      setLoading(true);
      const results = await YouTubeShortsService.fetchShorts(query);
      setShorts(results);
      setLoading(false);
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    };

    load();
  }, [query, visible]);

  if (!visible) return null;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={Theme.colors.primary} />
        <Text style={styles.loadingText}>Finding tutorials...</Text>
      </View>
    );
  }

  if (shorts.length === 0) {
    return null;
  }

  const playerHtml = (videoId: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #000; overflow: hidden; }
        iframe { width: 100%; height: 100%; border: none; border-radius: 16px; }
      </style>
    </head>
    <body>
      <iframe
        src="https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&controls=1&rel=0&modestbranding=1&playsinline=1&loop=1"
        allow="autoplay; encrypted-media"
        allowfullscreen
      ></iframe>
    </body>
    </html>
  `;

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(0)}K`;
    return `${views}`;
  };

  const renderShort = ({ item }: { item: YouTubeShort }) => (
    <TouchableOpacity
      style={styles.shortCard}
      activeOpacity={0.9}
      onPress={() => setActiveVideoId(item.videoId === activeVideoId ? null : item.videoId)}
    >
      {activeVideoId === item.videoId ? (
        <View style={styles.webviewContainer}>
          <WebView
            source={{ html: playerHtml(item.videoId) }}
            style={styles.webview}
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled
            scrollEnabled={false}
          />
          <TouchableOpacity
            style={styles.closePlayerBtn}
            onPress={() => setActiveVideoId(null)}
          >
            <Feather name="x" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
          <View style={styles.playOverlay}>
            <View style={styles.playCircle}>
              <Feather name="play" size={20} color="#FFFFFF" />
            </View>
          </View>
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{item.duration}</Text>
          </View>
          <View style={styles.shortInfo}>
            <Text style={styles.shortTitle} numberOfLines={2}>{item.title}</Text>
            <View style={styles.shortMeta}>
              <Text style={styles.shortAuthor}>{item.author}</Text>
              <Text style={styles.shortViews}>{formatViews(item.views)} views</Text>
            </View>
          </View>
        </>
      )}
    </TouchableOpacity>
  );

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.header}>
        <View style={styles.ytIconWrapper}>
          <Feather name="youtube" size={16} color="#FF0000" />
        </View>
        <Text style={styles.headerTitle}>Related Shorts</Text>
        <Text style={styles.headerCount}>{shorts.length} found</Text>
      </View>
      <FlatList
        data={shorts}
        keyExtractor={(item) => item.videoId}
        renderItem={renderShort}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        snapToInterval={CARD_WIDTH + 12}
        decelerationRate="fast"
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 10,
  },
  loadingText: {
    ...Theme.typography.bodySm,
    color: 'rgba(255,255,255,0.6)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  ytIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,0,0,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...Theme.typography.headingSm,
    color: '#FFFFFF',
    flex: 1,
  },
  headerCount: {
    ...Theme.typography.caption,
    color: 'rgba(255,255,255,0.5)',
  },
  listContent: {
    gap: 12,
  },
  shortCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  thumbnail: {
    width: '100%',
    height: CARD_HEIGHT * 0.65,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    height: CARD_HEIGHT * 0.65,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  playCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,0,0,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 3,
  },
  durationBadge: {
    position: 'absolute',
    top: CARD_HEIGHT * 0.65 - 28,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  durationText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  shortInfo: {
    padding: 10,
    flex: 1,
    justifyContent: 'space-between',
  },
  shortTitle: {
    ...Theme.typography.bodySm,
    color: '#FFFFFF',
    fontWeight: '600',
    lineHeight: 16,
  },
  shortMeta: {
    marginTop: 4,
  },
  shortAuthor: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
  },
  shortViews: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 2,
  },
  webviewContainer: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 16,
  },
  webview: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  closePlayerBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
});
