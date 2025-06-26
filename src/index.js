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
                COLLATERAL_SATS: 110031,
                USDT_BORROWED: 55.35,
                LIQUIDATION_LTV: 91,
                INTEREST_RATE: 5.76,
                BTC_YIELD_RATE: 0.27
            },
            STOCKS: {
                BBCA: {
                    PRICE_IDR: 10000, // Default price, will be updated
                    SYMBOL: 'BBCA.JK'
                },
                BRK_B: {
                    PRICE_USD: 485.41, // Default price, will be updated
                    SYMBOL: 'BRK-B'
                }
            },
            LAST_UPDATE: {
                DATE: "04 Mei",
                YEAR: "2025",
                TIME: "17:00",
                TIMEZONE: "Wita"
            },
            CHART_COLORS: [
                "rgba(255, 152, 0, 0.9)",
                "rgba(96, 125, 255, 0.9)",
                "rgba(0, 191, 165, 0.9)",
                "rgba(255, 193, 7, 0.9)",
                "rgba(156, 39, 176, 0.9)",
                "rgba(233, 30, 99, 0.9)"
            ],
            API_REFRESH_INTERVAL: 300000 // 5 minutes (to avoid rate limiting)
        };

        // Asset Data
        const ASSETS = [
            {
                name: "Bitcoin",
                ticker: "BTC • Portable Digital Asset",
                icon: "/icon/bitcoin.png",
                balance: () => `${(CONFIG.BITCOIN_STRATEGY.FREE_SATS + CONFIG.BITCOIN_STRATEGY.COLLATERAL_SATS).toLocaleString('id-ID')} sats`,
                invested: () => (CONFIG.BITCOIN_STRATEGY.FREE_SATS + CONFIG.BITCOIN_STRATEGY.COLLATERAL_SATS) * CONFIG.BTC.AVG_PRICE / CONFIG.BTC.SATS_TO_BTC,
                avgPrice: () => CONFIG.BTC.AVG_PRICE,
                currentPrice: () => CONFIG.BTC.PRICE_IDR,
                currency: "IDR",
                type: "liquid"
            },
            {
                name: "Bank Central Asia",
                ticker: "IDX: BBCA • Banking",
                icon: "/icon/bbca.png",
                balance: () => "0 shares",
                invested: () => 0,
                avgPrice: () => CONFIG.STOCKS.BBCA.PRICE_IDR,
                currentPrice: () => CONFIG.STOCKS.BBCA.PRICE_IDR,
                currency: "IDR",
                type: "liquid"
            },
            {
                name: "Chandra Daya Investasi",
                ticker: "IDX: CDIA • Infrastructures ",
                icon: "https://assets.stockbit.com/logos/companies/TPIA.png?version=1750055121325821609",
                balance: () => "0 shares",
                invested: () => 0,
                avgPrice: () => 1,
                currentPrice: () => 1,
                currency: "IDR",
                type: "liquid"
            },
            {
                name: "Paxos Gold",
                ticker: "PAXG • Tokenized Gold",
                icon: "/icon/paxg.png",
                balance: () => "0 troy",
                invested: () => 0,
                avgPrice: () => 1,
                currentPrice: () => 1,
                currency: "IDR",
                type: "liquid"
            },
            {
                name: "MicroStrategy Inc",
                ticker: "NASDAQ: MSTR • Technology",
                icon: "/icon/mstr.png",
                balance: () => "0 shares",
                invested: () => 0,
                avgPrice: () => 203.77,
                currentPrice: () => 400,
                currency: "USD",
                type: "liquid"
            },
            {
                name: "Berkshire Hathaway Inc",
                ticker: "NYSE: BRK.B • Conglomerate",
                icon: "/icon/brk.png",
                balance: () => "0.0093 shares",
                invested: () => 0,
                avgPrice: () => 485.41,
                currentPrice: () => CONFIG.STOCKS.BRK_B.PRICE_USD,
                currency: "USD",
                type: "liquid"
            }
        ];

        // Utility Functions
        const Utils = {
            formatCurrency: (amount) => `Rp. ${amount.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
            
            formatUSD: (amount) => `$ ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            
            convertIDRtoUSD: (idrAmount) => idrAmount / CONFIG.EXCHANGE_RATES.USD_TO_IDR,
            
            parseShareQuantity: (shareStr) => {
                if (!shareStr) return 0;
                const match = shareStr.match(/(\d+\.?\d*)/);
                return match ? parseFloat(match[1]) : 0;
            },
            
            formatPriceDisplay: (asset, isAvgPrice = false) => {
                const price = isAvgPrice ? asset.avgPrice : asset.currentPrice;
                
                if (asset.currency === "USD") {
                    return Utils.formatUSD(price);
                } else if (asset.name === "Bitcoin") {
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
            
            getCurrentDateTime: () => {
                const now = new Date();
                const months = [
                    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
                    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
                ];
                
                const day = now.getDate();
                const month = months[now.getMonth()];
                const year = now.getFullYear();
                const hours = now.getHours().toString().padStart(2, '0');
                const minutes = now.getMinutes().toString().padStart(2, '0');
                
                return {
                    DATE: `${day} ${month}`,
                    YEAR: year.toString(),
                    TIME: `${hours}:${minutes}`,
                    TIMEZONE: "Wita"
                };
            }
        };

        // Asset Calculator
        const AssetCalculator = {
            calculateAssetValues: () => {
                return ASSETS.map(asset => {
                    const balance = typeof asset.balance === 'function' ? asset.balance() : asset.balance;
                    const invested = typeof asset.invested === 'function' ? asset.invested() : asset.invested;
                    const avgPrice = typeof asset.avgPrice === 'function' ? asset.avgPrice() : asset.avgPrice;
                    const currentPrice = typeof asset.currentPrice === 'function' ? asset.currentPrice() : asset.currentPrice;
                    
                    let marketValue;
                    let actualInvested = invested;

                    if (asset.currency === "USD") {
                        const shares = Utils.parseShareQuantity(balance);
                        actualInvested = shares * avgPrice * CONFIG.EXCHANGE_RATES.USD_TO_IDR;
                        marketValue = shares * currentPrice * CONFIG.EXCHANGE_RATES.USD_TO_IDR;
                    } else {
                        marketValue = actualInvested * (currentPrice / avgPrice);
                    }

                    const returnPercent = actualInvested > 0 ? ((marketValue - actualInvested) / actualInvested) * 100 : 0;

                    return {
                        name: asset.name,
                        ticker: asset.ticker,
                        icon: asset.icon,
                        balance,
                        invested: Math.round(actualInvested),
                        avgPrice,
                        currentPrice,
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
                
                // Sort by market value (descending)
                const sortedAssets = [...calculatedAssets].sort((a, b) => b.marketValue - a.marketValue);

                sortedAssets.forEach(asset => {
                    const row = document.createElement('tr');
                    const pnlValue = asset.marketValue - asset.invested;
                    const returnClass = Utils.getReturnClass(asset.returnPercent);
                    const returnSign = Utils.getReturnSign(asset.returnPercent);

                    row.innerHTML = `
                        <td>
                            <span class="asset-icon">
                                <img src="${asset.icon}" alt="${asset.name}">
                            </span>
                            <span class="asset-name">
                                ${asset.name}
                                <span class="asset-ticker">${asset.ticker}</span>
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
                const liquidAssets = calculatedAssets.filter(asset => asset.type === "liquid");
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
                    currentLTV: document.getElementById('currentLTV')
                };

                if (elements.totalEquity) elements.totalEquity.textContent = Utils.formatCurrency(totalMarketValue);
                if (elements.usdEquivalent) elements.usdEquivalent.textContent = `≈ ${Utils.formatUSD(usdEquivalent)}`;
                if (elements.totalDebt) elements.totalDebt.textContent = Utils.formatCurrency(debtAmount);

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
                const filteredAssets = calculatedAssets
                    .filter(asset => asset.type === "liquid" && asset.marketValue > 0)
                    .sort((a, b) => b.marketValue - a.marketValue);

                const totalValue = filteredAssets.reduce((sum, asset) => sum + asset.marketValue, 0);
                const data = filteredAssets.map(asset => asset.marketValue);
                const labels = filteredAssets.map(asset => asset.name);

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

                // Update legend
                const legendContainer = document.getElementById('donutLegend');
                if (legendContainer) {
                    legendContainer.innerHTML = '';
                    filteredAssets.forEach((asset, index) => {
                        const percentage = ((asset.marketValue / totalValue) * 100).toFixed(1);
                        const legendItem = document.createElement('div');
                        legendItem.className = 'legend-item';
                        legendItem.innerHTML = `
                            <div class="legend-color" style="background-color: ${CONFIG.CHART_COLORS[index % CONFIG.CHART_COLORS.length]}"></div>
                            <div class="legend-text">${asset.name} (${percentage}%)</div>
                        `;
                        legendContainer.appendChild(legendItem);
                    });
                }
            },

            displayLastUpdate: () => {
                const lastUpdateElement = document.getElementById('lastUpdate');
                if (lastUpdateElement) {
                    const formattedUpdate = `${CONFIG.LAST_UPDATE.DATE} ${CONFIG.LAST_UPDATE.YEAR}, Pukul ${CONFIG.LAST_UPDATE.TIME} ${CONFIG.LAST_UPDATE.TIMEZONE}`;
                    lastUpdateElement.innerHTML = `Last Update: <br> ${formattedUpdate}`;
                }
            }
        };

        // API Handler
        const APIHandler = {
            // Fetch Bitcoin price from CoinGecko
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

            // Fetch Indonesian stock prices (BBCA) from Yahoo Finance
            fetchIDXStockPrices: async () => {
                try {
                    // Using Yahoo Finance API for Indonesian stocks
                    const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${CONFIG.STOCKS.BBCA.SYMBOL}`);
                    
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    
                    const data = await response.json();
                    
                    if (data?.chart?.result?.[0]?.meta?.regularMarketPrice) {
                        const price = data.chart.result[0].meta.regularMarketPrice;
                        CONFIG.STOCKS.BBCA.PRICE_IDR = price;
                        console.log(`BBCA price updated: ${price} IDR`);
                        return true;
                    }
                    
                    throw new Error("Invalid response from Yahoo Finance API for BBCA");
                } catch (error) {
                    console.error("Error fetching BBCA price:", error);
                    return false;
                }
            },

            // Fetch US stock prices (BRK.B) from Yahoo Finance
            fetchUSStockPrices: async () => {
                try {
                    const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${CONFIG.STOCKS.BRK_B.SYMBOL}`);
                    
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    
                    const data = await response.json();
                    
                    if (data?.chart?.result?.[0]?.meta?.regularMarketPrice) {
                        const price = data.chart.result[0].meta.regularMarketPrice;
                        CONFIG.STOCKS.BRK_B.PRICE_USD = price;
                        console.log(`BRK.B price updated: $${price} USD`);
                        return true;
                    }
                    
                    throw new Error("Invalid response from Yahoo Finance API for BRK.B");
                } catch (error) {
                    console.error("Error fetching BRK.B price:", error);
                    return false;
                }
            },

            // Alternative API using Alpha Vantage (free tier)
            fetchStockPricesAlternative: async () => {
                try {
                    // Using free API from finhub.io (no API key required for basic use)
                    const promises = [
                        fetch('https://finnhub.io/api/v1/quote?symbol=BRK.B&token=demo'),
                        // Note: Indonesian stocks might not be available on free APIs
                        // You might need to use a different approach for BBCA
                    ];

                    const responses = await Promise.allSettled(promises);
                    
                    // Handle BRK.B response
                    if (responses[0].status === 'fulfilled' && responses[0].value.ok) {
                        const brkData = await responses[0].value.json();
                        if (brkData.c) { // 'c' is current price
                            CONFIG.STOCKS.BRK_B.PRICE_USD = brkData.c;
                            console.log(`BRK.B price updated (alternative): $${brkData.c} USD`);
                        }
                    }

                    return true;
                } catch (error) {
                    console.error("Error fetching alternative stock prices:", error);
                    return false;
                }
            },

            // Update timestamp
            updateTimestamp: () => {
                const currentDateTime = Utils.getCurrentDateTime();
                CONFIG.LAST_UPDATE = currentDateTime;
                console.log(`Timestamp updated: ${currentDateTime.DATE} ${currentDateTime.YEAR}, ${currentDateTime.TIME} ${currentDateTime.TIMEZONE}`);
            },

            // Fetch all prices
            fetchAllPrices: async () => {
                console.log("Fetching all prices...");
                
                const results = await Promise.allSettled([
                    APIHandler.fetchBitcoinPrice(),
                    APIHandler.fetchIDXStockPrices(),
                    APIHandler.fetchUSStockPrices()
                ]);

                // If Yahoo Finance fails, try alternative API
                if (results[2].status === 'rejected' || !results[2].value) {
                    console.log("Trying alternative API for US stocks...");
                    await APIHandler.fetchStockPricesAlternative();
                }

                // Update timestamp after fetching prices
                APIHandler.updateTimestamp();
                
                // Refresh dashboard
                Dashboard.initialize();
                
                const successCount = results.filter(result => result.status === 'fulfilled' && result.value).length;
                console.log(`Price update completed. ${successCount}/${results.length} APIs successful.`);
                
                return successCount > 0;
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
                // Initial fetch
                APIHandler.fetchAllPrices();
                
                // Set up interval for auto-refresh
                setInterval(() => {
                    console.log("Auto-refreshing all prices...");
                    APIHandler.fetchAllPrices();
                }, CONFIG.API_REFRESH_INTERVAL);
                
                console.log(`Auto-refresh setup complete. Will update every ${CONFIG.API_REFRESH_INTERVAL / 1000 / 60} minutes.`);
            },

            // Manual refresh function (can be called from UI)
            manualRefresh: () => {
                console.log("Manual refresh triggered");
                APIHandler.fetchAllPrices();
            }
        };

        // Initialize when DOM is ready
        document.addEventListener('DOMContentLoaded', () => {
            console.log("DOM loaded, initializing dashboard");
            Dashboard.initialize();
            Dashboard.setupAutoRefresh();
        });

        // Expose manual refresh function to global scope for potential UI button
        window.refreshPrices = Dashboard.manualRefresh;