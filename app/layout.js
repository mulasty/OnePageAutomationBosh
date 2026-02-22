import "./globals.css";

export const metadata = {
  title: "Bosch AI Automation One Page",
  description: "Cinematic sales automation presentation for Bosch Service",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
