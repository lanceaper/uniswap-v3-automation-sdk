import { FeeAmount, TICK_SPACINGS, nearestUsableTick } from '@uniswap/v3-sdk';
import {
  Address,
  ContractFunctionResult,
  Hex,
  PublicClient,
  WalletClient,
  decodeFunctionResult,
  encodeFunctionData,
  encodePacked,
  getContract,
  hexToBigInt,
  hexToSignature,
} from 'viem';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';

import { getChainInfo } from '../chain';
import { ApertureSupportedChainId, PermitInfo } from '../interfaces';
import {
  INonfungiblePositionManager__factory,
  UniV3Automan__factory,
} from '../typechain-types';
import { GetAbiFunctionParamsTypes } from './generics';
import {
  RpcReturnType,
  getControllerOverrides,
  getERC20Overrides,
  getNPMApprovalOverrides,
  staticCallWithOverrides,
  tryRequestWithOverrides,
} from './overrides';

export type AutomanActionName =
  | 'mintOptimal'
  | 'decreaseLiquidity'
  | 'reinvest'
  | 'rebalance'
  | 'removeLiquidity';

export type GetAutomanParams<T extends AutomanActionName> =
  GetAbiFunctionParamsTypes<typeof UniV3Automan__factory.abi, T>;

export type GetAutomanReturnTypes<TFunctionName extends AutomanActionName> =
  ContractFunctionResult<typeof UniV3Automan__factory.abi, TFunctionName>;

type DecreaseLiquidityParams = GetAbiFunctionParamsTypes<
  typeof INonfungiblePositionManager__factory.abi,
  'decreaseLiquidity'
>[0];

type IncreaseLiquidityParams = GetAbiFunctionParamsTypes<
  typeof INonfungiblePositionManager__factory.abi,
  'increaseLiquidity'
>[0];

type MintParams = GetAbiFunctionParamsTypes<
  typeof INonfungiblePositionManager__factory.abi,
  'mint'
>[0];

type MintReturnType = GetAutomanReturnTypes<'mintOptimal'>;

type RemoveLiquidityReturnType = GetAutomanReturnTypes<'removeLiquidity'>;

type RebalanceReturnType = GetAutomanReturnTypes<'rebalance'>;

export function getAutomanContract(
  chainId: ApertureSupportedChainId,
  publicClient?: PublicClient,
  walletClient?: WalletClient,
) {
  return getContract({
    address: getChainInfo(chainId).aperture_uniswap_v3_automan,
    abi: UniV3Automan__factory.abi,
    publicClient,
    walletClient,
  });
}

export function encodeSwapData(
  chainId: ApertureSupportedChainId,
  router: Address,
  approveTarget: Address,
  tokenIn: Address,
  tokenOut: Address,
  amountIn: bigint,
  data: Hex,
): Hex {
  return encodePacked(
    ['address', 'bytes'],
    [
      getChainInfo(chainId).aperture_router_proxy!,
      encodePacked(
        ['address', 'address', 'address', 'address', 'uint256', 'bytes'],
        [router, approveTarget, tokenIn, tokenOut, amountIn, data],
      ),
    ],
  );
}

export function encodeOptimalSwapData(
  chainId: ApertureSupportedChainId,
  token0: Address,
  token1: Address,
  fee: FeeAmount,
  tickLower: number,
  tickUpper: number,
  zeroForOne: boolean,
  approveTarget: Address,
  router: Address,
  data: Hex,
): string {
  return encodePacked(
    ['address', 'bytes'],
    [
      getChainInfo(chainId).optimal_swap_router!,
      encodePacked(
        // prettier-ignore
        ["address", "address", "uint24", "int24", "int24", "bool", "address", "address", "bytes"],
        // prettier-ignore
        [token0, token1, fee, tickLower, tickUpper, zeroForOne, approveTarget, router, data],
      ),
    ],
  );
}

export function getAutomanMintOptimalCalldata(
  mintParams: MintParams,
  swapData: Hex = '0x',
): Hex {
  return encodeFunctionData({
    abi: UniV3Automan__factory.abi,
    args: [mintParams, swapData] as const,
    functionName: 'mintOptimal',
  });
}

