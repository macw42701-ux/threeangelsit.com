import { CheckCircle2, Send, Shield, Terminal } from 'lucide-react';
import { FormEvent, useState } from 'react';
import heroWorkbenchImg from '../assets/images/hero_it_workbench_1794586743951.jpg';
import { adminDataRepository } from '../services/adminDataService';

interface AboutAndContactSectionProps {
  companyName?: string;
  supportNote?: string;
}

export default function AboutAndContactSection({
  companyName = 'THREE ANGELS IT SERVICES',
  supportNote,
}: AboutAndContactSectionProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('Course or Learning Question');
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [imgError, setImgError] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMsg = message.trim();

    if (trimmedName.length < 2) {
      setErrorMsg('Please enter your name (at least 2 characters).');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (trimmedMsg.length < 10) {
      setErrorMsg('Please include a brief message (at least 10 characters).');
      return;
    }

    setErrorMsg('');
    setSubmitting(true);
    try {
      await adminDataRepository.submitContactInquiry({
        name: trimmedName,
        email: trimmedEmail,
        topic,
        message: trimmedMsg,
      });
      setSubmitted(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.toLowerCase().includes('quota')) {
        setErrorMsg(
          'Daily free database quota reached on the Spark plan. Free quota resets tomorrow — please try again then.'
        );
      } else {
        setErrorMsg(
          'Unable to reach the inquiry service right now. Please try again in a moment.'
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* ABOUT US */}
      <section id="about" className="border-b border-slate-800/80 bg-[#0B1220] py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-12">
            <div className="flex flex-col justify-center lg:col-span-6">
              <p className="font-mono text-xs font-semibold text-[#06B6D4]">
                09. About {companyName}
              </p>
              <h2
                className="mt-2 font-display text-3xl font-bold tracking-tight text-[#F8FAFC]"
                style={{ textWrap: 'balance' }}
              >
                Practical IT education built on real troubleshooting evidence.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-[#CBD5E1]">
                {companyName} bridges the gap between passive reading and real-world IT operations. Instead of locking knowledge behind paid accounts or generic theory, every visitor can inspect authentic support tickets, trace network faults, run Windows and Linux diagnostics, and download clear reference guides directly in the browser.
              </p>

              <div className="mt-6 grid grid-cols-1 gap-4 border-t border-slate-800 pt-6 sm:grid-cols-2">
                <div className="glass-surface rounded-xl p-4">
                  <Shield className="h-5 w-5 text-[#06B6D4]" />
                  <h3 className="mt-2 font-display text-sm font-semibold text-[#F8FAFC]">
                    Open Access & Privacy-First
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-[#CBD5E1]">
                    Zero individual logins, zero tracking cookies, and safe browser-only progress persistence.
                  </p>
                </div>

                <div className="glass-surface rounded-xl p-4">
                  <Terminal className="h-5 w-5 text-[#F59E0B]" />
                  <h3 className="mt-2 font-display text-sm font-semibold text-[#F8FAFC]">
                    Hands-On Engineering Focus
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-[#CBD5E1]">
                    Every concept links directly to an interactive command lab, packet trace, or diagnostic runbook.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative h-full min-h-[280px] overflow-hidden rounded-2xl border border-slate-800 bg-[#0F1B2E]">
                {!imgError ? (
                  <img
                    src={heroWorkbenchImg}
                    alt={`${companyName} diagnostic workstation and patched network hardware`}
                    referrerPolicy="no-referrer"
                    onError={() => setImgError(true)}
                    className="h-full w-full object-cover opacity-90"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center p-8 text-center text-[#CBD5E1]">
                    {companyName} · Diagnostic Engineering Workbench
                  </div>
                )}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#070D18]/90 via-[#070D18]/45 to-transparent p-5">
                  <p className="text-xs font-medium text-[#CBD5E1]">
                    Built for aspiring IT engineers, helpdesk technicians, and everyday learners.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT US */}
      <section id="contact" className="border-b border-slate-800/80 bg-[#0F1B2E] py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p className="font-mono text-xs font-semibold text-[#F59E0B]">
                10. Get in Touch
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-[#F8FAFC]">
                Contact Us
              </h2>
              <p className="mt-3 text-base leading-relaxed text-[#CBD5E1]">
                Have a question about our free courses, want to suggest a real-life IT ticket scenario, or need guidance on a technical topic? Send your inquiry directly to our engineering review queue.
              </p>

              <div className="mt-6 space-y-3 border-t border-slate-800 pt-6 text-xs leading-relaxed text-slate-400">
                <p>
                  <strong className="text-[#F8FAFC]">Organization:</strong> {companyName}
                </p>
                <p>
                  <strong className="text-[#F8FAFC]">Platform Access:</strong>{' '}
                  {supportNote ||
                    'Open single-page web platform — no individual account needed.'}
                </p>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="glass-surface rounded-2xl p-6 sm:p-8">
                {submitted ? (
                  <div className="space-y-4 py-6 text-center">
                    <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400" />
                    <h3 className="font-display text-xl font-bold text-[#F8FAFC]">
                      Inquiry Submitted & Saved
                    </h3>
                    <p className="mx-auto max-w-md text-sm text-[#CBD5E1]">
                      Thank you, <strong className="text-[#F8FAFC]">{name}</strong>. Your inquiry regarding{' '}
                      <strong className="text-cyan-300">{topic}</strong> has been securely recorded for our team.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSubmitted(false);
                        setName('');
                        setEmail('');
                        setMessage('');
                      }}
                      className="rounded-lg border border-slate-700 bg-[#0B1220] px-4 py-2 text-xs font-semibold text-[#F8FAFC] hover:border-cyan-400 cursor-pointer"
                    >
                      Send Another Inquiry
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} noValidate className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="contact-name" className="block text-xs font-semibold text-[#CBD5E1]">
                          Your Name
                        </label>
                        <input
                          id="contact-name"
                          type="text"
                          maxLength={80}
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Alex Morgan"
                          className="mt-1.5 min-h-[44px] w-full rounded-lg border border-slate-700 bg-[#0B1220] px-3.5 text-sm text-[#F8FAFC] placeholder:text-slate-500 focus:border-[#06B6D4] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label htmlFor="contact-email" className="block text-xs font-semibold text-[#CBD5E1]">
                          Email Address
                        </label>
                        <input
                          id="contact-email"
                          type="email"
                          maxLength={120}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="mt-1.5 min-h-[44px] w-full rounded-lg border border-slate-700 bg-[#0B1220] px-3.5 text-sm text-[#F8FAFC] placeholder:text-slate-500 focus:border-[#06B6D4] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="contact-topic" className="block text-xs font-semibold text-[#CBD5E1]">
                        Topic
                      </label>
                      <select
                        id="contact-topic"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="mt-1.5 min-h-[44px] w-full rounded-lg border border-slate-700 bg-[#0B1220] px-3.5 text-sm text-[#F8FAFC] focus:border-[#06B6D4] focus:outline-none"
                      >
                        <option value="Course or Learning Question">Course or Learning Question</option>
                        <option value="Suggest a Real-Life Ticket">Suggest a Real-Life Ticket</option>
                        <option value="Technical Solutions Inquiry">Technical Solutions Inquiry</option>
                        <option value="Virtual Lab Feedback">Virtual Lab Feedback</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="contact-message" className="block text-xs font-semibold text-[#CBD5E1]">
                        Message
                      </label>
                      <textarea
                        id="contact-message"
                        rows={4}
                        maxLength={1000}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Share your question, IT topic request, or feedback..."
                        className="mt-1.5 w-full rounded-lg border border-slate-700 bg-[#0B1220] px-3.5 py-2.5 text-sm text-[#F8FAFC] placeholder:text-slate-500 focus:border-[#06B6D4] focus:outline-none"
                      />
                    </div>

                    {errorMsg && (
                      <p role="alert" className="text-xs font-medium text-amber-400">
                        {errorMsg}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:opacity-60 cursor-pointer"
                    >
                      <Send className="h-4 w-4" />
                      {submitting ? 'Submitting Inquiry...' : 'Send Message'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
