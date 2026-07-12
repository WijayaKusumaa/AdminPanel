import { useState } from "react";
import { CreditCard, ArrowUpRight, DollarSign, Download, ArrowRight, Activity, Check } from "lucide-react";
import { toast } from "sonner";

const INVOICES = [
  { id: "INV-2026-004", date: "Jul 1, 2026", amount: "$1,299.00", status: "Paid", pdf: "invoice_2026_004.pdf" },
  { id: "INV-2026-003", date: "Jun 1, 2026", amount: "$1,299.00", status: "Paid", pdf: "invoice_2026_003.pdf" },
  { id: "INV-2026-002", date: "May 1, 2026", amount: "$1,299.00", status: "Paid", pdf: "invoice_2026_002.pdf" },
  { id: "INV-2026-001", date: "Apr 1, 2026", amount: "$1,299.00", status: "Paid", pdf: "invoice_2026_001.pdf" }
];

export default function BillingView() {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownloadInvoice = (id: string) => {
    setDownloadingId(id);
    toast.loading(`Downloading ${id}...`, { id: "bill-toast" });

    setTimeout(() => {
      toast.success(`${id} saved to device`, { id: "bill-toast" });
      setDownloadingId(null);
    }, 1000);
  };

  const currentQuota = {
    seatsUsed: 10,
    seatsTotal: 50,
    apiUsed: 840203,
    apiTotal: 2000000,
    storageUsed: 22.4, // GB
    storageTotal: 100 // GB
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Upper plan details and credit card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 columns: Plan detail */}
        <div className="md:col-span-2 bg-[#111318] border border-white/[0.06] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wider">
                Active Tier
              </span>
              <span className="text-[12px] text-[#64748B]">Renews Aug 1, 2026</span>
            </div>
            <h2 className="text-[20px] font-bold text-[#F8FAFC] mt-3">Enterprise Plus</h2>
            <p className="text-[12px] text-[#64748B] mt-1.5 leading-relaxed max-w-md">
              Full access to organization units controls, role authorizations custom variables, auditing dashboard metrics, and dedicated system health support.
            </p>
          </div>

          <div className="border-t border-white/[0.04] pt-4 mt-6 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#64748B] uppercase tracking-wider font-semibold block">Monthly Subscription</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-[22px] font-bold text-[#F8FAFC]">$1,299.00</span>
                <span className="text-[11px] text-[#64748B] font-semibold">/ month</span>
              </div>
            </div>
            <button
              onClick={() => toast.info("Contacting corporate representative...", { description: "Our engineering lead Wijaya will handle contract adjustments." })}
              className="h-8 px-3.5 text-[12px] font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors active:scale-95"
            >
              Adjust Plan
            </button>
          </div>
        </div>

        {/* Right column: Card details */}
        <div className="bg-[#111318] border border-white/[0.06] rounded-xl p-5 flex flex-col justify-between relative overflow-hidden group">
          {/* Credit card graphic placeholder */}
          <div className="flex items-start justify-between">
            <CreditCard size={28} className="text-blue-400" />
            <span className="text-[12px] text-[#F8FAFC] font-bold font-mono">VISA</span>
          </div>
          <div>
            <span className="text-[11px] text-[#64748B] font-medium tracking-wider block uppercase">Payment Profile</span>
            <span className="text-[15px] font-bold text-[#F8FAFC] font-mono mt-1 block">•••• •••• •••• 4820</span>
            <div className="flex justify-between items-center text-[11px] text-[#64748B] mt-2 font-medium">
              <span>Cardholder: Oktavia Wulandari</span>
              <span>Expires: 08/29</span>
            </div>
          </div>
          <button
            onClick={() => toast.info("Modifying payment methods...")}
            className="w-full h-8 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] rounded-lg text-[12px] text-[#94A3B8] hover:text-white transition-colors"
          >
            Update Payment Method
          </button>
        </div>
      </div>

      {/* Subscription quotas meters */}
      <div className="bg-[#111318] border border-white/[0.06] rounded-xl p-5">
        <h3 className="text-[14px] font-semibold text-[#F8FAFC] mb-4">Resource Utilization</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Seating meter */}
          <div className="space-y-2">
            <div className="flex justify-between text-[12px]">
              <span className="text-[#94A3B8] font-medium">Organization Seating</span>
              <span className="text-[#64748B] font-mono">{currentQuota.seatsUsed} / {currentQuota.seatsTotal} Seats</span>
            </div>
            <div className="h-2 w-full bg-white/[0.04] rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${(currentQuota.seatsUsed / currentQuota.seatsTotal) * 100}%` }}
              />
            </div>
          </div>

          {/* API meter */}
          <div className="space-y-2">
            <div className="flex justify-between text-[12px]">
              <span className="text-[#94A3B8] font-medium">API Invocations / mo</span>
              <span className="text-[#64748B] font-mono">{currentQuota.apiUsed.toLocaleString()} / {currentQuota.apiTotal.toLocaleString()}</span>
            </div>
            <div className="h-2 w-full bg-white/[0.04] rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${(currentQuota.apiUsed / currentQuota.apiTotal) * 100}%` }}
              />
            </div>
          </div>

          {/* Storage meter */}
          <div className="space-y-2">
            <div className="flex justify-between text-[12px]">
              <span className="text-[#94A3B8] font-medium">System File Vault</span>
              <span className="text-[#64748B] font-mono">{currentQuota.storageUsed} GB / {currentQuota.storageTotal} GB</span>
            </div>
            <div className="h-2 w-full bg-white/[0.04] rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full transition-all duration-300"
                style={{ width: `${(currentQuota.storageUsed / currentQuota.storageTotal) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Invoice list */}
      <div className="bg-[#111318] border border-white/[0.06] rounded-xl p-5">
        <h3 className="text-[14px] font-semibold text-[#F8FAFC] mb-3">Billing History</h3>
        
        {/* Desktop View Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-white/[0.05] text-[#64748B] font-semibold">
                <th className="py-2.5">Statement Reference</th>
                <th className="py-2.5">Date Incurred</th>
                <th className="py-2.5">Amount Charged</th>
                <th className="py-2.5">Status</th>
                <th className="py-2.5 text-right w-[60px]" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02] text-[#94A3B8]">
              {INVOICES.map((inv) => (
                <tr key={inv.id} className="hover:bg-white/[0.008] transition-colors">
                  <td className="py-3 font-semibold text-[#F8FAFC]">{inv.id}</td>
                  <td className="py-3 font-mono text-[12px]">{inv.date}</td>
                  <td className="py-3 font-mono text-[12px]">{inv.amount}</td>
                  <td className="py-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-green-400 border border-green-500/15">
                      <Check size={10} /> Paid
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => handleDownloadInvoice(inv.id)}
                      disabled={downloadingId !== null}
                      className="w-7 h-7 rounded hover:bg-white/[0.04] text-[#64748B] hover:text-[#94A3B8] flex items-center justify-center transition-colors mx-auto"
                    >
                      <Download size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View Cards */}
        <div className="lg:hidden space-y-3">
          {INVOICES.map((inv) => (
            <div
              key={inv.id}
              className="bg-white/[0.01] border border-white/[0.04] rounded-lg p-4 flex items-center justify-between gap-3"
            >
              <div>
                <span className="text-[13px] font-semibold text-[#F8FAFC] block">{inv.id}</span>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-[#64748B]">
                  <span>{inv.date}</span>
                  <span>•</span>
                  <span className="font-mono text-emerald-400 font-semibold">{inv.amount}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-1.5 py-0.2 rounded text-[9.5px] font-semibold bg-emerald-500/10 text-green-400 border border-green-500/15">
                  Paid
                </span>
                <button
                  onClick={() => handleDownloadInvoice(inv.id)}
                  disabled={downloadingId !== null}
                  className="w-8 h-8 bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.06] rounded flex items-center justify-center text-[#94A3B8] transition-colors"
                >
                  <Download size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
