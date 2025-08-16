import "./globals.css"

export const metadata = {
  title: 'Department Portal | NIT Delhi',
  description: '',
  icons: {
    icon: '/logo.svg',
  },
};


import { Toaster } from 'sonner'
import SessionProviderWrapper from '@/components/webComponents/SessionProviderWrapper';

export default function RootLayout({
  children,
}) {
  return (
    <html lang="en">
      <head>
      </head>
      <body>
        <Toaster richColors position="top-right" closeButton />
        <SessionProviderWrapper>
          {children}
        </SessionProviderWrapper>
      </body>
    </html>
  );
}