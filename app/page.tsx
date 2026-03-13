"use client";

import dynamic from 'next/dynamic';

// This dynamically imports your content and tells Next.js 
// to skip pre-rendering it on the server.
const RoastPage = dynamic(() => import('../components/RoastPage'), {
  ssr: false,
});

export default function Page() {
  return <RoastPage />;
}