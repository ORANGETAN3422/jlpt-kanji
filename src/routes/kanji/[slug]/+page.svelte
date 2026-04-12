<script lang="ts">
    import KanjiCard from "$lib/components/KanjiCard.svelte";

	import type { jlptKanjiResponse, kanjiInfo } from "$lib/types";
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

    const CARD_WIDTH = 52;
    const TARGET_ROWS = 8;

    const pageSize = $derived(Math.max(1, Math.floor((containerWidth) / (CARD_WIDTH))) * TARGET_ROWS);
    const totalPages = $derived(Math.ceil(data.kanji.length / pageSize));
    const visibleKanji = $derived(data.kanji.slice(currentPage * pageSize, (currentPage + 1) * pageSize));

    $effect.root(() => {
        const initial = page.url.searchParams.get('kanji');
        if (initial) getInfo(initial, false);
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
            if (updateUrl) replaceState(resolve(`/kanji/${data.slug}?kanji=${kanji}`), {});
        } catch (e) {
            console.error(e);
        }
    }
</script>

<h1 class="text-amber-300/80 text-2xl font-semibold tracking-widest uppercase mb-6">
    {data.slug.slice(0, 4).toUpperCase() + " N" + data.slug.slice(data.slug.length - 1)} Kanji
</h1>

<div class="flex flex-col md:flex-row md:items-start gap-6">
    <div class="flex-1 min-w-0">
        <div class="flex flex-wrap gap-2" bind:clientWidth={containerWidth}>
        {#each visibleKanji as k: string (k)}
            <button
                onclick={() => getInfo(k)}
                class="japanese rounded-lg bg-slate-700/50 text-white border border-amber-600/60 px-2.5 py-2.5 text-xl hover:border-amber-300/90 hover:shadow-[0_0_8px_rgba(252,191,73,0.2)] transition-all cursor-default"
                class:border-amber-300={selectedKanji === k}
                class:bg-amber-600!={selectedKanji === k}
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
    </div>

    {#if loadingKanji}
        <p class="text-slate-400 md:w-72 shrink-0">Loading...</p>
    {:else if currentKanji}
        <div class="md:w-96 shrink-0 md:sticky md:top-6">
            <KanjiCard data={currentKanji} />
        </div>
    {/if}
</div>