export function getAutomanDecreaseLiquidityCalldata(
  tokenId: bigint,
  liquidity: bigint,
  deadline: bigint,
  amount0Min = BigInt(0),
  amount1Min = BigInt(0),
  feeBips = BigInt(0),
  permitInfo?: PermitInfo,
): Hex {
  const params: DecreaseLiquidityParams = {
    tokenId,
    liquidity,
    amount0Min,
    amount1Min,
    deadline,
  };
  if (permitInfo === undefined) {
    return encodeFunctionData({
      abi: UniV3Automan__factory.abi,
      args: [params, feeBips] as const,
      functionName: 'decreaseLiquidity',
    });
  }
  const { v, r, s } = hexToSignature(permitInfo.signature as Hex);
  return encodeFunctionData({
    abi: UniV3Automan__factory.abi,
    args: [
      params,
      feeBips,
      BigInt(permitInfo.deadline),
      Number(v),
      r,
      s,
    ] as const,
    functionName: 'decreaseLiquidity',
  });
}

export function getAutomanRebalanceCalldata(
  mintParams: MintParams,
  tokenId: bigint,
  feeBips = BigInt(0),
  permitInfo?: PermitInfo,
  swapData: Hex = '0x',
): Hex {
  if (permitInfo === undefined) {
    return encodeFunctionData({
      abi: UniV3Automan__factory.abi,
      args: [mintParams, tokenId, feeBips, swapData] as const,
      functionName: 'rebalance',
    });
  }
  const { v, r, s } = hexToSignature(permitInfo.signature as Hex);
  return encodeFunctionData({
    abi: UniV3Automan__factory.abi,
    args: [
      mintParams,
      tokenId,
      feeBips,
      swapData,
      BigInt(permitInfo.deadline),
      Number(v),
      r,
      s,
    ] as const,
    functionName: 'rebalance',
  });
}

export function getAutomanReinvestCalldata(
  tokenId: bigint,
  deadline: bigint,
  amount0Min = BigInt(0),
  amount1Min = BigInt(0),
  feeBips = BigInt(0),
  permitInfo?: PermitInfo,
  swapData: Hex = '0x',
): Hex {
  const params: IncreaseLiquidityParams = {
    tokenId,
    amount0Desired: BigInt(0), // Param value ignored by Automan.
    amount1Desired: BigInt(0), // Param value ignored by Automan.
    amount0Min,
    amount1Min,
    deadline,
  };
  if (permitInfo === undefined) {
    return encodeFunctionData({
      abi: UniV3Automan__factory.abi,
      args: [params, feeBips, swapData] as const,
      functionName: 'reinvest',
    });
  }
  const { v, r, s } = hexToSignature(permitInfo.signature as Hex);
  return encodeFunctionData({
    abi: UniV3Automan__factory.abi,
    args: [
      params,
      feeBips,
      swapData,
      BigInt(permitInfo.deadline),
      Number(v),
      r,
      s,
    ] as const,
    functionName: 'reinvest',
  });
}

export function getAutomanRemoveLiquidityCalldata(
  tokenId: bigint,
  deadline: bigint,
  amount0Min = BigInt(0),
  amount1Min = BigInt(0),
  feeBips = BigInt(0),
  permitInfo?: PermitInfo,
): Hex {
  const params: DecreaseLiquidityParams = {
    tokenId,
    liquidity: BigInt(0), // Param value ignored by Automan.
    amount0Min,
    amount1Min,
    deadline,
  };
  if (permitInfo === undefined) {
    return encodeFunctionData({
      abi: UniV3Automan__factory.abi,
      args: [params, feeBips] as const,
      functionName: 'removeLiquidity',
    });
  }
  const { v, r, s } = hexToSignature(permitInfo.signature as Hex);
  return encodeFunctionData({
    abi: UniV3Automan__factory.abi,
    args: [
      params,
      feeBips,
      BigInt(permitInfo.deadline),
      Number(v),
      r,
      s,
    ] as const,
    functionName: 'removeLiquidity',
  });
}

function checkTicks(mintParams: MintParams) {
  const { tickLower, tickUpper } = mintParams;
  const fee = mintParams.fee as FeeAmount;
  if (
    tickLower !== nearestUsableTick(tickLower, TICK_SPACINGS[fee]) ||
    tickUpper !== nearestUsableTick(tickUpper, TICK_SPACINGS[fee])
  ) {
    throw new Error('tickLower or tickUpper not valid');
  }
}

