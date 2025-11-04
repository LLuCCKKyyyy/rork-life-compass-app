import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  TextInput,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Plus, X, TrendingUp, Calendar, Heart, Target, Sparkles, Bell } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Colors from "@/constants/colors";
import { useTasks } from "@/contexts/TasksContext";
import { useGratitude } from "@/contexts/GratitudeContext";
import { useRelationships } from "@/contexts/RelationshipsContext";
import { useNotifications } from "@/contexts/NotificationContext";

type ReviewType = "weekly" | "monthly" | "yearly";

function ReminderSettingsModal({
  visible,
  onClose,
  currentTime,
  onSave,
}: {
  visible: boolean;
  onClose: () => void;
  currentTime: string;
  onSave: (time: string) => void;
}) {
  const [hours, setHours] = useState(currentTime.split(":")[0]);
  const [minutes, setMinutes] = useState(currentTime.split(":")[1]);

  const handleSave = () => {
    const h = parseInt(hours) || 0;
    const m = parseInt(minutes) || 0;
    
    if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
      const formattedTime = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
      onSave(formattedTime);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <Pressable style={styles.modalOverlayInner} onPress={onClose}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Daily Reminder Time</Text>
              <TouchableOpacity onPress={onClose}>
                <X size={24} color={Colors.light.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.timeInputContainer}>
              <View style={styles.timeInputGroup}>
                <Text style={styles.timeLabel}>Hour (0-23)</Text>
                <TextInput
                  style={styles.timeInput}
                  value={hours}
                  onChangeText={setHours}
                  keyboardType="number-pad"
                  maxLength={2}
                  placeholderTextColor={Colors.light.tertiaryText}
                />
              </View>
              <Text style={styles.timeSeparator}>:</Text>
              <View style={styles.timeInputGroup}>
                <Text style={styles.timeLabel}>Minute (0-59)</Text>
                <TextInput
                  style={styles.timeInput}
                  value={minutes}
                  onChangeText={setMinutes}
                  keyboardType="number-pad"
                  maxLength={2}
                  placeholderTextColor={Colors.light.tertiaryText}
                />
              </View>
            </View>

            <Text style={styles.reminderNote}>
              You&apos;ll receive a notification at this time every day to reflect on your gratitude.
            </Text>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSave}
            >
              <Text style={styles.submitButtonText}>Save Reminder Time</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function AddReviewModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { addReview } = useGratitude();
  const [reviewType, setReviewType] = useState<ReviewType>("weekly");
  const [accomplishments, setAccomplishments] = useState("");
  const [gratitudes, setGratitudes] = useState("");
  const [insights, setInsights] = useState("");

  const handleAdd = () => {
    const accomplishmentsList = accomplishments
      .split("\n")
      .filter((a) => a.trim() !== "");
    const gratitudesList = gratitudes.split("\n").filter((g) => g.trim() !== "");
    const insightsList = insights.split("\n").filter((i) => i.trim() !== "");

    if (accomplishmentsList.length > 0 || gratitudesList.length > 0) {
      addReview({
        type: reviewType,
        date: new Date().toISOString(),
        accomplishments: accomplishmentsList,
        gratitudes: gratitudesList,
        insights: insightsList,
      });
      setAccomplishments("");
      setGratitudes("");
      setInsights("");
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <Pressable style={styles.modalOverlayInner} onPress={onClose}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Review</Text>
              <TouchableOpacity onPress={onClose}>
                <X size={24} color={Colors.light.text} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalScrollView}
              contentContainerStyle={styles.modalScrollContent}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.reviewTypeSelector}>
                {(["weekly", "monthly", "yearly"] as const).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.reviewTypeButton,
                      reviewType === type && styles.reviewTypeButtonActive,
                    ]}
                    onPress={() => setReviewType(type)}
                  >
                    <Text
                      style={[
                        styles.reviewTypeText,
                        reviewType === type && styles.reviewTypeTextActive,
                      ]}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>What I accomplished</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="One item per line..."
                value={accomplishments}
                onChangeText={setAccomplishments}
                placeholderTextColor={Colors.light.tertiaryText}
                multiline
                numberOfLines={4}
              />

              <Text style={styles.inputLabel}>Who I&apos;m grateful for</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="One person per line..."
                value={gratitudes}
                onChangeText={setGratitudes}
                placeholderTextColor={Colors.light.tertiaryText}
                multiline
                numberOfLines={4}
              />

              <Text style={styles.inputLabel}>Insights & learnings</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="What did I learn? What would I do differently?"
                value={insights}
                onChangeText={setInsights}
                placeholderTextColor={Colors.light.tertiaryText}
                multiline
                numberOfLines={4}
              />
            </ScrollView>

            <TouchableOpacity
              style={[
                styles.submitButton,
                accomplishments.trim() === "" && styles.submitButtonDisabled,
              ]}
              onPress={handleAdd}
              disabled={accomplishments.trim() === ""}
            >
              <Text style={styles.submitButtonText}>Create Review</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const REMINDER_TIME_KEY = "life-compass-reminder-time";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { tasks, bigRocks } = useTasks();
  const { entries, reviews } = useGratitude();
  const { people } = useRelationships();
  const { reminderTime: contextReminderTime, scheduleDailyGratitudeReminder } = useNotifications();
  const [showAddReview, setShowAddReview] = useState(false);
  const [showReminderSettings, setShowReminderSettings] = useState(false);
  const [reminderTime, setReminderTime] = useState("15:40");
  const router = useRouter();

  useEffect(() => {
    loadReminderTime();
  }, []);

  useEffect(() => {
    if (contextReminderTime) {
      setReminderTime(contextReminderTime);
    }
  }, [contextReminderTime]);

  const loadReminderTime = async () => {
    try {
      const stored = await AsyncStorage.getItem(REMINDER_TIME_KEY);
      if (stored) {
        setReminderTime(stored);
      }
    } catch (error) {
      console.log("Error loading reminder time:", error);
    }
  };

  const saveReminderTime = async (time: string) => {
    try {
      await AsyncStorage.setItem(REMINDER_TIME_KEY, time);
      setReminderTime(time);
      await scheduleDailyGratitudeReminder(time);
      console.log("Reminder time saved and notification rescheduled:", time);
    } catch (error) {
      console.log("Error saving reminder time:", error);
    }
  };

  const completedTasks = tasks.filter((t) => t.completed).length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const quadrant2Tasks = tasks.filter((t) => t.quadrant === 2).length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Profile</Text>
          <Text style={styles.headerSubtitle}>Your progress and insights</Text>
        </View>
        <TouchableOpacity
          style={styles.coachButton}
          onPress={() => router.push("/coach")}
        >
          <Sparkles size={20} color={Colors.light.background} />
          <Text style={styles.coachButtonText}>AI Coach</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Target size={24} color={Colors.light.primary} />
            <Text style={styles.statValue}>{totalTasks}</Text>
            <Text style={styles.statLabel}>Total Tasks</Text>
          </View>

          <View style={styles.statCard}>
            <TrendingUp size={24} color={Colors.light.success} />
            <Text style={styles.statValue}>{completionRate}%</Text>
            <Text style={styles.statLabel}>Completion</Text>
          </View>

          <View style={styles.statCard}>
            <Calendar size={24} color={Colors.light.accent} />
            <Text style={styles.statValue}>{entries.length}</Text>
            <Text style={styles.statLabel}>Daily Logs</Text>
          </View>

          <View style={styles.statCard}>
            <Heart size={24} color={Colors.light.error} />
            <Text style={styles.statValue}>{people.length}</Text>
            <Text style={styles.statLabel}>Key People</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Annual Big Rocks</Text>
            <TouchableOpacity>
              <Plus size={20} color={Colors.light.primary} />
            </TouchableOpacity>
          </View>
          
          {bigRocks.length === 0 ? (
            <Text style={styles.emptyText}>
              No big rocks yet. Add 2-3 major goals for the year.
            </Text>
          ) : (
            bigRocks.map((rock) => (
              <View key={rock.id} style={styles.bigRockCard}>
                <Text style={styles.bigRockTitle}>{rock.title}</Text>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${rock.progress}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>{rock.progress}% complete</Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quadrant II Focus</Text>
          </View>
          <View style={styles.focusCard}>
            <Text style={styles.focusValue}>{quadrant2Tasks}</Text>
            <Text style={styles.focusLabel}>
              tasks in the growth zone (Not Urgent & Important)
            </Text>
            <Text style={styles.focusDescription}>
              Focus here to prevent crises and build your future
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Daily Reminder</Text>
            <TouchableOpacity onPress={() => setShowReminderSettings(true)}>
              <Bell size={20} color={Colors.light.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.reminderCard}>
            <Bell size={24} color={Colors.light.accent} />
            <View style={styles.reminderInfo}>
              <Text style={styles.reminderTitle}>Gratitude Reminder</Text>
              <Text style={styles.reminderTime}>
                Every day at {reminderTime.split(":")[0]}:{reminderTime.split(":")[1]}
                {parseInt(reminderTime.split(":")[0]) >= 12 ? " PM" : " AM"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Reviews & Reflections</Text>
            <TouchableOpacity onPress={() => setShowAddReview(true)}>
              <Plus size={20} color={Colors.light.primary} />
            </TouchableOpacity>
          </View>

          {reviews.length === 0 ? (
            <Text style={styles.emptyText}>
              No reviews yet. Create weekly, monthly, or yearly reviews to track your growth.
            </Text>
          ) : (
            reviews
              .slice()
              .reverse()
              .slice(0, 5)
              .map((review) => (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewType}>
                      {review.type.charAt(0).toUpperCase() + review.type.slice(1)} Review
                    </Text>
                    <Text style={styles.reviewDate}>
                      {new Date(review.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </Text>
                  </View>
                  {review.accomplishments.length > 0 && (
                    <View style={styles.reviewSection}>
                      <Text style={styles.reviewSectionTitle}>Accomplishments</Text>
                      {review.accomplishments.map((item, i) => (
                        <Text key={i} style={styles.reviewItem}>
                          • {item}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              ))
          )}
        </View>
      </ScrollView>

      <AddReviewModal
        visible={showAddReview}
        onClose={() => setShowAddReview(false)}
      />

      <ReminderSettingsModal
        visible={showReminderSettings}
        onClose={() => setShowReminderSettings(false)}
        currentTime={reminderTime}
        onSave={saveReminderTime}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.secondaryBackground,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.light.background,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  coachButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.light.accent,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  coachButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.background,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    color: Colors.light.secondaryText,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: "47%",
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)" as never,
      },
    }),
  },
  statValue: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.light.secondaryText,
  },
  section: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)" as never,
      },
    }),
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.light.tertiaryText,
    lineHeight: 20,
  },
  bigRockCard: {
    marginBottom: 16,
  },
  bigRockTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.light.tertiaryBackground,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 6,
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.light.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    color: Colors.light.secondaryText,
  },
  focusCard: {
    alignItems: "center",
    paddingVertical: 16,
  },
  focusValue: {
    fontSize: 48,
    fontWeight: "700" as const,
    color: Colors.light.quadrant2,
    marginBottom: 8,
  },
  focusLabel: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    textAlign: "center",
    marginBottom: 8,
  },
  focusDescription: {
    fontSize: 14,
    color: Colors.light.secondaryText,
    textAlign: "center",
  },
  reviewCard: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  reviewType: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.primary,
  },
  reviewDate: {
    fontSize: 13,
    color: Colors.light.tertiaryText,
  },
  reviewSection: {
    marginBottom: 8,
  },
  reviewSectionTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 6,
  },
  reviewItem: {
    fontSize: 14,
    color: Colors.light.secondaryText,
    lineHeight: 20,
    marginBottom: 4,
  },
  modalOverlay: {
    flex: 1,
  },
  modalOverlayInner: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "90%",
  },
  modalScrollView: {
    maxHeight: 500,
  },
  modalScrollContent: {
    paddingBottom: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  reviewTypeSelector: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 24,
  },
  reviewTypeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: Colors.light.secondaryBackground,
    alignItems: "center",
  },
  reviewTypeButtonActive: {
    backgroundColor: Colors.light.primary,
  },
  reviewTypeText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  reviewTypeTextActive: {
    color: Colors.light.background,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.light.secondaryBackground,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.light.tertiaryBackground,
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: Colors.light.background,
  },
  reminderCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: 12,
  },
  reminderInfo: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  reminderTime: {
    fontSize: 14,
    color: Colors.light.secondaryText,
  },
  timeInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    marginBottom: 24,
  },
  timeInputGroup: {
    alignItems: "center",
  },
  timeLabel: {
    fontSize: 13,
    color: Colors.light.secondaryText,
    marginBottom: 8,
  },
  timeInput: {
    width: 80,
    backgroundColor: Colors.light.secondaryBackground,
    borderRadius: 12,
    padding: 16,
    fontSize: 24,
    fontWeight: "600" as const,
    color: Colors.light.text,
    textAlign: "center",
  },
  timeSeparator: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginTop: 20,
  },
  reminderNote: {
    fontSize: 14,
    color: Colors.light.secondaryText,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
});
