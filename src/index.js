// Configuration Constants
const CONFIG = {
    EXCHANGE_RATES: {
        USD_TO_IDR: 16210,
        USDT_TO_IDR: 16210
    },
    BTC: {
        PRICE_IDR: 1500000000,
        AVG_PRICE: 1166095031,
        SATS_TO_BTC: 100000000
    },
    BITCOIN_STRATEGY: {
        FREE_SATS: 0,
        COLLATERAL_SATS: 60000,
        USDT_BORROWED: 39.8,
        LIQUIDATION_LTV: 91,
        INTEREST_RATE: 5.76,
        BTC_YIELD_RATE: 0.27
    },
    LAST_UPDATE: {
        timestamp: null, // Will be set automatically
        timezone: 'Asia/Makassar' // WITA timezone
    },
    CHART_COLORS: [
        "rgba(255, 152, 0, 0.9)",
        "rgba(244, 67, 54, 0.9)",
        "rgba(96, 125, 255, 0.9)",
        "rgba(0, 191, 165, 0.9)",
        "rgba(255, 193, 7, 0.9)",
        "rgba(156, 39, 176, 0.9)",
        "rgba(121, 85, 72, 0.9)" // Additional color for RDN Cash
    ],
    API_REFRESH_INTERVAL: 60000 // 1 minute
};

// Asset Data - Fixed structure with correct ticker and name positions
const ASSETS = [
    {
        ticker: "Bitcoin",
        name: "BTC • Portable Asset",
        icon: "/icon/bitcoin.png",
        type: "bitcoin",
        currency: "IDR",
        showInTable: true,
        // Bitcoin-specific data
        freeSats: 0,
        collateralSats: 60000,
        avgPrice: 1166095031
    },
    {
        ticker: "IDX: CDIA",
        name: "PT Chandra Daya Investasi Tbk",
        icon: "https://assets.stockbit.com/logos/companies/TPIA.png?version=1750055121325821609",
        type: "stock",
        currency: "IDR",
        showInTable: true,
        // Stock data
        shares: 1100,
        avgPrice: 190,
        currentPrice: 1215
    },
    {
        ticker: "IDX: JSMR",
        name: "PT Jasa Marga (persero) Tbk",
        icon: "https://assets.stockbit.com/logos/companies/JSMR.png",
        type: "stock",
        currency: "IDR",
        showInTable: true,
        // Stock data
        shares: 100,
        avgPrice: 3665.49,
        currentPrice: 3570
    },
    {
        ticker: "IDX: EMTK",
        name: "PT Elang Mahkota Teknologi Tbk",
        icon: "https://assets.stockbit.com/logos/companies/EMTK.png",
        type: "stock",
        currency: "IDR",
        showInTable: true,
        // Stock data
        shares: 800,
        avgPrice: 488.73,
        currentPrice: 615
    },
    {
        ticker: "IDX: SIMP",
        name: "PT. Salim Ivomas Pratama Tbk",
        icon: "https://assets.stockbit.com/logos/companies/SIMP.png",
        type: "stock",
        currency: "IDR",
        showInTable: true,
        // Stock data
        shares: 100,
        avgPrice: 555.83,
        currentPrice: 550
    },
    {
        ticker: "IDX: COIN",
        name: "PT. Indokripto Koin Semesta Tbk",
        icon: "https://assets.stockbit.com/logos/companies/COIN.png?version=1750643999108901654",
        type: "stock",
        currency: "IDR",
        showInTable: true,
        // Stock data
        shares: 800,
        avgPrice: 100,
        currentPrice: 735
    },
    {
        ticker: "RDN: Rupiah",
        name: "Free Cash • Liquid Asset",
        icon: "../icon/idrt.png",
        type: "cash",
        currency: "IDR",
        showInTable: true,
        // Cash data
        amount: 217733, 
        avgPrice: 1, 
        currentPrice: 1 
    },
    {
        ticker: "NYSE: BRK.B",
        name: "Berkshire Hathaway Inc",
        icon: "/icon/brk.png",
        type: "stock",
        currency: "USD",
        showInTable: true,
        // Stock data
        shares: 0,
        avgPrice: 485.41,
        currentPrice: 485.41
    }
];

