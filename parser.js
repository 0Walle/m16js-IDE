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
        if(match = /(r[a-fs\d]|a[0-2]|sp|fp|ip)\b/.exec(ops)){
            reg = regs_dict[match[1]]
            ops = ops.substr(match.index+match[0].length)
            ops = ops.trim()
            if(ops[0]=='+'){
                d = parseLiteral(ops = ops.substr(1).trim())
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
            //[parseInt(match[1], 16),]
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
    }else if(match = /(r[a-fs\d]|a[0-2]|sp|fp|ip)\b/.exec(ops)){//reg
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
    }else if(match = /^\%([01]+)\b/.exec(ops)){
        return [new Operand(1,'',parseInt(match[1],2),0),match[0].length]
    }else if(match = /^\'(\\?.)\'/.exec(ops)){
        match[1] = match[1].replace('\\n','\n')
        match[1] = match[1].replace('\\b','\b')
        match[1] = match[1].replace('\\t','\t')
        match[1] = match[1].replace('\\\\','\\')
        match[1] = match[1].replace('\\\'','\'')
        return [new Operand(1,'',match[1].charCodeAt(0),0),match[0].length]
        //console.log(match[1]);
        //return [Operand(1,'',parseInt(match[1],2),0),match[0].length]
    }else if(match = /^(\d+)\b/.exec(ops)){
        return [new Operand(1,'',parseInt(match[1],10),0),match[0].length]
    }else if(match = /^([a-zA-Z_][a-zA-Z0-9_]*)\b/.exec(ops)){
        return [new Operand(1,match[1],0,0),match[0].length]
    }else{
        Error("Invalid Literal " + ops.substr(0,ops.indexOf(",")!=-1 ? ops.indexOf(","): undefined).trim())
        //return "ERROR"
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

/*function parseInteger(ops) {
    match = /^([+-]?\d+)\b/i.exec(ops)
    if(match!=null){
        return [(parseInt(match[1]) >>> 0)%256,match.index+match[0].length]
    }
    Error('Invalid Integer')
}

function parseHex(ops) {
    match = /^#([a-f\d]{2})\b/i.exec(ops)
    if(match!=null){
        return [parseInt(match[1], 16),match.index+match[0].length]
    }
    Error('Invalid Hexadecimal')
}

function parseString(ops) {
    match = /^'([^\']*)'/.exec(ops)
    if(match!=null){
        return [match[1],match.index+match[0].length]
    }
    Error('Invalid String')
}

function parseAddress(ops) {
    match = /^\$([a-f\d]{1,4})\b/i.exec(ops)
    if(match!=null){
        return [parseInt(match[1], 16),match.index+match[0].length]
    }
    Error('Invalid Address')
}

function parseReg(ops) {
    match = /^r([012345678])\b/i.exec(ops)
    if(match!=null){
        return [parseInt(match[1], 16),match.index+match[0].length]
    }
    Error('Invalid Register')
}

function parseRegAdd(ops) {
    match = /^\[(r[012345678]|sp)([-+]\d+)?\]/i.exec(ops)
    if(match!=null){
        if(match[1]=='sp'){
            return [15,match.index+match[0].length,(parseInt(match[2]) >>> 0)%256]
        }
        return [parseInt(match[1].substr(1), 16),match.index+match[0].length,(parseInt(match[2]) >>> 0)%256]
    }
    Error('Invalid OffsetRegister')
}

function parseInd(ops) {
    let match = /^\((.*)\),\s*(r[a-f\d]|sp)/i.exec(ops)
    if(match!=null){
        console.log(match[2].substr(1))
        if(match[1][0]=='$'){
            val = parseAddress(match[1])[0]
            form = 'int'
        }else{
            val = parseLabel(match[1])[0]
            form = 'const'
        }
        if(match[2]=='sp'){reg = 15
        }else{reg = parseInt(match[2].substr(1),16)}
        return [val,match.index+match[0].length,reg, form]
    }
    Error('Invalid Indirect')
}

function parseConstant(ops) {
    match = /^\*\*?[a-z_\d]+\b/i.exec(ops)
    if(match!=null){
        if (match[0][1]=='*'){
            return [match[0].substr(1),match.index+match[0].length,'mem']
        }else{
            return [match[0],match.index+match[0].length,'imm']
        }
        
    }
    Error('Invalid Constant')
}

function parseLabel(ops) {
    match = /^[a-z_\d]+\b/i.exec(ops)
    if(match!=null){
        return [match[0],match.index+match[0].length]
    }
    Error('Invalid Label')
}

function parseData(ops) {
    data = []
    for (var i = 0; i < ops.length; i++) {
        if(isNaN(ops[i].value) || ops[i].form=='string'){
            ints = []
            for (var j = 0; j < ops[i].value.length; j++) {
                ints.push(ops[i].value.charCodeAt(j))
            }
            data = data.concat(ints)
        }else{
            data.push(ops[i].value)
        }
    }
    return data
}*/

/*console.log(parseOps("special, ',', r2"))
console.log(parseOps("$05 , #02"))
console.log(parseOps("$200, 90, sp"))
console.log(parseOps("r1, *out"))
console.log(parseOps("loop"))*/