import { USER_STATE_CHANGE } from '../constants/index'
import { getFirestore, doc, getDoc } from 'firebase/firestore';
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