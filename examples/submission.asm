    jmp start
start:
    ld r2, 12   ; capacidade
    ld r1, 55   ; alunos
    ld r4, 0    ; viagens
loop:
    ld r3, r1           ; t = alunos
    inc r3              ; t++
    sub r3, r2          ; t -= capacidade
    ld r1, r3           ; alunos = t
    inc r4              ; viagens++
    cmp r1, %10000000   ; { if alunos > 0 jump to loop
    jlt test2
    jmp end
test2:
    cmp r1, 0
    jeq end
    jmp loop            ; }
end:
    ld a0, 17           ; { print(Alunos + '\n')
    ld a1, r4
    sys
    ld a0, 19
    ld a1, '\n'
    sys                 ; }