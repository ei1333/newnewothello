const Othello = function (container) {
    this.container = $(container);
    this.canvas = this.container.find("canvas")[0];
    this.context = this.canvas.getContext("2d");

    this.height = this.canvas.height;
    this.width = this.canvas.width;
    this.cellwidth = this.width / 8;

    this.backgroundcolor = "#00790C";
    this.linecolor = "#FFFFFF";

    this.accent = -1;

    /* [black, white] */
    this.BLACK = 0;
    this.WHITE = 1;
    this.board = [[0, 0], [0, 0]];

    this.message = this.container.find("#message");
    this.cpumessage = this.container.find("#message2");

    this.user = this.BLACK;

    this.ableclick = false;
    this.init();
    this.paint();
    this.ableclick = true;

    const self = this;
    this.container.find("canvas").on("click", function (event) {
        if (!self.ableclick) return;
        self.ableclick = false;
        let x = event.originalEvent.pageX - $(this).offset().left;
        let y = event.originalEvent.pageY - $(this).offset().top;
        x = x / self.cellwidth | 0;
        y = y / self.cellwidth | 0;

        let mob = self.make_mobility(self.board[self.user], self.board[1 ^ self.user]);
        let idx = self.cell_index(x, y);
        if ((mob[idx[0]] >> idx[1]) & 1) {
            self.touch(x, y);
        } else {
            self.message.text("おけないうし～");
            self.ableclick = true;
        }
    });
};
$(function () {
    new Othello("#othello");
});


Othello.prototype.cell_index = function (x, y) {
    let idx = y * 8 + x;
    if (idx < 32) return [0, idx];
    else return [1, idx - 32];
};

Othello.prototype.init = function () {
    this.cell_put(this.board[this.BLACK], this.board[this.WHITE], 4 * 8 + 3);
    this.cell_put(this.board[this.BLACK], this.board[this.WHITE], 3 * 8 + 4);
    this.cell_put(this.board[this.WHITE], this.board[this.BLACK], 3 * 8 + 3);
    this.cell_put(this.board[this.WHITE], this.board[this.BLACK], 4 * 8 + 4);
};

Othello.prototype.cell_put = function (user, enemy, bit) {
    if (bit >= 32) user[1] |= 1 << (bit - 32);
    else user[0] |= 1 << bit;
    let ret = this.flip(user, enemy, bit);
    user[0] ^= ret[0];
    user[1] ^= ret[1];
    enemy[0] ^= ret[0];
    enemy[1] ^= ret[1];
};

/* 描画 */
Othello.prototype.paint = function () {
    const object = this.context;

    object.fillStyle = this.backgroundcolor;
    object.fillRect(0, 0, this.width, this.width);

    object.strokeStyle = this.linecolor;
    object.beginPath();
    for (let i = 0; i < 8; i++) {
        object.moveTo(0, i * this.cellwidth);
        object.lineTo(this.width, i * this.cellwidth);
        object.moveTo(i * this.cellwidth, 0);
        object.lineTo(i * this.cellwidth, this.width);
    }
    object.closePath();
    object.stroke();

    let mob = this.make_mobility(this.board[this.user], this.board[1 ^ this.user]);

    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            let idx = this.cell_index(j, i);
            if ((this.board[0][idx[0]] >>> idx[1]) & 1) {
                object.beginPath();
                object.fillStyle = "#000000";
                object.arc(this.cellwidth / 2 + j * this.cellwidth,
                    this.cellwidth / 2 + i * this.cellwidth,
                    this.cellwidth * 0.45, 0, Math.PI * 2, true);
                object.fill();
            }
            if ((this.board[1][idx[0]] >>> idx[1]) & 1) {
                object.beginPath();
                object.fillStyle = "#FFFFFF";
                object.arc(this.cellwidth / 2 + j * this.cellwidth,
                    this.cellwidth / 2 + i * this.cellwidth,
                    this.cellwidth * 0.45, 0, Math.PI * 2, true);
                object.fill();
            }
            if ((mob[idx[0]] >> idx[1]) & 1) {
                object.beginPath();
                object.fillStyle = object.strokeStyle = "#FFFFFF";
                object.arc(this.cellwidth / 2 + j * this.cellwidth,
                    this.cellwidth / 2 + i * this.cellwidth,
                    this.cellwidth * 0.3, 0, Math.PI * 2, true);
                object.stroke();
            }
            if (i * 8 + j === this.accent) {
                object.beginPath();
                object.fillStyle = object.strokeStyle = "#33FFFFFF";
                object.arc(this.cellwidth / 2 + j * this.cellwidth,
                    this.cellwidth / 2 + i * this.cellwidth,
                    this.cellwidth * 0.3, 0, Math.PI * 2, true);
                object.fill();
            }
        }
    }
};

