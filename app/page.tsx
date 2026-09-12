import { PageNav, type PageRef } from "@/components/PageNav";
import { Closing } from "@/components/sections/Closing";
import { Details } from "@/components/sections/Details";
import { Gallery } from "@/components/sections/Gallery";
import { Gifts } from "@/components/sections/Gifts";
import { Hero } from "@/components/sections/Hero";
import { LocalRecs } from "@/components/sections/LocalRecs";
import { OurStory } from "@/components/sections/OurStory";
import { Rsvp } from "@/components/sections/Rsvp";
import { TheDay } from "@/components/sections/TheDay";
import { Venues } from "@/components/sections/Venues";

/** One entry per page in the comps; drives the floating dot navigator. */
const pages: PageRef[] = [
  { id: "welcome", label: "Welcome" },
  { id: "the-day", label: "The day" },
  { id: "rsvp", label: "RSVP" },
  { id: "around-town", label: "Around town" },
];

export default function Home() {
  return (
    <>
      <main>
        <div id="welcome">
          <Hero />
          <OurStory />
          <Venues />
        </div>

        <div id="the-day">
          <TheDay />
          <Gallery />
        </div>

        <div id="rsvp">
          <Rsvp />
          <Details />
          <Gifts />
        </div>

        <div id="around-town">
          <LocalRecs />
          <Closing />
        </div>
      </main>

      <PageNav pages={pages} />
    </>
  );
}
