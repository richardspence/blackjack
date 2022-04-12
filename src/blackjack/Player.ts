import { assert } from "../util/assert";
import { ChipsTotal } from "./ChipsTotal";
import { Game } from "./game";
import { HandStatus } from "./Hand";
import { HandCollection } from "./HandCollection";

export class Player {
    splitHand() {
        this.chipsTotal.subtract(this.primaryHand.bet, 'Splitting hands');
        this.hands.splitHand();
        this.game.checkEnd();
    }
    doubleDown() {
        this.chipsTotal.subtract(this.primaryHand.bet, 'Double');
        this.primaryHand?.doubleDown();
    }

    public hands: HandCollection;

    public get primaryHand() {
        return this.hands.primaryHand;
    }
    public get isPlaying() {
        return this.primaryHand && this.primaryHand.cards.length > 0
            && this.primaryHand?.status === HandStatus.Playing;
    }

    public chipsTotal = new ChipsTotal();
    constructor(private game: Game) {
        this.chipsTotal.add(1000, 'Initial');
        this.hands = new HandCollection(this.game.deck);

    }
    public play(bet: number) {
        // reinitialize
        this.hands = new HandCollection(this.game.deck);
        this.hands.addHand(bet);
        this.chipsTotal.subtract(bet, 'Initial bet');
    }

    public hit() {
        if(this.hands.hands.length === 1
            && this.primaryHand.cards.length === 1){
            if(this.game.options.preferSplit && this.primaryHand.addPair()){
                return;
            }
            if(this.game.options.preferSoft 
                && !this.primaryHand.isSoft 
                && this.primaryHand.score !== 10
                && this.primaryHand.addAce()){
                return;
            }
        }
        this.primaryHand?.hit();
    }

    public surrender() {
        this.primaryHand!.surrender();
    }

    public settleBet(isPush = false) {
        assert(this.primaryHand);
        let winnings = 0;
        let totalReturn = 0;
        const bet = this.primaryHand.bet;
        if (this.primaryHand.status === HandStatus.Blackjack) {
            winnings = bet * 1.5;
            totalReturn = bet + winnings;
        } else if (this.primaryHand.status === HandStatus.Surrender) {
            totalReturn = bet / 2;
        } else if (!isPush) {
            winnings = bet;
            totalReturn = 2 * winnings;
        } else {
            // push
            totalReturn = bet;
        }

        this.chipsTotal.add(totalReturn, 'Added Winnings');
        return { winnings, totalReturn };
    }
}