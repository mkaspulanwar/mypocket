// Configuration Constants
const CONFIG = {
    EXCHANGE_RATES: {
        USD_TO_IDR: 16300,
        USDT_TO_IDR: 16300
    },
    BTC: {
        PRICE_IDR: 1500000000,
        SATS_TO_BTC: 100000000
    },
    LAST_UPDATE: {
        timestamp: null,
        timezone: 'Asia/Makassar'
    },
    API_REFRESH_INTERVAL: 60000
};

// Asset Data - Optimized untuk emas
const ASSETS = [
    {
        ticker: "Bitcoin",
        name: "Portable Asset",
        icon: "/icon/bitcoin.png",
        type: "bitcoin",
        currency: "IDR",
        freeSats: 35045,
        avgPrice: 1166095031
    },
    {
        ticker: "BBCA",
        name: "Bank Cental Asia Tbk",
        icon: "../icon/bbca.png",
        type: "stock",
        currency: "IDR",
        shares: 100,
        avgPrice: 8537.79,
        currentPrice: 8425
    },
    {
        ticker: "Dana Darurat",
        name: "Cash Emergency Fund",
        icon: "../icon/dd.svg",
        type: "cash",
        currency: "IDR",
        amount: 494000,
        avgPrice: 1,
        currentPrice: 1
    },
    {
        ticker: "CDIA",
        name: "Chandra Daya Investasi Tbk",
        icon: "https://assets.stockbit.com/logos/companies/TPIA.png?version=1750055121325821609",
        type: "stock",
        currency: "IDR",
        shares: 1000,
        avgPrice: 190,
        currentPrice: 1780
    },
    {
        ticker: "BUKA",
        name: "Bukalapak Tbk",
        icon: "https://assets.stockbit.com/logos/companies/BUKA.png",
        type: "stock",
        currency: "IDR",
        shares: 1000,
        avgPrice: 171,
        currentPrice: 171
    },
    // {
    //     ticker: "XAUID",
    //     name: "Paxos Gold • Antam Gold",
    //     icon: "../icon/gold.svg",
    //     type: "gold",
    //     currency: "gram",
    //     grams: 0, // Jumlah emas dalam gram
    //     avgPrice: 1200000, // Harga rata-rata per gram dalam IDR
    //     currentPrice: 1913942 // Harga saat ini per gram dalam IDR
    // },
    
    // {
    //     ticker: "BMRI",
    //     name: "Bank Mandiri Tbk",
    //     icon: "https://bibit.id/_next/static/media/CC002.767f37e4.svg",
    //     type: "stock",
    //     currency: "IDR",
    //     shares: 0,
    //     avgPrice: 0,
    //     currentPrice: 0
    // },
];

