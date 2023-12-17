import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity } from 'react-native';

import { getFirestore, query, collection, where, getDocs } from 'firebase/firestore';

const Search = (props) => {
  const [users, setUsers] = useState([]);

  const fetchUsers = async (search) => {
    const db = getFirestore();
    const usersCollection = collection(db, 'users');
    const q = query(usersCollection, where('name', '>=', search));

    try {
      const snapshot = await getDocs(q);

      let users = snapshot.docs.map((doc) => {
        const data = doc.data();
        const id = doc.id;
        return { id, ...data };
      });

      setUsers(users);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  return (
    <View>
      <TextInput
        placeholder="Type Here..."
        onChangeText={(search) => fetchUsers(search)}
      />

      <FlatList
        numColumns={1}
        horizontal={false}
        data={users}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => props.navigation.navigate('Profile', { uid: item.id })}
          >
            <Text>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default Search;
