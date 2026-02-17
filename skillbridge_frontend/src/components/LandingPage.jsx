import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    Menu,
    X,
    CheckCircle,
    Users,
    ShieldCheck,
    Zap,
    Layout,
    BarChart3,
    Mail,
    Globe,
    ArrowRight,
    ChevronRight
} from "lucide-react";

const LandingPage = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { name: "Home", href: "#" },
        { name: "About", href: "#how-it-works" },
        { name: "How It Works", href: "#how-it-works" },
        { name: "Contact", href: "#footer" },
    ];

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900 scroll-smooth">
            {/* 1. Navbar */}
            <nav
                className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? "bg-white/80 backdrop-blur-md shadow-md py-3" : "bg-transparent py-5"
                    }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center">
                        <Link to="/" className="flex items-center gap-2">
                            <img src="/logo.svg" alt="SkillBridge Logo" className="h-10 w-auto" />
                        </Link>

                        {/* Desktop Links */}
                        <div className="hidden md:flex items-center space-x-8">
                            {navLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
                                >
                                    {link.name}
                                </a>
                            ))}
                            <div className="flex items-center space-x-4 ml-4">
                                <Link
                                    to="/login"
                                    className="px-4 py-2 text-sm font-semibold text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-all"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md shadow-blue-200 transition-all"
                                >
                                    Get Started
                                </Link>
                            </div>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden">
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600">
                                {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Sidebar */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, x: 100 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 100 }}
                            className="fixed inset-0 z-40 md:hidden bg-white p-8 flex flex-col"
                        >
                            <div className="flex justify-end mb-8">
                                <button onClick={() => setIsMenuOpen(false)}>
                                    <X size={32} className="text-gray-600" />
                                </button>
                            </div>
                            <div className="flex flex-col space-y-6 text-center">
                                {navLinks.map((link) => (
                                    <a
                                        key={link.name}
                                        href={link.href}
                                        onClick={() => setIsMenuOpen(false)}
                                        className="text-xl font-semibold text-gray-800"
                                    >
                                        {link.name}
                                    </a>
                                ))}
                                <div className="flex flex-col space-y-4 pt-6 border-t">
                                    <Link to="/login" className="w-full py-3 text-lg font-bold text-blue-600 border border-blue-600 rounded-xl">
                                        Login
                                    </Link>
                                    <Link to="/register" className="w-full py-3 text-lg font-bold text-white bg-blue-600 rounded-xl shadow-lg">
                                        Get Started
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* 2. Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 leading-tight mb-6">
                                Bridging Skills with <span className="text-blue-600">Purpose</span>
                            </h1>
                            <p className="text-xl text-gray-600 mb-10 max-w-xl leading-relaxed">
                                Connect volunteers with NGOs and create real-world impact. Unlock your potential and contribute to projects that matter.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link to="/register" className="px-8 py-4 bg-blue-600 text-white font-bold rounded-xl text-lg hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-2">
                                    Get Started <ArrowRight size={20} />
                                </Link>
                                <button className="px-8 py-4 bg-white text-gray-800 font-bold border border-gray-200 rounded-xl text-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                                    Explore Opportunities <ChevronRight size={20} />
                                </button>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="relative"
                        >
                            <div className="w-full aspect-square bg-gradient-to-tr from-blue-100 to-indigo-100 rounded-3xl overflow-hidden shadow-2xl relative">
                                <div className="absolute inset-0 flex items-center justify-center opacity-40">
                                    <Users size={200} className="text-blue-600" />
                                </div>
                                {/* Visual elements representing volunteering */}
                                <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg p-6 animate-float">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">SB</div>
                                        <div className="flex-1">
                                            <div className="h-2 w-24 bg-gray-200 rounded animate-pulse mb-2"></div>
                                            <div className="h-2 w-16 bg-gray-100 rounded animate-pulse"></div>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="h-2 w-full bg-gray-100 rounded"></div>
                                        <div className="h-2 w-full bg-gray-100 rounded"></div>
                                        <div className="h-2 w-2/3 bg-gray-50 rounded"></div>
                                    </div>
                                </div>
                            </div>
                            {/* Decorative elements */}
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600/10 blur-3xl rounded-full"></div>
                            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-600/10 blur-3xl rounded-full"></div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* 3. How It Works Section */}
            <section id="how-it-works" className="py-24 bg-white sm:py-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
                    <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">How It Works</h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">Three simple steps to start making an impact in your community.</p>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-12">
                    {[
                        {
                            icon: <Layout className="text-blue-600" size={40} />,
                            title: "Create Profile",
                            desc: "Sign up and build your profile. Share your skills, interests, and availability."
                        },
                        {
                            icon: <Users className="text-blue-600" size={40} />,
                            title: "Find Opportunities",
                            desc: "Browse through hundreds of volunteering opportunities posted by NGOs worldwide."
                        },
                        {
                            icon: <CheckCircle className="text-blue-600" size={40} />,
                            title: "Make Impact",
                            desc: "Connect with organizations, contribute your expertise, and see your impact Grow!"
                        },
                    ].map((item, idx) => (
                        <motion.div
                            key={idx}
                            whileHover={{ y: -10 }}
                            className="p-10 rounded-3xl bg-gray-50 border border-gray-100 hover:shadow-2xl hover:shadow-blue-100 transition-all text-center group"
                        >
                            <div className="mb-6 flex justify-center transform group-hover:scale-110 transition-transform">
                                {item.icon}
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">{item.title}</h3>
                            <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* 4. Features Section */}
            <section className="py-24 bg-gray-50 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
                    <div className="max-w-2xl">
                        <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4 tracking-tight">Platform Features</h2>
                        <p className="text-lg text-gray-600">Everything you need to manage volunteering and social impact projects efficiently.</p>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                        {
                            icon: <Zap size={24} />,
                            title: "Smart Skill Matching",
                            desc: "Our algorithm connects you with projects that perfectly match your expertise."
                        },
                        {
                            icon: <ShieldCheck size={24} />,
                            title: "Secure Registration",
                            desc: "Verified profiles for both volunteers and NGOs to ensure a safe community."
                        },
                        {
                            icon: <BarChart3 size={24} />,
                            title: "Real-time Updates",
                            desc: "Stay informed with instant notifications about project applications and milestones."
                        },
                        {
                            icon: <Layout size={24} />,
                            title: "NGO Dashboard",
                            desc: "Powerful tools for organizations to manage volunteers and track project progress."
                        },
                    ].map((feature, idx) => (
                        <div key={idx} className="bg-white p-8 rounded-2xl border border-gray-100 hover:border-blue-200 transition-all shadow-sm hover:shadow-lg group">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                {feature.icon}
                            </div>
                            <h4 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h4>
                            <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* 5. Impact Section (Stats) */}
            <section className="py-24 bg-white border-y border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-3 gap-12 text-center">
                        {[
                            { label: "Volunteers", value: "500+" },
                            { label: "NGOs Joined", value: "100+" },
                            { label: "Projects Completed", value: "1000+" },
                        ].map((stat, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <div className="text-5xl lg:text-7xl font-black text-blue-600 mb-4">{stat.value}</div>
                                <div className="text-lg font-semibold text-gray-500 uppercase tracking-widest">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 6. Call To Action Section */}
            <section className="py-24 lg:py-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="relative rounded-[2.5rem] bg-gradient-to-r from-blue-700 to-indigo-800 p-12 lg:p-24 overflow-hidden text-center text-white shadow-2xl">
                        {/* Background pattern */}
                        <div className="absolute top-0 right-0 p-10 opacity-10">
                            <Globe size={400} />
                        </div>

                        <div className="relative z-10 max-w-2xl mx-auto">
                            <h2 className="text-4xl lg:text-6xl font-bold mb-8 text-white leading-tight">Ready to Make a Difference?</h2>
                            <p className="text-xl text-blue-50 mb-12 italic opacity-90">
                                "Join SkillBridge today and start your journey towards creating social impact with your unique skills."
                            </p>
                            <Link to="/register" className="px-10 py-5 bg-white text-blue-700 font-black rounded-2xl text-xl hover:bg-gray-50 shadow-2xl hover:scale-105 active:scale-95 transition-all">
                                Join SkillBridge Today
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* 7. Footer */}
            <footer id="footer" className="bg-white pt-24 pb-12 overflow-hidden border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
                    <div>
                        <Link to="/" className="mb-8 block">
                            <img src="/logo.svg" alt="SkillBridge Logo" className="h-10 w-auto" />
                        </Link>
                        <p className="text-gray-500 leading-relaxed">
                            Bridging the gap between talented volunteers and NGOs to foster meaningful change in our communities.
                        </p>
                    </div>

                    <div>
                        <h5 className="font-bold text-gray-900 mb-8 uppercase tracking-widest text-xs">Quick Links</h5>
                        <ul className="space-y-4">
                            <li><a href="#" className="text-gray-500 hover:text-blue-600 transition-colors">Home</a></li>
                            <li><a href="#how-it-works" className="text-gray-500 hover:text-blue-600 transition-colors">About Us</a></li>
                            <li><a href="#" className="text-gray-500 hover:text-blue-600 transition-colors">Services</a></li>
                            <li><a href="#" className="text-gray-500 hover:text-blue-600 transition-colors">Testimonials</a></li>
                        </ul>
                    </div>

                    <div>
                        <h5 className="font-bold text-gray-900 mb-8 uppercase tracking-widest text-xs">Contact Info</h5>
                        <ul className="space-y-4 text-gray-500">
                            <li className="flex items-center gap-3">
                                <Mail size={16} /> contact@skillbridge.org
                            </li>
                            <li className="flex items-start gap-3">
                                <Globe size={16} className="mt-1" /> 123 Impact Way, Social Hub, Tech City
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h5 className="font-bold text-gray-900 mb-8 uppercase tracking-widest text-xs">Follow Us</h5>
                        <div className="flex space-x-4">
                            {[1, 2, 3, 4].map(i => (
                                <a key={i} href="#" className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white transition-all">
                                    <span className="sr-only">Social Link {i}</span>
                                    <div className="w-5 h-5 bg-current rounded-sm"></div>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm gap-4 text-center">
                    <p>© {new Date().getFullYear()} SkillBridge. All rights reserved.</p>
                    <div className="flex space-x-6">
                        <a href="#" className="hover:text-gray-600">Privacy Policy</a>
                        <a href="#" className="hover:text-gray-600">Terms of Service</a>
                    </div>
                </div>
            </footer>

            {/* Global Animations for components */}
            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }
      `}} />
        </div>
    );
};

export default LandingPage;