/**
 * Simulate a `mintOptimal` call by overriding the balances and allowances of the tokens involved.
 * @param chainId The chain ID.
 * @param publicClient Viem public client.
 * @param from The address to simulate the call from.
 * @param mintParams The mint parameters.
 * @param swapData The swap data if using a router.
 * @param blockNumber Optional block number to query.
 * @returns {tokenId, liquidity, amount0, amount1}
 */
export async function simulateMintOptimal(
  chainId: ApertureSupportedChainId,
  publicClient: PublicClient,
  from: Address,
  mintParams: MintParams,
  swapData: Hex = '0x',
  blockNumber?: bigint,
): Promise<MintReturnType> {
  checkTicks(mintParams);
  const data = getAutomanMintOptimalCalldata(mintParams, swapData);
  const { aperture_uniswap_v3_automan } = getChainInfo(chainId);
  const tx = {
    from,
    to: aperture_uniswap_v3_automan,
    data,
  };
  let returnData: Hex;
  try {
    // forge token approvals and balances
    const [token0Overrides, token1Overrides] = await Promise.all([
      getERC20Overrides(
        mintParams.token0,
        from,
        aperture_uniswap_v3_automan,
        mintParams.amount0Desired,
        publicClient,
      ),
      getERC20Overrides(
        mintParams.token1,
        from,
        aperture_uniswap_v3_automan,
        mintParams.amount1Desired,
        publicClient,
      ),
    ]);
    returnData = await staticCallWithOverrides(
      tx,
      {
        ...token0Overrides,
        ...token1Overrides,
      },
      publicClient,
      blockNumber,
    );
  } catch (e) {
    returnData = (
      await publicClient.call({
        account: from,
        data: tx.data,
        to: tx.to,
        blockNumber,
      })
    ).data!;
  }
  return decodeFunctionResult({
    abi: UniV3Automan__factory.abi,
    data: returnData,
    functionName: 'mintOptimal',
  });
}

/**
 * Simulate a `removeLiquidity` call.
 * @param chainId The chain ID.
 * @param publicClient Viem public client.
 * @param from The address to simulate the call from.
 * @param owner The owner of the position to burn.
 * @param tokenId The token ID of the position to burn.
 * @param amount0Min The minimum amount of token0 to receive.
 * @param amount1Min The minimum amount of token1 to receive.
 * @param feeBips The percentage of position value to pay as a fee, multiplied by 1e18.
 * @param blockNumber Optional block number to query.
 */
export async function simulateRemoveLiquidity(
  chainId: ApertureSupportedChainId,
  publicClient: PublicClient,
  from: Address,
  owner: Address,
  tokenId: bigint,
  amount0Min = BigInt(0),
  amount1Min = BigInt(0),
  feeBips = BigInt(0),
  blockNumber?: bigint,
): Promise<RemoveLiquidityReturnType> {
  const data = getAutomanRemoveLiquidityCalldata(
    tokenId,
    BigInt(Math.floor(Date.now() / 1000 + 60 * 30)),
    amount0Min,
    amount1Min,
    feeBips,
  );
  return decodeFunctionResult({
    abi: UniV3Automan__factory.abi,
    data: await tryRequestWithOverrides(
      'eth_call',
      {
        from,
        to: getChainInfo(chainId).aperture_uniswap_v3_automan,
        data,
      },
      publicClient,
      getNPMApprovalOverrides(chainId, owner),
      blockNumber,
    ),
    functionName: 'removeLiquidity',
  });
}

function getFromAddress(from?: Address) {
  if (from === undefined) {
    const privateKey = generatePrivateKey();
    const account = privateKeyToAccount(privateKey);
    from = account.address;
  }
  return from;
}

