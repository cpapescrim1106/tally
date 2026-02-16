import React from "react";
import { useSession, getSession, signIn } from "next-auth/react";
import { useRouter } from "next/router";
import type { NextPage, GetServerSideProps } from "next";
import { FaChartLine, FaRegClock, FaProjectDiagram, FaCheckCircle } from "react-icons/fa";
import { BiTrendingUp } from "react-icons/bi";
import Layout from "@/components/layout/Layout";

export const metadata = {
  title: "Sign In | Tally",
  description: "Sign in to Tally with your Todoist account",
};

const FeatureCard = ({ icon: Icon, title, description }: { icon: any; title: string; description: string }) => (
  <div className="flex items-start space-x-3 p-3">
    <div className="flex-shrink-0">
      <Icon className="h-5 w-5 text-warm-peach mt-1" />
    </div>
    <div>
      <h3 className="font-medium text-white my-0">{title}</h3>
      <p className="text-warm-gray">{description}</p>
    </div>
  </div>
);

export const getServerSideProps: GetServerSideProps = async (context: any) => {
  const session = await getSession(context);

  if (session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return { props: {} };
};

const SignIn: NextPage = () => {
  const router = useRouter();
  const { data: session } = useSession();

  React.useEffect(() => {
    if (session) router.replace("/");
  }, [router, session]);

  const authError = typeof router.query.error === "string" ? router.query.error : null;

  return (
    <Layout title={metadata.title} description={metadata.description}>
      <div className="container mx-auto max-h-fit flex flex-col md:flex-row mt-6 mb-12">
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-12 bg-warm-card my-6 sm:my-0 sm:order-2 rounded-e-xl sm:border-s border-warm-border">
          <div className="w-full max-w-sm space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
              <p className="mt-2 text-sm text-warm-gray">Sign in to Tally with your Todoist account to continue</p>
            </div>

            {authError && (
              <p className="text-sm text-red-300 text-center">Sign-in failed ({authError}). Please try again.</p>
            )}

            <button
              type="button"
              onClick={() => {
                void signIn("todoist", { callbackUrl: "/" });
              }}
              className="w-full flex justify-center items-center px-4 py-3 rounded-lg bg-[#e44332] text-sm font-medium text-white hover:bg-[#d13b2b] focus:outline-none focus:ring-2 focus:ring-[#e44332] focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-200"
            >
              Continue with Todoist
            </button>

            <p className="text-xs text-warm-gray text-center">
              After the first approval, you should stay signed in on this device.
            </p>
          </div>
        </div>

        <div className="w-full md:w-1/2 bg-warm-card p-12 flex-col justify-between">
          <div>
            <div className="mb-12">
              <h1 className="text-2xl font-bold text-white mb-3">Tally</h1>
              <p className="text-warm-gray leading-relaxed">
                Tally is your Todoist command center with analytics, mission control views, and productivity insights built to keep you focused.
              </p>
            </div>

            <div className="space-y-3">
              <FeatureCard icon={FaChartLine} title="Task Analytics" description="Visualize completion patterns and track your progress over time with beautiful, interactive charts" />
              <FeatureCard icon={BiTrendingUp} title="Productivity Scoring" description="Get personalized daily scores based on your task completion and work habits" />
              <FeatureCard icon={FaRegClock} title="Time Insights" description="Discover your peak productivity hours and optimize your daily schedule for maximum efficiency" />
              <FeatureCard icon={FaProjectDiagram} title="Project Distribution" description="Understand how your time and effort are distributed across different projects and areas" />
              <FeatureCard icon={FaCheckCircle} title="Recurring Tasks" description="Track completion rates, trends, and streaks of your recurring tasks and habits" />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SignIn;
