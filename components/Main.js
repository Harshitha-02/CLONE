import React, { Component } from 'react'
import { View, Text } from 'react-native'
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import{ connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { fetchUser, fetchUserPosts, fetchUserFollowing, clearData } from '../redux/actions/index'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { getAuth } from 'firebase/auth';

import FeedScreen from './main/Feed'
import SearchScreen from './main/Search'
import ProfileScreen from './main/Profile'

const Tab = createMaterialBottomTabNavigator();

const EmptyScreen = () => {
  return (null)
}

class Main extends Component {
  componentDidMount() {
    this.props.clearData();
    this.props.fetchUser();
    this.props.fetchUserPosts();
    this.props.fetchUserFollowing();

  }
  render() {
    const { navigation } = this.props;
    return (
      
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
          listeners={() => ({
            tabPress: (event) => {
              event.preventDefault();
              navigation.navigate('Profile', { uid: getAuth().currentUser.uid });
            },
          })}
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
  bindActionCreators({fetchUser, fetchUserPosts, fetchUserFollowing, clearData }, dispatch);

export default connect(mapStateToProps, mapDispatchProps)(Main);