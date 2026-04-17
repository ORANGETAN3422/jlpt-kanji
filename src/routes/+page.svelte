<script lang="ts">
	import { getLearnedKanji } from '$lib/storage';
	import { resolve } from '$app/paths';
	import type { homepageData } from '$lib/types';

	let { data }: { data: homepageData } = $props();
	let learned = $state<string[]>([]);

	$effect(() => {
		learned = getLearnedKanji();
	});

	const levels = $derived(
		[
			{ n: 5, kanji: data.jlpt5 ?? [] },
			{ n: 4, kanji: data.jlpt4 ?? [] },
			{ n: 3, kanji: data.jlpt3 ?? [] },
			{ n: 2, kanji: data.jlpt2 ?? [] },
			{ n: 1, kanji: data.jlpt1 ?? [] }
		].map((l) => ({
			...l,
			learned: l.kanji.filter((k) => learned.includes(k)).length,
			pct:
				l.kanji.length > 0
					? Math.round((l.kanji.filter((k) => learned.includes(k)).length / l.kanji.length) * 100)
					: 0
		}))
	);

	const total = $derived({
		all: levels.reduce((s, l) => s + l.kanji.length, 0),
		learned: levels.reduce((s, l) => s + l.learned, 0)
	});

	let importCode = $state('');
	let importOpen = $state(false);
	let copyLabel = $state('Export');

	function exportData() {
		const code = btoa(encodeURIComponent(JSON.stringify(getLearnedKanji())));
		navigator.clipboard.writeText(code);
		copyLabel = 'Copied!';
		setTimeout(() => (copyLabel = 'Export'), 2000);
	}

	function importData() {
		try {
			const kanji: string[] = JSON.parse(decodeURIComponent(atob(importCode.trim())));
			if (!Array.isArray(kanji)) throw new Error();
			localStorage.setItem('learnedKanji', JSON.stringify(kanji));
			learned = kanji;
			importCode = '';
			importOpen = false;
		} catch {
			importCode = '';
		}
	}

	function jlptColour(n: number): string {
		switch (n) {
			case 1:
				return '#00b197';
			case 2:
				return '#ff7b05';
			case 3:
				return '#8b6ca8';
			case 4:
				return '#ec6d64';
			case 5:
				return '#187fc2';
			default:
				return '#64748b';
		}
	}
</script>

<div class="mx-auto max-w-2xl py-8">
	<div class="mb-10 flex items-start justify-between">
		<div>
			<h1 class="mb-2 text-3xl font-semibold tracking-widest text-amber-300/80 uppercase">
				JLPT Kanji
			</h1>
			<p class="text-sm text-slate-400">Track your kanji progress across all JLPT levels.</p>
		</div>
		<div class="mt-1 flex flex-col items-end gap-2">
			<div class="flex gap-2">
				<button
					onclick={exportData}
					class="rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:border-amber-300/40 hover:text-slate-100"
					>{copyLabel}</button
				>
				<button
					onclick={() => (importOpen = !importOpen)}
					class="rounded-lg border px-3 py-1.5 text-xs transition-colors {importOpen
						? 'border-amber-400/60 bg-amber-600/20 text-amber-300'
						: 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-amber-300/40 hover:text-slate-100'}"
					>Import</button
				>
			</div>
			{#if importOpen}
				<div class="flex gap-2">
					<input
						bind:value={importCode}
						placeholder="Paste code…"
						class="w-48 rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-xs text-slate-300 placeholder-slate-600 focus:border-amber-300/40 focus:outline-none"
						onkeydown={(e) => e.key === 'Enter' && importData()}
					/>
					<button
						onclick={importData}
						disabled={!importCode.trim()}
						class="rounded-lg border border-amber-400/40 bg-amber-600/20 px-3 py-1.5 text-xs text-amber-300 transition-colors hover:border-amber-400/70 disabled:cursor-not-allowed disabled:opacity-30"
						>Apply</button
					>
				</div>
			{/if}
		</div>
	</div>

	<!-- total -->
	<div class="mb-6 rounded-xl border border-amber-300/20 bg-slate-700/50 p-6">
		<div class="mb-3 flex items-end justify-between">
			<span class="font-medium text-white">Total Progress</span>
			<span class="text-sm text-slate-400">{total.learned} / {total.all}</span>
		</div>
		<div class="flex h-2 overflow-hidden rounded-full bg-slate-600/60">
			{#each levels as level (level.n)}
				{#if level.learned > 0}
					<div
						class="h-full transition-all"
						style="width: {(level.learned / total.all) * 100}%; background-color: {jlptColour(
							level.n
						)};"
					></div>
				{/if}
			{/each}
		</div>
		<p class="mt-2 text-xs text-amber-300/60">
			{Math.round((total.learned / total.all) * 100)}% complete
		</p>
	</div>

	<!-- per jlpt -->
	<div class="flex flex-col gap-3">
		{#each levels as level (level.n)}
			<a
				href={resolve(`/jlpt-${level.n}`)}
				class="block rounded-xl border bg-slate-700/50 p-5 transition-colors"
				style="border-color: {jlptColour(level.n)}33;"
				onmouseenter={(e) =>
					((e.currentTarget as HTMLElement).style.borderColor = jlptColour(level.n) + '66')}
				onmouseleave={(e) =>
					((e.currentTarget as HTMLElement).style.borderColor = jlptColour(level.n) + '33')}
			>
				<div class="mb-3 flex items-end justify-between">
					<div class="flex items-center gap-3">
						<span class="text-lg font-semibold tracking-wider" style="color: {jlptColour(level.n)};"
							>N{level.n}</span
						>
						<span class="text-xs text-slate-500">{level.kanji.length} kanji</span>
					</div>
					<span class="text-sm text-slate-400">{level.learned} / {level.kanji.length}</span>
				</div>
				<div class="h-1.5 overflow-hidden rounded-full bg-slate-600/60">
					<div
						class="h-full rounded-full transition-all"
						style="width: {level.pct}%; background-color: {jlptColour(level.n)};"
					></div>
				</div>
				<p class="mt-2 text-xs" style="color: {jlptColour(level.n)}99;">{level.pct}% learned</p>
			</a>
		{/each}
	</div>
</div>

<p class="text-sm text-slate-500">
	Powered by
	<a href="https://kanjiapi.dev/" target="_blank" class="text-sky-500 underline">kanjiapi.dev</a>,
	<a href="https://jlpt-vocab-api.vercel.app/" target="_blank" class="text-sky-500 underline"
		>JLPT Vocabulary API</a
	>
	and <a href="https://jisho.org" target="_blank" class="text-sky-500 underline">Jisho</a>.
</p>
<p class="text-sm text-slate-500">
	Built with
	<a href="https://svelte.dev" target="_blank" class="text-sky-500 underline">Svelte</a>,
	<a href="https://svelte.dev" target="_blank" class="text-sky-500 underline">SvelteKit</a>
	and
	<a href="https://tailwindcss.com" target="_blank" class="text-sky-500 underline">tailwindcss</a>.
</p>
