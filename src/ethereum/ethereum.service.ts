import {forwardRef, Inject, Injectable, OnModuleInit} from '@nestjs/common';
import { ethers } from 'ethers';
import {EventsGateway} from '../events/events.gateway';
import {ApiService} from '../api/api.service';
import {WalletBotService} from '../wallet-bot/wallet-bot.service';
import {uniswapAbi} from './utils/uniswap.abi';
import {ConfigService} from '@nestjs/config';
import {HttpService} from '@nestjs/axios';
import {lastValueFrom} from 'rxjs';

@Injectable()
export class EthereumService implements OnModuleInit {
  private provider: ethers.WebSocketProvider;
  private mainnetProvider: ethers.WebSocketProvider;
  private monitoredAddresses: Set<string> = new Set();
  private processedBlocksCache: Set<number> = new Set();
  private contractInterface = new ethers.Interface(uniswapAbi)
  private API_KEY = this.configService.get<string>('bot.apiKeyMainnet');
  private API_KEY_ETHERSCAN = this.configService.get<string>('bot.apiKeyEtherscan');
  private transactionDetailsCache = new Map<string, any>();
  private httpProvider: ethers.Provider;

  constructor(
    private eventsGateway: EventsGateway,
    @Inject(forwardRef(() => ApiService))
    private apiService: ApiService,
    private walletBotService: WalletBotService,
    private configService: ConfigService,
    private httpService: HttpService,

  ) {

    this.provider = new ethers.WebSocketProvider(`wss://eth-mainnet.g.alchemy.com/v2/${this.API_KEY}`);
    this.httpProvider = new ethers.JsonRpcProvider('https://eth-mainnet.alchemyapi.io/v2/' + this.API_KEY);
  }

  async onModuleInit() {
    // Fetch initial list of addresses from the database on module initialization
    const addresses = await this.apiService.getAllAddresses();
    addresses.forEach(address => this.addAddress(address));
    this.provider.on('block', async (blockNumber) => {
      // Check if the block has already been processed
      if (this.processedBlocksCache.has(blockNumber)) {
        console.log(`Block ${blockNumber} already processed. Skipping...`);
        return; // Skip processing this block
      }

      try {
        // Retrieve the block with its transactions
        const block = await this.provider.getBlock(blockNumber, true);
        // Use Promise.all to fetch details of all transactions in parallel for efficiency
        const transactions = block.prefetchedTransactions


        // Iterate over each transaction to check for monitored addresses
        transactions.forEach(async (transaction) => {
          // console.log(transaction.from)
          // console.log(this.monitoredAddresses.has(transaction.from))
          if (
            transaction
            && transaction.from
            && transaction.to
            && (this.monitoredAddresses.has(transaction?.from.toLowerCase()) || this.monitoredAddresses.has(transaction?.to.toLowerCase()))) {
            console.log(`Transaction detected in block ${blockNumber}: ${transaction.hash}`);
            await this.provider.waitForTransaction(transaction.hash, 3);
            // Process the transaction as before
            this.checkTransaction(transaction.hash);
          }
        });

        // Add the block number to the cache to avoid re-processing in the future
        this.processedBlocksCache.add(blockNumber);
      } catch (error) {
        console.error(`Error processing block ${blockNumber}:`, error);
      }
    });
  }


  listenForTransactions() {
    // Remove existing listener to avoid duplicates
    this.provider.removeListener('pending', this.pendingTransactionHandler);

    // Add new listener
    console.log("Adding listener")
    this.provider.on('pending', this.pendingTransactionHandler);
    console.log('Listenere added')
    console.log(this.monitoredAddresses)
  }

  pendingTransactionHandler = async (txHash) => {
    try {
      await this.handlePendingTransaction(txHash);
    } catch (error) {
      console.error('Error handling pending transaction:', error);
      // Restart listening after a short delay
      setTimeout(() => this.listenForTransactions(), 100);
      console.log('Restarted listening for transactions.');
    }
  };

  async handlePendingTransaction(txHash) {
    const transaction = await this.provider.getTransaction(txHash);
    if (
        transaction
        && (this.monitoredAddresses.has(transaction.from) || this.monitoredAddresses.has(transaction.to))
    ) {
      console.log(`Transaction detected: ${txHash}`);
      await this.provider.waitForTransaction(txHash, 3);
      this.checkTransaction(txHash);
    }
  }

  private async retryWithExponentialBackoff<T>(
      operation: () => Promise<T>,
      maxRetries: number = 5,
      initialDelay: number = 1000
  ): Promise<T> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const result = await operation();
        return result;
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
    const url = 'https://api.etherscan.io/'+
      'api?module=contract&action=getabi' +
      `&address=${contractAddress}&apikey=${etherscanApiKey}`;
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
    const url = 'https://api-goerli.etherscan.io/' +
    `api?module=proxy&action=eth_getTransactionByHash&txhash=${txHash}&apikey=${this.API_KEY_ETHERSCAN}`;

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
  private async checkTransaction(txHash: string): Promise<void> {
    if (this.transactionDetailsCache.has(txHash)) {
      console.log("Transaction already processed")
      return; // Skip if already processed
    }
    try {
      const transaction = await this.retryWithExponentialBackoff(
        () => this.provider.getTransaction(txHash));
      if(this.isUniswapTransaction(transaction.data)) {
        console.log("Uniswap transaction detected")
      }
      const txn_url = `https://etherscan.io/tx/${txHash}`;
      const address = transaction.from.startsWith('0x') ? this.formatAddress(transaction.from) : transaction.from;
      const transactionDetails = await this.parseEtherscan(txn_url, address);
      console.log(transactionDetails.data)
      this.notifyUsers(transaction, transactionDetails.data);
    } catch (error) {
      console.error(`Failed to fetch transaction after retries: ${txHash}`, error);
    }
  }

  private async parseEtherscan(txnUrl: string, formattedAddress): Promise<any> {
    const body = {
      txn_url: txnUrl,
      address: formattedAddress
    };
    const observable = this.httpService.post('http://127.0.0.1:5001/parse-etherscan', body);
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

  private notifyUsers(transaction: ethers.TransactionResponse, transactionDetails: TransactionDetails): void {
    const txHash = transaction.hash;
    const explorerLink = `https://etherscan.io/tx/${txHash}`;
    const addressShortcut = `${transaction.from.slice(0, 5)}...${transaction.from.slice(-5)}`;
    const addressLink = `https://etherscan.io/address/${transaction.from}`;
    const contractLink = `https://etherscan.io/address/${transactionDetails.tokenContract}`;


    let alertMessage = "";

    if (!transactionDetails.isBuyTransaction) {
      // This is a sell transaction
      alertMessage = `🔴Sell transaction\n\nAddress [${addressShortcut}](${addressLink}) ` +
        `sold ${transactionDetails.sellTokenAmount} [${transactionDetails.sellToken}](${contractLink}) ` +
        `for ${transactionDetails.buyTokenAmount} ${transactionDetails.buyToken}. ` +
        `For more detailed information, follow this [link](${explorerLink}).`;
    } else {
      // This is a buy transaction
      alertMessage = `🟢Buy transaction\n\nAddress [${addressShortcut}](${addressLink}) ` +
        `bought ${transactionDetails.buyTokenAmount} [${transactionDetails.buyToken}](${contractLink}) ` +
        `for ${transactionDetails.sellTokenAmount} ${transactionDetails.sellToken}. ` +
        `For more detailed information, follow this [link](${explorerLink}).`;
    }

    this.walletBotService.sendMessageToAllUsers(alertMessage);
  }
}