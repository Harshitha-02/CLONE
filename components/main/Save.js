import React, { useState } from 'react'
import { View, TextInput, Image, Button } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
    // Your Firebase config
    apiKey: 'AIzaSyBIszHKpQw4x87Lg8guZpaEnfbhIWBRTKo',
    authDomain: 'alone-da17a.firebaseapp.com',
    projectId: 'alone-da17a',
    storageBucket: 'alone-da17a.appspot.com',
    messagingSenderId: '308502011866',
    appId: '1:308502011866:web:c52b99118c98e622e2eae3',
    measurementId: 'G-XWQXMVYTFJ',
  };
  
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const storage = getStorage(app);
  const firestore = getFirestore(app);
  


export default function Save(props) {
    const [caption, setCaption] = useState("")
    const uploadImage = async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            console.error('User not authenticated.');
            // Handle the error here or redirect to authentication.
            return;
        }

        const uri = props.route.params.image;
        const childPath = `post/${auth.currentUser.uid}/${Math.random().toString(36)}`;
      
        console.log(childPath);
      
        try {
          const response = await fetch(uri);
          const blob = await response.blob();
      
          const storageRef = ref(storage, childPath);
          const uploadTask = uploadBytesResumable(storageRef, blob);
      
          // Listen for state changes, errors, and completion of the upload
          uploadTask.on('state_changed', 
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              console.log(`Upload is ${progress}% done`);
            },
            (error) => {
              console.error('Error uploading image:', error);
              // Handle the error here
            },
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              await savePostData(downloadURL);
            }
          );
        } catch (error) {
          console.error('Error during image upload:', error);
          // Handle the error here
        }
      };
    // const uploadImage = async () => {
    //     const uri = props.route.params.image;
    //     const childPath = `post/${firebase.auth().currentUser.uid}/${Math.random().toString(36)}`;
    //     console.log(childPath)

    //     const response = await fetch(uri);
    //     const blob = await response.blob();

    //     const task = firebase
    //         .storage()
    //         .ref()
    //         .child(childPath)
    //         .put(blob);

    //     const taskProgress = snapshot => {
    //         console.log(`transferred: ${snapshot.bytesTransferred}`)
    //     }

    //     const taskCompleted = () => {
    //         task.snapshot.ref.getDownloadURL().then((snapshot) => {
    //             savePostData(snapshot);
    //             console.log(snapshot)
    //         })
    //     }

    //     const taskError = snapshot => {
    //         console.log(snapshot)
    //     }

    //     task.on("state_changed", taskProgress, taskError, taskCompleted);
    // }
    const savePostData = async (downloadURL) => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            console.error('User not authenticated.');
            // Handle the error here or redirect to authentication.
            return;
        }
        try {
            await addDoc(collection(firestore, `posts/${auth.currentUser.uid}/userPosts`), {
                downloadURL,
                caption,
                creation: serverTimestamp(),
            });
            props.navigation.popToTop();
        } catch (error) {
            console.error('Error saving post data:', error);
        }
      };
      
    // const savePostData = (downloadURL) => {

    //     firebase.firestore()
    //         .collection('posts')
    //         .doc(firebase.auth().currentUser.uid)
    //         .collection("userPosts")
    //         .add({
    //             downloadURL,
    //             caption,
    //             creation: firebase.firestore.FieldValue.serverTimestamp()
    //         }).then((function () {
    //             props.navigation.popToTop()
    //         }))
    // }
    return (
        <View style={{ flex: 1 }}>
            <Image source={{ uri: props.route.params.image }} />
            <TextInput
                placeholder="Write a Caption . . ."
                onChangeText={(caption) => setCaption(caption)}
            />

            <Button title="Save" onPress={() => uploadImage()} />
        </View>
    )
}