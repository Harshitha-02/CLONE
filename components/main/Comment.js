import { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, TextInput } from 'react-native';

import { getFirestore, collection, doc, getDocs, addDoc } from 'firebase/firestore';
import { getAuth, currentUser } from 'firebase/auth';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { fetchUsersData } from '../../redux/actions/index';

export default function Comment(props) {
    const [comments, setComments] = useState([]);
    const [postId, setPostId] = useState("");
    const [text, setText] = useState("");

    const firestore = getFirestore();
    const auth = getAuth();

    useEffect(() => {
        
        function matchUserToComment(comments) {
            for (let i = 0; i < comments.length; i++) {
                if (comments[i].hasOwnProperty('user')) {
                    continue;
                }

                const user = props.users.find(x => x.uid === comments[i].creator)
                if (user == undefined) {
                    props.fetchUsersData(comments[i].creator, false)
                } else {
                    comments[i].user = user
                }
            }
            setComments(comments)
        }

        if (props.route.params.postId !== postId) {
            const commentsCollection = collection(
                doc(firestore, 'posts', props.route.params.uid, 'userPosts', props.route.params.postId),
                'comments'
            );

            getDocs(commentsCollection)
                .then((snapshot) => {
                    let comments = snapshot.docs.map((doc) => {
                        const data = doc.data();
                        const id = doc.id;
                        return { id, ...data };
                    });

                    setComments(comments);
                })
                .catch((error) => {
                    console.error('Error fetching comments: ', error);
                });

            setPostId(props.route.params.postId);
        }
    }, [props.route.params.postId]);

    const onCommentSend = async () => {
        const commentsCollection = collection(
            doc(firestore, 'posts', props.route.params.uid, 'userPosts', props.route.params.postId),
            'comments'
        );

        try {
            await addDoc(commentsCollection, {
                creator: auth.currentUser.uid,
                text,
            });
        } catch (error) {
            console.error('Error adding comment: ', error);
        }
    };

    return (
        <View>
            <FlatList
                numColumns={1}
                horizontal={false}
                data={comments}
                renderItem={({ item }) => (
                    <View>
                        <Text>{item.text}</Text>
                    </View>
                )}
            />

            <View>
                <TextInput placeholder="comment.." onChangeText={(text) => setText(text)} />
                <Button onPress={onCommentSend} title="Send" />
            </View>
        </View>
    );
}
