import { Card, FaceValue, Suite } from "../blackjack/game";

export interface ICard {
    suit: UISuite;
    rank: UIValue
    backColor: '#1A1919',
    color: string;
}

enum UISuite{
    Clubs = 'C',
    Diamonds = 'D',
    Hearts = 'H',
    Spades = 'S'
}

enum UIValue {
    Ace = 'A',
    King = 'K',
    Queen = 'Q',
    Jack = 'J',
    Ten = '10',
    Nine = '9',
    Eight = '8',
    Seven = '7',
    Six = '6',
    Five = '5',
    Four = '4',
    Three = '3',
    Two = '2',
}

export function toUiCard(card: Card): ICard {
    const suiteKey = Suite[card.suite] as  keyof UISuite;
    const suit: UISuite = (UISuite as any)[suiteKey];
   const faceValue: UIValue = (UIValue as any)[FaceValue[card.faceValue]]; 
    return {
        backColor: '#1A1919',
        color: suit === UISuite.Diamonds || suit === UISuite.Hearts ? `#D33E43` : `#1A1919`,
        rank: faceValue,
        suit
    };
}