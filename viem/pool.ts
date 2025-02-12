import { Price, Token } from '@uniswap/sdk-core';
import {
  FeeAmount,
  Pool,
  TickMath,
  computePoolAddress as _computePoolAddress,
  tickToPrice,
} from '@uniswap/v3-sdk';
import { viem } from 'aperture-lens';
import axios from 'axios';
import JSBI from 'jsbi';
import { Address, PublicClient, WalletClient, getContract } from 'viem';

import { getChainInfo } from '../chain';
import {
  AllV3TicksQuery,
  FeeTierDistributionQuery,
} from '../data/__graphql_generated__/uniswap-thegraph-types-and-hooks';
import { ApertureSupportedChainId } from '../interfaces';
import { DOUBLE_TICK, sqrtRatioToPrice } from '../tick';
import { IUniswapV3Pool__factory } from '../typechain-types';
import { getToken } from './currency';
import { BasicPositionInfo } from './position';
import { getPublicClient } from './public_client';

/**
 * Computes a pool address
 * @param factoryAddress The Uniswap V3 factory address
 * @param token0 The first token of the pair, irrespective of sort order
 * @param token1 The second token of the pair, irrespective of sort order
 * @param fee The fee tier of the pool
 * @returns The pool address
 */
export function computePoolAddress(
  factoryAddress: Address,
  token0: Token | string,
  token1: Token | string,
  fee: FeeAmount,
): Address {
  return _computePoolAddress({
    factoryAddress,
    tokenA: new Token(
      1,
      typeof token0 === 'string' ? token0 : token0.address,
      18,
    ),
    tokenB: new Token(
      1,
      typeof token1 === 'string' ? token1 : token1.address,
      18,
    ),
    fee,
  }) as Address;
}

/**
 * Constructs a Uniswap SDK Pool object for the pool behind the specified position.
 * @param basicInfo Basic position info.
 * @param chainId Chain id.
 * @param publicClient Viem public client.
 * @param blockNumber Optional block number to query.
 * @returns The constructed Uniswap SDK Pool object where the specified position resides.
 */
export async function getPoolFromBasicPositionInfo(
  basicInfo: BasicPositionInfo,
  chainId: ApertureSupportedChainId,
  publicClient?: PublicClient,
  blockNumber?: bigint,
): Promise<Pool> {
  return getPool(
    basicInfo.token0,
    basicInfo.token1,
    basicInfo.fee,
    chainId,
    publicClient,
    blockNumber,
  );
}

/**
 * Get the `IUniswapV3Pool` contract.
 */
export function getPoolContract(
  tokenA: Token | string,
  tokenB: Token | string,
  fee: FeeAmount,
  chainId: ApertureSupportedChainId,
  publicClient?: PublicClient,
  walletClient?: WalletClient,
) {
  return getContract({
    address: computePoolAddress(
      getChainInfo(chainId).uniswap_v3_factory,
      tokenA,
      tokenB,
      fee,
    ) as Address,
    abi: IUniswapV3Pool__factory.abi,
    publicClient,
    walletClient,
  });
}

/**
 * Constructs a Uniswap SDK Pool object for an existing and initialized pool.
 * Note that the constructed pool's `token0` and `token1` will be sorted, but the input `tokenA` and `tokenB` don't have to be.
 * @param tokenA One of the tokens in the pool.
 * @param tokenB The other token in the pool.
 * @param fee Fee tier of the pool.
 * @param chainId Chain id.
 * @param publicClient Viem public client.
 * @param blockNumber Optional block number to query.
 * @returns The constructed Uniswap SDK Pool object.
 */
export async function getPool(
  tokenA: Token | string,
  tokenB: Token | string,
  fee: FeeAmount,
  chainId: ApertureSupportedChainId,
  publicClient?: PublicClient,
  blockNumber?: bigint,
): Promise<Pool> {
  publicClient = publicClient ?? getPublicClient(chainId);
  const poolContract = getPoolContract(
    tokenA,
    tokenB,
    fee,
    chainId,
    publicClient,
  );
  const opts = { blockNumber };
  // If the specified pool has not been created yet, then the slot0() and liquidity() calls should fail (and throw an error).
  // Also update the tokens to the canonical type.
  const [slot0, inRangeLiquidity, tokenACanon, tokenBCanon] = await Promise.all(
    [
      poolContract.read.slot0(opts),
      poolContract.read.liquidity(opts),
      getToken(
        (typeof tokenA === 'string' ? tokenA : tokenA.address) as Address,
        chainId,
        publicClient,
        blockNumber,
      ),
      getToken(
        (typeof tokenB === 'string' ? tokenB : tokenB.address) as Address,
        chainId,
        publicClient,
        blockNumber,
      ),
    ],
  );
  const [sqrtPriceX96, tick] = slot0;
  if (sqrtPriceX96 === BigInt(0)) {
    throw 'Pool has been created but not yet initialized';
  }
  return new Pool(
    tokenACanon,
    tokenBCanon,
    fee,
    sqrtPriceX96.toString(),
    inRangeLiquidity.toString(),
    tick,
  );
}

