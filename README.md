Mini DApp for Voting

Overview

Mini DApp for Voting is a lightweight decentralized application (DApp) designed for secure, transparent, and verifiable voting. Users can connect their crypto wallets (e.g., MetaMask) to cast votes. Each vote is recorded as a blockchain transaction, ensuring tamper-proof results.

This project demonstrates a simplified voting system using only frontend + blockchain interaction. It can be extended to integrate Firebase for user management and real-time vote tracking.


---

Features

Wallet-based Authentication: Users log in by connecting their crypto wallet (MetaMask). No traditional username/password required.

Candidate Selection: Users see candidate photos, names, and party affiliations.

Blockchain-based Voting: Each vote triggers a transaction on the blockchain (currently testnet), ensuring votes cannot be altered.

Local Storage Backup: Votes are temporarily stored locally before submission for demonstration purposes.

Simple Frontend: Clean HTML/CSS interface with responsive design.



---

File Structure

Voting_System/
├── index.html          # Landing page: Connect Wallet
├── vote.html           # Voting page with candidates
├── style.css           # CSS for the app
├── app.js              # Frontend logic (wallet connection, voting)
└── backend/            # Optional backend for advanced features


---

How to Run

1. Open index.html in a modern browser (Chrome or Edge) with MetaMask installed.


2. Click Connect Wallet to connect your crypto wallet.


3. Once connected, navigate to Vote page to select a candidate.


4. Click Confirm Vote to submit your vote. A MetaMask transaction will be prompted.




---

Future Scope

1. Backend + Database Integration (Firebase):

Add admin panel to manage candidates and election data.

Store votes in Firebase for real-time tracking.

Manage user registration with Aadhaar or other authentication methods.



2. Hybrid Blockchain + Database System:

Anchor votes on blockchain for tamper-proof verification.

Store metadata in Firebase for querying, filtering, and analytics.



3. Voting Verification:

Implement Merkle trees to allow voters to verify their votes without exposing others’ votes.

Generate cryptographic proofs to confirm vote inclusion on-chain.



4. Enhanced Frontend:

Add candidate photos, party logos, and animations for better UX.

Make the interface mobile-responsive for ease of access.



5. Advanced Security Features:

Prevent double voting using smart contract logic.

Implement time-limited elections.

Encrypt sensitive user data (if using Firebase for login).





---

Tech Stack

Frontend: HTML, CSS, JavaScript

Blockchain Interaction: Ethers.js, MetaMask

Optional Backend: Node.js + Firebase (for future scalability)


Future Possibility:
If given 1 week, I can make this project fully scalable by integrating both blockchain and Firebase. Users will have secure wallet login, votes will be recorded on-chain, and admin panel + database will manage candidates and election data efficiently. This will make the voting system ready for real-world usage.
