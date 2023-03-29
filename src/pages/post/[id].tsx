import { type NextPage } from "next";
import Head from "next/head";

const SinglePostPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Post</title>
      </Head>
      <main className="flex h-screen justify-center bg-gradient-to-b from-[#091e20] to-[#051214]">
        <p className="text-xl font-bold text-white">Post Page</p>
      </main>
    </>
  );
};

export default SinglePostPage;
