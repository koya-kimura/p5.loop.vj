/**
 * APC Mini MK2 MIDIコントローラーを管理するクラス
 * MIDIManagerクラスを継承し、APC Mini MK2の特定の機能を実装
 */
class APCMiniMK2Manager extends MIDIManager {
    constructor() {
        super();

        // グリッドの状態を管理する配列
        this.gridPressedState_ = Array(8).fill().map(() => Array(8).fill(0));  // 現在の押下状態
        this.gridPrevState_ = Array(8).fill().map(() => Array(8).fill(0));     // 前回の押下状態
        this.gridOneShotState_ = Array(8).fill().map(() => Array(8).fill(0));  // ワンショット状態
        this.gridToggleState_ = Array(8).fill().map(() => Array(8).fill(0));   // トグル状態

        // グリッドの各ボタンの動作タイプを定義
        this.gridStateType_ = Array(8).fill(Array(8).fill("VRADIO"));

        // フェーダー関連の状態を管理する配列
        this.faderValues_ = Array(9).fill(0);             // 現在のフェーダー値
        this.faderValuesPrev_ = Array(9).fill(0);        // 前回のフェーダー値
        this.faderButtonState_ = Array(9).fill(0);       // フェーダーボタンの押下状態
        this.faderButtonToggleState_ = Array(9).fill(0); // フェーダーボタンのトグル状態

        // サイドボタンの状態を管理する配列
        this.sideButtonState_ = Array(8).fill(0);        // サイドボタンの押下状態
        this.sideButtonToggleState_ = Array(8).fill(0);  // サイドボタンのトグル状態

        // 線形補間状態と押下時間を管理する配列
        this.gridLerpState_ = Array(8).fill().map(() => Array(8).fill(0));
        this.gridPressTime_ = Array(8).fill().map(() => Array(8).fill(0));
        this.gridLerpDirection_ = Array(8).fill().map(() => Array(8).fill(0)); // 1: 0->1, -1: 1->0

        // verticalRadioNums
        this.verticalRadioNums_ = Array(8).fill(0);
    }

    /**
     * グリッドの状態を取得するメソッド
     * @param {number} row - 行番号
     * @param {number} col - 列番号
     * @param {string} type - 状態タイプ TOGGLED | ONESHOT | PRESSED | LEAP
     * @return {number} 指定された状態の値
     */
    gridState(row, col, type, mode="SET") {
        if(mode == "SET") this.gridStateType_[row][col] = type;
        if (type === "TOGGLED") {
            return this.gridToggleState_[row][col];
        } else if (type === "ONESHOT") {
            return this.gridOneShotState_[row][col];
        } else if (type === "PRESSED") {
            return this.gridPressedState_[row][col];
        } else if (type === "LEAP") {
            return this.gridLerpState_[row][col];
        } else if (type == "VRADIO") {
            return row == this.verticalRadioNums_[col] ? 1 : 0;
        } else {
            return 0;
        }
    }

    /**
     * グリッドの状態を更新するメソッド
     * @param {number} row - 行番号
     * @param {number} col - 列番号
     * @param {boolean} pressed - 押下状態
     */
    updateGridState(row, col, pressed) {
        const currentTime = Date.now();
        const duration = 300; // 0.3秒！！！！！！！！！！！

        if (pressed) {
            const elapsed = currentTime - this.gridPressTime_[row][col];
            if (elapsed < duration) {
                // 進行方向を逆にする
                this.gridLerpDirection_[row][col] *= -1;
            } else {
                // 新しい押下
                this.gridLerpDirection_[row][col] = this.gridLerpState_[row][col] === 0 ? 1 : -1;
            }
            this.gridPressTime_[row][col] = currentTime;
        }

        const elapsed = currentTime - this.gridPressTime_[row][col];
        if (elapsed >= duration) {
            this.gridLerpState_[row][col] = this.gridLerpDirection_[row][col] === 1 ? 1 : 0;
        } else {
            const progress = elapsed / duration;
            this.gridLerpState_[row][col] = this.gridLerpDirection_[row][col] === 1 ? progress : 1 - progress;
        }
    }

