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
import { Statistics } from "@/types/statistics";

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

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Statistics Report</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #ffffff;
            color: #000000;
            padding: 20px;
          }
          .header {
      width: 100%;
      border-bottom: thick blue;
          }
          .logo {
            width: 300px;
            height: auto;
            margin-bottom: 10px;
            position: absolute;
            top: 10;
            left: 10;
          }
            .header-titles {
            margin-top: 100px;
            margin-bottom: 30px;
            width: 100%;
    }
          .report-title {
            font-size: 30px;
            font-weight: bold;
            color: #333333;
            margin: 0;
            text-align: center;
          }
          .report-date {
            font-size: 14px;
            color: #666666;
            margin-top: 5px;
            text-align: center;
          }
          .card {
            background-color: #f9fafb;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .card-title {
            font-size: 18px;
            font-weight: 600;
            color: #333333;
            margin: 0 0 10px 0;
          }
          .card-value {
            font-size: 24px;
            font-weight: bold;
            color: #111827;
            margin: 0;
          }
          .product-list {
            margin: 20px 0;
          }
          .product-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          .product-item:last-child {
            border-bottom: none;
          }
          .no-data {
            text-align: center;
            color: #666666;
            font-style: italic;
          }
          .footer {
            text-align: center;
            color: #666666;
            margin-top: 30px;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="https://i.ibb.co/Tq8DrS7L/logo-bar.png" alt="Logo" class="logo" />
        </div>

 <div class="header-titles">
             <h1 class="report-title">Statistics Report</h1>
              <p class="report-date">Generated on ${new Date().toLocaleDateString()}</p>
 </div>

        <div class="card">
          <h3 class="card-title">Total Products</h3>
          <p class="card-value">${statistics.totalProducts}</p>
        </div>

        <div class="card">
          <h3 class="card-title">Out of Stock</h3>
          <p class="card-value">${statistics.outOfStock}</p>
        </div>

        <div class="card">
          <h3 class="card-title">Total Stock Value</h3>
          <p class="card-value">${formatCurrency(
            statistics.totalStockValue
          )}</p>
        </div>

        <div class="product-list">
          <h3 class="card-title">Most Added Products</h3>
          <div class="card">
            ${
              statistics.mostAddedProducts.length > 0
                ? statistics.mostAddedProducts
                    .map(
                      (product) => `
                        <div class="product-item">
                          <span>${product.name}</span>
                          <span>${product.count}x</span>
                        </div>
                      `
                    )
                    .join("")
                : '<p class="no-data">No data available</p>'
            }
          </div>
        </div>

        <div class="product-list">
          <h3 class="card-title">Most Removed Products</h3>
          <div class="card">
            ${
              statistics.mostRemovedProducts.length > 0
                ? statistics.mostRemovedProducts
                    .map(
                      (product) => `
                        <div class="product-item">
                          <span>${product.name}</span>
                          <span>${product.count}x</span>
                        </div>
                      `
                    )
                    .join("")
                : '<p class="no-data">No data available</p>'
            }
          </div>
        </div>

        <div class="footer">
          <p>© 2025 StockSync. All rights reserved.</p>
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
        // For Android, we can use the native sharing
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
