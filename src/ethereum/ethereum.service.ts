import {forwardRef, Inject, Injectable, OnModuleInit} from '@nestjs/common';
import { ethers } from 'ethers';
import {EventsGateway} from '../events/events.gateway';
import {ApiService} from '../api/api.service';
import {WalletBotService} from '../wallet-bot/wallet-bot.service';
import {routerAbi, uniswapAbi} from './utils/uniswap.abi';
import {ConfigService} from '@nestjs/config';
import {HttpService} from '@nestjs/axios';
import {lastValueFrom, Observable} from 'rxjs';
import {AxiosResponse} from 'axios';
const abiDecoder = require('abi-decoder');
// import { AddressService } from './address.service'; // Service to interact with addresses in your database
import { parseSwap } from '@0x/0x-parser'
import {Hash} from 'viem';

@Injectable()
export class EthereumService implements OnModuleInit {
  private provider: ethers.WebSocketProvider;
  private mainnetProvider: ethers.WebSocketProvider;
  private monitoredAddresses: Set<string> = new Set();
  private contractInterface = new ethers.Interface(uniswapAbi)
  private API_KEY = this.configService.get<string>('bot.apiKeyMainnet');
  private API_KEY_ETHERSCAN = this.configService.get<string>('bot.apiKeyEtherscan');
  private abiCoder: ethers.AbiCoder = new ethers.AbiCoder()
  private abIDecoder = abiDecoder
  private eth = ethers
  private transactionDetailsCache = new Map<string, any>();
  private EXCHANGE_PROXY_ABI_URL = "https://raw.githubusercontent.com/0xProject/protocol/development/packages/contract-artifacts/artifacts/IZeroEx.json"

  constructor(
    private eventsGateway: EventsGateway,
    @Inject(forwardRef(() => ApiService))
    private apiService: ApiService,
    private walletBotService: WalletBotService,
    private configService: ConfigService,
    private httpService: HttpService,

  ) {

    this.provider = new ethers.WebSocketProvider(`wss://eth-goerli.g.alchemy.com/v2/${this.API_KEY}`);
    // this.mainnetProvider = new ethers.WebSocketProvider('wss://eth-mainnet.g.alchemy.com/v2/0XGuNqbwCgTVCsJsXFEMl72x1wt7f4J4');
  }

  async onModuleInit() {
    // Fetch initial list of addresses from the database on module initialization
    const addresses = await this.apiService.getAllAddresses();
    addresses.forEach(address => this.addAddress(address));

    // Start listening to transactions
    this.provider.on('pending', (txHash) => {
      this.provider.getTransaction(txHash).then(async (transaction) => {
        if (transaction && (this.monitoredAddresses.has(transaction.from) || this.monitoredAddresses.has(transaction.to))) {
          // await this.provider.waitForTransaction(txHash, 3);
          this.checkTransaction(txHash);
        }
      }).catch(error => console.error(error));
    });
  }

