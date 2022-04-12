import { Card, FaceValue } from "./Card";

export class Deck {

    private _cards: Card[] = [];

    public get cards(): ReadonlyArray<Card>{
        return this._cards;
    }

    constructor(private numDecks = 1) {
    }

    private init() {
        this._cards = [];
        for (let deckIndex = 0; deckIndex < this.numDecks; deckIndex++) {
            for (let suiteIndex = 0; suiteIndex < 4; suiteIndex++) {
                for (let cardIndex = 0; cardIndex <= FaceValue.Ace; cardIndex++) {
                    this._cards.push({
                        faceValue: cardIndex,
                        suite: suiteIndex,
                    });
                }
            }
        }
    }

    public get cardsLeft() {
        return this._cards.length;
    }

    public get decksLeft() {
        return this.cardsLeft / 52;
    }


    public shuffle(init = true) {
        if (init) {
            this.init();
        }
        const shuffledCards: Card[] = [];
        while (this._cards.length) {
            const index = Math.floor(Math.random() * (this._cards.length));
            const [card] = this._cards.splice(index, 1);
            shuffledCards.push(card);
        }
        this._cards = shuffledCards;
    }

    public pullCard(predicate?: (card: Card) => boolean) {
        if(predicate){
            const card = this._cards.find(predicate);
            if(card){
                const idx = this._cards.indexOf(card);
                this._cards.splice(idx, 1);
                return card;
            }
            return;
        }
        return this._cards.shift()!;
    }

}
