import { assert } from "../util/assert";
import { FaceValue } from "./Card";
import { Deck } from "./Deck";
import { Hand, HandStatus } from "./Hand";

export class HandCollection {
    public hands: Hand[];

    get primaryHand() {
        return this.hands.find(p => p.status === HandStatus.Playing)
            ?? this.hands[this.hands.length - 1];
    }
    constructor(private deck: Deck) {
        this.hands = [];
    }

    canSplit() {
        return this.primaryHand.cards.length === 2
            && this.primaryHand.cards[0].card.faceValue ===
            this.primaryHand.cards[1].card.faceValue
            && !this.maxHands;
    }

    get maxHands() {
        return this.hands.length === 4;
    }

    addHand(bet: number) {
        const hand = new Hand(this.deck, bet);
        this.hands.push(hand);
    }

    splitHand() {
        assert(this.canSplit());

        const hand = this.primaryHand;
        const [card1, card2] = this.primaryHand.cards;
        // remove the hand
        this.hands = this.hands.filter(p => p !== hand);
        const hand1 = new Hand(this.deck, hand.bet);
        const hand2 = new Hand(this.deck, hand.bet);
        hand1.isSplit = true;
        hand2.isSplit = true;
        hand1.addCard(card1.card, card1.shown);
        hand2.addCard(card2.card, card2.shown);
        this.hands.push(hand1);
        this.hands.push(hand2);

        [hand1, hand2].forEach(h => {
            h.hit();
            if (h.cards[0].card.faceValue === FaceValue.Ace) {
                if (h.cards[1].card.faceValue !== FaceValue.Ace || this.maxHands) {
                    h.stand();
                }
            }
        });
    }

    get isSplitAces() {
        return this.hands.length > 1
            && this.primaryHand.cards[0].card.faceValue === FaceValue.Ace;
    }
}
