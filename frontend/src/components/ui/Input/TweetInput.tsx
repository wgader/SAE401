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
            "w-full bg-transparent border-none text-[1.0625rem] sm:text-lg font-sf-pro text-text-primary placeholder:text-text-secondary focus:ring-0 focus:outline-none focus-visible:outline-none resize-none min-h-[120px] p-0 hide-scrollbar shadow-none",
            error && "text-red-500",
            className
          )}
          {...props}
        />
        {error && (
          <p role="alert" className="text-sm text-red-500 font-sf-pro mt-2">
            {error}
          </p>
        )}
      </section>
    );
  }
);

TweetInput.displayName = "TweetInput";
