"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Steam from "@/components/ui/Steam";
import { storyScenes } from "@/data/story";
import { gsap, useGSAP, motionQueries, queueRefresh } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/**
 * "The making of" — five cinematic scenes driven by scroll.
 *
 * With motion allowed, a sticky full-screen stage plays the scenes in sequence:
 * each new image opens through a warm, oven-glow circular mask while the previous
 * one pushes in. With reduced motion (or before JS), the same content renders as
 * a calm, stacked editorial sequence — nothing is hidden.
 */
export default function Story() {
  const root = useRef<HTMLElement>(null);
  const [cinematic, setCinematic] = useState(false);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia(motionQueries.motion);
    const update = () => setCinematic(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useGSAP(
    () => {
      queueRefresh();
      if (!cinematic || !root.current) return;
      const q = gsap.utils.selector(root);
      const media = q("[data-scene-media]");
      const texts = q("[data-scene-text]");
      const glows = q("[data-scene-glow]");
      const count = storyScenes.length;

      // The mask circle and its glowing rim share one radius, so the light always
      // sits exactly on the edge of the opening scene.
      const reveal = (i: number, p: number) => {
        const stage = media[i].parentElement!;
        const max = Math.hypot(stage.clientWidth, stage.clientHeight) * 0.62;
        const r = p * max;
        (media[i] as HTMLElement).style.clipPath = p >= 1 ? "none" : `circle(${r}px at 50% 55%)`;
        const g = glows[i] as HTMLElement;
        g.style.width = g.style.height = `${r * 2 + 80}px`;
        g.style.opacity = String(Math.sin(Math.min(1, p * 1.15) * Math.PI) * 0.95);
      };
      for (let i = 1; i < count; i++) reveal(i, 0);
      gsap.set(texts.slice(1), { autoAlpha: 0, y: 50 });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
          onUpdate: (self) => setActive(Math.min(count - 1, Math.round(self.progress * (count - 1)))),
        },
      });

      // Slow push-in on every image across its own lifetime.
      media.forEach((m, i) => {
        const img = m.querySelector("img");
        tl.fromTo(img, { scale: 1.18 }, { scale: 1.02, duration: 2.2 }, Math.max(0, i * 2 - 1));
      });

      for (let i = 1; i < count; i++) {
        const at = i * 2 - 1;
        const state = { p: 0 };
        tl.to(state, { p: 1, duration: 1, ease: "power2.inOut", onUpdate: () => reveal(i, state.p) }, at)
          .to(texts[i - 1], { autoAlpha: 0, y: -50, duration: 0.45, ease: "power2.in" }, at)
          .to(texts[i], { autoAlpha: 1, y: 0, duration: 0.55, ease: "power2.out" }, at + 0.45);
      }
      tl.to({}, { duration: 1 }); // hold on the final scene

      // Progress rail
      tl.fromTo(q("[data-story-progress]"), { scaleY: 0 }, { scaleY: 1, duration: tl.duration(), ease: "none" }, 0);
    },
    { scope: root, dependencies: [cinematic], revertOnUpdate: true }
  );

  return (
    <section
      ref={root}
      id="story"
      aria-labelledby="story-title"
      className="on-dark relative bg-midnight text-cream"
      style={cinematic ? { height: `${storyScenes.length * 110}vh` } : undefined}
    >
      <h2 id="story-title" className="sr-only">
        The making of Hyderabadi dum biryani
      </h2>

      {cinematic && (
        // Screen readers get the whole sequence at once; the animated stage is visual only.
        <ol className="sr-only">
          {storyScenes.map((s) => (
            <li key={s.id}>
              <h3>
                {s.index}. {s.label}: {s.title}
              </h3>
              <p>{s.body}</p>
            </li>
          ))}
        </ol>
      )}

      {cinematic ? (
        <div aria-hidden="true" className="sticky top-0 h-[100svh] overflow-hidden">
          {storyScenes.map((scene, i) => (
            <div key={scene.id} data-scene-media className="absolute inset-0" style={{ zIndex: i + 1 }}>
              <Image
                src={scene.image}
                alt={scene.alt}
                fill
                sizes="100vw"
                quality={75}
                className="object-cover will-change-transform"
                style={{ objectPosition: scene.focus }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-midnight/90 via-midnight/45 to-midnight/70" />
              <div className="absolute inset-0 bg-gradient-to-t from-midnight/85 via-transparent to-midnight/40" />
              {scene.steam && <Steam intensity="rich" className="bottom-[40%] left-[45%] h-[45%] w-[40%]" />}
            </div>
          ))}
          {/* Oven-glow ring that blooms as each scene opens */}
          {storyScenes.map((scene, i) => (
            <div
              key={`glow-${scene.id}`}
              data-scene-glow
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-[55%] h-0 w-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,transparent_calc(100%_-_70px),rgb(255_214_140/0.9)_calc(100%_-_40px),rgb(214_166_79/0.5)_calc(100%_-_25px),transparent)] opacity-0 mix-blend-screen blur-[6px]"
              style={{ zIndex: i + 1 }}
            />
          ))}

          <div className="relative z-20 mx-auto flex h-full max-w-[90rem] items-end px-5 pb-16 md:px-10 md:pb-24">
            {/* Progress rail */}
            <div className="absolute right-5 top-1/2 hidden -translate-y-1/2 items-center gap-5 md:right-10 md:flex">
              <ol className="flex flex-col gap-4 text-right">
                {storyScenes.map((s, i) => (
                  <li
                    key={s.id}
                    className={cn(
                      "text-[0.65rem] uppercase tracking-[0.28em] transition-colors duration-500",
                      i === active ? "text-saffron" : "text-cream/40"
                    )}
                    aria-current={i === active ? "step" : undefined}
                  >
                    {s.label}
                  </li>
                ))}
              </ol>
              <span className="relative h-40 w-px bg-cream/20">
                <span data-story-progress className="absolute inset-0 origin-top bg-saffron" />
              </span>
            </div>

            <div className="relative w-full max-w-2xl">
              {storyScenes.map((scene, i) => (
                <article
                  key={scene.id}
                  data-scene-text
                  className={cn("w-full", i === 0 ? "relative" : "absolute bottom-0 left-0")}
                >
                  <SceneText scene={scene} />
                </article>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="mx-auto flex max-w-[90rem] flex-col gap-24 px-5 py-28 md:px-10">
          {storyScenes.map((scene, i) => (
            <article
              key={scene.id}
              className={cn("grid items-center gap-10 lg:grid-cols-2", i % 2 === 1 && "lg:[&>*:first-child]:order-2")}
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] lg:aspect-[5/6]">
                <Image
                  src={scene.image}
                  alt={scene.alt}
                  fill
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  className="object-cover"
                  style={{ objectPosition: scene.focus }}
                />
              </div>
              <SceneText scene={scene} />
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function SceneText({ scene }: { scene: (typeof storyScenes)[number] }) {
  return (
    <div>
      <p className="eyebrow flex items-center gap-4 text-saffron">
        <span className="font-serif text-2xl font-light tracking-normal">{scene.index}</span>
        <span className="h-px w-10 bg-saffron/50" aria-hidden="true" />
        {scene.label}
      </p>
      <h3 className="mt-5 font-serif text-headline font-light">{scene.title}</h3>
      <p className="mt-5 max-w-lg text-base leading-relaxed text-cream/75 md:text-lg">{scene.body}</p>
      {scene.tags && (
        <ul className="mt-6 flex flex-wrap gap-2" aria-label="Key ingredients">
          {scene.tags.map((t) => (
            <li key={t} className="rounded-full border border-cream/20 px-3.5 py-1.5 text-xs tracking-[0.12em] text-cream/80">
              {t}
            </li>
          ))}
        </ul>
      )}
      {scene.insets && (
        <div className="mt-8 hidden gap-4 sm:flex">
          {scene.insets.map((inset) => (
            <div key={inset.image} className="arch-mask relative h-36 w-28 overflow-hidden border border-saffron/30">
              <Image src={inset.image} alt={inset.alt} fill sizes="112px" className="object-cover" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
