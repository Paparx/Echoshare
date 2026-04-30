import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Package, Calendar, BarChart3, ArrowRight, Shield, Zap, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

const Home = () => {
  const { user } = useAuth();
  const { items, stats, events } = useData();

  const dynamicStats = [
    { label: "Items Circulating", val: items.length.toString(), color: "text-primary" },
    { label: "CO2 Saved", val: `${stats.co2Saved.toFixed(1)}kg`, color: "text-secondary" },
    { label: "Events Organized", val: events.length.toString(), color: "text-primary" },
    { label: "Waste Reduced", val: `${stats.wasteReduced}kg`, color: "text-secondary" },
  ];

  return (
    <div className="space-y-16 md:space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[40px] md:rounded-[60px] bg-primary text-surface p-8 md:p-20 lg:p-32 shadow-2xl shadow-primary/30">
        <div className="absolute top-0 right-0 w-2/3 h-full opacity-10 hidden lg:block pointer-events-none">
          <Leaf className="w-full h-full -rotate-12 translate-x-1/4 scale-150" />
        </div>
        
        <div className="relative z-10 max-w-3xl space-y-8 md:space-y-10">
          <div className="inline-flex items-center gap-2 bg-accent/20 backdrop-blur-md px-5 py-2.5 rounded-full border border-accent/30">
            <Zap className="w-4 h-4 text-accent fill-accent" />
            <span className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-accent">Join the Revolution</span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter">
            Share More. <br />
            <span className="text-accent">Waste Less.</span>
          </h1>
          
          <p className="text-lg md:text-2xl text-surface/90 font-medium leading-relaxed max-w-2xl">
            EcoShare Colony turns your apartment building into a collaborative resource hub. Borrow tools, join green events, and track your environmental impact together.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-5 pt-4">
            <Link 
              to="/items" 
              className="w-full sm:w-auto bg-surface text-primary px-10 py-5 rounded-[24px] font-black text-xl hover:bg-accent hover:scale-105 transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-95"
            >
              Start Browsing <ArrowRight className="w-6 h-6" />
            </Link>
            {!user && (
              <Link 
                to="/register" 
                className="w-full sm:w-auto bg-primary text-accent border-2 border-accent/30 px-10 py-5 rounded-[24px] font-black text-xl hover:bg-secondary hover:border-secondary transition-all flex items-center justify-center active:scale-95"
              >
                Create Account
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 px-4">
        {dynamicStats.map((stat, i) => (
          <div key={i} className="bg-white p-6 md:p-10 rounded-[32px] border border-gray-100 shadow-sm text-center group hover:shadow-xl transition-all">
            <p className={`text-3xl md:text-5xl font-black ${stat.color} mb-2 tracking-tighter`}>{stat.val}</p>
            <p className="text-[10px] md:text-xs font-black uppercase text-gray-400 tracking-widest leading-tight">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* Features Grid */}
      <section className="space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">Built for Community.</h2>
          <p className="text-gray-500 font-medium">Everything you need to manage resources and impact in one place.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Package, title: "Resource Pool", desc: "Access tools, electronics, and books without buying new. Save money and storage space.", color: "text-blue-600", bg: "bg-blue-50" },
            { icon: Calendar, title: "Eco Events", desc: "Join neighborhood garden meets, repair cafes, and sustainability workshops.", color: "text-amber-600", bg: "bg-amber-50" },
            { icon: BarChart3, title: "Impact Dashboard", desc: "See your personal and community contribution to a greener planet in real-time.", color: "text-primary", bg: "bg-accent/10" },
          ].map((feat, i) => (
            <div key={i} className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-2xl transition-all group flex flex-col items-center text-center">
              <div className={`${feat.bg} ${feat.color} w-20 h-20 rounded-3xl flex items-center justify-center mb-8 group-hover:rotate-6 transition-transform`}>
                <feat.icon className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4">{feat.title}</h3>
              <p className="text-gray-500 leading-relaxed font-medium">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-primary rounded-[48px] p-8 md:p-16 text-surface overflow-hidden relative border border-secondary/20">
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-accent/10 rounded-full translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
          <div className="lg:max-w-xl space-y-6">
            <h2 className="text-4xl font-black">Ready to make your colony <span className="text-accent text-glow">Eco-Friendly?</span></h2>
            <p className="text-surface/80 text-lg">Every item shared prevents another one from ending up in a landfill. Join 250+ residents already making a difference.</p>
            <div className="flex gap-8 pt-4">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-accent" />
                <span className="font-bold">Secure & Private</span>
              </div>
              <div className="flex items-center gap-3">
                <Heart className="w-6 h-6 text-accent/80" />
                <span className="font-bold">Built with Love</span>
              </div>
            </div>
          </div>
          <div className="w-full lg:w-auto">
            <Link to="/items/add" className="block w-full text-center bg-secondary text-surface px-12 py-5 rounded-[24px] font-black text-xl hover:bg-secondary/90 transition-all shadow-xl shadow-secondary/20">
              Start Posting Today
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
