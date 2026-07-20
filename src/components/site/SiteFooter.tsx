import { Instagram, Facebook, Phone, Mail, MapPin, Clock } from "lucide-react";
import { Link } from "@tanstack/react-router";
import logoAsset from "@/assets/royalty-luxury-logo.png.asset.json";
import { RentalPolicyDialog } from "./RentalPolicyDialog";


export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container-x py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-3">
              <img
                src={logoAsset.url}
                alt="Royalty Luxury Transportation Services"
                className="h-14 w-auto"
                width={200}
                height={200}
              />
            </div>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              Texas economy car and premium SUV rentals for everyday drivers and special occasions.
            </p>
            <div className="mt-5 flex gap-2">
              <a href="#" aria-label="Instagram" className="grid h-9 w-9 place-items-center rounded-md border border-border text-muted-foreground hover:text-gold hover:border-gold">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" aria-label="Facebook" className="grid h-9 w-9 place-items-center rounded-md border border-border text-muted-foreground hover:text-gold hover:border-gold">
                <Facebook className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-foreground">Contact</h4>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Phone className="h-4 w-4 mt-0.5 text-gold shrink-0" />
                <a href="tel:+16143591370" className="hover:text-gold transition-colors">(614) 359-1370</a>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 mt-0.5 text-gold shrink-0" />
                <a href="mailto:royaltylux8@gmail.com" className="hover:text-gold transition-colors break-all">royaltylux8@gmail.com</a>
              </li>
              <li className="flex items-start gap-2"><MapPin className="h-4 w-4 mt-0.5 text-gold shrink-0" /><span>Serving the greater Dallas area, Texas</span></li>
              <li className="flex items-start gap-2"><Clock className="h-4 w-4 mt-0.5 text-gold shrink-0" /><span>Mon–Sat · Hours available on request</span></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-foreground">Explore</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>Economy Vehicles</li>
              <li>Premium SUVs</li>
              <li>Promotions</li>
              <li>FAQ</li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-foreground">Policies</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>
                <RentalPolicyDialog
                  trigger={
                    <button className="text-left hover:text-gold transition-colors">
                      Rental Agreement
                    </button>
                  }
                />
              </li>
              <li>
                <Link to="/privacy" className="hover:text-gold transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>Insurance information required at pickup</li>
            </ul>
          </div>

        </div>

        <div className="mt-10 border-t border-border pt-6 text-xs text-muted-foreground leading-relaxed">
          Vehicle availability, eligibility, pricing, deposits, insurance requirements, and final rental terms are
          subject to review and confirmation. Submitting an inquiry does not create a confirmed reservation.
        </div>
        <div className="mt-4 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Royalty Luxury Transportation Services. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