// Utility Functions
const Utils = {
    formatCurrency: (amount) => `Rp. ${amount.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
    
    formatUSD: (amount) => `$ ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    
    convertIDRtoUSD: (idrAmount) => idrAmount / CONFIG.EXCHANGE_RATES.USD_TO_IDR,
    
    formatNumber: (number) => number.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 3 }),
    
    formatBalance: (asset) => {
        switch (asset.type) {
            case "bitcoin":
                return `${Utils.formatNumber(asset.freeSats)} sats`;
            case "stock":
                return `${Utils.formatNumber(asset.shares)} shares`;
            case "gold":
                return `${Utils.formatNumber(asset.grams)} gram`;
            case "cash":
                return Utils.formatCurrency(asset.amount);
            default:
                return "0";
        }
    },
    
    calculateInvested: (asset) => {
        switch (asset.type) {
            case "bitcoin":
                return asset.freeSats * asset.avgPrice / CONFIG.BTC.SATS_TO_BTC;
            case "stock":
                return asset.shares * asset.avgPrice;
            case "gold":
                return asset.grams * asset.avgPrice;
            case "cash":
                return asset.amount;
            default:
                return 0;
        }
    },
    
    calculateMarketValue: (asset) => {
        switch (asset.type) {
            case "bitcoin":
                return asset.freeSats * CONFIG.BTC.PRICE_IDR / CONFIG.BTC.SATS_TO_BTC;
            case "stock":
                return asset.shares * asset.currentPrice;
            case "gold":
                return asset.grams * asset.currentPrice;
            case "cash":
                return asset.amount;
            default:
                return 0;
        }
    },
    
    formatPriceDisplay: (asset, isAvgPrice = false) => {
        if (asset.type === "cash") {
            return "Rp. 1";
        }
        
        const price = isAvgPrice ? asset.avgPrice : asset.currentPrice;
        
        if (asset.type === "bitcoin") {
            return `Rp. ${(price / 1000000).toLocaleString('id-ID', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })} jt`;
        } else if (asset.type === "gold") {
            return `Rp. ${(price / 1000).toLocaleString('id-ID', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            })} rb/gram`;
        } else {
            return `Rp. ${price.toLocaleString('id-ID', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`;
        }
    },
    
    getReturnClass: (returnPercent) => returnPercent > 0 ? 'positive' : returnPercent < 0 ? 'negative' : '',
    
    getReturnSign: (returnPercent) => returnPercent > 0 ? '+ ' : returnPercent < 0 ? '- ' : '',

    formatTimestamp: (timestamp) => {
        if (!timestamp) return 'Belum diperbarui';
        
        const date = new Date(timestamp);
        const options = {
            timeZone: CONFIG.LAST_UPDATE.timezone,
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        };
        
        const formatter = new Intl.DateTimeFormat('id-ID', options);
        return `${formatter.format(date)} WITA`;
    },

    updateLastUpdateTimestamp: () => {
        CONFIG.LAST_UPDATE.timestamp = new Date().getTime();
    }
};

// Asset Calculator
const AssetCalculator = {
    calculateAssetValues: () => {
        return ASSETS.map(asset => {
            const balance = Utils.formatBalance(asset);
            const invested = Utils.calculateInvested(asset);
            const marketValue = Utils.calculateMarketValue(asset);
            const returnPercent = invested > 0 ? ((marketValue - invested) / invested) * 100 : 0;

            let currentPrice;
            if (asset.type === "bitcoin") {
                currentPrice = CONFIG.BTC.PRICE_IDR;
            } else {
                currentPrice = asset.currentPrice;
            }

            return {
                name: asset.name,
                ticker: asset.ticker,
                icon: asset.icon,
                balance,
                invested: Math.round(invested),
                avgPrice: asset.avgPrice,
                currentPrice: currentPrice,
                currency: asset.currency,
                type: asset.type,
                marketValue: Math.round(marketValue),
                returnPercent: isNaN(returnPercent) ? 0 : returnPercent
            };
        });
    }
};