    /**
     * フレームごとの更新処理を行うメソッド
     */
    update() {
        // ワンショット状態の更新
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                this.gridOneShotState_[i][j] = max(this.gridPressedState_[i][j] - this.gridPrevState_[i][j], 0);
            }
        }

        // グリッドの状態を更新
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                this.updateGridState(row, col, this.gridOneShotState_[row][col] == 1);
            }
        }

        // MIDI出力の送信
        if (this.midiSuccess_) {
            this.midiOutputSend();
        }

        // 前回の状態を保存
        this.gridPrevState_ = structuredClone(this.gridPressedState_);
    }

    /**
     * フェーダー値を更新するメソッド
     * @param {number} index - フェーダーのインデックス
     */
    updateFaderValue(index) {
        this.faderValues_[index] = this.faderButtonToggleState_[index] ? 0 : this.faderValuesPrev_[index];
    }

    /**
     * MIDIメッセージを受信した際の処理
     * @param {MIDIMessageEvent} message - 受信したMIDIメッセージ
     */
    onMIDIMessage(message) {
        const [status, note, velocity] = message.data;

        // フェーダーボタンとサイドボタンの処理
        if (status === 144) {
            console.log(`MIDI status=${status}, note=${note}, velocity=${velocity}`);
            if (note >= 100 && note <= 107 || note == 122) {
                const buttonIndex = note >= 100 && note <= 107 ? note - 100 : 8;
                this.faderButtonState_[buttonIndex] = 1;
                if (velocity > 0) {
                    this.faderButtonToggleState_[buttonIndex] = 1 - this.faderButtonToggleState_[buttonIndex];
                    this.updateFaderValue(buttonIndex);
                }
            }
            else if (note >= 112 && note <= 119) {
                const buttonIndex = note - 112;
                this.sideButtonState_[buttonIndex] = 1;
                if (velocity > 0) {
                    this.sideButtonToggleState_[buttonIndex] = 1 - this.sideButtonToggleState_[buttonIndex];
                }
            }
        }

        // グリッドボタンの処理
        if ((status === 144 || status === 128) && note >= 0 && note <= 63) {
            console.log(`MIDI status=${status}, note=${note}, velocity=${velocity}`);
            const row = Math.floor(note / 8);
            const col = note % 8;
            this.gridPressedState_[row][col] = velocity > 0 ? 1 : 0;
            if (velocity > 0) {
                this.gridToggleState_[row][col] = 1 - this.gridToggleState_[row][col];
            }
            this.verticalRadioNums_[col] = row;
        }
        // フェーダーの処理
        else if (status === 176 && note >= 48 && note <= 56) {
            const faderIndex = note - 48;
            const normalizedValue = velocity / 127;
            this.faderValuesPrev_[faderIndex] = normalizedValue;
            this.updateFaderValue(faderIndex);
        }
    }

    /**
     * MIDI出力を送信するメソッド
     */
    midiOutputSend() {
        if (!this.midiOutput_) return;

        // フェーダーボタンの状態を送信
        this.faderButtonToggleState_.forEach((state, i) => {
            const midiNote = i < 8 ? 100 + i : 122;
            this.midiOutput_.send([0x90, midiNote, state * 127]);
        });

        // サイドボタンの状態を送信
        this.sideButtonToggleState_.forEach((state, i) => {
            this.midiOutput_.send([0x90, 112 + i, state * 127]);
        });

        // グリッドの状態を送信
        this.gridStateType_.forEach((row, i) => {
            row.forEach((cellStateType, j) => {
                let state = map(this.gridState(i, j, cellStateType, "GET"), 0, 1, 0, 0.7);
                this.midiOutput_.send([0x90, i * 8 + j, state * 127]);
            });
        });

        // フェーダー値の送信
        this.faderValues_.forEach((value, i) => {
            this.midiOutput_.send([0xB0, 48 + i, Math.round(value * 127)]);
        });
    }

    midiButtonReset(){
        // グリッドの状態を管理する配列
        this.gridPressedState_ = Array(8).fill().map(() => Array(8).fill(0));  // 現在の押下状態
        this.gridPrevState_ = Array(8).fill().map(() => Array(8).fill(0));     // 前回の押下状態
        this.gridOneShotState_ = Array(8).fill().map(() => Array(8).fill(0));  // ワンショット状態
        this.gridToggleState_ = Array(8).fill().map(() => Array(8).fill(0));   // トグル状態

        // グリッドの各ボタンの動作タイプを定義
        this.gridStateType_ = Array(8).fill(Array(8).fill("INACTIVE"));

        this.faderButtonState_ = new Array(9).fill(0);       // フェーダーボタンの押下状態
        this.faderButtonToggleState_ = new Array(9).fill(0); // フェーダーボタンのトグル状態

        // サイドボタンの状態を管理する配列
        this.sideButtonState_ = new Array(8).fill(0);        // サイドボタンの押下状態
        this.sideButtonToggleState_ = new Array(8).fill(1);  // サイドボタンのトグル状態

        // 線形補間状態と押下時間を管理する配列
        this.gridLerpState_ = Array(8).fill().map(() => Array(8).fill(0));
        this.gridPressTime_ = Array(8).fill().map(() => Array(8).fill(0));
        this.gridLerpDirection_ = Array(8).fill().map(() => Array(8).fill(0)); // 1: 0->1, -1: 1->0
    }
}
