function Assembler() {
    
    this.line = 0

    this.labels = {}

    this.opcodes_type = {
        ldw: 2, addw: 2, subw: 2, andw: 2, orw: 2, xorw: 2, cmpw: 2, cpsw: 2, adcw: 2, sbcw: 2,
        strw: 12,
        ldb: 2, addb: 2, subb: 2, andb: 2, orb: 2, xorb: 2, cmpb: 2, cpsb:2, adcb: 2, sbcb: 2,
        strb: 12,
        ldbx: 2, addbx: 2, subbx: 2, andbx: 2, orbx: 2, xorbx: 2, cmpbx: 2, adcbx: 2, sbcbx: 2, cpsbx: 2,
        ld: 11, add: 11, sub: 11, and: 11, or: 11, xor: 11, cmp: 11, adc: 11, cps: 11,
        mul: 11, div: 11, mod: 11, shr: 11, shl: 11, rol: 11, ror: 11, sbc: 11,
        jeq: 5,jne: 5,jlt: 5,jge: 5,jle: 5,jgt: 5,jcs: 5,jcc: 5,beq: 5,bne: 5,blt: 5,bge: 5,ble: 5,bgt: 5,bcs: 5,bcc: 5,
        jmp:10, jsr:10, pshb:10, pshw:10,
        rts: 6, sys: 6, clc: 6, clz: 6, cln: 6, sec: 6, sez: 6, sen: 6, brk: 6, nop: 6,
        inc: 7, dec: 7, not: 7, exs: 7,
        popb: 7, popw: 7,
        incb: 8, decb: 8,
        str: 9,
        ".data": 100,".label": 100,".zeros": 100,".datasection": 100,".textsection": 100,
    }

    this.byteOp = (op1,op2) => {
        if(op1.type!='reg' || op2.type!='reg') Error('Invalid Register Operand')
        return new Operand('pair',op1.value*16+op2.value)
    }
        
    this.W2B = (w) => {
        return [(w & 0xff00) >> 8,w & 0x00ff]
    }

    this.parseLine = (line) => line.match(/^[\t ]*(?:([a-z_\d]*)[:])?(?:\s*(.?[a-z]+)(?:[\t ]+(.*))?)?/i)

    this.assemble = (code) =>{
        code = code.split('\n')

        this.labels = {}

        sects = {}
        mem = []
        asmpc = 0
        locpos = 256
        this.line = 0

        function store(size,op,...data) {
            mem.push(Assembler_opcodes[op])
            mem.push(...data)
            asmpc += size
        }

        for (var i = 0; i < code.length; i++) {
            if(!code[i]) continue
            this.line = i

            inst = code[i].match(/^[\t ]*(?:([a-z_\d]*)[:])?(?:\s*(.?[a-z]+)(?:[\t ]+(.*))?)?/i)
            
            if(inst[1]){this.labels[inst[1]] = asmpc+locpos}


            if(inst[3]){
                ops = parseOps(inst[3])
            }else{ops=[]}

            if(inst[2]!=undefined){
                if(inst[2][0]==';') continue
                
                mem_breakpoints[asmpc+locpos] = i;

                let type = this.opcodes_type[inst[2]]

                if(type==2){ // rrW
                  if(ops[0].type==2 && ops[1].type==4){
                    store(4,inst[2],((ops[0].reg<<4)|ops[1].reg), ops[1])
                  }else{Error("Invalid operands for " + inst[2])}
                  if(ops.length>2) Warn("Too many operands for "+inst[2])
                }else if(type==5){ //W
                  if(ops[0].type&9){
                    store(3,inst[2],ops[0])
                  }else{Error("Invalid operands for " + inst[2])}
                  if(ops.length>1) Warn("Too many operands for "+inst[2])
                }else if(type==6){ // -
                    store(1,inst[2])
                    if(ops.length>0) Warn("Too many operands for "+inst[2])
                }else if(type==7){
                  if(ops[0].type==2){ //R
                    store(2,inst[2],ops[0].reg<<4)
                  }else{Error("Invalid operands for " + inst[2])}
                  if(ops.length>1) Warn("Too many operands for "+inst[2])
                }else if(type==8){
                  if(ops[0].type==4){
                    store(4,inst[2],ops[0].reg,ops[0])
                  }else{Error("Invalid operands for " + inst[2])}
                  if(ops.length>1) Warn("Too many operands for "+inst[2])
                }else if(type==9){
                  if(ops[0].type==4 && ops[0].reg==0 && ops[1].type&9){
                    store(4,inst[2],ops[0],ops[1].num)
                  }else{Error("Invalid operands for " + inst[2])}
                  if(ops.length>2) Warn("Too many operands for "+inst[2])
                }else if(type==10){
                  if(ops[0].type==2){
                    store(2,inst[2]+'_r',ops[0].reg<<4)
                  }else if(ops[0].type&9){
                    store(3,inst[2]+'_w',ops[0])
                  }else{Error("Invalid operands for " + inst[2])}
                  if(ops.length>1) Warn("Too many operands for "+inst[2])
                }else if(type==11){
                  if(ops[0].type==2 && ops[1].type==2){
                    store(2,inst[2]+'_r',((ops[0].reg<<4)|ops[1].reg))
                  }else if(ops[0].type==2 && ops[1].type&9){
                    let altreg = ops.length>2 ? ops[2].reg : 0;
                    store(4,inst[2]+'_w',((ops[0].reg<<4)|altreg),ops[1])
                  }else{Error("Invalid operands for " + inst[2])}
                  if(ops.length>2) Warn("Too many operands for "+inst[2])
                }else if(type==12){ 
                  if(ops[1].type==2 && ops[0].type==4){
                    store(4,inst[2],((ops[1].reg<<4)|ops[0].reg),ops[0])
                  }else{Error("Invalid operands for " + inst[2])}
                  if(ops.length>2) Warn("Too many operands for "+inst[2])
                }else if(type==100){ 
                    if(inst[2]=='.data'){
                        for (var j = 0; j < ops.length; j++) {
                          //console.log(ops[j])
                          if(!ops[j].name.id){
                            mem.push(ops[j].num&0xFF)
                          }else{
                            mem.push(ops[j])
                            asmpc += 1
                          }
                        }
                        asmpc += ops.length
                    }else if(inst[2]=='.datasection'){
                      sects[locpos] = mem
                      mem = []
                      locpos = 0x1000
                      asmpc = 0
                    }else if(inst[2]=='.textsection'){
                      sects[locpos] = mem
                      mem = []
                      locpos = 0x100
                      asmpc = 0
                    }else if(inst[2]=='.zeros'){
                      if(!ops[0].type&9) Error("Use a number in .zeros directive")
                      for (var j = 0; j < ops[0].num; j++) {
                          mem.push(0)
                      }
                      asmpc += ops[0].num
                  }
                }
            }
        }

        sects[locpos] = mem

        rmcode = {}
        for (const section in sects) {
        if (sects.hasOwnProperty(section)) {
          mem = sects[section];
          
          let mcode = ''
          for (var i = 0; i < mem.length; i++) {
            if(isNaN(mem[i])){
              let lbl = 0;
                let total = 0;
                if(mem[i].name.id){
                    lbl = this.labels[mem[i].name.id]
                    if(lbl==undefined) Error("Undefined label " + mem[i].name.id)
                  }
                if(mem[i].name.neg){lbl = -lbl}
                for (var j = 0; j < mem[i].exprs.length; j++) {
                    let loc;
                    if(!mem[i].exprs[j].id) continue
                    loc = this.labels[mem[i].exprs[j].id]
                    if(loc==undefined) Error("Undefined label " + mem[i].exprs[j].id)
                    if(mem[i].exprs[j].neg) loc = -loc
                    total += loc
                  }
                let word = lbl + mem[i].num + total;
                mcode += (word&0xFFFF).toString(16).padStart(4,0)
            }else{
                mcode += (mem[i]&0xFF).toString(16).padStart(2,0)
            }
          }

          rmcode[section] = mcode
        }}

        return rmcode
    }
}

