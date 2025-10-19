require('dotenv').config(); // Load .env variables
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path'); 
const app = express();

app.use(express.static(path.join(__dirname, 'public')))

const PORT = process.env.PORT || 3000;
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// API endpoint
app.post('/api/transaction-count', async (req, res) => {
    try {
        const { walletAddress } = req.body;

        if (!walletAddress) {
            return res.status(400).json({ error: 'Missing wallet address' });
        }

        const alchemyUrl = `https://citrea-testnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;

        const response = await fetch(alchemyUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'eth_getTransactionCount',
                params: [walletAddress, 'latest']
            })
        });

        const data = await response.json();

        if (data.error) {
            return res.status(400).json({ error: data.error.message || 'Alchemy API error' });
        }

        const txCount = parseInt(data.result, 16);
        res.json({ success: true, transactionCount: txCount });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error: ' + error.message });
    }
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
