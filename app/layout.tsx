import './styles.css';
import { Analytics } from '@vercel/analytics/react';

export const metadata = {
  title: 'Owanbe in Europe',
  description: 'Premium Nigerian Owanbe experiences across Europe.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
