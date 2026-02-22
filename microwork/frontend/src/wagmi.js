import { http } from 'wagmi';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

// Define the Monad Testnet chain
export const monadTestnet = {
    id: 10143,
    name: 'Monad Testnet',
    nativeCurrency: {
        decimals: 18,
        name: 'MON',
        symbol: 'MON',
    },
    rpcUrls: {
        default: {
            http: ['https://testnet-rpc.monad.xyz'],
        },
    },
    blockExplorers: {
        default: {
            name: 'Monad Explorer',
            url: 'https://testnet.monadexplorer.com',
        },
    },
    testnet: true,
};

// RainbowKit + wagmi config
const config = getDefaultConfig({
    appName: 'MicroWork',
    projectId: '58a85a543858bee57af56cb15b8356b0',
    chains: [monadTestnet],
    transports: {
        [monadTestnet.id]: http('https://testnet-rpc.monad.xyz'),
    },
});

export { config };
