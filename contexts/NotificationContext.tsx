import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { useEffect, useState, useCallback, useMemo } from "react";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const REMINDER_TIME_KEY = "life-compass-reminder-time";
const DEFAULT_REMINDER_TIME = "15:40";

export const [NotificationProvider, useNotifications] = createContextHook(() => {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [reminderTime, setReminderTime] = useState(DEFAULT_REMINDER_TIME);

  const registerForPushNotifications = useCallback(async () => {
    if (Platform.OS === "web") {
      console.log("Notifications not supported on web");
      return false;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("Failed to get push notification permissions");
        setPermissionGranted(false);
        return false;
      }

      console.log("Notification permissions granted");
      setPermissionGranted(true);
      return true;
    } catch (error) {
      console.error("Error requesting notification permissions:", error);
      return false;
    }
  }, []);

  const loadReminderTime = useCallback(async () => {
    if (Platform.OS === "web") {
      return;
    }

    try {
      const stored = await AsyncStorage.getItem(REMINDER_TIME_KEY);
      const time = stored || DEFAULT_REMINDER_TIME;
      setReminderTime(time);
      console.log("Loaded reminder time:", time);
    } catch (error) {
      console.error("Error loading reminder time:", error);
    }
  }, []);

  const scheduleDailyGratitudeReminder = useCallback(async (time?: string) => {
    if (Platform.OS === "web") {
      return;
    }

    try {
      const timeToUse = time || reminderTime;
      const [hours, minutes] = timeToUse.split(":").map(Number);

      await Notifications.cancelAllScheduledNotificationsAsync();

      const now = new Date();
      const scheduledTime = new Date();
      scheduledTime.setHours(hours, minutes, 0, 0);

      if (now >= scheduledTime) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Daily Reflection 🌟",
          body: "Take a moment to reflect on your day. What are you grateful for?",
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          hour: hours,
          minute: minutes,
          repeats: true,
        },
      });

      const hourLabel = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
      const period = hours >= 12 ? "PM" : "AM";
      console.log(`Daily gratitude reminder scheduled for ${hourLabel}:${minutes.toString().padStart(2, "0")} ${period}`);
    } catch (error) {
      console.error("Error scheduling notification:", error);
    }
  }, [reminderTime]);

  useEffect(() => {
    registerForPushNotifications();
    loadReminderTime();
  }, [registerForPushNotifications, loadReminderTime]);

  useEffect(() => {
    if (reminderTime) {
      scheduleDailyGratitudeReminder();
    }
  }, [reminderTime, scheduleDailyGratitudeReminder]);

  return useMemo(() => ({
    permissionGranted,
    reminderTime,
    registerForPushNotifications,
    scheduleDailyGratitudeReminder,
  }), [permissionGranted, reminderTime, registerForPushNotifications, scheduleDailyGratitudeReminder]);
});
