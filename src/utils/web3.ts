import { ethers } from "ethers";
import UserRegistryABI from "../contract/UserRegistry.json";

// Contract addresses
const CONTRACTS = {
  BASE_SEPOLIA: "0x61c5734ED762D8Ae0e661c121a056C0643dE4f4e", // Replace with your actual contract address
  BASE_MAINNET: "0x...", // Replace with your actual contract address
};

// Network configurations
const NETWORKS = {
  BASE_SEPOLIA: {
    chainId: "0x14a34", // 84532 in hex
    chainName: "Base Sepolia",
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://sepolia.base.org"],
    blockExplorerUrls: ["https://sepolia-explorer.base.org"],
  },
  BASE_MAINNET: {
    chainId: "0x2105", // 8453 in hex
    chainName: "Base",
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://mainnet.base.org"],
    blockExplorerUrls: ["https://basescan.org"],
  },
};

export class Web3Service {
  private provider: ethers.providers.Web3Provider | null = null;
  private signer: ethers.providers.JsonRpcSigner | null = null;
  private contract: ethers.Contract | null = null;
  private currentNetwork: "BASE_SEPOLIA" | "BASE_MAINNET" = "BASE_SEPOLIA";

  private checkBrowserEnvironment(): void {
    if (typeof window === "undefined") {
      throw new Error("Web3 functionality is only available in the browser");
    }
  }

  private checkWalletProvider(): void {
    this.checkBrowserEnvironment();

    if (!window.ethereum) {
      throw new Error(
        "No wallet provider found. Please install MetaMask or another Web3 wallet."
      );
    }
  }

  async connectWallet(): Promise<{ address: string; signature: string }> {
    try {
      // Check environment and wallet
      this.checkWalletProvider();

      // Initialize provider
      this.provider = new ethers.providers.Web3Provider(window.ethereum!);

      // Request account access
      await this.provider.send("eth_requestAccounts", []);

      // Get signer
      this.signer = await this.provider.getSigner();
      const address = await this.signer.getAddress();

      // Switch to Base Sepolia network
      await this.switchToBaseNetwork();

      // Initialize contract
      this.initializeContract();

      // Request signature for authentication
      const message = this.createSignatureMessage(address);
      const signature = await this.signer.signMessage(message);

      return { address, signature };
    } catch (error: any) {
      console.error("Wallet connection failed:", error);

      // Provide more specific error messages
      if (error.code === 4001) {
        throw new Error("Connection rejected by user");
      } else if (error.code === -32002) {
        throw new Error(
          "Connection request already pending. Please check your wallet."
        );
      } else if (error.message?.includes("User rejected")) {
        throw new Error("Connection rejected by user");
      } else if (error.message?.includes("No wallet provider")) {
        throw error; // Re-throw wallet provider errors as-is
      }

      throw new Error(
        error.message || "Failed to connect wallet. Please try again."
      );
    }
  }

  private createSignatureMessage(address: string): string {
    const timestamp = Date.now();
    return `Welcome to Marrow Grow!

Please sign this message to authenticate your wallet.

Address: ${address}
Timestamp: ${timestamp}
Nonce: ${Math.random().toString(36).substring(7)}

This signature proves you own this wallet and allows you to access the game.`;
  }

  private async switchToBaseNetwork() {
    if (!this.provider) return;

    const network = NETWORKS[this.currentNetwork];

    try {
      // Try to switch to the network
      await this.provider.send("wallet_switchEthereumChain", [
        { chainId: network.chainId },
      ]);
    } catch (switchError: any) {
      // If the network doesn't exist, add it
      if (switchError.code === 4902) {
        try {
          await this.provider.send("wallet_addEthereumChain", [network]);
        } catch (addError) {
          console.error("Failed to add network:", addError);
          throw new Error(
            "Failed to add Base Sepolia network. Please add it manually."
          );
        }
      } else if (switchError.code === 4001) {
        throw new Error("Network switch rejected by user");
      } else {
        console.error("Failed to switch network:", switchError);
        throw new Error("Failed to switch to Base Sepolia network");
      }
    }
  }

