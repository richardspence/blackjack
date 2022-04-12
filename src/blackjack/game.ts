import { inherits } from "util";
import { threadId } from "worker_threads";
import { assert } from "../util/assert";
import { FaceValue } from "./Card";
import { Deck } from "./Deck";
import { Hand, HandStatus } from "./Hand";
import { Player } from "./Player";

export interface GameRules {
    numDecks: number;
    lateSurrender: boolean;
    insurance: boolean;
    cut: number;
    resplitAces: boolean;
}
// export enum SuiteSymbol {
//     Spades = "♠️",
//     Clubs = "♣️",
//     Hearts = "♥️",
//     Diamonds = "♦️",
// }


const defaultRules: GameRules = {
    numDecks: 6,
    lateSurrender: true,
    insurance: false,
    cut: 1.5,
    resplitAces: true,
};








export enum GameStatus {
    bet,
    play,
    end
}

export enum FinalStatus {
    Lost,
    Surrendered,
    Tied,
    Won,
}

export interface HandResults {
    won: FinalStatus;
    winnings: number;
    totalReturn: number;
    message: string;
}

export interface GameOptions {
    preferSplit: boolean;
    preferSoft: boolean;
}

export class Game {
    rules: GameRules;
    options: Partial<GameOptions> = {};
    dealer: Hand;
    player!: Player;
    deck!: Deck;
    public get deckProgress() {
        const zero = this.rules.cut * 52;
        const max = this.rules.numDecks * 52;
        const val = ((this.deck.cardsLeft - zero) / (max - zero)) * 100;
        return Math.max(0, val);
    }

    get isPlaying() {
        return this.player.isPlaying;
    }

    get canHit() {
        return this.isPlaying && !this.player.hands.isSplitAces;
    }

    get canDouble() {
        return this.isPlaying && this.player.primaryHand?.hasTwoCards
            && !this.player.hands.isSplitAces;
    }

    get canSurrender() {
        return this.isPlaying && this.player.primaryHand?.hasTwoCards
            && !this.player.primaryHand.isSplit;
    }

    get canSplit() {
        return this.isPlaying && this.player.hands.canSplit();
    }

    constructor(ruleSet: Partial<GameRules> = {}) {
        this.rules = {
            ...defaultRules,
            ...ruleSet
        };
        this.init();
        this.dealer = new Hand(this.deck!, 0);
        this.player = new Player(this);
    }

    init() {
        this.deck = new Deck(this.rules.numDecks);
        this.deck.shuffle();
    }

    reshuffleIfRequired() {
        if (this.deck.decksLeft < this.rules.cut) {
            this.deck.shuffle();
            this.lastMessage += '; New Shuffle';
        }
    }

    start() {
        assert(this.player.primaryHand?.cards.length === 0);
        this.dealer = new Hand(this.deck, 0);
        this.reshuffleIfRequired();
        this.player.hit();
        this.dealer.hit();
        this.player.hit();
        this.dealer.hit(false);

        if (!this.rules.insurance || !this.isInsurance) {
            this.checkEnd();
        }
    }

    get isInsurance() {
        return this.dealer.cards[0].card.faceValue === FaceValue.Ace;
    }

    checkEnd() {
        if (!this.isPlaying) {
            this.end();
        }
        if (this.dealer.status === HandStatus.Blackjack) {
            this.end();
        }
    }

    public lastMessage: string = '';

    public lastResult?: HandResults[];

    playDealer() {
        const playerSurrender = this.player.hands.hands.every(p => {
            return p.status === HandStatus.Surrender;
        });

        if (playerSurrender) {
            return;
        }

        const dealerNeedsPlay = this.player.hands.hands.some(p => {
            return p.status === HandStatus.Stand
                || p.status === HandStatus.TwentyOne;
        });
        this.dealer.cards[1].shown = true;

        if (dealerNeedsPlay) {
            while (this.dealer.score < 17) {
                this.dealer.hit();
            }
        }
    }

    end() {
        this.playDealer();
        this.lastMessage = '';
        const results = this.player.hands.hands.map((hand, i) => {
            this.lastMessage += `\nHand ${i + 1}\n`;
            return this.finalScoreHand(hand);
        });


        this.lastResult = results;
        this.lastMessage += `\nReturn:${results.reduce((l, r) => l + r.totalReturn, 0)}`;
    }

    finalScoreHand(playerHand: Hand): HandResults {
        let result: {
            won: FinalStatus,
            winnings: number;
            totalReturn: number;
        } = {
            won: FinalStatus.Lost,
            winnings: 0,
            totalReturn: 0
        };
        let message = '';
        if (this.dealer.status === HandStatus.Blackjack
            && playerHand.status !== HandStatus.Blackjack) {
            message = `Dealer blackjacked`;
            playerHand.stand();
        } else if (playerHand.status !== HandStatus.Surrender &&
            playerHand.status !== HandStatus.Bust) {
            if (playerHand.status === HandStatus.Blackjack
                && this.dealer.status !== HandStatus.Blackjack) {
                message = 'Blackjack!';
                result = {
                    ...this.player.settleBet(),
                    won: FinalStatus.Won,
                };
            } else if (playerHand.score > this.dealer.score) {
                result = {
                    ...this.player.settleBet(),
                    won: FinalStatus.Won,
                };
                message = `You won high score ${playerHand.score} vs ${this.dealer.score}`;
            } else if (this.dealer.status === HandStatus.Bust) {
                message = `Dealer busted ${this.dealer.score}`;
                result = {
                    ...this.player.settleBet(),
                    won: FinalStatus.Won,
                };
            } else {
                if (playerHand.score === this.dealer.score) {
                    // push
                    message = `Score tied with ${playerHand.score}`;
                    result = {
                        ...this.player.settleBet(true),
                        won: FinalStatus.Tied,
                    };
                } else {
                    message = `Dealer won with ${this.dealer.score}`;
                }
            }

        } else if (playerHand.status === HandStatus.Surrender) {
            message = `You surrendered`;
            result = {
                ...this.player.settleBet(),
                won: FinalStatus.Surrendered,
            };
        } else if (playerHand.status === HandStatus.Bust) {
            message = `You busted with ${playerHand.score}`;
        }

        this.lastMessage += `\n${message}`;
        return {
            ...result,
            message
        };
    }

}