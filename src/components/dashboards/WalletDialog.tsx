import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface WalletDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "deposit" | "withdraw";
  currentBalance: number;
  userId: string;
  onSuccess: () => void;
}

export function WalletDialog({ open, onOpenChange, type, currentBalance, userId, onSuccess }: WalletDialogProps) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (type === "withdraw" && value > currentBalance) {
      toast.error("Insufficient funds");
      return;
    }

    setLoading(true);

    try {
      // Get current wallet
      const { data: wallet, error: fetchError } = await supabase
        .from("wallets")
        .select("id, balance")
        .eq("user_id", userId)
        .single();

      if (fetchError) throw fetchError;

      const newBalance = type === "deposit" 
        ? parseFloat(String(wallet.balance)) + value
        : parseFloat(String(wallet.balance)) - value;

      // Update wallet balance
      const { error: updateError } = await supabase
        .from("wallets")
        .update({ balance: newBalance })
        .eq("id", wallet.id);

      if (updateError) throw updateError;

      // Create transaction record
      const { error: transactionError } = await supabase
        .from("wallet_transactions")
        .insert({
          wallet_id: wallet.id,
          amount: value,
          transaction_type: type,
          status: "completed",
          description: `${type === "deposit" ? "Deposit" : "Withdrawal"} of $${value.toFixed(2)}`
        });

      if (transactionError) throw transactionError;

      toast.success(`Successfully ${type === "deposit" ? "deposited" : "withdrew"} $${value.toFixed(2)}`);
      setAmount("");
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error(`Error processing ${type}:`, error);
      toast.error(`Failed to ${type} funds`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{type === "deposit" ? "Deposit Funds" : "Withdraw Funds"}</DialogTitle>
          <DialogDescription>
            {type === "deposit" 
              ? "Add funds to your wallet" 
              : `Withdraw from your wallet. Available balance: $${currentBalance.toFixed(2)}`
            }
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (USD)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                type === "deposit" ? "Deposit" : "Withdraw"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}