/**
 * Get the price of `token0` in terms of `token1` in the pool.
 * @param pool A Uniswap v3 pool.
 * @returns The price of `token0` in terms of `token1` in the pool.
 */
export function getPoolPrice(pool: Pool): Price<Token, Token> {
  return sqrtRatioToPrice(pool.sqrtRatioX96, pool.token0, pool.token1);
}

/**
 * Fetches the TVL distribution of the different fee tiers behind the specified token pair.
 * Implementation heavily adapted from https://github.com/Uniswap/interface/blob/bd4042aa16cbd035f4b543272ef9ae301c96e8c9/src/hooks/useFeeTierDistribution.ts#L76.
 * @param chainId Chain id.
 * @param tokenA Address of one of the tokens in the pool.
 * @param tokenB Address of the other token in the pool.
 * @returns A record with four entries where the keys are the fee tiers and the values are the TVL fractions with the corresponding fee tiers.
 */
export async function getFeeTierDistribution(
  chainId: ApertureSupportedChainId,
  tokenA: Address,
  tokenB: Address,
): Promise<Record<FeeAmount, number>> {
  const { uniswap_subgraph_url } = getChainInfo(chainId);
  if (uniswap_subgraph_url === undefined) {
    throw 'Subgraph URL is not defined for the specified chain id';
  }
  const [token0, token1] = [tokenA.toLowerCase(), tokenB.toLowerCase()].sort();
  const feeTierTotalValueLocked: FeeTierDistributionQuery = (
    await axios.post(uniswap_subgraph_url, {
      operationName: 'FeeTierDistribution',
      variables: {
        token0,
        token1,
      },
      query: `
        query FeeTierDistribution($token0: String!, $token1: String!) {
          _meta {
            block {
              number
            }
          }
          feeTierTVL: pools(
            orderBy: totalValueLockedToken0
            orderDirection: desc
            where: { token0: $token0, token1: $token1 }
          ) {
            feeTier
            totalValueLockedToken0
            totalValueLockedToken1
          }
        }`,
    })
  ).data.data;
  const feeTierToTVL = new Map<FeeAmount, number>();
  let sumTVL = 0;
  for (const feeTierTVL of feeTierTotalValueLocked.feeTierTVL) {
    const feeAmount = Number(feeTierTVL.feeTier) as FeeAmount;
    if (!(feeAmount in FeeAmount)) continue;
    const token0TVL = Number(feeTierTVL.totalValueLockedToken0 ?? 0);
    const token1TVL = Number(feeTierTVL.totalValueLockedToken1 ?? 0);
    feeTierToTVL.set(feeAmount, token0TVL + token1TVL);
    sumTVL += token0TVL + token1TVL;
  }
  const getFeeTierFraction = (feeAmount: FeeAmount): number => {
    return (feeTierToTVL.get(feeAmount) ?? 0) / sumTVL;
  };
  return {
    [FeeAmount.LOWEST]: getFeeTierFraction(FeeAmount.LOWEST),
    [FeeAmount.LOW]: getFeeTierFraction(FeeAmount.LOW),
    [FeeAmount.MEDIUM]: getFeeTierFraction(FeeAmount.MEDIUM),
    [FeeAmount.HIGH]: getFeeTierFraction(FeeAmount.HIGH),
  };
}

/**
 * Reconstructs the liquidity array from the tick array and the current liquidity.
 * @param tickArray Sorted array containing the liquidity net for each tick.
 * @param tickCurrentAligned The current tick aligned to the tick spacing.
 * @param currentLiquidity The current pool liquidity.
 * @returns The reconstructed liquidity array.
 */
