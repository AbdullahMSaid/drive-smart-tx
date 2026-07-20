import { Instagram, Facebook, Phone, Mail, MapPin, Clock } from "lucide-react";
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
              <li className="flex items-start gap-2"><Phone className="h-4 w-4 mt-0.5 text-gold shrink-0" /><span>(—) ——— ————</span></li>
              <li className="flex items-start gap-2"><Mail className="h-4 w-4 mt-0.5 text-gold shrink-0" /><span>hello@—.com</span></li>
              <li className="flex items-start gap-2"><MapPin className="h-4 w-4 mt-0.5 text-gold shrink-0" /><span>Serving the greater —— area, Texas</span></li>
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
              <li>Rental Policy — placeholder</li>
              <li>Privacy Policy — placeholder</li>
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
