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
import HomeDescription from "@/components/home-description";

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
                <HomeDescription
                  title="Meet Gib"
                  subtitle="Your friendly companion"
                  description="Master of the bow"
                />
              ),
              delay: 0.2,
              direction: 1
            },
            {
              src: "/images/goblin_basic_idle__0.png",
              alt: "Bob Character",
              content: (
                <HomeDescription
                  title="Bob the Brave"
                  subtitle="Brings fun to every challenge"
                  description="Ready for adventure"
                />
              ),
              delay: 0.4,
              direction: -1
            },
            {
              src: "/images/goblin_tank_idle__0.png",
              alt: "Rob Character",
              content: (
                <HomeDescription
                  title="Rob the Mighty"
                  subtitle="Always ready for action"
                  description="The mighty defender"
                />
              ),
              delay: 0.6,
              direction: 1
            },
            {
              src: "/images/goblin_healer_idle__0.png",
              alt: "Zob Character",
              content: (
                <HomeDescription
                  title="Zob the Wise"
                  subtitle="Adds mystery to the adventure"
                  description="Keeper of secrets"
                  code="pages/index.tsx"
                />
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
                  x: character.direction * (typeof window !== 'undefined' ? window.innerWidth * 0.47 : 600),
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
