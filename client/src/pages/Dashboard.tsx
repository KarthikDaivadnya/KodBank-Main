import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, DollarSign, User, CreditCard, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [showBalance, setShowBalance] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const triggerConfetti = () => {
    // Multiple confetti bursts for celebration effect
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: NodeJS.Timeout = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      // Left side
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });

      // Right side
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);
  };

  const handleCheckBalance = async () => {
    try {
      setIsLoadingBalance(true);
      const response = await authAPI.getBalance();

      if (response.success && response.data) {
        setBalance(response.data.balance);
        setShowBalance(true);
        setShowCelebration(true);

        // Trigger confetti animation
        setTimeout(() => {
          triggerConfetti();
        }, 500);

        // Hide celebration after 4 seconds
        setTimeout(() => {
          setShowCelebration(false);
        }, 4000);

        toast.success('Balance retrieved successfully! 🎉');
      } else {
        toast.error(response.message || 'Failed to retrieve balance');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to retrieve balance. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
      </div>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 bg-white/80 backdrop-blur-sm border-b border-white/20 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-800">KodBank</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-gray-600">
                <User className="w-4 h-4 mr-2" />
                <span className="font-medium">{user?.uname}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-600 hover:text-red-600 transition-colors duration-200"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Welcome to your Dashboard, {user?.uname}! 👋
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Manage your KodBank account with ease
          </p>
        </motion.div>

        {/* Account Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-white/20"
        >
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <User className="w-6 h-6 mr-3 text-blue-600" />
            Account Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-500">User ID</label>
                <p className="text-lg font-semibold text-gray-800">{user?.uid}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Username</label>
                <p className="text-lg font-semibold text-gray-800">{user?.uname}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-500">Email</label>
                <p className="text-lg font-semibold text-gray-800">{user?.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Role</label>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 capitalize">
                  {user?.role}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Balance Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20 relative overflow-hidden"
        >
          {/* Celebration Overlay */}
          <AnimatePresence>
            {showCelebration && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-pink-400/20 to-purple-400/20 backdrop-blur-sm flex items-center justify-center z-10"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  transition={{ type: "spring", duration: 0.8 }}
                  className="text-6xl"
                >
                  🎉
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <DollarSign className="w-6 h-6 mr-3 text-green-600" />
            Account Balance
          </h3>

          {!showBalance ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-6">
                Click the button below to check your current account balance
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCheckBalance}
                disabled={isLoadingBalance}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isLoadingBalance ? (
                  <div className="flex items-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Checking Balance...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Check Balance
                  </div>
                )}
              </motion.button>
            </div>
          ) : (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                transition={{ type: "spring", duration: 0.6 }}
                className="text-center py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", duration: 0.8 }}
                  className="mb-6"
                >
                  <p className="text-lg text-gray-600 mb-4">Your current balance is:</p>
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl p-6 inline-block shadow-lg">
                    <p className="text-4xl font-bold mb-2">
                      ₹{balance?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-green-100 text-sm">Available Balance</p>
                  </div>
                </motion.div>
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setShowBalance(false);
                    setBalance(null);
                  }}
                  className="mt-4 bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  Hide Balance
                </motion.button>
              </motion.div>
            </AnimatePresence>
          )}
        </motion.div>
      </main>

      {/* Custom CSS for blob animation */}
      <style>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
