import { useState } from "react";
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
  KeyboardAvoidingView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Plus, X, User as UserIcon, Calendar, Heart } from "lucide-react-native";

import Colors from "@/constants/colors";
import { useRelationships } from "@/contexts/RelationshipsContext";

function AddPersonModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { addPerson } = useRelationships();
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [notes, setNotes] = useState("");

  const handleAdd = () => {
    if (name.trim() && relationship.trim()) {
      addPerson({
        name: name.trim(),
        relationship: relationship.trim(),
        gratitudeNotes: notes.trim() || undefined,
      });
      setName("");
      setRelationship("");
      setNotes("");
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
              <Text style={styles.modalTitle}>Add Key Person</Text>
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
                placeholder="Name"
                value={name}
                onChangeText={setName}
                placeholderTextColor={Colors.light.tertiaryText}
                autoFocus
              />

              <TextInput
                style={styles.input}
                placeholder="Relationship (e.g., Friend, Family, Mentor)"
                value={relationship}
                onChangeText={setRelationship}
                placeholderTextColor={Colors.light.tertiaryText}
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Notes (optional)"
                value={notes}
                onChangeText={setNotes}
                placeholderTextColor={Colors.light.tertiaryText}
                multiline
                numberOfLines={4}
              />
            </ScrollView>

            <TouchableOpacity
              style={[
                styles.submitButton,
                (!name.trim() || !relationship.trim()) && styles.submitButtonDisabled,
              ]}
              onPress={handleAdd}
              disabled={!name.trim() || !relationship.trim()}
            >
              <Text style={styles.submitButtonText}>Add Person</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function AddAnniversaryModal({
  visible,
  onClose,
  personId,
  personName,
}: {
  visible: boolean;
  onClose: () => void;
  personId: string;
  personName: string;
}) {
  const { addAnniversary } = useRelationships();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [recurring, setRecurring] = useState(true);

  const handleAdd = () => {
    if (title.trim() && date.trim()) {
      addAnniversary({
        personId,
        title: title.trim(),
        date: date.trim(),
        recurring,
        notificationsEnabled: true,
      });
      setTitle("");
      setDate("");
      setRecurring(true);
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
              <Text style={styles.modalTitle}>Add Anniversary for {personName}</Text>
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
                placeholder="Title (e.g., Birthday, Wedding Anniversary)"
                value={title}
                onChangeText={setTitle}
                placeholderTextColor={Colors.light.tertiaryText}
                autoFocus
              />

              <TextInput
                style={styles.input}
                placeholder="Date (YYYY-MM-DD)"
                value={date}
                onChangeText={setDate}
                placeholderTextColor={Colors.light.tertiaryText}
              />

              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setRecurring(!recurring)}
              >
                <View style={[styles.checkbox, recurring && styles.checkboxChecked]}>
                  {recurring && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>Recurring (yearly)</Text>
              </TouchableOpacity>
            </ScrollView>

            <TouchableOpacity
              style={[
                styles.submitButton,
                (!title.trim() || !date.trim()) && styles.submitButtonDisabled,
              ]}
              onPress={handleAdd}
              disabled={!title.trim() || !date.trim()}
            >
              <Text style={styles.submitButtonText}>Add Anniversary</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default function RelationshipsScreen() {
  const insets = useSafeAreaInsets();
  const { people, deletePerson, getPersonAnniversaries } = useRelationships();
  const [showAddPerson, setShowAddPerson] = useState(false);
  const [showAddAnniversary, setShowAddAnniversary] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<{ id: string; name: string } | null>(null);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Relationships</Text>
        <Text style={styles.headerSubtitle}>Your key people and connections</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {people.length === 0 ? (
          <View style={styles.emptyState}>
            <Heart size={48} color={Colors.light.tertiaryText} />
            <Text style={styles.emptyText}>No key people yet</Text>
            <Text style={styles.emptySubtext}>
              Add important people in your life to track anniversaries and build stronger
              relationships
            </Text>
          </View>
        ) : (
          people.map((person) => {
            const anniversaries = getPersonAnniversaries(person.id);
            return (
              <View key={person.id} style={styles.personCard}>
                <View style={styles.personHeader}>
                  <View style={styles.personAvatar}>
                    <UserIcon size={24} color={Colors.light.primary} />
                  </View>
                  <View style={styles.personInfo}>
                    <Text style={styles.personName}>{person.name}</Text>
                    <Text style={styles.personRelationship}>{person.relationship}</Text>
                  </View>
                  <TouchableOpacity onPress={() => deletePerson(person.id)}>
                    <X size={20} color={Colors.light.tertiaryText} />
                  </TouchableOpacity>
                </View>

                {person.gratitudeNotes && (
                  <Text style={styles.personNotes}>{person.gratitudeNotes}</Text>
                )}

                {anniversaries.length > 0 && (
                  <View style={styles.anniversariesSection}>
                    {anniversaries.map((anniversary) => (
                      <View key={anniversary.id} style={styles.anniversaryItem}>
                        <Calendar size={14} color={Colors.light.accent} />
                        <Text style={styles.anniversaryText}>
                          {anniversary.title} - {anniversary.date}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                <TouchableOpacity
                  style={styles.addAnniversaryButton}
                  onPress={() => {
                    setSelectedPerson({ id: person.id, name: person.name });
                    setShowAddAnniversary(true);
                  }}
                >
                  <Plus size={16} color={Colors.light.primary} />
                  <Text style={styles.addAnniversaryText}>Add anniversary</Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowAddPerson(true)}
      >
        <Plus size={24} color={Colors.light.background} />
      </TouchableOpacity>

      <AddPersonModal
        visible={showAddPerson}
        onClose={() => setShowAddPerson(false)}
      />

      {selectedPerson && (
        <AddAnniversaryModal
          visible={showAddAnniversary}
          onClose={() => {
            setShowAddAnniversary(false);
            setSelectedPerson(null);
          }}
          personId={selectedPerson.id}
          personName={selectedPerson.name}
        />
      )}
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
    paddingBottom: 80,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 15,
    color: Colors.light.secondaryText,
    textAlign: "center",
    lineHeight: 22,
  },
  personCard: {
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
  personHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  personAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.secondaryBackground,
    alignItems: "center",
    justifyContent: "center",
  },
  personInfo: {
    flex: 1,
  },
  personName: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 2,
  },
  personRelationship: {
    fontSize: 14,
    color: Colors.light.secondaryText,
  },
  personNotes: {
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  anniversariesSection: {
    gap: 8,
    marginBottom: 12,
  },
  anniversaryItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 4,
  },
  anniversaryText: {
    fontSize: 13,
    color: Colors.light.secondaryText,
  },
  addAnniversaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderStyle: "dashed" as const,
  },
  addAnniversaryText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: Colors.light.primary,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)" as never,
      },
    }),
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
    flex: 1,
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
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.light.border,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  checkmark: {
    color: Colors.light.background,
    fontSize: 16,
    fontWeight: "700" as const,
  },
  checkboxLabel: {
    fontSize: 16,
    color: Colors.light.text,
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
