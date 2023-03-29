import { SignInButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import Head from "next/head";
import Image from "next/image";

import { api } from "~/utils/api";
import type { RouterOutputs } from "~/utils/api";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { LoadingPage, LoadingSpinner } from "~/components/Loading";
import { useState } from "react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { PageLayout } from "~/components/PageLayout";
dayjs.extend(relativeTime);

const CreateWizard = () => {
  const [input, setInput] = useState("");
  const { user } = useUser();
  if (!user) return null;

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.posts.invalidate();
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to Post. Please try Again Later");
      }
    },
  });
  return (
    <div className="flex w-full gap-3">
      <Image
        src={user.profileImageUrl}
        alt="profile image"
        className="rounded-full"
        width={56}
        height={56}
      />
      <input
        type="text"
        placeholder="Type some Emojis!"
        className="grow bg-transparent text-white outline-none"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (input !== "") {
              mutate({ content: input });
            }
          }
        }}
        disabled={isPosting}
      />
      {input !== "" && !isPosting && (
        <button
          onClick={() => mutate({ content: input })}
          className="rounded border border-slate-50 px-3 text-white"
          disabled={isPosting}
        >
          Post
        </button>
      )}
      {isPosting && (
        <div className="flex items-center justify-center">
          <LoadingSpinner size={20} />
        </div>
      )}
    </div>
  );
};

type PostWithUser = RouterOutputs["posts"]["getAll"][number];

const PostView = (props: PostWithUser) => {
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

const Feed = () => {
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();

  if (postsLoading)
    return (
      <div className="mt-32 flex justify-center">
        <LoadingPage />
      </div>
    );
  if (!data) return <div>Something went Wrong</div>;

  return (
    <div className="flex flex-col align-middle">
      {data.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};

const Home: NextPage = () => {
  const { isLoaded: userLoaded, isSignedIn } = useUser();

  // Start Fetching Early
  api.posts.getAll.useQuery();

  if (!userLoaded) return <div />;

  return (
    <>
      <PageLayout>
        <div className="border-b border-slate-400 p-4">
          {!isSignedIn && (
            <div className="flex justify-center overflow-y-scroll rounded border border-white p-2 text-white">
              <SignInButton />
            </div>
          )}
          {isSignedIn && <CreateWizard />}
        </div>
        <Feed />
      </PageLayout>
    </>
  );
};

export default Home;
