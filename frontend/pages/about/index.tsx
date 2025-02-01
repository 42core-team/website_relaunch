import { motion } from "framer-motion";
import DefaultLayout from "@/layouts/default";
import { title } from "@/components/primitives";

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
          <h1 className={title()}>About CORE</h1>
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
            <h2 className="text-2xl font-bold">Our Mission</h2>
            <p className="text-default-600">
              CORE aims to create an inclusive, global community where programmers of all skill levels can learn, compete, and grow together. Through our innovative bot game coding contests, we're revolutionizing how people experience programming education and competition.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Our Vision</h2>
            <p className="text-default-600">
              We envision a world where coding is accessible, engaging, and fun for everyone. By combining gaming elements with programming challenges, we're building bridges between entertainment and education, creating unique opportunities for learning and collaboration.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">What We Do</h2>
            <p className="text-default-600">
              We organize international coding competitions that feel like gaming tournaments. Our platform provides real-time feedback, interactive challenges, and a supportive community where participants can showcase their skills, learn from others, and push their boundaries.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Join Our Community</h2>
            <p className="text-default-600">
              Whether you're a beginner taking your first steps in coding or an experienced developer looking for new challenges, CORE welcomes you. Join our growing community and be part of the next generation of programming excellence.
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div 
              className="flex flex-col items-center p-6 rounded-lg border border-default-200 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <img
                src="https://picsum.photos/200/200?random=1"
                alt="Team member"
                className="w-40 h-40 rounded-full object-cover mb-4"
              />
              <h3 className="text-xl font-semibold">Sarah Johnson</h3>
              <p className="text-default-600">Founder & CEO</p>
            </motion.div>

            <motion.div 
              className="flex flex-col items-center p-6 rounded-lg border border-default-200 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <img
                src="https://picsum.photos/200/200?random=2"
                alt="Team member"
                className="w-40 h-40 rounded-full object-cover mb-4"
              />
              <h3 className="text-xl font-semibold">Michael Chen</h3>
              <p className="text-default-600">CTO</p>
            </motion.div>

            <motion.div 
              className="flex flex-col items-center p-6 rounded-lg border border-default-200 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <img
                src="https://picsum.photos/200/200?random=3"
                alt="Team member"
                className="w-40 h-40 rounded-full object-cover mb-4"
              />
              <h3 className="text-xl font-semibold">Emily Rodriguez</h3>
              <p className="text-default-600">Lead Developer</p>
            </motion.div>

            <motion.div 
              className="flex flex-col items-center p-6 rounded-lg border border-default-200 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <img
                src="https://picsum.photos/200/200?random=4"
                alt="Team member"
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
