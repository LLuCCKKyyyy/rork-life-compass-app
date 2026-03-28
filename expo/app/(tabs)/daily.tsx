import { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Plus, X, Heart } from "lucide-react-native";

import Colors from "@/constants/colors";
import { useGratitude } from "@/contexts/GratitudeContext";

export default function DailyScreen() {
  const insets = useSafeAreaInsets();
  const { getTodayEntry, addOrUpdateEntry } = useGratitude();
  const todayEntry = getTodayEntry();

  const [goodThings, setGoodThings] = useState<string[]>(
    todayEntry?.entries || ["", "", ""]
  );
  const [gratefulFor, setGratefulFor] = useState<{ person: string; reason: string }[]>(
    todayEntry?.gratefulFor || []
  );
  const [showAddGratitude, setShowAddGratitude] = useState(false);
  const [newPerson, setNewPerson] = useState("");
  const [newReason, setNewReason] = useState("");

  const handleSave = () => {
    const today = new Date().toISOString().split("T")[0];
    const filteredGoodThings = goodThings.filter((t) => t.trim() !== "");
    
    if (filteredGoodThings.length > 0 || gratefulFor.length > 0) {
      addOrUpdateEntry({
        date: today,
        entries: filteredGoodThings,
        gratefulFor,
      });
    }
  };

  const updateGoodThing = (index: number, value: string) => {
    const updated = [...goodThings];
    updated[index] = value;
    setGoodThings(updated);
  };

  const addGratitude = () => {
    if (newPerson.trim() && newReason.trim()) {
      setGratefulFor([...gratefulFor, { person: newPerson.trim(), reason: newReason.trim() }]);
      setNewPerson("");
      setNewReason("");
      setShowAddGratitude(false);
    }
  };

  const removeGratitude = (index: number) => {
    setGratefulFor(gratefulFor.filter((_, i) => i !== index));
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Daily Reflection</Text>
          <Text style={styles.headerSubtitle}>
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Heart size={20} color={Colors.light.primary} />
            <Text style={styles.sectionTitle}>Three Good Things</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Write down three positive things that happened today
          </Text>

          <View style={styles.goodThingsList}>
            {goodThings.map((thing, index) => (
              <View key={index} style={styles.goodThingItem}>
                <Text style={styles.goodThingNumber}>{index + 1}.</Text>
                <TextInput
                  style={styles.goodThingInput}
                  placeholder={`Good thing #${index + 1}`}
                  value={thing}
                  onChangeText={(value) => updateGoodThing(index, value)}
                  onBlur={handleSave}
                  placeholderTextColor={Colors.light.tertiaryText}
                  multiline
                />
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Heart size={20} color={Colors.light.accent} fill={Colors.light.accent} />
            <Text style={styles.sectionTitle}>Gratitude</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Who are you grateful for and why?
          </Text>

          {gratefulFor.map((item, index) => (
            <View key={index} style={styles.gratitudeCard}>
              <View style={styles.gratitudeContent}>
                <Text style={styles.gratitudePerson}>{item.person}</Text>
                <Text style={styles.gratitudeReason}>{item.reason}</Text>
              </View>
              <TouchableOpacity onPress={() => removeGratitude(index)}>
                <X size={20} color={Colors.light.tertiaryText} />
              </TouchableOpacity>
            </View>
          ))}

          {!showAddGratitude ? (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddGratitude(true)}
            >
              <Plus size={20} color={Colors.light.primary} />
              <Text style={styles.addButtonText}>Add gratitude</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.addGratitudeForm}>
              <TextInput
                style={styles.input}
                placeholder="Person's name"
                value={newPerson}
                onChangeText={setNewPerson}
                placeholderTextColor={Colors.light.tertiaryText}
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Why are you grateful for them?"
                value={newReason}
                onChangeText={setNewReason}
                placeholderTextColor={Colors.light.tertiaryText}
                multiline
                numberOfLines={3}
              />
              <View style={styles.formButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowAddGratitude(false);
                    setNewPerson("");
                    setNewReason("");
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    (!newPerson.trim() || !newReason.trim()) && styles.submitButtonDisabled,
                  ]}
                  onPress={() => {
                    addGratitude();
                    handleSave();
                  }}
                  disabled={!newPerson.trim() || !newReason.trim()}
                >
                  <Text style={styles.submitButtonText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
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
    gap: 24,
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
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  sectionDescription: {
    fontSize: 14,
    color: Colors.light.secondaryText,
    marginBottom: 16,
  },
  goodThingsList: {
    gap: 16,
  },
  goodThingItem: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  goodThingNumber: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: Colors.light.primary,
    paddingTop: 12,
  },
  goodThingInput: {
    flex: 1,
    backgroundColor: Colors.light.secondaryBackground,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: Colors.light.text,
    minHeight: 48,
  },
  gratitudeCard: {
    flexDirection: "row",
    backgroundColor: Colors.light.secondaryBackground,
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  gratitudeContent: {
    flex: 1,
  },
  gratitudePerson: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  gratitudeReason: {
    fontSize: 14,
    color: Colors.light.secondaryText,
    lineHeight: 20,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.light.border,
    borderStyle: "dashed" as const,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.light.primary,
  },
  addGratitudeForm: {
    gap: 12,
  },
  input: {
    backgroundColor: Colors.light.secondaryBackground,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: Colors.light.text,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  formButtons: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    backgroundColor: Colors.light.tertiaryBackground,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  submitButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
  },
  submitButtonDisabled: {
    backgroundColor: Colors.light.tertiaryBackground,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.light.background,
  },
});
