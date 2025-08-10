// Configuration Constants
const CONFIG = {
    EXCHANGE_RATES: {
        USD_TO_IDR: 16300
    },
    CONSTANTS: {
        SATS_TO_BTC: 100000000,
        GRAMS_TO_TROY_OUNCE: 31.1035
    },
    LAST_UPDATE: {
        timestamp: null,
        timezone: 'Asia/Makassar'
    },
    API_REFRESH_INTERVAL: 60000
};

// Inspiring quotes array
const INSPIRING_QUOTES = [
    "Think long term",
    "Spend less than you earn",
    "Invest in assets, not toys",
    "Hold cash, buy value",
];

// Asset Data dengan harga default
const ASSETS = [
    {
        ticker: "Bitcoin",
        name: "Portable Commodity",
        icon: "/icon/bitcoin.png",
        type: "bitcoin",
        currency: "IDR",
        freeSats: 45045,
        avgPrice: 1166095031,
        currentPrice: 1500000000, // Harga default Bitcoin dalam IDR
        apiId: "bitcoin" // ID untuk API CoinGecko
    },
    {
        ticker: "BBCA",
        name: "Bank Central Asia Tbk",
        icon: "https://assets.stockbit.com/logos/companies/BBCA.png",
        type: "stock",
        currency: "IDR",
        shares: 100,
        avgPrice: 8537.79,
        currentPrice: 8400
    },
    {
        ticker: "Reserve Fund",
        name: "Cash on Standby",
        icon: "icon/idrt.png",
        type: "cash",
        currency: "IDR",
        amount: 371000,
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
        currentPrice: 1580
    },
    {
        ticker: "Futures Long",
        name: "Binance Futures Trade",
        icon: "/icon/okb.png",
        type: "cash",
        currency: "IDR",
        amount: 160000,
        avgPrice: 1,
        currentPrice: 1
    },
    {
        ticker: "XAUID",
        name: "Paxos & Antam Gold",
        icon: "/icon/gold.svg",
        type: "gold",
        currency: "IDR",
        grams: 1,
        avgPrice: 1150000,
        currentPrice: 1950000, // Harga default emas per gram dalam IDR
        apiId: "gold" // ID untuk API
    }
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
            case "gold":
                return `${Utils.formatNumber(asset.grams)} gram`;
            case "stock":
                return `${Utils.formatNumber(asset.shares)} shares`;
            case "cash":
                return Utils.formatCurrency(asset.amount);
            default:
                return "0";
        }
    },
    
    calculateMarketValue: (asset) => {
        switch (asset.type) {
            case "bitcoin":
                return asset.freeSats * asset.currentPrice / CONFIG.CONSTANTS.SATS_TO_BTC;
            case "gold":
                return asset.grams * asset.currentPrice;
            case "stock":
                return asset.shares * asset.currentPrice;
            case "cash":
                return asset.amount;
            default:
                return 0;
        }
    },

    formatTimestamp: (timestamp) => {
        if (!timestamp) return 'Loading...';
        
        const date = new Date(timestamp);
        const options = {
            timeZone: CONFIG.LAST_UPDATE.timezone,
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        };
        
        const timeFormatter = new Intl.DateTimeFormat('id-ID', options);
        const dateOptions = {
            timeZone: CONFIG.LAST_UPDATE.timezone,
            day: '2-digit',
            month: '2-digit',
            year: '2-digit'
        };
        const dateFormatter = new Intl.DateTimeFormat('id-ID', dateOptions);
        
        return `${timeFormatter.format(date)}<br>${dateFormatter.format(date)}`;
    },

    updateLastUpdateTimestamp: () => {
        CONFIG.LAST_UPDATE.timestamp = new Date().getTime();
    },

    getRandomQuote: () => {
        return INSPIRING_QUOTES[Math.floor(Math.random() * INSPIRING_QUOTES.length)];
    }
};

