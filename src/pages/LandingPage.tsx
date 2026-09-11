import { useNavigate } from 'react-router-dom';
import { AeroNexLogo } from '../components/AeroNexLogo';
import { LineChart, Globe, Brain, Database, ArrowRight, ShieldCheck, Activity, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#090A0F] text-zinc-100 font-['Inter',sans-serif] overflow-hidden selection:bg-cyan-500/30">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none stars-bg mix-blend-screen" />
      <div className="fixed inset-0 z-0 pointer-events-none tech-grid-bg opacity-30" />
      <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-900/10 blur-[120px] pointer-events-none z-0 mix-blend-screen" />
      <div className="fixed bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-cyan-900/10 blur-[120px] pointer-events-none z-0 mix-blend-screen" />

      {/* Navbar */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-4 lg:px-12 backdrop-blur-md border-b border-white/[0.05]">
        <AeroNexLogo size={40} showTagline={false} />
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/login')}
            className="text-sm font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            Sign In
          </button>
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl text-sm font-bold text-white shadow-[0_0_15px_rgba(0,229,255,0.3)] hover:shadow-[0_0_25px_rgba(0,229,255,0.5)] transition-all cursor-pointer flex items-center gap-2"
          >
            View Live Intelligence <ArrowRight size={16} />
          </button>
        </div>
      </nav>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="pt-24 pb-16 px-6 lg:px-12 max-w-7xl mx-auto flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold tracking-widest uppercase"
          >
            <ShieldCheck size={14} />
            Experimental Airfare Price Indexing
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black tracking-tight text-white mb-6 leading-tight"
          >
            From Flight Prices to <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              Economic Intelligence.
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg md:text-xl text-zinc-400 max-w-3xl mb-10 leading-relaxed"
          >
            An AI-powered platform for real-time airfare intelligence, price indexing, and analytical support for India's evolving aviation economy. Designed to explore potential augmentation of the Consumer Price Index (CPI).
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4"
          >
            <button 
              onClick={() => navigate('/dashboard')}
              className="px-8 py-4 bg-white text-[#0A0F1C] rounded-xl text-base font-bold shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:-translate-y-1 transition-all cursor-pointer w-full sm:w-auto"
            >
              Explore Airfare Index
            </button>
            <button 
              onClick={() => navigate('/methodology')}
              className="px-8 py-4 bg-[#121624] border border-white/[0.1] text-white rounded-xl text-base font-semibold hover:bg-white/[0.05] transition-all cursor-pointer w-full sm:w-auto flex items-center justify-center gap-2"
            >
              <BookOpen size={18} /> Review Methodology
            </button>
          </motion.div>
        </section>

        {/* Problem -> Solution Visual Section */}
        <section className="py-20 px-6 lg:px-12 bg-black/40 border-y border-white/[0.05]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why AeroNex?</h2>
              <p className="text-zinc-400 max-w-2xl mx-auto">Bridging the gap between highly dynamic, fragmented airfare markets and structured economic tracking.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 relative">
              {/* Connection Line */}
              <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center border border-cyan-500/40 z-10">
                <ArrowRight className="text-cyan-400" />
              </div>

              {/* Problem */}
              <div className="bg-rose-950/10 border border-rose-500/10 rounded-2xl p-8 backdrop-blur-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-rose-500/40" />
                <h3 className="text-xl font-bold text-rose-400 mb-6 flex items-center gap-2">
                  <Activity size={20} /> Current Limitations
                </h3>
                <ul className="space-y-4">
                  {[
                    'Dynamic and highly volatile airfare prices',
                    'Fragmented data sources across airlines & OTAs',
                    'Inconsistent fare formats and inclusion of taxes',
                    'Difficult to compare identical products',
                    'Limited high-frequency visibility for economic metrics'
                  ].map((text, i) => (
                    <li key={i} className="flex items-start gap-3 text-zinc-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500/50 mt-2 shrink-0" />
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Solution */}
              <div className="bg-cyan-950/10 border border-cyan-500/20 rounded-2xl p-8 backdrop-blur-sm relative overflow-hidden shadow-[0_0_30px_rgba(0,229,255,0.05)]">
                <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500" />
                <h3 className="text-xl font-bold text-cyan-400 mb-6 flex items-center gap-2">
                  <ShieldCheck size={20} /> AeroNex Solution
                </h3>
                <ul className="space-y-4">
                  {[
                    'Automated, policy-compliant data ingestion',
                    'Real-time strict price normalization',
                    'Dynamic Airfare Price Index calculation',
                    'Route-level intelligence and volatility tracking',
                    'AI-assisted anomaly detection & data validation'
                  ].map((text, i) => (
                    <li key={i} className="flex items-start gap-3 text-zinc-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0 shadow-[0_0_8px_rgba(0,229,255,0.8)]" />
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-24 px-6 lg:px-12 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Airfare Digital Price Twin</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">A continuously updated analytical prototype of India's aviation economy, transforming unstructured observations into structured intelligence.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard 
              icon={LineChart}
              title="Airfare Price Index"
              desc="A weighted benchmark modeled after the CPI basket, tracking high-density metro corridors and regional routes."
            />
            <FeatureCard 
              icon={Globe}
              title="Route Intelligence"
              desc="Analyze specific sector yields, fare volatility, and structural pricing changes across domestic airspace."
            />
            <FeatureCard 
              icon={Database}
              title="Automated Validation"
              desc="Ingestion pipelines feature real-time data cleaning, ensuring observed fares are normalized before index inclusion."
            />
            <FeatureCard 
              icon={Brain}
              title="AI Anomaly Detection"
              desc="Detects sudden fare spikes or drops outside expected historical ranges using Gemini-powered intelligence."
            />
            <FeatureCard 
              icon={Activity}
              title="Volatility Monitoring"
              desc="Identify sectors experiencing rapid price instability to understand structural airfare inflation."
            />
            <FeatureCard 
              icon={ShieldCheck}
              title="CPI Augmentation"
              desc="Analytical insights designed to explore how high-frequency observations can complement traditional methodologies."
            />
          </div>
        </section>
      </main>

      <footer className="border-t border-white/[0.05] py-8 text-center text-sm text-zinc-500 relative z-10 bg-black/60">
        <p>AeroNex Platform Prototype — Smart India Hackathon (SIH26056) MoSPI</p>
        <p className="mt-2 text-xs opacity-70">
          Disclaimer: AeroNex is an experimental analytical prototype. The generated Airfare Price Index does not represent an official MoSPI Consumer Price Index.
        </p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="bg-[#121624]/60 border border-white/[0.05] hover:border-cyan-500/30 p-6 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,229,255,0.05)] group">
      <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-5 group-hover:scale-110 transition-transform">
        <Icon size={24} />
      </div>
      <h4 className="text-lg font-bold text-white mb-2">{title}</h4>
      <p className="text-sm text-zinc-400 leading-relaxed">{desc}</p>
    </div>
  );
}
