import React from 'react';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title = "Tally",
  description = "Tally - Your Todoist Command Center"
}) => {
  const { data: session } = useSession();

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta
          name="description"
          content={description}
        />
        <meta name="application-name" content="Tally" />
        <meta property="og:site_name" content="Tally" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/og-image.svg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content="/og-image.svg" />
        {/* Favicons */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />

        {/* Theme colors */}
        <meta name="theme-color" content="#FF9B71" />
        <meta name="msapplication-TileColor" content="#0D0D0D" />
      </Head>

      <div className="min-h-screen flex flex-col text-white">
        <Header user={session?.user || null} />
        <main className="flex-1 container mx-auto px-4 pb-8">
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Layout;
