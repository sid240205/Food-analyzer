import "./globals.css";

export const metadata = {
  title: "Zomato Spending Analyzer",
  description: "Analyze your Zomato spending with comprehensive insights",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}