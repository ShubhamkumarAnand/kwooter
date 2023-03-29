import type { RouterOutputs } from "~/utils/api";
import Image from "next/image";
import Link from "next/link";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

type PostWithUser = RouterOutputs["posts"]["getAll"][number];

export const PostView = (props: PostWithUser) => {
  const { post, author } = props;
  return (
    <div className="flex gap-3 border-b border-white p-3" key={post.id}>
      <Image
        src={author.profileImageUrl}
        alt="profile Image"
        className="scale-90 rounded-full"
        width={56}
        height={48}
      />
      <div className="flex flex-col">
        <div className="font-semibold text-slate-300">
          <Link href={`/${author.username}`}>
            <span>{`@${author.username}`} </span>
          </Link>
          <Link href={`/post/${post.id}`}>
            <span className="font-light ">{` . ${dayjs(
              post.createdAt
            ).fromNow()}`}</span>
          </Link>
        </div>
        <span className="text-2xl">{post.content}</span>
      </div>
    </div>
  );
};
