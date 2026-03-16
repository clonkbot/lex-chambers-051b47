import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface FinancialViewProps {
  onCaseSelect: (caseId: Id<"cases">) => void;
}

export function FinancialView({ onCaseSelect }: FinancialViewProps) {
  const financialSummary = useQuery(api.payments.getFinancialSummary);
  const [showAddPayment, setShowAddPayment] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl text-white">Finance</h1>
          <p className="text-white/40 text-sm">Track payments and fees</p>
        </div>
        <button
          onClick={() => setShowAddPayment(true)}
          className="bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white px-4 py-2.5 font-serif text-sm tracking-wider transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Record Payment
        </button>
      </div>

      {/* Summary Cards */}
      {financialSummary ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
            <div className="bg-[#12121a] border border-amber-900/30 p-4 md:p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-900/30 border border-blue-600/30 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-white/40 text-xs uppercase tracking-wider">Total Fees Agreed</p>
                  <p className="text-blue-400 font-serif text-lg md:text-xl truncate">
                    {formatCurrency(financialSummary.totalAgreedFees)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#12121a] border border-amber-900/30 p-4 md:p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-900/30 border border-emerald-600/30 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-white/40 text-xs uppercase tracking-wider">Total Received</p>
                  <p className="text-emerald-400 font-serif text-lg md:text-xl truncate">
                    {formatCurrency(financialSummary.totalReceived)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#12121a] border border-amber-900/30 p-4 md:p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-900/30 border border-amber-600/30 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-white/40 text-xs uppercase tracking-wider">Outstanding</p>
                  <p className="text-amber-400 font-serif text-lg md:text-xl truncate">
                    {formatCurrency(financialSummary.outstanding)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-[#12121a] border border-amber-900/30 p-4 md:p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/60 text-sm">Collection Progress</span>
              <span className="text-amber-500 text-sm">
                {financialSummary.totalAgreedFees > 0
                  ? Math.round((financialSummary.totalReceived / financialSummary.totalAgreedFees) * 100)
                  : 0}%
              </span>
            </div>
            <div className="h-3 bg-[#0a0a0f] border border-amber-900/30">
              <div
                className="h-full bg-gradient-to-r from-amber-700 to-amber-500"
                style={{
                  width: `${
                    financialSummary.totalAgreedFees > 0
                      ? Math.min((financialSummary.totalReceived / financialSummary.totalAgreedFees) * 100, 100)
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          {/* Case-wise Summary */}
          <div className="bg-[#12121a] border border-amber-900/30 p-4 md:p-6">
            <h2 className="font-serif text-lg text-white mb-4">Case-wise Summary</h2>

            {financialSummary.caseWise.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-10 h-10 text-amber-500/20 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-white/40 text-sm">No financial records yet</p>
              </div>
            ) : (
              <div className="space-y-2 overflow-x-auto">
                <div className="min-w-[500px]">
                  <div className="grid grid-cols-5 gap-4 text-xs text-amber-500/60 uppercase tracking-wider pb-2 border-b border-amber-900/30">
                    <span className="col-span-2">Case</span>
                    <span className="text-right">Agreed</span>
                    <span className="text-right">Received</span>
                    <span className="text-right">Outstanding</span>
                  </div>
                  {financialSummary.caseWise.map((item: { caseId: Id<"cases">; title: string; clientName: string; agreedFee: number; paid: number; outstanding: number }) => (
                    <button
                      key={item.caseId}
                      onClick={() => onCaseSelect(item.caseId)}
                      className="w-full grid grid-cols-5 gap-4 py-3 border-b border-amber-900/20 hover:bg-white/5 transition-colors text-left"
                    >
                      <div className="col-span-2 min-w-0">
                        <p className="text-white text-sm truncate">{item.title}</p>
                        <p className="text-white/40 text-xs truncate">{item.clientName}</p>
                      </div>
                      <span className="text-white/60 text-sm text-right">
                        {formatCurrency(item.agreedFee)}
                      </span>
                      <span className="text-emerald-400/80 text-sm text-right">
                        {formatCurrency(item.paid)}
                      </span>
                      <span className={`text-sm text-right ${item.outstanding > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                        {formatCurrency(item.outstanding)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="text-white/40 text-center py-12">Loading financial data...</div>
      )}

      {/* Add Payment Modal */}
      {showAddPayment && (
        <AddPaymentModal onClose={() => setShowAddPayment(false)} />
      )}
    </div>
  );
}

function AddPaymentModal({ onClose }: { onClose: () => void }) {
  const cases = useQuery(api.cases.list, {});
  const createPayment = useMutation(api.payments.create);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    caseId: "",
    amount: "",
    description: "",
    paymentDate: new Date().toISOString().split("T")[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.caseId || !formData.amount) return;

    setIsLoading(true);
    try {
      await createPayment({
        caseId: formData.caseId as Id<"cases">,
        amount: parseFloat(formData.amount),
        description: formData.description || undefined,
        paymentDate: new Date(formData.paymentDate).getTime(),
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#12121a] border border-amber-900/30 w-full max-w-lg">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-amber-900/30">
          <h2 className="font-serif text-xl text-white">Record Payment</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white p-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4">
          <div>
            <label className="block text-amber-500/70 text-xs uppercase tracking-wider mb-2">
              Case *
            </label>
            <select
              value={formData.caseId}
              onChange={(e) => setFormData({ ...formData, caseId: e.target.value })}
              className="w-full bg-[#0a0a0f] border border-amber-900/40 px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-600/60"
              required
            >
              <option value="">Select a case</option>
              {cases?.map((c: { _id: string; caseNumber: string; clientName: string }) => (
                <option key={c._id} value={c._id}>
                  {c.caseNumber} - {c.clientName}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-amber-500/70 text-xs uppercase tracking-wider mb-2">
                Amount (₹) *
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full bg-[#0a0a0f] border border-amber-900/40 px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-600/60"
                placeholder="0"
                required
              />
            </div>
            <div>
              <label className="block text-amber-500/70 text-xs uppercase tracking-wider mb-2">
                Payment Date *
              </label>
              <input
                type="date"
                value={formData.paymentDate}
                onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                className="w-full bg-[#0a0a0f] border border-amber-900/40 px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-600/60"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-amber-500/70 text-xs uppercase tracking-wider mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-[#0a0a0f] border border-amber-900/40 px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-600/60 h-20 resize-none"
              placeholder="e.g., Retainer fee, Hearing appearance..."
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-6 py-2.5 border border-amber-900/40 text-white/60 hover:text-white hover:border-amber-600/50 text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 sm:flex-none bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white px-6 py-2.5 text-sm transition-all disabled:opacity-50"
            >
              {isLoading ? "Recording..." : "Record Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