  private async retryWithExponentialBackoff<T>(operation: () => Promise<T>, maxRetries: number = 5, initialDelay: number = 1000): Promise<T> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === maxRetries - 1) {
          console.log(`Operation failed after ${maxRetries} retries.`);
        }
        const delay = initialDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw new Error('Operation failed after maximum retries.');
  }

  async fetchContractABI(contractAddress: string) {
    console.log(contractAddress)
    const etherscanApiKey = this.configService.get<string>('bot.apiKeyEtherscan');
    const url = `https://api.etherscan.io/api?module=contract&action=getabi&address=${contractAddress}&apikey=${etherscanApiKey}`;
    console.log(url)

    try {
      const response = await this.httpService.axiosRef.get(url);
      if (response.data.status !== '1') {
        throw new Error('ABI not found');
      }

      return JSON.parse(response.data.result);
    } catch (error) {
      console.error('Error fetching contract ABI:', error);
      throw error;
    }
  }

  async fetchTransactionDetails(txHash: string) {
    const url = `https://api-goerli.etherscan.io/api?module=proxy&action=eth_getTransactionByHash&txhash=${txHash}&apikey=${this.API_KEY_ETHERSCAN}`;

    try {
      const response = await this.httpService.axiosRef.get(url);
      return response.data.result;
    } catch (error) {
      console.error('Error fetching transaction details:', error);
      throw new Error('Failed to fetch transaction details.');
    }
  }

  private decodePath(path: string): void {
    const decodedPath = []

    const pathData = path.slice(2)

    let idx = 0;
    let inputToken

    inputToken = `0x${pathData.slice(idx, idx + 40)}`
    idx += 40;

    while (idx < pathData.length) {
      const fee = parseInt(pathData.slice(idx, idx + 6), 16)
      idx += 6;

      const outputToken = `0x${pathData.slice(idx, idx + 40)}`
      idx += 40;

      decodedPath.push({ inputToken: inputToken, fee, outputToken: outputToken })

      inputToken = outputToken
    }

    console.log(decodedPath)
  }
  private async checkTransaction(txHash: Hash): Promise<void> {
    if (this.transactionDetailsCache.has("0x74446a3bed06c3371cda798a6ddd32d9bdbe03a87435d31756fcbf9e9731c459")) {
      return; // Skip if already processed
    }
    // console.log("txHash", txHash)
    try {
      const transaction = await this.retryWithExponentialBackoff(() => this.mainnetProvider.getTransaction('0xcf032f7fa5898ed335d53c3e074eef10723c74a8e6540655427d7ab399f754e6'));
      console.log({transaction})
      if(this.isUniswapTransaction(transaction.data)) {
        console.log("Uniswap transaction detected")
      }
      console.log("transaction", transaction)
      const txn_url = `https://goerli.etherscan.io/tx/${txHash}`;
      const address = transaction.from.startsWith('0x') ? this.formatAddress(transaction.from) : transaction.from;
      console.log("txn_url", txn_url)
      const transactionDetails = await this.parseEtherscan(txn_url, address);
      console.log("transactionDetails", transactionDetails.data);
      console.log("transaction", transaction)
      // const abi = await this.fetchContractABI(transaction.to);
      // this.abIDecoder.addABI(abi)
      // const data = this.abIDecoder.decodeMethod(transaction.data);
      // console.log(JSON.stringify(data, null, 2))
      // const innerData = this.abIDecoder.decodeMethod(data.params[1].value[0])
      // console.log(data.params[1].value[0])
      // console.log("========InerData========")
      // console.log(JSON.stringify(innerData, null, 2))
      // const data = this.abIDecoder.decodeMethod(transaction.data);
      // console.log('ABI', abi);
      // this.contractInterface = new ethers.Interface(abi)
      // const message = this.contractInterface.parseTransaction({
      //   data: transaction.data,
      // })
      // const params = message.args.params
      // const path = params.path
      // this.decodePath(path)



      if (transaction && (this.monitoredAddresses.has(transaction.from) || this.monitoredAddresses.has(transaction.to))) {
        console.log(transaction)
        const message = this.contractInterface.parseTransaction({
          data: transaction.data,
        })
        console.log(message)
        // console.log("message", message);
        // this.notifyUsers(transaction, transactionDetails.data);
        console.log('Transaction To address', transaction.to);
        const abi = await this.fetchContractABI(transaction.to);
        console.log('ABI', abi);

      }
    } catch (error) {
      console.error(`Failed to fetch transaction after retries: ${txHash}`, error);
    }
  }

  private async parseEtherscan(txnUrl: string, formattedAddress): Promise<any> {
    const body = {
      txn_url: txnUrl,
      address: formattedAddress
    };
    const observable = this.httpService.post('http://127.0.0.1:5000/parse-etherscan', body);
    return lastValueFrom(observable); // Convert the Observable to a Promise
  }

  private formatAddress(address: string): string {
    return `${address.substring(0, 8)}...${address.substring(address.length - 8)}`;
  }
  isUniswapTransaction(inputData: string): boolean {
    // Common method signatures for Uniswap swap functions
    const swapMethodSignatures = [
      '0x38ed1739', // swapExactTokensForTokens
      '0x8803dbee', // swapTokensForExactTokens
      '0x7ff36ab5', // swapExactETHForTokens
      '0x4a25d94a', // swapTokensForExactETH
      '0x18cbafe5', // swapExactTokensForETH
      '0xfb3bdb41', // swapETHForExactTokens
      '0x3593564c', // execute
      '0xb6f9de95',
      '0x791ac947',
      ''
    ];

    // Check if the input data starts with any of the known method signatures
    return swapMethodSignatures.some(signature => inputData.startsWith(signature));
  }

  addAddress(address: string): void {
    this.monitoredAddresses.add(address);
  }

  removeAddress(address: string): void {
    this.monitoredAddresses.delete(address);
  }

  private notifyUsers(transaction: ethers.TransactionResponse, transactionDetails: any): void {
    const txHash = transaction.hash;
    const explorerLink = `https://goerli.etherscan.io/tx/${txHash}`;
    const addressShortcut = `${transaction.from.slice(0, 5)}...${transaction.from.slice(-5)}`;
    const addressLink = `https://goerli.etherscan.io/address/${transaction.from}`;


    let alertMessage = "";

    if (transactionDetails.buyToken === 'ETH' || transactionDetails.buyToken === 'WETH') {
      // This is a sell transaction
      alertMessage = `🔴Sell transaction\n\nAddress [${addressShortcut}](${addressLink}) sold ${transactionDetails.sellTokenAmount} ${transactionDetails.sellToken} for ${transactionDetails.buyTokenAmount} ${transactionDetails.buyToken}. For more detailed information, follow this [link](${explorerLink}).`;
    } else {
      // This is a buy transaction
      alertMessage = `🟢Buy transaction\n\nAddress [${addressShortcut}](${addressLink}) bought ${transactionDetails.buyTokenAmount} ${transactionDetails.buyToken} for ${transactionDetails.sellTokenAmount} ${transactionDetails.sellToken}. For more detailed information, follow this [link](${explorerLink}).`;
    }

    this.walletBotService.sendMessageToAllUsers(alertMessage);
  }
}