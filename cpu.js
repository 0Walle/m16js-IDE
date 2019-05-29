function VirtualMachine() {
    
    this.mem = new Uint8Array(256*128)
    this.regs = new Uint16Array(16)

    this.decodeb64 = (value) => {
        value = value.charCodeAt(0)
        return (value >= 65 && value <= 90)?(value-65+0)
             : (value >= 97 && value <= 122)?(value-97+26)
             : (value >= 48 && value <= 57)?(value-48+52)
             : (value == 43 ? 62: 63);
    }

    this.db64 = (mask,inst) => {
        //console.log(inst)
        return this.decodeb64(mask[Math.floor(inst/6)]) & (1<<(5-inst%6))
    }

    this.execute = (inst,op1,op2,op3) => {
        let r1 = (op1&0xFF)>>4;
        let r2 = (op1&0xFF)&15;


        let temp;
        let src;
        let addr;
        let stat;
        let flg;
        if(this.db64("f9/3+//7//gAAAfsAA==",inst)) src = temp = this.get_reg(r1);
        if(this.db64("AAAAAAAAAAAAAAAAAg==",inst)) this.set_memB((op1<<8|op2), op3);
        if(this.db64("f///+AAAAAAAAAAQDA==",inst)) addr = (op2<<8|op3)+this.get_reg(r2);
        if(this.db64("fsAAAAAAAAAAAAAQAA==",inst)) temp = this.get_memW(addr);
        if(this.db64("AD+wAAAAAAAAAAAADA==",inst)) temp = this.get_memB(addr);
        if(this.db64("AAAP+AAAAAAAAAAAAA==",inst)) temp = this.get_memBX(addr);
        if(this.db64("AAAAB//4AAAAAAAAAA==",inst)) temp = (op2<<8|op3);
        if(this.db64("AAAAAAAH//gAAAAAAA==",inst)) temp = this.get_reg(r2);
        if(this.db64("AAAAAAAAAAf/+AAA8A==",inst)) temp = (op1<<8|op2);
        if(this.db64("AAAAAAAAAAAAAAACAA==",inst)) temp = this.popB();
        if(this.db64("AAAAAAAAAAAABAABAA==",inst)) temp = this.popW();
        if(this.db64("QJAkEggCCAAAAAAAAA==",inst)) temp = src + temp;
        if(this.db64("IkiSKRAJEAgAAAAAAA==",inst)) temp = src - temp;
        if(this.db64("QBAEAgACAAAAAAAAAA==",inst)) temp += this.get_flag(2);
        if(this.db64("IAgCAQABAAAAAAAAAA==",inst)) temp -= !this.get_flag(2);
        if(this.db64("AAAAAAQABAAAAAAAAA==",inst)) temp = src * temp;
        if(this.db64("AAAAAAIAAgAAAAAAAA==",inst)) temp = src / temp;
        if(this.db64("AAAAAAEAAQAAAAAAAA==",inst)) temp = src % temp;
        if(this.db64("EAQBAIAAgAAAAAAAAA==",inst)) temp = src & temp;
        if(this.db64("CAIAgEAAQAAAAAAAAA==",inst)) temp = src | temp;
        if(this.db64("BAEAQCAAIAAAAAAAAA==",inst)) temp = src ^ temp;
        if(this.db64("AAAAAAAAAAAAAAAgAA==",inst)) {temp = src&0x80? src|0xFF00 : src;}
        if(this.db64("AAAAAAAAAAAAAABAAA==",inst)) temp = !temp;
        if(this.db64("AAAAAACAAIAAAAAAAA==",inst)) temp = this.shr(src,temp);
        if(this.db64("AAAAAAAQABAAAAAAAA==",inst)) temp = this.ror(src,temp);
        if(this.db64("AAAAAABAAEAAAAAAAA==",inst)) temp = this.shl(src,temp);
        if(this.db64("AAAAAAAgACAAAAAAAA==",inst)) temp = this.rol(src,temp);
        if(this.db64("AAAAAAAAAAAAAAQACA==",inst)) ++temp;
        if(this.db64("AAAAAAAAAAAAAAIABA==",inst)) --temp;
        if(this.db64("AAAAB//4AAAAAAAAAA==",inst)) temp += this.get_reg(r2);
        if(this.db64("AAAAAAAAAAAAAAAIEA==",inst)) this.pushB(temp);
        if(this.db64("AAAAAAAAAAAAAAAEIA==",inst)) this.pushW(temp);
        if(this.db64("ft+3+/8L/wgAAAZAAA==",inst)) {this.updateFlags(temp)}
        if(this.db64("fN832+/77/gAAAZAAA==",inst)) temp &= 0xFFFF;
        if(this.db64("fP8/3+//7/gAAAZzAA==",inst)) this.set_reg(r1, temp);
        if(this.db64("AABAAAAAAAAAAAAADA==",inst)) this.set_memB(addr, temp);
        if(this.db64("AQAAAAAAAAAAAAAAAA==",inst)) this.set_memW(addr, temp);
        if(this.db64("AAAAAAAAAAAYGAAAAA==",inst)) stat = this.get_flag(2);
        if(this.db64("AAAAAAAAAAYGAAAAAA==",inst)) stat = this.get_flag(1);
        if(this.db64("AAAAAAAAAAGBgAAAAA==",inst)) stat = this.get_flag(0);
        if(this.db64("AAAAAAAAAABgQAAAAA==",inst)) stat = this.get_flag(0) || this.get_flag(1);
        if(this.db64("AAAAAAAAAAKqiAAAAA==",inst)) stat = !stat;
        if(this.db64("AAAAAAAAAAf4AAAAAA==",inst)) this.condJump(stat,temp);
        if(this.db64("AAAAAAAAAAAH2AAAAA==",inst)) this.condJumpRel(stat,temp);
        if(this.db64("AAAAAAAAAAAAAACAQA==",inst)) this.pushW(this.regs[14]+3);
        if(this.db64("AAAAAAAAAAAABAGAwA==",inst)) {this.regs[14] = temp; return;}
        if(this.db64("AAAAAAAAAAAAAfgAAA==",inst)) flg = 0;
        if(this.db64("AAAAAAAAAAAAADgAAA==",inst)) flg = !flg;
        if(this.db64("AAAAAAAAAAAAASAAAA==",inst)) this.set_flag(2,flg);
        if(this.db64("AAAAAAAAAAAAAJAAAA==",inst)) this.set_flag(1,flg);
        if(this.db64("AAAAAAAAAAAAAEgAAA==",inst)) this.set_flag(0,flg);
        if(this.db64("AAAAAAAAAAAAAgAAAA==",inst)) this.syscall();
        if(this.db64("f/////////gAB////g==",inst)) this.regs[14]++;
        if(this.db64("f/////////gAAAf//g==",inst)) this.regs[14]++;
        if(this.db64("f//////4AAAAAAAQ/g==",inst)) this.regs[14]++;
        if(this.db64("f//////4AAAAAAAQDg==",inst)) this.regs[14]++;
        if(inst == 0x00) this.set_flag(3,1);
    }

    this.set_memB = (ad, val) => { this.mem[ad] = val}
    this.set_memW = (ad, val) => {
        this.mem[ad] = (val&0xFF00) >> 8;
        this.mem[ad + 1] = val & 0x00FF;
    }
    
    this.get_memB = (ad) => {
        return this.mem[ad]
    }
    this.get_memW = (ad) => {
        return this.mem[ad] << 8 | this.mem[ad + 1]
    }
    this.get_memBX = (ad) => {
        return this.mem[ad]&0x80 ? this.mem[ad] | 0xFF00 : this.mem[ad]
    }

    this.set_reg = (id, val) => {this.regs[id] = val}
    this.get_reg = (id) => {return this.regs[id]}

    this.get_flag = (id)  => { return (this.regs[15] & (1 << id)) != 0; }
    this.set_flag = (id, val) => {
        if(val) this.regs[15] |= (1 << id);
        else this.regs[15] &= ~(1 << id);
    }

    this.pushB = (val) => { this.mem[this.regs[13]--] = val}
    this.pushW = (val) => {
        this.mem[this.regs[13]--] = val & 0x00FF
        this.mem[this.regs[13]--] = (val&0xFF00) >> 8
    }
    this.popB = () => {
        return this.mem[++this.regs[13]]
    }
    this.popW = () => {
        return this.mem[++this.regs[13]] << 8 | this.mem[++this.regs[13]]
    }

    this.updateFlags = (val) =>{
        this.set_flag(2, val > 0xFFFF);
        this.set_flag(1, val == 0);
        this.set_flag(0, val < 0);
    }

    this.condJumpRel = (stat, addr) => {
        if (stat) this.regs[14] += addr;
        else this.regs[14] += 3;
    }

    this.condJump = (stat, addr) => {
        if (stat) this.regs[14] = addr;
        else this.regs[14] += 3;
    }

    this.shr = (r1, n) => {return (r1 >> n)}
    this.ror = (r1, n) => {return (r1 >> n) | (r1 << (16 - n))}
    this.shl = (r1, n) => {return (r1 << n)}
    this.rol = (r1, n) => {return (r1 << n) | (r1 >> (16 - n))}

    this.syscall = () =>{
        cmd = this.get_reg(11)
        if(cmd==19) terminal(String.fromCharCode(this.get_reg(10)))
    }

    this.step = () => {
        if(!this.get_flag(3))
            this.execute(this.get_memB(this.regs[14]),this.get_memB(this.regs[14]+1),this.get_memB(this.regs[14]+2),this.get_memB(this.regs[14]+3));
        this.regs[0] = 0;
    }

    this.loadHex = (hex) => {
        for (var i = 0; i < hex.length; i+=2) {
            this.mem[Math.floor(i/2)+256] = parseInt(hex.substr(i,2),16)
        }
    }

}