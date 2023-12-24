import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, FlatList, Button } from 'react-native';

import { getAuth, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, collection, query, orderBy, getDocs, setDoc, deleteDoc } from 'firebase/firestore';
import { connect } from 'react-redux';

function Profile(props) {
  const [userPosts, setUserPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    const { currentUser, posts } = props;

    const fetchData = async () => {
      if (props.route.params.uid === getAuth().currentUser.uid) {
        setUser(currentUser);
        setUserPosts(posts);
      } else {
        const userDoc = await getDoc(doc(getFirestore(), 'users', props.route.params.uid));
        const postsQuery = query(
          collection(getFirestore(), 'posts', props.route.params.uid, 'userPosts'),
          orderBy('creation', 'asc')
        );

        const postsSnapshot = await getDocs(postsQuery);

        setUser(userDoc.data());

        const posts = postsSnapshot.docs.map(doc => {
          const data = doc.data();
          const id = doc.id;
          return { id, ...data };
        });

        setUserPosts(posts);
      }

      if (props.following.indexOf(props.route.params.uid) > -1) {
        setFollowing(true);
      } else {
        setFollowing(false);
      }
    };

    fetchData();
  }, [props.route.params.uid, props.following]);

  const onFollow = async () => {
    const followingDocRef = doc(getFirestore(), 'following', getAuth().currentUser.uid, 'userFollowing', props.route.params.uid);
    await setDoc(followingDocRef, {});
  };

  const onUnfollow = async () => {
    const followingDocRef = doc(getFirestore(), 'following', getAuth().currentUser.uid, 'userFollowing', props.route.params.uid);
    await deleteDoc(followingDocRef);
  };

  const onLogout = () => {
    signOut(getAuth());
  };

  if (user === null) {
    return <View />;
  }
  return (
    <View style={styles.container}>
      <View style={styles.containerInfo}>
        <Text>{user.name}</Text>
        <Text>{user.email}</Text>

        {props.route.params.uid !== getAuth().currentUser.uid ? (
          <View>
            {following ? (
              <Button title="Following" onPress={() => onUnfollow()} />
            ) : (
              <Button title="Follow" onPress={() => onFollow()} />
            )}
          </View>
        ) : (
          <Button title="Logout" onPress={() => onLogout()} />
        )}
      </View>

      <View style={styles.containerGallery}>
        <FlatList
          numColumns={3}
          horizontal={false}
          data={userPosts}
          renderItem={({ item }) => (
            <View style={styles.containerImage}>
              <Image style={styles.image} source={{ uri: item.downloadURL }} />
            </View>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerInfo: {
    margin: 20,
  },
  containerGallery: {
    flex: 1,
  },
  containerImage: {
    flex: 1 / 3,
  },
  image: {
    flex: 1,
    aspectRatio: 1 / 1,
  },
});

const mapStateToProps = (store) => ({
  currentUser: store.userState.currentUser,
  posts: store.userState.posts,
  following: store.userState.following,
});

export default connect(mapStateToProps, null)(Profile);
