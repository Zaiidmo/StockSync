import { ProductStatistic, Statistics } from "@/types/statistics";

export const createStatisticsPDFTemplate = (statistics: Statistics, isDark: boolean) => {
    const baseColor = isDark ? '#60a5fa' : '#3b82f6';
    const redColor = isDark ? '#f87171' : '#ef4444';
    const greenColor = isDark ? '#34d399' : '#10b981';
  
    const formatCurrency = (value: number) => {
      return value.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
      });
    };
  
    const createProductList = (products: ProductStatistic[], title: string, color: string) => {
      if (products.length === 0) {
        return `
          <div style="margin: 10px 0; padding: 15px; background-color: #f8f9fa; border-radius: 8px; text-align: center;">
            <p style="color: #6b7280; font-style: italic;">No data available</p>
          </div>
        `;
      }
  
      const productItems = products
        .map(
          (product) => `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0;">
            <span style="color: #374151;">${product.name}</span>
            <span style="color: ${color}; font-weight: bold;">${product.count}x</span>
          </div>
        `
        )
        .join('');
  
      return `
        <div style="margin: 15px 0;">
          <h3 style="color: #374151; margin-bottom: 10px;">${title}</h3>
          <div style="background-color: #f8f9fa; border-radius: 8px; padding: 15px;">
            ${productItems}
          </div>
        </div>
      `;
    };
  
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        </head>
        <body style="font-family: 'Helvetica'; padding: 20px;">
          <h1 style="color: #111827; text-align: center; margin-bottom: 30px;">Statistics Report</h1>
          
          <div style="margin-bottom: 30px;">
            <div style="background-color: #f8f9fa; border-radius: 12px; padding: 20px; margin-bottom: 15px;">
              <h3 style="color: ${baseColor}; margin: 0 0 10px 0;">Total Products</h3>
              <p style="font-size: 24px; font-weight: bold; color: ${baseColor}; margin: 0;">${
      statistics.totalProducts
    }</p>
            </div>
  
            <div style="background-color: #f8f9fa; border-radius: 12px; padding: 20px; margin-bottom: 15px;">
              <h3 style="color: ${redColor}; margin: 0 0 10px 0;">Out of Stock</h3>
              <p style="font-size: 24px; font-weight: bold; color: ${redColor}; margin: 0;">${
      statistics.outOfStock
    }</p>
            </div>
  
            <div style="background-color: #f8f9fa; border-radius: 12px; padding: 20px; margin-bottom: 15px;">
              <h3 style="color: ${greenColor}; margin: 0 0 10px 0;">Total Stock Value</h3>
              <p style="font-size: 24px; font-weight: bold; color: ${greenColor}; margin: 0;">${formatCurrency(
      statistics.totalStockValue
    )}</p>
            </div>
          </div>
  
          ${createProductList(
            statistics.mostAddedProducts,
            'Most Added Products',
            baseColor
          )}
          
          ${createProductList(
            statistics.mostRemovedProducts,
            'Most Removed Products',
            redColor
          )}
          
          <div style="text-align: center; color: #6b7280; margin-top: 30px; font-size: 12px;">
            <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>
        </body>
      </html>
    `;
  };