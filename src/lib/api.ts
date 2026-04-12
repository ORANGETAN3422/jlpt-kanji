import type { jlptKanjiResponse, kanjiInfo, kanjiWord } from '$lib/types.js';

const kanjiEndpoint = 'https://kanjiapi.dev/v1/kanji/'
const wordEndpoint = 'https://kanjiapi.dev/v1/words/'

export async function getJlptKanji({ slug, fetch }: { slug: string, fetch: typeof globalThis.fetch }): Promise<jlptKanjiResponse> {
    try {
        const res = await fetch(`${kanjiEndpoint}${slug}`);
        return await res.json();
    } catch (e) {
        throw new Error(`Failed to fetch list for "${slug}": ${e}`, {
            cause: e
        });
    }
}

export async function getKanjiWords({ kanji, fetch }: { kanji: string, fetch: typeof globalThis.fetch }): Promise<kanjiWord[]> {
    try {
        const res = await fetch(`${wordEndpoint}${kanji}`);
        const words: kanjiWord[] = await res.json();
        const topPriorities = new Set(['news1', 'ichi1', 'spec1', 'news2', 'ichi2', 'spec2']);
        return words.filter(word =>
            word.variants.some(v =>
                v.written.includes(kanji) &&
                v.priorities.length > 0 && v.priorities.every(p => topPriorities.has(p))
            )
        );
    } catch (e) {
        throw new Error(`Failed to fetch words for kanji "${kanji}": ${e}`, { cause: e });
    }
}

export async function getKanjiInfo({ kanji, fetch }: { kanji: string, fetch: typeof globalThis.fetch }): Promise<kanjiInfo> {
    try {
        const res = await fetch(`${kanjiEndpoint}${kanji}`);
        return await res.json();
    } catch (e) {
        throw new Error(`Failed to fetch info for kanji "${kanji}": ${e}`, {
            cause: e
        });
    }
}