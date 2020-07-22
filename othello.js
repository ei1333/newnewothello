$(function()
  {
      new Othello("#othello");
  });

var Othello = function(container)
{
    this.container = $(container);
    this.canvas    = this.container.find("canvas")[0];
    this.context   = this.canvas.getContext("2d");

    this.height    = this.canvas.height;
    this.width     = this.canvas.width;
    this.cellwidth = this.width / 8;
    
    this.backgroundcolor = "#00790C";
    this.linecolor       = "#FFFFFF";
    
    this.accent = -1;
    
    /* [black, white] */
    this.BLACK = 0;
    this.WHITE = 1;
    this.board = [[0, 0], [0, 0]];

    this.message = this.container.find("#message");
    this.user = this.BLACK;

    this.ableclick = false;
    this.init();
    this.paint();
    this.ableclick = true;
    
    var self = this;
    this.container.find("canvas").on("click", function(event) {
        if(!self.ableclick) return;
        self.ableclick = false;
        x = event.originalEvent.pageX - $(this).offset().left;
        y = event.originalEvent.pageY - $(this).offset().top;
        x = x / self.cellwidth | 0;
        y = y / self.cellwidth | 0;
        
        let mob = self.make_mobility(self.board[self.user], self.board[1 ^ self.user]);
        let idx = self.cell_index(x, y);
        if((mob[idx[0]] >> idx[1]) & 1) {
            self.touch(x, y);
        } else {
            self.message.text("おけないうし～");
            self.ableclick = true;
        }
    });
};

Othello.prototype.cell_index = function(x, y) {
    let idx = y * 8 + x;
    if(idx < 32) return [0, idx];
    else return [1, idx - 32];
};

Othello.prototype.init = function()
{
    this.cell_put(this.board, this.BLACK, 3, 4);
    this.cell_put(this.board, this.BLACK, 4, 3);
    this.cell_put(this.board, this.WHITE, 3, 3);
    this.cell_put(this.board, this.WHITE, 4, 4);
};

Othello.prototype.cell_put = function(board, color, x, y) {
    let idx = this.cell_index(x, y);
    board[color][idx[0]] |= 1 << idx[1];
    let ret = this.flip(board[color], board[1 ^ color], x, y);
    board[0][0] ^= ret[0];
    board[0][1] ^= ret[1];
    board[1][0] ^= ret[0];
    board[1][1] ^= ret[1];
};