  private initializeContract() {
    if (!this.signer) return;

    const contractAddress = CONTRACTS[this.currentNetwork];
    this.contract = new ethers.Contract(
      contractAddress,
      UserRegistryABI.abi,
      this.signer
    );
  }

  private async ensureContract() {
    if (!this.contract) {
      this.checkWalletProvider();

      if (!this.provider) {
        this.provider = new ethers.providers.Web3Provider(window.ethereum!);
      }

      if (!this.signer) {
        this.signer = await this.provider.getSigner();
      }

      this.initializeContract();
    }
  }

  async isPlayerRegistered(address: string): Promise<boolean> {
    try {
      await this.ensureContract();
      if (!this.contract) throw new Error("Contract not initialized");

      return await this.contract.isPlayerRegistered(address);
    } catch (error) {
      console.error("Error checking player registration:", error);
      return false;
    }
  }

  async getPlayer(address: string): Promise<any> {
    try {
      await this.ensureContract();
      if (!this.contract) throw new Error("Contract not initialized");

      const player = await this.contract.getPlayer(address);
      return {
        username: player.username,
        registrationTime: Number(player.registrationTime),
        totalGames: Number(player.totalGames),
        averagePotency: Number(player.averagePotency),
        totalYield: Number(player.totalYield),
        highestPotency: Number(player.highestPotency),
        isActive: player.isActive,
      };
    } catch (error) {
      console.error("Error getting player:", error);
      throw error;
    }
  }

  async isUsernameAvailable(username: string): Promise<boolean> {
    try {
      await this.ensureContract();
      if (!this.contract) throw new Error("Contract not initialized");

      return await this.contract.isUsernameAvailable(username);
    } catch (error) {
      console.error("Error checking username availability:", error);
      return false;
    }
  }

  async registerPlayer(
    username: string
  ): Promise<ethers.ContractTransactionResponse> {
    try {
      await this.ensureContract();
      if (!this.contract) throw new Error("Contract not initialized");

      const tx = await this.contract.registerPlayer(username);
      return tx;
    } catch (error: any) {
      console.error("Error registering player:", error);

      // Provide more specific error messages
      if (error.code === 4001) {
        throw new Error("Transaction rejected by user");
      } else if (error.message?.includes("Username already taken")) {
        throw new Error("Username already taken");
      } else if (error.message?.includes("Username too short")) {
        throw new Error("Username must be at least 3 characters");
      } else if (error.message?.includes("Username too long")) {
        throw new Error("Username must be 20 characters or less");
      } else if (error.message?.includes("Player already registered")) {
        throw new Error("This wallet is already registered");
      }

      throw error;
    }
  }

  async getTopPlayers(
    limit = 10
  ): Promise<{ addresses: string[]; usernames: string[]; scores: number[] }> {
    try {
      await this.ensureContract();
      if (!this.contract) throw new Error("Contract not initialized");

      const result = await this.contract.getTopPlayersByPotency(limit);
      return {
        addresses: result.addresses,
        usernames: result.usernames,
        scores: result.scores.map((score: any) => Number(score)),
      };
    } catch (error) {
      console.error("Error getting top players:", error);
      return { addresses: [], usernames: [], scores: [] };
    }
  }

  async getTotalPlayers(): Promise<number> {
    try {
      await this.ensureContract();
      if (!this.contract) throw new Error("Contract not initialized");

      const total = await this.contract.getTotalPlayers();
      return Number(total);
    } catch (error) {
      console.error("Error getting total players:", error);
      return 0;
    }
  }

  isWalletAvailable(): boolean {
    try {
      this.checkBrowserEnvironment();
      return !!window.ethereum;
    } catch {
      return false;
    }
  }

  disconnect() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
  }
}

// Create singleton instance
let web3ServiceInstance: Web3Service | null = null;

export const getWeb3Service = (): Web3Service => {
  if (!web3ServiceInstance) {
    web3ServiceInstance = new Web3Service();
  }
  return web3ServiceInstance;
};

// For backward compatibility
export const web3Service = getWeb3Service();
