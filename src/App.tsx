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
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const formSchema = z.object({
  text: z.string().min(2).max(50),
})

function AddReviewForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: "",
    },
  })
 
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const docRef = await addDoc(collection(db, 'reviews'),
        values,
      );
      console.log('Document written with ID: ', docRef.id);
    } catch (error) {
      console.error('Error adding document: ', error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="text"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Review</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
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
            {review.text}
          </div>
        ))
      }
    </>
  )
}

export default App
