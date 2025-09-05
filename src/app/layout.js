import './globals.css'

export const metadata = {
  title: 'Mastercard Hackathon - Career Tracking Platform',
  description: 'A comprehensive platform for tracking user career progress with admin oversight',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
