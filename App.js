import { StatusBar } from 'expo-status-bar';
import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './redux/reducers';
import { thunk } from 'redux-thunk';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import LandingScreen from './components/auth/Landing';
import RegisterScreen from './components/auth/Register';
import LoginScreen from './components/auth/Login'
import MainScreen from './components/Main';
import AddScreen from './components/main/Add'
import SaveScreen from './components/main/Save'
import ProfileScreen from './components/main/Profile'
import CommentScreen from './components/main/Comment'

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyBIszHKpQw4x87Lg8guZpaEnfbhIWBRTKo',
  authDomain: 'alone-da17a.firebaseapp.com',
  projectId: 'alone-da17a',
  storageBucket: 'alone-da17a.appspot.com',
  messagingSenderId: '308502011866',
  appId: '1:308502011866:web:c52b99118c98e622e2eae3',
  measurementId: 'G-XWQXMVYTFJ',
};

const initializeFirebase = async () => {
  const app = await initializeApp(firebaseConfig);
  const firestore = getFirestore(app); // Initialize Firestore
  // ... Any other Firebase initialization code
  return { app, firestore };
};

// Initialize Firebase
let firebaseApp;
let firestoreInstance;
initializeFirebase().then(({ app, firestore }) => {
  firebaseApp = app;
  firestoreInstance = firestore;
});

const Stack = createStackNavigator();

const store = createStore(rootReducer, applyMiddleware(thunk))

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedIn: false,
      loaded: false,
    };
  }

  componentDidMount() {
    const auth = getAuth(firebaseApp);
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        this.setState({
          loggedIn: false,
          loaded: true,
        });
      } else {
        this.setState({
          loggedIn: true,
          loaded: true,
        });
      }
    });
  }

  render() {
    const { loggedIn, loaded } = this.state;
    if (!loaded) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text> Loading.. </Text>
        </View>
      );
    }
    if (!loggedIn) {
      return (
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Landing">
            <Stack.Screen name="Landing" component={LandingScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      );
    }

    return (
      <Provider store={store}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Main">
            <Stack.Screen name="Main" component={MainScreen} option={{headerShown:false}} />
            <Stack.Screen name="Add" component={AddScreen}  navigation={this.props.navigation} />
            <Stack.Screen name="Save" component={SaveScreen}  navigation={this.props.navigation} />
            <Stack.Screen name="Comment" component={CommentScreen}  navigation={this.props.navigation} />
          </Stack.Navigator>
        </NavigationContainer>
      </Provider>
    );
  }
}

export default App;
