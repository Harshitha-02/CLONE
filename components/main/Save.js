import React, { useState } from 'react';
import { View, TextInput, Image, Button } from 'react-native';

import { getAuth } from 'firebase/auth';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

import { NavigationContainer } from '@react-navigation/native';

export default function Save(props) {
  const [caption, setCaption] = useState('');

  const uploadImage = async () => {
    const user = getAuth().currentUser;

    if (!user) {
      console.error('User not authenticated');
      return;
    }
    
    const uri = props.route.params.image;
    const childPath = `post/${getAuth().currentUser.uid}/${Math.random().toString(36)}`;

    const response = await fetch(uri);
    const blob = await response.blob();

    const storageRef = ref(getStorage(), childPath);
    const uploadTask = uploadBytesResumable(storageRef, blob);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log(`Upload is ${progress}% done`);
      },
      (error) => {
        console.error(error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          savePostData(downloadURL);
          console.log(downloadURL);
        });
      }
    );
  };

  const savePostData = (downloadURL) => {
    const db = getFirestore();

    addDoc(collection(db, 'posts', getAuth().currentUser.uid, 'userPosts'), {
      downloadURL,
      caption,
      creation: serverTimestamp(),
    })
      .then(() => {
        props.navigation.popToTop();
      })
      .catch((error) => {
        console.error('Error adding document: ', error);
      });
  };

  return (
    <View style={{ flex: 1 }}>
      <Image source={{ uri: props.route.params.image }} />
      <TextInput
        placeholder="Write a Caption . . ."
        onChangeText={(caption) => setCaption(caption)}
      />
      <Button title="Save" onPress={() => uploadImage()} />
    </View>
  );
}
