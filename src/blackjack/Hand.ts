import { assert } from "../util/assert";
import { Card, FaceValue } from "./Card";

export enum HandStatus {
    Playing,
    Blackjack,
    TwentyOne,
    Bust,
    Stand,
    Surrender,
}


export interface HandCard {
    card: Card,
    score: number;
    shown: boolean;
}

export interface IDeck{
    pullCard(cardType?: (p: Card) => boolean): Card | undefined;

}

export class Hand {

    clone(): Hand {
        const hand =  new Hand(this.deck, this.bet);

        hand.cards = [...this.cards.map(c=> ({
            ...c,
        }))];
        hand.status = this.status;
        hand.score = this.score;

        return hand;
    }

    surrender() {
        assert(this.status === HandStatus.Playing);
        this.status = HandStatus.Surrender;
    }
    public cards: HandCard[] = [];
    public status: HandStatus;
    public score: number;
    public get shownScore(): number {
        return this.cards.reduce((l, p) => l + (p.shown ? p.score : 0), 0);
    }
    public isSplit = false;
    constructor(public deck: IDeck, public bet: number) {
        this.status = HandStatus.Playing;
        this.score = 0;
    }

    scoreCard(card: Card, acesHigh = true) {
        let score;
        switch (card.faceValue) {
            case FaceValue.Ten:
            case FaceValue.Jack:
            case FaceValue.Queen:
            case FaceValue.King:
                score = 10;
                break;
            case FaceValue.Ace:
                if (acesHigh) {
                    score = 11;
                } else {
                    score = 1;
                }
                break;
            default:
                score = card.faceValue + 2;
        }
        return score;
    }

    get hasTwoCards() {
        return this.cards.length === 2;
    }

    hit(showCard = true) {
        this.pullCard(showCard);
    }

    stand() {
        this.status = HandStatus.Stand;
    }

    doubleDown() {
        this.bet *= 2;
        if (this.cards[0].card.faceValue !== FaceValue.Ace
            || !this.isSplit) {
            this.hit();
        }
        if (this.status === HandStatus.Playing) {
            this.stand();
        }
    }

    addPair() {
        const [firstCard] = this.cards;
        const card = this.deck.pullCard(p => p.faceValue === firstCard.card.faceValue);
        if (card) {
            this.addCard(card, true);
            return true;
        }
    }

    addAce() {
        const card = this.deck.pullCard(p => p.faceValue === FaceValue.Ace);
        if (card) {
            this.addCard(card, true);
            return true;
        }
    }

    private pullCard(shown = true) {
        assert(this.status === HandStatus.Playing);
        const card = this.deck.pullCard()!;
        this.addCard(card, shown);
    }



    public addCard(card: Card, shown = true) {
        const score = this.scoreCard(card);
        this.cards.push({
            card, score, shown
        });
        this.checkScore();
    }



    get isSoft() {
        return this.cards.some(p => p.score === 11);
    }

    checkScore(): number {
        const score = this.cards.reduce((l, p) => l + p.score, 0);
        if (score > 21) {
            if (this.isSoft) {
                const aceHigh = this.cards.find(p => p.score === 11)!;
                aceHigh.score = 1;
                return this.checkScore();
            }
            this.status = HandStatus.Bust;
        } else if (score === 21) {
            if (this.cards.length === 2 && !this.isSplit) {
                this.status = HandStatus.Blackjack;
            } else {
                this.status = HandStatus.TwentyOne;
            }
        }
        // set the score
        this.score = score;
        return score;
    }
}