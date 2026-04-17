export interface jlptKanjiResponse {
	slug: string;
	kanji: string[];
}

export interface homepageData {
	jlpt1: string[];
	jlpt2: string[];
	jlpt3: string[];
	jlpt4: string[];
	jlpt5: string[];
}

export interface vocabWord {
	word: string;
	meaning: string;
	furigana: string;
	romaji: string;
	level: number;
}

export interface kanjiWordVariant {
	written: string;
	pronounced: string;
	priorities: string[];
}

export interface kanjiWord {
	meanings: {
		glosses: string[];
	}[];
	variants: kanjiWordVariant[];
}

export interface kanjiInfo {
	freq_mainichi_shinbun: number;
	grade: number;
	heisig_en: string;
	jlpt: number;
	kanji: string;
	kun_readings: string[];
	meanings: string[];
	name_readings: string[];
	notes: string[];
	on_readings: string[];
	stroke_count: number;
	unicode: string;
}
