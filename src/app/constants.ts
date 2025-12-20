export const FACTORY_ADDRESS = "0x8d4721103C57286dB152D804CBfc26646a6fEB86";

export const FACTORY_ABI = [
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "pollId", "type": "uint256" },
      { "indexed": false, "internalType": "string", "name": "question", "type": "string" },
      { "indexed": false, "internalType": "address", "name": "creator", "type": "address" }
    ],
    "name": "PollCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "pollId", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "optionId", "type": "uint256" },
      { "indexed": false, "internalType": "address", "name": "voter", "type": "address" }
    ],
    "name": "Voted",
    "type": "event"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "_question", "type": "string" },
      { "internalType": "string", "name": "_option1", "type": "string" },
      { "internalType": "string", "name": "_option2", "type": "string" },
      { "internalType": "uint256", "name": "_duration", "type": "uint256" }
    ],
    "name": "createPoll",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_pollId", "type": "uint256" }
    ],
    "name": "getPollInfo",
    "outputs": [
      { "internalType": "string", "name": "question", "type": "string" },
      { "internalType": "string", "name": "option1", "type": "string" },
      { "internalType": "uint256", "name": "votes1", "type": "uint256" },
      { "internalType": "string", "name": "option2", "type": "string" },
      { "internalType": "uint256", "name": "votes2", "type": "uint256" },
      { "internalType": "uint256", "name": "endTime", "type": "uint256" },
      { "internalType": "address", "name": "creator", "type": "address" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_offset", "type": "uint256" },
      { "internalType": "uint256", "name": "_limit", "type": "uint256" }
    ],
    "name": "getPollsPaged",
    "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalPolls",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" },
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "name": "hasVoted",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_pollId", "type": "uint256" },
      { "internalType": "uint256", "name": "_optionId", "type": "uint256" }
    ],
    "name": "vote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

// Karena Single Contract, POLL_ABI sekarang sama dengan FACTORY_ABI
export const POLL_ABI = FACTORY_ABI;