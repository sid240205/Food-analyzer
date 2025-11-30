# Food-Analyzer

A powerful dashboard to analyze your Zomato food ordering habits. Track your spending, view top restaurants, and get insights into your food journey.

## Features

- **Dashboard Overview**: Get a quick summary of your total spent, total orders, and average order value.
- **Spending Analytics**: Interactive charts showing your monthly spending trends.
- **Export Data**: Export your monthly spending data to CSV for further analysis.
- **Top Restaurants**: Visualize which restaurants you order from the most.
- **Transaction History**: A dedicated section to view your complete order history with details.
- **Gmail Sync**: Automatically sync your orders by scanning your Gmail for Zomato receipts.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database**: MongoDB
- **Charts**: Recharts

## Getting Started

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd zomato-analyzer
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory and add your MongoDB connection string and any other necessary API keys.

4.  **Run the development server**
    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `app/dashboard`: Main dashboard view.
- `app/transactions`: Full list of transactions.
- `app/api`: API routes for fetching orders, syncing emails, and analytics.
- `utils`: Utility functions and database connection logic.

## Recent Updates

- **UI Cleanup**: Simplified the dashboard for a cleaner look.
- **Export Feature**: Added ability to export monthly spending data.
- **Transactions Page**: Added a dedicated page for browsing all historical transactions.
