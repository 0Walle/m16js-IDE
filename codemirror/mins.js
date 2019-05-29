/* Example definition of a simple mode that understands a subset of
 * JavaScript:
 */

CodeMirror.defineSimpleMode("mins", {
  // The start state contains the rules that are intially used
  start: [
    // The regex matches the token, the token property contains the type
    {regex: /".*"/, token: "string"},
    {regex: /'\\?.'/, token: "string"},
    // You can match multiple tokens at once. Note that the captured
    // groups must span the whole string in this case
//    {regex: /(function)(\s+)([a-z$][\w$]*)/,
//     token: ["keyword", null, "variable-2"]},
    // Rules are matched in the order in which they appear, so there is
    // no ambiguity between this one and the one above
    {regex: /\b(ldw|addw|subw|andw|orw|xorw|cmpw|strw|adcw|sbcw|ldb|addb|subb|andb|orb|xorb|cmpb|strb|adcb|sbcb|ldbx|addbx|subbx|andbx|orbx|xorbx|cmpbx|adcbx|sbcbx|ld|add|sub|and|or|xor|cmp|adc|mul|div|mod|shr|shl|rol|ror|sbc|jeq|jne|jlt|jge|jle|jgt|jcs|jcc|beq|bne|blt|bge|ble|bgt|bcs|bcc|rts|sys|clc|clz|cln|sec|sez|sen|inc|dec|jmp|jsr|not|exs|brk|pshb|pshw|popb|popw|incb|decb|str)\b/i, token: "keyword"},
    {regex: /\.(data|label|zeros)\b/, token: "keyword"},
//    {regex: /true|false|null|undefined/, token: "atom"},
    {regex: /\b(r[a-fs\d]|a[0-2]|sp|fp|ip)\b/, token: "variable-2"},
    {regex: /(\$[a-f\d]+)\b/i, token: "number"},
    {regex: /\b([0-9]+)\b/, token: "number"},
    {regex: /(%[01]+)\b/, token: "number"},
//    {regex: /\/\/.*/, token: "comment"},
//    {regex: /\/(?:[^\\]|\\.)*?\//, token: "variable-3"},
    // A next property will cause the mode to move to a different state
    {regex: /;.*/, token: "comment"},
//    {regex: /[-+\/*=<>!]+/, token: "operator"},
    // indent and dedent properties guide autoindentation
//    {regex: /[\{\[\(]/, indent: true},
//    {regex: /[\}\]\)]/, dedent: true},
    {regex: /[a-z$][\w$]*/, token: null},
    // You can embed other modes with the mode property. This rule
    // causes all code between << and >> to be highlighted with the XML
    // mode.
    //{regex: /<</, token: "meta", mode: {spec: "xml", end: />>/}}
  ],
  // The multi-line comment state.
  comment: [
    //{regex: /.*?\*\//, token: "comment", next: "start"},
    //{regex: /.*/, token: "comment"}
  ],
  // The meta property contains global information about the mode. It
  // can contain properties like lineComment, which are supported by
  // all modes, and also directives like dontIndentStates, which are
  // specific to simple modes.
  meta: {
    //dontIndentStates: ["comment"],
    lineComment: ";"
  }
});
