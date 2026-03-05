import { motion } from "framer-motion";
import { useState } from "react";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
} from "lucide-react";
import { useAlert } from "../context/AlertContext";
import PageBackground from "../components/common/PageBackground";

export default function Contact() {
  const { showAlert } = useAlert();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate submission
    setTimeout(() => {
      showAlert("Message sent! We'll get back to you soon.", "success");
      setFormData({ name: "", email: "", message: "" });
      setIsSubmitting(false);
    }, 1000);
  };

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
    <div className="min-h-screen bg-transparent transition-colors duration-300">
      <PageBackground color="red" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20 md:py-24">
        {/* Hero */}
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
            <span className="font-black text-gray-900 dark:text-white">
              GET IN
            </span>
            <span className="text-red-500 font-black ml-4">TOUCH</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Have a question, feedback, or just want to say hello? We'd love to
            hear from you.
          </p>
        </motion.div>

        {/* Contact grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:lg:grid-cols-2 gap-8 md:gap-12"
        >
          {/* Left: Contact info & map */}
          <motion.div variants={fadeInUp} className="space-y-8">
            {/* Contact info cards */}
            <div className="grid sm:grid-cols-2 gap-4 mb-8 sm:mb-12">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-red-500/30 transition-all group">
                <MapPin
                  size={24}
                  className="text-red-500 mb-3 group-hover:scale-110 transition-transform"
                />
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-1">
                  Visit Us
                </h3>
                <p className="text-gray-900 dark:text-white text-sm">
                  123 Gourmet Street
                  <br />
                  Culinary District, NY 10001
                </p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-red-500/30 transition-all group">
                <Phone
                  size={24}
                  className="text-red-500 mb-3 group-hover:scale-110 transition-transform"
                />
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-1">
                  Call Us
                </h3>
                <p className="text-gray-900 dark:text-white text-sm">
                  +1 (555) 123-4567
                </p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-red-500/30 transition-all group">
                <Mail
                  size={24}
                  className="text-red-500 mb-3 group-hover:scale-110 transition-transform"
                />
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-1">
                  Email
                </h3>
                <p className="text-gray-900 dark:text-white text-sm">
                  hello@grubgo.com
                </p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-red-500/30 transition-all group">
                <Clock
                  size={24}
                  className="text-red-500 mb-3 group-hover:scale-110 transition-transform"
                />
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-1">
                  Hours
                </h3>
                <p className="text-gray-900 dark:text-white text-sm">
                  Mon-Thu: 11am-10pm
                  <br />
                  Fri-Sat: 11am-12am
                </p>
              </div>
            </div>

            {/* Map placeholder */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden h-64 relative group">
              <img
                src="https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?q=80&w=3731&auto=format&fit=crop"
                alt="Map location"
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full">
                <MapPin size={14} className="text-red-500" />
                <span className="text-xs text-white">Our location</span>
              </div>
            </div>

            {/* Social links */}
            <div className="flex items-center gap-4">
              <span className="text-xs uppercase tracking-widest text-gray-500">
                Follow us
              </span>
              <div className="h-[1px] w-12 bg-white/10" />
              <a
                href="#"
                className="text-gray-500 hover:text-red-500 transition-colors"
              >
                <Instagram size={18} />
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-red-500 transition-colors"
              >
                <Twitter size={18} />
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-red-500 transition-colors"
              >
                <Facebook size={18} />
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-red-500 transition-colors"
              >
                <Linkedin size={18} />
              </a>
            </div>
          </motion.div>

          {/* Right: Contact form */}
          <motion.div variants={fadeInUp}>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-4 sm:p-6 md:p-8">
              <h2 className="text-2xl sm:text-3xl font-light mb-2">
                <span className="font-black text-gray-900 dark:text-white">
                  SEND
                </span>
                <span className="text-red-500 font-black ml-2">MESSAGE</span>
              </h2>
              <div className="w-12 h-[2px] bg-red-500 mb-8" />

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                    Your name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full bg-white/50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl py-4 px-6 outline-none focus:border-red-500 text-gray-900 dark:text-white transition-all placeholder:text-gray-400 dark:placeholder:text-gray-700"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                    Email address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-white/50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl py-4 px-6 outline-none focus:border-red-500 text-gray-900 dark:text-white transition-all placeholder:text-gray-400 dark:placeholder:text-gray-700"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="5"
                    className="w-full bg-white/50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl py-4 px-6 outline-none focus:border-red-500 text-gray-900 dark:text-white transition-all placeholder:text-gray-400 dark:placeholder:text-gray-700 resize-none"
                    placeholder="How can we help you?"
                  />
                </div>
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-red-500 text-black py-4 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-red-400 transition-colors shadow-lg shadow-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                  <Send size={16} />
                </motion.button>
              </form>

              <p className="text-[10px] text-gray-700 text-center mt-4">
                We'll get back to you within 24 hours.
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Additional CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-20 text-center"
        >
          <p className="text-gray-500 text-sm">
            For press inquiries:{" "}
            <a
              href="mailto:press@grubgo.com"
              className="text-red-500 hover:underline"
            >
              press@grubgo.com
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}