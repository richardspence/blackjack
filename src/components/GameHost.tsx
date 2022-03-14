import { Alert, AlertTitle, AppBar, Badge, Button, Grid, Icon, LinearProgress, Toolbar, Typography } from '@mui/material';
import * as React from 'react'
import { useState } from 'react';
import { FaceValue, Game, Suite } from '../blackjack/game';
import { toUiCard } from './CardHelpers';
import CardSingle from './CardSingle';
import Card from 'react-playing-card'
import { AttachMoney, Close, Done } from '@mui/icons-material';
import { LinearProgressWithLabel } from './LinearProgressWithLabel';

export const GameHost = () => {
    const [game, setState] = useState(() => new Game());
    const [actionId, increment] = useState(() => ({}));
    const [actionDisabled, setActionDisabled] = useState(false);
    const [nextAction, setNextAction] = useState({ key: `dealHand`, value: `Deal Player Hand` });
    return <div>
        <AppBar position="static">
            <Toolbar color={game.lastResult?.won ? 'green' : 'default'}>
                {/* <IconVideo className={classes.menuButton} /> */}
                <Typography
                    variant="h6"
                >
                    Actions
                </Typography>
                <Button
                    variant='contained'
                    style={{ visibility: game.isPlaying ? 'collapse' : 'initial' }}
                    color={`primary`}
                    onClick={(e) => {
                        e.preventDefault();
                        game.player.play(50);
                        game.start();
                        increment({});
                    }} >
                    Bet 50
                </Button>
                <Button
                    variant='contained'
                    color={`primary`}
                    style={{ visibility: game.canHit ? 'initial' : 'collapse' }}
                    onClick={(e) => {
                        e.preventDefault();
                        game.player.hand!.hit();
                        game.checkEnd();
                        increment({});
                    }} >
                    Hit
                </Button>
                <Button
                    variant='contained'
                    color={`error`}
                    style={{ visibility: game.canDouble ? 'initial' : 'collapse' }}
                    onClick={(e) => {
                        e.preventDefault();
                        game.player.doubleDown();
                        game.checkEnd();
                        increment({});
                    }} >
                    Double
                </Button>
                <Button
                    variant='contained'
                    color={`warning`}
                    style={{ visibility: game.canHit ? 'initial' : 'collapse' }}
                    onClick={(e) => {
                        e.preventDefault();
                        game.player.hand!.stand();
                        game.checkEnd();
                        increment({});
                    }} >
                    Stand
                </Button>
                <Button
                    variant='contained'
                    color={`warning`}
                    style={{ visibility: game.canSurrender ? 'initial' : 'collapse' }}
                    onClick={(e) => {
                        e.preventDefault();
                        game.player.surrender();
                        game.checkEnd();
                        increment({});
                    }} >
                    Surrender
                </Button>

                <span>       <AttachMoney />   {game.player.chipsTotal}</span>&nbsp;

                <span>Cards Remaining: <LinearProgressWithLabel value={game.deckProgress} /></span>

            </Toolbar>
        </AppBar>
        {game.lastMessage && !game.isPlaying && <Alert severity={game.lastResult?.won ? 'success' : game.lastResult?.won === false ? 'error' : 'info'}>
            <AlertTitle>{game.lastResult?.won ? 'You Won!' : game.lastResult?.won === false ? 'Lost!' : 'info'}</AlertTitle>
            {game.lastMessage}
        </Alert>}
        <Grid container spacing={16}>
            <Grid item xs={16} >
                <h2>Dealers</h2>
            </Grid>

            <Grid container spacing={16} style={{ height: '100px', }}>
                <Grid item xs={12}>
                    <Grid container justifyContent="center" spacing={8}>
                        {game.dealer.cards.map((c, i) => {
                            return <Grid key={i} item >
                                {c.shown && (<Card key={`dealer-${i}`} {...toUiCard(c.card)} />)}
                            </Grid>;

                        })}

                    </Grid>
                </Grid>
            </Grid>

            <Grid item xs={16} >
                <h2>Player</h2>
            </Grid>
            <Grid container spacing={16}>
                <Grid item xs={12}>
                    <Grid container justifyContent="center" spacing={8}>
                        {game.player.hand?.cards.map((c, i) => {
                            return <Grid key={i} item>
                                {c.shown && (<Card key={`dealer-${i}`} {...toUiCard(c.card)} />)}
                            </Grid>;

                        })}

                    </Grid>
                </Grid>
            </Grid>
        </Grid>

    </div>;
}