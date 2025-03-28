const { payment } = require('../core/payment');
const { Logger } = require('../core/logger'); // Assuming a logger module exists
const dotenv = require('dotenv');
const AstroNeuralEconomicAmplifier = require('./anea'); // Import the ANEA class

dotenv.config(); // Load environment variables

class StabilityManager {
    constructor(targetValueGTC = parseFloat(process.env.TARGET_VALUE_GTC) || 314159) {
        this.targetValueGTC = targetValueGTC; // 1 GTC = $314,159
        this.targetValueGU = 1; // 1 GU = $1
        this.subunitRatio = 314159; // 1 GTC = 314,159 GU
        this.liquidityPool = {
            gtc: parseFloat(process.env.INITIAL_GTC) || 1000000, // Initial GTC reserve
            usd: parseFloat(process.env.INITIAL_USD) || 314159000000 // Initial USD reserve
        };
        this.logger = new Logger();
        this.anea = new AstroNeuralEconomicAmplifier(); // Initialize ANEA
    }

    async stabilize(currentPriceGTC) {
        try {
            const adjustmentAmount = this.calculateAdjustment(currentPriceGTC);
            if (adjustmentAmount.gtc !== 0 || adjustmentAmount.usd !== 0) {
                this.liquidityPool.gtc += adjustmentAmount.gtc;
                this.liquidityPool.usd -= adjustmentAmount.usd;

                if (this.liquidityPool.usd < 0) {
                    throw new Error("Insufficient USD in liquidity pool after adjustment.");
                }

                this.logger.info(`Stabilized GTC: Pool = ${this.liquidityPool.gtc} GTC, ${this.liquidityPool.usd} USD`);
                await payment.updateLiquidity(this.liquidityPool);
            } else {
                this.logger.info("No adjustment needed for GTC stabilization.");
            }

            // Amplify liquidity using ANEA
            const amplifiedLiquidity = this.anea.amplifyLiquidity();
            this.logger.info(`Amplified Liquidity: ${amplifiedLiquidity}`);
        } catch (error) {
            this.logger.error(`Error stabilizing GTC: ${error.message}`);
        }
    }

    calculateAdjustment(currentPriceGTC) {
        const priceDifference = currentPriceGTC - this.targetValueGTC;
        const adjustmentFactor = Math.sign(priceDifference) * Math.min(Math.abs(priceDifference) / 1000, 100); // Dynamic adjustment
        return {
            gtc: adjustmentFactor * 1000,
            usd: adjustmentFactor * 1000 * this.targetValueGTC
        };
    }

    getCurrentPriceGTC() {
        return this.targetValueGTC + (Math.random() - 0.5) * 1000; // Simulated fluctuation
    }

    async checkLiquidity() {
        this.logger.info(`Current Liquidity Pool: ${this.liquidityPool.gtc} GTC, ${this.liquidityPool.usd} USD`);
        return this.liquidityPool;
    }

    async resetLiquidity() {
        this.liquidityPool.gtc = parseFloat(process.env.INITIAL_GTC) || 1000000;
        this.liquidityPool.usd = parseFloat(process.env.INITIAL_USD) || 314159000000;
        this.logger.info("Liquidity pool has been reset to initial values.");
    }
}

module.exports = new StabilityManager();
