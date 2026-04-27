import React from 'react';
import { ArrowLeft, BookOpen, CreditCard, HelpCircle, Mail, MessageCircle, ShieldCheck, Sparkles, UserRound } from 'lucide-react';
import { Button } from './Button';

interface SupportProps {
  onBack: () => void;
}

const supportCards = [
  {
    icon: MessageCircle,
    title: 'General Help',
    description: 'Questions about humanizing, AI detection, tone settings, or daily limits.',
  },
  {
    icon: CreditCard,
    title: 'Billing & Pro Plan',
    description: 'Need help with payment verification, Pro activation, or subscription status?',
  },
  {
    icon: UserRound,
    title: 'Account Support',
    description: 'Get help with login, email verification, password resets, or profile updates.',
  },
];

const faqs = [
  {
    question: 'How long does Pro activation take?',
    answer: 'Pro access is activated after your submitted transaction details are verified. Most requests are reviewed within 24 hours.',
  },
  {
    question: 'Do you store the text I humanize?',
    answer: 'No. MinihaAI processes your text in real time and does not store submitted content after generating a result.',
  },
  {
    question: 'What should I include when contacting support?',
    answer: 'Share your account email, the issue you are facing, and any transaction ID if the request is related to payment verification.',
  },
  {
    question: 'Why did I hit a daily limit?',
    answer: 'Free accounts include daily usage limits. Upgrading to Pro unlocks higher usage and premium features.',
  },
];

export const Support: React.FC<SupportProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-rose-100 via-orange-50 to-transparent pointer-events-none" />
      <div className="absolute top-20 right-4 sm:right-20 w-52 h-52 bg-rose-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-48 left-4 sm:left-24 w-44 h-44 bg-orange-200/40 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        <section className="bg-white/85 backdrop-blur rounded-[2rem] border border-white shadow-xl shadow-rose-100/50 overflow-hidden">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
            <div className="p-8 sm:p-12 lg:p-14">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-bold uppercase tracking-wider mb-6 border border-rose-100">
                <Sparkles className="w-3.5 h-3.5" />
                MinihaAI Support
              </div>

              <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-950 tracking-tight leading-tight mb-5">
                How can we help you today?
              </h1>
              <p className="text-base sm:text-lg text-slate-600 leading-8 max-w-2xl mb-8">
                Get help with your account, Pro subscription, payment verification, privacy, or using the humanizer and detector tools.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="mailto:support@minihaai.com"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-950 text-white font-semibold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/15"
                >
                  <Mail className="w-4 h-4" />
                  Email Support
                </a>
                <a
                  href="#faq"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-slate-700 font-semibold hover:bg-slate-50 transition-all border border-slate-200"
                >
                  <HelpCircle className="w-4 h-4" />
                  Read FAQs
                </a>
              </div>
            </div>

            <div className="bg-slate-950 text-white p-8 sm:p-12 lg:p-14 flex items-center">
              <div className="w-full">
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-6 border border-white/10">
                  <ShieldCheck className="w-7 h-7 text-rose-300" />
                </div>
                <h2 className="text-2xl font-bold mb-4">Fastest way to get help</h2>
                <p className="text-slate-300 leading-7 mb-6">
                  Send us your account email and a short description of the issue. For payment support, include your transaction ID so we can verify it faster.
                </p>
                <div className="rounded-2xl bg-white/10 border border-white/10 p-5">
                  <p className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-2">Support email</p>
                  <a href="mailto:support@minihaai.com" className="text-lg font-semibold text-white hover:text-rose-200 transition-colors">
                    support@minihaai.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-4 mt-6">
          {supportCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.title} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-11 h-11 bg-rose-50 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-rose-600" />
                </div>
                <h3 className="font-bold text-slate-950 mb-2">{card.title}</h3>
                <p className="text-sm text-slate-600 leading-6">{card.description}</p>
              </div>
            );
          })}
        </section>

        <section id="faq" className="mt-6 bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 bg-slate-100 rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-slate-700" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-rose-600">Quick answers</p>
              <h2 className="text-2xl font-extrabold text-slate-950">Frequently Asked Questions</h2>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {faqs.map((faq) => (
              <div key={faq.question} className="rounded-2xl bg-slate-50 border border-slate-200 p-5">
                <h3 className="font-bold text-slate-900 mb-2">{faq.question}</h3>
                <p className="text-sm text-slate-600 leading-6">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
