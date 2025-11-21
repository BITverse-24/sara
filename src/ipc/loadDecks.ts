import { getAllDecksData } from "./database/decks";

export let decks: [ any ];

export const loadDecks = async () => {
    decks = await getAllDecksData();
}

export const getDecks = async () => {
    return decks;
}
