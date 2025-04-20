document.addEventListener('DOMContentLoaded', () => {
    // Theme toggle
    const themeSwitch = document.getElementById('theme-switch');
    themeSwitch.addEventListener('change', () => {
        document.body.setAttribute('data-theme', themeSwitch.checked ? 'dark' : 'light');
        localStorage.setItem('theme', themeSwitch.checked ? 'dark' : 'light');
    });

    // Initialize theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    themeSwitch.checked = savedTheme === 'dark';

    // Initialize charts
    const miningChart = new Chart(
        document.getElementById('mining-chart'),
        createChartConfig('Mining Hashrate', 'H/s')
    );

    const blockTimeChart = new Chart(
        document.getElementById('block-time-chart'),
        createChartConfig('Block Mining Time', 'seconds')
    );

    // Mining state
    let isMining = false;
    let miningStartTime = 0;
    let miningInterval;
    let statsInterval;

    // DOM Elements
    const startMiningBtn = document.getElementById('start-mining');
    const resetBlockchainBtn = document.getElementById('reset-blockchain');
    const difficultySlider = document.getElementById('difficulty');
    const difficultyValue = document.getElementById('difficulty-value');
    const hashrateDisplay = document.getElementById('hashrate');
    const balanceDisplay = document.getElementById('balance');
    const blocksMinedDisplay = document.getElementById('blocks-mined');
    const miningTimeDisplay = document.getElementById('mining-time');
    const transactionsContainer = document.getElementById('transactions');
    const blockchainContainer = document.getElementById('blockchain');

    // Profile and Withdrawal Elements
    const profileModal = document.getElementById('profile-modal');
    const withdrawModal = document.getElementById('withdraw-modal');
    const profileBtn = document.getElementById('profile-settings');
    const withdrawBtn = document.getElementById('withdraw');
    const profileForm = document.getElementById('profile-form');
    const withdrawForm = document.getElementById('withdraw-form');
    const withdrawAmount = document.getElementById('withdraw-amount');
    const withdrawFee = document.getElementById('withdraw-fee');
    const availableBalance = document.getElementById('available-balance');
    const totalAmount = document.getElementById('total-amount');
    const networkFee = document.getElementById('network-fee');
    const receiveAmount = document.getElementById('receive-amount');

    // Event Listeners
    startMiningBtn.addEventListener('click', toggleMining);
    resetBlockchainBtn.addEventListener('click', resetBlockchain);
    difficultySlider.addEventListener('input', updateDifficulty);
    document.getElementById('add-transaction').addEventListener('click', addTransaction);
    document.getElementById('export-blockchain').addEventListener('click', exportBlockchain);
    document.getElementById('import-blockchain').addEventListener('click', importBlockchain);

    // Event Listeners for Profile and Withdrawal
    profileBtn.addEventListener('click', () => {
        loadProfileSettings();
        profileModal.style.display = 'block';
    });

    withdrawBtn.addEventListener('click', () => {
        updateWithdrawalInfo();
        withdrawModal.style.display = 'block';
    });

    // Close modals when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === profileModal) {
            profileModal.style.display = 'none';
        }
        if (event.target === withdrawModal) {
            withdrawModal.style.display = 'none';
        }
    });

    // Profile Form Submission
    profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveProfileSettings();
        profileModal.style.display = 'none';
    });

    // Withdrawal Form Submission
    withdrawForm.addEventListener('submit', (e) => {
        e.preventDefault();
        processWithdrawal();
    });

    // Update withdrawal info when amount or fee changes
    withdrawAmount.addEventListener('input', updateWithdrawalInfo);
    withdrawFee.addEventListener('change', updateWithdrawalInfo);

    // Initialize
    updateDifficulty();
    updateStats();
    loadBlockchain();

    function createChartConfig(title, yLabel) {
        return {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: title,
                    data: [],
                    borderColor: getComputedStyle(document.body).getPropertyValue('--primary-color'),
                    backgroundColor: 'rgba(247, 147, 26, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 0
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                scales: {
                    x: {
                        display: true,
                        grid: {
                            display: false
                        },
                        ticks: {
                            maxRotation: 0,
                            maxTicksLimit: 5
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: yLabel
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                }
            }
        };
    }

    function toggleMining() {
        isMining = !isMining;
        
        if (isMining) {
            startMiningBtn.innerHTML = '<i class="fas fa-stop"></i> Stop Mining';
            startMiningBtn.classList.remove('primary');
            startMiningBtn.classList.add('danger');
            document.body.classList.add('mining-active');
            miningStartTime = Date.now();
            startMiningTimer();
            startStatsUpdate();
        } else {
            startMiningBtn.innerHTML = '<i class="fas fa-play"></i> Start Mining';
            startMiningBtn.classList.remove('danger');
            startMiningBtn.classList.add('primary');
            document.body.classList.remove('mining-active');
            clearInterval(miningInterval);
            clearInterval(statsInterval);
        }
    }

    function startMiningTimer() {
        miningInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - miningStartTime) / 1000);
            const hours = Math.floor(elapsed / 3600);
            const minutes = Math.floor((elapsed % 3600) / 60);
            const seconds = elapsed % 60;
            miningTimeDisplay.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }, 1000);
    }

    function startStatsUpdate() {
        statsInterval = setInterval(() => {
            if (!isMining) return;

            // Simulate real mining stats with more realistic values
            const baseHashrate = 500;
            const difficulty = parseInt(difficultySlider.value);
            const hashrate = Math.floor(baseHashrate * (1 + Math.random() * 0.2) * (6 - difficulty));
            const blockTime = Math.floor(600 / (hashrate / 1000)); // Simulated block time in seconds
            
            // Update displays
            hashrateDisplay.textContent = `${hashrate.toLocaleString()} H/s`;
            balanceDisplay.textContent = (parseFloat(balanceDisplay.textContent) + 0.00000001).toFixed(8);
            
            // Update charts with real-time data
            updateCharts(hashrate, blockTime);
            
            // Simulate block mining
            if (Math.random() < 0.01) { // 1% chance per second to mine a block
                mineBlock(hashrate, blockTime);
            }
        }, 1000);
    }

    function updateCharts(hashrate, blockTime) {
        const now = new Date();
        const timeString = now.toLocaleTimeString();
        
        // Update mining chart
        miningChart.data.labels.push(timeString);
        miningChart.data.datasets[0].data.push(hashrate);
        
        // Update block time chart
        blockTimeChart.data.labels.push(timeString);
        blockTimeChart.data.datasets[0].data.push(blockTime);
        
        // Keep only last 30 data points for better performance
        if (miningChart.data.labels.length > 30) {
            miningChart.data.labels.shift();
            miningChart.data.datasets[0].data.shift();
            blockTimeChart.data.labels.shift();
            blockTimeChart.data.datasets[0].data.shift();
        }
        
        // Update charts with animation disabled for real-time feel
        miningChart.update('none');
        blockTimeChart.update('none');
    }

    function mineBlock(hashrate, blockTime) {
        const blockNumber = parseInt(blocksMinedDisplay.textContent) + 1;
        const timestamp = new Date().toLocaleString();
        const hash = generateBlockHash(blockNumber, timestamp);
        
        // Create new block element
        const blockElement = document.createElement('div');
        blockElement.className = 'block-item';
        blockElement.dataset.number = blockNumber;
        blockElement.dataset.hash = hash;
        blockElement.dataset.timestamp = timestamp;
        blockElement.innerHTML = `
            <strong>Block #${blockNumber}</strong>
            <br>
            <small>Hash: ${hash}</small>
            <br>
            <small>Timestamp: ${timestamp}</small>
            <br>
            <small>Hashrate: ${hashrate.toLocaleString()} H/s</small>
        `;
        
        // Add block to blockchain
        blockchainContainer.insertBefore(blockElement, blockchainContainer.firstChild);
        blocksMinedDisplay.textContent = blockNumber;
        
        // Process pending transactions
        processTransactions();
    }

    function generateBlockHash(blockNumber, timestamp) {
        return '000000' + Math.random().toString(16).substr(2, 58);
    }

    function processTransactions() {
        const transactions = Array.from(transactionsContainer.children);
        if (transactions.length > 0) {
            // Move first transaction to blockchain
            const transaction = transactions[0];
            transactionsContainer.removeChild(transaction);
            
            // Update balance based on transaction
            const amount = parseFloat(transaction.textContent.split(':')[1].trim());
            const currentBalance = parseFloat(balanceDisplay.textContent);
            balanceDisplay.textContent = (currentBalance + amount).toFixed(8);
        }
    }

    function updateDifficulty() {
        const difficulty = difficultySlider.value;
        difficultyValue.textContent = difficulty;
    }

    function resetBlockchain() {
        if (confirm('Are you sure you want to reset the blockchain? This will delete all blocks and transactions.')) {
            blockchainContainer.innerHTML = '';
            blocksMinedDisplay.textContent = '0';
            balanceDisplay.textContent = '0.00000000';
            transactionsContainer.innerHTML = '';
            
            // Reset charts
            miningChart.data.labels = [];
            miningChart.data.datasets[0].data = [];
            miningChart.update();
            
            blockTimeChart.data.labels = [];
            blockTimeChart.data.datasets[0].data = [];
            blockTimeChart.update();
        }
    }

    function addTransaction() {
        const sender = document.getElementById('sender').value;
        const recipient = document.getElementById('recipient').value;
        const amount = document.getElementById('amount').value;
        
        if (!sender || !recipient || !amount) {
            alert('Please fill in all fields');
            return;
        }
        
        const transaction = {
            sender,
            recipient,
            amount,
            timestamp: new Date().toLocaleString()
        };
        
        const transactionElement = document.createElement('div');
        transactionElement.className = 'transaction-item';
        transactionElement.innerHTML = `
            <strong>${sender}</strong> → <strong>${recipient}</strong>: ${amount} BTC
            <br>
            <small>${transaction.timestamp}</small>
        `;
        
        transactionsContainer.appendChild(transactionElement);
    }

    function exportBlockchain() {
        const blockchainData = {
            blocks: Array.from(blockchainContainer.children).map(block => ({
                number: block.dataset.number,
                hash: block.dataset.hash,
                timestamp: block.dataset.timestamp
            })),
            transactions: Array.from(transactionsContainer.children).map(tx => ({
                content: tx.textContent,
                timestamp: tx.dataset.timestamp
            }))
        };
        
        const blob = new Blob([JSON.stringify(blockchainData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'blockchain_export.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function importBlockchain() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = e => {
            const file = e.target.files[0];
            const reader = new FileReader();
            
            reader.onload = event => {
                try {
                    const data = JSON.parse(event.target.result);
                    loadBlockchainData(data);
                } catch (error) {
                    alert('Error loading blockchain file: ' + error.message);
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    }

    function loadBlockchainData(data) {
        blockchainContainer.innerHTML = '';
        transactionsContainer.innerHTML = '';
        
        data.blocks.forEach(block => {
            const blockElement = document.createElement('div');
            blockElement.className = 'block-item';
            blockElement.dataset.number = block.number;
            blockElement.dataset.hash = block.hash;
            blockElement.dataset.timestamp = block.timestamp;
            blockElement.innerHTML = `
                <strong>Block #${block.number}</strong>
                <br>
                <small>Hash: ${block.hash}</small>
                <br>
                <small>Timestamp: ${block.timestamp}</small>
            `;
            blockchainContainer.appendChild(blockElement);
        });
        
        data.transactions.forEach(tx => {
            const txElement = document.createElement('div');
            txElement.className = 'transaction-item';
            txElement.dataset.timestamp = tx.timestamp;
            txElement.textContent = tx.content;
            transactionsContainer.appendChild(txElement);
        });
        
        blocksMinedDisplay.textContent = data.blocks.length;
    }

    function loadBlockchain() {
        // Load blockchain from localStorage if available
        const savedBlockchain = localStorage.getItem('blockchain');
        if (savedBlockchain) {
            loadBlockchainData(JSON.parse(savedBlockchain));
        }
    }

    function updateStats() {
        // Update stats from localStorage
        const savedStats = localStorage.getItem('miningStats');
        if (savedStats) {
            const stats = JSON.parse(savedStats);
            hashrateDisplay.textContent = stats.hashrate;
            balanceDisplay.textContent = stats.balance;
            blocksMinedDisplay.textContent = stats.blocksMined;
        }
    }

    function loadProfileSettings() {
        const settings = JSON.parse(localStorage.getItem('profileSettings') || '{}');
        document.getElementById('username').value = settings.username || '';
        document.getElementById('email').value = settings.email || '';
        document.getElementById('wallet-address').value = settings.walletAddress || '';
        document.getElementById('mining-preference').value = settings.miningPreference || 'cpu';
        document.getElementById('notification').checked = settings.notifications !== false;
    }

    function saveProfileSettings() {
        const settings = {
            username: document.getElementById('username').value,
            email: document.getElementById('email').value,
            walletAddress: document.getElementById('wallet-address').value,
            miningPreference: document.getElementById('mining-preference').value,
            notifications: document.getElementById('notification').checked
        };
        localStorage.setItem('profileSettings', JSON.stringify(settings));
        showNotification('Profile settings saved successfully!');
    }

    function updateWithdrawalInfo() {
        const balance = parseFloat(balanceDisplay.textContent);
        const amount = parseFloat(withdrawAmount.value) || 0;
        const fee = getNetworkFee();
        
        availableBalance.textContent = balance.toFixed(8);
        networkFee.textContent = fee.toFixed(8);
        
        if (amount > 0) {
            const total = amount + fee;
            const receive = amount;
            
            totalAmount.textContent = total.toFixed(8);
            receiveAmount.textContent = receive.toFixed(8);
            
            // Validate amount
            if (total > balance) {
                withdrawAmount.setCustomValidity('Insufficient balance');
            } else {
                withdrawAmount.setCustomValidity('');
            }
        } else {
            totalAmount.textContent = '0.00000000';
            receiveAmount.textContent = '0.00000000';
        }
    }

    function getNetworkFee() {
        const feeOption = withdrawFee.value;
        switch (feeOption) {
            case 'slow': return 0.0001;
            case 'medium': return 0.0002;
            case 'fast': return 0.0003;
            default: return 0.0002;
        }
    }

    function processWithdrawal() {
        const amount = parseFloat(withdrawAmount.value);
        const fee = getNetworkFee();
        const total = amount + fee;
        const balance = parseFloat(balanceDisplay.textContent);
        
        if (total > balance) {
            showNotification('Insufficient balance for withdrawal', 'error');
            return;
        }
        
        const address = document.getElementById('withdraw-address').value;
        if (!isValidBitcoinAddress(address)) {
            showNotification('Invalid Bitcoin address', 'error');
            return;
        }
        
        // Simulate withdrawal processing
        showNotification('Processing withdrawal...', 'info');
        
        setTimeout(() => {
            // Update balance
            const newBalance = balance - total;
            balanceDisplay.textContent = newBalance.toFixed(8);
            
            // Save transaction
            const transaction = {
                type: 'withdrawal',
                amount: -amount,
                fee: -fee,
                address: address,
                timestamp: new Date().toLocaleString()
            };
            saveTransaction(transaction);
            
            // Close modal and reset form
            withdrawModal.style.display = 'none';
            withdrawForm.reset();
            showNotification('Withdrawal successful!', 'success');
        }, 2000);
    }

    function isValidBitcoinAddress(address) {
        // Simple validation - in a real app, use a proper Bitcoin address validator
        return /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address);
    }

    function saveTransaction(transaction) {
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        transactions.push(transaction);
        localStorage.setItem('transactions', JSON.stringify(transactions));
    }

    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Referral System
    class ReferralSystem {
        constructor() {
            this.points = 0;
            this.referrals = 0;
            this.referralCode = this.generateReferralCode();
            this.init();
        }

        init() {
            // Initialize referral link
            const referralLink = document.getElementById('referral-link');
            const baseUrl = window.location.origin + window.location.pathname;
            referralLink.value = `${baseUrl}?ref=${this.referralCode}`;

            // Copy referral link button
            const copyButton = document.getElementById('copy-link');
            copyButton.addEventListener('click', () => this.copyReferralLink());

            // Claim reward buttons
            const claimButtons = document.querySelectorAll('.claim-reward');
            claimButtons.forEach(button => {
                button.addEventListener('click', (e) => this.claimReward(e.target.dataset.reward));
            });

            // Check for referral code in URL
            this.checkReferralCode();

            // Initialize real-time updates
            this.initializeRealTimeUpdates();
        }

        generateReferralCode() {
            return 'REF' + Math.random().toString(36).substr(2, 9).toUpperCase();
        }

        async copyReferralLink() {
            const referralLink = document.getElementById('referral-link');
            try {
                await navigator.clipboard.writeText(referralLink.value);
                this.showNotification('Referral link copied!', 'success');
            } catch (err) {
                this.showNotification('Failed to copy link', 'error');
            }
        }

        checkReferralCode() {
            const urlParams = new URLSearchParams(window.location.search);
            const refCode = urlParams.get('ref');
            if (refCode) {
                // Validate referral code and award points
                this.validateReferral(refCode);
            }
        }

        async validateReferral(refCode) {
            // In a real implementation, this would make an API call to validate the referral
            // For demo purposes, we'll simulate a successful referral
            if (refCode && refCode !== this.referralCode) {
                this.addPoints(100);
                this.referrals++;
                this.updateReferralStats();
                this.addActivityItem(`New referral joined! Earned 100 points`);
                this.showNotification('Welcome! You were referred by a friend', 'success');
            }
        }

        addPoints(amount) {
            this.points += amount;
            const pointsElement = document.getElementById('reward-points');
            pointsElement.textContent = this.points;
            pointsElement.classList.add('points-earned');
            setTimeout(() => pointsElement.classList.remove('points-earned'), 500);
        }

        updateReferralStats() {
            document.getElementById('total-referrals').textContent = this.referrals;
            // Update tier based on referrals
            this.updateTier();
        }

        updateTier() {
            let tier = 'Bronze';
            let bonus = 10;
            
            if (this.referrals >= 16) {
                tier = 'Gold';
                bonus = 20;
            } else if (this.referrals >= 6) {
                tier = 'Silver';
                bonus = 15;
            }

            // Update UI with new tier info
            this.showNotification(`You are now ${tier} tier with ${bonus}% bonus!`, 'success');
        }

        addActivityItem(message) {
            const activityList = document.getElementById('referral-activity');
            const item = document.createElement('div');
            item.className = 'activity-item';
            item.innerHTML = `
                <span>${message}</span>
                <span>${new Date().toLocaleTimeString()}</span>
            `;
            activityList.insertBefore(item, activityList.firstChild);
        }

        async claimReward(rewardType) {
            const rewards = {
                'hashrate-boost': { points: 500, name: 'Hashrate Boost' },
                'difficulty-reduction': { points: 1000, name: 'Difficulty Reduction' },
                'btc-bonus': { points: 2500, name: 'BTC Bonus' }
            };

            const reward = rewards[rewardType];
            if (!reward) return;

            if (this.points >= reward.points) {
                this.points -= reward.points;
                document.getElementById('reward-points').textContent = this.points;
                
                // Apply reward effect
                switch (rewardType) {
                    case 'hashrate-boost':
                        // Implement hashrate boost logic
                        this.applyHashrateBoost();
                        break;
                    case 'difficulty-reduction':
                        // Implement difficulty reduction logic
                        this.applyDifficultyReduction();
                        break;
                    case 'btc-bonus':
                        // Implement BTC bonus logic
                        this.applyBTCBonus();
                        break;
                }

                this.addActivityItem(`Claimed ${reward.name} for ${reward.points} points`);
                this.showNotification(`Successfully claimed ${reward.name}!`, 'success');
            } else {
                this.showNotification(`Not enough points to claim ${reward.name}`, 'error');
            }
        }

        applyHashrateBoost() {
            // Implement 24-hour hashrate boost
            const currentHashrate = parseFloat(document.getElementById('hashrate').textContent);
            const boostedHashrate = currentHashrate * 1.5;
            document.getElementById('hashrate').textContent = `${boostedHashrate.toFixed(2)} H/s`;
            
            // Reset after 24 hours
            setTimeout(() => {
                document.getElementById('hashrate').textContent = `${currentHashrate.toFixed(2)} H/s`;
                this.showNotification('Hashrate boost expired', 'info');
            }, 24 * 60 * 60 * 1000);
        }

        applyDifficultyReduction() {
            // Implement 1-hour difficulty reduction
            const difficultySlider = document.getElementById('difficulty');
            const originalDifficulty = difficultySlider.value;
            difficultySlider.value = Math.max(1, originalDifficulty - 1);
            
            // Reset after 1 hour
            setTimeout(() => {
                difficultySlider.value = originalDifficulty;
                this.showNotification('Difficulty reduction expired', 'info');
            }, 60 * 60 * 1000);
        }

        applyBTCBonus() {
            // Implement instant BTC bonus
            const currentBalance = parseFloat(document.getElementById('balance').textContent);
            const bonusAmount = 0.001; // 0.001 BTC bonus
            const newBalance = currentBalance + bonusAmount;
            document.getElementById('balance').textContent = `${newBalance.toFixed(8)} BTC`;
        }

        showNotification(message, type = 'info') {
            // Create notification element
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.textContent = message;
            
            // Add to document
            document.body.appendChild(notification);
            
            // Remove after 3 seconds
            setTimeout(() => notification.remove(), 3000);
        }

        initializeRealTimeUpdates() {
            // In a real implementation, this would connect to a WebSocket server
            // For demo purposes, we'll simulate real-time updates
            setInterval(() => {
                // Simulate mining points earned
                if (Math.random() < 0.3) {
                    const pointsEarned = Math.floor(Math.random() * 10) + 1;
                    this.addPoints(pointsEarned);
                    this.addActivityItem(`Earned ${pointsEarned} points from mining`);
                }
            }, 5000);
        }
    }

    // Initialize referral system
    const referralSystem = new ReferralSystem();

    // Add notification styles
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 5px;
            color: white;
            z-index: 1000;
            animation: slideIn 0.5s ease-out;
        }

        .notification.success {
            background-color: #4CAF50;
        }

        .notification.error {
            background-color: #f44336;
        }

        .notification.info {
            background-color: #2196F3;
        }

        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
}); 