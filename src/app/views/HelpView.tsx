import { useState } from "react";
import { HelpCircle, ChevronDown, MessageSquare, Send, Mail, PhoneCall } from "lucide-react";
import { toast } from "sonner";

interface FAQItem {
  q: string;
  a: string;
}

const FAQS: FAQItem[] = [
  {
    q: "How do I configure custom permission overrides?",
    a: "Select any user in the 'Users' console tab, and the right contextual Permission Drawer will load. Under the 'Permissions Profile' matrix, toggle individual scopes (like Write, Security, API Access) on or off. Click 'Apply Changes' to activate. These customizations take priority over inherited system roles."
  },
  {
    q: "How do I provision developer tokens?",
    a: "Navigate to the 'API Keys' tab and click 'Generate API Key'. Input a descriptive identifier, select an expiry schedule (30 Days, 1 Year, or Indefinite), and check the specific scope permissions required. Once created, copy the token immediately; for safety parameters, the key cannot be shown again."
  },
  {
    q: "Can I manage multi-factor authentication (MFA) mandates?",
    a: "Under the 'Settings' view, check 'Console Security Guidelines'. You can toggle the 'Mandatory MFA Enrollment' parameter. When enabled, any operators without active MFA credentials will be restricted to read-only views until they register their authenticator apps."
  },
  {
    q: "What constitutes a 'Critical' security risk score in audit logs?",
    a: "Critical prioritizations are flagged automatically when multiple failed login attempts occur from foreign IP blocks, when API keys are generated from unverified devices, or when admin role assignments are modified without a dual-authorization certificate."
  }
];

export default function HelpView() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [subject, setSubject] = useState("");
  const [msg, setMsg] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !msg) {
      toast.error("Please fill in the ticket subject and description.");
      return;
    }
    setSending(true);
    toast.loading("Dispatching ticket to enterprise support queue...", { id: "ticket-toast" });

    setTimeout(() => {
      toast.success("Support ticket created (ID: WK-9483)", {
        id: "ticket-toast",
        description: "An engineer will review your request and correspond shortly."
      });
      setSending(false);
      setSubject("");
      setMsg("");
    }, 1200);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
      {/* Left 8 columns: FAQ accordions */}
      <div className="lg:col-span-7 space-y-4">
        <div className="flex items-center gap-2 mb-2 bg-white/[0.01] border border-white/[0.04] p-3 rounded-lg">
          <HelpCircle size={15} className="text-blue-400 shrink-0" />
          <h3 className="text-[14px] font-semibold text-[#F8FAFC]">Frequently Asked Questions</h3>
        </div>

        <div className="space-y-2.5">
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="bg-[#111318] border border-white/[0.06] rounded-xl overflow-hidden transition-all duration-150"
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full px-5 py-4 flex items-center justify-between hover:bg-white/[0.01] transition-colors text-left"
                >
                  <span className="text-[13px] font-semibold text-[#F8FAFC] pr-4">{faq.q}</span>
                  <ChevronDown
                    size={14}
                    className={`text-[#64748B] shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 text-[12px] text-[#94A3B8] leading-relaxed border-t border-white/[0.02] pt-3.5 bg-white/[0.005]">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right 5 columns: Submit support ticket */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-[#111318] border border-white/[0.06] rounded-xl p-5 space-y-4">
          <h3 className="text-[14px] font-semibold text-[#F8FAFC] flex items-center gap-2 border-b border-white/[0.04] pb-3">
            <MessageSquare size={15} className="text-emerald-400" />
            <span>Create Support Incident</span>
          </h3>

          <form onSubmit={handleSubmitTicket} className="space-y-3.5">
            <div className="space-y-1">
              <label htmlFor="ticketSubject" className="text-[11px] uppercase tracking-wider font-semibold text-[#64748B]">Ticket Subject</label>
              <input
                id="ticketSubject"
                type="text"
                required
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="e.g. Ingest webhook routing delays"
                className="w-full h-9 bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 text-[13px] text-[#F8FAFC] focus:outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/30"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="ticketDetails" className="text-[11px] uppercase tracking-wider font-semibold text-[#64748B]">Issue Description</label>
              <textarea
                id="ticketDetails"
                required
                rows={4}
                value={msg}
                onChange={e => setMsg(e.target.value)}
                placeholder="Describe your issue in detail..."
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg p-3 text-[13px] text-[#F8FAFC] focus:outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/30 resize-none font-sans leading-normal"
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full h-9 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-[12px] font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
            >
              <Send size={12} />
              <span>{sending ? "Dispatching..." : "Submit Incident"}</span>
            </button>
          </form>
        </div>

        {/* Contact info widget */}
        <div className="bg-[#111318] border border-white/[0.06] rounded-xl p-5 text-[12px] space-y-3">
          <h4 className="font-semibold text-[#F8FAFC]">Direct Engineering Support</h4>
          <div className="flex items-center gap-2 text-[#94A3B8]">
            <Mail size={13} className="text-blue-400" />
            <span>ops@wijayakusuma.com</span>
          </div>
          <div className="flex items-center gap-2 text-[#94A3B8]">
            <PhoneCall size={13} className="text-emerald-400" />
            <span>+62 (21) 500-ADMIN (Emergency SLA)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
