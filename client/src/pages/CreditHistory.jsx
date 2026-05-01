import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, ArrowUpRight, ArrowDownLeft, RotateCcw, Gift } from 'lucide-react';
import api from '../api/axios';
import Loader from '../components/common/Loader';
import { formatDate } from '../utils/helpers';
import useAuth from '../hooks/useAuth';

const TYPE_CONFIG = {
  earn: {
    icon: <ArrowUpRight size={14} />,
    color: 'text-green-600 bg-green-50 border-green-100',
    sign: '+',
    label: 'Earned',
  },
  spend: {
    icon: <ArrowDownLeft size={14} />,
    color: 'text-red-500 bg-red-50 border-red-100',
    sign: '-',
    label: 'Spent',
  },
  refund: {
    icon: <RotateCcw size={14} />,
    color: 'text-blue-500 bg-blue-50 border-blue-100',
    sign: '+',
    label: 'Refund',
  },
  bonus: {
    icon: <Gift size={14} />,
    color: 'text-purple-500 bg-purple-50 border-purple-100',
    sign: '+',
    label: 'Bonus',
  },
  penalty: {
    icon: <ArrowDownLeft size={14} />,
    color: 'text-orange-500 bg-orange-50 border-orange-100',
    sign: '-',
    label: 'Penalty',
  },
};

const CreditHistory = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [historyRes, balanceRes] = await Promise.all([
          api.get(`/credits/history?page=${page}&limit=15`),
          api.get('/credits/balance'),
        ]);
        setTransactions(historyRes.data.data.transactions);
        setPagination(historyRes.data.data.pagination);
        setBalance(balanceRes.data.data.credits);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [page]);

  // Summary stats from transactions
  const totalEarned = transactions
    .filter(t => t.type === 'earn' || t.type === 'bonus' || t.type === 'refund')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalSpent = transactions
    .filter(t => t.type === 'spend' || t.type === 'penalty')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Credit History
        </h1>
        <p className="text-gray-500 mt-1">Track all your credit transactions</p>
      </div>

      {/* Balance + Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          {
            label: 'Current Balance',
            value: balance ?? user.credits,
            icon: '⚡',
            color: 'bg-indigo-600 text-white',
            textColor: 'text-white',
            subColor: 'text-indigo-200',
          },
          {
            label: 'Total Earned',
            value: totalEarned,
            icon: '📈',
            color: 'bg-white border border-gray-100',
            textColor: 'text-green-600',
            subColor: 'text-gray-400',
          },
          {
            label: 'Total Spent',
            value: totalSpent,
            icon: '📉',
            color: 'bg-white border border-gray-100',
            textColor: 'text-red-500',
            subColor: 'text-gray-400',
          },
        ].map(({ label, value, icon, color, textColor, subColor }) => (
          <div key={label} className={`rounded-2xl p-5 shadow-sm ${color}`}>
            <p className={`text-xs font-medium mb-2 ${subColor}`}>{icon} {label}</p>
            <p className={`text-2xl font-black ${textColor}`}>{value}</p>
            <p className={`text-xs mt-0.5 ${subColor}`}>credits</p>
          </div>
        ))}
      </div>

      {/* Transaction List */}
      {loading ? <Loader /> : transactions.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
          <Zap size={40} className="text-gray-200 mx-auto mb-4" />
          <p className="font-semibold text-gray-600 mb-1">No transactions yet</p>
          <p className="text-sm text-gray-400 mb-4">
            Start swapping skills to earn and spend credits
          </p>
          <Link to="/skills"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors">
            Browse Skills
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            {transactions.map((txn, idx) => {
              const cfg = TYPE_CONFIG[txn.type] || TYPE_CONFIG.earn;
              const isPositive = txn.amount > 0;

              return (
                <div key={txn._id}
                  className={`flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors ${
                    idx !== transactions.length - 1 ? 'border-b border-gray-50' : ''
                  }`}>

                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border shrink-0 ${cfg.color}`}>
                    {cfg.icon}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {txn.description}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${cfg.color}`}>
                        {cfg.label}
                      </span>
                      {txn.relatedUser && (
                        <span className="text-xs text-gray-400">
                          with {txn.relatedUser?.name || 'User'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDate(txn.createdAt)}
                    </p>
                  </div>

                  {/* Amount + Balance */}
                  <div className="text-right shrink-0">
                    <p className={`text-lg font-black ${
                      isPositive ? 'text-green-600' : 'text-red-500'
                    }`}>
                      {isPositive ? '+' : ''}{txn.amount}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      bal: {txn.balanceAfter}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-5 py-2.5 text-sm border border-gray-200 rounded-xl disabled:opacity-40 hover:border-indigo-300 hover:text-indigo-600 font-medium transition-all">
                ← Previous
              </button>
              <span className="text-sm text-gray-500">
                {page} / {pagination.totalPages}
              </span>
              <button
                disabled={page === pagination.totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-5 py-2.5 text-sm border border-gray-200 rounded-xl disabled:opacity-40 hover:border-indigo-300 hover:text-indigo-600 font-medium transition-all">
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CreditHistory;