Assembler_opcodes = {
        ldw:   103 ,
        addw:  1  ,
        subw:  2  ,
        andw:  3  ,
        orw:   4  ,
        xorw:  5  ,
        cmpw:  6  ,
        strw:  7  ,
        adcw:  8  ,
        sbcw:  9  ,
        ldb:   10 ,
        addb:  11 ,
        subb:  12 ,
        andb:  13 ,
        orb:   14 ,
        xorb:  15 ,
        cmpb:  16 ,
        strb:  17 ,
        adcb:  18 ,
        sbcb:  19 ,
        ldbx:  20 ,
        addbx: 21 ,
        subbx: 22 ,
        andbx: 23 ,
        orbx:  24 ,
        xorbx: 25 ,
        cmpbx: 26 ,
        adcbx: 27 ,
        sbcbx: 28 ,
        ld_w:  29 ,
        add_w: 30 ,
        sub_w: 31 ,
        and_w: 32 ,
        or_w:  33 ,
        xor_w: 34 ,
        cmp_w: 35 ,
        adc_w: 36 ,
        mul_w: 37 ,
        div_w: 38 ,
        mod_w: 39 ,
        shr_w: 40 ,
        shl_w: 41 ,
        rol_w: 42 ,
        ror_w: 43 ,
        sbc_w: 44 ,
        ld_r:  45 ,
        add_r: 46 ,
        sub_r: 47 ,
        and_r: 48 ,
        or_r:  49 ,
        xor_r: 50 ,
        cmp_r: 51 ,
        adc_r: 52 ,
        mul_r: 53 ,
        div_r: 54 ,
        mod_r: 55 ,
        shr_r: 56 ,
        shl_r: 57 ,
        rol_r: 58 ,
        ror_r: 59 ,
        sbc_r: 60 ,
        jeq:   61 ,
        jne:   62 ,
        jlt:   63 ,
        jge:   64 ,
        jle:   65 ,
        jgt:   66 ,
        jcs:   67 ,
        jcc:   68 ,
        beq:   69 ,
        bne:   70 ,
        blt:   71 ,
        bge:   72 ,
        ble:   73 ,
        bgt:   74 ,
        bcs:   75 ,
        bcc:   76 ,
        rts:   77 ,
        sys:   78 ,
        clc:   79 ,
        clz:   80 ,
        cln:   81 ,
        sec:   82 ,
        sez:   83 ,
        sen:   84 ,
        inc:   85 ,
        dec:   86 ,
        jmp_r: 87 ,
        jsr_r: 88 ,
        not:   89 ,
        exs:   90 ,
        brk:    0 ,
        nop:   91 ,
        pshb_r:92 ,
        pshw_r:93 ,
        popb:  94 ,
        popw:  95 ,
        jmp_w: 96 ,
        jsr_w: 97 ,
        pshw:  98 ,
        pshb:  99 ,
        incb:  100,
        decb:  101,
        str:   102,
        cpsw:  104,
        cpsb:  105,
        cpsbx: 106,
        cps_w: 107,
        cps_r: 108,
    }