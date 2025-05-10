import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import MinhaContaScreen from "../screens/MinhaContaScreen";

export default function AppNavigator () {
    const Stack = createNativeStackNavigator();

    return (
        <Stack.Navigator>
            <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="MinhaConta" component={MinhaContaScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
    )
}