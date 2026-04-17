import { getJlptKanji } from '$lib/api.js';

export const prerender = true;

export const load = async ({ params }) => {
	const kanji = await getJlptKanji({ slug: params.slug, fetch });

	return {
		slug: params.slug,
		kanji
	};
};
