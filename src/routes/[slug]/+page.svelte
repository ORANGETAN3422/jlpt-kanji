<script lang="ts">
	import KanjiCard from '$lib/components/KanjiCard.svelte';
	import KanjiWords from '$lib/components/KanjiWords.svelte';
	import Flashcard from '$lib/components/Flashcard.svelte';

	import type { jlptKanjiResponse, kanjiInfo } from '$lib/types';
	import { getLearnedKanji } from '$lib/storage';
	import { getKanjiInfo } from '$lib/api';
	import { replaceState } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';

	const { data }: { data: jlptKanjiResponse } = $props();

	let currentKanji: kanjiInfo | null = $state(null);
	let selectedKanji: string | null = $state(null);
	let loadingKanji = $state(false);
	let cached: kanjiInfo[] = [];

	let containerWidth = $state(0);
	let currentPage = $state(0);
	let hideLearned = $state(false);
	let flashcardOpen = $state(false);

	const CARD_WIDTH = 52;
	const TARGET_ROWS = 8;

	const filteredKanji = $derived(
		hideLearned
			? (data.kanji ?? []).filter((k) => !getLearnedKanji().includes(k))
			: (data.kanji ?? [])
	);
	const pageSize = $derived(Math.max(1, Math.floor(containerWidth / CARD_WIDTH)) * TARGET_ROWS);
	const totalPages = $derived(Math.ceil(filteredKanji.length / pageSize));
	const visibleKanji = $derived(
		filteredKanji.slice(currentPage * pageSize, (currentPage + 1) * pageSize)
	);

	$effect(() => {
		const initial = page.url.searchParams.get('kanji');
		if (initial) getInfo(initial, false);
		else getInfo(data.kanji[0], true);
	});

	function navigate(dir: 1 | -1) {
		const index = filteredKanji.indexOf(selectedKanji ?? '');
		if (index === -1) return;
		const next = (index + dir + filteredKanji.length) % filteredKanji.length;
		currentPage = Math.floor(next / pageSize);
		getInfo(filteredKanji[next]);
	}

	async function getInfo(kanji: string, updateUrl = true) {
		try {
			loadingKanji = true;
			selectedKanji = kanji;
			if (cached.find((k) => k.kanji === kanji)) {
				loadingKanji = false;
				currentKanji = cached.find((k) => k.kanji === kanji) || null;
				return;
			}

			const info = await getKanjiInfo({ kanji, fetch });
			cached.push(info);
			loadingKanji = false;
			currentKanji = info;
			if (updateUrl) replaceState(resolve(`/${data.slug}?kanji=${kanji}`), {});
		} catch (e) {
			console.error(e);
		}
	}
</script>

<svelte:window
	onkeydown={(e) => {
		if (e.key === 'ArrowLeft') navigate(-1);
		else if (e.key === 'ArrowRight') navigate(1);
	}}
/>

<svelte:head>
	<title
		>{data.slug.slice(0, 4).toUpperCase() + ' N' + data.slug.slice(data.slug.length - 1)} Kanji — JLPT
		Kanji</title
	>
	<meta
		property="og:title"
		content="{data.slug.slice(0, 4).toUpperCase() +
			' N' +
			data.slug.slice(data.slug.length - 1)} Kanji"
	/>
</svelte:head>

<div class="flex items-center gap-4 pb-2">
	<p class="text-amber-500"><b>{filteredKanji.length} kanji</b></p>
	<button
		onclick={() => {
			hideLearned = !hideLearned;
			currentPage = 0;
		}}
		class="rounded-lg border px-2.5 py-1 text-xs transition-colors {!hideLearned
			? 'border-slate-500 bg-slate-700/50 text-slate-400 hover:border-slate-300'
			: 'border-sky-700/60 bg-sky-900/40 text-sky-400 hover:border-sky-600'}"
		>{hideLearned ? 'Show learned' : 'Hide learned'}</button
	>
	<button
		onclick={() => (flashcardOpen = true)}
		class="rounded-lg border border-amber-500/40 bg-amber-600/20 px-2.5 py-1 text-xs text-amber-300 transition-colors hover:border-amber-400/70 hover:bg-amber-600/30"
		>Flashcards</button
	>
</div>

{#if flashcardOpen}
	<Flashcard kanjiList={data.kanji} onClose={() => (flashcardOpen = false)} />
{/if}
<div class="flex flex-wrap gap-2" bind:clientWidth={containerWidth}>
	{#each visibleKanji as k: string (k)}
		<button
			onclick={() => getInfo(k)}
			class="japanese cursor-default rounded-lg border px-2.5 py-2.5 text-xl text-white transition-all hover:border-amber-300/90 hover:shadow-[0_0_8px_rgba(252,191,73,0.2)]
            {selectedKanji === k
				? 'border-amber-600/60 bg-amber-600'
				: getLearnedKanji().includes(k)
					? 'border-emerald-400/60 bg-emerald-500/60'
					: 'border-amber-600/60 bg-slate-700/50'}"
			class:border-amber-300={selectedKanji === k}
			class:shadow-[0_0_8px_rgba(252,191,73,0.3)]={selectedKanji === k}>{k}</button
		>
	{/each}
</div>

{#if totalPages > 1}
	<div class="mt-4 flex items-center gap-3 text-sm text-slate-400">
		<button
			onclick={() => currentPage--}
			disabled={currentPage === 0}
			class="rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-1 transition-colors hover:border-amber-300/60 disabled:cursor-not-allowed disabled:opacity-30"
			>←</button
		>
		<span>{currentPage + 1} / {totalPages}</span>
		<button
			onclick={() => currentPage++}
			disabled={currentPage >= totalPages - 1}
			class="rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-1 transition-colors hover:border-amber-300/60 disabled:cursor-not-allowed disabled:opacity-30"
			>→</button
		>
	</div>
{/if}

{#if loadingKanji}
	<p class="mt-6 text-slate-400">Loading...</p>
{:else if currentKanji}
	<KanjiCard data={currentKanji} />
	<KanjiWords data={currentKanji} />
{/if}
