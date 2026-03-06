import React from 'react';
import { Metadata } from "next";
import Hero from './components/home/hero';
import DiscoverProperties from './components/home/property-option';
export const metadata: Metadata = {
  title: "Property",
};

export default function Home() {
  return (
    <main>
      <Hero />
      <DiscoverProperties />
    </main>
  )
}
