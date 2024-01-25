interface TransactionDetails {
  sellToken: string | null;
  sellTokenAmount: string | null;
  buyToken: string | null;
  buyTokenAmount: string | null
  isBuyTransaction: boolean;
  tokenContract: string | null;
}