import * as React from 'react';
import { Game, Hand } from '../blackjack';
import { Odds } from '../blackjack/Odds';
export interface OddsProps{
    game: Game;
    iteration: number;
    split?: boolean;
}

const toPercent = (x: number)=>{
    return x.toLocaleString(undefined,{style: 'percent', minimumFractionDigits:2});
}
export const OddsView = (props: OddsProps)=>{
    const {game, split} = props;
    if(game.isPlaying){
        let playerHand = game.player.primaryHand;
        if(split){
            const splitHand = new Hand(game.deck, 0);
            splitHand.addCard(playerHand.cards[0].card);
            playerHand = splitHand;
        }
        const odds = new Odds(playerHand, game.dealer, game.deck);
        const {oddsOfTieing, oddsOfWinning, oddsOfStaying } = odds.calcPlayerOdds();
        return <div>
            Odds W: {toPercent(oddsOfWinning)}
            Odds T: {toPercent(oddsOfTieing)}
            Odds S: {toPercent(oddsOfStaying)}
        </div>
    }
    return <div></div>;
};