function reconstructLiquidityArray(
  tickArray: Array<{ tick: number; liquidityNet: bigint }>,
  tickCurrentAligned: number,
  currentLiquidity: JSBI,
): Array<[number, string]> {
  // Locate the tick in the populated ticks array with the current liquidity.
  const currentIndex =
    tickArray.findIndex(({ tick }) => tick > tickCurrentAligned) - 1;
  // Accumulate the liquidity from the current tick to the end of the populated ticks array.
  let cumulativeLiquidity = currentLiquidity;
  const liquidityArray = new Array<[number, string]>(tickArray.length);
  for (let i = currentIndex + 1; i < tickArray.length; i++) {
    // added when tick is crossed from left to right
    cumulativeLiquidity = JSBI.add(
      cumulativeLiquidity,
      JSBI.BigInt(tickArray[i].liquidityNet.toString()),
    );
    liquidityArray[i] = [tickArray[i].tick, cumulativeLiquidity.toString()];
  }
  cumulativeLiquidity = currentLiquidity;
  for (let i = currentIndex; i >= 0; i--) {
    liquidityArray[i] = [tickArray[i].tick, cumulativeLiquidity.toString()];
    // subtracted when tick is crossed from right to left
    cumulativeLiquidity = JSBI.subtract(
      cumulativeLiquidity,
      JSBI.BigInt(tickArray[i].liquidityNet.toString()),
    );
  }
  return liquidityArray;
}

/**
 * Normalizes the specified tick range.
 * @param tickCurrent The current tick.
 * @param tickSpacing The tick spacing.
 * @param tickLower The lower tick.
 * @param tickUpper The upper tick.
 * @returns The normalized tick range.
 */
function normalizeTicks(
  tickCurrent: number,
  tickSpacing: number,
  tickLower: number,
  tickUpper: number,
): { tickCurrentAligned: number; tickLower: number; tickUpper: number } {
  if (tickLower > tickUpper) throw 'tickLower > tickUpper';
  // The current tick must be within the specified tick range.
  const tickCurrentAligned =
    Math.floor(tickCurrent / tickSpacing) * tickSpacing;
  tickLower = Math.min(
    Math.max(tickLower, TickMath.MIN_TICK),
    tickCurrentAligned,
  );
  tickUpper = Math.max(
    Math.min(tickUpper, TickMath.MAX_TICK),
    tickCurrentAligned,
  );
  return { tickCurrentAligned, tickLower, tickUpper };
}

export type TickNumber = number;
export type LiquidityAmount = JSBI;
export type TickToLiquidityMap = Map<TickNumber, LiquidityAmount>;

/**
 * Fetches the liquidity for all ticks for the specified pool.
 * @param chainId Chain id.
 * @param pool The liquidity pool to fetch the tick to liquidity map for.
 * @param _tickLower The lower tick to fetch liquidity for, defaults to `TickMath.MIN_TICK`.
 * @param _tickUpper The upper tick to fetch liquidity for, defaults to `TickMath.MAX_TICK`.
 * @returns A map from tick numbers to liquidity amounts for the specified pool.
 */
export async function getTickToLiquidityMapForPool(
  chainId: ApertureSupportedChainId,
  pool: Pool,
  _tickLower = TickMath.MIN_TICK,
  _tickUpper = TickMath.MAX_TICK,
): Promise<TickToLiquidityMap> {
  const { uniswap_v3_factory, uniswap_subgraph_url } = getChainInfo(chainId);
  if (uniswap_subgraph_url === undefined) {
    throw 'Subgraph URL is not defined for the specified chain id';
  }
  const poolAddress = computePoolAddress(
    uniswap_v3_factory,
    pool.token0,
    pool.token1,
    pool.fee,
  ).toLowerCase();
  // Fetch current in-range liquidity from subgraph.
  const poolResponse = (
    await axios.post(uniswap_subgraph_url, {
      operationName: 'PoolLiquidity',
      variables: {},
      query: `
          query PoolLiquidity {
            pool(id: "${poolAddress}") {
              liquidity
              tick
            }
          }`,
    })
  ).data.data.pool;
  // The current tick must be within the specified tick range.
  const { tickCurrentAligned, tickLower, tickUpper } = normalizeTicks(
    Number(poolResponse.tick),
    pool.tickSpacing,
    _tickLower,
    _tickUpper,
  );
  let rawData: AllV3TicksQuery['ticks'] = [];
  // Note that Uniswap subgraph returns a maximum of 1000 ticks per query, even if `numTicksPerQuery` is set to a larger value.
  const numTicksPerQuery = 1000;
  for (let skip = 0; ; skip += numTicksPerQuery) {
    const response: AllV3TicksQuery | undefined = (
      await axios.post(uniswap_subgraph_url, {
        operationName: 'AllV3Ticks',
        variables: {
          poolAddress,
          skip,
          tickLower,
          tickUpper,
        },
        query: `
          query AllV3Ticks($poolAddress: String, $skip: Int!, $tickLower: Int!, $tickUpper: Int!) {
            ticks(first: 1000, skip: $skip, where: { poolAddress: $poolAddress, tickIdx_gte: $tickLower, tickIdx_lte: $tickUpper }, orderBy: tickIdx) {
              tick: tickIdx
              liquidityNet
            }
          }
        `,
      })
    ).data.data;
    const numItems = response?.ticks.length ?? 0;
    if (numItems > 0) {
      rawData = rawData.concat(response!.ticks);
    }
    // We fetch `numTicksPerQuery` items per query, so if we get less than that, then we know that we have fetched all the items.
    if (numItems < numTicksPerQuery) {
      break;
    }
  }
  const data = new Map<TickNumber, LiquidityAmount>();
  if (rawData.length > 0) {
    rawData.forEach((item) => {
      item.tick = Number(item.tick);
    });
    rawData.sort((a, b) => a.tick - b.tick);
    const liquidityArray = reconstructLiquidityArray(
      rawData,
      tickCurrentAligned,
      JSBI.BigInt(poolResponse.liquidity),
    );
    for (const [tick, liquidityActive] of liquidityArray) {
      // There is a `Number.isInteger` check in `tickToPrice`.
      data.set(Math.round(tick), JSBI.BigInt(liquidityActive));
    }
  }
  return data;
}

