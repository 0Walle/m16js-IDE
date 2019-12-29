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
        inst+=2
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
        //       BASAOXCSASLASAOXCSASLASAOXCASLASAOXCAMDMSSRRSLASAOXCAMDMSSRRSJJJJJJJJBBBBBBBBRSCCCSSSIDJJNENPPPPJJPPIDSLCCCCC
        //       RDUNROMTDBDDUNROMTDBDDUNROMDBDDUNROMDUIOHHOOBDDUNROMDUIOHHOOBENLGLGCCENLGLGCCTYLLLEEENEMSOXOSSOOMSSSNETDPPPPP
        //       KDBDWRPRCCBDBDBRPRCCBDBDBRPCC DBD RPCLVDRLLRC DBD RPCLVDRLLRCQETEETSCQETEETSCSSCZNCZNCCPRTSPHHPPPRHHCCRWSSSSS
        //        WWW WWWWW BBB BBBBBXBBBXBBBB                                                        BW     BWWB    BB  WBB  
        if(this.db64("H/f9/v/+//4AAAH7AD4=",inst)) src = temp = this.get_reg(r1);
        if(this.db64("AAAAAAAAAAAAAAAAAIA=",inst)) this.set_memB((op1<<8|op2), op3);
        if(this.db64("H////gAAAAAAAAAAA3g=",inst)) addr = (op2<<8|op3)+this.get_reg(r2);
        if(this.db64("H7AAAAAAAAAAAAAAAGA=",inst)) temp = this.get_memW(addr&0xffff);
        if(this.db64("AA/sAAAAAAAAAAAAAxA=",inst)) temp = this.get_memB(addr&0xffff);
        if(this.db64("AAAD/gAAAAAAAAAAAAg=",inst)) temp = this.get_memBX(addr&0xffff);
        if(this.db64("AAAAAf/+AAAAAAAAAAQ=",inst)) temp = (op2<<8|op3);
        if(this.db64("AAAAAAAB//4AAAAAAAI=",inst)) temp = this.get_reg(r2); 
        if(this.db64("AAAAAAAAAAH//gAAPAA=",inst)) temp = (op1<<8|op2);
        if(this.db64("AAAAAAAAAAAAAAAAgAA=",inst)) temp = this.popB();
        if(this.db64("AAAAAAAAAAAAAQAAQAA=",inst)) temp = this.popW();
        if(this.db64("ECQJBIIAggAAAAAAAAA=",inst)) temp = src + temp;
        if(this.db64("CJIkikQCRAIAAAAAAAA=",inst)) temp = src - temp;
        if(this.db64("ACAIBAIAAgAAAAAAAAA=",inst)) temp += this.get_flag(2);
        if(this.db64("ABAEAgACAAIAAAAAAAA=",inst)) temp -= !this.get_flag(2);
        if(this.db64("AAAAAAEAAQAAAAAAAAA=",inst)) temp = src * temp;
        if(this.db64("AAAAAACAAIAAAAAAAAA=",inst)) temp = src / temp;
        if(this.db64("AAAAAABAAEAAAAAAAAA=",inst)) temp = src % temp;
        if(this.db64("BAEAQCAAIAAAAAAAAAA=",inst)) temp = src & temp;
        if(this.db64("AgCAIBAAEAAAAAAAAAA=",inst)) temp = src | temp;
        if(this.db64("AQBAEAgACAAAAAAAAAA=",inst)) temp = src ^ temp;
        if(this.db64("AAAAAAAAAAAAAAAIAAA=",inst)) {temp = src&0x80? src|0xFF00 : src;}
        if(this.db64("AAAAAAAAAAAAAAAQAAA=",inst)) temp = !temp;
        if(this.db64("AAAAAAAgACAAAAAAAAA=",inst)) temp = this.shr(src,temp);
        if(this.db64("AAAAAAAEAAQAAAAAAAA=",inst)) temp = this.ror(src,temp);
        if(this.db64("AAAAAAAQABAAAAAAAAA=",inst)) temp = this.shl(src,temp);
        if(this.db64("AAAAAAAIAAgAAAAAAAA=",inst)) temp = this.rol(src,temp);
        if(this.db64("AAAAAAAAAAAAAAEAAgA=",inst)) ++temp;
        if(this.db64("AAAAAAAAAAAAAACAAQA=",inst)) --temp;
        if(this.db64("AAAAAf/+AAAAAAAAAAQ=",inst)) temp += this.get_reg(r2);
        if(this.db64("AAAAAAAAAAAAAAACBAA=",inst)) this.pushB(temp);
        if(this.db64("AAAAAAAAAAAAAAABCAA=",inst)) this.pushW(temp);
        if(this.db64("H7ft/v/C/8IAAAGQAAA=",inst)) {this.updateFlags(temp)}
        if(this.db64("AAAAAAAAAAAAAAAAAD4=",inst)) this.updateSignFlags(src,temp);
        if(this.db64("HzfN9vv++/4AAAGQAAA=",inst)) temp &= 0xFFFF;
        if(this.db64("Hz/P9/v/+/4AAAGYwEA=",inst)) this.set_reg(r1, temp);
        if(this.db64("AAAQAAAAAAAAAAAAAwA=",inst)) this.set_memB(addr&0xffff, temp);
        if(this.db64("AEAAAAAAAAAAAAAAAAA=",inst)) this.set_memW(addr&0xffff, temp);
        if(this.db64("AAAAAAAAAAAGBgAAAAA=",inst)) stat = this.get_flag(2); //C
        if(this.db64("AAAAAAAAAAGBgAAAAAA=",inst)) stat = this.get_flag(1); //Z
        if(this.db64("AAAAAAAAAABgYAAAAAA=",inst)) stat = this.get_flag(0); //N
        if(this.db64("AAAAAAAAAAAYGAAAAAA=",inst)) stat = this.get_flag(0) || this.get_flag(1);
        if(this.db64("AAAAAAAAAACqqgAAAAA=",inst)) stat = !stat;
        if(this.db64("AAAAAAAAAAH+AAAAAAA=",inst)) this.condJump(stat,temp);
        if(this.db64("AAAAAAAAAAAB/gAAAAA=",inst)) this.condJumpRel(stat,temp);
        if(this.db64("AAAAAAAAAAAAAAAgEAA=",inst)) this.pushW(this.regs[14]+3);
        if(this.db64("AAAAAAAAAAAAAQBgMAA=",inst)) {this.regs[14] = temp; return;}
        if(this.db64("AAAAAAAAAAAAAH4AAAA=",inst)) flg = 0;
        if(this.db64("AAAAAAAAAAAAAA4AAAA=",inst)) flg = !flg;
        if(this.db64("AAAAAAAAAAAAAEgAAAA=",inst)) this.set_flag(2,flg);
        if(this.db64("AAAAAAAAAAAAACQAAAA=",inst)) this.set_flag(1,flg);
        if(this.db64("AAAAAAAAAAAAABIAAAA=",inst)) this.set_flag(0,flg);
        if(this.db64("AAAAAAAAAAAAAIAAAAA=",inst)) this.syscall();
        if(this.db64("H/////////4AAP+fz/4=",inst)) this.regs[14]++;
        if(this.db64("H/////////4AAAGbz/4=",inst)) this.regs[14]++;
        if(this.db64("H//////+AAAAAAAAD/w=",inst)) this.regs[14]++;
        if(this.db64("H//////+AAAAAAAAA/w=",inst)) this.regs[14]++;
        if(inst == 0x00) this.set_flag(3,1);
    }

    this.set_memB = (ad, val) => { this.mem[ad] = val}
    this.set_memW = (ad, val) => {
        this.mem[ad] = (val&0xFF00) >> 8;
        this.mem[ad+1] = val & 0x00FF;
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

    this.updateSignFlags = (src,temp) =>{
        val = (src>0x7FFF? 0x10000-src: src) - (temp>0x7FFF? 0x10000-temp: temp)
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
        if(cmd==0x11) terminal(this.get_reg(10)&0xFFFF)
        if(cmd==0x13) terminal(String.fromCharCode(this.get_reg(10)))
        if(cmd==0x14){while(this.mem[this.regs[10]]!=0){terminal(String.fromCharCode(this.mem[this.regs[10]++]));}}
        if(cmd==0x15){
            if(this.get_flag(8)){
                --this.regs[14]
            }else{
                if(term_stdin){
                    for (var j = 0; j < term_stdin.length; j++) {
                        this.mem[this.regs[10]+j] = term_stdin.charCodeAt(j)&0xFF
                    }
                    this.mem[this.regs[10]+j] = 0
                    this.regs[10] += term_stdin.length
                    closeTermScan()
                }else{
                    termScan()
                    this.set_flag(8,1)
                    --this.regs[14]
                }
            }
        }
        if(cmd==0x21) this.set_reg(10,Math.floor(Math.random()*0xFFFF))
        if(cmd==0x32){
            let size = this.regs[10];
            for (var i = 0; i < heap.length; i++) {
                let block = heap[i]
                if(block[0]==0 && block[1]>=size){
                    let temp = heap.slice(0,i)
                    temp.push([0,block[1]-size,block[2]+size,0])
                    heap = temp.concat(heap.slice(i))
                    block[1] = size;
                    block[0] = 1;
                    this.set_reg(10,block[2])
                    return
                }
            }
            this.set_reg(10,0)
        }
        if(cmd==0x50) terminal(this.mem.slice(this.regs[10],this.regs[9]).toString()+'\n')
        if(cmd==0x70){
            let resolution = 64;
            let pxsize = 128/resolution;
            let color = this.regs[9];
            let pixel = this.regs[10];
            let r = ((color&0b1111100000000000)>>11)*8
            let g = ((color&0b0000011111100000)>>5)*4
            let b = (color&0b0000000000011111)*8
            monitor.fillStyle = "rgba("+r+","+g+","+b+",1)";
            monitor.fillRect((pixel%resolution)*pxsize,(Math.floor(pixel/resolution)%resolution)*pxsize,pxsize,pxsize);
        }
    }

    this.step = () => {
        if(!this.get_flag(3))
            this.execute(this.get_memB(this.regs[14]),this.get_memB(this.regs[14]+1),this.get_memB(this.regs[14]+2),this.get_memB(this.regs[14]+3));
        this.regs[0] = 0;
    }

    this.loadHex = (hex,start=256) => {
        for (var i = 0; i < hex.length; i+=2) {
            this.mem[Math.floor(i/2)+start] = parseInt(hex.substr(i,2),16)
        }
    }

    this.loadSections = (sects) => {
        for (start in sects) {
            hex = sects[start];
            start = parseInt(start)
            for (var j = 0; j < hex.length; j+=2) {
                this.mem[Math.floor(j/2)+start] = parseInt(hex.substr(j,2),16)
            }
        }
    }
}