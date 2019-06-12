    jmp start

string: .data "hello world\\n"

start:
    ld a0, $13
    ld r1, 0
loop:
    ldb a1, [r1+string]
    sys
    inc r1
    cmp a1, 0
    jne loop