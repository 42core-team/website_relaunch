import Image from "next/image";
import { motion } from "framer-motion";
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
                  <h1 className="text-4xl font-bold">🚀 Unlock Your Coding Potential</h1>
                  <p className="text-2xl"></p>
                  <p className="text-xl text-gray-400">Experience the thrill of coding like never before! Our international bot game coding contest is designed to challenge and inspire coders of all skill levels. Whether you're a seasoned programmer or just starting your coding journey, this contest is your opportunity to push your limits, solve exciting challenges, and connect with like-minded individuals from around the globe. Join the coding revolution and let your creativity soar. Compete in a friendly environment that fosters collaboration, learning, and fun. Unleash your coding prowess and see where your skills take you.</p>
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
                  <h1 className="text-4xl font-bold">🌐 Connect with Global Gamers</h1>
                  <p className="text-2xl"></p>
                  <p className="text-xl text-gray-400">In the spirit of adventure, our coding contest serves as a gateway to the vast expanse of programming. It's designed to be approachable for beginners, yet complex enough to challenge even the most seasoned veterans. Picture a contest that feels like a captivating journey - a quest where you're armed with curiosity and an eagerness to unravel the intricacies of the coding cosmos.</p>
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
                  <h1 className="text-4xl font-bold">🌌 Fun Learning with Real-world Challenges</h1>
                  <p className="text-2xl"></p>
                  <p className="text-xl text-gray-400">Step into a nostalgic realm reminiscent of the good old days of LAN parties, where camaraderie and coding brilliance intersect. Our event captures the essence of those memorable gatherings, blending the spirit with the excitement of coding challenges. It's more than a contest, it's a gathering of minds and code.</p>
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
                  <h1 className="text-4xl font-bold">🚀 Unlock Your Coding Potential</h1>
                  <p className="text-2xl"></p>
                  <p className="text-xl text-gray-400">Experience the thrill of coding like never before! Our international bot game coding contest is designed to challenge and inspire coders of all skill levels. Whether you're a seasoned programmer or just starting your coding journey, this contest is your opportunity to push your limits, solve exciting challenges, and connect with like-minded individuals from around the globe. Join the coding revolution and let your creativity soar. Compete in a friendly environment that fosters collaboration, learning, and fun. Unleash your coding prowess and see where your skills take you.</p>
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
              <div className="absolute z-10 left-1/2 -translate-x-1/2 w-[50vw]">
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
