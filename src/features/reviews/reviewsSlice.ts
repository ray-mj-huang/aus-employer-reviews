import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { addDoc, collection, query, onSnapshot } from 'firebase/firestore';
import { db } from "@/firebase";
import { formSchema } from "@/features/reviews/schemas"
import { z } from "zod"

const reviewsSlice = createSlice({
  name: 'reviews',
  initialState: {
    reviews: [],
    isAddReviewModalOpen: false
  },
  reducers: {
    setReviews: (state, action) => {
      state.reviews = action.payload;
    },
    setAddReviewModal: (state, action) => {
      state.isAddReviewModalOpen = action.payload;
    }
  }
});

export const { setReviews, setAddReviewModal } = reviewsSlice.actions;

// Thunk for fetching reviews
export const fetchReviews = () => (dispatch) => {
  const reviewsQuery = query(collection(db, "reviews"));
  return onSnapshot(reviewsQuery, (querySnapshot) => {
    const updatedReviews = querySnapshot.docs.map(x => x.data());
    dispatch(setReviews(updatedReviews));
  });
};

// Thunk for adding a review
export const addReview = createAsyncThunk(
  'reviews/addReview',
  async (values: z.infer<typeof formSchema>) => {
    try {
      const docRef = await addDoc(collection(db, 'reviews'), values);
      console.log('success', docRef.id)
    } catch (error) {
      console.error('Error adding document: ', error);
      throw error;
    }
  }
);

const reviewsReducer = reviewsSlice.reducer
export default reviewsReducer; 