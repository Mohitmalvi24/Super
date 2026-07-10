import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Animated } from 'react-native';
import { Technique, TechniqueStatus } from '../types';
import { Theme } from '../utils/theme';
import { Feather } from '@expo/vector-icons';

interface TechniqueCardProps {
  technique: Technique;
  onStatusChange: (id: string, status: TechniqueStatus) => void;
  isHero?: boolean;
}

export const TechniqueCard = ({ technique, onStatusChange, isHero }: TechniqueCardProps) => {
  const [modalVisible, setModalVisible] = useState(false);

  const toggleStatus = (status: TechniqueStatus) => {
    onStatusChange(technique.id, status);
    if (status === 'mastered') {
      setModalVisible(false); // Auto close when mastered
    }
  };

  if (isHero) {
    return (
      <View>
        <TouchableOpacity 
          style={styles.heroStartBtn}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.heroStartBtnText}>Resume Session</Text>
          <Feather name="play-circle" size={18} color="#FFFFFF" />
        </TouchableOpacity>
        
        {renderModal()}
      </View>
    );
  }

  const isMastered = technique.status === 'mastered';
  const isSkipped = technique.status === 'skipped';

  return (
    <>
      <View style={[styles.card, isMastered && styles.cardMastered, isSkipped && styles.cardSkipped]}>
        <View style={styles.cardHeader}>
          <View style={[styles.cardIconWrapper, isMastered && styles.iconWrapperMastered]}>
            {isMastered ? (
              <Feather name="check" size={20} color="#FFFFFF" />
            ) : (
              <Feather name="book-open" size={18} color="#FFFFFF" />
            )}
          </View>
          
          <View style={styles.cardTitleContainer}>
            <Text style={[styles.title, isSkipped && styles.textStrikethrough]} numberOfLines={1}>
              {technique.name}
            </Text>
            {isMastered ? (
              <Text style={styles.statusBadge}>Mastered • Keep it sharp</Text>
            ) : (
              <View style={styles.progressBarMini}>
                <View style={[styles.progressFillMini, { width: technique.status === 'learning' ? '50%' : '0%' }]} />
              </View>
            )}
          </View>
          
          <TouchableOpacity style={styles.moreOptions}>
            <Feather name="more-vertical" size={20} color="#8A8F85" />
          </TouchableOpacity>
        </View>

        {!isMastered && !isSkipped && (
          <TouchableOpacity 
            style={styles.startBtn}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.startBtnText}>Start Lesson</Text>
          </TouchableOpacity>
        )}
      </View>

      {renderModal()}
    </>
  );

  function renderModal() {
    if (!technique.lesson) return null; // Safe guard for older plans

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.fullSheet}>
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>{technique.name}</Text>
                <Text style={styles.sheetSubtitle}>{technique.category} • {technique.estimatedMinutes} mins</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <Feather name="x" size={20} color="#43503F" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.viewerContainer} showsVerticalScrollIndicator={false}>
              
              <Text style={styles.viewerOverview}>{technique.lesson.overview}</Text>

              {/* Steps Section */}
              <View style={styles.sectionBlock}>
                <Text style={styles.sectionHeader}>LEARNING STEPS</Text>
                {technique.lesson.steps.map((step, index) => (
                  <View key={index} style={styles.stepContainer}>
                    <View style={styles.stepNumberBadge}>
                      <Text style={styles.stepNumber}>{step.order}</Text>
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={styles.stepTitle}>{step.title}</Text>
                      <Text style={styles.stepBody}>{step.body}</Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Exercise Drill */}
              <View style={styles.exerciseCard}>
                <View style={styles.exerciseHeader}>
                  <Feather name="clock" size={20} color="#43503F" style={{ marginRight: 8 }} />
                  <Text style={styles.exerciseTitle}>{technique.lesson.exercise.title}</Text>
                </View>
                <Text style={styles.exerciseInstruction}>{technique.lesson.exercise.instruction}</Text>
                <View style={styles.exerciseMetaBox}>
                  <Text style={styles.exerciseGoalLabel}>GOAL:</Text>
                  <Text style={styles.exerciseGoal}>{technique.lesson.exercise.goal}</Text>
                </View>
              </View>

              {/* Pro Tips */}
              {technique.lesson.proTips && technique.lesson.proTips.length > 0 && (
                <View style={styles.sectionBlock}>
                  <Text style={styles.sectionHeader}>PRO TIPS</Text>
                  <View style={styles.tipsBox}>
                    {technique.lesson.proTips.map((tip, idx) => (
                      <View key={idx} style={styles.tipRow}>
                        <Feather name="zap" size={16} color="#F57F17" style={{ marginRight: 12, marginTop: 2 }} />
                        <Text style={styles.tipText}>{tip}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Key Takeaways */}
              {technique.keyTakeaways && technique.keyTakeaways.length > 0 && (
                <View style={styles.sectionBlock}>
                  <Text style={styles.sectionHeader}>KEY TAKEAWAYS</Text>
                  <View style={styles.takeawaysContainer}>
                    {technique.keyTakeaways.map((tk, idx) => (
                      <View key={idx} style={styles.takeawayItem}>
                        <Text style={styles.takeawayTitle}>{tk.title}</Text>
                        <Text style={styles.takeawayDetail}>{tk.detail}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
              
            </ScrollView>

            <View style={styles.footerActions}>
              <TouchableOpacity 
                style={[styles.actionBtn, styles.actionBtnOutline]}
                onPress={() => toggleStatus('skipped')}
              >
                <Text style={styles.actionBtnTextOutline}>Too Hard</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.masterBtn, technique.status === 'mastered' && styles.masterBtnActive]}
                onPress={() => toggleStatus(technique.status === 'mastered' ? 'not-started' : 'mastered')}
              >
                <Text style={styles.masterBtnText}>
                  {technique.status === 'mastered' ? 'Mastered ✓' : 'Mark as Mastered ✓'}
                </Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>
    );
  }
};

const styles = StyleSheet.create({
  heroStartBtn: {
    backgroundColor: '#43503F',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 28,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroStartBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  heroStartBtnIcon: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  card: {
    marginHorizontal: 24,
    backgroundColor: '#FAFAF7',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardMastered: {
    backgroundColor: '#F3F6F3',
    borderColor: '#C3D6C5',
  },
  cardSkipped: {
    opacity: 0.5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#43503F',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  iconWrapperMastered: {
    backgroundColor: '#2E7D32',
  },
  cardIcon: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  cardTitleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1C18',
  },
  textStrikethrough: {
    textDecorationLine: 'line-through',
  },
  statusBadge: {
    fontSize: 12,
    color: '#2E7D32',
    marginTop: 4,
    fontWeight: '500',
  },
  progressBarMini: {
    height: 4,
    backgroundColor: '#E5E5E0',
    borderRadius: 2,
    marginTop: 8,
    width: '60%',
  },
  progressFillMini: {
    height: '100%',
    backgroundColor: '#43503F',
    borderRadius: 2,
  },
  moreOptions: {
    padding: 8,
  },
  moreOptionsText: {
    fontSize: 20,
    color: '#8A8F85',
  },
  startBtn: {
    backgroundColor: '#43503F',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  startBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  
  // Modal & Viewer Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  fullSheet: {
    height: '92%',
    backgroundColor: '#F7F8F4',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E0',
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1C18',
  },
  sheetSubtitle: {
    fontSize: 13,
    color: '#8A8F85',
    fontWeight: '600',
    marginTop: 4,
  },
  closeBtn: {
    padding: 8,
    backgroundColor: '#F0F1EC',
    borderRadius: 16,
  },
  closeBtnText: {
    fontSize: 16,
    color: '#43503F',
    fontWeight: '800',
  },
  viewerContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  viewerOverview: {
    fontSize: 16,
    color: '#43503F',
    lineHeight: 24,
    marginBottom: 32,
    fontStyle: 'italic',
  },
  sectionBlock: {
    marginBottom: 32,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: '#8A8F85',
    letterSpacing: 1.2,
    marginBottom: 16,
  },
  stepContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  stepNumberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#43503F',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    marginTop: 2,
  },
  stepNumber: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1C18',
    marginBottom: 6,
  },
  stepBody: {
    fontSize: 15,
    color: '#60645C',
    lineHeight: 22,
  },
  exerciseCard: {
    backgroundColor: '#E6E9E0',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderLeftWidth: 4,
    borderLeftColor: '#43503F',
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  exerciseTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1C18',
  },
  exerciseInstruction: {
    fontSize: 15,
    color: '#43503F',
    lineHeight: 22,
    marginBottom: 16,
  },
  exerciseMetaBox: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
  },
  exerciseGoalLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8A8F85',
    marginBottom: 4,
  },
  exerciseGoal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
  },
  tipsBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5E0',
  },
  tipRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  tipDot: {
    fontSize: 16,
    color: '#F59E0B',
    marginRight: 12,
    fontWeight: '800',
  },
  tipText: {
    fontSize: 15,
    color: '#43503F',
    lineHeight: 22,
    flex: 1,
  },
  takeawaysContainer: {
    gap: 12,
  },
  takeawayItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E0',
  },
  takeawayTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1C18',
    marginBottom: 6,
  },
  takeawayDetail: {
    fontSize: 14,
    color: '#60645C',
    lineHeight: 20,
  },
  
  footerActions: {
    flexDirection: 'row',
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E0',
    gap: 16,
  },
  actionBtn: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnOutline: {
    borderWidth: 1,
    borderColor: '#E5E5E0',
    backgroundColor: '#FFFFFF',
  },
  actionBtnTextOutline: {
    color: '#60645C',
    fontWeight: '700',
    fontSize: 15,
  },
  masterBtn: {
    flex: 1,
    backgroundColor: '#43503F',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  masterBtnActive: {
    backgroundColor: '#2E7D32',
  },
  masterBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  }
});
