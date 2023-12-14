import React, { Component } from 'react';
import { View, Button, TextInput } from 'react-native';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getAuth } from 'firebase/auth';

export class Login extends Component {
    constructor(props) {
        super(props);

        this.state = {
            email : '',
            password: '',
        }

        this.onSignUp=this.onSignUp.bind(this)
    }

    onSignUp() {
      const { email, password}= this.state;
      const auth = getAuth();
      signInWithEmailAndPassword(auth, email, password)
        .then((result) => {
          console.log(result)
        })
        .catch((error) => {
          console.log(error)
        })
    }

  render() {
    return (
      <View>
        <TextInput
            placeholder='name'
            onChangeText={(name) => this.setState({ name })}
        />
        <TextInput
            placeholder='email'
            onChangeText={(email) => this.setState({ email })}
        />
        <TextInput
            placeholder='password'
            secureTextEntry={true}
            onChangeText={(password) => this.setState({ password })}
        />
        <Button 
            onPress={() => this.onSignUp()}
            title="Sign In"
            />
      </View>
    )
  }
}

export default Login
