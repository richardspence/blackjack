import React, { useEffect, useState } from 'react';
// import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'
// import IconVideo from '@material-ui/icons/Tv';
// import {
//     CssBaseline,
//     Button,
//     AppBar,
//     Toolbar,
//     IconButton,
//     Typography
// } from '@material-ui/core';
import {
    CardBack,
    Base,
    Rank,
    Suit
} from './graphics'
// import { 
//     getShuffledDeck 
// } from './utils/'
import CardSingle from './CardSingle'
import {
    flipCard,
    moveTo
} from './animation'
import { makeStyles, ThemeProvider } from '@mui/styles';
import { AppBar, Button, createTheme, CssBaseline, Toolbar, Typography } from '@mui/material';
const muiTheme = {
    palette: {
      type: "light",
      primary: {
        main: "#2194BB"
      },
      secondary: {
        main: "#DAC338"
      },
      // text: {
      //   main: "rgba(33,33,33,1)"
      // },
      success: {
        main: "rgba(0,0,0,1)"
      },
      info: {
        main: "rgba(0,0,0,1)"
      },
      warning: {
        main: "rgba(0,0,0,1)"
      },
      bg: {
        main: "#FFFFFF"
      }
    }
  };
const useStyles = makeStyles(theme => ({
    cards:{
        position: 'relative',
        left: 0,
        top: 0,
        zIndex: 20,
    },
    videoBase:{
        position: 'relative',
                left: 0,
        top: 0,
        zIndex: 10,
    },
    table:{
        position: 'relative',
        height: 'calc(100vh - 65px)',
        overflow: 'hidden',
    },
    menuButton: {
        marginRight:'2px',
    },
    title: {
      flexGrow: 1,
    },
}));

