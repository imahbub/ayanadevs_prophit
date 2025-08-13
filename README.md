# Prophit - Polymarket Movement Tracker

A real-time web application that tracks significant movements in Polymarket prediction markets and connects them to news events. Built with Laravel backend and React frontend.

## 🎯 Overview

Prophit monitors Polymarket prediction markets for significant price movements (1%+ change in 24 hours) and provides a clean, functional interface for understanding market dynamics. The application fetches real-time data from Polymarket's API and stores it efficiently for analysis and visualization.

## ✨ Features

### 📊 Real-time Market Monitoring
- **Live market activity** with real-time updates
- **Significant movement detection** (configurable threshold)
- **Price history tracking** with interactive charts
- **Volume and probability monitoring**

### 🔍 Search & Filtering
- **Keyword search** across market questions and categories
- **Live market activity filtering**
- **Movement history search**
- **Category-based filtering**

### 📈 Data Visualization
- **Interactive price charts** with Chart.js
- **Movement overview charts**
- **Grid and list view modes**
- **Responsive design** for all devices

### 🎨 User Interface
- **Modern, clean design** with Tailwind CSS
- **Collapsible mobile navigation**
- **Real-time sync status**
- **Loading states and animations**

## 🏗️ Architecture

### Backend (Laravel 12.3.0)
- **Framework**: Laravel 12.3.0
- **Database**: SQLite (configurable for production)
- **API**: RESTful endpoints for frontend consumption
- **Scheduling**: Automated data sync every 5 minutes
- **Authentication**: Laravel Sanctum (ready for implementation)

### Frontend (React + Inertia.js)
- **Framework**: React.js with Inertia.js
- **Styling**: Tailwind CSS 3.x
- **Charts**: Chart.js with react-chartjs-2
- **Build Tool**: Vite 7.1.1
- **State Management**: React hooks

### External APIs
- **Polymarket CLOB API**: `clob.polymarket.com`
- **Polymarket Gamma API**: `gamma-api.polymarket.com`

## 📁 Project Structure

```
ayanadevs_prophit/
├── app/
│   ├── Console/Commands/
│   │   ├── SyncPolymarketData.php      # Data sync command
│   │   └── TestPolymarketApi.php       # API testing command
│   ├── Http/Controllers/
│   │   ├── Api/MarketController.php    # API endpoints
│   │   └── DashboardController.php     # Web routes
│   ├── Models/
│   │   ├── Market.php                  # Market model
│   │   ├── MarketMovement.php          # Movement model
│   │   └── MarketPriceHistory.php      # Price history model
│   └── Services/
│       └── PolymarketService.php       # API integration service
├── database/migrations/
│   ├── create_markets_table.php        # Markets schema
│   ├── create_market_movements_table.php # Movements schema
│   └── create_market_price_history_table.php # Price history schema
├── resources/
│   ├── js/
│   │   ├── Components/
│   │   │   ├── Layout.jsx              # Main layout
│   │   │   ├── MovementCard.jsx        # Movement display
│   │   │   ├── StatsGrid.jsx           # Statistics display
│   │   │   ├── PriceChart.jsx          # Chart component
│   │   │   ├── MovementsChart.jsx      # Overview chart
│   │   │   ├── MarketChangesGrid.jsx   # Grid view
│   │   │   ├── LiveMarketChanges.jsx   # Live activity
│   │   │   └── MarketChangesSummary.jsx # Summary component
│   │   └── Pages/
│   │       ├── Dashboard.jsx           # Main dashboard
│   │       ├── MarketDetail.jsx        # Market details
│   │       └── HistoricMovements.jsx   # Historic data
│   └── views/
│       └── app.blade.php               # Main layout template
├── routes/
│   ├── api.php                         # API routes
│   ├── web.php                         # Web routes
│   └── console.php                     # Scheduled tasks
└── config/
    └── services.php                    # API configuration
```

## 🚀 Installation

