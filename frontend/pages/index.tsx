import { motion } from "framer-motion";
import Image from "next/image";
import { Link } from "@heroui/link";
import { Snippet } from "@heroui/snippet";
import { Code } from "@heroui/code";
import { button as buttonStyles } from "@heroui/theme";

import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
import { GithubIcon } from "@/components/icons";
import DefaultLayout from "@/layouts/default";
import { CoreLogoWhite } from "./social";

export default function IndexPage() {
  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="inline-block text-center justify-center w-full">
          <CoreLogoWhite className="mx-auto w-[30%] h-auto" />
          <span className="text-2xl font-bold">
            Imagine a game contest that brings people
            <br />
            from around the world together for fun and learning.
          </span>
        </div>

        <div className="flex gap-3">
          <Link
            isExternal
            className={buttonStyles({
              color: "primary",
              radius: "full",
              variant: "shadow",
            })}
            href={siteConfig.links.docs}
          >
            Documentation
          </Link>
          <Link
            isExternal
            className={buttonStyles({ variant: "bordered", radius: "full" })}
            href={siteConfig.links.github}
          >
            <GithubIcon size={20} />
            GitHub
          </Link>
        </div>

        <div className="mt-8">
          <Snippet hideCopyButton hideSymbol variant="bordered">
            <span>
              Get started by editing{" "}
              <Code color="primary">pages/index.tsx</Code>
            </span>
          </Snippet>
        </div>
      </section>
      <section className="flex flex-col items-center justify-center gap-32 py-12 min-h-screen">
        <motion.div 
          className="flex flex-col gap-32"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {[
            {
              src: "/images/goblin_archer_idle__0.png",
              alt: "Gib Character",
              content: (
                <div className="flex flex-col items-center gap-4">
                  <h1 className="text-4xl font-bold">Meet Gib</h1>
                  <p className="text-2xl">Your friendly companion</p>
                  <p className="text-xl text-gray-400">Master of the bow</p>
                </div>
              ),
              delay: 0.2,
              direction: 1
            },
            {
              src: "/images/goblin_basic_idle__0.png",
              alt: "Bob Character",
              content: (
                <div className="flex flex-col items-center gap-4">
                  <h1 className="text-4xl font-bold">Bob the Brave</h1>
                  <p className="text-2xl">Brings fun to every challenge</p>
                  <p className="text-xl text-gray-400">Ready for adventure</p>
                </div>
              ),
              delay: 0.4,
              direction: -1
            },
            {
              src: "/images/goblin_tank_idle__0.png",
              alt: "Rob Character",
              content: (
                <div className="flex flex-col items-center gap-4">
                  <h1 className="text-4xl font-bold">Robust Rob</h1>
                  <p className="text-2xl">Always ready for action</p>
                  <p className="text-xl text-gray-400">The mighty defender</p>
                </div>
              ),
              delay: 0.6,
              direction: 1
            },
            {
              src: "/images/goblin_healer_idle__0.png",
              alt: "Zob Character",
              content: (
                <div className="flex flex-col items-center gap-4">
                  <h1 className="text-4xl font-bold">Zob the Wise</h1>
                  <p className="text-2xl">Adds mystery to the adventure</p>
                  <p className="text-xl text-gray-400">Keeper of secrets</p>
                </div>
              ),
              delay: 0.8,
              direction: -1
            }
          ].map((character, index) => (
            <motion.div
              key={character.alt}
              className="flex flex-col items-center min-h-screen justify-center relative"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: false, margin: "-100px" }}
              transition={{ duration: 1.2 }}
            >
              <div className="absolute z-10 left-1/2 -translate-x-1/2">
                {character.content}
              </div>
              <motion.div
                initial={{ opacity: 0, x: 0 }}
                whileInView={{ 
                  opacity: 1,
                  x: character.direction * 600,
                  rotate: character.direction * 15
                }}
                viewport={{ once: false, margin: "-100px" }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              >
                <Image 
                  src={character.src}
                  alt={character.alt}
                  width={800}
                  height={800}
                  className="image-rendering-pixel"
                  style={{ 
                    imageRendering: 'pixelated',
                    transform: character.direction === 1 ? 'scaleX(-1)' : 'none'
                  }}
                />
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </DefaultLayout>
  );
}
