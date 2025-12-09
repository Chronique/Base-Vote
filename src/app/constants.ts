// Address Factory V3 (Event-Based)
export const FACTORY_ADDRESS = "0xdbe1e97fb92e6511351fb8d01b0521ea9135af12";

// === FACTORY ABI (Sesuai yang kamu kirim) ===
export const FACTORY_ABI = [
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "address", "name": "pollAddress", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "question", "type": "string" },
      { "indexed": false, "internalType": "address", "name": "creator", "type": "address" }
    ],
    "name": "PollCreated",
    "type": "event"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "name": "allPolls",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "_question", "type": "string" },
      { "internalType": "string", "name": "_opt1", "type": "string" },
      { "internalType": "string", "name": "_opt2", "type": "string" },
      { "internalType": "uint256", "name": "_duration", "type": "uint256" }
    ],
    "name": "createPoll",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllPolls",
    "outputs": [{ "internalType": "address[]", "name": "", "type": "address[]" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// === POLL ABI (Disusun Manual untuk Contract V3) ===
export const POLL_ABI = [
  // 1. Fungsi Vote
  {
    "inputs": [{ "internalType": "uint8", "name": "_option", "type": "uint8" }],
    "name": "vote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // 2. Cek Status Vote User (PENTING untuk UI)
  {
    "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "name": "hasVoted",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  // 3. Ambil Detail Poll
  {
    "inputs": [],
    "name": "getPollInfo",
    "outputs": [
      { "internalType": "string", "name": "_question", "type": "string" },
      { "internalType": "string", "name": "_opt1", "type": "string" },
      { "internalType": "uint256", "name": "_count1", "type": "uint256" },
      { "internalType": "string", "name": "_opt2", "type": "string" },
      { "internalType": "uint256", "name": "_count2", "type": "uint256" },
      { "internalType": "uint256", "name": "_endTime", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  // 4. EVENT VOTE (Untuk VoterList via Logs)
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "voter", "type": "address" },
      { "indexed": false, "internalType": "uint8", "name": "choice", "type": "uint8" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "NewVote",
    "type": "event"
  }
] as const;