Othello.prototype.make_mobility = function (p, o) {
    let p1 = p[1], p0 = p[0];
    let r1 = 0, r0 = 0;
    let t0, t1;

    // 左右
    let o1 = o[1] & 0x7e7e7e7e;
    let o0 = o[0] & 0x7e7e7e7e;

    // 左
    t1 = (p1 >>> 1) & o1;
    t1 |= (t1 >>> 1) & o1;
    t1 |= (t1 >>> 1) & o1;
    t1 |= (t1 >>> 1) & o1;
    t1 |= (t1 >>> 1) & o1;
    t1 |= (t1 >>> 1) & o1;
    r1 |= (t1 >>> 1);
    t0 = (p0 >>> 1) & o0;
    t0 |= (t0 >>> 1) & o0;
    t0 |= (t0 >>> 1) & o0;
    t0 |= (t0 >>> 1) & o0;
    t0 |= (t0 >>> 1) & o0;
    t0 |= (t0 >>> 1) & o0;
    r0 |= (t0 >>> 1);

    // 右
    t1 = (p1 << 1) & o1;
    t1 |= (t1 << 1) & o1;
    t1 |= (t1 << 1) & o1;
    t1 |= (t1 << 1) & o1;
    t1 |= (t1 << 1) & o1;
    t1 |= (t1 << 1) & o1;
    r1 |= (t1 << 1);
    t0 = (p0 << 1) & o0;
    t0 |= (t0 << 1) & o0;
    t0 |= (t0 << 1) & o0;
    t0 |= (t0 << 1) & o0;
    t0 |= (t0 << 1) & o0;
    t0 |= (t0 << 1) & o0;
    r0 |= (t0 << 1);

    // 上下
    o1 = o[1] & 0x00ffffff;
    o0 = o[0] & 0xffffff00;

    // 下
    t0 = (p0 << 8) & o0;
    t0 |= (t0 << 8) & o0;
    t0 |= (t0 << 8) & o0;
    t1 = ((p1 << 8) | ((t0 | p0) >>> 24)) & o1;
    t1 |= (t1 << 8) & o1;
    t1 |= (t1 << 8) & o1;
    r1 |= (t1 << 8) | (t0 >>> 24);
    r0 |= (t0 << 8);

    // 上
    t1 = (p1 >>> 8) & o1;
    t1 |= (t1 >>> 8) & o1;
    t1 |= (t1 >>> 8) & o1;
    t0 = ((p0 >>> 8) | ((t1 | p1) << 24)) & o0;
    t0 |= (t0 >>> 8) & o0;
    t0 |= (t0 >>> 8) & o0;
    r1 |= (t1 >>> 8);
    r0 |= (t0 >>> 8) | (t1 << 24);

    // 斜め
    o1 = o[1] & 0x007e7e7e;
    o0 = o[0] & 0x7e7e7e00;

    // 右下
    t0 = (p0 << 9) & o0;
    t0 |= (t0 << 9) & o0;
    t0 |= (t0 << 9) & o0;
    t1 = ((p1 << 9) | ((t0 | p0) >>> 23)) & o1;
    t1 |= (t1 << 9) & o1;
    t1 |= (t1 << 9) & o1;
    r1 |= (t1 << 9) | (t0 >>> 23);
    r0 |= (t0 << 9);

    // 左上
    t1 = (p1 >>> 9) & o1;
    t1 |= (t1 >>> 9) & o1;
    t1 |= (t1 >>> 9) & o1;
    t0 = ((p0 >>> 9) | ((t1 | p1) << 23)) & o0;
    t0 |= (t0 >>> 9) & o0;
    t0 |= (t0 >>> 9) & o0;
    r1 |= (t1 >>> 9);
    r0 |= (t0 >>> 9) | (t1 << 23);

    // 左下
    t0 = (p0 << 7) & o0;
    t0 |= (t0 << 7) & o0;
    t0 |= (t0 << 7) & o0;
    t1 = ((p1 << 7) | ((t0 | p0) >>> 25)) & o1;
    t1 |= (t1 << 7) & o1;
    t1 |= (t1 << 7) & o1;
    r1 |= (t1 << 7) | (t0 >>> 25);
    r0 |= (t0 << 7);

    // 右上
    t1 = (p1 >>> 7) & o1;
    t1 |= (t1 >>> 7) & o1;
    t1 |= (t1 >>> 7) & o1;
    t0 = ((p0 >>> 7) | ((t1 | p1) << 25)) & o0;
    t0 |= (t0 >>> 7) & o0;
    t0 |= (t0 >>> 7) & o0;
    r1 |= (t1 >>> 7);
    r0 |= (t0 >>> 7) | (t1 << 25);

    return [r0 & ~(p[0] | o[0]), r1 & ~(p[1] | o[1])];
};

