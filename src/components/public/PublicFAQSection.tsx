import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { FAQ } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, MessageCircleQuestion } from 'lucide-react';

export function PublicFAQSection() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);

  useEffect(() => {
    async function fetchFaqs() {
      const { data } = await supabase
        .from('faqs')
        .select('*')
        .order('order_index', { ascending: true });
      if (data) setFaqs(data);
    }
    fetchFaqs();
  }, []);

  const [openId, setOpenId] = useState<string | null>(null);

  if (faqs.length === 0) return null;

  return (
    <section id="faq" className="py-32 px-6 lg:px-12 bg-slate-50 relative overflow-hidden">
      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-20"
        >
          <h2 className="font-heading text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4">
            Tanya <span className="text-pink-500">Jawab</span>
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto font-medium text-lg">
            Temukan jawaban atas pertanyaan yang sering diajukan seputar layanan, studio, dan proses kreatif kami.
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className={`bg-white rounded-2xl border transition-all duration-300 ${
                openId === faq.id
                  ? 'border-pink-300 shadow-[0_10px_30px_rgba(236,72,153,0.1)]'
                  : 'border-slate-200 hover:border-pink-200 hover:shadow-md'
              }`}
            >
              <button
                onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                className="w-full flex items-center justify-between p-6 md:p-8 text-left focus:outline-none"
              >
                <span className="font-bold text-lg md:text-xl text-slate-900 pr-8 font-heading tracking-tight">{faq.question}</span>
                <span className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full transition-all duration-300 ${
                  openId === faq.id
                    ? 'rotate-180 bg-pink-500 text-white shadow-md shadow-pink-500/20'
                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                }`}>
                  <ChevronDown className="w-6 h-6" />
                </span>
              </button>

              <AnimatePresence>
                {openId === faq.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 md:px-8 pb-8 pt-0 text-slate-600 md:text-lg leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
