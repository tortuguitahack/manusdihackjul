import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  RotateCcw,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Transaction {
  id: number;
  workflowId?: number;
  productId?: string;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed" | "refunded";
  description?: string;
  createdAt: Date;
  stripePaymentIntentId?: string;
}

interface TransactionsTableProps {
  transactions: Transaction[];
  isLoading?: boolean;
}

const statusConfig = {
  pending: {
    icon: Clock,
    color: "bg-yellow-100 text-yellow-800",
    label: "Pending",
  },
  completed: {
    icon: CheckCircle,
    color: "bg-green-100 text-green-800",
    label: "Completed",
  },
  failed: {
    icon: AlertCircle,
    color: "bg-red-100 text-red-800",
    label: "Failed",
  },
  refunded: {
    icon: RotateCcw,
    color: "bg-blue-100 text-blue-800",
    label: "Refunded",
  },
};

export default function TransactionsTable({
  transactions,
  isLoading,
}: TransactionsTableProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
        <Button variant="ghost" size="sm">
          View All
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-200">
              <TableHead className="text-gray-700 font-semibold">Date</TableHead>
              <TableHead className="text-gray-700 font-semibold">
                Description
              </TableHead>
              <TableHead className="text-gray-700 font-semibold">Amount</TableHead>
              <TableHead className="text-gray-700 font-semibold">Status</TableHead>
              <TableHead className="text-gray-700 font-semibold">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                  </div>
                </TableCell>
              </TableRow>
            ) : transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-600">
                  No transactions yet
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => {
                const config = statusConfig[transaction.status];
                const StatusIcon = config.icon;
                const isRefund = transaction.amount < 0;

                return (
                  <TableRow
                    key={transaction.id}
                    className="border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <TableCell className="text-sm text-gray-600">
                      {new Date(transaction.createdAt).toLocaleDateString()} at{" "}
                      {new Date(transaction.createdAt).toLocaleTimeString()}
                    </TableCell>
                    <TableCell className="text-sm font-medium text-gray-900">
                      {transaction.description || `Transaction #${transaction.id}`}
                    </TableCell>
                    <TableCell className="text-sm font-semibold">
                      <span
                        className={
                          isRefund ? "text-red-600" : "text-green-600"
                        }
                      >
                        {isRefund ? "-" : "+"}${Math.abs(transaction.amount).toFixed(2)}{" "}
                        {transaction.currency}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={config.color}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {config.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        Details
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-600 mb-1">Total Completed</p>
            <p className="text-lg font-bold text-green-600">
              $
              {transactions
                .filter((t) => t.status === "completed")
                .reduce((sum, t) => sum + t.amount, 0)
                .toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Pending</p>
            <p className="text-lg font-bold text-yellow-600">
              {transactions.filter((t) => t.status === "pending").length}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Failed</p>
            <p className="text-lg font-bold text-red-600">
              {transactions.filter((t) => t.status === "failed").length}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
