import { getJlptKanji } from '$lib/api.js';
import type { jlptKanjiResponse } from '$lib/types.js';

export const prerender = true;

export const load = async ({ fetch }) => {
	const jlpt1: jlptKanjiResponse = await getJlptKanji({ slug: 'jlpt-1', fetch });
	const jlpt2: jlptKanjiResponse = await getJlptKanji({ slug: 'jlpt-2', fetch });
	const jlpt3: jlptKanjiResponse = await getJlptKanji({ slug: 'jlpt-3', fetch });
	const jlpt4: jlptKanjiResponse = await getJlptKanji({ slug: 'jlpt-4', fetch });
	const jlpt5: jlptKanjiResponse = await getJlptKanji({ slug: 'jlpt-5', fetch });

	const obj = {
		jlpt1,
		jlpt2,
		jlpt3,
		jlpt4,
		jlpt5
	};

	return obj;
};
