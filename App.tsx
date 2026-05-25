import { useEffect } from "react";
import { Alert } from "react-native";
import * as Updates from "expo-updates";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import ExpenseTracker from "./src/screens/ExpenseTracker";
import HomeScreen from "./src/screens/HomeScreen";
import HistoryScreen from "./src/screens/HistoryScreen";
import BudgetPlanningScreen from "./src/screens/BudgetPlanning";
import { useFinanceStore } from "./src/store/useFinanceStore";
import { COLORS } from "./src/constants/color";

const Stack = createNativeStackNavigator();

export default function App() {
  const theme = useFinanceStore((state) => state.theme) || "light";
  const colors = COLORS[theme];

  const MyTheme = {
    ...DefaultTheme, // Inherits fonts and other required properties
    dark: theme === "dark",
    colors: {
      ...DefaultTheme.colors, // Fallback for any missing color properties
      primary: colors.accent,
      background: colors.background,
      card: colors.cardBackground,
      text: colors.textMain,
      border: colors.border,
      notification: colors.accent,
    },
  };

  useEffect(() => {
    async function onFetchUpdateAsync() {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          Alert.alert(
            "Update Available",
            "Victor pushed a new feature! Would you like to download it now?",
            [
              { text: "Later", style: "cancel" },
              {
                text: "Download",
                onPress: async () => {
                  try {
                    await Updates.fetchUpdateAsync();
                    await Updates.reloadAsync();
                  } catch (error) {
                    Alert.alert("Error", "Failed to apply the update.");
                  }
                },
              },
            ]
          );
        }
      } catch (error) {
        // Silently fail if offline or dev mode
        console.log("Error checking for updates:", error);
      }
    }

    if (!__DEV__) {
      onFetchUpdateAsync();
    }
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={MyTheme}>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerShown: false,
            animation: "slide_from_right",
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="History" component={HistoryScreen} />
          <Stack.Screen name="ExpenseTracker" component={ExpenseTracker} />
          <Stack.Screen
            name="BudgetPlanning"
            component={BudgetPlanningScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
