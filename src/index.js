// Configuration Constants
const CONFIG = {
    EXCHANGE_RATES: {
        USD_TO_IDR: 16171 // Default value, akan diupdate otomatis dari API
    },
    CONSTANTS: {
        SATS_TO_BTC: 100000000,
        GRAMS_TO_TROY_OUNCE: 31.1035
    },
    LAST_UPDATE: {
        timestamp: null,
        timezone: 'Asia/Makassar'
    },
    API_REFRESH_INTERVAL: 60000,
    CHART_COLORS: [
        "rgba(255, 152, 0, 0.9)",
        "rgba(244, 67, 54, 0.9)",
        "rgba(96, 125, 255, 0.9)",
        "rgba(0, 191, 165, 0.9)",
    ],
    MAX_CHART_ASSETS: 3 // Maksimal 5 asset di chart, sisanya masuk "Lainnya"
};

// Inspiring quotes array
const INSPIRING_QUOTES = [
    "Think long term",
    "Spend less than you earn",
    "Hold cash, buy value",
];

// Asset Data dengan harga default
const ASSETS = [
    {
        ticker: "Bitcoin",
        name: "Portable Commodity",
        icon: "icon/bitcoin.png",
        type: "bitcoin",
        currency: "IDR",
        freeSats: 55184 - 10000, //10000 sats punya APT
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
        currentPrice: 8475
    },
    
    {
        ticker: "CDIA",
        name: "Chandra Daya Investasi Tbk",
        icon: "https://assets.stockbit.com/logos/companies/TPIA.png?version=1750055121325821609",
        type: "stock",
        currency: "IDR",
        shares: 700,
        avgPrice: 190,
        currentPrice: 1530
    },
    {
        ticker: "SIMP",
        name: "Salim Ivomas Pratama Tbk",
        icon: "https://assets.stockbit.com/logos/companies/SIMP.png",
        type: "stock",
        currency: "IDR",
        shares: 800,
        avgPrice: 685,
        currentPrice: 650
    },
    {
        ticker: "Rupiah",
        name: "Cash on Standby",
        icon: "icon/idrt.png",
        type: "cash",
        currency: "IDR",
        amount: 34500,
        avgPrice: 1,
        currentPrice: 1
    },
    {
        ticker: "Gold",
        name: "Paxos and Antam Gold",
        icon: "icon/gold.svg",
        type: "gold",
        currency: "IDR",
        grams: 0,
        avgPrice: 1150000,
        currentPrice: 1350000 // Harga manual emas per gram dalam IDR
    }
];

// Global chart variable
let assetChart = null;

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
        
        // Format waktu HH:mm
        const options = {
            timeZone: CONFIG.LAST_UPDATE.timezone,
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        };
        const timeFormatter = new Intl.DateTimeFormat('id-ID', options);
        
        // Format tanggal dd/MM/yyyy
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        
        const formattedDate = `${day}/${month}/${year}`;
        const formattedTime = timeFormatter.format(date);
        
        return `${formattedTime}<br>${formattedDate}`;
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
        const calculatedAssets = ASSETS.map(asset => {
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

        // Otomatis sort berdasarkan market value dari terbesar ke terkecil
        return calculatedAssets.sort((a, b) => b.marketValue - a.marketValue);
    },

    prepareChartData: (calculatedAssets) => {
        // Filter out assets with zero value
        const assetsWithValue = calculatedAssets.filter(asset => asset.marketValue > 0);
        
        if (assetsWithValue.length <= CONFIG.MAX_CHART_ASSETS) {
            // Jika total asset <= 5, tampilkan semua
            return assetsWithValue;
        }

        // Ambil 5 asset terbesar
        const topAssets = assetsWithValue.slice(0, CONFIG.MAX_CHART_ASSETS);
        
        // Hitung total nilai dari asset yang tidak masuk top 5
        const remainingAssets = assetsWithValue.slice(CONFIG.MAX_CHART_ASSETS);
        const othersValue = remainingAssets.reduce((sum, asset) => sum + asset.marketValue, 0);
        
        // Jika ada asset lain, tambahkan kategori "Lainnya"
        if (othersValue > 0) {
            const othersAsset = {
                name: "Asset Lainnya",
                ticker: "Lainnya",
                icon: "/icon/others.svg", // Bisa diganti dengan icon yang sesuai
                balance: `${remainingAssets.length} assets`,
                marketValue: othersValue,
                type: "others"
            };
            
            topAssets.push(othersAsset);
        }

        return topAssets;
    }
};

