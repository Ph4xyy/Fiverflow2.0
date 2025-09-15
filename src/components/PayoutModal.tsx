import React, { useState } from 'react';
import { X, DollarSign, AlertCircle, CheckCircle, CreditCard, Ban as Bank } from 'lucide-react';
import { usePayouts } from '../hooks/usePayouts';

interface PayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableEarnings: number;
  onSuccess: () => void;
}

const PayoutModal: React.FC<PayoutModalProps> = ({ 
  isOpen, 
  onClose, 
  availableEarnings, 
  onSuccess 
}) => {
  const { requestPayout } = usePayouts();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const MINIMUM_PAYOUT = 20.00;
  const TRANSFER_FEE = 0.25;

  const validateAmount = (value: string): string | null => {
    const numValue = parseFloat(value);
    
    if (!value || isNaN(numValue)) {
      return 'Please enter a valid amount';
    }
    
    if (numValue < MINIMUM_PAYOUT) {
      return `Minimum payout amount is $${MINIMUM_PAYOUT}`;
    }
    
    if (numValue > availableEarnings) {
      return 'Amount exceeds available earnings';
    }
    
    if (numValue <= TRANSFER_FEE) {
      return 'Amount too small to cover transfer fees';
    }
    
    return null;
  };

  const handleAmountChange = (value: string) => {
    setAmount(value);
    const error = validateAmount(value);
    setErrors(prev => ({ ...prev, amount: error || '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amountError = validateAmount(amount);
    if (amountError) {
      setErrors({ amount: amountError });
      return;
    }

    setLoading(true);
    
    try {
      const success = await requestPayout(parseFloat(amount));
      if (success) {
        onSuccess();
        onClose();
        setAmount('');
        setErrors({});
      }
    } catch (error) {
      console.error('Error requesting payout:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMaxAmount = () => {
    const maxAmount = Math.max(0, availableEarnings);
    setAmount(maxAmount.toFixed(2));
    handleAmountChange(maxAmount.toFixed(2));
  };

  const calculateNetAmount = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return 0;
    return Math.max(0, numAmount - TRANSFER_FEE);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Request Payout</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Available Earnings */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className="text-green-600" size={20} />
              <h3 className="text-sm font-semibold text-green-900">Available Earnings</h3>
            </div>
            <p className="text-2xl font-bold text-green-700">
              ${availableEarnings.toFixed(2)}
            </p>
            <p className="text-sm text-green-600 mt-1">
              Ready for withdrawal
            </p>
          </div>

          {/* Amount Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payout Amount *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="number"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className={`w-full pl-10 pr-20 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.amount ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="0.00"
                min={MINIMUM_PAYOUT}
                max={availableEarnings}
                step="0.01"
                required
              />
              <button
                type="button"
                onClick={handleMaxAmount}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              >
                Max
              </button>
            </div>
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle size={14} className="mr-1" />
                {errors.amount}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Minimum: ${MINIMUM_PAYOUT} • Maximum: ${availableEarnings.toFixed(2)}
            </p>
          </div>

          {/* Fee Breakdown */}
          {amount && !errors.amount && parseFloat(amount) > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Payout Breakdown</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Requested Amount:</span>
                  <span className="font-medium">${parseFloat(amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Transfer Fee:</span>
                  <span className="font-medium">-${TRANSFER_FEE.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-300 pt-2 flex justify-between">
                  <span className="font-medium text-gray-900">You'll Receive:</span>
                  <span className="font-bold text-green-600">${calculateNetAmount().toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Important Notes */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-2">
              <AlertCircle className="text-blue-600 mt-0.5 flex-shrink-0" size={16} />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Important Notes:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Payouts typically take 2-7 business days</li>
                  <li>• Transfer fees are deducted from your payout</li>
                  <li>• You can only have one pending payout at a time</li>
                  <li>• Minimum payout amount: ${MINIMUM_PAYOUT}</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !!errors.amount || !amount}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle size={16} className="mr-2" />
                  Request Payout
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PayoutModal;