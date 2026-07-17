import { Footer } from '@/components/Footer';
import { NavBar } from '@/components/NavBar';

/**
 * Shell for public marketing/docs pages: marketing nav (Features, Quick
 * start, Live demo anchors) + full footer. The authenticated dashboard uses
 * DashboardLayout instead — same design tokens, different chrome.
 */
export function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavBar />
      {children}
      <Footer />
    </>
  );
}
