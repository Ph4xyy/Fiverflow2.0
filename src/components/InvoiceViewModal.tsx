import React, { useState } from "react";
import { X, Download } from "lucide-react";
import { useInvoicePayments } from "../hooks/useInvoicePayments";
import { generateInvoicePdf } from "../utils/invoicePdf";
import { formatMoney, formatDate } from "../utils/format";

interface InvoiceViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: any; // Type complet de facture avec client et items
}

const InvoiceViewModal: React.FC<InvoiceViewModalProps> = ({ isOpen, onClose, invoice }) => {
  const [downloadLoading, setDownloadLoading] = useState(false);
  
  // Charger les paiements pour cette facture
  const { 
    payments, 
    calculateTotalPaid, 
    getPaymentStatus 
  } = useInvoicePayments(invoice?.id);

  const invoiceTotal = invoice?.total || 0;
  const totalPaid = calculateTotalPaid();
  const paymentStatus = getPaymentStatus(invoiceTotal);

  if (!isOpen || !invoice) return null;

  const handleDownload = async () => {
    if (!invoice) return;
    
    try {
      setDownloadLoading(true);
      await generateInvoicePdf(invoice);
    } catch (error) {
      console.error("Error downloading invoice:", error);
    } finally {
      setDownloadLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "bg-gray-100 text-gray-800";
      case "sent": return "bg-blue-100 text-blue-800";
      case "paid": return "bg-green-100 text-green-800";
      case "overdue": return "bg-red-100 text-red-800";
      case "canceled": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "draft": return "Brouillon";
      case "sent": return "Envoyée";
      case "paid": return "Payée";
      case "overdue": return "En retard";
      case "canceled": return "Annulée";
      default: return status;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Facture {invoice.number}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {formatDate(invoice.issue_date)}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
              {getStatusText(invoice.status)}
            </span>
            <button
              onClick={handleDownload}
              disabled={downloadLoading}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              title="Télécharger PDF"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Invoice Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Informations facture
              </h3>
              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <p><span className="font-medium">Numéro:</span> {invoice.number}</p>
                <p><span className="font-medium">Date d'émission:</span> {formatDate(invoice.issue_date)}</p>
                <p><span className="font-medium">Date d'échéance:</span> {formatDate(invoice.due_date)}</p>
                <p><span className="font-medium">Statut:</span> {getStatusText(invoice.status)}</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Client
              </h3>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p className="font-medium">{invoice.clients?.name}</p>
                {invoice.clients?.platform && (
                  <p className="text-xs">Plateforme: {invoice.clients.platform}</p>
                )}
              </div>
            </div>
          </div>

          {/* Items */}
          {invoice.items && invoice.items.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Articles
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Qté
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Prix unitaire
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {invoice.items.map((item: any, index: number) => (
                      <tr key={index}>
                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">
                          {item.description}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white text-right">
                          {item.quantity}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white text-right">
                          {formatMoney(item.unit_price, invoice.currency || 'USD')}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-white text-right">
                          {formatMoney(item.line_total, invoice.currency || 'USD')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Totals */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Sous-total:</span>
                  <span className="text-gray-900 dark:text-white">
                    {formatMoney(invoice.subtotal || 0, invoice.currency || 'USD')}
                  </span>
                </div>
                {invoice.discount && invoice.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Remise:</span>
                    <span className="text-gray-900 dark:text-white">
                      -{formatMoney(invoice.discount, invoice.currency || 'USD')}
                    </span>
                  </div>
                )}
                {invoice.tax_rate && invoice.tax_rate > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      TVA ({invoice.tax_rate}%):
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {formatMoney((invoice.subtotal || 0) * (invoice.tax_rate / 100), invoice.currency || 'USD')}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-semibold border-t border-gray-200 dark:border-gray-700 pt-2">
                  <span className="text-gray-900 dark:text-white">Total:</span>
                  <span className="text-gray-900 dark:text-white">
                    {formatMoney(invoice.total || 0, invoice.currency || 'USD')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Status */}
          {payments && payments.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Paiements
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Total facturé:</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatMoney(invoiceTotal, invoice.currency || 'USD')}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Total payé:</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatMoney(totalPaid, invoice.currency || 'USD')}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Solde restant:</span>
                    <p className={`font-medium ${paymentStatus.remaining > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatMoney(paymentStatus.remaining, invoice.currency || 'USD')}
                    </p>
                  </div>
                </div>
                
                {payments.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Historique des paiements:
                    </h4>
                    <div className="space-y-1">
                      {payments.map((payment: any) => (
                        <div key={payment.id} className="flex justify-between text-xs">
                          <span className="text-gray-600 dark:text-gray-400">
                            {formatDate(payment.paid_at)} - {payment.method || 'Non spécifié'}
                          </span>
                          <span className="text-gray-900 dark:text-white">
                            {formatMoney(payment.amount, invoice.currency || 'USD')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {invoice.notes && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Notes
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                {invoice.notes}
              </p>
            </div>
          )}

          {/* Terms */}
          {invoice.terms && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Conditions
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                {invoice.terms}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceViewModal;
