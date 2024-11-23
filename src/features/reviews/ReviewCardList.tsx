import { useEffect } from 'react';
import { useDispatch,useSelector } from 'react-redux';
import ReviewCard from "./ReviewCard"
import { RootState } from '@/store/store';
import { fetchReviews } from './reviewsSlice';
export default function ReviewCardList() {
  const dispatch = useDispatch();
  const reviews = useSelector((state: RootState) => state.reviews.reviews);

  useEffect(() => {
    dispatch(fetchReviews());
  }, [dispatch]);

  return (
    <>
      {
        reviews?.map((review, index) => (
          <ReviewCard key={index} review={review} />
        ))
      }
    </>
  )
}