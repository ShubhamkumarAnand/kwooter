import { type GetStaticProps, type NextPage } from "next";
import Head from "next/head";
import { appRouter } from "~/server/api/root";
import { api } from "~/utils/api";
import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { prisma } from "~/server/db";
import superjson from "superjson";
import { PageLayout } from "~/components/PageLayout";
import Image from "next/image";
import { LoadingPage } from "~/components/Loading";
import { PostView } from "~/components/PostView";

const ProfileFeed = (props: { userId: string }) => {
  const { data, isLoading } = api.posts.getPostbyUserId.useQuery({
    userId: props.userId,
  });
  if (isLoading) return <div className="flex justify-center mt-20"><LoadingPage /></div>;
  if (!data || data.length === 0) return <div>User Has no Post</div>;
  return (
    <div className="flex flex-col align-middle">
      {data.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};

const ProfilePage: NextPage<{ username: string }> = ({ username }) => {
  const { data } = api.profile.getUserByUsername.useQuery({
    username,
  });
  if (!data) return <div>404</div>;
  return (
    <>
      <Head>
        <title>{data.username}</title>
      </Head>
      <PageLayout>
        <div className="relative h-36 bg-slate-600">
          <Image
            src={data.profileImageUrl}
            alt={`${data.username ?? ""}'s profile Image`}
            width={128}
            height={128}
            className="absolute left-0 bottom-0 -mb-16 ml-4 rounded-full border-4 border-black bg-white"
          />
        </div>
        <div className="h-16"></div>
        <div className="p-4 text-2xl font-bold text-white">{`@${
          data.username ?? ""
        }`}</div>
        <div className="border-b border-slate-400"></div>
        <ProfileFeed userId={data.id} />
      </PageLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: { prisma, userId: null },
    transformer: superjson,
  });

  const slug = context.params?.slug;
  if (typeof slug !== "string") throw new Error("no Slug");
  const username = slug.replace("@", "");
  await ssg.profile.getUserByUsername.prefetch({ username });
  return {
    props: {
      trpcState: ssg.dehydrate(),
      username,
    },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default ProfilePage;
