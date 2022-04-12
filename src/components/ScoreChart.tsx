import { Grid, Paper, styled, Tooltip } from '@mui/material';
import * as React from 'react';
import { FaceValue, Hand, IDeck, Suite } from '../blackjack';
import { Deck } from '../blackjack/Deck';
import { Odds } from '../blackjack/Odds';
import { OddsView } from './OddsView';
import { DataGrid, GridRenderCellParams } from '@mui/x-data-grid';
// import Tooltip from '@mui/material/Tooltip';

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
}));

const scoreToHand = (score: number, deck: IDeck) => {
    const hand = new Hand(deck, 0);
    const normalizedScore = score - 2;
    const firstCard = Math.floor(normalizedScore/2);
  

    hand.addCard({
        faceValue: firstCard,
        suite: Suite.Diamonds,
    });
    hand.addCard({
        faceValue: normalizedScore - hand.score,
        suite: Suite.Diamonds,
    });

    return hand;
}

interface ScoreChartProps {
}

const toPercent = (x: number)=>{
    return x.toLocaleString(undefined,{style: 'percent', minimumFractionDigits:2});
}
export const ScoreChart = () => {

    const deck = new Deck(6);
    const headers: Hand[] = [];
    for (var i = FaceValue.Two; i <= FaceValue.Ace; i++) {
        const hand = new Hand(deck, 0);
        if (i > FaceValue.Ten && i < FaceValue.Ace) {
            continue;
        }
        hand.addCard({
            faceValue: i,
            suite: Suite.Diamonds,
        });
        headers.push(hand);
    }

    const rows: Hand[] = [];
    for (var d = 4; d <= 20; d++) {
        rows.push(scoreToHand(d, deck));
    }

    const columns = [
        { field: 'score', headerName: 'Player Score', width: 10 },
        ...headers.map(h => {
            return {
                field: `${h.score}`,
                headerName: `${FaceValue[h.score === 11 ? FaceValue.Ace : h.score - 2]}`,
                width: 30,
                renderCell: (params: GridRenderCellParams<typeof rowValues[number][number]>) => {
                    const v = params.value;
                    if (v) {
                        const { shouldSurrender, shouldDouble, shouldHit, score } = v;
                        const title = `W:${toPercent(score.oddsOfWinning)}
                            T:${toPercent(score.oddsOfTieing)}
                            S:${toPercent(score.oddsOfStaying)}`;
                        return <Tooltip title={title} >
                            <Paper>
                                {shouldSurrender ? `su` :
                                    `${shouldDouble ? `D` : ''}${shouldHit ?
                                        `H` : `S`}`}
                            </Paper>
                        </Tooltip>;
                    }
                }
                //     <strong>
                //       {params.value.getFullYear()}
                //       <Button
                //         variant="contained"
                //         color="primary"
                //         size="small"
                //         style={{ marginLeft: 16 }}
                //       >
                //         Open
                //       </Button>
                //     </strong>
                // )
                // valueGetter: (row: { row: typeof rowValues[number]}) => {
                //     const v = row.row[h.score];
                //     if (v) {
                //         const { shouldSurrender, shouldDouble, shouldHit } = v;
                //         return <Tooltip title='test' >
                //             <Paper>
                //                 {shouldSurrender ? `su` :
                //                     `${shouldDouble ? `D` : ''}${shouldHit ?
                //                         `H` : `S`}`};
                //             </Paper>
                //         </Tooltip>;
                //     }
                // }
            };
        })
    ];

    const rowValues = rows.map((r, ri) => {
        const vals = headers.map((h, hi) => {
            const odds = new Odds(r, h, deck);
            const score = odds.calcPlayerOdds();
            const shouldHit = score.oddsOfWinning > score.oddsOfStaying;
            const shouldSurrender = Math.max(score.oddsOfStaying, score.oddsOfWinning)  < .33;
            const shouldDouble = false && score.oddsOfWinning > .5;
            return { shouldSurrender, shouldDouble, shouldHit, score, val: h.score };
        });
        type vType<T> = T extends (infer K)[] ? K : never;
        const value: Record<number, vType<typeof vals>> & { id: number, score: number }
            = {
            id: ri, score: r.score,
        };
        vals.forEach((v, id) => {
            value[v.val] = v;
        })
        //     ...headers.map((h, hi) =>{
        //         const odds = new Odds(r, h, deck);
        //         const score = odds.calcPlayerOdds();
        //         const shouldHit = score.oddsOfWinning > score.oddsOfStaying;
        //         const shouldSurrender = Math.max(score.oddsOfStaying, score.oddsOfWinning) + score.oddsOfTieing < .5;
        //         const shouldDouble = false && score.oddsOfWinning > .5;
        //         value[h.score] = { shouldSurrender, shouldDouble, shouldHit, score };    
        //     })
        // };
        // headers.forEach((h, hi) => {
        //     const odds = new Odds(r, h, deck);
        //     const score = odds.calcPlayerOdds();
        //     const shouldHit = score.oddsOfWinning > score.oddsOfStaying;
        //     const shouldSurrender = Math.max(score.oddsOfStaying, score.oddsOfWinning) + score.oddsOfTieing < .5;
        //     const shouldDouble = false && score.oddsOfWinning > .5;
        //     value[h.score] = { shouldSurrender, shouldDouble, shouldHit, score };
        // })
        return value;
    });

    return <div style={{ height: 400, width: '100%' }}>
        <DataGrid
            rows={rowValues}
            columns={columns}
            checkboxSelection
            disableSelectionOnClick
        />
    </div>
}