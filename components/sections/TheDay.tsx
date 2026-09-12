import { icons, type IconName } from "@/components/Icons";
import { schedule } from "@/data/wedding";

export function TheDay() {
  return (
    <section className="bg-olive px-5 py-20 sm:py-28" aria-labelledby="the-day-heading">
      <h2
        id="the-day-heading"
        className="text-center font-display text-3xl font-semibold tracking-[0.12em] text-cream-light sm:text-4xl"
      >
        THE DAY
      </h2>

      <ol className="mx-auto mt-14 max-w-2xl text-cream-light">
        {schedule.map((item, index) => {
          const Icon = icons[item.icon as IconName];
          const onLeft = index % 2 === 1;

          return (
            <li
              key={`${item.time}-${item.label}`}
              className="grid grid-cols-[1.5rem_1fr] gap-x-5 sm:grid-cols-[1fr_1.5rem_1fr] sm:gap-x-8"
            >
              {/* The spine, with a node per moment. */}
              <div
                className="col-start-1 row-start-1 flex flex-col items-center sm:col-start-2"
                aria-hidden="true"
              >
                <span
                  className={`w-px flex-1 bg-cream-light/45 ${
                    index === 0 ? "opacity-0" : ""
                  }`}
                />
                <span className="my-1 h-2.5 w-2.5 shrink-0 rounded-full bg-cream-light" />
                <span
                  className={`w-px flex-1 bg-cream-light/45 ${
                    index === schedule.length - 1 ? "opacity-0" : ""
                  }`}
                />
              </div>

              {/* Entries alternate sides from sm up; on mobile they all sit
                  to the right of the spine. */}
              <div
                className={`col-start-2 row-start-1 flex flex-col py-6 ${
                  onLeft
                    ? "sm:col-start-1 sm:items-end sm:text-right"
                    : "sm:col-start-3"
                }`}
              >
                <Icon className="h-16 w-16 text-cream-light/85 sm:h-20 sm:w-20" />
                <p className="tracking-label mt-3 text-[0.6rem]">{item.time}</p>
                <p className="font-script text-2xl leading-tight sm:text-[1.75rem]">
                  {item.label}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
