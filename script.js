// 夜間費用計算器
class NightFeeCalculator {
    constructor() {
        this.isRunning = false;
        this.isPaused = false;
        this.startTime = null;
        this.pausedTime = 0;
        this.totalPausedDuration = 0;
        this.feePerMinute = 13;
        this.history = [];
        this.animationFrameId = null;

        this.initElements();
        this.attachEventListeners();
        this.updateDisplay();
    }

    initElements() {
        this.elements = {
            currentTime: document.getElementById('currentTime'),
            statusText: document.getElementById('statusText'),
            elapsedTime: document.getElementById('elapsedTime'),
            totalAmount: document.getElementById('totalAmount'),
            startBtn: document.getElementById('startBtn'),
            pauseBtn: document.getElementById('pauseBtn'),
            resetBtn: document.getElementById('resetBtn'),
            startTimeDisplay: document.getElementById('startTime'),
            totalMinutes: document.getElementById('totalMinutes'),
            historyList: document.getElementById('historyList')
        };
    }

    attachEventListeners() {
        this.elements.startBtn.addEventListener('click', () => this.start());
        this.elements.pauseBtn.addEventListener('click', () => this.togglePause());
        this.elements.resetBtn.addEventListener('click', () => this.reset());
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.isPaused = false;
            this.startTime = Date.now() - this.totalPausedDuration;
            this.updateButtonStates();
            this.addHistoryRecord('開始計算');
            this.animate();
        }
    }

    togglePause() {
        if (this.isRunning) {
            this.isPaused = !this.isPaused;

            if (this.isPaused) {
                this.pausedTime = Date.now();
                this.addHistoryRecord('已暫停');
                this.updateButtonStates();
            } else {
                this.totalPausedDuration += Date.now() - this.pausedTime;
                this.startTime = Date.now() - this.totalPausedDuration;
                this.addHistoryRecord('繼續計算');
                this.updateButtonStates();
                this.animate();
            }
        }
    }

    reset() {
        this.isRunning = false;
        this.isPaused = false;
        this.startTime = null;
        this.pausedTime = 0;
        this.totalPausedDuration = 0;
        this.history = [];
        this.updateButtonStates();
        this.updateDisplay();
        this.elements.historyList.innerHTML = '<p class="empty-text">尚無記錄</p>';

        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }

    animate() {
        if (!this.isRunning || this.isPaused) {
            return;
        }

        this.updateDisplay();
        this.animationFrameId = requestAnimationFrame(() => this.animate());
    }

    updateDisplay() {
        // 更新現在時間
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        this.elements.currentTime.textContent = `${hours}:${minutes}:${seconds}`;

        // 更新狀態
        if (this.isRunning) {
            if (this.isPaused) {
                this.elements.statusText.textContent = '⏸️ 已暫停';
                this.elements.statusText.className = 'paused';
            } else {
                this.elements.statusText.textContent = '▶️ 計算中';
                this.elements.statusText.className = 'running';
            }
        } else {
            this.elements.statusText.textContent = '⏹️ 已停止';
            this.elements.statusText.className = 'stopped';
        }

        // 計算已消耗時間和費用
        if (this.isRunning && this.startTime) {
            const elapsedMs = (this.isPaused ? this.pausedTime : Date.now()) - this.startTime;
            const elapsedSeconds = Math.floor(elapsedMs / 1000);
            const elapsedMinutes = Math.floor(elapsedSeconds / 60);
            const remainingSeconds = elapsedSeconds % 60;

            const totalFee = elapsedMinutes * this.feePerMinute;

            this.elements.elapsedTime.textContent = `${elapsedMinutes}分${remainingSeconds}秒`;
            this.elements.totalAmount.textContent = `$${totalFee.toLocaleString()}`;
            this.elements.startTimeDisplay.textContent = new Date(this.startTime).toLocaleTimeString('zh-TW');
            this.elements.totalMinutes.textContent = elapsedMinutes;
        }
    }

    updateButtonStates() {
        if (this.isRunning) {
            this.elements.startBtn.disabled = true;
            this.elements.pauseBtn.disabled = false;
            this.elements.pauseBtn.textContent = this.isPaused ? '繼續' : '暫停';
        } else {
            this.elements.startBtn.disabled = false;
            this.elements.pauseBtn.disabled = true;
            this.elements.pauseBtn.textContent = '暫停';
        }
    }

    addHistoryRecord(action) {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('zh-TW');

        if (this.history.length === 0) {
            this.elements.historyList.innerHTML = '';
        }

        this.history.push({
            action,
            time: timeStr
        });

        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.textContent = `[${timeStr}] ${action}`;
        this.elements.historyList.appendChild(historyItem);

        // 自動滾到最底部
        this.elements.historyList.scrollTop = this.elements.historyList.scrollHeight;
    }
}

// 初始化應用
document.addEventListener('DOMContentLoaded', () => {
    const calculator = new NightFeeCalculator();
});