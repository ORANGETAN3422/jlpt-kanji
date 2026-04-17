export function getLearnedKanji() {
	if (typeof window === 'undefined') return [];
	const stored = localStorage.getItem('learnedKanji');
	return stored ? (JSON.parse(stored) as string[]) : [];
}

export function addToLearnedKanji(kanji: string) {
	const learned = getLearnedKanji();
	if (!learned.includes(kanji)) {
		learned.push(kanji);
		localStorage.setItem('learnedKanji', JSON.stringify(learned));
	}
}

export function removeFromLearnedKanji(kanji: string) {
	const learned = getLearnedKanji();
	const index = learned.indexOf(kanji);
	if (index !== -1) {
		learned.splice(index, 1);
		localStorage.setItem('learnedKanji', JSON.stringify(learned));
	}
}