export async function requestRebalance<M extends keyof RpcReturnType>(
  method: M,
  chainId: ApertureSupportedChainId,
  publicClient: PublicClient,
  from: Address | undefined,
  owner: Address,
  mintParams: MintParams,
  tokenId: bigint,
  feeBips = BigInt(0),
  swapData: Hex = '0x',
  blockNumber?: bigint,
): Promise<RpcReturnType[M]> {
  checkTicks(mintParams);
  const data = getAutomanRebalanceCalldata(
    mintParams,
    tokenId,
    feeBips,
    undefined,
    swapData,
  );
  from = getFromAddress(from);
  const overrides = {
    ...getNPMApprovalOverrides(chainId, owner),
    ...getControllerOverrides(chainId, from),
  };
  return tryRequestWithOverrides(
    method,
    {
      from,
      to: getChainInfo(chainId).aperture_uniswap_v3_automan,
      data,
    },
    publicClient,
    overrides,
    blockNumber,
  );
}

/**
 * Simulate a `rebalance` call.
 * @param chainId The chain ID.
 * @param publicClient Viem public client.
 * @param from The address to simulate the call from.
 * @param owner The owner of the position to rebalance.
 * @param mintParams The mint parameters.
 * @param tokenId The token ID of the position to rebalance.
 * @param feeBips The percentage of position value to pay as a fee, multiplied by 1e18.
 * @param swapData The swap data if using a router.
 * @param blockNumber Optional block number to query.
 */
export async function simulateRebalance(
  chainId: ApertureSupportedChainId,
  publicClient: PublicClient,
  from: Address | undefined,
  owner: Address,
  mintParams: MintParams,
  tokenId: bigint,
  feeBips = BigInt(0),
  swapData: Hex = '0x',
  blockNumber?: bigint,
): Promise<RebalanceReturnType> {
  const data = await requestRebalance(
    'eth_call',
    chainId,
    publicClient,
    from,
    owner,
    mintParams,
    tokenId,
    feeBips,
    swapData,
    blockNumber,
  );
  return decodeFunctionResult({
    abi: UniV3Automan__factory.abi,
    data,
    functionName: 'rebalance',
  });
}

export async function estimateRebalanceGas(
  chainId: ApertureSupportedChainId,
  publicClient: PublicClient,
  from: Address | undefined,
  owner: Address,
  mintParams: MintParams,
  tokenId: bigint,
  feeBips = BigInt(0),
  swapData: Hex = '0x',
  blockNumber?: bigint,
): Promise<bigint> {
  return hexToBigInt(
    await requestRebalance(
      'eth_estimateGas',
      chainId,
      publicClient,
      from,
      owner,
      mintParams,
      tokenId,
      feeBips,
      swapData,
      blockNumber,
    ),
  );
}

export async function requestReinvest<M extends keyof RpcReturnType>(
  method: M,
  chainId: ApertureSupportedChainId,
  publicClient: PublicClient,
  from: Address | undefined,
  owner: Address,
  tokenId: bigint,
  deadline: bigint,
  amount0Min = BigInt(0),
  amount1Min = BigInt(0),
  feeBips = BigInt(0),
  swapData: Hex = '0x',
  blockNumber?: bigint,
): Promise<RpcReturnType[M]> {
  const data = getAutomanReinvestCalldata(
    tokenId,
    deadline,
    amount0Min,
    amount1Min,
    feeBips,
    undefined,
    swapData,
  );
  from = getFromAddress(from);
  const overrides = {
    ...getNPMApprovalOverrides(chainId, owner),
    ...getControllerOverrides(chainId, from),
  };
  return tryRequestWithOverrides(
    method,
    {
      from,
      to: getChainInfo(chainId).aperture_uniswap_v3_automan,
      data,
    },
    publicClient,
    overrides,
    blockNumber,
  );
}

export async function estimateReinvestGas(
  chainId: ApertureSupportedChainId,
  publicClient: PublicClient,
  from: Address | undefined,
  owner: Address,
  tokenId: bigint,
  deadline: bigint,
  amount0Min = BigInt(0),
  amount1Min = BigInt(0),
  feeBips = BigInt(0),
  swapData: Hex = '0x',
  blockNumber?: bigint,
): Promise<bigint> {
  return hexToBigInt(
    await requestReinvest(
      'eth_estimateGas',
      chainId,
      publicClient,
      from,
      owner,
      tokenId,
      deadline,
      amount0Min,
      amount1Min,
      feeBips,
      swapData,
      blockNumber,
    ),
  );
}
