// User override: large food farm construction is five minutes before VIP reduction.
export const constructionSeconds=info=>info?.id===17?300:info?.build_time??0;
