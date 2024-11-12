import { useState, useEffect, useRef } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { stateColorList } from "@/pages/Home/containers/constants"
import { Review } from "@/lib/types"

interface ReviewCardProps {
  review: Review;
  maxHeight?: number;
}

export default function ReviewCard({ review, maxHeight = 320 }: ReviewCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      setIsOverflowing(contentRef.current.scrollHeight > maxHeight);
    }
  }, [maxHeight]);

  const stateColor = stateColorList.find(s => s.value === review.state)?.color || '#ffffff';

  return (
    <div className="relative w-[320px] m-[20px] rounded-[10px] overflow-hidden">
      <div
        ref={contentRef}
        className="bg-black p-[20px] text-white"
        style={{
          maxHeight: isExpanded ? 'none' : maxHeight,
          overflow: isExpanded ? 'visible' : 'hidden'
        }}
      >
        <div className="flex items-center">
          <div
            className="text-[14px] px-[10px] py-[3px] rounded-[5px] mr-[10px]"
            style={{ backgroundColor: stateColor }}
          >
            {review.state}
          </div>
          <div className="text-[12px] text-[#444444]">
            {review.location}
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

        <div className="text-[14px] tracking-[1px] whitespace-pre-wrap py-2.5 pb-[45px]">
          {review.comment}
        </div>
      </div>

      {isOverflowing && (
        <button
          className="absolute bottom-0 w-full p-[10px_0] flex justify-center text-[14px] bg-black"
          style={{
            boxShadow: isExpanded ? 'none' : '2px 2px 70px 60px rgba(0, 0, 0, 0.9)'
          }}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <>
              <ChevronUp className="mr-2" color="#f4b510"/>
              Collapse
            </>
          ) : (
            <>
              <ChevronDown className="mr-2" color="#f4b510"/>
              Read More
            </>
          )}
        </button>
      )}
    </div>
  );
} 