// Utility Functions
const Utils = {
    formatCurrency: (amount) => `Rp. ${amount.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
    
    formatUSD: (amount) => `$ ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    
    convertIDRtoUSD: (idrAmount) => idrAmount / CONFIG.EXCHANGE_RATES.USD_TO_IDR,
    
    formatNumber: (number) => {
        return number.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 3 });
    },
    
    formatBalance: (asset) => {
        switch (asset.type) {
            case "bitcoin":
                const totalSats = asset.freeSats + asset.collateralSats;
                return `${Utils.formatNumber(totalSats)} sats`;
            case "stock":
                return `${Utils.formatNumber(asset.shares)} shares`;
            case "cash":
                return Utils.formatCurrency(asset.amount);
            case "commodity":
                return `${Utils.formatNumber(asset.quantity)} ${asset.unit}`;
            case "stablecoin":
                return `${Utils.formatNumber(asset.quantity)} ${asset.unit}`;
            default:
                return "0";
        }
    },
    
    calculateInvested: (asset) => {
        switch (asset.type) {
            case "bitcoin":
                const totalSats = asset.freeSats + asset.collateralSats;
                return totalSats * asset.avgPrice / CONFIG.BTC.SATS_TO_BTC;
            case "stock":
                if (asset.currency === "USD") {
                    return asset.shares * asset.avgPrice * CONFIG.EXCHANGE_RATES.USD_TO_IDR;
                }
                return asset.shares * asset.avgPrice;
            case "cash":
                return asset.amount; // For cash, invested amount equals current amount
            case "commodity":
                return asset.quantity * asset.avgPrice;
            case "stablecoin":
                return asset.quantity * asset.avgPrice;
            default:
                return 0;
        }
    },
    
    calculateMarketValue: (asset) => {
        switch (asset.type) {
            case "bitcoin":
                const totalSats = asset.freeSats + asset.collateralSats;
                return totalSats * CONFIG.BTC.PRICE_IDR / CONFIG.BTC.SATS_TO_BTC;
            case "stock":
                if (asset.currency === "USD") {
                    return asset.shares * asset.currentPrice * CONFIG.EXCHANGE_RATES.USD_TO_IDR;
                }
                return asset.shares * asset.currentPrice;
            case "cash":
                return asset.amount; // Cash always maintains its nominal value
            case "commodity":
                return asset.quantity * asset.currentPrice;
            case "stablecoin":
                return asset.quantity * CONFIG.EXCHANGE_RATES.USDT_TO_IDR;
            default:
                return 0;
        }
    },
    
    formatPriceDisplay: (asset, isAvgPrice = false) => {
        if (asset.type === "cash") {
            return "Rp. 1"; // Always show Rp. 1 for cash
        }
        
        const price = isAvgPrice ? asset.avgPrice : asset.currentPrice;
        
        if (asset.currency === "USD") {
            return Utils.formatUSD(price);
        } else if (asset.type === "bitcoin") {
            return `Rp. ${(price / 1000000).toLocaleString('id-ID', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })} jt`;
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
        const formattedDate = formatter.format(date);
        
        return `${formattedDate} WITA`;
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

            return {
                name: asset.name,
                ticker: asset.ticker,
                icon: asset.icon,
                balance,
                invested: Math.round(invested),
                avgPrice: asset.avgPrice,
                currentPrice: asset.type === "bitcoin" ? CONFIG.BTC.PRICE_IDR : asset.currentPrice,
                currency: asset.currency,
                type: asset.type,
                showInTable: asset.showInTable,
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
        
        // Filter assets that should be shown in table and sort by market value (descending)
        const tableAssets = calculatedAssets
            .filter(asset => asset.showInTable)
            .sort((a, b) => b.marketValue - a.marketValue);

        tableAssets.forEach(asset => {
            const row = document.createElement('tr');
            const pnlValue = asset.marketValue - asset.invested;
            const returnClass = Utils.getReturnClass(asset.returnPercent);
            const returnSign = Utils.getReturnSign(asset.returnPercent);

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
                <td>${Utils.formatCurrency(asset.invested)}</td>
                <td>${Utils.formatPriceDisplay(asset, true)}</td>
                <td>${Utils.formatPriceDisplay(asset)}</td>
                <td>${Utils.formatCurrency(asset.marketValue)}</td>
                <td class="${returnClass}">${Utils.formatCurrency(pnlValue)}</td>
                <td class="${returnClass}">${returnSign}${Math.abs(asset.returnPercent).toFixed(2)}%</td>
            `;

            tableBody.appendChild(row);
        });
    },

    updatePortfolioSummary: (calculatedAssets) => {
        // Only include assets shown in table for portfolio summary
        const liquidAssets = calculatedAssets.filter(asset => asset.showInTable);
        const totalInvested = liquidAssets.reduce((sum, asset) => sum + asset.invested, 0);
        const totalMarketValue = liquidAssets.reduce((sum, asset) => sum + asset.marketValue, 0);
        const totalPnL = totalMarketValue - totalInvested;
        const totalPercentage = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;
        const debtAmount = CONFIG.BITCOIN_STRATEGY.USDT_BORROWED * CONFIG.EXCHANGE_RATES.USDT_TO_IDR;
        const usdEquivalent = Utils.convertIDRtoUSD(totalMarketValue);

        // Update UI elements
        const elements = {
            totalEquity: document.getElementById('totalEquity'),
            usdEquivalent: document.getElementById('usdEquivalent'),
            totalPnL: document.getElementById('totalPnL'),
            totalDebt: document.getElementById('totalDebt'),
            totalPercentage: document.getElementById('totalPercentage'),
            currentLTV: document.getElementById('currentLTV'),
            usdRateDisplay: document.getElementById('usdRateDisplay')
        };

        if (elements.totalEquity) elements.totalEquity.textContent = Utils.formatCurrency(totalMarketValue);
        if (elements.usdEquivalent) elements.usdEquivalent.textContent = `≈ ${Utils.formatUSD(usdEquivalent)}`;
        if (elements.totalDebt) elements.totalDebt.textContent = Utils.formatCurrency(debtAmount);

        if (elements.usdRateDisplay) {
            elements.usdRateDisplay.textContent = `1 USD = ${Utils.formatCurrency(CONFIG.EXCHANGE_RATES.USD_TO_IDR)}`;
        }

        if (elements.totalPnL) {
            elements.totalPnL.textContent = `${totalPnL >= 0 ? '+ ' : '- '}${Utils.formatCurrency(Math.abs(totalPnL))}`;
            elements.totalPnL.className = `stat-value ${totalPnL >= 0 ? 'positive' : 'negative'}`;
        }

        if (elements.totalPercentage) {
            elements.totalPercentage.textContent = `${totalPercentage >= 0 ? '+ ' : '- '}${Math.abs(totalPercentage).toFixed(2)}%`;
            elements.totalPercentage.className = `stat-value ${totalPercentage >= 0 ? 'positive' : 'negative'}`;
        }

        if (elements.currentLTV) {
            const btcCollateralBtc = CONFIG.BITCOIN_STRATEGY.COLLATERAL_SATS / CONFIG.BTC.SATS_TO_BTC;
            const btcValueIdr = btcCollateralBtc * CONFIG.BTC.PRICE_IDR;
            const usdtValueIdr = CONFIG.BITCOIN_STRATEGY.USDT_BORROWED * CONFIG.EXCHANGE_RATES.USDT_TO_IDR;
            const currentLTV = (usdtValueIdr / btcValueIdr) * 100;
            elements.currentLTV.textContent = `${currentLTV.toFixed(2)}%`;
        }
    },

    createDonutChart: (calculatedAssets) => {
        const canvas = document.getElementById('donutChart');
        if (!canvas || typeof Chart === 'undefined') return;

        const ctx = canvas.getContext('2d');
        
        // Include table assets + USDT debt for donut chart
        const filteredAssets = calculatedAssets
            .filter(asset => asset.marketValue > 0)
            .sort((a, b) => b.marketValue - a.marketValue);

        // Add USDT debt as virtual asset for donut chart
        const usdtDebt = {
            ticker: "Tether USD",
            marketValue: CONFIG.BITCOIN_STRATEGY.USDT_BORROWED * CONFIG.EXCHANGE_RATES.USDT_TO_IDR
        };
        
        // Combine assets with USDT debt and sort by market value (descending)
        const assetsWithUsdt = [...filteredAssets, usdtDebt]
            .sort((a, b) => b.marketValue - a.marketValue);
        
        const totalValue = assetsWithUsdt.reduce((sum, asset) => sum + asset.marketValue, 0);
        const data = assetsWithUsdt.map(asset => asset.marketValue);
        const labels = assetsWithUsdt.map(asset => asset.ticker);

        // Destroy existing chart
        if (window.donutChartInstance) {
            window.donutChartInstance.destroy();
        }

        // Create new chart
        window.donutChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels,
                datasets: [{
                    data,
                    backgroundColor: CONFIG.CHART_COLORS,
                    borderColor: '#000000',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const value = context.raw;
                                const percentage = ((value / totalValue) * 100).toFixed(1);
                                return `${context.label}: ${Utils.formatCurrency(value)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });

        // Update legend with sorted data
        const legendContainer = document.getElementById('donutLegend');
        if (legendContainer) {
            legendContainer.innerHTML = '';
            assetsWithUsdt.forEach((asset, index) => {
                const percentage = ((asset.marketValue / totalValue) * 100).toFixed(1);
                const legendItem = document.createElement('div');
                legendItem.className = 'legend-item';
                legendItem.innerHTML = `
                    <div class="legend-color" style="background-color: ${CONFIG.CHART_COLORS[index % CONFIG.CHART_COLORS.length]}"></div>
                    <div class="legend-text">${asset.ticker} (${percentage}%)</div>
                `;
                legendContainer.appendChild(legendItem);
            });
        }
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
    fetchUSDRate: async () => {
        try {
            const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data?.rates?.IDR) {
                CONFIG.EXCHANGE_RATES.USD_TO_IDR = data.rates.IDR;
                CONFIG.EXCHANGE_RATES.USDT_TO_IDR = data.rates.IDR;
                console.log(`USD rate updated: 1 USD = ${CONFIG.EXCHANGE_RATES.USD_TO_IDR} IDR`);
                return true;
            }
            
            throw new Error("Invalid response from Exchange Rate API");
        } catch (error) {
            console.error("Error fetching USD rate:", error);
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
                CONFIG.BTC.PRICE_IDR = data.bitcoin.idr;
                
                if (data.bitcoin.usd) {
                    const usdToIdrRate = data.bitcoin.idr / data.bitcoin.usd;
                    CONFIG.EXCHANGE_RATES.USD_TO_IDR = usdToIdrRate;
                    CONFIG.EXCHANGE_RATES.USDT_TO_IDR = usdToIdrRate;
                    console.log(`USD rate updated from Bitcoin API: 1 USD = ${CONFIG.EXCHANGE_RATES.USD_TO_IDR} IDR`);
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
            console.log("Fetching all market data...");
            
            const [bitcoinSuccess, usdSuccess] = await Promise.all([
                APIHandler.fetchBitcoinPrice(),
                APIHandler.fetchUSDRate()
            ]);
            
            Utils.updateLastUpdateTimestamp();
            Dashboard.initialize();
            
            const successMessage = [];
            if (bitcoinSuccess) successMessage.push("Bitcoin price");
            if (usdSuccess) successMessage.push("USD rate");
            
            if (successMessage.length > 0) {
                console.log(`Successfully updated: ${successMessage.join(", ")} at ${new Date().toLocaleString('id-ID', { timeZone: CONFIG.LAST_UPDATE.timezone })}`);
            }
            
            return bitcoinSuccess || usdSuccess;
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
            UIRenderer.createDonutChart(calculatedAssets);
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
            console.log("Auto-refreshing market data (Bitcoin price & USD rate)");
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