import TweetCard from "../ui/TweetCard";
import { TWEETS } from "../../data/tweet";

export default function Home() {
  return (
    <ul className="w-full max-w-2xl p-4">
      {TWEETS.map((t) => (
        <TweetCard
          key={`${t.username}-${t.timeAgo}`}
          authorName={t.authorName}
          username={t.username}
          timeAgo={t.timeAgo}
          content={t.content}
          avatarUrl={t.avatarUrl}
        />
      ))}
    </ul>
  );
}