// Chart Handler
const ChartHandler = {
    createDonutChart: (calculatedAssets) => {
        const ctx = document.getElementById('assetChart');
        if (!ctx) return;

        // Prepare data untuk chart (5 terbesar + lainnya jika ada)
        const chartAssets = AssetCalculator.prepareChartData(calculatedAssets);
        const totalValue = chartAssets.reduce((sum, asset) => sum + asset.marketValue, 0);
        
        if (totalValue === 0) return;

        const chartData = {
            labels: chartAssets.map(asset => asset.ticker),
            datasets: [{
                data: chartAssets.map(asset => asset.marketValue),
                backgroundColor: CONFIG.CHART_COLORS.slice(0, chartAssets.length),
                borderColor: '#000000',
                borderWidth: 1,
                hoverBackgroundColor: CONFIG.CHART_COLORS.slice(0, chartAssets.length),
                hoverBorderColor: '#000000',
                hoverBorderWidth: 2
            }]
        };

        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'none'
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: false
                }
            },
            cutout: '70%',
            animation: {
                animateScale: false,
                animateRotate: true,
                duration: 800,
                easing: 'easeOutQuart'
            },
            elements: {
                arc: {
                    borderWidth: 1,
                    borderColor: '#000000'
                }
            },
            onHover: () => {},
            onClick: () => {}
        };

        // Destroy existing chart if it exists
        if (assetChart) {
            assetChart.destroy();
        }

        // Create new chart
        assetChart = new Chart(ctx, {
            type: 'doughnut',
            data: chartData,
            options: chartOptions
        });

        // Create custom legend
        ChartHandler.createCustomLegend(chartAssets, totalValue);
    },

    createCustomLegend: (chartAssets, totalValue) => {
        const legendContainer = document.getElementById('chartLegend');
        if (!legendContainer) return;

        legendContainer.innerHTML = '';

        chartAssets.forEach((asset, index) => {
            const percentage = ((asset.marketValue / totalValue) * 100).toFixed(1);
            const color = CONFIG.CHART_COLORS[index];

            const legendBadge = document.createElement('div');
            legendBadge.className = 'legend-badge';
            
            legendBadge.innerHTML = `
                <div class="legend-color" style="background-color: ${color};"></div>
                <div class="legend-text">${asset.ticker}</div>
                <div class="legend-percentage">${percentage}%</div>
            `;

            legendContainer.appendChild(legendBadge);
        });
    }
};

// UI Renderer
const UIRenderer = {
    populateAssetTable: (calculatedAssets) => {
        const tableBody = document.getElementById('assetTableBody');
        if (!tableBody) return;
        
        tableBody.innerHTML = '';

        // Asset sudah tersorted dari AssetCalculator.calculateAssetValues()
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

    fetchUSDToIDRRate: async () => {
        try {
            // Primary API: Exchange Rates API (gratis, reliable)
            const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data?.rates?.IDR) {
                CONFIG.EXCHANGE_RATES.USD_TO_IDR = data.rates.IDR;
                console.log(`USD to IDR rate updated: ${data.rates.IDR}`);
                return true;
            }
            
            throw new Error("Invalid response from Exchange Rate API");
        } catch (error) {
            console.error("Error fetching USD to IDR rate:", error);
            return APIHandler.fetchUSDToIDRRateAlternative();
        }
    },

    fetchUSDToIDRRateAlternative: async () => {
        try {
            // Alternative API: Fixer.io (free tier)
            const response = await fetch('https://api.fixer.io/latest?access_key=YOUR_API_KEY&base=USD&symbols=IDR');
            
            if (!response.ok) {
                // Jika fixer.io gagal, coba API lain
                return APIHandler.fetchUSDToIDRRateFromCoinGecko();
            }
            
            const data = await response.json();
            
            if (data?.rates?.IDR) {
                CONFIG.EXCHANGE_RATES.USD_TO_IDR = data.rates.IDR;
                console.log(`USD to IDR rate updated (alternative): ${data.rates.IDR}`);
                return true;
            }
            
            return APIHandler.fetchUSDToIDRRateFromCoinGecko();
        } catch (error) {
            console.error("Error fetching USD to IDR rate from alternative source:", error);
            return APIHandler.fetchUSDToIDRRateFromCoinGecko();
        }
    },

    fetchUSDToIDRRateFromCoinGecko: async () => {
        try {
            // Menggunakan harga Bitcoin untuk menghitung exchange rate
            const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,idr');
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data?.bitcoin?.usd && data?.bitcoin?.idr) {
                const calculatedRate = data.bitcoin.idr / data.bitcoin.usd;
                CONFIG.EXCHANGE_RATES.USD_TO_IDR = calculatedRate;
                console.log(`USD to IDR rate calculated from Bitcoin prices: ${calculatedRate}`);
                return true;
            }
            
            console.warn("Using default USD to IDR rate (failed to fetch from APIs)");
            return false;
        } catch (error) {
            console.error("Error calculating USD to IDR rate from Bitcoin:", error);
            console.warn("Using default USD to IDR rate");
            return false;
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
                
                console.log(`Bitcoin price updated: ${data.bitcoin.idr} IDR`);
                return true;
            }
            
            throw new Error("Invalid response from CoinGecko API");
        } catch (error) {
            console.error("Error fetching Bitcoin price:", error);
            return false;
        }
    },

    // Gold price menggunakan manual update - tidak menggunakan API
    // Harga emas sudah ditetapkan di ASSETS array dan dapat diubah manual

    fetchAllPrices: async () => {
        try {
            console.log("Fetching market data...");
            
            // Fetch exchange rate terlebih dahulu
            const exchangeRateSuccess = await APIHandler.fetchUSDToIDRRate();
            
            // Kemudian fetch harga Bitcoin
            const bitcoinSuccess = await APIHandler.fetchBitcoinPrice();
            
            // Gold menggunakan harga manual - tidak perlu API call
            
            Utils.updateLastUpdateTimestamp();
            Dashboard.initialize();
            
            console.log(`Market data update completed at ${new Date().toLocaleString('id-ID', { timeZone: CONFIG.LAST_UPDATE.timezone })}`);
            console.log(`Exchange rate: ${exchangeRateSuccess ? 'Updated' : 'Using default'}`);
            console.log(`Bitcoin price: ${bitcoinSuccess ? 'Updated' : 'Using default'}`);
            console.log(`Gold price: Using manual price (no API)`);
            
            return { exchangeRateSuccess, bitcoinSuccess };
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
            ChartHandler.createDonutChart(calculatedAssets);
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