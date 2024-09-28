import { useState, useEffect } from "react";
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { addDoc, collection, query, onSnapshot } from 'firebase/firestore';
import { db } from "@/firebase"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
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

function AddReviewForm() {
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
      console.log(values)
      console.log('Document written with ID: ', docRef.id);
      reset()
    } catch (error) {
      console.error('Error adding document: ', error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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

function App() {

  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const reviews = query(collection(db, "reviews"));
    onSnapshot(reviews, (querySnapshot) => {
      const updatedReviews = querySnapshot.docs.map(x => x.data())
      setReviews(updatedReviews)
    });
  }, []);

  return (
    <>
      <div
        style={{ width: 400, padding: 20, margin: '30px auto', border: '1px solid #ccc', borderRadius: 10 }}
      >
        <AddReviewForm />
      </div>
      {
        reviews?.map((review, index) => (
          <div
            key={index}
            style={{ width: 400, padding: 20, margin: '10px auto', border: '1px solid #ccc', borderRadius: 10 }}
          >
            <div>{review.state}</div>
            <div>{review.location}</div>
            <br />
            <div>{review.lastYearWorked}</div>
            <div>{review.workplaceName}</div>
            <div>{review.jobTitle}</div>
            <div style={{ whiteSpace: 'pre-wrap' }}>{review.comment}</div>
          </div>
        ))
      }
    </>
  )
}

export default App
