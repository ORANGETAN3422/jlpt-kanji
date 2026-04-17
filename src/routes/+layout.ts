import type { vocabWord } from '$lib/types.js';

export const load = async ({ fetch }) => {
	const results = await Promise.all(
		[1, 2, 3, 4, 5].map((level) =>
			fetch(`https://jlpt-vocab-api.vercel.app/api/words?level=${level}&limit=5000`)
				.then((r) => r.json())
				.then((d: { words: vocabWord[] }) => d.words)
		)
	);

	return {
		vocab: results.flat() as vocabWord[]
	};
};
