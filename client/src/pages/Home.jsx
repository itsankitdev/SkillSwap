import { Link } from 'react-router-dom';
import { Zap, Users, ArrowRight, Shield, Star, TrendingUp } from 'lucide-react';
import useAuth from '../hooks/useAuth';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-white">

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-violet-50 pointer-events-none" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-40 pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-64 h-64 bg-violet-100 rounded-full blur-3xl opacity-30 pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-600 text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-8 shadow-lg shadow-indigo-200">
            <Zap size={12} fill="currentColor" />
            No money involved. Just pure skill exchange.
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-[1.1] tracking-tight mb-6">
            Trade Skills,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
              Not Money
            </span>
          </h1>

          <p className="text-xl text-gray-500 max-w-xl mx-auto mb-10 leading-relaxed">
            Teach what you know. Learn what you don't.
            A credit-based community where knowledge is the currency.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              <Link to="/skills"
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-4 rounded-2xl transition-all shadow-xl shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5">
                Browse Skills <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link to="/register"
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-4 rounded-2xl transition-all shadow-xl shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5">
                  Start for Free <ArrowRight size={18} />
                </Link>
                <Link to="/skills"
                  className="text-gray-600 hover:text-indigo-600 font-medium px-6 py-4 rounded-2xl hover:bg-gray-50 transition-all">
                  Browse Skills
                </Link>
              </>
            )}
          </div>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-6 mt-14 text-sm text-gray-400">
            {[
              { icon: <Star size={14} className="text-amber-400" fill="currentColor" />, text: '10 free credits on signup' },
              { icon: <Shield size={14} className="text-green-500" />, text: 'No payment needed' },
              { icon: <Users size={14} className="text-indigo-400" />, text: 'Community driven' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-1.5">
                {icon} {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <p className="text-indigo-600 font-semibold text-sm mb-2">How it works</p>
          <h2 className="text-3xl font-bold text-gray-900">Simple as 1, 2, 3</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { step: '01', icon: <TrendingUp size={22} className="text-indigo-600" />, title: 'List your skills', desc: 'Add what you can teach and what you want to learn. Be specific — better listings get more matches.' },
            { step: '02', icon: <Users size={22} className="text-violet-600" />, title: 'Get matched', desc: 'Our algorithm finds people whose skills complement yours. Mutual matches are highlighted.' },
            { step: '03', icon: <Zap size={22} className="text-amber-500" />, title: 'Swap & earn', desc: 'Accept a request, teach your skill, earn credits. Use credits to learn something new.' },
          ].map(({ step, icon, title, desc }) => (
            <div key={step} className="relative bg-white rounded-3xl border border-gray-100 p-7 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className="absolute top-5 right-5 text-4xl font-black text-gray-50 select-none">
                {step}
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mb-5">
                {icon}
              </div>
              <h3 className="font-bold text-gray-800 text-lg mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-950 rounded-3xl mx-4 mb-20 px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">Why SkillSwap?</h2>
            <p className="text-gray-400">Everything you need to exchange skills fairly</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { icon: '⚡', title: 'Credit System', desc: 'Earn credits by teaching. Spend them to learn. Transparent and fair.' },
              { icon: '🎯', title: 'Smart Matching', desc: 'Find people whose skills perfectly complement yours automatically.' },
              { icon: '🔒', title: 'Safe Exchanges', desc: 'Credits held in escrow until swap is confirmed complete by both sides.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                <div className="text-3xl mb-4">{icon}</div>
                <h3 className="font-bold text-white mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section className="max-w-2xl mx-auto px-4 pb-24 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Ready to start?</h2>
          <p className="text-gray-500 mb-8">Join the community. Get 10 free credits instantly.</p>
          <Link to="/register"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-10 py-4 rounded-2xl transition-all shadow-xl shadow-indigo-200">
            Create Free Account <ArrowRight size={18} />
          </Link>
        </section>
      )}
    </div>
  );
};

export default Home;