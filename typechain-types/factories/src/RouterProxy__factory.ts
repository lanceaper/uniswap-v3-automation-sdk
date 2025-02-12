/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Signer,
  utils,
  Contract,
  ContractFactory,
  PayableOverrides,
} from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { RouterProxy, RouterProxyInterface } from "../../src/RouterProxy";

const _abi = [
  {
    inputs: [],
    stateMutability: "payable",
    type: "constructor",
  },
  {
    stateMutability: "nonpayable",
    type: "fallback",
  },
] as const;

const _bytecode =
  "0x60808060405261021990816100128239f3fe3461017e576060601435811c90602835811c90603c35811c9060503581523060405233811b602c526f23b872dd000000000000000000000000600c526000936020856064601c82885af13d156001875114171615610171578482526080604052806014527fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff6034526f095ea7b3000000000000000000000000918286526020866044601082895af13d1560018851141716156101645785809181603452604051827fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff9036019283607084378135901c5af11561015b576014528360345283526020836044601082865af13d15600185511417161561014e57610130919260345261012830826101cc565b903390610183565b61013a30826101cc565b8061014157005b61014c913390610183565b005b633e3f8f7383526004601cfd5b843d81803e3d90fd5b633e3f8f7386526004601cfd5b637939f42485526004601cfd5b600080fd5b60109260209260145260345260446000938480936fa9059cbb00000000000000000000000082525af13d1560018351141716156101bf57603452565b6390b8ec1890526004601cfd5b9060209060246000809481937f70a082310000000000000000000000000000000000000000000000000000000083526004525afa15610209575190565b80fdfea164736f6c6343000814000a";

type RouterProxyConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: RouterProxyConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class RouterProxy__factory extends ContractFactory {
  constructor(...args: RouterProxyConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: PayableOverrides & { from?: string }
  ): Promise<RouterProxy> {
    return super.deploy(overrides || {}) as Promise<RouterProxy>;
  }
  override getDeployTransaction(
    overrides?: PayableOverrides & { from?: string }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): RouterProxy {
    return super.attach(address) as RouterProxy;
  }
  override connect(signer: Signer): RouterProxy__factory {
    return super.connect(signer) as RouterProxy__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): RouterProxyInterface {
    return new utils.Interface(_abi) as RouterProxyInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): RouterProxy {
    return new Contract(address, _abi, signerOrProvider) as RouterProxy;
  }
}