Othello.prototype.flip = function (p, o, bit) {
    if (bit >= 32) return this.flip_top(p, o, bit - 32);
    return this.flip_bottom(p, o, bit);
};

Othello.prototype.flip_bottom = function (p, o, bit) {
    bit = 1 << bit;

    let r1 = 0, r0 = 0;
    let p1 = p[1], p0 = p[0];
    let o1 = o[1], o0 = o[0];
    let mo1 = o1 & 0x7e7e7e7e;
    let mo0 = o0 & 0x7e7e7e7e;
    let t0, t1, t;

    // 左上
    t0 = (bit << 9) & mo0;
    t0 |= (t0 << 9) & mo0;
    t0 |= (t0 << 9) & mo0;
    t1 = ((t0 | bit) >>> 23) & mo1;
    t1 |= (t1 << 9) & mo1;
    t1 |= (t1 << 9) & mo1;
    t = (((t1 << 9) | (t0 >>> 23)) & p1) | ((t0 << 9) & p0);
    t = (t | -t) >> 31;
    r1 |= t1 & t;
    r0 |= t0 & t;

    // 上
    t0 = (bit << 8) & o0;
    t0 |= (t0 << 8) & o0;
    t0 |= (t0 << 8) & o0;
    t1 = ((t0 | bit) >>> 24) & o1;
    t1 |= (t1 << 8) & o1;
    t1 |= (t1 << 8) & o1;
    t = (((t1 << 8) | (t0 >>> 24)) & p1) | ((t0 << 8) & p0);
    t = (t | -t) >> 31;
    r1 |= t1 & t;
    r0 |= t0 & t;

    // 右上
    t0 = (bit << 7) & mo0;
    t0 |= (t0 << 7) & mo0;
    t0 |= (t0 << 7) & mo0;
    t1 = ((t0 | bit) >>> 25) & mo1;
    t1 |= (t1 << 7) & mo1;
    t1 |= (t1 << 7) & mo1;
    t = (((t1 << 7) | (t0 >>> 25))) & p1 | ((t0 << 7) & p0);
    t = (t | -t) >> 31;
    r1 |= t1 & t;
    r0 |= t0 & t;

    // 右
    t0 = (bit >>> 1) & mo0;
    t0 |= (t0 >>> 1) & mo0;
    t0 |= (t0 >>> 1) & mo0;
    t0 |= (t0 >>> 1) & mo0;
    t0 |= (t0 >>> 1) & mo0;
    t0 |= (t0 >>> 1) & mo0;
    r0 |= t0 & -((t0 >>> 1) & p0);

    // 左
    let d0 = 0x000000fe * bit;
    t0 = (mo0 | ~d0) + 1 & d0 & p0;
    r0 |= t0 - ((t0 | -t0) >>> 31) & d0;

    // 右下
    t0 = (bit >>> 9) & mo0;
    t0 |= (t0 >>> 9) & mo0;
    r0 |= t0 & -((t0 >>> 9) & p0);

    // 下
    t0 = (bit >>> 8) & o0;
    t0 |= (t0 >>> 8) & o0;
    r0 |= t0 & -((t0 >>> 8) & p0);

    // 左下
    t0 = (bit >>> 7) & mo0;
    t0 |= (t0 >>> 7) & mo0;
    r0 |= t0 & -((t0 >>> 7) & p0);

    return [r0, r1];
}

