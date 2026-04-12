<script lang="ts">
    import KanjiCard from "$lib/components/KanjiCard.svelte";
    import KanjiWords from "$lib/components/KanjiWords.svelte";

	import type { jlptKanjiResponse, kanjiInfo } from "$lib/types";
    import { getLearnedKanji } from "$lib/storage";
    import { getKanjiInfo } from "$lib/api";
    import { replaceState } from "$app/navigation";
    import { resolve } from "$app/paths";
    import { page } from "$app/state";

    const { data } : { data: jlptKanjiResponse; } = $props();

    let currentKanji: kanjiInfo | null = $state(null);
    let selectedKanji: string | null = $state(null);
    let loadingKanji = $state(false);
    let cached: kanjiInfo[] = []

    let containerWidth = $state(0);
    let currentPage = $state(0);
    let hideLearned = $state(false);

    const CARD_WIDTH = 52;
    const TARGET_ROWS = 8;

    const filteredKanji = $derived(hideLearned ? (data.kanji ?? []).filter(k => !getLearnedKanji().includes(k)) : (data.kanji ?? []));
    const pageSize = $derived(Math.max(1, Math.floor((containerWidth) / (CARD_WIDTH))) * TARGET_ROWS);
    const totalPages = $derived(Math.ceil(filteredKanji.length / pageSize));
    const visibleKanji = $derived(filteredKanji.slice(currentPage * pageSize, (currentPage + 1) * pageSize));

    $effect(() => {
        const initial = page.url.searchParams.get('kanji');
        if (initial) getInfo(initial, false)
        else getInfo(data.kanji[0], true);
    });

    async function getInfo(kanji: string, updateUrl = true) {
        try {
            loadingKanji = true;
            selectedKanji = kanji;
            if (cached.find(k => k.kanji === kanji)) {
                loadingKanji = false;
                currentKanji = cached.find(k => k.kanji === kanji) || null;
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

<svelte:head>
    <title>{data.slug.slice(0, 4).toUpperCase() + ' N' + data.slug.slice(data.slug.length - 1)} Kanji — JLPT Kanji</title>
    <meta property="og:title" content="{data.slug.slice(0, 4).toUpperCase() + ' N' + data.slug.slice(data.slug.length - 1)} Kanji" />
</svelte:head>

<div class="flex items-center gap-4 pb-2">
    <p class="text-amber-500"><b>{filteredKanji.length} kanji</b></p>
    <button
        onclick={() => { hideLearned = !hideLearned; currentPage = 0; }}
        class="text-xs px-2.5 py-1 rounded-lg border transition-colors {!hideLearned
            ? 'bg-slate-700/50 border-slate-500 text-slate-400 hover:border-slate-300'
            : 'bg-sky-900/40 border-sky-700/60 text-sky-400 hover:border-sky-600'}"
    >{hideLearned ? 'Show learned' : 'Hide learned'}</button>
</div>
<div class="flex flex-wrap gap-2" bind:clientWidth={containerWidth}>
{#each visibleKanji as k: string (k)}
    <button
        onclick={() => getInfo(k)}
        class="japanese rounded-lg text-white border px-2.5 py-2.5 text-xl hover:border-amber-300/90 hover:shadow-[0_0_8px_rgba(252,191,73,0.2)] transition-all cursor-default
            {selectedKanji === k ? 'bg-amber-600 border-amber-600/60' : getLearnedKanji().includes(k) ? 'bg-emerald-500/60 border-emerald-400/60' : 'bg-slate-700/50 border-amber-600/60'}"
        class:border-amber-300={selectedKanji === k}
        class:shadow-[0_0_8px_rgba(252,191,73,0.3)]={selectedKanji === k}
    >{k}</button>
{/each}
</div>

{#if totalPages > 1}
<div class="flex items-center gap-3 mt-4 text-sm text-slate-400">
    <button
        onclick={() => currentPage--}
        disabled={currentPage === 0}
        class="px-3 py-1 rounded-lg bg-slate-700/50 border border-slate-600 hover:border-amber-300/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
    >←</button>
    <span>{currentPage + 1} / {totalPages}</span>
    <button
        onclick={() => currentPage++}
        disabled={currentPage >= totalPages - 1}
        class="px-3 py-1 rounded-lg bg-slate-700/50 border border-slate-600 hover:border-amber-300/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
    >→</button>
</div>
{/if}

{#if loadingKanji}
    <p class="text-slate-400 mt-6">Loading...</p>
{:else if currentKanji}
    <KanjiCard data={currentKanji} />
    <KanjiWords data={currentKanji} />
{/if}