#!/usr/bin/env node
/**
 * Test Smart Contracts on Polygon Amoy
 * Quick verification that contracts are live and working
 */

const https = require('https');

const CONTRACTS = {
  'SimpleZKBadge': '0x9e6343BB504Af8a39DB516d61c4Aa0aF36c54678',
  'CreditPassport': '0x1112373c9954B9bbFd91eb21175699b609A1b551',
  'ProofRegistry': '0x296DB144E62C8C826bffA4503Dc9Fbf29F25D44B',
  'SimpleZKBadgeV2': '0x3d586E681b12B07825F17Ce19B28e1F576a1aF89'
};

const RPC_URL = 'https://rpc-amoy.polygon.technology';

console.log('🔍 Testing Smart Contracts on Polygon Amoy...\n');

// Test if contract exists by checking code
function checkContract(name, address) {
  return new Promise((resolve) => {
    const data = JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_getCode',
      params: [address, 'latest'],
      id: 1
    });

    const options = {
      hostname: 'rpc-amoy.polygon.technology',
      port: 443,
      path: '/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          const code = response.result;
          const exists = code && code !== '0x' && code.length > 10;
          
          if (exists) {
            console.log(`✅ ${name}`);
            console.log(`   Address: ${address}`);
            console.log(`   Status: Live & Deployed`);
            console.log(`   Explorer: https://amoy.polygonscan.com/address/${address}`);
          } else {
            console.log(`❌ ${name}`);
            console.log(`   Address: ${address}`);
            console.log(`   Status: Not found or not deployed`);
          }
          console.log('');
          resolve(exists);
        } catch (error) {
          console.log(`⚠️  ${name} - Error checking: ${error.message}\n`);
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      console.log(`⚠️  ${name} - Network error: ${error.message}\n`);
      resolve(false);
    });

    req.write(data);
    req.end();
  });
}

// Test all contracts
async function testAll() {
  let allGood = true;
  
  for (const [name, address] of Object.entries(CONTRACTS)) {
    const exists = await checkContract(name, address);
    if (!exists) allGood = false;
  }
  
  console.log('─'.repeat(60));
  if (allGood) {
    console.log('✅ All contracts are live and ready for testing!');
    console.log('\n📖 Next steps:');
    console.log('1. Get testnet MATIC: https://faucet.polygon.technology/');
    console.log('2. Add Polygon Amoy to MetaMask');
    console.log('3. Open http://localhost:3030');
    console.log('4. Connect wallet and start testing!');
  } else {
    console.log('⚠️  Some contracts may not be deployed');
    console.log('Check the addresses and network configuration');
  }
  console.log('─'.repeat(60));
}

testAll();
