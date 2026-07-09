import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert, Modal } from 'react-native';
import { Technique, TechniqueStatus } from '../types';
import { Theme } from '../utils/theme';

interface TechniqueCardProps {
  technique: Technique;
  onStatusChange: (id: string, status: TechniqueStatus) => void;
}

export const TechniqueCard = ({ technique, onStatusChange }: TechniqueCardProps) => {
  const getCardStyle = () => {
    switch (technique.status) {
      case 'mastered':
        return {
          backgroundColor: Theme.colors.status.mastered.bg,
          borderColor: Theme.colors.status.mastered.border,
        };
      case 'learning':
        return {
          backgroundColor: Theme.colors.status.learning.bg,
          borderColor: Theme.colors.status.learning.border,
        };
      case 'skipped':
        return {
          backgroundColor: Theme.colors.status.skipped.bg,
          borderColor: Theme.colors.status.skipped.border,
        };
      default:
        return {
          backgroundColor: Theme.colors.status.notStarted.bg,
          borderColor: Theme.colors.status.notStarted.border,
        };
    }
  };

  const handleOpenResource = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error("Failed to open resource:", error);
      Alert.alert('Error', 'Cannot open this resource URL.');
    }
  };

  const toggleLearning = () => {
    const newStatus = technique.status === 'learning' ? 'not-started' : 'learning';
    onStatusChange(technique.id, newStatus);
  };

  const toggleMastered = () => {
    const newStatus = technique.status === 'mastered' ? 'not-started' : 'mastered';
    onStatusChange(technique.id, newStatus);
  };

  const toggleSkipped = () => {
    const newStatus = technique.status === 'skipped' ? 'not-started' : 'skipped';
    onStatusChange(technique.id, newStatus);
  };

  const [modalVisible, setModalVisible] = React.useState(false);
  const displayStatus = technique.status.replace('-', ' ').toUpperCase();

  return (
    <>
      <View style={[styles.card, getCardStyle()]}>
        <View style={styles.header}>
          <Text style={[styles.title, technique.status === 'skipped' && styles.textStrikethrough]} numberOfLines={2}>
            {technique.name}
          </Text>
          <Text style={styles.statusBadge}>{displayStatus}</Text>
        </View>
        
        <Text style={[styles.description, technique.status === 'skipped' && styles.textStrikethrough]}>{technique.description}</Text>
        
        {technique.resources.length > 0 && (
          <TouchableOpacity 
            style={styles.viewResourcesBtn} 
            onPress={() => setModalVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.viewResourcesText}>📚 View Resources ({technique.resources.length})</Text>
          </TouchableOpacity>
        )}

        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={[styles.actionButton, technique.status === 'learning' ? styles.buttonActive : styles.buttonInactive]}
            onPress={toggleLearning}
            activeOpacity={0.7}
          >
            <Text style={technique.status === 'learning' ? styles.buttonTextActive : styles.buttonTextInactive}>
              {technique.status === 'learning' ? 'Stop' : 'Learn'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, technique.status === 'mastered' ? styles.buttonActive : styles.buttonInactive]}
            onPress={toggleMastered}
            activeOpacity={0.7}
          >
            <Text style={technique.status === 'mastered' ? styles.buttonTextActive : styles.buttonTextInactive}>
              {technique.status === 'mastered' ? 'Unmark' : 'Master'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, technique.status === 'skipped' ? styles.buttonActive : styles.buttonInactive]}
            onPress={toggleSkipped}
            activeOpacity={0.7}
          >
            <Text style={technique.status === 'skipped' ? styles.buttonTextActive : styles.buttonTextInactive}>
              {technique.status === 'skipped' ? 'Undo Skip' : 'Skip'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Learning Resources</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.sheetSubtitle}>{technique.name}</Text>
            
            <View style={styles.resourceList}>
              {technique.resources.map((resource) => (
                <TouchableOpacity 
                  key={resource.id} 
                  style={styles.resourceCard}
                  onPress={() => handleOpenResource(resource.url)}
                  activeOpacity={0.7}
                >
                  <View style={styles.resourceIconWrapper}>
                    <Text style={styles.resourceIcon}>
                      {resource.type === 'video' ? '📺' : '📖'}
                    </Text>
                  </View>
                  <View style={styles.resourceTextWrapper}>
                    <Text style={styles.resourceTypeLabel}>{resource.type.toUpperCase()}</Text>
                    <Text style={styles.resourceTitle} numberOfLines={2}>{resource.title}</Text>
                  </View>
                  <Text style={styles.resourceArrow}>➔</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.sm,
    gap: Theme.spacing.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Theme.colors.text.primary,
    flex: 1,
  },
  statusBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: Theme.colors.text.muted,
    letterSpacing: 0.5,
    marginTop: 4,
  },
  description: {
    fontSize: 14,
    color: Theme.colors.text.secondary,
    lineHeight: 20,
    marginBottom: Theme.spacing.md,
  },
  textStrikethrough: {
    textDecorationLine: 'line-through',
    color: Theme.colors.text.muted,
  },
  viewResourcesBtn: {
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.sm,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  viewResourcesText: {
    color: Theme.colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: Theme.colors.surface,
    borderTopLeftRadius: Theme.borderRadius.xl,
    borderTopRightRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.lg,
    maxHeight: '80%',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.xs,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Theme.colors.text.primary,
  },
  sheetSubtitle: {
    fontSize: 14,
    color: Theme.colors.text.secondary,
    marginBottom: Theme.spacing.lg,
  },
  closeBtn: {
    padding: Theme.spacing.xs,
  },
  closeBtnText: {
    fontSize: 20,
    color: Theme.colors.text.muted,
    fontWeight: '600',
  },
  resourceList: {
    gap: Theme.spacing.md,
  },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.background,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  resourceIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  resourceIcon: {
    fontSize: 20,
  },
  resourceTextWrapper: {
    flex: 1,
  },
  resourceTypeLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Theme.colors.primary,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  resourceTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Theme.colors.text.primary,
  },
  resourceArrow: {
    fontSize: 18,
    color: Theme.colors.text.muted,
    marginLeft: Theme.spacing.sm,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
    marginTop: Theme.spacing.md,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: Theme.borderRadius.sm,
    alignItems: 'center',
    borderWidth: 1,
  },
  buttonInactive: {
    backgroundColor: Theme.colors.surface,
    borderColor: Theme.colors.border,
  },
  buttonActive: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  buttonTextInactive: {
    color: Theme.colors.text.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  buttonTextActive: {
    color: Theme.colors.surface,
    fontWeight: '600',
    fontSize: 14,
  }
});
