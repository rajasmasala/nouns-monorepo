/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { NounsSeeder, NounsSeederInterface } from "../NounsSeeder";

const _abi = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "nounId",
        type: "uint256",
      },
      {
        internalType: "contract INounsDescriptor",
        name: "descriptor",
        type: "address",
      },
    ],
    name: "generateSeed",
    outputs: [
      {
        components: [
          {
            internalType: "uint48",
            name: "background",
            type: "uint48",
          },
          {
            internalType: "uint48",
            name: "body",
            type: "uint48",
          },
          {
            internalType: "uint48",
            name: "accessory",
            type: "uint48",
          },
          {
            internalType: "uint48",
            name: "head",
            type: "uint48",
          },
          {
            internalType: "uint48",
            name: "glasses",
            type: "uint48",
          },
        ],
        internalType: "struct INounsSeeder.Seed",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b50610518806100206000396000f3fe608060405234801561001057600080fd5b506004361061002b5760003560e01c8063422e2e9914610030575b600080fd5b61004361003e366004610407565b61009a565b6040516100919190815165ffffffffffff9081168252602080840151821690830152604080840151821690830152606080840151821690830152608092830151169181019190915260a00190565b60405180910390f35b6040805160a0810182526000808252602082018190529181018290526060810182905260808101829052906100d0600143610450565b604080519140602083015281018590526060016040516020818303038152906040528051906020012060001c905060008373ffffffffffffffffffffffffffffffffffffffff16634531c0a86040518163ffffffff1660e01b8152600401602060405180830381865afa15801561014b573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061016f919061048e565b905060008473ffffffffffffffffffffffffffffffffffffffff1663eba818066040518163ffffffff1660e01b8152600401602060405180830381865afa1580156101be573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906101e2919061048e565b905060008573ffffffffffffffffffffffffffffffffffffffff16634daebac26040518163ffffffff1660e01b8152600401602060405180830381865afa158015610231573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610255919061048e565b905060008673ffffffffffffffffffffffffffffffffffffffff1663cc2aa0916040518163ffffffff1660e01b8152600401602060405180830381865afa1580156102a4573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102c8919061048e565b905060008773ffffffffffffffffffffffffffffffffffffffff16634479cef26040518163ffffffff1660e01b8152600401602060405180830381865afa158015610317573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061033b919061048e565b90506040518060a00160405280868865ffffffffffff1661035c91906104a7565b65ffffffffffff16815260200185603089901c65ffffffffffff1661038191906104a7565b65ffffffffffff16815260200184606089901c65ffffffffffff166103a691906104a7565b65ffffffffffff16815260200183609089901c65ffffffffffff166103cb91906104a7565b65ffffffffffff1681526020018260c089901c65ffffffffffff166103f091906104a7565b65ffffffffffff1690529998505050505050505050565b6000806040838503121561041a57600080fd5b82359150602083013573ffffffffffffffffffffffffffffffffffffffff8116811461044557600080fd5b809150509250929050565b600082821015610489577f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b500390565b6000602082840312156104a057600080fd5b5051919050565b6000826104dd577f4e487b7100000000000000000000000000000000000000000000000000000000600052601260045260246000fd5b50069056fea26469706673582212201ede438c623283997e8659817ef133ef11a8ddee4f09644100fa634035c0eaf764736f6c634300080c0033";

type NounsSeederConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: NounsSeederConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class NounsSeeder__factory extends ContractFactory {
  constructor(...args: NounsSeederConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
    this.contractName = "NounsSeeder";
  }

  deploy(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<NounsSeeder> {
    return super.deploy(overrides || {}) as Promise<NounsSeeder>;
  }
  getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): NounsSeeder {
    return super.attach(address) as NounsSeeder;
  }
  connect(signer: Signer): NounsSeeder__factory {
    return super.connect(signer) as NounsSeeder__factory;
  }
  static readonly contractName: "NounsSeeder";
  public readonly contractName: "NounsSeeder";
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): NounsSeederInterface {
    return new utils.Interface(_abi) as NounsSeederInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): NounsSeeder {
    return new Contract(address, _abi, signerOrProvider) as NounsSeeder;
  }
}
