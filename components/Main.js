import React, { Component } from 'react'
import { View, Text } from 'react-native'
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import{ connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { fetchUser, fetchUserPosts, fetchUserFollowing } from '../redux/actions/index'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { getAuth, onAuthStateChanged } from 'firebase/auth';

import FeedScreen from './main/Feed'
import SearchScreen from './main/Search'
import ProfileScreen from './main/Profile'

const Tab = createMaterialBottomTabNavigator();

const EmptyScreen = () => {
  return (null)
}

class Main extends Component {
    componentDidMount(){
      // this.props.fetchUser();
      // this.props.fetchUserPosts();
      const { fetchUser, fetchUserPosts } = this.props;
      const auth = getAuth();

      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          fetchUser();
          fetchUserPosts();
          fetchUserFollowing();
        } else {
          // Handle the case when the user is not signed in
        }
      });

      return () => unsubscribe();
    }
  render() {
    // const { currentUser } = this.props;
    // console.log()
    //     if(currentUser==undefined){
    //         return(
    //             <View></View>
    //         )
    //     }
    const { navigation, currentUser } = this.props;
    return (
      // <View style={{ flex:1, justifyContent:'center'}}>
      //   <Text>{currentUser.name} is logged in</Text>
      // </View>
      <Tab.Navigator initialRouteName='Feed' labeled={false}>
        <Tab.Screen name="Feed" component={FeedScreen}
          options = {{
            tabBarIcon: ({color, size }) => (
              <MaterialCommunityIcons name="home" color={color} size={26} />
            )
          }} />
        <Tab.Screen name="Search" component={SearchScreen} navigation={this.props.navigation}
          options = {{
            tabBarIcon: ({color, size }) => (
              <MaterialCommunityIcons name="magnify" color={color} size={26} />
            )
          }} />
        <Tab.Screen name="AddContainer" component={EmptyScreen}
          listeners={({ navigation }) => ({
            tabPress:event => {
              event.preventDefault();
              navigation.navigate("Add")
            }
          })}
          options = {{
            tabBarIcon: ({color, size }) => (
              <MaterialCommunityIcons name="plus-blox" color={color} size={26} />
            )
          }} />
        <Tab.Screen name="Profile" component={ProfileScreen}
          options = {{
            tabBarIcon: ({color, size }) => (
              <MaterialCommunityIcons name="account-circle" color={color} size={26} />
            )
          }} />
      </Tab.Navigator>
    )
  }
}

const mapStateToProps = (store) => ({
  currentUser: store.userState.currentUser
});

const mapDispatchProps = (dispatch) => 
  bindActionCreators({fetchUser, fetchUserPosts, fetchUserFollowing }, dispatch);

export default connect(mapStateToProps, mapDispatchProps)(Main);