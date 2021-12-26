# OneOfUs

About
======
OneOfUs is a group game. Amongst a group, one player is secretly chosen as TheOne.
The game starts off at night. TheOne secretly chooses one of the other players to be killed.
Then, the day comes. The group finds out who was killed. The group debates and eventually votes for who they suspect to be TheOne.
If the group votes out TheOne, the game ends and TheOne lost.
If the group votes out someone else, that person is dead (killed by the group), even though this person was innocent.
Then the night comes and TheOne chooses their next victim.
And so on, the game continues, until TheOne wins by surviving all votes or the TheOne loses by being voted out.

Themes
======
To make the game more interesting, invent your own theme. E.g.:
- We are all friends, but OneOfUs is a sadist psychopath.
- We are all unicorns, but OneOfUs is a horse with a fake horn.
- We are all PS5ers, but OneOfUs plays Xbox.
- We are all Xboxers, but OneOfUs plays PS5.
etc.

Requirements
======
Min players needed: 4.
The game fun increases with the number of players. Min recommended amount of players: 8.
The list of players is chosen as the users on the voice channel `game-chat` when `/new-game` is run.

Implementation
======
This implementation runs on Discord.
Controls:
/new-game name:horses [this command can only be run by anyone with an 'Operator' role; it will delete prev. game and start a new one]
/kill user:@user [this command can only be run by TheOne on the #the-one channel and only during the night]
/vote user:@user [this command can only be run by alive players and only during the day]
/voting-done [this command can only be run by anyone with an 'Operator' role; this advances the game from day to night, after all voting is done]
/tally [run this command to this current state of the game]

Server
======
The current implementation requires you to run your own server. The steps are:
1. Install `node`, at least v16.
2. Download code.
3. Run `node index.js`
4. Add bot as `Administrator` to your Discord server.
5. Create `game-chat` voice and text channel (2 channels).

If there is demand, we could run a server so you only need to add the bot.

Donations
======
This bot was created by a family to have fun. If you like it, consider donating here:
BTC: 1Q9PZWrxAQP6fM2UgRr5Rgfr1wej5DRevi
ETH: 0xEF0533F730aD9fD82d6dC6a55ffE735F1fFc9a41
ALGO: 7C3OBCJ2I2X5B5TZ74NQOUDMZIRG5B5T75B3RA3YZTZW2JQVZFBNPK37AM
DOGE: DHVHs1MMqD4tAMRYWyvpsXJzuMHKn51xZe
XMR: 44YBNn5PjVTXRwH8ACqRAJRBiQJhEjdKeMF8xAET9aWzBnErTLV3iXkJobMYqgpFg68egyRPWXoHaABxDh9WyJ431np5eGt
ADA: addr1qxq80gjkp4aum09v4yvlnygw6zkae8vty7jp05fu7n2nqmedhuw0jxacggkm3sy4gz2sx6lj67zxvqm60hfq3hh29m0q999evk
BAT: 0xEF0533F730aD9fD82d6dC6a55ffE735F1fFc9a41
