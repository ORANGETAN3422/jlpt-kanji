<script lang="ts">
	import type { kanjiInfo, vocabWord } from '$lib/types';
	import { page } from '$app/state';

	let { data }: { data: kanjiInfo } = $props();

	const matches = $derived(
		((page.data.vocab as vocabWord[]) ?? []).filter((w) => w.word.includes(data.kanji)).reverse()
	);

	function jlptClass(level: number): string {
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
				return 'bg-[#187fc2]/60';
			default:
				return 'bg-slate-600/60';
		}
	}
</script>

{#if matches.length > 0}
	<div class="mt-4">
		<h2 class="mb-2 font-medium text-white">
			<b>Words including <span class="japanese">"{data.kanji}"</span></b>
			<span class=" text-slate-500">{'(' + matches.length + ' found)'}</span>
		</h2>
		<div class="flex flex-col gap-2">
			{#each matches as word (word.word + word.furigana)}
				<div
					class="flex items-center justify-between gap-4 rounded-lg border border-amber-300/10 bg-slate-700/50 px-4 py-3"
				>
					<div class="flex flex-col gap-0.5">
						<div class="flex items-baseline gap-2">
							<a
								href={`https://jisho.org/word/${word.word}`}
								target="_blank"
								class="japanese group flex items-center gap-1 text-lg text-white"
							>
								{word.word}
								<svg
									class="h-3 w-3 shrink-0 text-slate-500 transition-colors group-hover:text-slate-300"
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
							<span class="japanese text-sm text-slate-400">{word.furigana}</span>
						</div>
						<p class="text-xs text-slate-400">{word.meaning}</p>
					</div>
					<span class="shrink-0 rounded-2xl px-2.5 text-xs text-slate-300 {jlptClass(word.level)}"
						>N{word.level}</span
					>
				</div>
			{/each}
		</div>
	</div>
{/if}
