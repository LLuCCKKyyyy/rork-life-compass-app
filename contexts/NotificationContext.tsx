import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
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

export const [NotificationProvider, useNotifications] = createContextHook(() => {
  const [permissionGranted, setPermissionGranted] = useState(false);

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

  const scheduleDailyGratitudeReminder = useCallback(async () => {
    if (Platform.OS === "web") {
      return;
    }

    try {
      await Notifications.cancelAllScheduledNotificationsAsync();

      const now = new Date();
      const scheduledTime = new Date();
      scheduledTime.setHours(15, 14, 0, 0);

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
          hour: 15,
          minute: 14,
          repeats: true,
        },
      });

      console.log("Daily gratitude reminder scheduled for 3:14 PM");
    } catch (error) {
      console.error("Error scheduling notification:", error);
    }
  }, []);

  useEffect(() => {
    registerForPushNotifications();
    scheduleDailyGratitudeReminder();
  }, [registerForPushNotifications, scheduleDailyGratitudeReminder]);

  return useMemo(() => ({
    permissionGranted,
    registerForPushNotifications,
    scheduleDailyGratitudeReminder,
  }), [permissionGranted, registerForPushNotifications, scheduleDailyGratitudeReminder]);
});
