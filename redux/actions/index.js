import { USER_STATE_CHANGE, USER_POSTS_STATE_CHANGE } from '../constants/index'
import { getFirestore, doc, getDoc, collection, query, orderBy, getDocs  } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export function fetchUser() {
    return (async (dispatch) => {
        const auth = getAuth();
        const firestore = getFirestore();

        try {
            const userDocRef = doc(firestore, 'users', auth.currentUser.uid);
            const snapshot = await getDoc(userDocRef);

            if (snapshot.exists()) {
                dispatch({ type: USER_STATE_CHANGE, currentUser: snapshot.data() });
            } else {
                console.log('User does not exist');
            }
        } catch (error) {
            console.error('Error fetching user:', error);
        }
    });
}

export function fetchUserPosts() {
    return async (dispatch) => {
        const auth = getAuth();
        const firestore = getFirestore();

        if (!auth.currentUser) {
            console.error('User not authenticated.');
            // Handle the error here or redirect to authentication.
            return;
        }

        try {
            const userPostsRef = collection(firestore, 'posts', auth.currentUser.uid, 'userPosts');
            const userPostsQuery = query(userPostsRef, orderBy('creation', 'asc'));
            const snapshot = await getDocs(userPostsQuery);

            let posts = snapshot.docs.map((doc) => {
                const data = doc.data();
                const id = doc.id;
                return { id, ...data };
            });

            dispatch({ type: USER_POSTS_STATE_CHANGE, posts });
        } catch (error) {
            console.error('Error fetching user posts:', error);
        }
    };
}