import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg cta-gradient flex items-center justify-center">
                <span className="text-white font-bold text-lg">V</span>
              </div>
              <span className="text-xl font-bold">The Vybz Circle</span>
            </div>
            <p className="text-background/80 text-sm leading-relaxed">
              Discover, plan, and attend the best events in Kenya. From nightlife to family fun, we're your circle to everything happening in the city.
            </p>
            <div className="flex space-x-3">
              <Button 
                size="icon" 
                variant="ghost" 
                className="hover:bg-primary/20 text-background hover:text-primary"
                asChild
              >
                <a href="https://facebook.com/vybzcircle" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <Facebook className="w-4 h-4" />
                </a>
              </Button>
              <Button 
                size="icon" 
                variant="ghost" 
                className="hover:bg-primary/20 text-background hover:text-primary"
                asChild
              >
                <a href="https://twitter.com/vybzcircle" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                  <Twitter className="w-4 h-4" />
                </a>
              </Button>
              <Button 
                size="icon" 
                variant="ghost" 
                className="hover:bg-primary/20 text-background hover:text-primary"
                asChild
              >
                <a href="https://instagram.com/vybzcircle" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <Instagram className="w-4 h-4" />
                </a>
              </Button>
              <Button 
                size="icon" 
                variant="ghost" 
                className="hover:bg-primary/20 text-background hover:text-primary"
                asChild
              >
                <a href="https://linkedin.com/company/vybzcircle" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                  <Linkedin className="w-4 h-4" />
                </a>
              </Button>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-background/80 hover:text-primary transition-colors">Events</a></li>
              <li><a href="#" className="text-background/80 hover:text-primary transition-colors">Venues</a></li>
              <li><a href="#" className="text-background/80 hover:text-primary transition-colors">Blog</a></li>
              <li><a href="#" className="text-background/80 hover:text-primary transition-colors">About Us</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Features</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-background/80 hover:text-primary transition-colors">Vybz Wallet</a></li>
              <li><a href="#" className="text-background/80 hover:text-primary transition-colors">Loyalty Program</a></li>
              <li><a href="#" className="text-background/80 hover:text-primary transition-colors">AI Planner</a></li>
              <li><a href="#" className="text-background/80 hover:text-primary transition-colors">Marketplace</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Newsletter</h3>
            <p className="text-background/80 text-sm mb-4">
              Stay updated with the latest events and exclusive offers.
            </p>
            <div className="flex gap-2">
              <Input 
                type="email" 
                placeholder="Enter your email" 
                className="bg-background/10 border-background/20 text-background placeholder:text-background/50"
              />
              <Button className="btn-gradient text-white">Subscribe</Button>
            </div>
            <div className="mt-6 space-y-2">
              <div className="flex items-center text-sm text-background/80">
                <Mail className="w-4 h-4 mr-2" />
                <span>info@vybzcircle.com</span>
              </div>
              <div className="flex items-center text-sm text-background/80">
                <Phone className="w-4 h-4 mr-2" />
                <span>+254 700 123 456</span>
              </div>
              <div className="flex items-center text-sm text-background/80">
                <MapPin className="w-4 h-4 mr-2" />
                <span>Nairobi, Kenya</span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-background/20" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-background/60 text-sm">
            © 2024 The Vybz Circle. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-background/60 hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="text-background/60 hover:text-primary transition-colors">Terms of Service</a>
            <a href="#" className="text-background/60 hover:text-primary transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;