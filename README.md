# StockSync - Inventory Management Application

A modern, intuitive inventory management system built with React Native and Expo, designed to streamline stock management through barcode scanning and real-time tracking.

## Features

### Secure Authentication

- Personal secret code access for each user
- Secure login system

### Product Management

- Barcode scanning using expo-camera
- Manual barcode entry backup
- Real-time stock updates
- Product information display (name, type, price, quantity by warehouse)
- New product registration with comprehensive form

### Inventory Overview

- Detailed product listing
- Visual stock status indicators
- Stock level warnings
- Restock and withdrawal functionality

### Advanced Features

- Dynamic search and filtering
- Multi-parameter sorting
- PDF report export using expo-print
- Comprehensive dashboard with key metrics

## Technical Stack

1. Frontend

- React Native
- Expo
- Tailwindcss

2. Backend

- json-server (development)

## Getting Started 

### Prerequisites 

- Node.js (v18 or higher)
- npm (Node Package Manager)
- Expo CLI
- json-server (for backend simulation)

### Installation

1. Clone the repository 

```bash 
git clone git@github.com:Zaiidmo/StockSync.git
cd StockSync
```
2. Install Dependencies

```bash
npm install 
```
3. Create and Configure .env and db files 

```bash 
cp .env.example .env 
```
```bash
cp database-example.json database.json
```
4. Start the backend server 

```bash 
npx json-server --watch database.json
```
5. Start the Expo development server

```bash 
npx expo start 
```

### Usage 

1. Authentication

- Launch the app
- Enter your personal code
- Access the main dashboard

2. Scanning Products

- Tap the scan button
- Point camera at barcode
- View/modify product details

3. Managing Inventory

- Add/remove stock quantities
- Create new products
- Generate reports

-- 
## Contributing 

1. Fork the Project
2. Create your Feature Branch (git checkout -b feature/AmazingFeature)
3. Commit your Changes (git commit -m 'Add some AmazingFeature')
4. Push to the Branch (git push origin feature/AmazingFeature)
5. Open a Pull Request

## License 
This project is licensed under the MIT License - see the LICENSE file for details.

## Author 

Zaiid Moumni 