import fetch from 'node-fetch';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { walletAddress } = req.body;

    if (!walletAddress) {
        return res.status(400).json({ error: 'Missing wallet address' });
    }

    try {
        const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
        const alchemyUrl = `https://citrea-testnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;

        const response = await fetch(alchemyUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'eth_getTransactionCount',
                params: [walletAddress, 'latest']
            }),
        });

        const data = await response.json();

        if (data.error) {
            return res.status(400).json({ error: data.error.message || 'Alchemy API error' });
        }

        const txCount = parseInt(data.result, 16);
        res.status(200).json({ success: true, transactionCount: txCount });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error: ' + error.message });
    }
}
