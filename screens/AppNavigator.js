import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthScreen from './AuthScreen';
import CompleteProfile from './CompleteProfile';
import HomeScreen from './HomeScreen'; // pantalla placeholder

const Stack = createNativeStackNavigator();

export default function AppNavigator(){
  return (
    <Stack.Navigator initialRouteName="Auth">
      <Stack.Screen name="Auth" component={AuthScreen} />
      <Stack.Screen name="CompleteProfile" component={CompleteProfile} />
      <Stack.Screen name="Home" component={HomeScreen} />
    </Stack.Navigator>
  );
}
