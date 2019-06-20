/* Example definition of a simple mode that understands a subset of
 * JavaScript:
 */

CodeMirror.defineSimpleMode("mins", {
  start: [
    {regex: /"(?:[^\\]|\\.)*?"/, token: "string"},
    {regex: /'(?:[^\\]|\\.)'/, token: "string"},
    {regex: /\b(ldw|addw|subw|andw|orw|xorw|cmpw|strw|adcw|sbcw|ldb|addb|subb|andb|orb|xorb|cmpb|strb|adcb|sbcb|ldbx|addbx|subbx|andbx|orbx|xorbx|cmpbx|adcbx|sbcbx|ld|add|sub|and|or|xor|cmp|adc|mul|div|mod|shr|shl|rol|ror|sbc|jeq|jne|jlt|jge|jle|jgt|jcs|jcc|beq|bne|blt|bge|ble|bgt|bcs|bcc|rts|sys|clc|clz|cln|sec|sez|sen|inc|dec|jmp|jsr|not|exs|brk|pshb|pshw|popb|popw|incb|decb|str|cpsw|cpsb|cpsbx|cps)\b/i, token: "keyword"},
    {regex: /\.(data|label|zeros|datasection|textsection)\b/, token: "keyword"},
    {regex: /\b(r[a-fs\d]|a[0-2]|sp|fp|ip)\b/, token: "variable-2"},
    {regex: /(\$[a-f\d]+)\b/i, token: "number"},
    {regex: /\b([0-9]+)\b/, token: "number"},
    {regex: /(%[01]+)\b/, token: "number"},
    {regex: /;.*/, token: "comment"},
    {regex: /:/, indent: true},
    {regex: /[a-zA-Z$][\w$]*/, token: null},
  ],
});
