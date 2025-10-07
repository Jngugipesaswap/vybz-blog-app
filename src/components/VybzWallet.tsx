import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, CreditCard, Ticket, ShoppingBag, History, Plus, Send, Download } from "lucide-react";

const VybzWallet = () => {
  const balance = 15420;
  
  const tickets = [
    {
      id: "1",
      event: "Club Noir Saturday Night",
      date: "Dec 15, 2024",
      qty: 2,
      qrCode: "https://placehold.co/120x120"
    },
    {
      id: "2",
      event: "Kids Carnival & Fun Day",
      date: "Dec 20, 2024",
      qty: 4,
      qrCode: "https://placehold.co/120x120"
    }
  ];

  const transactions = [
    {
      id: "1",
      type: "purchase",
      description: "Event Ticket Purchase",
      amount: -1500,
      date: "Dec 10, 2024"
    },
    {
      id: "2",
      type: "refund",
      description: "Event Cancellation Refund",
      amount: 800,
      date: "Dec 8, 2024"
    },
    {
      id: "3",
      type: "topup",
      description: "Wallet Top-up",
      amount: 5000,
      date: "Dec 5, 2024"
    }
  ];

  const vendorOrders = [
    {
      id: "1",
      vendor: "Nairobi Grill",
      items: "2x Burgers, 2x Drinks",
      amount: 1200,
      status: "delivered",
      date: "Dec 12, 2024"
    },
    {
      id: "2",
      vendor: "Event Merch Store",
      items: "1x T-Shirt",
      amount: 1500,
      status: "pending",
      date: "Dec 13, 2024"
    }
  ];

  return (
    <section id="wallet" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="mb-4 cta-gradient text-white px-6 py-2 text-base">
            <Wallet className="w-4 h-4 mr-2" />
            Your Digital Hub
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Vybz <span className="text-gradient">Wallet</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Manage tickets, payments, and vendor orders all in one secure place
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <Card className="mb-8 shadow-hover overflow-hidden">
            <div className="cta-gradient p-8 text-white">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm opacity-90 mb-2">Available Balance</p>
                  <h3 className="text-4xl font-bold">KSH {balance.toLocaleString()}</h3>
                </div>
                <Wallet className="w-12 h-12 opacity-80" />
              </div>
              
              <div className="flex gap-3">
                <Button size="sm" className="bg-white text-primary hover:bg-white/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Top Up
                </Button>
                <Button size="sm" variant="outline" className="border-white/40 text-white hover:bg-white/20">
                  <Send className="w-4 h-4 mr-2" />
                  Transfer
                </Button>
                <Button size="sm" variant="outline" className="border-white/40 text-white hover:bg-white/20">
                  <Download className="w-4 h-4 mr-2" />
                  Withdraw
                </Button>
              </div>
            </div>
          </Card>

          <Tabs defaultValue="tickets" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="tickets" className="flex items-center gap-2">
                <Ticket className="w-4 h-4" />
                My Tickets
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                Orders
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="w-4 h-4" />
                History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tickets" className="space-y-4">
              {tickets.map((ticket) => (
                <Card key={ticket.id} className="hover-lift shadow-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-lg font-bold mb-2">{ticket.event}</h4>
                        <p className="text-sm text-muted-foreground mb-1">{ticket.date}</p>
                        <Badge variant="outline">{ticket.qty} Ticket{ticket.qty > 1 ? 's' : ''}</Badge>
                      </div>
                      <div className="text-center">
                        <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center mb-2">
                          <img src={ticket.qrCode} alt="QR Code" className="w-20 h-20" />
                        </div>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="orders" className="space-y-4">
              {vendorOrders.map((order) => (
                <Card key={order.id} className="hover-lift shadow-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <ShoppingBag className="w-5 h-5 text-primary" />
                          <h4 className="text-lg font-bold">{order.vendor}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{order.items}</p>
                        <p className="text-xs text-muted-foreground">{order.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-primary mb-2">
                          KSH {order.amount.toLocaleString()}
                        </p>
                        <Badge 
                          variant={order.status === "delivered" ? "default" : "secondary"}
                          className={order.status === "delivered" ? "bg-accent" : ""}
                        >
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              {transactions.map((transaction) => (
                <Card key={transaction.id} className="hover-lift shadow-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          transaction.amount > 0 ? 'bg-accent/20' : 'bg-primary/20'
                        }`}>
                          {transaction.type === 'topup' && <Plus className="w-6 h-6 text-primary" />}
                          {transaction.type === 'purchase' && <CreditCard className="w-6 h-6 text-primary" />}
                          {transaction.type === 'refund' && <Download className="w-6 h-6 text-accent" />}
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">{transaction.description}</h4>
                          <p className="text-xs text-muted-foreground">{transaction.date}</p>
                        </div>
                      </div>
                      <div className={`text-xl font-bold ${
                        transaction.amount > 0 ? 'text-accent' : 'text-foreground'
                      }`}>
                        {transaction.amount > 0 ? '+' : ''}KSH {Math.abs(transaction.amount).toLocaleString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>

          <Card className="mt-8 cta-gradient text-white">
            <CardContent className="p-6 text-center">
              <CreditCard className="w-10 h-10 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Link Your Payment Method</h3>
              <p className="text-sm opacity-90 mb-4">
                Connect M-Pesa, cards, or bank accounts for seamless transactions
              </p>
              <Button className="bg-white text-primary hover:bg-white/90">
                Add Payment Method
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default VybzWallet;