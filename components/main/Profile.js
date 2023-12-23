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
    const fetchData = async () => {
      const { currentUser } = props;
      const db = getFirestore();
      const auth = getAuth();

      try {
        const userId = props.route?.params?.uid;

        if (!userId) {
          console.error('User ID is not defined');
          return;
        }

        if (userId === currentUser?.uid) {
          setUser(currentUser);
          setUserPosts(props.posts);
        } else {
          const userDocRef = doc(db, 'users', userId);
          const userSnapshot = await getDoc(userDocRef);

          if (userSnapshot.exists()) {
            setUser(userSnapshot.data());
          } else {
            console.log('User does not exist');
          }

          const userPostsCollection = collection(
            db,
            'posts',
            userId,
            'userPosts'
          );

          const q = query(userPostsCollection, orderBy('creation', 'asc'));
          const postsSnapshot = await getDocs(q);

          let posts = postsSnapshot.docs.map((doc) => {
            const data = doc.data();
            const id = doc.id;
            return { id, ...data };
          });

          setUserPosts(posts);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchData();
  }, [props.route?.params?.uid, props.currentUser, props.posts]);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const followingRef = doc(getFirestore(), 'following', auth.currentUser.uid, 'userFollowing', props.route?.params?.uid);
        const unsubscribeFollowing = onSnapshot(followingRef, (doc) => {
          setFollowing(doc.exists());
        });

        return () => unsubscribeFollowing();
      }
    });

    return () => unsubscribe();
  }, [props.route?.params?.uid, props.following]);

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
