import { useState, useEffect, useRef } from "react";
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { addDoc, collection, query, onSnapshot } from 'firebase/firestore';
import { db } from "@/firebase"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog"
import { Plus, ChevronDown, ChevronUp } from "lucide-react"

const AUSstateList = [
  {
    value: 'NSW',
    label: 'New South Wales (NSW)'
  },
  {
    value: 'VIC',
    label: 'Victoria (VIC)'
  },
  {
    value: 'QLD',
    label: 'Queensland (QLD)'
  },
  {
    value: 'SA',
    label: 'South Australia (SA)'
  },
  {
    value: 'WA',
    label: 'Western Australia (WA)'
  },
  {
    value: 'TAS',
    label: 'Tasmania (TAS)'
  },
  {
    value: 'NT',
    label: 'Northern Territory (NT)'
  },
  {
    value: 'ACT',
    label: 'Australian Capital Territory (ACT)'
  }
];

const stateColorList = [
  {
    value: 'NSW',
    color: '#A0C4FF'
  },
  {
    value: 'VIC',
    color: '#BDB2FF'
  },
  {
    value: 'QLD',
    color: '#FFD6A5'
  },
  {
    value: 'SA',
    color: '#FFADAD'
  },
  {
    value: 'WA',
    color: '#CAFFBF'
  },
  {
    value: 'TAS',
    color: '#9BF6FF'
  },
  {
    value: 'NT',
    color: '#FDFFB6'
  },
  {
    value: 'ACT',
    color: '#f3d8c7'
  }
] 

const formSchema = z.object({
  state: z.enum(['NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT'], {
    errorMap: () => ({ message: 'Please select a state' }),
  }),
  location: z.string(),
  workplaceName: z.string().min(1, 'Workplace name is required'),
  jobTitle: z.string().min(2, 'Job title is required'),
  lastYearWorked: z.preprocess((val) => Number(val), z.number().min(1900, 'Please enter a valid year').max(new Date().getFullYear(), 'Year cannot be in the future')),
  comment: z.string().min(2, 'Comment is required').max(3000),
})

function AddReviewForm({ setOpenAddReviewModal }) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: '',
      workplaceName: '',
      jobTitle: '',
      lastYearWorked: new Date().getFullYear(),
      comment: ''
    }
  })

  const { reset } = form; 
 
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const docRef = await addDoc(collection(db, 'reviews'),
        values,
      );
      reset()
      setOpenAddReviewModal(false)
    } catch (error) {
      console.error('Error adding document: ', error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pt-10 pb-5">
        {/* State */}
        <FormField
          control={form.control}
          name="state"
          render={({ field }) => (
            <FormItem>
              <FormLabel>State</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} >
                  <SelectTrigger
                    className="data-[placeholder]:text-gray-400"
                  >
                    <SelectValue
                      placeholder='where the workplace is located'
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {AUSstateList?.map((state, index) => (
                      <SelectItem
                        key={index}
                        value={state.value}
                      >
                        {state.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Location */}
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="more specific location (e.g. city or suburb name)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Workplace Name */}
        <FormField
          control={form.control}
          name="workplaceName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Workplace Name</FormLabel>
              <FormControl>
                <Input placeholder="company or shop name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Workplace Name */}
        <FormField
          control={form.control}
          name="jobTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Title / Position</FormLabel>
              <FormControl>
                <Input placeholder="describe your role in this job" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Last Year Worked */}
        <FormField
          control={form.control}
          name="lastYearWorked"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Year Worked</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Enter the last year you worked" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        {/* Comment */}
        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comment</FormLabel>
              <FormControl>
                <Textarea placeholder="Share your work experience and opinions" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}

function ReviewCard({ review, maxHeight = 320 }) {
  const [isExpanded, setIsExpanded] = useState(false); // 控制是否展開
  const [isOverflowing, setIsOverflowing] = useState(false); // 控制是否顯示「閱讀更多」
  const contentRef = useRef(null);

  useEffect(() => {
    // 檢查內容是否超過最大高度
    if (contentRef.current && contentRef.current.scrollHeight > maxHeight) {
      setIsOverflowing(true);
    }
  }, [review.comment, maxHeight]);

  return (
    <div
      ref={contentRef}
      className="relative overflow-hidden w-[320px] m-[5px_20px_15px_0] rounded-[10px] bg-[#171717]"
      style={{
        maxHeight: isExpanded ? 'none' : `${maxHeight}px`,
        minHeight: `${maxHeight}px`
      }}
    >
      <div className="p-[15px_20px_20px] overflow-hidden text-[#AAAAAA]">
        <div className="flex justify-between items-center border-b-[1.5px] border-[#1e1e1e] pb-3 mb-4">
          <div>{review.location}</div>
          <div
            className="text-black p-[1px_12px] rounded-[20px] text-[12px]"
            style={{
              background: stateColorList?.find(item => item.value === review.state)?.color || '#171717',
            }}
            >
            {review.state}
          </div>
        </div>

        <div className="text-[12px] mt-[5px] text-[#444444]">
          Last Year Worked: {' '}
          <span>{review.lastYearWorked}</span>
        </div>
        <div className="text-[25px] text-white">{review.workplaceName}</div>
        <div className="text-[#f4b510] font-semibold inline-block mt-[3px]">
          {review.jobTitle}
        </div>

        <div
          style={{
            whiteSpace: 'pre-wrap',
            padding: '10px 0 45px 0',
            fontSize: 14,
            letterSpacing: 1,
          }}
        >
          {review.comment}
        </div>
      </div>
      {/* 如果內容超過高度，顯示「閱讀更多」按鈕 */}
      {isOverflowing && (
        <button
          style={{
            position: 'absolute',
            bottom: 0,
            background: 'black',
            width: '100%',
            padding: '10px 0',
            display: 'flex',
            justifyContent: 'center',
            // borderTop: 'solid 0.5px #cccccc',
            boxShadow: isExpanded ? 'none' : '2px 2px 70px 60px rgba(0, 0, 0, 0.9)',
            fontSize: 14
          }}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded
            ? <>
              <ChevronUp style={{ marginRight: 6 }} color="#f4b510"/>
              Collapse
            </>
            : <>
              <ChevronDown style={{ marginRight: 6 }} color="#f4b510"/>
              Read More
            </>
          }
        </button>
      )}
    </div>
  );
}

function App() {

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
    <div
      style={{
        background:'#1e1e1e',
        color: 'white'
      }}
    >
      <div
        style={{
          fontFamily: 'Courgette, cursive',
          fontSize: 48,
          textAlign: 'center',
          padding: '35px 0 10px'
        }}
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
                <Button type="button" variant="outline" style={{ margin: '0 0 30px 0' }}>
                  Close
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div
        style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'start', paddingTop: 20 }}
        className="review-card-container"
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
  )
}

export default App
