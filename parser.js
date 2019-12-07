function Operand(type,name,num,reg) {
    this.type = type;
    this.num = num;
    this.name = {id:name, neg: false};
    this.reg = reg;
    this.exprs = [];

    this.append = (id,num) =>{
        this.type = 8
        this.num += num
        this.exprs.push(id)
    }
}

regs_dict = {
    r0: 0,r1: 1 ,r2: 2 ,r3: 3 ,r4: 4 ,r5: 5 ,r6: 6 ,r7: 7 ,r8: 8,
    r9: 9,ra: 10,rb: 11,rc: 12,rd: 13,re: 14,rf: 15,                                                      
    a2: 9,a1: 10,a0: 11,fp: 12,sp: 13,ip: 14,rs: 15,
}

function parseOps(ops){
    var result = []

    ops = ops.trim()
    if(ops[0]==',') ops = ops.substr(1)
    ops = ops.trim()
    if(!ops) return []
    if(ops[0]==';') return []


    if(ops[0]=='['){//ref: [reg], [reg+literal], [literal]
        ops = ops.substr(1).trim()
        reg = 0;
        var match;
        if(match = /^(r[a-fs\d]|a[0-2]|sp|fp|ip)\b/.exec(ops)){
            reg = regs_dict[match[1]]
            ops = ops.substr(match.index+match[0].length)
            ops = ops.trim()
            if(ops[0]=='+'){
                d = parseLiteral(ops = ops.substr(1).trim())
                ops = ops.substr(d[1]).trim()
                if(ops[0]==']'){ops = ops.substr(1)}
                result.push(new Operand(4,d[0].name.id,d[0].num,reg));
                result = result.concat(parseOps(ops))
            }else if(ops[0]=='-'){
                d = parseLiteral(ops = ops.substr(1).trim())
                d[0].num = -d[0].num
                ops = ops.substr(d[1]).trim()
                if(ops[0]==']'){ops = ops.substr(1)}
                result.push(new Operand(4,d[0].name.id,d[0].num,reg));
                result = result.concat(parseOps(ops))
            }else if(ops[0]==']'){
                result.push(new Operand(4,'',0,reg));
                result = result.concat(parseOps(ops.substr(1)))
            }else{
                Error('Expected \']\'')
            }
        }else{
            d = parseLiteral(ops)
            ops = ops.substr(d[1]).trim()
            if(ops[0]==']') ops = ops.substr(1)
            result.push(new Operand(4,d[0].name.id,d[0].num,0));
            result = result.concat(parseOps(ops))
        }
    }else if(ops[0]=='"'){//string
        let inter = []
        let it = 1;
        while(true){
            if(ops[it]=='"'){inter.push(new Operand(1,'',0,0));break}
            if(ops[it]=='\\'){
                ++it;
                let num = 0;
                switch (ops[it])
                {
                case '\\':
                  num = '\\'.charCodeAt(0);
                  break;
                case 'n':
                  num = '\n'.charCodeAt(0);
                  break;
                case 't':
                  num = '\t'.charCodeAt(0);
                  break;
                case 'b':
                  num = '\b'.charCodeAt(0);
                  break;
                case '\'':
                  num = '\''.charCodeAt(0);
                  break;
                case '0':
                  num = 0;
                  break;
                default:
                  num = ops[it].charCodeAt(0);
                  break;
                }
                inter.push(new Operand(1,'',num,0))
                ++it;
            }else{
                inter.push(new Operand(1,'',ops[it].charCodeAt(0),0))
                ++it;
            }
        }
        result = result.concat(inter)
    }else if(match = /^(r[a-fs\d]|a[0-2]|sp|fp|ip)\b/.exec(ops)){//reg
        result.push(new Operand(2,'',0,regs_dict[match[1]]));
        result = result.concat(parseOps(ops.substr(match[1].length)))
    }else {//expr
        d = parseUnexpr(ops);
        temp = d[0]
        ops = ops.substr(d[1]).trim()
        while(true){
            let neg;
            if(ops[0]=='-'){neg = true;ops = ops.substr(1).trim()
            }else if(ops[0]=='+'){neg = false;ops = ops.substr(1).trim()
            }else{break}
            d = parseUnexpr(ops);
            ops = ops.substr(d[1]).trim()
            if(neg){temp.append({id:d[0].name.id,neg:!d[0].name.neg},-d[0].num)
            }else{temp.append(d[0].name,d[0].num)}
        }
        result.push(temp);
        result = result.concat(parseOps(ops))
    }

    return result
}

function parseLiteral(ops){
    if(match = /^\$([a-fA-F0-9]+)\b/.exec(ops)){
        return [new Operand(1,'',parseInt(match[1],16),0),match[0].length]
    }else if(match = /^\$hc\(([0-9]+),([0-9]+),([0-9]+)\)/.exec(ops)){
        let r = Math.floor(parseInt(match[1])/8)<<11;
        let g = Math.floor(parseInt(match[2])/4)<<5;
        let b = Math.floor(parseInt(match[3])/8);
        return [new Operand(1,'',r|g|b,0),match[0].length]
    }else if(match = /^\%([01]+)\b/.exec(ops)){
        return [new Operand(1,'',parseInt(match[1],2),0),match[0].length]
    }else if(match = /^\'(\\?.)\'/.exec(ops)){
        match[1] = match[1].replace('\\n','\n')
        match[1] = match[1].replace('\\b','\b')
        match[1] = match[1].replace('\\t','\t')
        match[1] = match[1].replace('\\\\','\\')
        match[1] = match[1].replace('\\\'','\'')
        return [new Operand(1,'',match[1].charCodeAt(0),0),match[0].length]
    }else if(match = /^(\d+)\b/.exec(ops)){
        return [new Operand(1,'',parseInt(match[1],10),0),match[0].length]
    }else if(match = /^([a-zA-Z_][a-zA-Z0-9_]*)\b/.exec(ops)){
        return [new Operand(1,match[1],0,0),match[0].length]
    }else{
        Error("Invalid Literal " + ops.substr(0,ops.indexOf(",")!=-1 ? ops.indexOf(","): undefined).trim())
    }
}

function parseUnexpr(ops){
    let neg = false
    it = 0
    if(ops[0]=='-'){neg=true; ops=ops.substr(1).trim(); it++}
    else if(ops[0]=='+'){ops=ops.substr(1).trim(); it++}
    d = parseLiteral(ops)
    mtemp = new Operand(8,d[0].name.id,d[0].num,0)
    if(neg){
        mtemp.name.neg = !mtemp.name.neg
        mtemp.num = -mtemp.num
    }
    return [mtemp,d[1]+it]
}