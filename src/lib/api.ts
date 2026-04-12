import type { jlptKanjiResponse, kanjiInfo } from '$lib/types.js';

const jlptKanjiEndpoint = 'https://kanjiapi.dev/v1/kanji/'
const kanjiInfoEndpoint = 'https://kanjiapi.dev/v1/kanji/'

export async function getJlptKanji({ slug, fetch }: { slug: string, fetch: typeof globalThis.fetch }): Promise<jlptKanjiResponse> {
    try {
        const res = await fetch(`${jlptKanjiEndpoint}${slug}`);
        return await res.json();
    } catch (e) {
        throw new Error(`Failed to fetch list for "${slug}": ${e}`, {
            cause: e
        });
    }
}

export async function getKanjiInfo({ kanji, fetch }: { kanji: string, fetch: typeof globalThis.fetch }): Promise<kanjiInfo> {
    try {
        const res = await fetch(`${kanjiInfoEndpoint}${kanji}`);
        return await res.json();
    } catch (e) {
        throw new Error(`Failed to fetch info for kanji "${kanji}": ${e}`, {
            cause: e
        });
    }
}