/* 描画 */
Othello.prototype.paint = function()
{
    var object = this.context;

    object.fillStyle = this.backgroundcolor;
    object.fillRect(0, 0, this.width, this.width);

    object.strokeStyle = this.linecolor;
    object.beginPath();
    for(var i = 0; i < 8; i++) {
        object.moveTo(0, i * this.cellwidth);
        object.lineTo(this.width, i * this.cellwidth);
        object.moveTo(i * this.cellwidth, 0);
        object.lineTo(i * this.cellwidth, this.width);
    }
    object.closePath();
    object.stroke();

    let mob = this.make_mobility(this.board[this.user], this.board[1 ^ this.user]);
    
    for(var i = 0; i < 8; i++) {
        for(var j = 0; j < 8; j++) {
            let idx = this.cell_index(j, i);
            if((this.board[0][idx[0]] >>> idx[1]) & 1) {
                object.beginPath();
                object.fillStyle = "#000000";
                object.arc(this.cellwidth / 2 + j * this.cellwidth,
                           this.cellwidth / 2 + i * this.cellwidth,
                           this.cellwidth * 0.45, 0, Math.PI * 2, true);
                object.fill();
            }
            if((this.board[1][idx[0]] >>> idx[1]) & 1) {
                object.beginPath();
                object.fillStyle = "#FFFFFF";
                object.arc(this.cellwidth / 2 + j * this.cellwidth,
                           this.cellwidth / 2 + i * this.cellwidth,
                           this.cellwidth * 0.45, 0, Math.PI * 2, true);
                object.fill();
            }
            if((mob[idx[0]] >> idx[1]) & 1) {
                object.beginPath();
                object.fillStyle = object.strokeStyle = "#FFFFFF";
                object.arc(this.cellwidth / 2 + j * this.cellwidth,
                           this.cellwidth / 2 + i * this.cellwidth,
                           this.cellwidth * 0.3, 0, Math.PI * 2, true);
                object.stroke();
            }
            if(i * 8 + j == this.accent) {
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

/* 有効手に 1 を立てる */
Othello.prototype.make_mobility = function(p, o) {
    let p1 = p[1], p0 = p[0];
    var r1 = 0, r0 = 0;
    var t0, t1;

    // 左右
    var o1 = o[1] & 0x7e7e7e7e;
    var o0 = o[0] & 0x7e7e7e7e;
    
    // 左
    t1 =  (p1 >>> 1) & o1;
    t1 |= (t1 >>> 1) & o1;
    t1 |= (t1 >>> 1) & o1;
    t1 |= (t1 >>> 1) & o1;
    t1 |= (t1 >>> 1) & o1;
    t1 |= (t1 >>> 1) & o1;
    r1 |= (t1 >>> 1);
    t0 =  (p0 >>> 1) & o0;
    t0 |= (t0 >>> 1) & o0;
    t0 |= (t0 >>> 1) & o0;
    t0 |= (t0 >>> 1) & o0;
    t0 |= (t0 >>> 1) & o0;
    t0 |= (t0 >>> 1) & o0;
    r0 |= (t0 >>> 1);
    
    // 右
    t1 =  (p1 << 1) & o1;
    t1 |= (t1 << 1) & o1;
    t1 |= (t1 << 1) & o1;
    t1 |= (t1 << 1) & o1;
    t1 |= (t1 << 1) & o1;
    t1 |= (t1 << 1) & o1;
    r1 |= (t1 << 1);
    t0 =  (p0 << 1) & o0;
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
    t0 =  (p0 << 8) & o0;
    t0 |= (t0 << 8) & o0;
    t0 |= (t0 << 8) & o0;
    t1 =  ((p1 << 8) | ((t0 | p0) >>> 24)) & o1;
    t1 |= (t1 << 8) & o1;
    t1 |= (t1 << 8) & o1;
    r1 |= (t1 << 8) | (t0 >>> 24);
    r0 |= (t0 << 8);

    // 上
    t1 =  (p1 >>> 8) & o1;
    t1 |= (t1 >>> 8) & o1;
    t1 |= (t1 >>> 8) & o1;
    t0 =  ((p0 >>> 8) | ((t1 | p1) << 24)) & o0;
    t0 |= (t0 >>> 8) & o0;
    t0 |= (t0 >>> 8) & o0;
    r1 |= (t1 >>> 8);
    r0 |= (t0 >>> 8) | (t1 << 24);

    // 斜め
    o1 = o[1] & 0x007e7e7e;
    o0 = o[0] & 0x7e7e7e00;

    // 右下
    t0 =  (p0 << 9) & o0;
    t0 |= (t0 << 9) & o0;
    t0 |= (t0 << 9) & o0;
    t1 =  ((p1 << 9) | ((t0 | p0) >>> 23)) & o1;
    t1 |= (t1 << 9) & o1;
    t1 |= (t1 << 9) & o1;
    r1 |= (t1 << 9) | (t0 >>> 23);
    r0 |= (t0 << 9);

    // 左上
    t1 =  (p1 >>> 9) & o1;
    t1 |= (t1 >>> 9) & o1;
    t1 |= (t1 >>> 9) & o1;
    t0 =  ((p0 >>> 9) | ((t1 | p1) << 23)) & o0;
    t0 |= (t0 >>> 9) & o0;
    t0 |= (t0 >>> 9) & o0;
    r1 |= (t1 >>> 9);
    r0 |= (t0 >>> 9) | (t1 << 23);

    // 左下
    t0 =  (p0 << 7) & o0;
    t0 |= (t0 << 7) & o0;
    t0 |= (t0 << 7) & o0;
    t1 =  ((p1 << 7) | ((t0 | p0) >>> 25)) & o1;
    t1 |= (t1 << 7) & o1;
    t1 |= (t1 << 7) & o1;
    r1 |= (t1 << 7) | (t0 >>> 25);
    r0 |= (t0 << 7);

    // 右上
    t1 =  (p1 >>> 7) & o1;
    t1 |= (t1 >>> 7) & o1;
    t1 |= (t1 >>> 7) & o1;
    t0 =  ((p0 >>> 7) | ((t1 | p1) << 25)) & o0;
    t0 |= (t0 >>> 7) & o0;
    t0 |= (t0 >>> 7) & o0;
    r1 |= (t1 >>> 7);
    r0 |= (t0 >>> 7) | (t1 << 25);
    
    return [r0 & ~(p[0] | o[0]), r1 & ~(p[1] | o[1])];
};


Othello.prototype.flip = function(p, o, x, y) {
    let bit = y * 8 + x;
    if(bit >= 32) return this.flip_top(p, o, bit - 32);
    return this.flip_bottom(p, o, bit);
};

Othello.prototype.flip_bottom = function(p, o, bit) {
    bit = 1 << bit;
    
    var r1 = 0, r0 = 0;
    let p1 = p[1], p0 = p[0];
    let o1 = o[1], o0 = o[0];
    let mo1 = o1 & 0x7e7e7e7e;
    let mo0 = o0 & 0x7e7e7e7e;
    var t1, t2, t;
    
    // 左上
    t0 =  (bit << 9) & mo0;
    t0 |= (t0 << 9) & mo0;
    t0 |= (t0 << 9) & mo0;
    t1 =  ((t0 | bit) >>> 23) & mo1;
    t1 |= (t1 << 9) & mo1;
    t1 |=  (t1 << 9) & mo1;
    t = (((t1 << 9) | (t0 >>> 23)) & p1) | ((t0 << 9) & p0);
    t = (t | -t) >> 31;
    r1 |= t1 & t;
    r0 |= t0 & t;

    // 上
    t0 =  (bit << 8) & o0;
    t0 |= (t0 << 8) & o0;
    t0 |= (t0 << 8) & o0;
    t1 =  ((t0 | bit) >>> 24) & o1;
    t1 |= (t1 << 8) & o1;
    t1 |= (t1 << 8) & o1;
    t = (((t1 << 8) | (t0 >>> 24)) & p1) | ((t0 << 8) & p0);
    t = (t | -t) >> 31;
    r1 |= t1 & t;
    r0 |= t0 & t;

    // 右上
    t0 =  (bit << 7) & mo0;
    t0 |= (t0 << 7) & mo0;
    t0 |= (t0 << 7) & mo0;
    t1 =  ((t0 | bit) >>> 25) & mo1;
    t1 |= (t1 << 7) & mo1;
    t1 |= (t1 << 7) & mo1;
    t = (((t1 << 7) | (t0 >>> 25))) & p1 | ((t0 << 7) & p0);
    t = (t | -t) >> 31;
    r1 |= t1 & t;
    r0 |= t0 & t;

    // 右
    t0 =  (bit >>> 1) & mo0;
    t0 |= (t0 >>> 1) & mo0;
    t0 |= (t0 >>> 1) & mo0;
    t0 |= (t0 >>> 1) & mo0;
    t0 |= (t0 >>> 1) & mo0;
    t0 |= (t0 >>> 1) & mo0;
    r0 |= t0 & -((t0 >>> 1) & p0);

    // 左
    let d0 = 0x000000fe * bit;
    t0 = (o0 | ~d0) + 1 & d0 & p0;
    r0 |= t0 - ((t0 | -t0) >>> 31) & d0;

    // 右下
    t0 =  (bit >>> 9) & mo0;
    t0 |= (t0 >>> 9) & mo0;
    r0 |= t0 & -((t0 >>> 9) & p0);

    // 下
    t0 =  (bit >>> 8) & o0;
    t0 |= (t0 >>> 8) & o0;
    r0 |= t0 & -((t0 >>> 8) & p0);

    // 左下
    t0 =  (bit >>> 7) & mo0;
    t0 |= (t0 >>> 7) & mo0;
    r0 |= t0 & -((t0 >>> 7) & p0);

    return [r0, r1];
}

Othello.prototype.flip_top = function(p, o, bit) {
    bit = 1 << bit;
    
    let r1 = 0, r0 = 0;
    let p1 = p[1], p0 = p[0];
    let o1 = o[1], o0 = o[0];
    let mo1 = o1 & 0x7e7e7e7e;
    let mo0 = o0 & 0x7e7e7e7e;
    var t1, t2, t;

    // 左
    var d1 = 0x000000fe * bit;
    t1 = (o1 | ~d1) + 1 & d1 & p1;
    r1 = t1 - ((t1 | -t1) >>> 31) & d1;

    // 左上
    d1 = 0x08040200 * bit;
    t1 = (o1 | ~d1) + 1 & d1 & p1;
    r1 |= t1 - ((t1 | -t1) >>> 31) & d1;

    // 上
    d1 = 0x01010100 * bit;
    t1 = (o1 | ~d1) + 1 & d1 & p1;
    r1 |= t1 - ((t1 | -t1) >>> 31) & d1;

    // 右上
    d1 = 0x00204080 * bit;
    t1 = (o1 | ~d1) + 1 & d1 & p1;
    r1 |= t1 - ((t1 | -t1) >>> 31) & d1;
    
    // 右
    t1 =  (bit >>> 1) & mo1;
    t1 |= (t1 >>> 1) & mo1;
    t1 |= (t1 >>> 1) & mo1;
    t1 |= (t1 >>> 1) & mo1;
    t1 |= (t1 >>> 1) & mo1;
    t1 |= (t1 >>> 1) & mo1;
    r1 |= t1 & -((t1 >>> 1) & p1);

    // 下
    t1 =  (bit >>> 8) & o1;
    t1 |= (t1 >>> 8) & o1;
    t1 |= (t1 >>> 8) & o1;
    t0 =  ((t1 | bit) << 24) & o0;
    t0 |= (t0 >>> 8) & o0;
    t0 |= (t0 >>> 8) & o0;
    t = ((t1 >>> 8) & p1) | (((t0 >>> 8) | (t1 << 24)) & p0);
    t = (t | -t) >> 31;
    r1 |= t1 & t;
    r0 |= t0 & t;

    // 左下
    t1 =  (bit >>> 7) & mo1;
    t1 |= (t1 >>> 7) & mo1;
    t1 |= (t1 >>> 7) & mo1;
    t0 =  ((t1 | bit) << 25) & mo0;
    t0 |= (t0 >>> 7) & mo0;
    t0 |= (t0 >>> 7) & mo0;
    t = ((t1 >>> 7) & p1) | (((t0 >>> 7) | (t1 << 25)) & p0);
    t = (t | -t) >> 31;
    r1 |= t1 & t;
    r0 |= t0 & t;

    // 右下
    t1 =  (bit >>> 9) & mo1;
    t1 |= (t1 >>> 9) & mo1;
    t1 |= (t1 >>> 9) & mo1;
    t0 =  ((t1 | bit) << 23) & mo0;
    t0 |= (t0 >>> 9) & mo0;
    t0 |= (t0 >>> 9) & mo0;
    t = ((t1 >>> 9) & p1) | (((t0 >>> 9) | (t1 << 23)) & p0);
    t = (t | -t) >> 31;
    r1 |= t1 & t;
    r0 |= t0 & t;

    return [r0, r1];
};

Othello.prototype.touch = function(x, y) {
    this.ableclick = false;
    this.message.text("(" + x + " ," + y + ")");
    
    var self = this;
    this.accent = y * 8 + x;
    this.paint();
    this.accent = -1;
    setTimeout(function() {
        self.cell_put(self.board, self.user, x, y);
        setTimeout(function() {
            self.change_turn();
            self.paint();
        }, 200);
    }, 100);
};

Othello.prototype.change_turn = function() {
    this.user ^= 1;
    var mob = this.make_mobility(this.board[this.user], this.board[1 ^ this.user]);
    if(this.user == this.BLACK) {
        if(mob[0] > 0 || mob[1] > 0) {
            this.ableclick = true;
        } else {
            this.user ^= 1;
            mob = this.make_mobility(this.board[this.user], this.board[1 ^ this.user]);
            if(mob[0] > 0 || mob[1] > 0) {
                this.paint();
                var self = this;
                setTimeout(function() {
                    self.play_ai();
                }, 300); 
            } else {
                this.end();
            }
        }
    } else {
        if(mob[0] > 0 || mob[1] > 0) {
            var self = this;
            setTimeout(function() {
                self.play_ai();
            }, 300);
        } else {
            this.user ^= 1;
            mob = this.make_mobility(this.board[this.user], this.board[1 ^ this.user]);
            if(mob[0] > 0 || mob[1] > 0) {
                this.paint();
                this.ableclick = true;
            } else {
                this.end();
            }
        }
    }
};

Othello.prototype.pop_count = function(x1, x0) {
    let t0 = x1 - (x1 >>> 1 & 0x55555555);
    t0 = (t0 & 0x33333333) + ((t0 & 0xcccccccc) >>> 2);
    let t1 = x0 - (x0 >>> 1 & 0x55555555);
    t0 += (t1 & 0x33333333) + ((t1 & 0xcccccccc) >>> 2);
    t0 = (t0 & 0x0f0f0f0f) + ((t0 & 0xf0f0f0f0) >>> 4);
    return t0 * 0x01010101 >>> 24;
};

Othello.prototype.play_ai = function() {

    this.full_search();
    
    var mob = this.make_mobility(this.board[this.user], this.board[1 ^ this.user]);
    var think = [];
    for(var i = 0; i < 8; i++) {
        for(var j = 0; j < 8; j++) {
            let idx = this.cell_index(j, i);
            if((mob[idx[0]] >> idx[1]) & 1) think.push([j, i]);
        }
    }
    var poyo = Math.floor(Math.random() * think.length);
    this.touch(think[poyo][0], think[poyo][1]);
};

/* 全部探します */
Othello.prototype.full_search = function() {
    var que = Array();
    que.push([[this.board[this.user][0], this.board[this.user][1]],
              [this.board[1 ^ this.user][0], this.board[1 ^ this.user][1]]]);
    while(que.length > 0) {
        var next_que = new Array();
        for(var i = 0; i < que.length; i++) {
            let state = que[i];
            console.log(state);
        }
        que = next_que;
    }
};

Othello.prototype.end = function() {
     this.message.text("黒(あなた) " + this.pop_count(this.board[0][0], this.board[0][1]) + ", 白(うし） " + this.pop_count(this.board[1][0], this.board[1][1]));
};
