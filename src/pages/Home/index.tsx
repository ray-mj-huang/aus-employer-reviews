import { useState, useEffect } from "react";
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from "@/firebase"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import AddReviewForm from "@/pages/Home/containers/AddReviewForm"
import ReviewCard from "@/pages/Home/containers/ReviewCard"
import { Plus } from "lucide-react"

export default function Home() {

  const [reviews, setReviews] = useState([]);

  const [openAddReviewModal, setOpenAddReviewModal] = useState(false)

  useEffect(() => {
    const reviews = query(collection(db, "reviews"));
    onSnapshot(reviews, (querySnapshot) => {
      const updatedReviews = querySnapshot.docs.map(x => x.data())
      setReviews(updatedReviews)
    });
  }, []);

  return (
    <div className="bg-[#1e1e1e] text-white">
      <div className="container">
        <div
          className="font-courgette text-[48px] text-center pt-[35px] pb-[10px]"
        >
          AUS Good Boss
        </div>
        <div
          className="flex flex-col items-center"
        >
          <Dialog open={openAddReviewModal} onOpenChange={setOpenAddReviewModal}>
            <DialogTrigger asChild>
              <Button
                className="w-[320px] h-[120px] rounded-[10px] bg-black bg-gradient-to-r from-black to-neutral-900 via-black hover:bg-gradient-to-r hover:from-neutral-900 hover:to-neutral-800 hover:via-neutral-800 my-[20px] mx-0 p-[15px_0_22px] flex flex-col justify-evenly items-center text-[24px] tracking-wide cursor-pointer md:my-[20px_0_0_0]"
              >
                <Plus size={32} color="#f4b510" className="mt-1" />
                Add a Review
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px] lg:max-w-[400] overflow-y-scroll max-h-screen">
              {/* <DialogHeader>
                <DialogTitle>Add a Review</DialogTitle>
                <DialogDescription>
                  Let's add a review of your unique work experience!
                </DialogDescription>
              </DialogHeader> */}
              <AddReviewForm setOpenAddReviewModal={setOpenAddReviewModal} />
              <DialogFooter className="sm:justify-start">
                <DialogClose asChild>
                  <Button type="button" variant="outline" className="mb-[30px]">
                    Close
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div
          className="review-card-container flex flex-wrap items-start pt-[20px]"
        >
          {
            reviews?.map((review, index) => (
              <ReviewCard key={index} review={review} />
            ))
          }
        </div>
        <Button
          onClick={() => setOpenAddReviewModal(true)}
          className="w-[50px] h-[50px] rounded-[25px] bg-black bg-gradient-to-r from-black to-neutral-900 via-black hover:bg-gradient-to-r hover:from-neutral-900 hover:to-neutral-800 hover:via-neutral-800 flex flex-col justify-center items-center cursor-pointer fixed right-5 bottom-5"
        >
          <Plus size={32} color="#f4b510" />
        </Button>
      </div>
    </div>
  )
}
