import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import ExpenseTracker from "./src/screens/ExpenseTracker";
// Your Screens
import HomeScreen from "./src/screens/HomeScreen";
import HistoryScreen from "./src/screens/HistoryScreen";

// 1. Create the Stack
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
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
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
