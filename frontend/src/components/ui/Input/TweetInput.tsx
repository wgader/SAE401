import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "../../../lib/utils";

export interface TweetInputProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const TweetInput = forwardRef<HTMLTextAreaElement, TweetInputProps>(
  ({ className, error, id, onChange, ...props }, ref) => {
    const textareaId = id || "tweet-input";

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const target = e.target;
      target.style.height = "auto";
      target.style.height = `${target.scrollHeight}px`;
      if (onChange) onChange(e);
    };

    return (
      <section className="flex flex-col w-full">
        <label htmlFor={textareaId} className="sr-only">
          Contenu du tweet
        </label>
        <textarea
          id={textareaId}
          ref={ref}
          onChange={handleInput}
          className={cn(
            "w-full bg-transparent border-none text-[0.9375rem] font-sf-pro text-text-primary placeholder:text-text-secondary focus:ring-0 focus:outline-none focus-visible:outline-none resize-none min-h-[7.5rem] p-0 hide-scrollbar shadow-none",
            error && "text-red-500",
            className
          )}
          {...props}
        />
        {error && (
          <p role="alert" className="text-[0.875rem] text-red-500 font-sf-pro mt-[0.5rem]">
            {error}
          </p>
        )}
      </section>
    );
  }
);

TweetInput.displayName = "TweetInput";
