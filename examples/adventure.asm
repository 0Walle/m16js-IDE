; DONT SCROLL TOO MUCH, THERE ARE SPOILERS AT THE END

ld sp, $ff
jmp start    

move_west:
    ldb r2, [loc]
    mul r2, 7
    add r2, map_data+1
    ldb r2, [r2]
    cmp r0, r2
    jeq move_block
    strb [loc], r2
    jmp gameloop
    
move_east:
    ldb r2, [loc]
    mul r2, 7
    add r2, map_data+2
    ldb r2, [r2]
    cmp r0, r2
    jeq move_block
    strb [loc], r2
    jmp gameloop
    
move_south:
    ldb r2, [loc]
    mul r2, 7
    add r2, map_data+3
    ldb r2, [r2]
    cmp r0, r2
    jeq move_block
    strb [loc], r2
    jmp gameloop
    
move_north:
    ldb r2, [loc]
    mul r2, 7
    add r2, map_data+4
    ldb r2, [r2]
    cmp r0, r2
    jeq move_block
    strb [loc], r2
    jmp gameloop
    
move_block:
    ld a0, $14
    ld a1, invalid_move_str
    sys
    jmp gameloop
  
move_quit:
    brk

getinput:
    ld a0, $15
    ld a1, input
    sys
    ld a0, $14
    ld a1, input
    sys
    ld a0, $13
    ld a1, '\n'
    sys
    ldb r1, [input]
    cmp r1, 'W'
    jeq move_west
    cmp r1, 'E'
    jeq move_east
    cmp r1, 'S'
    jeq move_south
    cmp r1, 'N'
    jeq move_north
    cmp r1, 'Q'
    jeq move_quit
    ld a0, $14
    ld a1, invalid_input
    sys
    rts

look_loc:
    ldb r2, [loc]
    mul r2, 7
    add r2, map_data+5
    ld a0, $14
    ldw a1, [r2]
    sys
    rts

start:
    ld a0, $14
    ld a1, intro
    sys
gameloop:
    jsr look_loc
    jsr getinput
    jmp gameloop
    brk

; ====================================================== !!!!! SPOILERS BELOW !!!!! ======================================================
.datasection
loc: .data 1
input: .zeros 64
intro: .data "Type N S E W to move. The direction is indicated with (), for example lake(W) means that a lake is at west.\n\n"
    
invalid_input: .data "I don't understand this command.\n\n"
invalid_move_str: .data "Can't move that way.\n\n"

map_loc0: .data "This place is wrong.\n\n"
map_loc1: .data "You is in a forest with a long dirt path(W).\n\n"
map_loc2: .data "The path ends in a cave entrance(W), it seems very dark. A small building(N) can be seen in the middle of the forest.\n\n"
map_loc3: .data "The cave is very dark, better find something to light up.\n\n"
map_loc4: .data "The building is a small brick house, inside it a sign says \"Free lantern, please give it back after use\".\nYou took the lantern.\n\n"
map_loc5: .data "You are in the end of the path again, now you can enter the cave(W) with the lantern.\n\n"
map_loc6: .data "The cave was used for mining, there is a path(S) with a minecart trail in one wall. The cave also continues going down.\n\n"
map_loc7: .data "A deep gap separates the other side of the cave. A rope connects the two sides, it looks very strong.\nA wooden box is near the gap, it looks like part of a transport mechanism.\n\n"
map_loc8: .data "The mine is very long, there are old torchs in the walls, at the end there is a weird bicycle thing.\nYou took the weird bicycle thing.\n\n"
map_loc9: .data "A deep gap separates the other side of the cave. A rope connects the two sides, it looks very strong. A wooden box is near the gap, the weird bicycle thing fits in it.\nIt can be used with the rope to get to the other side.\n\n"
map_loc10: .data "The cave end with a brick wall, there is a path to left(S) and one to right(N), \"Dont go back\" is written in the wall with coal.\n\n"
map_loc11: .data "There is a big floating arrow pointing to the wall. DONT GO BACK.\n\n"
map_loc12: .data "You died of nothing. Type Q to quit.\n\n"
map_loc13: .data "You found a treasure box(S).\n\n"
map_loc14: .data "You found a glass bottle full of nothing(N).\n\n"
map_loc15: .data "The floor breaks, you fall and someone says \"kkkkk caiu na bait\".\n\n"
map_loc16: .data "You drink the bottle and you get a winning feeling. Then nothing and everything happens in no time. Type Q to end this universe.\n\n"
map_loc17: .data "You are in 0 dimension.\n\n"
    
map_data:
        ; n  W  E  S  N  *loc
    .data 0, 0, 0, 0, 0 , map_loc0
    .data 1, 2, 0, 0, 0 , map_loc1
    .data 2, 3, 1, 0, 4 , map_loc2
    .data 3, 0, 2, 0, 0 , map_loc3
    .data 4, 5, 5, 5, 5 , map_loc4
    .data 5, 6, 0, 0, 0 , map_loc5
    .data 6, 7, 0, 8, 0 , map_loc6
    .data 7, 0, 6, 0, 0 , map_loc7
    .data 8, 0, 0, 0, 9 , map_loc8
    .data 9, 10, 0, 0, 0, map_loc9
    .data 10,0 ,11,13,14, map_loc10
    .data 11,10,12, 0, 0, map_loc11
    .data 12, 0,0 , 0, 0, map_loc12
    .data 13, 0,0 ,15,10, map_loc13
    .data 14, 0,0 ,10,16, map_loc14
    .data 15, 0,0 , 0, 0, map_loc15
    .data 16, 0,0 , 0, 0, map_loc16
    .data 17, 0,0 , 0, 0, map_loc17