import { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Send, Sparkles } from "lucide-react-native";
import { useRorkAgent, createRorkTool } from "@rork/toolkit-sdk";
import { z } from "zod";

import Colors from "@/constants/colors";
import { useTasks } from "@/contexts/TasksContext";
import { useGratitude } from "@/contexts/GratitudeContext";



export default function CoachScreen() {
  const insets = useSafeAreaInsets();
  const { addTask } = useTasks();
  const { addOrUpdateEntry } = useGratitude();
  const [input, setInput] = useState("");

  const { messages, sendMessage } = useRorkAgent({
    tools: {
      addTaskToMatrix: createRorkTool({
        description: "Add a task to the Life Matrix in a specific quadrant",
        zodSchema: z.object({
          title: z.string().describe("Task title"),
          description: z.string().optional().describe("Task description"),
          quadrant: z
            .enum(["1", "2", "3", "4"])
            .describe("Quadrant: 1=Urgent&Important, 2=Not Urgent&Important (Growth), 3=Urgent&Not Important, 4=Neither"),
        }),
        execute(params) {
          addTask({
            title: params.title,
            description: params.description,
            quadrant: parseInt(params.quadrant) as 1 | 2 | 3 | 4,
            completed: false,
          });
          return "Task added successfully to the matrix!";
        },
      }),
      recordGratitude: createRorkTool({
        description: "Record a gratitude entry for today",
        zodSchema: z.object({
          entries: z.array(z.string()).describe("List of things to be grateful for"),
          person: z.string().optional().describe("Person they're grateful for"),
          reason: z.string().optional().describe("Reason for gratitude"),
        }),
        execute(params) {
          const today = new Date().toISOString().split("T")[0];
          addOrUpdateEntry({
            date: today,
            entries: params.entries,
            gratefulFor: params.person && params.reason 
              ? [{ person: params.person, reason: params.reason }]
              : [],
          });
          return "Gratitude entry recorded for today!";
        },
      }),
    },
  });

  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input.trim());
      setInput("");
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "AI Coach",
          headerStyle: {
            backgroundColor: Colors.light.background,
          },
          headerTintColor: Colors.light.primary,
          headerShadowVisible: false,
        }}
      />
      <KeyboardAvoidingView
        style={[styles.container, { paddingBottom: insets.bottom }]}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <ScrollView
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.length === 0 && (
            <View style={styles.welcomeCard}>
              <Sparkles size={32} color={Colors.light.primary} />
              <Text style={styles.welcomeTitle}>Life Compass Coach</Text>
              <Text style={styles.welcomeText}>
                I can help you clarify your values and priorities based on the 7 Habits.
                I can add tasks to your matrix and record gratitude entries.
              </Text>
              <Text style={styles.welcomeSubtext}>
                Try: &quot;Add a task to practice meditation to quadrant 2&quot; or &quot;Record that I&apos;m grateful for my family&quot;
              </Text>
            </View>
          )}

          {messages.map((message) => (
            <View key={message.id} style={styles.messageGroup}>
              {message.parts.map((part, index) => {
                if (part.type === "text") {
                  return (
                    <View
                      key={`${message.id}-${index}`}
                      style={[
                        styles.messageBubble,
                        message.role === "user" ? styles.userBubble : styles.assistantBubble,
                      ]}
                    >
                      <Text
                        style={[
                          styles.messageText,
                          message.role === "user" ? styles.userText : styles.assistantText,
                        ]}
                      >
                        {part.text}
                      </Text>
                    </View>
                  );
                }

                if (part.type === "tool") {
                  if (part.state === "input-streaming" || part.state === "input-available") {
                    return (
                      <View key={`${message.id}-${index}`} style={styles.toolBubble}>
                        <Text style={styles.toolText}>
                          ✨ {part.toolName === "addTaskToMatrix" ? "Adding task to matrix..." : "Recording gratitude..."}
                        </Text>
                      </View>
                    );
                  }

                  if (part.state === "output-available") {
                    return (
                      <View key={`${message.id}-${index}`} style={styles.toolBubble}>
                        <Text style={styles.toolText}>
                          ✅ {part.toolName === "addTaskToMatrix" ? "Task added successfully!" : "Gratitude recorded!"}
                        </Text>
                      </View>
                    );
                  }
                }

                return null;
              })}
            </View>
          ))}


        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ask me about your values..."
            value={input}
            onChangeText={setInput}
            placeholderTextColor={Colors.light.tertiaryText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!input.trim()}
          >
            <Send size={20} color={Colors.light.background} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.secondaryBackground,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    gap: 12,
  },
  welcomeCard: {
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
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
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.light.text,
    textAlign: "center",
  },
  welcomeText: {
    fontSize: 15,
    color: Colors.light.secondaryText,
    textAlign: "center",
    lineHeight: 22,
  },
  welcomeSubtext: {
    fontSize: 13,
    color: Colors.light.tertiaryText,
    textAlign: "center",
    lineHeight: 18,
    marginTop: 8,
  },
  messageGroup: {
    gap: 8,
  },
  messageBubble: {
    maxWidth: "80%",
    borderRadius: 16,
    padding: 12,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: Colors.light.primary,
  },
  assistantBubble: {
    alignSelf: "flex-start",
    backgroundColor: Colors.light.background,
  },
  toolBubble: {
    alignSelf: "flex-start",
    backgroundColor: Colors.light.secondaryBackground,
    borderRadius: 12,
    padding: 10,
    maxWidth: "80%",
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: Colors.light.background,
  },
  assistantText: {
    color: Colors.light.text,
  },
  toolText: {
    fontSize: 13,
    color: Colors.light.secondaryText,
    fontStyle: "italic" as const,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 12,
    gap: 8,
    backgroundColor: Colors.light.background,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.light.secondaryBackground,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.light.text,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: Colors.light.tertiaryBackground,
  },
});