Othello.prototype.flip_top = function (p, o, bit) {
    bit = 1 << bit;

    let r1 = 0, r0 = 0;
    let p1 = p[1], p0 = p[0];
    let o1 = o[1], o0 = o[0];
    let mo1 = o1 & 0x7e7e7e7e;
    let mo0 = o0 & 0x7e7e7e7e;
    let t0, t1, t;

    // 左
    let d1 = 0x000000fe * bit;
    t1 = (mo1 | ~d1) + 1 & d1 & p1;
    r1 |= t1 - ((t1 | -t1) >>> 31) & d1;

    // 左上
    d1 = 0x08040200 * bit;
    t1 = (mo1 | ~d1) + 1 & d1 & p1;
    r1 |= t1 - ((t1 | -t1) >>> 31) & d1;

    // 上
    d1 = 0x01010100 * bit;
    t1 = (o1 | ~d1) + 1 & d1 & p1;
    r1 |= t1 - ((t1 | -t1) >>> 31) & d1;

    // 右上
    d1 = 0x00204080 * bit;
    t1 = (mo1 | ~d1) + 1 & d1 & p1;
    r1 |= t1 - ((t1 | -t1) >>> 31) & d1;

    // 右
    t1 = (bit >>> 1) & mo1;
    t1 |= (t1 >>> 1) & mo1;
    t1 |= (t1 >>> 1) & mo1;
    t1 |= (t1 >>> 1) & mo1;
    t1 |= (t1 >>> 1) & mo1;
    t1 |= (t1 >>> 1) & mo1;
    r1 |= t1 & -((t1 >>> 1) & p1);

    // 下
    t1 = (bit >>> 8) & o1;
    t1 |= (t1 >>> 8) & o1;
    t1 |= (t1 >>> 8) & o1;
    t0 = ((t1 | bit) << 24) & o0;
    t0 |= (t0 >>> 8) & o0;
    t0 |= (t0 >>> 8) & o0;
    t = ((t1 >>> 8) & p1) | (((t0 >>> 8) | (t1 << 24)) & p0);
    t = (t | -t) >> 31;
    r1 |= t1 & t;
    r0 |= t0 & t;

    // 左下
    t1 = (bit >>> 7) & mo1;
    t1 |= (t1 >>> 7) & mo1;
    t1 |= (t1 >>> 7) & mo1;
    t0 = ((t1 | bit) << 25) & mo0;
    t0 |= (t0 >>> 7) & mo0;
    t0 |= (t0 >>> 7) & mo0;
    t = ((t1 >>> 7) & p1) | (((t0 >>> 7) | (t1 << 25)) & p0);
    t = (t | -t) >> 31;
    r1 |= t1 & t;
    r0 |= t0 & t;

    // 右下
    t1 = (bit >>> 9) & mo1;
    t1 |= (t1 >>> 9) & mo1;
    t1 |= (t1 >>> 9) & mo1;
    t0 = ((t1 | bit) << 23) & mo0;
    t0 |= (t0 >>> 9) & mo0;
    t0 |= (t0 >>> 9) & mo0;
    t = ((t1 >>> 9) & p1) | (((t0 >>> 9) | (t1 << 23)) & p0);
    t = (t | -t) >> 31;
    r1 |= t1 & t;
    r0 |= t0 & t;

    return [r0, r1];
};

Othello.prototype.touch = function (x, y) {
    this.ableclick = false;
    this.message.text("(" + x + " ," + y + ")");

    this.accent = y * 8 + x;
    this.paint();
    this.accent = -1;

    this.cell_put(this.board[this.user], this.board[this.user ^ 1], y * 8 + x);

    const self = this;
    setTimeout(function () {
        self.change_turn();
        self.paint();
    }, 300);

};

