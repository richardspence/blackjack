import { Face } from "@mui/icons-material";
import { Hand, HandStatus, Suite } from ".";
import { FaceValue } from "./Card";
import { Deck } from "./Deck";
import { MoveType } from "./Strategy";

interface IDeck {
    cardCounts: Record<FaceValue, number>
    totalCount: number;
}

type OddsMove = FaceValue;

interface ScoreTrieNode {
    hand: Hand
    hands: number;
    operation?: MoveType;
    odds: number;
    children: Record<OddsMove, ScoreTrieNode>;
}

interface Options {
    canSplit: boolean;
    hitSoft: boolean,
    hitScoreMax: number,
}

export class Odds {

    static toDeck(deck: Deck): IDeck {
        const cardCounts: Record<FaceValue, number> = {} as any;
        deck.cards.forEach(p => {
            cardCounts[p.faceValue] ||= 0;
            cardCounts[p.faceValue] += 1;
        })
        return {
            cardCounts,
            get totalCount() {
                return Object.values(cardCounts).reduce((l, r) => l + r);
            }
        };
    }

    static toDeck2(_deck: Deck): IDeck {
        const cardCounts: Record<FaceValue, number> = {} as any;
        for (var i = FaceValue.Two; i <= FaceValue.Ace; i++) {
            cardCounts[i] = 6 * 4;
        }
        return {
            cardCounts,
            get totalCount() {
                return Object.values(cardCounts).reduce((l, r) => l + r);
            }
        };
    }
    private _deck: IDeck;
    private _dealerHand: Hand;
    constructor(private _playerHand: Hand, dealerHand: Hand, deck: Deck) {
        this._dealerHand = new Hand(deck, 0);
        this._dealerHand.addCard(dealerHand.cards[0].card, true);
        this._deck = Odds.toDeck2(deck);
    }

    calcPlayerOdds() {
        const playerNode: ScoreTrieNode = {
            hand: this._playerHand,
            odds: 1,
            hands: 1,
            children: {} as any,
        }

        this.calcNodeOdds(playerNode, {
            canSplit: true,
            hitScoreMax: 21,
            hitSoft: true,
        });

        const dealerNode: ScoreTrieNode = {
            hand: this._dealerHand,
            odds: 1,
            hands: 1,
            children: {} as any,
        }

        this.calcNodeOdds(dealerNode, {
            canSplit: false,
            hitScoreMax: 17,
            hitSoft: false,
        });

        const dealerScoreOdds = this.scoreNodes(this.tailNodes(dealerNode));
        const playerScores = this.scoreNodes(this.breadthFirst(playerNode));
        // remove stay odds
        playerScores[this._playerHand.score] -= 1;
        let oddsOfWinning = 0;
        let oddsOfTieing = 0;
        let oddsOfDealerBust = 1;
        let oddsOfStaying = 1;

        for (var dealerScoreKey of Object.keys(dealerScoreOdds)) {
            const dealerScore = +dealerScoreKey;
            const dealerOdds = dealerScoreOdds[+dealerScore];
            oddsOfDealerBust -= dealerOdds;
            if (dealerScore > this._playerHand.score) {
                oddsOfStaying -= dealerOdds;
            }
            for (var i = dealerScore; i <= 21; i++) {
                const playerOdds = (playerScores[i] ?? 0) * dealerOdds;
                if (i === dealerScore) {
                    oddsOfTieing += playerOdds;
                } else {
                    oddsOfWinning += playerOdds;
                }
            }
        }

        const oddsOfPlayerBust = 1 - Object.values(playerScores)
            .reduce((l, r) => l + r, 0);
        console.log(`p scores [${this._playerHand.score}][${this._dealerHand.score}]`, {
            playerScores,
            pv: Object.values(playerScores),
            rdp: Object.values(playerScores)
                .reduce((l, r) => l + r, 0)
        });
        //odds of dealer bust when we don't bust
        oddsOfWinning += oddsOfDealerBust * (1 - oddsOfPlayerBust);
        // oddsOfWinning *= (1-oddsOfPlayerBust);
        // oddsOfStaying += oddsOfDealerBust;
        console.log('odd scoring', { playerScores, dealerScoreOdds, oddsOfDealerBust, oddsOfPlayerBust });

        return { oddsOfTieing, oddsOfWinning, oddsOfStaying };
    }

    scoreNodes(nodes: Iterable<ScoreTrieNode>): Record<number, number> {
        const scoreOdds: Record<number, number> = {};
        for (let n of nodes) {
            const score = n.hand.score;
            const odds = n.odds;
            if (!scoreOdds[n.hand.score]) {
                scoreOdds[score] = 0;
            }
            scoreOdds[score] += odds;
        }

        return scoreOdds;
    }

    *breadthFirst(node: ScoreTrieNode): Generator<ScoreTrieNode> {
        const keys = Object.keys(node.children)
        if (keys.length > 0) {
            for (var c of keys) {
                const value = node.children[c as any as FaceValue];
                for (var f of this.breadthFirst(value)) {
                    yield f;
                }
            }
        }
        yield node;
    }

    *tailNodes(node: ScoreTrieNode): Generator<ScoreTrieNode> {
        const keys = Object.keys(node.children)
        if (keys.length > 0) {
            for (var c of keys) {
                const value = node.children[c as any as FaceValue];
                for (var f of this.tailNodes(value)) {
                    yield f;
                }
            }
        } else {
            yield node;
        }
    }



    canSplit(hand: Hand, maxHands: boolean) {
        return hand.cards.length === 2
            && hand.cards[0].card.faceValue ===
            hand.cards[1].card.faceValue
            && !maxHands;
    }

    calcNodeOdds(node: ScoreTrieNode, options: Options) {
        // if (options.canSplit && this.canSplit(node.hand, node.hands < 2)
        // ) {
        //     const card = node.hand.cards[0].card;

        //     const newNode: ScoreTrieNode = {
        //         hand: new Hand(node.hand.deck, node.hand.bet),
        //         hands: node.hands,
        //         odds: node.odds,
        //         operation: MoveType.Split,
        //         children: new Map(),
        //     }
        //     newNode.hand.addCard(card);
        //     node.children.set(MoveType.Split, newNode);
        //     this.calcNodeOdds(newNode, options);
        // }

        if (node.hand.score < options.hitScoreMax
            || node.hand.isSoft && options.hitSoft
        ) {
            const scoreDiff = node.hand.isSoft ? 11 :
                21 - node.hand.score;
            const maxCard = scoreDiff === 11 ? FaceValue.Ace
                : scoreDiff === 10 ? FaceValue.King
                    : scoreDiff - 1;
            for (var y = 0; y <= maxCard; y++) {
                let i: FaceValue;
                if (scoreDiff === 11 && y === 0) {
                    // pick up aces at the end
                    continue;
                } else if (y === 0) {
                    i = FaceValue.Ace;
                } else {
                    i = y - 1; //y==1 for start, twos are zero.
                }
                const cardCount = this._deck.cardCounts[i];
                if (!cardCount) {
                    continue;
                }
                const newNode: ScoreTrieNode = {
                    hand: node.hand.clone(),
                    hands: node.hands,
                    odds: cardCount / this._deck.totalCount * node.odds,
                    operation: MoveType.Hit,
                    children: {} as any,
                }
                node.children[i] = newNode;
                newNode.hand.addCard({
                    faceValue: i,
                    suite: Suite.Clubs // who cares
                }, true);
                this._deck.cardCounts[i] = cardCount - 1;
                this.calcNodeOdds(newNode, options);
                this._deck.cardCounts[i] = cardCount;
            }
        }
    }

}