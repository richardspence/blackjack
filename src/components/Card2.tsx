import { Typography } from '@mui/material';
import * as React from 'react';
import { Card, Hand } from '../blackjack';
import { toUiCard } from './CardHelpers';

export interface CardProps {
    card: Card
    shown: boolean;
}
export const CardControl = (props: CardProps) => {
    if (props.shown) {
        const uiCard = toUiCard(props.card);
        return <img src={`cards/${uiCard.rank}${uiCard.suit}.svg`} className="card" />
    } else {
        return <img src="cards/BLUE_BACK.svg" className="card" />
    }
}

export interface HandProps {
    hand?: Hand;
    isActive?: boolean;
    isPrimary?: boolean
    showCounts?: boolean;
}

export const HandControl = (props: HandProps) => {
    if (props.hand) {
        return <div>
            {props.isPrimary && <hr />}
            <div className={`hand hhand-compact ${props.isPrimary && 'active-hand'}`}>
                {props.hand.cards.map((s, i) => <CardControl {...s} key={i} />)}
                {props.showCounts && !!props.hand.shownScore && <Typography>
                    {props.hand.shownScore}
                </Typography>}
                {props.isPrimary && <hr />}
            </div></div>;
    }
    return <div></div>;
}