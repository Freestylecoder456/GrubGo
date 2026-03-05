import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Award,
  Clock,
  Users,
  Coffee,
  Sparkles,
  ChefHat,
  Star,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import PageBackground from "../components/common/PageBackground";

export default function About() {
  const statsRef = useRef(null);
  const isStatsInView = useInView(statsRef, { once: true, margin: "-100px" });

  const stats = [
    { icon: <Clock size={24} />, value: "15+", label: "Years Excellence" },
    { icon: <Users size={24} />, value: "50k+", label: "Happy Customers" },
    { icon: <Coffee size={24} />, value: "120+", label: "Signature Dishes" },
    { icon: <Award size={24} />, value: "25", label: "Awards Won" },
  ];

  const team = [
    {
      name: "Marco Rossi",
      role: "Executive Chef",
      image:
        "https://images.unsplash.com/photo-1583394293214-28ded15ee548?q=80&w=2960&auto=format&fit=crop",
      desc: "Michelin-starred chef with 20 years of culinary excellence.",
    },
    {
      name: "Sophie Chen",
      role: "Pastry Chef",
      image:
        "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?q=80&w=3024&auto=format&fit=crop",
      desc: "Master of desserts, trained in Paris and Tokyo.",
    },
    {
      name: "James Kim",
      role: "Sommelier",
      image:
        "https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=3087&auto=format&fit=crop",
      desc: "Curates our exclusive wine and beverage pairings.",
    },
  ];

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  return (
    <div className="min-h-screen">
      <PageBackground color="red" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20 md:py-24">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 sm:mb-16 md:mb-20"
        >
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="w-16 sm:w-20 md:w-24 h-[2px] bg-red-500 mx-auto mb-6 sm:mb-8"
          />
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight mb-4 sm:mb-6">
            <span className="font-black dark:text-white">ABOUT</span>
            <span className="text-red-500 font-black ml-2 sm:ml-4">US</span>
          </h1>
          <p className="text-base sm:text-lg dark:text-gray-400 max-w-2xl mx-auto leading-relaxed px-4">
            Crafting unforgettable culinary experiences since 2026. Every dish
            tells a story of passion, quality, and innovation.
          </p>
        </motion.div>

        {/* Story Section */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-2 gap-8 md:gap-12 items-center mb-20 md:mb-32"
        >
          <motion.div variants={fadeInUp} className="space-y-6">
            <h2 className="text-4xl font-light">
              <span className="font-black dark:text-white">OUR</span>
              <span className="text-red-500 font-black ml-3">STORY</span>
            </h2>
            <div className="w-16 h-[2px] bg-red-500" />
            <p className="dark:text-gray-300 leading-relaxed">
              GrubGo was born from a simple idea: to bring restaurant-quality
              food to your table with unparalleled convenience. What started as
              a small kitchen in the heart of the city has grown into a
              destination for food lovers who refuse to compromise on taste.
            </p>
            <p className="dark:text-gray-300 leading-relaxed">
              Our chefs travel the world to source the finest ingredients, from
              Japanese wagyu to Italian truffles. We believe that every meal
              should be an experience—one that delights your senses and leaves
              you craving more.
            </p>
            <div className="pt-4">
              <div className="flex items-center gap-2 text-red-500">
                <Sparkles size={18} />
                <span className="text-xs uppercase tracking-widest">
                  Michelin-starred team
                </span>
              </div>
            </div>
          </motion.div>
          <motion.div variants={fadeInUp} className="relative">
            <div className="aspect-[4/5] rounded-3xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=3874&auto=format&fit=crop"
                alt="Chef preparing dish"
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-w-xs">
              <p className="text-sm text-white italic">
                "Food is our common ground, a universal experience. We elevate
                it to art."
              </p>
              <p className="text-xs text-red-500 mt-2">
                — Marco Rossi, Executive Chef
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          ref={statsRef}
          initial="hidden"
          animate={isStatsInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-32"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center group hover:border-red-500/30 transition-all"
            >
              <div className="text-red-500 mb-3 flex justify-center group-hover:scale-110 transition-transform">
                {stat.icon}
              </div>
              <div className="text-3xl font-black dark:text-white">
                {stat.value}
              </div>
              <div className="text-xs uppercase tracking-widest dark:text-gray-500 mt-1">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Philosophy */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative mb-32"
        >
          <div className="absolute inset-0 bg-linear-to-r from-red-500/10 to-transparent rounded-3xl" />
          <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-12 md:p-16">
            <h2 className="text-4xl font-light mb-8">
              <span className="font-black dark:text-white">OUR</span>
              <span className="text-red-500 font-black ml-3">PHILOSOPHY</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <ChefHat size={28} className="text-red-500" />
                <h3 className="text-lg font-bold dark:text-white">
                  Quality First
                </h3>
                <p className="text-sm dark:text-gray-400">
                  We source only the finest ingredients, ensuring every dish
                  meets our exacting standards.
                </p>
              </div>
              <div className="space-y-3">
                <Star size={28} className="text-red-500" />
                <h3 className="text-lg font-bold dark:text-white">
                  Innovation
                </h3>
                <p className="text-sm dark:text-gray-400">
                  Our menu evolves with the seasons, blending tradition with
                  modern creativity.
                </p>
              </div>
              <div className="space-y-3">
                <Users size={28} className="text-red-500" />
                <h3 className="text-lg font-bold dark:text-white">Community</h3>
                <p className="text-sm dark:text-gray-400">
                  We believe in bringing people together through the joy of
                  exceptional food.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Team Section */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mb-32"
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl font-light">
              <span className="font-black dark:text-white">MEET THE</span>
              <span className="text-red-500 font-black ml-3">TEAM</span>
            </h2>
            <div className="w-16 h-[2px] bg-red-500 mx-auto mt-4" />
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="group relative"
              >
                <div className="aspect-[3/4] rounded-2xl overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                  />
                </div>
                <div className="absolute inset-0 bg-transparent dark:bg-linear-to-t from-black via-transparent to-transparent rounded-2xl" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-xl font-bold dark:text-white">
                    {member.name}
                  </h3>
                  <p className="text-red-500 text-sm mb-2">{member.role}</p>
                  <p className="text-xs dark:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
                    {member.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Contact / Visit Us */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-12"
        >
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-light mb-4">
                <span className="font-black dark:text-white">VISIT</span>
                <span className="text-red-500 font-black ml-3">US</span>
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <MapPin size={18} className="text-red-500" />
                  <span>123 Gourmet Street, Culinary District, NY 10001</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <Phone size={18} className="text-red-500" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <Mail size={18} className="text-red-500" />
                  <span>hello@grubgo.com</span>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-light mb-4">
                <span className="font-black dark:text-white">HOURS</span>
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                  <span>Monday - Thursday</span>
                  <span className="text-red-500">11am - 10pm</span>
                </div>
                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                  <span>Friday - Saturday</span>
                  <span className="text-red-500">11am - 12am</span>
                </div>
                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                  <span>Sunday</span>
                  <span className="text-red-500">10am - 9pm</span>
                </div>
              </div>
              <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                <p className="text-sm text-red-500">
                  Reservations recommended for weekend dining.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}