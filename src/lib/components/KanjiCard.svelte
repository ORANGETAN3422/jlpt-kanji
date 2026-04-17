<script lang="ts">
	import type { kanjiInfo } from '$lib/types';
	import { addToLearnedKanji, removeFromLearnedKanji, getLearnedKanji } from '$lib/storage';

	let { data }: { data: kanjiInfo } = $props();

	let learned = $state(false);

	$effect(() => {
		learned = getLearnedKanji().includes(data.kanji);
	});

	function toggleLearned() {
		if (!learned) {
			addToLearnedKanji(data.kanji);
			learned = true;
		} else {
			removeFromLearnedKanji(data.kanji);
			learned = false;
		}
	}

	function gradeLabel(grade: number | null): string {
		if (grade === null) return 'Non-Jōyō';
		if (grade <= 6) return `Grade ${grade}`;
		if (grade === 8) return 'Junior High (Jōyō)';
		if (grade === 9) return 'Jinmeiyō';
		return `Grade ${grade}`;
	}

	function gradeClass(grade: number | null): string {
		if (grade === null) return 'bg-[#5a5a6e]/60';
		if (grade <= 6) return 'bg-[#4a7c59]/60';
		if (grade === 8) return 'bg-[#4a6fa5]/60';
		if (grade === 9) return 'bg-[#7c5c8a]/60';
		return 'bg-[#5a5a6e]/60';
	}

	const codepoint = $derived(data.kanji.codePointAt(0)?.toString(16).padStart(5, '0'));

	let svgContent = $state('');
	let svgContainer: HTMLDivElement | undefined = $state();
	let animating = $state(false);

	$effect(() => {
		if (codepoint) {
			svgContent = '';
			fetch(`https://cdn.jsdelivr.net/gh/KanjiVG/kanjivg/kanji/${codepoint}.svg`)
				.then((r) => r.text())
				.then(
					(svg) =>
						(svgContent = svg
							.replace(/<\?xml[^?]*\?>/g, '')
							.replace(/<!DOCTYPE[^[]*(\[[^\]]*\])?\s*>/g, ''))
				);
		}
	});

	function animate() {
		if (!svgContainer || animating) return;
		animating = true;

		const paths = svgContainer.querySelectorAll<SVGPathElement>('path');
		const texts = svgContainer.querySelectorAll<SVGTextElement>('text');
		const STROKE_DURATION = 0.5;

		texts.forEach((text) => {
			text.style.opacity = '0';
			text.style.transition = 'none';
		});

		paths.forEach((path, i) => {
			const length = path.getTotalLength();
			path.style.strokeDasharray = `${length}`;
			path.style.strokeDashoffset = `${length}`;
			path.style.transition = 'none';

			const text = texts[i];

			requestAnimationFrame(() =>
				requestAnimationFrame(() => {
					if (text) {
						text.style.transition = `opacity 0.1s ease ${i * STROKE_DURATION}s`;
						text.style.opacity = '1';
					}

					path.style.transition = `stroke-dashoffset ${STROKE_DURATION}s ease ${i * STROKE_DURATION}s`;
					path.style.strokeDashoffset = '0';
				})
			);
		});

		setTimeout(() => (animating = false), paths.length * STROKE_DURATION * 1000);
	}

	function reset() {
		if (!svgContainer) return;
		animating = false;
		const paths = svgContainer.querySelectorAll<SVGPathElement>('path');
		const texts = svgContainer.querySelectorAll<SVGTextElement>('text');
		paths.forEach((path) => {
			path.style.transition = 'none';
			path.style.strokeDashoffset = '';
			path.style.strokeDasharray = '';
		});
		texts.forEach((text) => {
			text.style.transition = 'none';
			text.style.opacity = '';
		});
	}

	function jlptClass(level: number | null): string {
		switch (level) {
			case 1:
				return 'bg-[#00b197]/60';
			case 2:
				return 'bg-[#ff7b05]/60';
			case 3:
				return 'bg-[#8b6ca8]/60';
			case 4:
				return 'bg-[#ec6d64]/60';
			case 5:
				return 'bg-[#187fc2]/60 ';
			default:
				return 'bg-slate-600/60';
		}
	}
