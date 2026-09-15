import { Reveal } from "@/components/ui/Reveal";
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

/*
  The floating dot navigator is gone. It sat fixed across the bottom centre of
  the screen, and the RSVP options are full-width bars — so an option scrolled
  under the pill swallowed the tap and the guest could not choose accept or
  decline at all. The section ids stay as anchor targets.
*/
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

      <Reveal />
    </>
  );
}
