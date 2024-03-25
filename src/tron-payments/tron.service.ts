import {Injectable, OnModuleInit} from '@nestjs/common';
import * as TronWeb from 'tronweb';
import * as process from 'process';

@Injectable()
export class TronService implements OnModuleInit{
  private tronWeb: TronWeb;

  constructor() {
    this.tronWeb = new TronWeb({
      fullHost: 'https://api.shasta.trongrid.io',
      headers: { 'TRON-PRO-API-KEY': process.env.TRON_API_KEY },
    });
    this.tronWeb.setAddress('TNy7RXWEcKEs8qRnXLHhcgcjxFkS4DiUzw');
  }

  async onModuleInit() {

  }

  async getTRC20TokenBalance(tokenContractAddress: string, holderAddress: string): Promise<string> {
    const formattedAddress = this.tronWeb.address.toHex(holderAddress);
    try {
      const contract = await this.tronWeb.contract().at(tokenContractAddress);
      const balance = await contract.balanceOf(formattedAddress).call() / 1000000;
      return balance.toString();
    } catch (error) {
      console.error("Error fetching TRC20 token balance:", error);
      throw error; // Rethrow or handle as needed
    }
  }

  async createTrxRandomWallet() {
    const wallet = await this.tronWeb.createAccount();
    return wallet;
  }

  async listenForDeposit(walletAddress: string, timeout: number = 1200000): Promise<boolean> {
    const tokenContractAddress = 'TG3XXyExBkPp9nzdajDZsozEu4BkaSJozs';
    const amountExpected = 10
    const startTime = Date.now();
    const checkInterval = 30000; // Check every 30 seconds

    return new Promise((resolve, reject) => {
      const checkDeposit = async () => {
        const currentTime = Date.now();
        if (currentTime - startTime > timeout) {
          console.log('Listening timed out');
          resolve(false);
          return;
        }

        const tokenBalance = await this.getTRC20TokenBalance(tokenContractAddress, walletAddress);
        console.log(`Current balance: ${tokenBalance} for address ${walletAddress}`);
        if (parseInt(tokenBalance) >= amountExpected) {
          console.log('Deposit received');
          resolve(true);
          return;
        } else {
          setTimeout(checkDeposit, checkInterval);
        }
      };

      checkDeposit();
    });
  }
}