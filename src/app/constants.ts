// -----------------------------------------------------------------------
// 1. ALAMAT FACTORY
// -----------------------------------------------------------------------
// ⚠️ PENTING: Ganti dengan Alamat Kontrak BARU kamu dari Remix
export const FACTORY_ADDRESS = "0x18f37f9c0723ff3ed6a0847a5c3cb216d5fbc5b6"; 


// -----------------------------------------------------------------------
// 2. ABI FACTORY (Sesuai yang kamu kirim barusan)
// -----------------------------------------------------------------------
export const FACTORY_ABI = [
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "address", "name": "pollAddress", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "question", "type": "string" }
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


// -----------------------------------------------------------------------
// 3. ABI SINGLE POLL (Untuk Kartu Voting & Baca Hasil)
// -----------------------------------------------------------------------
export const POLL_ABI = [
  {
    "inputs": [{ "internalType": "uint256", "name": "_option", "type": "uint256" }],
    "name": "vote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getPollInfo",
    "outputs": [
      { "internalType": "string", "name": "q", "type": "string" },
      { "internalType": "string", "name": "o1", "type": "string" },
      { "internalType": "uint256", "name": "c1", "type": "uint256" },
      { "internalType": "string", "name": "o2", "type": "string" },
      { "internalType": "uint256", "name": "c2", "type": "uint256" },
      { "internalType": "uint256", "name": "end", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "name": "hasVotedCheck",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;