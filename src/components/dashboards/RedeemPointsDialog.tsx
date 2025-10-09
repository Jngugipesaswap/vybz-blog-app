import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface RedeemPointsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPoints: number;
  userId: string;
  onSuccess: () => void;
}

export function RedeemPointsDialog({ open, onOpenChange, currentPoints, userId, onSuccess }: RedeemPointsDialogProps) {
  const [points, setPoints] = useState("");
  const [loading, setLoading] = useState(false);

  const POINTS_TO_CASH_RATE = 100; // 100 points = $1

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const value = parseInt(points);
    if (isNaN(value) || value <= 0) {
      toast.error("Please enter a valid number of points");
      return;
    }

    if (value > currentPoints) {
      toast.error("Insufficient points");
      return;
    }

    if (value < 100) {
      toast.error("Minimum redemption is 100 points");
      return;
    }

    setLoading(true);

    try {
      const cashValue = value / POINTS_TO_CASH_RATE;

      // Get loyalty points record
      const { data: loyaltyData, error: loyaltyFetchError } = await supabase
        .from("loyalty_points")
        .select("id, points, total_spent")
        .eq("user_id", userId)
        .single();

      if (loyaltyFetchError) throw loyaltyFetchError;

      const newPoints = loyaltyData.points - value;
      const newTotalSpent = (loyaltyData.total_spent || 0) + value;

      // Update loyalty points
      const { error: loyaltyUpdateError } = await supabase
        .from("loyalty_points")
        .update({ 
          points: newPoints,
          total_spent: newTotalSpent
        })
        .eq("id", loyaltyData.id);

      if (loyaltyUpdateError) throw loyaltyUpdateError;

      // Create loyalty transaction
      const { error: loyaltyTransError } = await supabase
        .from("loyalty_transactions")
        .insert({
          user_id: userId,
          points: -value,
          transaction_type: "redemption",
          description: `Redeemed ${value} points for $${cashValue.toFixed(2)}`
        });

      if (loyaltyTransError) throw loyaltyTransError;

      // Get wallet
      const { data: wallet, error: walletFetchError } = await supabase
        .from("wallets")
        .select("id, balance")
        .eq("user_id", userId)
        .single();

      if (walletFetchError) throw walletFetchError;

      const newBalance = parseFloat(String(wallet.balance)) + cashValue;

      // Update wallet balance
      const { error: walletUpdateError } = await supabase
        .from("wallets")
        .update({ balance: newBalance })
        .eq("id", wallet.id);

      if (walletUpdateError) throw walletUpdateError;

      // Create wallet transaction
      const { error: walletTransError } = await supabase
        .from("wallet_transactions")
        .insert({
          wallet_id: wallet.id,
          amount: cashValue,
          transaction_type: "deposit",
          status: "completed",
          description: `Points redemption: ${value} points → $${cashValue.toFixed(2)}`
        });

      if (walletTransError) throw walletTransError;

      toast.success(`Successfully redeemed ${value} points for $${cashValue.toFixed(2)}!`);
      setPoints("");
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error redeeming points:", error);
      toast.error("Failed to redeem points");
    } finally {
      setLoading(false);
    }
  };

  const calculateCashValue = () => {
    const value = parseInt(points);
    if (isNaN(value) || value <= 0) return 0;
    return value / POINTS_TO_CASH_RATE;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Redeem Loyalty Points</DialogTitle>
          <DialogDescription>
            Convert your points to cash. Rate: 100 points = $1.00
            <br />
            Available points: {currentPoints}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="points">Points to Redeem</Label>
            <Input
              id="points"
              type="number"
              step="1"
              min="100"
              placeholder="Minimum 100 points"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              required
            />
            {points && parseInt(points) >= 100 && (
              <p className="text-sm text-muted-foreground">
                You will receive: ${calculateCashValue().toFixed(2)}
              </p>
            )}
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
                "Redeem"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}