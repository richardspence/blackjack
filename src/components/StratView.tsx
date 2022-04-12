import * as React from 'react';
import { MoveType } from '../blackjack/Strategy';

export const StratView = (props: { moveType: MoveType }) => {
    return <div>{MoveType[props.moveType]}</div>;
}