Othello.prototype.change_turn = function () {
    this.user ^= 1;
    let mob = this.make_mobility(this.board[this.user], this.board[1 ^ this.user]);
    if (this.user === this.BLACK) {
        if (mob[0] !== 0 || mob[1] !== 0) {
            this.ableclick = true;
        } else {
            this.user ^= 1;
            mob = this.make_mobility(this.board[this.user], this.board[1 ^ this.user]);
            if (mob[0] !== 0 || mob[1] !== 0) {
                this.paint();
                const self = this;
                setTimeout(function () {
                    self.play_ai();
                }, 300);
            } else {
                this.end();
            }
        }
    } else {
        if (mob[0] !== 0 || mob[1] !== 0) {
            const self = this;
            setTimeout(function () {
                self.play_ai();
            }, 300);
        } else {
            this.user ^= 1;
            mob = this.make_mobility(this.board[this.user], this.board[1 ^ this.user]);
            if (mob[0] !== 0 || mob[1] !== 0) {
                this.paint();
                this.ableclick = true;
            } else {
                this.end();
            }
        }
    }
};

Othello.prototype.pop_count = function (x1, x0) {
    let t0 = x1 - (x1 >>> 1 & 0x55555555);
    t0 = (t0 & 0x33333333) + ((t0 & 0xcccccccc) >>> 2);
    let t1 = x0 - (x0 >>> 1 & 0x55555555);
    t0 += (t1 & 0x33333333) + ((t1 & 0xcccccccc) >>> 2);
    t0 = (t0 & 0x0f0f0f0f) + ((t0 & 0xf0f0f0f0) >>> 4);
    return t0 * 0x01010101 >>> 24;
};

Othello.prototype.play_ai = function () {
    const cnt = this.pop_count(this.board[0][0], this.board[0][1]) + this.pop_count(this.board[1][0], this.board[1][1]);

    this.hand = 0;
    if(cnt >= 51) {
        const pos = this.nega_max_search2(this.board[this.user], this.board[1 ^ this.user], -114514, 114514, 0);

        if(pos[0] < 0) {
            this.cpumessage.text("黒が " + (32 - pos[0] / 2) + " 個とりそう... 負けた＞＜" + " (" + this.hand + "手読んだよ)");
        } else if(pos[0] == 0) {
            this.cpumessage.text("おーひきわけー"  + " (" + this.hand + "手読んだよ)" );
        } else {
            this.cpumessage.text("白が " + (32 + pos[0] / 2) + " 個とりそう... かった!!"  + " (" + this.hand + "手読んだよ)" );
        }

        this.touch(pos[1] % 8, pos[1] / 8 | 0);


    } else {
        const pos = this.nega_max_search(this.board[this.user], this.board[1 ^ this.user], 8, -114514, 114514, 0);

        if(pos[0] >= 100) {
            this.cpumessage.text("かったぜ"   + " (" + this.hand + "手読んだよ)" );
        } else if(pos[0] >= 50) {
            this.cpumessage.text("勝てそうかな??"   + " (" + this.hand + "手読んだよ)" );
        } else if(pos[0] >= -10) {
            if(cnt <= 15) this.cpumessage.text("まだ序盤だね"   + " (" + this.hand + "手読んだよ)" );
            else if(cnt <= 30) this.cpumessage.text("中盤かな"   + " (" + this.hand + "手読んだよ)" );
            else if(cnt <= 40) this.cpumessage.text("！？"   + " (" + this.hand + "手読んだよ)" );
        } else if(pos[0] >= -50) {
            this.cpumessage.text("!?"   + " (" + this.hand + "手読んだよ)" );
        } else {
            this.cpumessage.text("まけた><"   + " (" + this.hand + "手読んだよ)" );
        }

        this.touch(pos[1] % 8, pos[1] / 8 | 0);
    }
};

