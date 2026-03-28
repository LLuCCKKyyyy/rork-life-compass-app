import { useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Pressable,
  Platform,
  Animated,
  KeyboardAvoidingView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Plus, X, Check, Edit2 } from "lucide-react-native";

import Colors from "@/constants/colors";
import { useTasks, useTasksByQuadrant } from "@/contexts/TasksContext";
import type { Quadrant } from "@/types";

const QUADRANT_INFO = {
  1: { title: "Urgent & Important", subtitle: "Crisis", color: Colors.light.quadrant1 },
  2: { title: "Not Urgent & Important", subtitle: "Growth Zone", color: Colors.light.quadrant2 },
  3: { title: "Urgent & Not Important", subtitle: "Distractions", color: Colors.light.quadrant3 },
  4: { title: "Not Urgent & Not Important", subtitle: "Time Wasters", color: Colors.light.quadrant4 },
} as const;

function QuadrantCard({ quadrant }: { quadrant: Quadrant }) {
  const tasks = useTasksByQuadrant(quadrant);
  const { updateTask, deleteTask } = useTasks();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState<{ id: string; title: string; description?: string } | null>(null);
  const info = QUADRANT_INFO[quadrant];
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[styles.quadrant, { transform: [{ scale: scaleAnim }] }]}>
      <View style={[styles.quadrantHeader, { borderLeftColor: info.color }]}>
        <View>
          <Text style={styles.quadrantTitle}>{info.title}</Text>
          <Text style={styles.quadrantSubtitle}>{info.subtitle}</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <Plus size={20} color={Colors.light.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.tasksList}>
        {tasks.length === 0 ? (
          <Text style={styles.emptyText}>No tasks yet</Text>
        ) : (
          tasks.map((task) => (
            <View key={task.id} style={styles.taskItem}>
              <TouchableOpacity
                style={styles.taskCheckbox}
                onPress={() => updateTask(task.id, { completed: !task.completed })}
              >
                {task.completed && <Check size={16} color={Colors.light.success} />}
              </TouchableOpacity>
              <Text
                style={[
                  styles.taskTitle,
                  task.completed && styles.taskTitleCompleted,
                ]}
              >
                {task.title}
              </Text>
              <TouchableOpacity
                onPress={() => setEditingTask({ id: task.id, title: task.title, description: task.description })}
                style={styles.editButton}
              >
                <Edit2 size={16} color={Colors.light.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteTask(task.id)}>
                <X size={16} color={Colors.light.tertiaryText} />
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      <AddTaskModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        quadrant={quadrant}
      />
      
      {editingTask && (
        <EditTaskModal
          visible={true}
          onClose={() => setEditingTask(null)}
          task={editingTask}
        />
      )}
    </Animated.View>
  );
}

function AddTaskModal({
  visible,
  onClose,
  quadrant,
}: {
  visible: boolean;
  onClose: () => void;
  quadrant: Quadrant;
}) {
  const { addTask } = useTasks();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleAdd = () => {
    if (title.trim()) {
      addTask({
        title: title.trim(),
        description: description.trim() || undefined,
        quadrant,
        completed: false,
      });
      setTitle("");
      setDescription("");
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
              <Text style={styles.modalTitle}>Add Task</Text>
              <TouchableOpacity onPress={onClose}>
                <X size={24} color={Colors.light.text} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalScrollView}
              contentContainerStyle={styles.modalScrollContent}
              keyboardShouldPersistTaps="handled"
            >
              <TextInput
                style={styles.input}
                placeholder="Task title"
                value={title}
                onChangeText={setTitle}
                placeholderTextColor={Colors.light.tertiaryText}
                autoFocus
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Description (optional)"
                value={description}
                onChangeText={setDescription}
                placeholderTextColor={Colors.light.tertiaryText}
                multiline
                numberOfLines={4}
              />
            </ScrollView>

            <TouchableOpacity
              style={[styles.submitButton, !title.trim() && styles.submitButtonDisabled]}
              onPress={handleAdd}
              disabled={!title.trim()}
            >
              <Text style={styles.submitButtonText}>Add Task</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function EditTaskModal({
  visible,
  onClose,
  task,
}: {
  visible: boolean;
  onClose: () => void;
  task: { id: string; title: string; description?: string };
}) {
  const { updateTask } = useTasks();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");

  const handleSave = () => {
    if (title.trim()) {
      updateTask(task.id, {
        title: title.trim(),
        description: description.trim() || undefined,
      });
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
              <Text style={styles.modalTitle}>Edit Task</Text>
              <TouchableOpacity onPress={onClose}>
                <X size={24} color={Colors.light.text} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalScrollView}
              contentContainerStyle={styles.modalScrollContent}
              keyboardShouldPersistTaps="handled"
            >
              <TextInput
                style={styles.input}
                placeholder="Task title"
                value={title}
                onChangeText={setTitle}
                placeholderTextColor={Colors.light.tertiaryText}
                autoFocus
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Description (optional)"
                value={description}
                onChangeText={setDescription}
                placeholderTextColor={Colors.light.tertiaryText}
                multiline
                numberOfLines={4}
              />
            </ScrollView>

            <TouchableOpacity
              style={[styles.submitButton, !title.trim() && styles.submitButtonDisabled]}
              onPress={handleSave}
              disabled={!title.trim()}
            >
              <Text style={styles.submitButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default function MatrixScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Life Matrix</Text>
        <Text style={styles.headerSubtitle}>Eisenhower Decision Matrix</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <QuadrantCard quadrant={2} />
        <QuadrantCard quadrant={1} />
        <QuadrantCard quadrant={3} />
        <QuadrantCard quadrant={4} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.secondaryBackground,
  },
  header: {
    backgroundColor: Colors.light.background,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
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
  quadrant: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 16,
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
  quadrantHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingLeft: 12,
    borderLeftWidth: 4,
  },
  quadrantTitle: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 2,
  },
  quadrantSubtitle: {
    fontSize: 13,
    color: Colors.light.secondaryText,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.secondaryBackground,
    alignItems: "center",
    justifyContent: "center",
  },
  tasksList: {
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.light.tertiaryText,
    textAlign: "center",
    paddingVertical: 20,
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  taskCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.light.border,
    alignItems: "center",
    justifyContent: "center",
  },
  taskTitle: {
    flex: 1,
    fontSize: 15,
    color: Colors.light.text,
  },
  taskTitleCompleted: {
    textDecorationLine: "line-through" as const,
    color: Colors.light.tertiaryText,
  },
  editButton: {
    padding: 4,
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
    maxHeight: 400,
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
  },
  submitButtonDisabled: {
    backgroundColor: Colors.light.tertiaryBackground,
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: Colors.light.background,
  },
});
