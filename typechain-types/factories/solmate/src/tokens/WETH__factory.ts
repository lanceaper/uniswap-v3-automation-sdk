/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { WETH, WETHInterface } from "../../../../solmate/src/tokens/WETH";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Deposit",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Withdrawal",
    type: "event",
  },
  {
    inputs: [],
    name: "DOMAIN_SEPARATOR",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "allowance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "deposit",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "nonces",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
      {
        internalType: "uint8",
        name: "v",
        type: "uint8",
      },
      {
        internalType: "bytes32",
        name: "r",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "s",
        type: "bytes32",
      },
    ],
    name: "permit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
] as const;

const _bytecode =
  "0x60e0604081815234620004285762000017826200042d565b600d825260206c2bb930b83832b21022ba3432b960991b8184015281519262000040846200042d565b60048452630ae8aa8960e31b8285015280516001600160401b03939084811162000412576000908062000074835462000449565b94601f95868111620003c1575b508690868311600114620003595784926200034d575b50508160011b916000199060031b1c19161781555b85518581116200033957600190620000c5825462000449565b858111620002f1575b50858582116001146200028c578394959697988293949262000280575b5050600019600383901b1c191690821b1781555b60126080524660a05282519382908354926200011b8462000449565b90818852888801948982821691826000146200026357505060011462000227575b505085601f1992030116840193808510878611176200021357848452519020938301937f8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f8552828401527fc89efdaa54c0f20c7adf612882df0950f5a951637e0307cdcb4c672f298b8bc660608401524660808401523060a084015260a0835260c083019483861090861117620001ff575083905251902060c052610f8a908162000487823960805181610780015260a05181610d25015260c05181610d4c0152f35b634e487b7160e01b81526041600452602490fd5b634e487b7160e01b83526041600452602483fd5b90889293508580528286209186925b8284106200024d575050508601019038806200013c565b80548a85018601528a9490930192810162000236565b92509394505060ff19168452151560051b8601019038806200013c565b015190503880620000eb565b82845286842090601f198316855b818110620002db5750998385969798999a9b10620002c1575b505050811b018155620000ff565b015160001960f88460031b161c19169055388080620002b3565b8b8301518455928501929189019189016200029a565b8284528684208680840160051c8201928985106200032f575b0160051c019083905b82811062000323575050620000ce565b85815501839062000313565b925081926200030a565b634e487b7160e01b82526041600452602482fd5b01519050388062000097565b8480528785209250601f198416855b89828210620003aa57505090846001959493921062000390575b505050811b018155620000ac565b015160001960f88460031b161c1916905538808062000382565b600185968293968601518155019501930162000368565b9091508380528684208680850160051c82019289861062000408575b9085949392910160051c01905b818110620003f9575062000081565b858155849350600101620003ea565b92508192620003dd565b634e487b7160e01b600052604160045260246000fd5b600080fd5b604081019081106001600160401b038211176200041257604052565b90600182811c921680156200047b575b60208310146200046557565b634e487b7160e01b600052602260045260246000fd5b91607f16916200045956fe60806040818152600480361015610029575b505050361561001f57600080fd5b610027610efd565b005b600092833560e01c90816306fdde0314610aac57508063095ea7b314610a1257806318160ddd146109d557806323b872dd146108bb5780632e1a7d4d146107a4578063313ce567146107485780633644e5151461070657806370a08231146106a45780637ecebe001461064257806395d89b4114610527578063a9059cbb1461047a578063d0e30db014610442578063d505accf146101425763dd62ed3e03610011573461013e57817ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc36011261013e576020928291610107610c99565b61010f610cc1565b9173ffffffffffffffffffffffffffffffffffffffff8092168452865283832091168252845220549051908152f35b8280fd5b5091903461043e5760e07ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc36011261043e5761017c610c99565b90610185610cc1565b91604435606435926084359260ff841680940361043a574285106103dd576101ab610d20565b9573ffffffffffffffffffffffffffffffffffffffff8092169586895260209560058752848a209889549960018b01905585519285898501957f6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c987528b89870152169a8b606086015288608086015260a085015260c084015260c0835260e0830167ffffffffffffffff94848210868311176103b057818852845190206101008501927f19010000000000000000000000000000000000000000000000000000000000008452610102860152610122850152604281526101608401948186109086111761038457848752519020835261018082015260a4356101a082015260c4356101c0909101528780528490889060809060015afa1561037a578651169687151580610371575b156103165786977f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b9259596975283528087208688528352818188205551908152a380f35b8360649251917f08c379a0000000000000000000000000000000000000000000000000000000008352820152600e60248201527f494e56414c49445f5349474e45520000000000000000000000000000000000006044820152fd5b508488146102d3565b81513d88823e3d90fd5b60248c60418f7f4e487b7100000000000000000000000000000000000000000000000000000000835252fd5b5060248c60418f7f4e487b7100000000000000000000000000000000000000000000000000000000835252fd5b60648860208451917f08c379a0000000000000000000000000000000000000000000000000000000008352820152601760248201527f5045524d49545f444541444c494e455f455850495245440000000000000000006044820152fd5b8680fd5b5080fd5b83807ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc36011261047757610474610efd565b80f35b80fd5b50503461043e57807ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc36011261043e576020916104b5610c99565b8273ffffffffffffffffffffffffffffffffffffffff60243592338552600387528285206104e4858254610ce4565b90551692838152600386522081815401905582519081527fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef843392a35160018152f35b50503461043e57817ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc36011261043e5780519082600180549161056983610b70565b808652928281169081156105fc57506001146105a0575b5050506105928261059c940383610bc3565b5191829182610c33565b0390f35b94508085527fb10e2d527612073b26eecdfd717e6a320cf44b4afac2b0732d9fcbe2b7fa0cf65b8286106105e45750505061059282602061059c9582010194610580565b805460208787018101919091529095019481016105c7565b61059c9750869350602092506105929491507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff001682840152151560051b82010194610580565b50503461043e5760207ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc36011261043e578060209273ffffffffffffffffffffffffffffffffffffffff610694610c99565b1681526005845220549051908152f35b50503461043e5760207ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc36011261043e578060209273ffffffffffffffffffffffffffffffffffffffff6106f6610c99565b1681526003845220549051908152f35b50503461043e57817ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc36011261043e57602090610741610d20565b9051908152f35b50503461043e57817ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc36011261043e576020905160ff7f0000000000000000000000000000000000000000000000000000000000000000168152f35b50903461013e5760207ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc36011261013e5782808080853533825260036020528582206107f1828254610ce4565b905580600254036002558186518281527fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef60203392a385518181527f7fcf532c15f0a6db0bd6d0e038bea71d30d808c7d98cb3bf7268a95bf5081b6560203392a2335af11561085e578280f35b90602060649251917f08c379a0000000000000000000000000000000000000000000000000000000008352820152601360248201527f4554485f5452414e534645525f4641494c4544000000000000000000000000006044820152fd5b5091346104775760607ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc360112610477576108f4610c99565b7fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef61091d610cc1565b946044358573ffffffffffffffffffffffffffffffffffffffff80951694858752602098848a958652838920338a52865283892054857fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff82036109b2575b50505086885260038552828820610993858254610ce4565b9055169586815260038452208181540190558551908152a35160018152f35b6109bb91610ce4565b90888a528652838920338a5286528389205538808561097b565b50503461043e57817ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc36011261043e576020906002549051908152f35b503461013e57817ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc36011261013e57602092610a4c610c99565b9183602435928392338252875273ffffffffffffffffffffffffffffffffffffffff8282209516948582528752205582519081527f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925843392a35160018152f35b8490843461013e57827ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc36011261013e57828054610ae981610b70565b808552916001918083169081156105fc5750600114610b14575050506105928261059c940383610bc3565b80809650527f290decd9548b62a8d60345a988386fc84ba6bc95484008f6362f93160ef3e5635b828610610b585750505061059282602061059c9582010194610580565b80546020878701810191909152909501948101610b3b565b90600182811c92168015610bb9575b6020831014610b8a57565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b91607f1691610b7f565b90601f7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0910116810190811067ffffffffffffffff821117610c0457604052565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b60208082528251818301819052939260005b858110610c85575050507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0601f8460006040809697860101520116010190565b818101830151848201604001528201610c45565b6004359073ffffffffffffffffffffffffffffffffffffffff82168203610cbc57565b600080fd5b6024359073ffffffffffffffffffffffffffffffffffffffff82168203610cbc57565b91908203918211610cf157565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b6000467f000000000000000000000000000000000000000000000000000000000000000003610d6e57507f000000000000000000000000000000000000000000000000000000000000000090565b60405181548291610d7e82610b70565b8082528160209485820194600190878282169182600014610ec1575050600114610e68575b50610db092500382610bc3565b51902091604051918201927f8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f845260408301527fc89efdaa54c0f20c7adf612882df0950f5a951637e0307cdcb4c672f298b8bc660608301524660808301523060a083015260a0825260c082019082821067ffffffffffffffff831117610e3b575060405251902090565b807f4e487b7100000000000000000000000000000000000000000000000000000000602492526041600452fd5b87805286915087907f290decd9548b62a8d60345a988386fc84ba6bc95484008f6362f93160ef3e5635b858310610ea9575050610db0935082010138610da3565b80548388018501528694508893909201918101610e92565b7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff00168852610db095151560051b8501019250389150610da39050565b600254348101809111610cf157600255336000526003602052604060002034815401905560405134815260007fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef60203393a36040513481527fe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c60203392a256fea164736f6c6343000814000a";

type WETHConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: WETHConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class WETH__factory extends ContractFactory {
  constructor(...args: WETHConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(overrides?: Overrides & { from?: string }): Promise<WETH> {
    return super.deploy(overrides || {}) as Promise<WETH>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: string }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): WETH {
    return super.attach(address) as WETH;
  }
  override connect(signer: Signer): WETH__factory {
    return super.connect(signer) as WETH__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): WETHInterface {
    return new utils.Interface(_abi) as WETHInterface;
  }
  static connect(address: string, signerOrProvider: Signer | Provider): WETH {
    return new Contract(address, _abi, signerOrProvider) as WETH;
  }
}