// UI Renderer
const UIRenderer = {
    populateAssetTable: (calculatedAssets) => {
        const tableBody = document.getElementById('assetTableBody');
        if (!tableBody) return;
        
        tableBody.innerHTML = '';

        // Display assets in the order they appear in the ASSETS array (custom order)
        calculatedAssets.forEach(asset => {
            const row = document.createElement('tr');
            const pnlValue = asset.marketValue - asset.invested;
            const returnClass = Utils.getReturnClass(asset.returnPercent);
            const returnSign = Utils.getReturnSign(asset.returnPercent);

            if (asset.type === 'cash') {
                row.innerHTML = `
                    <td>
                        <span class="asset-icon">
                            <img src="${asset.icon}" alt="${asset.ticker}">
                        </span>
                        <span class="asset-name">
                            ${asset.ticker}
                            <span class="asset-ticker">${asset.name}</span>
                        </span>
                    </td>
                    <td>${asset.balance}</td>
                    <td style="text-align: center; color: #666; font-style: italic;">-</td>
                    <td style="text-align: center; color: #666; font-style: italic;">-</td>
                    <td style="text-align: center; color: #666; font-style: italic;">-</td>
                    <td style="text-align: center; color: #666; font-style: italic;">-</td>
                    <td style="text-align: center; color: #666; font-style: italic;">-</td>
                    <td style="text-align: center; color: #666; font-style: italic;">-</td>
                `;
            } else {
                row.innerHTML = `
                    <td>
                        <span class="asset-icon">
                            <img src="${asset.icon}" alt="${asset.ticker}">
                        </span>
                        <span class="asset-name">
                            ${asset.ticker}
                            <span class="asset-ticker">${asset.name}</span>
                        </span>
                    </td>
                    <td>${asset.balance}</td>
                    <td>${Utils.formatCurrency(asset.marketValue)}</td>
                    <td>${Utils.formatCurrency(asset.invested)}</td>
                    <td>${Utils.formatPriceDisplay(asset, true)}</td>
                    <td>${Utils.formatPriceDisplay(asset)}</td>
                    <td class="${returnClass}">${Utils.formatCurrency(pnlValue)}</td>
                    <td class="${returnClass}">${returnSign}${Math.abs(asset.returnPercent).toFixed(2)}%</td>
                `;
            }

            tableBody.appendChild(row);
        });
    },

    updatePortfolioSummary: (calculatedAssets) => {
        const totalMarketValue = calculatedAssets.reduce((sum, asset) => sum + asset.marketValue, 0);
        const usdEquivalent = Utils.convertIDRtoUSD(totalMarketValue);

        const totalEquityElement = document.getElementById('totalEquity');
        const usdEquivalentElement = document.getElementById('usdEquivalent');

        if (totalEquityElement) totalEquityElement.textContent = Utils.formatCurrency(totalMarketValue);
        if (usdEquivalentElement) usdEquivalentElement.textContent = `≈ ${Utils.formatUSD(usdEquivalent)}`;
    },

    displayLastUpdate: () => {
        const lastUpdateElement = document.getElementById('lastUpdate');
        if (lastUpdateElement) {
            const formattedUpdate = Utils.formatTimestamp(CONFIG.LAST_UPDATE.timestamp);
            lastUpdateElement.innerHTML = `Last Update: <br> ${formattedUpdate}`;
        }
    }
};

// API Handler
const APIHandler = {
    fetchBitcoinPrice: async () => {
        try {
            const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,idr');
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data?.bitcoin) {
                CONFIG.BTC.PRICE_IDR = data.bitcoin.idr;
                
                if (data.bitcoin.usd) {
                    const usdToIdrRate = data.bitcoin.idr / data.bitcoin.usd;
                    CONFIG.EXCHANGE_RATES.USD_TO_IDR = usdToIdrRate;
                    CONFIG.EXCHANGE_RATES.USDT_TO_IDR = usdToIdrRate;
                }
                
                console.log(`Bitcoin price updated: ${CONFIG.BTC.PRICE_IDR} IDR`);
                return true;
            }
            
            throw new Error("Invalid response from CoinGecko API");
        } catch (error) {
            console.error("Error fetching Bitcoin price:", error);
            return false;
        }
    },

    fetchAllPrices: async () => {
        try {
            console.log("Fetching market data...");
            
            const bitcoinSuccess = await APIHandler.fetchBitcoinPrice();
            
            Utils.updateLastUpdateTimestamp();
            Dashboard.initialize();
            
            if (bitcoinSuccess) {
                console.log(`Successfully updated Bitcoin price at ${new Date().toLocaleString('id-ID', { timeZone: CONFIG.LAST_UPDATE.timezone })}`);
            }
            
            return bitcoinSuccess;
        } catch (error) {
            console.error("Error fetching market data:", error);
            Utils.updateLastUpdateTimestamp();
            Dashboard.initialize();
            return false;
        }
    }
};

// Main Dashboard Controller
const Dashboard = {
    initialize: () => {
        try {
            const calculatedAssets = AssetCalculator.calculateAssetValues();
            UIRenderer.populateAssetTable(calculatedAssets);
            UIRenderer.updatePortfolioSummary(calculatedAssets);
            UIRenderer.displayLastUpdate();
            console.log("Dashboard initialized successfully");
        } catch (error) {
            console.error("Error initializing dashboard:", error);
        }
    },

    setupAutoRefresh: () => {
        Utils.updateLastUpdateTimestamp();
        APIHandler.fetchAllPrices();
        
        setInterval(() => {
            console.log("Auto-refreshing market data");
            APIHandler.fetchAllPrices();
        }, CONFIG.API_REFRESH_INTERVAL);
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM loaded, initializing dashboard");
    Dashboard.initialize();
    Dashboard.setupAutoRefresh();
});