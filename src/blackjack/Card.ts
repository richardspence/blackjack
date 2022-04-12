export interface Card {
    faceValue: FaceValue;
    suite: Suite,

}


export enum FaceValue {
    Two,
    Three,
    Four,
    Five,
    Six,
    Seven,
    Eight,
    Nine,
    Ten,
    Jack,
    Queen,
    King,
    Ace
}



export enum Suite {
    Spades,
    Clubs,
    Hearts,
    Diamonds,
}
