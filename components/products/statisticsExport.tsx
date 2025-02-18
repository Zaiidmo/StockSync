import React, { useState } from "react";
import {
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Alert,
  View,
  Text,
} from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import { Download } from "lucide-react-native";
import { ProductStatistic, Statistics } from "@/types/statistics";

interface StatisticsExportProps {
  statistics: Statistics;
}

export const StatisticsExport: React.FC<StatisticsExportProps> = ({
  statistics,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const createFileName = () => {
    const date = new Date();
    return `statistics-report-${date.getFullYear()}-${
      date.getMonth() + 1
    }-${date.getDate()}.pdf`;
  };

  const generateHTML = () => {
    const formatCurrency = (value: number) =>
      value.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
      });

    const createProductList = (products: ProductStatistic[], title: string) => {
      if (products.length === 0) {
        return `
          <div class="card">
            <h3 class="card-title">${title}</h3>
            <p class="no-data">No data available</p>
          </div>
        `;
      }

      const productItems = products
        .map(
          (product) => `
          <div class="product-item">
            <span>${product.name}</span>
            <span class="product-count">${product.count}x</span>
          </div>
        `
        )
        .join("");

      return `
        <div class="card">
          <h3 class="card-title">${title}</h3>
          <div class="product-list">
            ${productItems}
          </div>
        </div>
      `;
    };

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              padding: 20px;
              margin: 0;
              background: white;
              color: #1f2937;
            }
            
            .header {
              border-bottom: 3px solid #1E6BF1;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            
            .logo {
              width: 200px;
              margin-bottom: 20px;
              color: #1E6BF1;
              font-size: 24px;
              font-weight: bold;
            }
            
            .report-title {
              font-size: 24px;
              color: #1f2937;
              margin: 0;
            }
            
            .report-subtitle {
              color: #6b7280;
              margin-top: 5px;
              font-size: 14px;
            }
            
            .summary {
              background: #f3f4f6;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 30px;
            }
            
            .summary-title {
              color: #1E6BF1;
              font-size: 16px;
              margin: 0 0 10px 0;
            }
            
            .metrics-grid {
              display: flex;
              flex-wrap: wrap;
              gap: 20px;
              margin-bottom: 30px;
            }
            
            .metric-card {
              flex: 1;
              min-width: 200px;
              background: white;
              padding: 20px;
              border-radius: 8px;
              border: 1px solid #e5e7eb;
            }
            
            .metric-value {
              font-size: 24px;
              font-weight: bold;
              color: #1E6BF1;
              margin: 0;
            }
            
            .metric-label {
              color: #6b7280;
              font-size: 14px;
              margin-top: 5px;
            }
            
            .card {
              background: white;
              padding: 20px;
              border-radius: 8px;
              border: 1px solid #e5e7eb;
              margin-bottom: 20px;
            }
            
            .card-title {
              color: #1f2937;
              font-size: 16px;
              margin: 0 0 15px 0;
            }
            
            .product-list {
              margin: 0;
            }
            
            .product-item {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-bottom: 1px solid #e5e7eb;
            }
            
            .product-item:last-child {
              border-bottom: none;
            }
            
            .product-count {
              color: #1E6BF1;
              font-weight: 600;
            }
            
            .no-data {
              color: #6b7280;
              font-style: italic;
              text-align: center;
              padding: 20px;
              margin: 0;
            }
            
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              color: #6b7280;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <img class="logo" src="https://i.ibb.co/wr6LJ9Mk/App-Logos.png" alt="StockSyncLogo" border="0">
            <h1 class="report-title">Inventory Status Report</h1>
            <p class="report-subtitle">Generated on ${new Date().toLocaleDateString()}</p>
          </div>

          <div class="summary">
            <h2 class="summary-title">Executive Summary</h2>
            <p>Current inventory status shows a total of ${statistics.totalProducts} products with a combined value of ${formatCurrency(statistics.totalStockValue)}. 
            ${statistics.outOfStock} product${statistics.outOfStock !== 1 ? 's are' : ' is'} currently out of stock.</p>
          </div>

          <div class="metrics-grid">
            <div class="metric-card">
              <p class="metric-value">${statistics.totalProducts}</p>
              <p class="metric-label">Total Products</p>
            </div>
            
            <div class="metric-card">
              <p class="metric-value">${statistics.outOfStock}</p>
              <p class="metric-label">Out of Stock</p>
            </div>
            
            <div class="metric-card">
              <p class="metric-value">${formatCurrency(statistics.totalStockValue)}</p>
              <p class="metric-label">Total Stock Value</p>
            </div>
          </div>

          ${createProductList(statistics.mostAddedProducts, 'Most Added Products')}
          ${createProductList(statistics.mostRemovedProducts, 'Most Removed Products')}

          <div class="footer">
            <p>Generated by STOCKSYNC Inventory Management System</p>
            <p>Report ID: INV-${new Date().toISOString().split('T')[0]}</p>
          </div>
        </body>
      </html>
    `;
  };

  const handleExport = async () => {
    try {
      setIsGenerating(true);

      // Generate PDF
      const { uri } = await Print.printToFileAsync({
        html: generateHTML(),
        base64: false,
      });

      // Ensure the downloads directory exists
      const downloadsDir = FileSystem.documentDirectory + "downloads/";
      const dirInfo = await FileSystem.getInfoAsync(downloadsDir);

      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(downloadsDir, {
          intermediates: true,
        });
      }

      // Move the file to downloads directory
      const fileName = createFileName();
      const newUri = downloadsDir + fileName;
      await FileSystem.moveAsync({ from: uri, to: newUri });

      // Share the file
      if (Platform.OS === "ios") {
        await Sharing.shareAsync(newUri);
      } else {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(newUri, {
            mimeType: "application/pdf",
            dialogTitle: "Download Statistics Report",
          });
        } else {
          Alert.alert("Error", "Sharing is not available on this device");
        }
      }

      setIsGenerating(false);
    } catch (error) {
      setIsGenerating(false);
      console.error("Error generating PDF:", error);
      Alert.alert("Error", "Failed to generate PDF. Please try again later.");
    }
  };

  return (
    <View className="mt-4 mb-8">
    <TouchableOpacity
      onPress={handleExport}
      className="flex-row items-center justify-center bg-[#1f61b7]/80 px-4 py-3 rounded-xl"
    >
      {isGenerating ? (
        <ActivityIndicator color="white" size="small" />
      ) : (
       <>
            <Download size={24} color="white" />
            <Text className="text-white font-semibold ml-2">Export Statistics</Text>
    
       </>
      )}
    </TouchableOpacity>
    </View>
  );
};
