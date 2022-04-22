import { Alert, AlertTitle, AppBar, Button, Divider, Grid, Paper, ToggleButton, ToggleButtonGroup, Toolbar, Typography } from '@mui/material';
import * as React from 'react'
import { useState } from 'react';
import { FinalStatus, Game } from '../blackjack';
import { AttachMoney, ArrowRightAlt, CompareArrows, DoubleArrow } from '@mui/icons-material';
import { LinearProgressWithLabel } from './LinearProgressWithLabel';
import { HandControl } from './Card2';
import { MoveType, Strategy } from '../blackjack/Strategy';
import { useSnackbar } from 'notistack';
import { OddsView } from './OddsView';
import { StratView } from './StratView';

function checkStrategy(strategy: Strategy, moveType: MoveType) {
    const shouldDo = strategy.determineMove();
    if (shouldDo === moveType) {
        return {
            success: true as const
        };
    } else {
        return {
            success: false,
            shouldDo,
            didDo: moveType
        } as const;
    }
}

export const GameHost = () => {
    const [game] = useState(() => new Game());
    const [actionId, increment] = useState(0);
    const [strategy] = useState(() => (new Strategy(game)));
    const [, showResult] = useState(false);
    const [playerOption, setOptions] = useState('');
    const [viewOptions, setViewOptions] = useState<string[]>([]);
    const [lastStrat, setStrat] = useState<ReturnType<typeof checkStrategy>>(() => ({ success: true }));
    const updateMove = (moveType: MoveType) => {
        setStrat(checkStrategy(strategy, moveType));
    }

    const { enqueueSnackbar } = useSnackbar();

    const recheck = () => {
        const messageToShow = !!game.lastResult && !game.isPlaying;
        showResult(messageToShow);
        if (messageToShow) {
            game.lastResult?.reverse().forEach((r, i) => {
                const type = r?.won === FinalStatus.Won ? 'success' : r?.won === FinalStatus.Lost ? 'error' : 'info';
                const content = <Alert severity={type}>
                    <AlertTitle>{r?.won === FinalStatus.Won ? 'You Won!'
                        : r?.won === FinalStatus.Lost ? 'Lost!'
                            : r?.won === FinalStatus.Tied ? 'You Tied'
                                : r?.won === FinalStatus.Surrendered ? 'You Surrendered'
                                    : 'info'}</AlertTitle>
                    {r.message}
                    <p><strong>{r.totalReturn || game.player.hands.hands[i].bet}</strong>
                        {r.totalReturn ? ` chips returned` : ` chips lost`}
                    </p>
                </Alert>;

                enqueueSnackbar('', {
                    content,
                    key: i + actionId,
                    variant: type,
                });

            });
        }
        increment(actionId + 1);
    }
    
    const showNums = viewOptions.includes('nums');
    return <div>
        <AppBar position="static">
            <Toolbar >
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
                        showResult(false);
                        game.player.play(50);
                        game.start();
                        setStrat({ success: true });
                        recheck();
                    }} >
                    Bet 50
                </Button>
                <Button
                    variant='contained'
                    color={`primary`}
                    style={{ visibility: game.canHit ? 'initial' : 'collapse' }}
                    onClick={(e) => {
                        e.preventDefault();
                        updateMove(MoveType.Hit);
                        game.player.hit();
                        game.checkEnd();
                        recheck();
                    }} >
                    Hit
                </Button>
                <Button
                    variant='contained'
                    color={`error`}
                    style={{ visibility: game.canDouble ? 'initial' : 'collapse' }}
                    onClick={(e) => {
                        e.preventDefault();
                        updateMove(MoveType.Double);
                        game.player.doubleDown();
                        game.checkEnd();
                        recheck();
                    }} >
                    Double
                </Button>
                <Button
                    variant='contained'
                    color={`warning`}
                    style={{ visibility: game.canHit ? 'initial' : 'collapse' }}
                    onClick={(e) => {
                        e.preventDefault();
                        updateMove(MoveType.Stand);
                        game.player.primaryHand!.stand();
                        game.checkEnd();
                        recheck();
                    }} >
                    Stand
                </Button>
                <Button
                    variant='contained'
                    color={`warning`}
                    style={{ visibility: game.canSurrender ? 'initial' : 'collapse' }}
                    onClick={(e) => {
                        e.preventDefault();
                        updateMove(MoveType.Surrender);
                        game.player.surrender();
                        game.checkEnd();
                        recheck();
                    }} >
                    Surrender
                </Button>
                <Button
                    variant='contained'
                    color={`warning`}
                    style={{ visibility: game.canSplit ? 'initial' : 'collapse' }}
                    onClick={(e) => {
                        e.preventDefault();
                        updateMove(MoveType.Split);
                        game.player.splitHand();
                        recheck();
                    }} >
                    Split
                </Button>

                <span>       <AttachMoney />   {game.player.chipsTotal.total}</span>&nbsp;

                <span>Cards Remaining: <LinearProgressWithLabel value={game.deckProgress} /></span>

            </Toolbar>
        </AppBar>
        {/*         
        {game.lastMessage && !game.isPlaying &&
            game.lastResult?.map((r, i) => {
                return <Alert key={i} severity={r?.won === FinalStatus.Won ? 'success' : r?.won === FinalStatus.Lost ? 'error' : 'info'}>
                    <AlertTitle>{r?.won === FinalStatus.Won ? 'You Won!' 
                                : r?.won === FinalStatus.Lost ? 'Lost!'
                                : r?.won === FinalStatus.Tied ? 'You Tied'
                                : r?.won === FinalStatus.Surrendered ? 'You Surrendered'
                                 : 'info'}</AlertTitle>
                    {r.message}
                </Alert>;
            })
        } */}

        {/* 
        {game.lastResult &&
            game.lastResult?.map((r, i) => {
                const severity = r?.won === FinalStatus.Won ? 'success' : r?.won === FinalStatus.Lost ? 'error' : 'info';
                return <Snackbar open={hasResult} autoHideDuration={6000} onClose={() => showResult(false)} key={i + actionId} >
                    <Alert elevation={6} variant='filled' severity={severity}><AlertTitle>{r?.won === FinalStatus.Won ? 'You Won!'
                        : r?.won === FinalStatus.Lost ? 'Lost!'
                            : r?.won === FinalStatus.Tied ? 'You Tied'
                                : r?.won === FinalStatus.Surrendered ? 'You Surrendered'
                                    : 'info'}</AlertTitle>
                        {r.message}
                    </Alert>
                </Snackbar>;
            })
        } */}

        {!lastStrat.success && <Alert severity={lastStrat.success ? 'success' : 'error'}>
            <AlertTitle>Strategy miss</AlertTitle>
            <strong>{MoveType[lastStrat.shouldDo]}</strong> vs what you did do:
            <strong> {MoveType[lastStrat.didDo]} </strong>
        </Alert>}
        <Grid container spacing={16}>
            <Grid item xs={16} justifyContent={"center"}>
                <Paper
                    elevation={0}
                    sx={{
                        display: 'flex',
                        border: (theme) => `1px solid ${theme.palette.divider}`,
                        flexWrap: 'wrap',
                    }}
                >
                    <ToggleButtonGroup
                        size="small"
                        exclusive
                        value={playerOption}
                        onChange={(e, n) => {
                            game.options = {};
                            if (n === 'split') {
                                game.options.preferSplit = true;
                            } else if (n === 'preferSoft') {
                                game.options.preferSoft = true;
                            }
                            setOptions(n);
                        }}
                        aria-label="Options"
                    >
                        <ToggleButton
                            value="split"
                        >
                            <CompareArrows />
                        </ToggleButton>
                        <ToggleButton
                            value="preferSoft"
                        >
                            <DoubleArrow />
                        </ToggleButton>
                    </ToggleButtonGroup>
                    <Divider flexItem orientation="vertical" sx={{ mx: 0.5, my: 1 }} />
                    <ToggleButtonGroup
                        size="small"
                        value={viewOptions}
                        onChange={(e, n) => {
                            setViewOptions(n);
                        }}
                        aria-label="Options"
                    >
                        <ToggleButton
                            value="nums"
                        >
                            <Typography> #</Typography>
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Paper>
            </Grid>
            <Grid item xs={16} >
                <h2>Dealers</h2>
            </Grid>

            <Grid container spacing={16} style={{ height: '100px', }}>
                <Grid item xs={12}>
                    {/* <Grid container justifyContent="center" spacing={8}>
                        {game.dealer.cards.map((c, i) => {
                            return <Grid key={i} item >
                                {c.shown && (<Card key={`dealer-${i}`} {...toUiCard(c.card)} />)}
                    </Grid>;

                        })}

                    </Grid> */}
                    <Grid container justifyContent="center" spacing={8}>
                        <HandControl showCounts={showNums} hand={game.dealer} />
                    </Grid>

                </Grid>
            </Grid>

            <Grid item xs={16} >
                <h2>Player</h2>
            </Grid>
            <Grid container spacing={16}>
                {game.player.hands.hands.map((m, i) => {
                    const isPrimary = m === game.player.primaryHand && game.isPlaying;

                    return <React.Fragment key={i}>
                        <Grid item xs={12} key={i}>
                            <Grid container justifyContent="center" spacing={8}>
                                {isPrimary && <ArrowRightAlt color="info" style={{ width: '100px', height: '100px' }} />}
                                <HandControl showCounts={showNums} hand={m} isPrimary={isPrimary} />

                            </Grid>

                        </Grid>
                    </React.Fragment>;
                })}
            </Grid>


        </Grid>
        <OddsView game={game} iteration={actionId} />
        { game.canSplit && <OddsView game={game} iteration={actionId} split />}
        { game.isPlaying && <StratView moveType={strategy.determineMove()} />}
    </div>;
}