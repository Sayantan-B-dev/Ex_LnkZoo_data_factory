import './globals.css';

export const metadata = {
  title: 'LnkZoo Data Factory',
  description: 'Link data preparation & AI enrichment pipeline for LnkZoo',
};

export const viewport = 'width=device-width, initial-scale=1';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