</script>

<div class="mt-6 flex items-start gap-6 rounded-xl border border-amber-300/20 bg-slate-700/50 p-6">
	<div class="flex shrink-0 flex-col items-center gap-2">
		<a
			href={`https://jisho.org/search/${data.kanji}%23kanji`}
			target="_blank"
			class="japanese group flex items-start gap-1 text-7xl leading-none text-white"
		>
			{data.kanji}
			<svg
				class="mt-1 h-4 w-4 shrink-0 text-slate-600 transition-colors group-hover:text-slate-300"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
			>
				<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
				<polyline points="15 3 21 3 21 9" />
				<line x1="10" y1="14" x2="21" y2="3" />
			</svg>
		</a>
		<span class="japanese text-xs text-slate-500">#{data.freq_mainichi_shinbun} 毎日新聞</span>
	</div>
	<div class="flex flex-1 flex-col gap-2 text-sm">
		<p class="font-medium text-white">{data.meanings.join(', ')}</p>
		<p class="text-slate-400">
			On: <span class="text-slate-200">{data.on_readings.join('、')}</span>
		</p>
		<p class="text-slate-400">
			Kun: <span class="text-slate-200">{data.kun_readings.join('、')}</span>
		</p>
		<div class="mt-1 flex flex-wrap gap-2 text-xs">
			<span class="rounded-2xl px-2.5 text-slate-300 {jlptClass(data.jlpt)}">JLPT N{data.jlpt}</span
			>
			<span class="rounded-2xl px-2.5 text-slate-300 {gradeClass(data.grade)}"
				>{gradeLabel(data.grade)}</span
			>
			<span class="rounded-2xl bg-[#7a5c3a]/60 px-2.5 text-slate-300"
				>{data.stroke_count} strokes</span
			>
		</div>
		<button
			onclick={toggleLearned}
			class="mt-2 rounded-lg border px-3 py-1 text-xs transition-colors {learned
				? 'border-emerald-500/60 bg-emerald-900/40 text-emerald-300 hover:border-emerald-400'
				: 'border-slate-500 bg-slate-700/50 text-slate-300 hover:border-amber-300/60'}"
			>{learned ? '✓ Remove from learned' : '+ Mark as learned'}</button
		>
	</div>
	<div class="flex shrink-0 flex-col items-center gap-2">
		<div class="relative h-28 w-28 border border-amber-300/20">
			<!-- grid lines -->
			<div
				class="absolute inset-0 border-r border-b border-amber-300/20"
				style="width: 50%; height: 50%;"
			></div>
			<div
				class="absolute inset-0 border-b border-l border-amber-300/20"
				style="left: 50%; width: 50%; height: 50%;"
			></div>
			<div
				class="absolute border-t border-r border-amber-300/20"
				style="width: 50%; height: 50%; top: 50%;"
			></div>
			<div
				class="absolute border-t border-l border-amber-300/20"
				style="left: 50%; width: 50%; height: 50%; top: 50%;"
			></div>
			{#if svgContent}
				<div class="svg-stroke-order absolute inset-0 h-full w-full p-1" bind:this={svgContainer}>
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html svgContent}
				</div>
			{/if}
		</div>
		<div class="flex gap-2">
			<button
				onclick={animate}
				disabled={animating || !svgContent}
				class="rounded-lg border border-amber-300/40 bg-slate-700/50 px-2.5 py-1 text-xs text-amber-300/80 transition-colors hover:border-amber-300/80 disabled:cursor-not-allowed disabled:opacity-30"
				>▶ Play</button
			>
			<button
				onclick={reset}
				disabled={!svgContent}
				class="rounded-lg border border-slate-500 bg-slate-700/50 px-2.5 py-1 text-xs text-slate-400 transition-colors hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-30"
				>↺ Reset</button
			>
		</div>
	</div>
</div>
