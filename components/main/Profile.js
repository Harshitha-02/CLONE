import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, FlatList, Button,TouchableOpacity } from 'react-native';
import { getFirestore, doc, getDoc, collection, query, orderBy, getDocs, setDoc, deleteDoc } from 'firebase/firestore';
import { connect } from 'react-redux';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const Profile = (props) => {
  const [userPosts, setUserPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    const { currentUser, posts, route } = props;
    const { uid } = route.params || {};

    if (uid && uid === currentUser.uid) {
      setUser(currentUser);
      setUserPosts(posts);
      setCurrentUid(currentUser ? currentUser.uid : null);
      if (props.following.indexOf(props.route.params.uid) > -1) {
        setFollowing(true);
      } else {
        setFollowing(false);
      }
    } else {
      const firestore = getFirestore();

      const fetchUserData = async () => {
        try {
          const userDocRef = doc(firestore, 'users', props.route.params.uid);
          const snapshot = await getDoc(userDocRef);

          if (snapshot.exists()) {
            setUser(snapshot.data());
          } else {
            console.log('User does not exist');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      };

      const fetchUserPostsData = async () => {
        try {
          const userPostsCollection = collection(firestore, 'posts', props.route.params.uid, 'userPosts');
          const q = query(userPostsCollection, orderBy('creation', 'asc'));
          const postsSnapshot = await getDocs(q);

          let posts = postsSnapshot.docs.map(doc => {
            const data = doc.data();
            const id = doc.id;
            return { id, ...data };
          });

          setUserPosts(posts);
        } catch (error) {
          console.error('Error fetching user posts:', error);
        }
      };

      fetchUserData();
      fetchUserPostsData();
    }

  }, [props.route.params.uid, props.following, props.currentUser ]);

  const onFollow = async () => {
    const db = getFirestore();
    const auth = getAuth();

    try {
      const followingRef = doc(db, 'following', auth.currentUser.uid, 'userFollowing', props.route.params.uid);
      await setDoc(followingRef, {});
      setFollowing(true);
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const onUnfollow = async () => {
    const db = getFirestore();
    const auth = getAuth();

    try {
      const followingRef = doc(db, 'following', auth.currentUser.uid, 'userFollowing', props.route.params.uid);
      await deleteDoc(followingRef);
      setFollowing(false);
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
  };

  if (user === null) {
    return <View />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.containerInfo}>
        <Text>{user.name}</Text>
        <Text>{user.email}</Text>
        {props.route.params.uid !== props.currentUser.uid ? (
          <View>
            {following ? (
              <TouchableOpacity style={styles.button} onPress={() => onUnfollow()} >
                <Text style={styles.buttonText}>Following</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.button} onPress={() => onFollow()} >
                <Text style={styles.buttonText}>Follow</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : null}
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
};

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
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'black',
  },

  buttonText: {
    fontSize: 16,
  },
});

const mapStateToProps = (store) => ({
  currentUser: store.userState.currentUser,
  posts: store.userState.posts,
  following: store.userState.following,
});

export default connect(mapStateToProps, null)(Profile);
