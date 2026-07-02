export const VISIBILITY = {
    PUBLIC: 'public',
    INTERNAL: 'internal',
};

export const VISIBILITY_LABELS = {
    [VISIBILITY.PUBLIC]: 'Công khai',
    [VISIBILITY.INTERNAL]: 'Nội bộ',
};

export const VISIBILITY_COLORS = {
    [VISIBILITY.PUBLIC]: 'green',
    [VISIBILITY.INTERNAL]: 'orange',
};

export const VISIBILITY_OPTIONS = [
    { value: VISIBILITY.PUBLIC, label: VISIBILITY_LABELS[VISIBILITY.PUBLIC] },
    { value: VISIBILITY.INTERNAL, label: VISIBILITY_LABELS[VISIBILITY.INTERNAL] },
];

export const DEFAULT_VISIBILITY = VISIBILITY.INTERNAL;
