import { StatusBar } from 'expo-status-bar';
import React, { Component } from 'react';
import { View, Text} from 'react-native';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBIszHKpQw4x87Lg8guZpaEnfbhIWBRTKo",
  authDomain: "alone-da17a.firebaseapp.com",
  projectId: "alone-da17a",
  storageBucket: "alone-da17a.appspot.com",
  messagingSenderId: "308502011866",
  appId: "1:308502011866:web:c52b99118c98e622e2eae3",
  measurementId: "G-XWQXMVYTFJ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
// if(firebase.apps.length === 0 ) {
//   firebase.initializeApp(firebaseConfig)
// }
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import LandingScreen from './components/auth/Landing';
import RegisterScreen from './components/auth/Register';

const Stack = createStackNavigator();

export class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      loggedIn: false,
      loaded: false,
    };
  }

  componentDidMount() {
    onAuthStateChanged(auth, (user) => {
      if(!user) {
        this.setState({
          loggedIn: false,
          loaded: true
        });
      } else {
        this.setState({
          loggedIn: true,
          loaded:true,
        });
      }
    });
  }

  render() {
    const { loggedIn, loaded } = this.state;
    if(!loaded) {
      return(
        <View style= {{ flex:1, justifyContent:'center', alignItems:'center'}}>
          <Text> Loading.. </Text>
        </View>
      );
    }
    return (
      <NavigationContainer >
        <Stack.Navigator initialRouteName="Landing">
          <Stack.Screen name="Landing" component={LandingScreen} options={{ headerShown: false }}/>
          <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
}

export default App



