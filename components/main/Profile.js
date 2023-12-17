import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, FlatList } from 'react-native';

import { getFirestore, doc, getDoc, collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { connect } from 'react-redux';

function Profile(props) {
  const [userPosts, setUserPosts] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const { currentUser } = props;
      const db = getFirestore();
      const userRef = doc(db, 'users', props.route.params.uid);

      try {
        if (props.route.params.uid === currentUser.uid) {
          setUser(currentUser);
          setUserPosts(props.posts);
        } else {
          const userSnapshot = await getDoc(userRef);

          if (userSnapshot.exists()) {
            setUser(userSnapshot.data());
          } else {
            console.log('User does not exist');
          }

          const userPostsCollection = collection(
            db,
            'posts',
            props.route.params.uid,
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
  }, [props.route.params.uid, props.currentUser, props.posts]);

  if (user === null) {
    return <View />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.containerInfo}>
        <Text>{user.name}</Text>
        <Text>{user.email}</Text>
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
});

export default connect(mapStateToProps, null)(Profile);