Othello.prototype.evalute = function (user, enemy) {
    const evaluateTable = [
        [30, -5, 0, -1, -1, 0, -5, 30,
            -5, -15, -3, -3, -3, -3, -15, -5,
            0, -3, 0, -1, -1, 0, -3, 0,
            -1, -3, -1, -1, -1, -1, -3, -1],
        [-1, -3, -1, -1, -1, -1, -3, -1,
            0, -3, 0, -1, -1, 0, -3, 0,
            -5, -15, -3, -3, -3, -3, -15, -5,
            30, -5, 0, -1, -1, 0, -5, 30]
    ];
    let value = 0;
    for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 32; j++) {
            if ((user[i] >>> j) & 1) value += evaluateTable[i][j];
            else if ((enemy[i] >>> j) & 1) value -= evaluateTable[i][j];
        }
    }
    return value;
};

Othello.prototype.nega_max_search2 = function (user, enemy, alpha, beta, pass) {

    const mob = this.make_mobility(user, enemy);
    let think = [];
    for (let i = 0; i < 2; i++) {
        for(let j = 0; j < 32; j++) {
            if((mob[i] >>> j) & 1) {
                think.push(i * 32 + j);
            }
        }
    }

    if (think.length === 0) {
        if(pass >= 2) {
            return [this.pop_count(user[0], user[1]) - this.pop_count(enemy[0], enemy[1]), null];
        } else {
            const ret = this.nega_max_search2(enemy, user, -beta, -alpha, pass + 1);
            return [-ret[0], null];
        }
    }

    this.hand += think.length;
    let best = alpha, best_idx = -1;
    for(let i = 0; i < think.length; i++) {
        let nxt_user = [user[0], user[1]];
        let nxt_enemy = [enemy[0], enemy[1]];
        this.cell_put(nxt_user, nxt_enemy, think[i]);
        const ret = -(this.nega_max_search2(nxt_enemy, nxt_user, -beta, -Math.max(alpha, best), 0)[0]);
        if(best < ret || best_idx === -1) {
            best = ret;
            best_idx = think[i];
        }
        if(best >= beta) {
            break;
        }
    }

    return [best, best_idx];
};


Othello.prototype.nega_max_search = function (user, enemy, depth, alpha, beta, pass) {
    if (depth === 0) {
        if(pass === 0) {
            return [this.evalute(user, enemy), null];
        } else if(pass === 1) {
            const mob = this.make_mobility(user, enemy);
            if(mob[0] !== 0 || mob[1] !== 0) {
                return [this.evalute(user, enemy), null];
            } else {
                const sa = this.pop_count(user[0], user[1]) - this.pop_count(enemy[0], enemy[1]);
                if(sa > 0) return [114514, null];
                else return [-114514, null];
            }
        } else {
            const sa = this.pop_count(user[0], user[1]) - this.pop_count(enemy[0], enemy[1]);
            if(sa > 0) return [114514, null];
            else return [-114514, null];
        }
    }

    const mob = this.make_mobility(user, enemy);
    let think = [];
    for (let i = 0; i < 2; i++) {
        for(let j = 0; j < 32; j++) {
            if((mob[i] >>> j) & 1) {
                think.push(i * 32 + j);
            }
        }
    }
    if (think.length === 0) {
        if(pass >= 2) {
            const sa = this.pop_count(user[0], user[1]) - this.pop_count(enemy[0], enemy[1]);
            if(sa > 0) return [114514, null];
            else return [-114514, null];
        } else {
            const ret = this.nega_max_search(enemy, user, depth - 1, -beta, -alpha, pass + 1);
            return [-ret[0], null];
        }
    }

    this.hand += think.length;
    let best = alpha, best_idx = -1;
    for(let i = 0; i < think.length; i++) {
        let nxt_user = [user[0], user[1]];
        let nxt_enemy = [enemy[0], enemy[1]];
        this.cell_put(nxt_user, nxt_enemy, think[i]);
        const ret = -(this.nega_max_search(nxt_enemy, nxt_user, depth - 1, -beta, -Math.max(alpha, best), 0)[0]);
        if(best < ret || best_idx === -1) {
            best = ret;
            best_idx = think[i];
        }
        if(best >= beta) {
            break;
        }
    }

    return [best, best_idx];
};

Othello.prototype.end = function () {
    this.message.text("黒(あなた) " + this.pop_count(this.board[0][0], this.board[0][1]) + ", 白(うし） " + this.pop_count(this.board[1][0], this.board[1][1]));
};