export default function Overlay() {
    const classes = useStyles();
    const [shoe, setShoe] = useState(null);
    const [inPlay, setInPlay] = useState([{ id: 'S_A', rank: 'S_A', suit: 'S'}] as  (any[]));
    const [color, setColor] = React.useState('#212121');
    const [nextAction, setNextAction] = React.useState({key:`dealHand`, value:`Deal Player Hand`});
    const [actionDisabled, setActionDisabled] = React.useState(false);

    const initHandCards = () => {
        setTimeout(() => {
        moveTo('initCard', `#${inPlay[0].id}`)
        moveTo('dealFirst', `#${inPlay[0].id}`)
        flipCard(`setToHidden`, `#${inPlay[0].id}-card-face`)
        setTimeout(() => {
            flipCard(`show`, `#${inPlay[0].id}-card-face`)
        }, 500)
        flipCard(`hide`, `#${inPlay[0].id}-card-back`)
        
        setTimeout(() => {
            moveTo('initCard', `#${inPlay[1].id}`)
            moveTo('dealSecond', `#${inPlay[1].id}`, () => setActionDisabled(false))
            flipCard(`setToHidden`, `#${inPlay[1].id}-card-face`)
            flipCard(`hide`, `#${inPlay[1].id}-card-back`)
            setTimeout(() => {
                flipCard(`show`, `#${inPlay[1].id}-card-face`)
            },500)
        }, 750)}, 100)
    }

    const initFlop = () => {
        setTimeout(() => {
            moveTo('initCard', `#${inPlay[2].id}`)
            moveTo('dealFlopFirst', `#${inPlay[2].id}`)
            flipCard(`setToHidden`, `#${inPlay[2].id}-card-face`)
            flipCard(`hide`, `#${inPlay[2].id}-card-back`)
            setTimeout(() => {
                flipCard(`show`, `#${inPlay[2].id}-card-face`)
            },500)
            setTimeout(() => {
                moveTo('initCard', `#${inPlay[3].id}`)
                moveTo('dealFlopSecond', `#${inPlay[3].id}`)
                flipCard(`setToHidden`, `#${inPlay[3].id}-card-face`)
                flipCard(`hide`, `#${inPlay[3].id}-card-back`)
                setTimeout(() => {
                    flipCard(`show`, `#${inPlay[3].id}-card-face`)
                },500)
                setTimeout(() => {
                    moveTo('initCard', `#${inPlay[4].id}`)
                    moveTo('dealFlopThird', `#${inPlay[4].id}`, () => setActionDisabled(false))
                    flipCard(`setToHidden`, `#${inPlay[4].id}-card-face`)
                    flipCard(`hide`, `#${inPlay[4].id}-card-back`)
                    setTimeout(() => {
                        flipCard(`show`, `#${inPlay[4].id}-card-face`)
                    },500)
                }, 750)
            }, 750)
        }, 100)
    }

    const initRivers = () => {
        setTimeout(() => {
        moveTo('initCard', `#${inPlay[5].id}`)
        moveTo('dealRiverFirst', `#${inPlay[5].id}`)
        flipCard(`setToHidden`, `#${inPlay[5].id}-card-face`)
        flipCard(`hide`, `#${inPlay[5].id}-card-back`)
        flipCard(`show`, `#${inPlay[5].id}-card-face`)
        setTimeout(() => {
            moveTo('initCard', `#${inPlay[6].id}`)
            moveTo('dealRiverSecond', `#${inPlay[6].id}`, () => setActionDisabled(false))
            flipCard(`setToHidden`, `#${inPlay[6].id}-card-face`)
            flipCard(`hide`, `#${inPlay[6].id}-card-back`)
            setTimeout(() => {
                flipCard(`show`, `#${inPlay[6].id}-card-face`)
            },500)
        }, 750)}, 100)
    }

    const muckCards = () => {
        for (let i=0; i<inPlay.length; i++){
            flipCard(`hide`, `#${inPlay[i].id}-card-face`)
            setTimeout(() => {
                moveTo('muckCard', `#${inPlay[i].id}`, () => setActionDisabled(false))
                setTimeout(() => {
                    flipCard(`show`, `#${inPlay[i].id}-card-back`)
                },400)
            }, 100*i)
        }
    }

    useEffect(() => {
        if (!shoe){
            //setShoe(getShuffledDeck())
        }
    })

    return (
        <React.Fragment>
            <ThemeProvider theme={createTheme(muiTheme)}>
                <CssBaseline />
                <AppBar position="static">
                    <Toolbar>
                    {/* <IconVideo className={classes.menuButton} /> */}
                      <Typography 
                        variant="h6" 
                        className={classes.title}>
                        Overlay onto anything
                      </Typography>

                      <Button
                            disabled={actionDisabled}
                            variant={`contained`}
                            color={`secondary`}
                            onClick={(e) => {
                                e.preventDefault()
                                if (nextAction.key === 'dealHand'){
                                    let newInPlay = inPlay
                                    //newInPlay.push(shoe.pop(),shoe.pop(),shoe.pop(),shoe.pop(),shoe.pop(),shoe.pop(),shoe.pop())
                                    setInPlay(newInPlay)
                                    setNextAction({key:`initFlop`, value:`Deal Flop`})
                                    initHandCards()
                                    setActionDisabled(true)
                                }
                                if (nextAction.key === 'initFlop'){
                                    setNextAction({key:`initRiver`, value:`Deal Rivers`})
                                    initFlop()
                                    setActionDisabled(true)
                                }
                                if (nextAction.key === 'initRiver'){
                                    setNextAction({key:`nextHand`, value:`Next Hand`})
                                    initRivers()
                                    setActionDisabled(true)
                                }
                                if (nextAction.key === 'nextHand'){
                                    setNextAction({key:`dealHand`, value:`Deal Player Hand`})
                                    muckCards()
                                    setActionDisabled(true)
                                }
                            }}>
                            {nextAction.value}
                        </Button>
                    </Toolbar>
                </AppBar>
                
                <div className={classes.table}>
                    
                    {inPlay.length ? 
                        <React.Fragment>
                            <div className={classes.cards}>
                            {inPlay.map((item:any, i) => {
                                return (
                                    <CardSingle
                                        key={`card_${i}`}
                                        id={item.id}
                                        // card={{
                                        //     suit: item.suit, 
                                        //     rank: item.rank, 
                                        //     backColor: `#1A1919`,
                                        //     color: item.suit === 'D' || item.suit === 'H' ? `#D33E43` : `#1A1919`
                                        // }}
                                        card={{
                                            suit: 'S', 
                                            rank: '2', 
                                            backColor: `#1A1919`,
                                            color: `#1A1919`
                                        } as any}
                                    />
                                )
                            })}
                            </div>
                        </React.Fragment>
                    : null }

                
                   
                </div>

            </ThemeProvider>
        </React.Fragment>
    );
}