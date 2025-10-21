import React from 'react';
import { Link } from "react-router-dom";

            // <Link to="/legal/cookies" className="hover:text-slate-800">Cookies</Link>
            // <Link to="/legal/disclaimer" className="hover:text-slate-800">Disclaimer</Link>
            // <Link to="/legal/copyright" className="hover:text-slate-800">Copyright &amp; IP</Link>
            // <Link to="/legal/contact" className="hover:text-slate-800">Contact</Link>

export const Footer: React.FC = () => {
  return (
    <footer className="bg-corporate text-corporate-foreground mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center space-y-4">
          <p className="text-sm">
            <Link to="/legal/copyright" className="hover:text-primary transition-colors">&copy; 2024 QuotientOne. All rights reserved.</Link>
            <Link to="/legal/copyright" className="hover:text-primary transition-colors"> || support@quotientone.cloud</Link>

          </p>
          <div className="flex justify-center space-x-6 text-sm">
            {/* <a 
              href="https://privacypolicy-quotient-one.carrd.co/" 
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              Privacy Policy
            </a> */}
            <Link to="/legal/privacy" className="hover:text-primary transition-colors">Privacy</Link>

            {/* <a 
              href="https://privacypolicy-quotient-one.carrd.co/" 
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              Terms of Service
            </a> */}
            <Link to="/legal/terms" className="hover:text-primary transition-colors">Terms</Link>
            <Link to="/legal/refund" className="hover:text-primary transition-colors">Refunds</Link>
            <Link to="/legal/disclaimer" className="hover:text-primary transition-colors">Disclaimer</Link>


          </div>
            <div className="text-center space-y-4">
          <p className="text-sm">            <a 
              href="https://quotient-one.web.app/" 
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              QuotientOne |
            </a>
            <a 
              href="https://www.linkedin.com/company/quotient-one/" 
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
             | Linkedin |
            </a>
            <a 
              href="https://www.instagram.com/quotient_one/" 
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
               | Instagram |
            </a>
            <a 
              href="https://x.com/Quotient_One"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
               | Twitter - X |
            </a>
                      <Link to="/legal/contact" className="hover:text-primary transition-colors">| Contact</Link>

            </p>
            </div> 
        </div>
      </div>
    </footer>
  );
};