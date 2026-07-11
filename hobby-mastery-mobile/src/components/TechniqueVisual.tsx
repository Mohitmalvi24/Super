import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const normalize = (value: string): string => value.trim().toLowerCase();

export const getHobbyKind = (hobby: string): 'chess' | 'football' | 'generic' => {
  const normalized = normalize(hobby);
  if (normalized.includes('chess')) return 'chess';
  if (normalized.includes('football') || normalized.includes('soccer')) return 'football';
  return 'generic';
};

export const CHESS_TITLES = ['Fork', 'Pin', 'Skewer', 'Checkmate Patterns'];
export const FOOTBALL_TITLES = ['First Touch', 'Passing Lanes', 'Ball Control', 'Finishing'];

export const getDisplayName = (hobby: string, technique: { name: string }, index: number): string => {
  const kind = getHobbyKind(hobby);
  const current = normalize(technique.name);
  const isGeneric = current.includes('fundamental') || current.includes('structured practice') || current.includes('advanced practice');

  if (kind === 'chess') return CHESS_TITLES[index % CHESS_TITLES.length];
  if (kind === 'football' && isGeneric) return FOOTBALL_TITLES[index % FOOTBALL_TITLES.length];
  return technique.name;
};

export const ChessVisual = ({ variant = 0, compact = false }: { variant?: number; compact?: boolean }) => {
  const pieces = [
    [{ row: 2, col: 2, label: 'N' }, { row: 0, col: 6, label: 'R' }, { row: 5, col: 6, label: 'Q' }],
    [{ row: 1, col: 5, label: 'B' }, { row: 5, col: 5, label: 'B' }],
    [{ row: 1, col: 4, label: 'R' }, { row: 5, col: 4, label: 'Q' }],
    [{ row: 1, col: 5, label: 'B' }, { row: 3, col: 7, label: 'K' }],
  ][variant % 4];

  return (
    <View style={[styles.boardVisual, compact && styles.boardVisualCompact]}>
      {Array.from({ length: 64 }).map((_, cell) => {
        const row = Math.floor(cell / 8);
        const col = cell % 8;
        const piece = pieces.find(p => p.row === row && p.col === col);
        return (
          <View
            key={cell}
            style={[
              styles.boardSquare,
              (row + col) % 2 === 0 ? styles.boardSquareLight : styles.boardSquareDark,
            ]}
          >
            {piece && <Text style={styles.boardPiece}>{piece.label}</Text>}
          </View>
        );
      })}
      {variant % 4 === 0 && (
        <>
          <View style={[styles.tacticLine, styles.tacticLineOne]} />
          <View style={[styles.tacticLine, styles.tacticLineTwo]} />
        </>
      )}
      {variant % 4 === 1 && <View style={[styles.tacticLine, styles.pinLine]} />}
      {variant % 4 === 2 && <View style={[styles.tacticLine, styles.skewerLine]} />}
    </View>
  );
};

export const FootballVisual = ({ variant = 0, compact = false }: { variant?: number; compact?: boolean }) => (
  <View style={[styles.pitchVisual, compact && styles.pitchVisualCompact]}>
    <View style={styles.pitchCenterCircle} />
    <View style={styles.pitchMidline} />
    <View style={[styles.pitchPlayer, styles.pitchPlayerOne]} />
    <View style={[styles.pitchPlayer, styles.pitchPlayerTwo]} />
    <View style={[styles.pitchPlayer, styles.pitchPlayerThree]} />
    <View style={[styles.pitchBall, variant % 2 === 0 ? styles.pitchBallOne : styles.pitchBallTwo]} />
    <View style={[styles.pitchRunLine, variant % 2 === 0 ? styles.pitchRunLineOne : styles.pitchRunLineTwo]} />
  </View>
);

export const TechniqueVisual = ({
  hobby,
  imageUri,
  index,
  compact = false,
  fallback,
}: {
  hobby: string;
  imageUri?: string;
  index: number;
  compact?: boolean;
  fallback: string;
}) => {
  const kind = getHobbyKind(hobby);
  if (kind === 'chess') return <ChessVisual variant={index} compact={compact} />;
  if (kind === 'football') return <FootballVisual variant={index} compact={compact} />;

  if (imageUri) {
    return (
      <Image
        source={{ uri: imageUri, cache: 'force-cache' as any }}
        style={compact ? styles.continueImage : styles.conceptImage}
        resizeMode="cover"
      />
    );
  }
  return (
    <View style={styles.genericVisualFallback}>
      <Text style={compact ? styles.continueVisualEmoji : styles.conceptEmoji}>{fallback}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  conceptImage: {
    width: '100%',
    height: '100%',
  },
  continueImage: {
    width: '100%',
    height: '100%',
  },
  continueVisualEmoji: {
    fontSize: 48,
  },
  conceptEmoji: {
    fontSize: 32,
  },
  genericVisualFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(124,58,237,0.06)',
  },
  boardVisual: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    flexDirection: 'row',
    flexWrap: 'wrap',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.12)',
  },
  boardVisualCompact: {
    borderRadius: 12,
  },
  boardSquare: {
    width: '12.5%',
    height: '12.5%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boardSquareLight: {
    backgroundColor: '#F7F3FF',
  },
  boardSquareDark: {
    backgroundColor: '#DED6F5',
  },
  boardPiece: {
    fontSize: 11,
    fontWeight: '900',
    color: '#111827',
  },
  tacticLine: {
    position: 'absolute',
    height: 2,
    backgroundColor: '#7C3AED',
    borderRadius: 1,
  },
  tacticLineOne: {
    width: '46%',
    left: '34%',
    top: '29%',
    transform: [{ rotate: '-34deg' }],
  },
  tacticLineTwo: {
    width: '45%',
    left: '35%',
    top: '58%',
    transform: [{ rotate: '30deg' }],
  },
  pinLine: {
    width: '62%',
    left: '19%',
    top: '49%',
    transform: [{ rotate: '90deg' }],
    backgroundColor: '#D97706',
  },
  skewerLine: {
    width: '58%',
    left: '21%',
    top: '50%',
    transform: [{ rotate: '90deg' }],
    backgroundColor: '#2563EB',
  },
  pitchVisual: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#27AE60',
    borderWidth: 1,
    borderColor: 'rgba(5,150,105,0.18)',
  },
  pitchVisualCompact: {
    borderRadius: 12,
  },
  pitchCenterCircle: {
    position: 'absolute',
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.55)',
    left: '50%',
    top: '50%',
    marginLeft: -21,
    marginTop: -21,
  },
  pitchMidline: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  pitchPlayer: {
    position: 'absolute',
    width: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#14532D',
  },
  pitchPlayerOne: {
    left: '20%',
    top: '28%',
  },
  pitchPlayerTwo: {
    left: '54%',
    top: '44%',
  },
  pitchPlayerThree: {
    left: '72%',
    top: '22%',
  },
  pitchBall: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FDE68A',
    borderWidth: 1,
    borderColor: '#92400E',
  },
  pitchBallOne: {
    left: '41%',
    top: '58%',
  },
  pitchBallTwo: {
    left: '64%',
    top: '34%',
  },
  pitchRunLine: {
    position: 'absolute',
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 1,
  },
  pitchRunLineOne: {
    width: '48%',
    left: '25%',
    top: '45%',
    transform: [{ rotate: '19deg' }],
  },
  pitchRunLineTwo: {
    width: '46%',
    left: '32%',
    top: '35%',
    transform: [{ rotate: '-18deg' }],
  },
});
