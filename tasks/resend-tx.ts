import dotenv from "dotenv";

import "@nomiclabs/hardhat-ethers";
import { task } from "hardhat/config";

dotenv.config();

task("resend-tx", "Resends a transaction")
  .addParam("txid", "The transaction identifier")
  .addParam("feePerGas", "The fee per gas in gwei.")
  .addParam("priorityFeePerGas", "The priority fee in gwei.")
  .setAction(async (taskArgs, { ethers }) => {
    const tx = await ethers.provider.getTransaction(taskArgs.txid);
    console.log("Original Tx: %s", tx);

    if (tx == null) {
      console.error("Tx not found: it might have been dropped from the mempool because it has been replaced or has been pending for too long");
      return;
    }

    if (tx.confirmations > 0) {
      console.error("Already mined, aborting.");
      return;
    }

    // Resend the TX
    const pk: string = process.env.PRIVATE_KEY !== undefined ? process.env.PRIVATE_KEY : "";
    const bot = new ethers.Wallet(pk, ethers.provider);
    const tx2 = await bot.sendTransaction({
      to: tx.to,
      nonce: tx.nonce,
      gasLimit: tx.gasLimit,
      maxFeePerGas: ethers.utils.parseUnits(taskArgs.feePerGas, "gwei"),
      maxPriorityFeePerGas: ethers.utils.parseUnits(taskArgs.priorityFeePerGas, "gwei"),
      chainId: tx.chainId,
      data: tx.data,
    });
    console.log("Resent Tx: %s", tx2);
  });

module.exports = {};
