import Image from "next/image";
import { motion } from "framer-motion";
import DefaultLayout from "@/layouts/default";
import { title } from "@/components/primitives";
import { CoreLogoWhite } from "../social";

export default function AboutPage() {
  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-8 py-8 md:py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="flex flex-row items-center justify-center gap-4">
            <h1 className={title()}>About</h1>
            <CoreLogoWhite className="w-20 h-auto" />
          </div>
          <p className="mt-4 text-lg text-default-600">
            Bringing the world together through code and creativity
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto px-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">The Minds Behind CORE Game</h2>
            <p className="text-default-600">
              At CORE Game, we&rsquo;re more than just coders&mdash;we&rsquo;re
              innovators, challengers, and problem-solvers. What started as a
              passion project among students at 42 Heilbronn has evolved into a
              global coding competition that pushes the limits of strategy, AI,
              and game development.
            </p>
            <p className="text-default-600">
              Our mission? To create an environment where learning meets
              competition, and where every line of code tells a story. Whether
              you&rsquo;re here to sharpen your programming skills, engage in
              high-level AI battles, or just have fun, CORE Game is the ultimate
              playground for creative minds.
            </p>
            <p className="text-default-600">
              But CORE Game is more than just a game&mdash;it&rsquo;s a
              community. A place where developers from all backgrounds come
              together to compete, collaborate, and grow. From intense coding
              duels to deep strategic planning, every match is an opportunity to
              learn, adapt, and become a better programmer.
            </p>
            <p className="text-default-600">
              So, whether you&rsquo;re here to dominate the leaderboard or just
              see what&rsquo;s possible, welcome to CORE Game. Let&rsquo;s
              build, battle, and break boundaries&mdash;together.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Our Vision</h2>
            <p className="text-default-600">
              We envision a world where coding is accessible, engaging, and fun
              for everyone. By combining gaming elements with programming
              challenges, we&rsquo;re building bridges between entertainment and
              education, creating unique opportunities for learning and
              collaboration.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">What We Do</h2>
            <p className="text-default-600">
              We organize international coding competitions that feel like
              gaming tournaments. Our platform provides real-time feedback,
              interactive challenges, and a supportive community where
              participants can showcase their skills, learn from others, and
              push their boundaries.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Join Our Community</h2>
            <p className="text-default-600">
              Whether you&rsquo;re a beginner taking your first steps in coding
              or an experienced developer looking for new challenges, CORE
              welcomes you. Join our growing community and be part of the next
              generation of programming excellence.
            </p>
          </div>
        </motion.div>

        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <p className="text-xl text-default-600">
            Ready to start your journey with CORE?
          </p>
          <div className="mt-4">
            <a
              href="/signup"
              className="inline-block px-6 py-3 rounded-full bg-primary text-background font-medium hover:bg-primary-500 transition-colors"
            >
              Get Started Today
            </a>
          </div>
        </motion.div>
      </section>

      <section className="py-16">
        <motion.div
          className="container mx-auto px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-center mb-12">Meet Our Team</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 place-items-center">
            <motion.div
              className="flex flex-col items-center p-6 rounded-lg border border-default-200 shadow-sm w-full max-w-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Image
                src="https://picsum.photos/200/200?random=1"
                alt="Team member"
                width={200}
                height={200}
                className="w-40 h-40 rounded-full object-cover mb-4"
              />
              <h3 className="text-xl font-semibold">Sarah Johnson</h3>
              <p className="text-default-600">Founder & CEO</p>
            </motion.div>

            <motion.div
              className="flex flex-col items-center p-6 rounded-lg border border-default-200 shadow-sm w-full max-w-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Image
                src="https://picsum.photos/200/200?random=2"
                alt="Team member"
                width={200}
                height={200}
                className="w-40 h-40 rounded-full object-cover mb-4"
              />
              <h3 className="text-xl font-semibold">Michael Chen</h3>
              <p className="text-default-600">CTO</p>
            </motion.div>

            <motion.div
              className="flex flex-col items-center p-6 rounded-lg border border-default-200 shadow-sm w-full max-w-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Image
                src="https://picsum.photos/200/200?random=3"
                alt="Team member"
                width={200}
                height={200}
                className="w-40 h-40 rounded-full object-cover mb-4"
              />
              <h3 className="text-xl font-semibold">Emily Rodriguez</h3>
              <p className="text-default-600">Lead Developer</p>
            </motion.div>

            <motion.div
              className="flex flex-col items-center p-6 rounded-lg border border-default-200 shadow-sm w-full max-w-sm lg:col-start-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Image
                src="https://picsum.photos/200/200?random=4"
                alt="Team member"
                width={200}
                height={200}
                className="w-40 h-40 rounded-full object-cover mb-4"
              />
              <h3 className="text-xl font-semibold">David Kim</h3>
              <p className="text-default-600">Community Manager</p>
            </motion.div>
          </div>
        </motion.div>
      </section>
    </DefaultLayout>
  );
}