/**
 * Returns the liquidity amount at the specified tick.
 * @param tickToLiquidityMap Sorted map from tick to liquidity amount.
 * @param tick The tick to query.
 * @returns The liquidity amount at the specified tick.
 */
export function readTickToLiquidityMap(
  tickToLiquidityMap: TickToLiquidityMap,
  tick: TickNumber,
): LiquidityAmount {
  if (tickToLiquidityMap.get(tick) !== undefined) {
    return tickToLiquidityMap.get(tick)!;
  } else {
    const key = [...tickToLiquidityMap.keys()].findIndex((t) => t > tick) - 1;
    if (key >= 0) {
      return tickToLiquidityMap.get(key)!;
    }
  }
  return JSBI.BigInt(0);
}

/**
 * Fetches the liquidity within the tick range for the specified pool by deploying an ephemeral contract via `eth_call`.
 * Each tick consumes about 100k gas, so this method may fail if the number of ticks exceeds 3k assuming the provider
 * gas limit is 300m.
 * @param chainId Chain id.
 * @param pool The liquidity pool to fetch the tick to liquidity map for.
 * @param tickLower The lower tick to fetch liquidity for.
 * @param tickUpper The upper tick to fetch liquidity for.
 * @param publicClient Viem public client.
 * @param blockNumber Optional block number to query.
 */
async function getPopulatedTicksInRange(
  chainId: ApertureSupportedChainId,
  pool: Pool,
  tickLower: number,
  tickUpper: number,
  publicClient?: PublicClient,
  blockNumber?: bigint,
) {
  const ticks = await viem.getPopulatedTicksInRange(
    computePoolAddress(
      getChainInfo(chainId).uniswap_v3_factory,
      pool.token0,
      pool.token1,
      pool.fee,
    ),
    tickLower,
    tickUpper,
    publicClient ?? getPublicClient(chainId),
    blockNumber,
  );
  return ticks.map(({ tick, liquidityNet }) => ({ tick, liquidityNet }));
}

export interface Liquidity {
  tick: number;
  liquidityActive: string;
  price0: string;
  price1: string;
}

/**
 * Fetches the liquidity within the tick range for the specified pool.
 * @param chainId Chain id.
 * @param pool The liquidity pool to fetch the tick to liquidity map for.
 * @param _tickLower The lower tick to fetch liquidity for, defaults to half of the current price.
 * @param _tickUpper The upper tick to fetch liquidity for, defaults to twice of the current price.
 * @param publicClient Viem public client.
 * @returns An array of liquidity objects.
 */
export async function getLiquidityArrayForPool(
  chainId: ApertureSupportedChainId,
  pool: Pool,
  _tickLower = pool.tickCurrent - DOUBLE_TICK,
  _tickUpper = pool.tickCurrent + DOUBLE_TICK,
  publicClient?: PublicClient,
): Promise<Liquidity[]> {
  // The current tick must be within the specified tick range.
  const { tickCurrentAligned, tickLower, tickUpper } = normalizeTicks(
    pool.tickCurrent,
    pool.tickSpacing,
    _tickLower,
    _tickUpper,
  );
  const { token0, token1 } = pool;
  const populatedTicks = await getPopulatedTicksInRange(
    chainId,
    pool,
    tickLower,
    tickUpper,
    publicClient,
  );
  const liquidityArray = reconstructLiquidityArray(
    populatedTicks,
    tickCurrentAligned,
    pool.liquidity,
  );
  return liquidityArray.map(([tick, liquidityActive]) => {
    const price = tickToPrice(token0, token1, tick);
    return {
      tick,
      liquidityActive,
      price0: price.toFixed(token0.decimals),
      price1: price.invert().toFixed(token1.decimals),
    };
  });
}