### Prerequisites
- PHP 8.2+
- Node.js 18+
- Composer
- npm or yarn

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ayanadevs_prophit
   ```

2. **Install PHP dependencies**
   ```bash
   composer install
   ```

3. **Install Node.js dependencies**
   ```bash
   npm install
   ```

4. **Environment setup**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

5. **Configure Polymarket API credentials**
   Add your Polymarket API credentials to `.env`:
   ```env
   POLYMARKET_PRIVATE_KEY=your_private_key
   POLYMARKET_API_KEY=your_api_key
   POLYMARKET_SECRET=your_secret
   POLYMARKET_PASSPHRASE=your_passphrase
   ```

6. **Database setup**
   ```bash
   php artisan migrate
   ```

7. **Build frontend assets**
   ```bash
   npm run build
   ```

8. **Start the application**
   ```bash
   php artisan serve
   ```
   
9. **Run the schedule worker**
   ```bash
   php artisan schedule:work
   ```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `POLYMARKET_PRIVATE_KEY` | Polymarket private key | Yes |
| `POLYMARKET_API_KEY` | Polymarket API key | Yes |
| `POLYMARKET_SECRET` | Polymarket secret | Yes |
| `POLYMARKET_PASSPHRASE` | Polymarket passphrase | Yes |
| `APP_ENV` | Application environment | No |
| `APP_DEBUG` | Debug mode | No |

### Movement Threshold

The default movement threshold is set to 1% (configurable). To change:

1. **Backend**: Modify `$threshold` in `DashboardController.php`
2. **Frontend**: Update threshold options in `Dashboard.jsx`

## 📊 Data Models

### Market
- **polymarket_id**: Unique Polymarket identifier
- **question**: Market question text
- **current_probability**: Current probability (0-1)
- **volume**: Trading volume
- **category**: Market category
- **end_date**: Market end date
- **active**: Market status
- **metadata**: Additional market data

### MarketMovement
- **market_id**: Associated market
- **probability_before**: Probability before movement
- **probability_after**: Probability after movement
- **change_percentage**: Percentage change
- **movement_started_at**: Movement start time
- **movement_detected_at**: Detection time
- **volume_during_movement**: Volume during movement
- **additional_data**: Additional movement data

### MarketPriceHistory
- **market_id**: Associated market
- **probability**: Probability at time of recording
- **volume**: Volume at time of recording
- **recorded_at**: Recording timestamp

## 🔌 API Endpoints

### Market Data
- `GET /api/movements` - Get recent movements
- `GET /api/markets/{id}` - Get market details
- `GET /api/markets/{id}/price-history` - Get price history
- `GET /api/markets/search` - Search markets
- `GET /api/stats` - Get statistics

### Sync Operations
- `POST /api/sync` - Trigger manual sync

### Web Routes
- `GET /` - Main dashboard
- `GET /market/{id}` - Market details
- `GET /historic` - Historic movements

## ⚙️ Commands

### Data Sync
```bash
# Manual sync
php artisan polymarket:sync

# Test API endpoints
php artisan polymarket:test
```

### Scheduled Tasks
The application automatically syncs data every 5 minutes via Laravel's scheduler.

## 🎨 Frontend Components

### Dashboard
- **Real-time movements** with search and filtering
- **Multiple view modes** (List, Grid, Chart)
- **Live market activity** sidebar
- **Statistics overview**

### Movement Cards
- **Interactive charts** with price history
- **Movement details** with before/after probabilities
- **Quick navigation** to market details

### Charts
- **Price history visualization** with Chart.js
- **Interactive tooltips** with formatted data
- **Responsive design** for all screen sizes
- **Color-coded** by movement direction

## 🔍 Search Functionality

### Live Market Activity
- **Real-time filtering** by keywords
- **Category-based search**
- **Results counter** display

### Movement History
- **Keyword search** across market questions
- **Category filtering**
- **Time-based filtering**

## 📱 Responsive Design

The application is fully responsive with:
- **Mobile-first** design approach
- **Collapsible navigation** for mobile
- **Adaptive layouts** for different screen sizes
- **Touch-friendly** interactions

## 🚀 Deployment

### Production Setup
1. **Environment configuration**
   ```bash
   APP_ENV=production
   APP_DEBUG=false
   ```

2. **Database configuration**
   - Use PostgreSQL or MySQL for production
   - Configure database credentials

3. **Asset compilation**
   ```bash
   npm run build
   ```

4. **Queue configuration** (optional)
   - Configure Redis for job queues
   - Set up supervisor for queue workers

### Performance Optimization
- **Database indexing** on frequently queried columns
- **Caching** for API responses
- **Asset optimization** with Vite
- **CDN** for static assets

## 🧪 Testing

### API Testing
```bash
# Test Polymarket API endpoints
php artisan polymarket:test
```

### Frontend Testing
```bash
# Run tests (if configured)
npm test
```

## 🔧 Development

### Development Server
```bash
# Start Laravel server
php artisan serve

# Start Vite dev server
npm run dev

# Run scheduler
php artisan schedule:work
```

### Code Style
- **PHP**: PSR-12 standards
- **JavaScript**: ESLint configuration
- **CSS**: Tailwind CSS utilities

## 📈 Monitoring

### Logs
- **Laravel logs**: `storage/logs/laravel.log`
- **API errors**: Logged with context
- **Sync operations**: Detailed logging

### Metrics
- **Market count**: Total active markets
- **Movement count**: Recent movements
- **Sync status**: Last successful sync
- **API health**: Endpoint availability

## 🆘 Support

For support and questions:
- Check the documentation
- Review the code comments
- Open an issue on GitHub

---

**Built with ❤️ using Laravel and React**

