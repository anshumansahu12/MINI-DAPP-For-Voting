/* app.js - works for admin.html, vote.html, result.html
   Uses ethers v5 UMD (we included a CDN in each HTML).
*/

const CONTRACT_ADDRESS = "0xa85508aA5322331CcE1F8181D2D40cd9Ed6e698D";
const ABI = [
  {"inputs":[],"stateMutability":"nonpayable","type":"constructor"},
  {"inputs":[{"internalType":"string","name":"_name","type":"string"},{"internalType":"string","name":"_party","type":"string"},{"internalType":"string","name":"_image","type":"string"}],"name":"addCandidate","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_candidateId","type":"uint256"}],"name":"getCandidate","outputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"string","name":"","type":"string"},{"internalType":"string","name":"","type":"string"},{"internalType":"string","name":"","type":"string"},{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"getCandidateCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_candidateId","type":"uint256"}],"name":"vote","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"admin","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"hasVoted","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"candidates","outputs":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"party","type":"string"},{"internalType":"string","name":"image","type":"string"},{"internalType":"uint256","name":"voteCount","type":"uint256"}],"stateMutability":"view","type":"function"}
];

// helper: detect which page is running
function onLoad(fn) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fn);
  } else fn();
}

onLoad(async () => {
  // If contract address not set: warn and stop
  if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === "REPLACE_WITH_YOUR_CONTRACT_ADDRESS") {
    console.warn("Put your deployed contract address in app.js -> CONTRACT_ADDRESS");
  }

  // Initialize provider only if Ethereum provider exists
  const ethereumAvailable = typeof window.ethereum !== 'undefined';
  if (!ethereumAvailable) {
    // show messages and return — pages still can load but contract calls will fail
    console.warn("MetaMask / window.ethereum not found");
  }

  // --- ADMIN PAGE HANDLERS ---
  if (document.getElementById("connectAdmin")) {
    const connectBtn = document.getElementById("connectAdmin");
    const adminAddrP = document.getElementById("adminAddress");
    const addBtn = document.getElementById("addCandidateBtn");
    const adminMsg = document.getElementById("adminMsg");

    let provider, signer, contract;
    connectBtn.onclick = async () => {
      if (!ethereumAvailable) return alert("Install MetaMask");
      provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      signer = provider.getSigner();
      const address = await signer.getAddress();
      adminAddrP.innerText = `Connected: ${address}`;
      contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
      adminMsg.innerText = "Connected. Now you can add candidates (must be contract deployer).";
    };

    addBtn.onclick = async () => {
      if (!window.ethereum) return alert("Install MetaMask");
      try {
        const provider2 = new ethers.providers.Web3Provider(window.ethereum);
        await provider2.send("eth_requestAccounts", []);
        const signer2 = provider2.getSigner();
        const contract2 = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer2);

        const name = document.getElementById("name").value.trim();
        const party = document.getElementById("party").value.trim();
        const image = document.getElementById("image").value.trim();

        if (!name || !party || !image) return alert("Fill all fields");

        const tx = await contract2.addCandidate(name, party, image);
        addBtn.disabled = true;
        addBtn.innerText = "Adding...";
        await tx.wait();
        addBtn.disabled = false;
        addBtn.innerText = "Add Candidate";
        alert("Candidate added on-chain. Wait a bit then refresh vote page.");
      } catch (err) {
        console.error(err);
        alert("Add candidate failed. Make sure you are admin (deployer) and have testnet funds.");
      }
    };
  } // end admin

  // --- VOTE PAGE HANDLERS ---
  if (document.getElementById("connectWallet")) {
    const connectBtn = document.getElementById("connectWallet");
    const walletAddressP = document.getElementById("walletAddress");
    const listDiv = document.getElementById("candidatesList");
    const selectedText = document.getElementById("selectedText");
    const confirmBtn = document.getElementById("confirmVoteBtn");
    const viewBtn = document.getElementById("viewResultsBtn");

    let provider, signer, contract;
    connectBtn.onclick = async () => {
      if (!ethereumAvailable) return alert("Install MetaMask");
      provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      signer = provider.getSigner();
      const address = await signer.getAddress();
      walletAddressP.innerText = `Connected: ${address}`;
      contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
      // load candidates
      await loadCandidatesToVote(contract);
    };

    viewBtn.onclick = () => {
      window.location = "result.html";
    };

    confirmBtn.onclick = async () => {
      if (!contract) return alert("Connect wallet first");
      if (selectedCandidateId == null) return alert("Select a candidate");
      try {
        const tx = await contract.vote(selectedCandidateId);
        confirmBtn.disabled = true;
        confirmBtn.innerText = "Sending...";
        await tx.wait();
        alert("Vote recorded on-chain! Tx: " + tx.hash);
        selectedText.innerText = "";
        selectedCandidateId = null;
        await loadCandidatesToVote(contract); // refresh counts
        confirmBtn.disabled = false;
        confirmBtn.innerText = "Confirm Vote";
      } catch (err) {
        console.error(err);
        alert("Vote failed: " + (err?.error?.message || err.message || err));
      }
    };

    // helper to load
    window.loadCandidatesToVote = async (contractInstance) => {
      const div = listDiv;
      div.innerHTML = "Loading candidates...";
      try {
        const countBn = await contractInstance.getCandidateCount();
        const count = countBn.toNumber ? countBn.toNumber() : Number(countBn);
        div.innerHTML = "";
        for (let i = 1; i <= count; i++) {
          const tup = await contractInstance.getCandidate(i);
          // tup: [id, name, party, image, voteCount]
          const id = tup[0].toString ? tup[0].toString() : tup[0];
          const name = tup[1];
          const party = tup[2];
          const image = tup[3];
          const votes = tup[4].toString ? tup[4].toString() : tup[4];

          const card = document.createElement("div");
          card.className = "candidate-card";
          card.innerHTML = `
            <img src="${image}" alt="${name}">
            <div class="candidate-info">
              <div class="candidate-name">${name}</div>
              <div class="candidate-party">${party}</div>
              <div class="candidate-votes">Votes: ${votes}</div>
            </div>
          `;
          card.onclick = () => {
            // unselect all
          document.querySelectorAll(".candidate-card").forEach(c => c.classList.remove("selected"));
            card.classList.add("selected");
            selectedCandidateId = Number(id);
            selectedText.innerText = `Selected Candidate ID: ${id} — ${name}`;
          };
          div.appendChild(card);
        }
        if (count === 0) div.innerHTML = "No candidates added yet. Ask admin to add candidates.";
      } catch (err) {
        console.error(err);
        div.innerHTML = "Failed to load candidates (contract / network / address error).";
      }
    };
  } // end vote

  // --- RESULTS PAGE HANDLERS ---
  if (document.querySelector("#resultsTable")) {
    const tbody = document.querySelector("#resultsTable tbody");
    const provider = new ethers.providers.Web3Provider(window.ethereum || null);
    const signer = provider.getSigner ? provider.getSigner() : null;
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer || provider);

    try {
      const countBn = await contract.getCandidateCount();
      const count = countBn.toNumber ? countBn.toNumber() : Number(countBn);
      tbody.innerHTML = "";
      for (let i = 1; i <= count; i++) {
        const tup = await contract.getCandidate(i);
        const id = tup[0].toString ? tup[0].toString() : tup[0];
        const name = tup[1];
        const party = tup[2];
        const votes = tup[4].toString ? tup[4].toString() : tup[4];
        const tr = document.createElement("tr");
        tr.innerHTML = `<td>${id}</td><td>${name}</td><td>${party}</td><td>${votes}</td>`;
        tbody.appendChild(tr);
      }
      if (count === 0) tbody.innerHTML = `<tr><td colspan="4">No candidates added</td></tr>`;
    } catch (err) {
      console.error(err);
      tbody.innerHTML = `<tr><td colspan="4">Error reading contract</td></tr>`;
    }
  } // end results
});