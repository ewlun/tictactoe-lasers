# Tic-tac-toe with lasers
A game based on a Quora post by Sunny Nie, ([found here](https://qr.ae/pskPRG))

## Rules
The goal is to get three in a row, just like regular tic-tac-toe. The twist is that there are lasers.

### Lasers
A player can shoot a laser between two of their marks, burning the tiles and marks between them. A mark cannot be placed on a burned tile.

### Mirrors
Mirrors can be placed to divert lasers. A mirror can be placed either in two ways: / and \ . (might be changed)

## Win condition
If a player gets three in a row, the other player has one turn to either:

1. Get their own three in a row
2. Destroy one of the marks that created the three in a row

If the responding player chooses to get three in a row, all squares that were used become unusable. If the responding player fails to do either, they lose