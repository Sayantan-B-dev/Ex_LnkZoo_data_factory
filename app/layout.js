import './globals.css';

export const metadata = {
  title: 'LnkZoo',
  description: 'Categorized link manager with AI-powered topic generation',
};

export const viewport = 'width=device-width, initial-scale=1';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