// Asset Calculator
const AssetCalculator = {
    calculateAssetValues: () => {
        return ASSETS.map(asset => {
            const balance = Utils.formatBalance(asset);
            const marketValue = Utils.calculateMarketValue(asset);

            return {
                name: asset.name,
                ticker: asset.ticker,
                icon: asset.icon,
                balance,
                marketValue: Math.round(marketValue),
                type: asset.type
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

        calculatedAssets.forEach(asset => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>
                    <div class="asset-row">
                        <span class="asset-icon">
                            <img src="${asset.icon}" alt="${asset.ticker}">
                        </span>
                        <div class="asset-info">
                            <div class="asset-ticker">${asset.ticker}</div>
                            <div class="asset-name">${asset.name}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="value-info">
                        <div class="market-value">${Utils.formatCurrency(asset.marketValue)}</div>
                        <div class="asset-balance">${asset.balance}</div>
                    </div>
                </td>
            `;

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
            lastUpdateElement.innerHTML = formattedUpdate;
        }
    },

    updateQuote: () => {
        const quoteElement = document.getElementById('inspiringQuote');
        if (quoteElement) {
            quoteElement.textContent = Utils.getRandomQuote();
        }
    }
};

// API Handler
const APIHandler = {
    updateAssetPrice: (ticker, newPrice) => {
        const asset = ASSETS.find(a => a.ticker === ticker);
        if (asset) {
            asset.currentPrice = newPrice;
            console.log(`${ticker} price updated to: ${newPrice}`);
        }
    },

    fetchBitcoinPrice: async () => {
        try {
            const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,idr');
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data?.bitcoin) {
                // Update harga Bitcoin di array ASSETS
                APIHandler.updateAssetPrice("Bitcoin", data.bitcoin.idr);
                
                // Update exchange rate jika ada data USD
                if (data.bitcoin.usd) {
                    const usdToIdrRate = data.bitcoin.idr / data.bitcoin.usd;
                    CONFIG.EXCHANGE_RATES.USD_TO_IDR = usdToIdrRate;
                }
                
                console.log(`Bitcoin price updated: ${data.bitcoin.idr} IDR`);
                return true;
            }
            
            throw new Error("Invalid response from CoinGecko API");
        } catch (error) {
            console.error("Error fetching Bitcoin price:", error);
            return false;
        }
    },

    fetchGoldPrice: async () => {
        try {
            // Menggunakan API Metals Live untuk mendapatkan harga emas dalam USD per troy ounce
            const response = await fetch('https://api.metals.live/v1/spot/gold');
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data && data.price) {
                // Konversi dari USD per troy ounce ke IDR per gram
                const goldPriceUsdPerOunce = data.price;
                const goldPriceUsdPerGram = goldPriceUsdPerOunce / CONFIG.CONSTANTS.GRAMS_TO_TROY_OUNCE;
                const goldPriceIdrPerGram = goldPriceUsdPerGram * CONFIG.EXCHANGE_RATES.USD_TO_IDR;
                
                // Update harga emas di array ASSETS
                APIHandler.updateAssetPrice("XAUID", goldPriceIdrPerGram);
                
                console.log(`Gold price updated: ${goldPriceIdrPerGram} IDR per gram`);
                return true;
            }
            
            throw new Error("Invalid response from Metals Live API");
        } catch (error) {
            console.error("Error fetching Gold price:", error);
            // Fallback: gunakan API alternatif jika tersedia
            return APIHandler.fetchGoldPriceAlternative();
        }
    },

    fetchGoldPriceAlternative: async () => {
        try {
            // API alternatif untuk harga emas
            const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=gold&vs_currencies=usd');
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data?.gold?.usd) {
                // CoinGecko memberikan harga dalam USD per troy ounce
                const goldPriceUsdPerOunce = data.gold.usd;
                const goldPriceUsdPerGram = goldPriceUsdPerOunce / CONFIG.CONSTANTS.GRAMS_TO_TROY_OUNCE;
                const goldPriceIdrPerGram = goldPriceUsdPerGram * CONFIG.EXCHANGE_RATES.USD_TO_IDR;
                
                // Update harga emas di array ASSETS
                APIHandler.updateAssetPrice("XAUID", goldPriceIdrPerGram);
                
                console.log(`Gold price updated (alternative): ${goldPriceIdrPerGram} IDR per gram`);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error("Error fetching Gold price from alternative source:", error);
            return false;
        }
    },

    fetchAllPrices: async () => {
        try {
            console.log("Fetching market data...");
            
            const bitcoinSuccess = await APIHandler.fetchBitcoinPrice();
            const goldSuccess = await APIHandler.fetchGoldPrice();
            
            Utils.updateLastUpdateTimestamp();
            Dashboard.initialize();
            
            if (bitcoinSuccess) {
                console.log(`Successfully updated Bitcoin price at ${new Date().toLocaleString('id-ID', { timeZone: CONFIG.LAST_UPDATE.timezone })}`);
            }
            
            if (goldSuccess) {
                console.log(`Successfully updated Gold price at ${new Date().toLocaleString('id-ID', { timeZone: CONFIG.LAST_UPDATE.timezone })}`);
            }
            
            return bitcoinSuccess || goldSuccess;
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
            UIRenderer.updateQuote();
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